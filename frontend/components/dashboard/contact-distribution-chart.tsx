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
import { DashboardStats } from "./types"

interface ContactDistributionChartProps {
  stats?: DashboardStats
  isLoading?: boolean
}

export function ContactDistributionChart({ stats, isLoading }: ContactDistributionChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Breakdown</CardTitle>
          <CardDescription>Subscriber vs Unsubscribed</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const subscribed = stats?.subscribed_contacts ?? 0
  const unsubscribed = (stats?.total_contacts ?? 0) - subscribed

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      bottom: "0",
    },
    series: [
      {
        name: "Contacts",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: subscribed, name: "Subscribed", itemStyle: { color: "#10b981" } },
          { value: unsubscribed, name: "Unsubscribed", itemStyle: { color: "#f43f5e" } },
        ],
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Breakdown</CardTitle>
        <CardDescription>Visualizing your audience health</CardDescription>
      </CardHeader>
      <CardContent>
        <BaseChart option={option} height="300px" />
      </CardContent>
    </Card>
  )
}
