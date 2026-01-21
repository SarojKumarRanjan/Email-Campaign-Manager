"use client"

import { 
  IconMail, 
  IconEye, 
  IconClick, 
  IconAlertTriangle, 
  IconUserPlus, 
  IconUserMinus,
  IconSend,
  IconCircleCheck 
} from "@tabler/icons-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ActivityItem } from "./types"

interface ActivityFeedProps {
  activities?: ActivityItem[]
  isLoading?: boolean
}

function getActivityIcon(type: string) {
  switch (type) {
    case "open":
      return <IconEye className="size-4 text-blue-500" />
    case "click":
      return <IconClick className="size-4 text-green-500" />
    case "bounce":
      return <IconAlertTriangle className="size-4 text-red-500" />
    case "subscribe":
      return <IconUserPlus className="size-4 text-emerald-500" />
    case "unsubscribe":
      return <IconUserMinus className="size-4 text-orange-500" />
    case "sent":
      return <IconSend className="size-4 text-primary" />
    case "delivered":
      return <IconCircleCheck className="size-4 text-green-500" />
    default:
      return <IconMail className="size-4 text-muted-foreground" />
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card className="w-full lg:w-80">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest email events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate sample data if no data provided
  const data = activities && activities.length > 0 ? activities : generateSampleActivities()

  return (
    <Card className="w-full lg:w-80">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest email events and updates</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[320px] px-6">
          <div className="space-y-4 pb-4">
            {data.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-tight">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Generate sample activities for demo
function generateSampleActivities(): ActivityItem[] {
  const now = new Date()
  return [
    {
      id: "1",
      type: "open",
      description: "john@example.com opened \"January Newsletter\"",
      contact_email: "john@example.com",
      campaign_name: "January Newsletter",
      created_at: new Date(now.getTime() - 5 * 60000).toISOString(),
    },
    {
      id: "2",
      type: "click",
      description: "sarah@company.com clicked a link in \"Product Launch\"",
      contact_email: "sarah@company.com",
      campaign_name: "Product Launch",
      created_at: new Date(now.getTime() - 15 * 60000).toISOString(),
    },
    {
      id: "3",
      type: "subscribe",
      description: "New subscriber: mike@startup.io",
      contact_email: "mike@startup.io",
      created_at: new Date(now.getTime() - 30 * 60000).toISOString(),
    },
    {
      id: "4",
      type: "delivered",
      description: "\"Weekly Digest\" delivered to 1,250 contacts",
      campaign_name: "Weekly Digest",
      created_at: new Date(now.getTime() - 60 * 60000).toISOString(),
    },
    {
      id: "5",
      type: "bounce",
      description: "Bounce: invalid@old-domain.com",
      contact_email: "invalid@old-domain.com",
      created_at: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
    },
    {
      id: "6",
      type: "unsubscribe",
      description: "alex@business.net unsubscribed",
      contact_email: "alex@business.net",
      created_at: new Date(now.getTime() - 3 * 60 * 60000).toISOString(),
    },
    {
      id: "7",
      type: "open",
      description: "lisa@agency.co opened \"Holiday Promo\"",
      contact_email: "lisa@agency.co",
      campaign_name: "Holiday Promo",
      created_at: new Date(now.getTime() - 5 * 60 * 60000).toISOString(),
    },
    {
      id: "8",
      type: "sent",
      description: "Campaign \"Product Launch\" started sending",
      campaign_name: "Product Launch",
      created_at: new Date(now.getTime() - 8 * 60 * 60000).toISOString(),
    },
  ]
}
