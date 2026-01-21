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
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            top: '0%',
            left: 'center',
            
        },
    series: [
      {
        name: "Contacts",
        type: "pie",
        radius: '70%',
        labelLine: {
            show: true,
            smooth: true,
            
        },
        center: ['50%', '55%'],
        itemStyle: {
            borderRadius: 4,
            borderWidth: 1
        },
        label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c} ({d}%)'
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
