-- Territory map: claim any land/hard cell (adjacency rule removed). Idempotent.

BEGIN;

CREATE OR REPLACE FUNCTION public.map_claim(p_tz text, p_x int, p_y int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid      uuid;
  v_profile  public.map_profiles%ROWTYPE;
  v_char     text;
  v_cost     smallint;
  v_last     text;
  v_kind     text;
  v_credits  record;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  PERFORM public.map_check_tz(p_tz);
  PERFORM pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));

  SELECT * INTO v_profile FROM public.map_profiles WHERE user_id = v_uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'terrain required';
  END IF;

  PERFORM public.map_apply_decay(v_uid, p_tz);

  IF p_x IS NULL OR p_y IS NULL OR p_x < 0 OR p_y < 0
     OR p_x >= v_profile.width OR p_y >= v_profile.height THEN
    RAISE EXCEPTION 'out of bounds';
  END IF;

  v_char := substr(v_profile.terrain, p_y * v_profile.width + p_x + 1, 1);
  IF v_char = 'w' THEN
    RAISE EXCEPTION 'water';
  END IF;
  v_cost := CASE WHEN v_char = 'h' THEN 3 ELSE 1 END;

  SELECT e.kind INTO v_last
  FROM public.map_events e
  WHERE e.user_id = v_uid AND e.x = p_x AND e.y = p_y
  ORDER BY e.created_at DESC, e.id DESC
  LIMIT 1;

  IF v_last = 'lose' THEN
    v_kind := 'restore';
  ELSIF v_last IN ('claim', 'restore') THEN
    RAISE EXCEPTION 'already owned';
  ELSE
    v_kind := 'claim';
  END IF;

  SELECT * INTO v_credits FROM public.map_credits(v_uid, p_tz, v_profile.started_at);
  IF v_credits.earned - v_credits.spent < v_cost THEN
    RAISE EXCEPTION 'not enough cells';
  END IF;

  INSERT INTO public.map_events (user_id, x, y, kind, cost)
  VALUES (v_uid, p_x, p_y, v_kind, v_cost);

  RETURN public.map_state(v_uid, p_tz);
END;
$$;

REVOKE ALL ON FUNCTION public.map_claim(text, int, int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.map_claim(text, int, int) TO authenticated;

COMMIT;
