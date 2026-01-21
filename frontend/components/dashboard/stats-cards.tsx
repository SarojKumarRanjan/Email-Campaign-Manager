"use client"

import { IconTrendingDown, IconTrendingUp, IconMail, IconUsers, IconSend, IconChartBar } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardStats } from "./types"

interface StatsCardsProps {
  stats?: DashboardStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const totalContacts = stats?.total_contacts ?? 0
  const subscribedContacts = stats?.subscribed_contacts ?? 0
  const subscribedPercent = totalContacts > 0 ? Math.round((subscribedContacts / totalContacts) * 100) : 0

  const totalCampaigns = stats?.total_campaigns ?? 0
  const activeCampaigns = stats?.active_campaigns ?? 0

  const totalEmailsSent = stats?.total_emails_sent ?? 0
  const emailsSentToday = stats?.emails_sent_today ?? 0

  const openRate = stats?.average_open_rate ?? 0
  const clickRate = stats?.average_click_rate ?? 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Contacts Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="size-4" />
            Total Contacts
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalContacts.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {subscribedPercent}% subscribed
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {subscribedContacts.toLocaleString()} active subscribers <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Ready to receive emails
          </div>
        </CardFooter>
      </Card>

      {/* Total Campaigns Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconMail className="size-4" />
            Total Campaigns
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalCampaigns.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={activeCampaigns > 0 ? "text-green-600" : ""}>
              {activeCampaigns > 0 ? <IconTrendingUp /> : null}
              {activeCampaigns} active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {activeCampaigns > 0 ? "Campaigns running" : "No active campaigns"}
            {activeCampaigns > 0 && <IconTrendingUp className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Manage your email campaigns
          </div>
        </CardFooter>
      </Card>

      {/* Emails Sent Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconSend className="size-4" />
            Emails Sent
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalEmailsSent.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{emailsSentToday} today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats?.emails_sent_this_month?.toLocaleString() ?? 0} sent this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total emails delivered to inboxes
          </div>
        </CardFooter>
      </Card>

      {/* Engagement Rate Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconChartBar className="size-4" />
            Engagement Rate
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {openRate.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className={openRate >= 20 ? "text-green-600" : openRate < 10 ? "text-red-600" : ""}>
              {openRate >= 20 ? <IconTrendingUp /> : <IconTrendingDown />}
              {clickRate.toFixed(1)}% CTR
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {openRate >= 20 ? "Great open rate!" : openRate >= 10 ? "Good performance" : "Needs improvement"}
            {openRate >= 20 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Average across all campaigns
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
