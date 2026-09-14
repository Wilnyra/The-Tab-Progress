import { useCallback, useState } from 'react'
import {
  formatCellCount,
  TerritoryMapProvider,
  useTerritoryMapContext,
} from '@/entities/map'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs'
import { ProgressMap } from '@/widgets/progress/ProgressMap'
import { ProgressDaysContent } from '@/widgets/progress/ProgressTable'

const STORAGE_KEY = 'progress:history-tab'
const TAB_DAYS = 'days'
const TAB_MAP = 'map'

const TAB_COPY: Readonly<Record<string, { title: string; note: string }>> = {
  [TAB_DAYS]: {
    title: 'Days',
    note: 'Daily progress and activity for the last 30 days',
  },
  [TAB_MAP]: {
    title: 'Map',
    note: 'Every full hour of progress in a day earns one cell',
  },
}

const readStoredTab = (): string => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored === TAB_MAP ? TAB_MAP : TAB_DAYS
  } catch {
    return TAB_DAYS
  }
}

const storeTab = (value: string): void => {
  try {
    sessionStorage.setItem(STORAGE_KEY, value)
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Could not persist the progress tab:', error)
    }
  }
}

const MapTabTrigger = (): JSX.Element => {
  const { state } = useTerritoryMapContext()
  // Derived from the state, not from `isLoading`: a background refetch keeps
  // the last state, so the badge must not blink away while it runs.
  const available = state === null ? 0 : state.credits.available

  return (
    <TabsTrigger
      value={TAB_MAP}
      className="min-h-11 gap-1.5 px-4 sm:min-h-8"
      aria-label={
        available >= 1 ? `Map, ${formatCellCount(available)} available` : 'Map'
      }
    >
      Map
      {available >= 1 ? (
        <span
          aria-hidden="true"
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-chart-2 px-1.5 text-[11px] font-semibold tabular-nums text-white"
        >
          {available}
        </span>
      ) : null}
    </TabsTrigger>
  )
}

export const ProgressHistoryCard = (): JSX.Element => {
  const [tab, setTab] = useState<string>(readStoredTab)

  const handleTabChange = useCallback((value: string): void => {
    setTab(value)
    storeTab(value)
  }, [])

  const handleOpenMap = useCallback((): void => {
    handleTabChange(TAB_MAP)
  }, [handleTabChange])

  const copy = TAB_COPY[tab] ?? TAB_COPY[TAB_DAYS]

  return (
    <TerritoryMapProvider
      isMapVisible={tab === TAB_MAP}
      onOpenMap={handleOpenMap}
    >
      <Card variant="section">
        <Tabs value={tab} onValueChange={handleTabChange}>
          <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>{copy.title}</CardTitle>
              <CardDescription>{copy.note}</CardDescription>
            </div>
            <TabsList
              aria-label="Progress view"
              className="grid h-auto w-full grid-cols-2 p-0.5 sm:inline-grid sm:w-auto"
            >
              <TabsTrigger
                value={TAB_DAYS}
                className="min-h-11 px-4 sm:min-h-8"
              >
                Days
              </TabsTrigger>
              <MapTabTrigger />
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value={TAB_DAYS} className="mt-0">
              <ProgressDaysContent />
            </TabsContent>
            <TabsContent value={TAB_MAP} className="mt-0">
              <ProgressMap />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </TerritoryMapProvider>
  )
}
