import type { ComponentProps, ReactNode } from 'react'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { calculateTrendLine } from '../lib/calculateTrend'
import { getLastQueueArray } from '../lib/getLastQueueArray'
import type { ProgressData } from '../model/types'
import { ProgressChartSkeleton } from './ProgressChartSkeleton'
import { ProgressEmptyState } from './ProgressEmptyState'
import { ProgressHeader } from './ProgressHeader'
import { formatMinutesToHm } from '@/shared/lib/formatMinutesToHm'
import { getProgressPath } from '@/shared/lib/routePaths'
import { Card, CardContent } from '@/shared/ui/Card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/ui/Chart'

const chartConfig = {
  value: {
    label: 'Progress',
    color: 'hsl(var(--chart-2))',
  },
  trendValue: {
    label: 'Trend',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const CHART_MARGIN = { top: 4, left: 0, right: 12 } as const
const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0]
const MAX_BAR_SIZE = 32

const formatAxisDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

const formatTooltipDate = (value: unknown): string =>
  new Date(String(value)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

type ProgressChartProps = {
  data: ProgressData[]
  rightSlot?: ReactNode
  toolbar?: ReactNode
  description?: ReactNode
  chartContainerClassName?: ComponentProps<typeof ChartContainer>['className']
  isLoading?: boolean
}

export const ProgressChart = ({
  data,
  rightSlot,
  toolbar,
  chartContainerClassName,
  description,
  isLoading = false,
}: ProgressChartProps) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isLocationProgress = pathname === getProgressPath()

  const chartData = useMemo(() => {
    const activeDays = data.filter((item) => item.duration_seconds > 0)
    const trendLine = calculateTrendLine(getLastQueueArray(activeDays))
    const trendMap = new Map(trendLine.map((t) => [t.created_at, t.trendValue]))
    return data.map((item) => ({
      ...item,
      trendValue: trendMap.get(item.created_at) || undefined,
    }))
  }, [data])

  const hasProgress = data.some((item) => item.duration_seconds > 0)

  const handleHeaderClick = (): void => {
    navigate(getProgressPath())
  }

  if (isLoading) {
    return (
      <ProgressChartSkeleton
        rightSlot={rightSlot}
        toolbar={toolbar}
        description={description}
        chartContainerClassName={chartContainerClassName}
      />
    )
  }

  if (!hasProgress) {
    return (
      <ProgressEmptyState
        rightSlot={rightSlot}
        toolbar={toolbar}
        description={description}
      />
    )
  }

  return (
    <Card variant="section" className="min-h-[320px]">
      <ProgressHeader
        description={description}
        rightSlot={rightSlot}
        toolbar={toolbar}
        onClick={isLocationProgress ? undefined : handleHeaderClick}
      />
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={chartContainerClassName}
        >
          <ComposedChart
            accessibilityLayer
            data={chartData}
            margin={CHART_MARGIN}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => formatMinutesToHm(value)}
            />
            <XAxis
              dataKey="created_at"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatAxisDate}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={formatTooltipDate}
                  valueFormatter={formatMinutesToHm}
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={BAR_RADIUS}
              maxBarSize={MAX_BAR_SIZE}
              animationDuration={600}
            />
            <Line
              dataKey="trendValue"
              type="monotone"
              stroke="var(--color-trendValue)"
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              animationDuration={600}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
