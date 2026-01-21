"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { SendVolumePoint } from "./types"

interface SendVolumeChartProps {
  data?: SendVolumePoint[]
  isLoading?: boolean
}

const chartConfig = {
  sent_count: {
    label: "Emails Sent",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function SendVolumeChart({ data, isLoading }: SendVolumeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Send Volume</CardTitle>
          <CardDescription>Daily email sending activity</CardDescription>
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
        <CardTitle>Send Volume</CardTitle>
        <CardDescription>Daily email sending activity over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <defs>
              <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sent_count)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-sent_count)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="sent_count"
              type="monotone"
              fill="url(#fillSent)"
              fillOpacity={0.4}
              stroke="var(--color-sent_count)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Generate sample data for demo purposes
function generateSampleData(): SendVolumePoint[] {
  const data: SendVolumePoint[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split("T")[0],
      sent_count: Math.floor(Math.random() * 500) + 100,
    })
  }
  
  return data
}
