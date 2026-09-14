-- Self-test for 20260913120000_territory_map.sql. Run AFTER the migration (as postgres).
-- Leaves nothing behind: the DO block always ends with RAISE EXCEPTION, which rolls back
-- the fake auth user, progress rows, map rows and the temp helpers. Read the report in the
-- error message ("SELF-TEST PASSED" / "SELF-TEST FAILED" + one line per check).
-- Auth simulation: auth.uid() reads request.jwt.claim.sub, then request.jwt.claims->>'sub';
-- both are set via set_config(.., true) and the RPCs run under SET LOCAL ROLE authenticated.

BEGIN;

CREATE FUNCTION pg_temp.map_check(p_name text, p_ok boolean) RETURNS text
LANGUAGE sql AS $f$
  SELECT CASE WHEN coalesce(p_ok, false) THEN 'ok: ' ELSE 'FAIL: ' END || p_name;
$f$;

CREATE FUNCTION pg_temp.map_expect_err(p_sql text, p_expected text) RETURNS text
LANGUAGE plpgsql AS $f$
BEGIN
  EXECUTE p_sql;
  RETURN 'FAIL: expected "' || p_expected || '", no error raised';
EXCEPTION WHEN OTHERS THEN
  IF sqlerrm = p_expected OR sqlstate = p_expected THEN
    RETURN 'ok: raises "' || p_expected || '"';
  END IF;
  RETURN 'FAIL: expected "' || p_expected || '", got "' || sqlerrm || '" (' || sqlstate || ')';
END;
$f$;

CREATE FUNCTION pg_temp.map_cell(p_state jsonb, p_x int, p_y int) RETURNS jsonb
LANGUAGE sql AS $f$
  SELECT c
  FROM jsonb_array_elements(p_state -> 'cells') AS c
  WHERE (c ->> 'x')::int = p_x AND (c ->> 'y')::int = p_y;
$f$;

DO $$
DECLARE
  v_uid     uuid := gen_random_uuid();
  v_tz      CONSTANT text := 'UTC';
  v_today   date := (now() AT TIME ZONE 'UTC')::date;
  v_terrain text := repeat('l', 1420) || repeat('h', 20) || repeat('w', 160);
  v_log     text[] := '{}';
  v_fails   int;
  v_state   jsonb;
  v_cell    jsonb;
  v_event   bigint;
  v_lose_id bigint;
  v_n       int;
