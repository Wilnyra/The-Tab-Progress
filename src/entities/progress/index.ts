export { analyzeProgressPrompt } from './lib/prompts'
export { calculateTrend, calculateTrendLine } from './lib/calculateTrend'
export type { TrendData, TrendLinePoint } from './lib/calculateTrend'
export { getLastQueueArray } from './lib/getLastQueueArray'
export { useEventsLast30Days } from './lib/useEventsLast30Days'
export { useEventsLast90Days } from './lib/useEventsLast90Days'
export { filterEventsToLastDays } from './lib/filterEventsToLastDays'
export { useRecentDescriptions } from './lib/useRecentDescriptions'
export { useTotalForRange, clearFrozenTotals } from './lib/useTotalForRange'
export type { TotalRangeKey } from './lib/useTotalForRange'
export { aggregateEventsToDays } from './lib/aggregateEventsToDays'
export { fillMissingDays } from './lib/fillMissingDays'
export { aggregateEventsToDayRows } from './lib/aggregateEventsToDayRows'
export { groupDayEntries } from './lib/groupDayEntries'
export type { ProgressTaskGroup } from './lib/groupDayEntries'
export type {
  ProgressDayRow,
  ProgressDayEntry,
} from './lib/aggregateEventsToDayRows'
export { selectEventsBetween } from './api/selectEventsBetween'
export { rpcProgressSumRange } from './api/rpcProgressSumRange'
export { ProgressChart } from './ui/ProgressChart'
export { ProgressEmptyState } from './ui/ProgressEmptyState'
export { ProgressHeader } from './ui/ProgressHeader'
export { ProgressHeatmap } from './ui/ProgressHeatmap'
export { useDailyTotals } from './lib/useDailyTotals'
export type { DailyTotalsRange } from './lib/useDailyTotals'
export { summarizeDailyTotals } from './lib/summarizeDailyTotals'
export type { DailyTotalsSummary } from './lib/summarizeDailyTotals'
export type { ProgressData, ProgressEvent } from './model/types'
export { insertProgress } from './api/insertProgress'
export {
  PROGRESS_START_TIMESTAMP,
  PROGRESS_DESCRIPTION,
} from './lib/constants'
export {
  ProgressContextProvider,
  progressContext,
} from './model/ProgressContext'
export { updateProgress } from './api/updateProgress'
export { deleteProgress } from './api/deleteProgress'
