import type { ComponentProps, ReactNode } from 'react'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { calculateTrendLine } from '../lib/calculateTrend'
import { getLastQueueArray } from '../lib/getLastQueueArray'
import { ProgressData } from '../model/types'
import { ProgressEmptyState } from './ProgressEmptyState'
import { cn } from '@/shared/lib/cn'
import { getProgressPath } from '@/shared/lib/routePaths'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/Card'
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

type ProgressChartProps = {
  data: ProgressData[]
  rightSlot?: ReactNode
  description?: ReactNode
  chartContainerClassName?: ComponentProps<typeof ChartContainer>['className']
}

export const ProgressChart = ({
  data,
  rightSlot,
  chartContainerClassName,
  description,
}: ProgressChartProps) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isLocationProgress = pathname === getProgressPath()

  const chartData = useMemo(() => {
    const currentStreak = getLastQueueArray(data)
    const trendLine = calculateTrendLine(currentStreak)
    const trendMap = new Map(trendLine.map((t) => [t.created_at, t.trendValue]))
    return data.map((item) => ({
      ...item,
      trendValue: trendMap.get(item.created_at) || undefined,
    }))
  }, [data])

  if (data.length === 0) {
    return (
      <ProgressEmptyState rightSlot={rightSlot} description={description} />
    )
  }

  return (
    <Card>
      <CardHeader
        className={cn('flex justify-between flex-row items-start', {
          'cursor-pointer': !isLocationProgress,
        })}
        onClick={() => {
          if (!isLocationProgress) navigate(getProgressPath())
        }}
      >
        <div className="space-y-1.5">
          <CardTitle>Progress</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>

        {rightSlot}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className={chartContainerClassName}
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 4,
              left: -24,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <XAxis
              dataKey="created_at"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillProgress" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-trendValue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-trendValue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="trendValue"
              type="natural"
              fill="url(#fillTrend)"
              fillOpacity={0}
              stroke="var(--color-trendValue)"
              strokeWidth={1}
              animationDuration={600}
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillProgress)"
              fillOpacity={0.4}
              stroke="var(--color-value)"
              strokeWidth={2}
              animationDuration={600}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
