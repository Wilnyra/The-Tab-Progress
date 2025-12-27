import { type ReactNode, type ComponentProps } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ProgressData } from '../model/types'
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
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
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

  if (data.length === 0) return null

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
            data={data}
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
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillMobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
              animationDuration={600}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
