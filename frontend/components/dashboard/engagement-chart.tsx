"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { EngagementTrendPoint } from "./types"

interface EngagementChartProps {
  data?: EngagementTrendPoint[]
  isLoading?: boolean
}

const chartConfig = {
  open_rate: {
    label: "Open Rate",
    color: "hsl(142, 76%, 36%)",
  },
  click_rate: {
    label: "Click Rate",
    color: "hsl(221, 83%, 53%)",
  },
  bounce_rate: {
    label: "Bounce Rate",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig

export function EngagementChart({ data, isLoading }: EngagementChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
          <CardDescription>Open, click, and bounce rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Generate sample data if no data provided
  const chartData = data && data.length > 0 ? data : generateSampleData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Trends</CardTitle>
        <CardDescription>Open, click, and bounce rates over the last 12 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{chartConfig[name as keyof typeof chartConfig]?.label}:</span>
                      <span className="font-medium">{Number(value).toFixed(1)}%</span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="open_rate"
              type="monotone"
              stroke="var(--color-open_rate)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="click_rate"
              type="monotone"
              stroke="var(--color-click_rate)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="bounce_rate"
              type="monotone"
              stroke="var(--color-bounce_rate)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Generate sample data for demo purposes
function generateSampleData(): EngagementTrendPoint[] {
  const data: EngagementTrendPoint[] = []
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"]
  
  weeks.forEach((week) => {
    data.push({
      period: week,
      open_rate: Math.random() * 15 + 15, // 15-30%
      click_rate: Math.random() * 5 + 2, // 2-7%
      bounce_rate: Math.random() * 3 + 1, // 1-4%
    })
  })
  
  return data
}
