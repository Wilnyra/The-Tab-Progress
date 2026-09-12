import { Clock } from 'lucide-react'
import type { FocusEvent, KeyboardEvent } from 'react'
import { useFormContext } from 'react-hook-form'
import type { AddProgressFormSchema } from '../model/addProgressFormSchema'
import { useRecentDescriptions } from '@/entities/progress'
import { FormInput, FormTextarea } from '@/shared/ui/Form'

const RECENT_LIMIT = 3
const RECENT_LABEL_MAX = 32
const MAX_HOURS = 12
const MAX_MINUTES = 59

const truncate = (text: string, max = RECENT_LABEL_MAX): string =>
  text.length <= max ? text : `${text.slice(0, max - 1)}…`

const selectOnFocus = (e: FocusEvent<HTMLInputElement>): void => {
  e.target.select()
}

const clampToRange =
  (max: number) =>
  (raw: string): number | '' => {
    const digits = raw.replace(/\D/g, '')
    if (digits === '') return ''
    return Math.min(parseInt(digits, 10), max)
  }

const clampHours = clampToRange(MAX_HOURS)
const clampMinutes = clampToRange(MAX_MINUTES)

const isPlainEnter = (e: KeyboardEvent<HTMLInputElement>): boolean =>
  e.key === 'Enter' && !e.nativeEvent.isComposing

type ProgressEntryFieldsProps = {
  autoFocus?: boolean
}

export const ProgressEntryFields = ({
  autoFocus = false,
}: ProgressEntryFieldsProps): JSX.Element => {
  const { setFocus, setValue } = useFormContext<AddProgressFormSchema>()
  const recents = useRecentDescriptions(RECENT_LIMIT)

  const handleHoursKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (!isPlainEnter(e)) return
    e.preventDefault()
    setFocus('minutes')
  }

  const handleMinutesKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (!isPlainEnter(e)) return
    e.preventDefault()
    setFocus('comment')
  }

  const handleRecentPick = (value: string): void => {
    setValue('comment', value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <FormInput
          name="hours"
          label="Hours (0–12)"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          autoFocus={autoFocus}
          enterKeyHint="next"
          autoComplete="off"
          onFocus={selectOnFocus}
          onKeyDown={handleHoursKeyDown}
          transform={clampHours}
        />
        <FormInput
          name="minutes"
          label="Minutes (0–59)"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          enterKeyHint="next"
          autoComplete="off"
          onFocus={selectOnFocus}
          onKeyDown={handleMinutesKeyDown}
          transform={clampMinutes}
        />
      </div>
      <p className="text-xs text-muted-foreground">Up to 12h</p>

      <FormTextarea
        name="comment"
        label="Note (optional)"
        placeholder="What did you work on?"
        rows={2}
        maxLength={200}
        autoComplete="off"
      />

      {recents.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Recent
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-1.5">
            {recents.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRecentPick(value)}
                aria-label={`Use recent note: ${value}`}
                className="inline-flex items-center gap-1.5 h-10 sm:h-7 max-w-full px-2.5 rounded-md text-xs border border-border bg-background text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <Clock className="h-3 w-3 shrink-0" />
                <span className="truncate">{truncate(value)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
