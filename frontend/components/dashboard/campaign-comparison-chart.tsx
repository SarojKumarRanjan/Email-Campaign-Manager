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
          <CardTitle>Campaign Performance Breakdown</CardTitle>
          <CardDescription>Breakdown of delivery and engagement rates</CardDescription>
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
      data: ["Clicked", "Opened", "Delivered"],
      bottom: 0,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      top: "5%",
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
          rotate: 30,
          fontSize: 10
        }
      },
    ],
    yAxis: [
      {
        type: "value",
        max: 100,
        axisLabel: {
          formatter: "{value}%",
        },
      },
    ],
    series: [
      {
        name: "Delivered",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        data: comparisonData.map(c => (100 - c.open_rate).toFixed(2)),
        itemStyle: { color: "#22c55e" }
      },
      {
        name: "Opened",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        data: comparisonData.map(c => (c.open_rate - c.click_rate).toFixed(2)),
        itemStyle: { color: "#eab308" }
      },
      {
        name: "Clicked",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        data: comparisonData.map(c => c.click_rate.toFixed(2)),
        itemStyle: { 
          color: "#a855f7",
          borderRadius: [4, 4, 0, 0]
        }
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Breakdown</CardTitle>
        <CardDescription>Comparison of delivery and engagement across campaigns</CardDescription>
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
