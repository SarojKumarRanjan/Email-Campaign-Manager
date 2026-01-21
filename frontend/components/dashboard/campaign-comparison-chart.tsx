"use client"

import React from "react"
import { EChartsOption } from "echarts-for-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BaseChart } from "@/components/common/base-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { CampaignComparison } from "./types"

interface CampaignComparisonChartProps {
  data?: CampaignComparison[]
  isLoading?: boolean
}

export function CampaignComparisonChart({ data, isLoading }: CampaignComparisonChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Comparing rates across top campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const comparisonData = data && data.length > 0 ? data : generateSampleData()

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["Open Rate", "Click Rate", "Bounce Rate"],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "10%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: comparisonData.map(c => c.name),
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          formatter: "{value}%",
        },
      },
    ],
    series: [
      {
        name: "Open Rate",
        type: "bar",
        barWidth: "20%",
        data: comparisonData.map(c => c.open_rate),
        itemStyle: { color: "#10b981" }
      },
      {
        name: "Click Rate",
        type: "bar",
        barWidth: "20%",
        data: comparisonData.map(c => c.click_rate),
        itemStyle: { color: "#3b82f6" }
      },
      {
        name: "Bounce Rate",
        type: "bar",
        barWidth: "20%",
        data: comparisonData.map(c => c.bounce_rate),
        itemStyle: { color: "#f43f5e" }
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
        <CardDescription>Comparison of rates across your latest campaigns</CardDescription>
      </CardHeader>
      <CardContent>
        <BaseChart option={option} height="300px" />
      </CardContent>
    </Card>
  )
}

function generateSampleData(): CampaignComparison[] {
  return [
    { id: 1, name: "Jan News", open_rate: 24.5, click_rate: 4.9, bounce_rate: 1.2 },
    { id: 2, name: "Product Launch", open_rate: 19.8, click_rate: 5.0, bounce_rate: 0.8 },
    { id: 3, name: "Holiday Promo", open_rate: 29.3, click_rate: 5.9, bounce_rate: 2.1 },
    { id: 4, name: "Re-engage", open_rate: 9.7, click_rate: 1.0, bounce_rate: 3.5 },
    { id: 5, name: "Weekly Dig", open_rate: 22.1, click_rate: 3.2, bounce_rate: 1.0 },
  ]
}