BEGIN
  -- fixture: throwaway auth user + JWT claims, then act as `authenticated`
  INSERT INTO auth.users (id, aud, role, email)
  VALUES (v_uid, 'authenticated', 'authenticated', 'map-selftest-' || v_uid || '@example.invalid');
  PERFORM set_config('request.jwt.claim.sub', v_uid::text, true);
  PERFORM set_config('request.jwt.claims',
                     json_build_object('sub', v_uid, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  v_log := v_log || pg_temp.map_check('auth.uid() resolves to fake user', auth.uid() = v_uid);

  -- open: validation
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_open(%L, NULL)', 'Mars/Olympus'), 'invalid timezone');
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_open(%L, NULL)', v_tz), 'terrain required');
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_open(%L, %L)', v_tz, repeat('l', 1600)), 'invalid terrain');
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_open(%L, %L)', v_tz, repeat('l', 1599)), 'invalid terrain');

  -- open: creates profile
  v_state := public.map_open(v_tz, v_terrain);
  v_log := v_log || pg_temp.map_check('open: terrain stored',
    v_state #>> '{profile,terrain}' = v_terrain
    AND (v_state #>> '{profile,width}')::int = 40
    AND (v_state #>> '{profile,height}')::int = 40);
  v_log := v_log || pg_temp.map_check('open: decayCursor = yesterday',
    (v_state #>> '{profile,decayCursor}')::date = v_today - 1);
  v_log := v_log || pg_temp.map_check('open: 0 credits, no cells',
    (v_state #>> '{credits,earned}')::int = 0
    AND (v_state #>> '{credits,available}')::int = 0
    AND jsonb_array_length(v_state -> 'cells') = 0);
  v_log := v_log || pg_temp.map_check('open: second call ignores terrain arg',
    public.map_open(v_tz, repeat('l', 1600)) #>> '{profile,terrain}' = v_terrain);

  -- grants: no direct writes for authenticated
  v_log := v_log || pg_temp.map_expect_err(
    format('INSERT INTO public.map_events (user_id, x, y, kind, cost) VALUES (%L, 0, 0, %L, 1)',
           v_uid, 'claim'), '42501');
  v_log := v_log || pg_temp.map_expect_err(
    format('UPDATE public.map_profiles SET decay_cursor = decay_cursor WHERE user_id = %L', v_uid),
    '42501');
  v_log := v_log || pg_temp.map_expect_err('SELECT public.map_state(NULL, NULL)', '42501');

  -- credits: 3h30 + 30m today = 4 cells, minutes shown as todaySeconds
  INSERT INTO public.progress (user_id, duration_seconds, value)
  VALUES (v_uid, 3 * 3600 + 1800, 210), (v_uid, 1800, 30);
  v_state := public.map_open(v_tz);
  v_log := v_log || pg_temp.map_check('credits: earned 4 / available 4 / todaySeconds 14400',
    (v_state #>> '{credits,earned}')::int = 4
    AND (v_state #>> '{credits,spent}')::int = 0
    AND (v_state #>> '{credits,available}')::int = 4
    AND (v_state #>> '{credits,todaySeconds}')::bigint = 14400);

  -- claim: first cell anywhere, then adjacency / terrain / bounds rules
  v_state := public.map_claim(v_tz, 5, 5);
  v_cell := pg_temp.map_cell(v_state, 5, 5);
  v_log := v_log || pg_temp.map_check('claim (5,5): kind claim, cost 1, available 3',
    v_cell ->> 'kind' = 'claim' AND (v_cell ->> 'cost')::int = 1
    AND (v_state #>> '{credits,available}')::int = 3
    AND jsonb_array_length(v_state -> 'cells') = 1);
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_claim(%L, 0, 0)', v_tz), 'not adjacent');
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_claim(%L, 0, 39)', v_tz), 'water');
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_claim(%L, 40, 0)', v_tz), 'out of bounds');
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_claim(%L, 5, 5)', v_tz), 'already owned');
  v_state := public.map_claim(v_tz, 6, 5);
  v_log := v_log || pg_temp.map_check('claim (6,5) adjacent: available 2, 2 cells',
    (v_state #>> '{credits,available}')::int = 2
    AND jsonb_array_length(v_state -> 'cells') = 2);

  -- decay: pretend the map was opened and both cells claimed 6 days ago, no progress since
  EXECUTE 'RESET ROLE';
  UPDATE public.map_profiles
  SET started_at = started_at - interval '6 days', decay_cursor = decay_cursor - 6
  WHERE user_id = v_uid;
  UPDATE public.map_events
  SET created_at = created_at - interval '6 days'
  WHERE user_id = v_uid;
  EXECUTE 'SET LOCAL ROLE authenticated';

  v_state := public.map_open(v_tz);
  SELECT count(*) INTO v_n FROM jsonb_array_elements(v_state -> 'cells') AS c
  WHERE c ->> 'kind' = 'lose';
  v_log := v_log || pg_temp.map_check('decay: 6 missed days, grace 3 -> 2 cells lost', v_n = 2);
  v_log := v_log || pg_temp.map_check('decay: LIFO, (6,5) lost on day -3, (5,5) on day -2',
    ((pg_temp.map_cell(v_state, 6, 5) ->> 'createdAt')::timestamptz AT TIME ZONE 'UTC')::date
      = v_today - 3
    AND ((pg_temp.map_cell(v_state, 5, 5) ->> 'createdAt')::timestamptz AT TIME ZONE 'UTC')::date
      = v_today - 2);
  v_log := v_log || pg_temp.map_check('decay: lose costs 0, available still 2',
    (v_state #>> '{credits,spent}')::int = 2
    AND (v_state #>> '{credits,available}')::int = 2);
  v_log := v_log || pg_temp.map_check('decay: cursor moved to yesterday',
    (v_state #>> '{profile,decayCursor}')::date = v_today - 1);

  v_state := public.map_open(v_tz);
  SELECT count(*) INTO v_n FROM public.map_events WHERE kind = 'lose';
  v_log := v_log || pg_temp.map_check('decay: idempotent re-run adds nothing', v_n = 2);

  -- restore: costs original price, ignores adjacency
  v_state := public.map_claim(v_tz, 5, 5);
  v_cell := pg_temp.map_cell(v_state, 5, 5);
  v_log := v_log || pg_temp.map_check('restore (5,5): kind restore, available 1',
    v_cell ->> 'kind' = 'restore' AND (v_cell ->> 'cost')::int = 1
    AND (v_state #>> '{credits,available}')::int = 1);

  -- claim next to restored cell, then run out of credits
  v_state := public.map_claim(v_tz, 5, 6);
  v_cell := pg_temp.map_cell(v_state, 5, 6);
  v_event := (v_cell ->> 'eventId')::bigint;
  v_log := v_log || pg_temp.map_check('claim (5,6): available 0',
    (v_state #>> '{credits,available}')::int = 0);
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_claim(%L, 4, 5)', v_tz), 'not enough cells');

  -- undo
  v_state := public.map_undo(v_tz, v_event);
  v_log := v_log || pg_temp.map_check('undo claim (5,6): cell gone, available 1',
    pg_temp.map_cell(v_state, 5, 6) IS NULL
    AND (v_state #>> '{credits,available}')::int = 1);
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_undo(%L, %s)', v_tz, v_event), 'cannot undo');
  SELECT id INTO v_lose_id FROM public.map_events WHERE kind = 'lose' LIMIT 1;
  v_log := v_log || pg_temp.map_expect_err(
    format('SELECT public.map_undo(%L, %s)', v_tz, v_lose_id), 'cannot undo');

  -- report + rollback
  SELECT count(*) INTO v_fails FROM unnest(v_log) AS l WHERE l LIKE 'FAIL%';
  FOR v_n IN 1 .. array_length(v_log, 1) LOOP
    RAISE NOTICE '%', v_log[v_n];
  END LOOP;
  RAISE EXCEPTION E'%\n%',
    CASE WHEN v_fails = 0 THEN 'SELF-TEST PASSED (rolled back)'
         ELSE 'SELF-TEST FAILED: ' || v_fails || ' check(s) (rolled back)' END,
    array_to_string(v_log, E'\n');
END
$$;

ROLLBACK;
