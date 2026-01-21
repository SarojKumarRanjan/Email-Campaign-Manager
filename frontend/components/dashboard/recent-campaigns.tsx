"use client"

import { IconEye, IconClick, IconMail, IconCircleCheckFilled, IconClock, IconPlayerPause } from "@tabler/icons-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { RecentCampaign } from "./types"

interface RecentCampaignsProps {
  campaigns?: RecentCampaign[]
  isLoading?: boolean
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "sent":
    case "completed":
      return (
        <Badge variant="outline" className="text-green-600">
          <IconCircleCheckFilled className="size-3 fill-green-500" />
          {status}
        </Badge>
      )
    case "sending":
    case "active":
      return (
        <Badge variant="outline" className="text-blue-600">
          <IconMail className="size-3" />
          {status}
        </Badge>
      )
    case "scheduled":
      return (
        <Badge variant="outline" className="text-orange-600">
          <IconClock className="size-3" />
          {status}
        </Badge>
      )
    case "paused":
      return (
        <Badge variant="outline" className="text-yellow-600">
          <IconPlayerPause className="size-3" />
          {status}
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {status}
        </Badge>
      )
  }
}

export function RecentCampaigns({ campaigns, isLoading }: RecentCampaignsProps) {
  if (isLoading) {
    return (
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest email campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Generate sample data if no data provided
  const data = campaigns && campaigns.length > 0 ? campaigns : generateSampleCampaigns()

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest email campaigns and their performance</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/campaigns">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sent</TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-1">
                  <IconEye className="size-3" /> Opens
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-1">
                  <IconClick className="size-3" /> Clicks
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <Link 
                    href={`/campaigns/${campaign.id}`}
                    className="font-medium hover:underline"
                  >
                    {campaign.name}
                  </Link>
                  <div className="text-muted-foreground text-sm truncate max-w-[200px]">
                    {campaign.subject}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {campaign.sent_count.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <span className="tabular-nums">{campaign.open_rate.toFixed(1)}%</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="tabular-nums">{campaign.click_rate.toFixed(1)}%</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Generate sample campaigns for demo
function generateSampleCampaigns(): RecentCampaign[] {
  return [
    {
      id: 1,
      name: "January Newsletter",
      subject: "Welcome to the New Year! 🎉",
      status: "Sent",
      sent_count: 12450,
      delivered_count: 12200,
      opened_count: 3050,
      clicked_count: 610,
      open_rate: 24.5,
      click_rate: 4.9,
      created_at: "2026-01-15T10:00:00Z",
      sent_at: "2026-01-15T14:00:00Z",
    },
    {
      id: 2,
      name: "Product Launch",
      subject: "Introducing Our New Feature",
      status: "Sending",
      sent_count: 8200,
      delivered_count: 8100,
      opened_count: 1620,
      clicked_count: 405,
      open_rate: 19.8,
      click_rate: 5.0,
      created_at: "2026-01-16T09:00:00Z",
    },
    {
      id: 3,
      name: "Weekly Digest",
      subject: "Your Weekly Update",
      status: "Scheduled",
      sent_count: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      open_rate: 0,
      click_rate: 0,
      created_at: "2026-01-17T08:00:00Z",
    },
    {
      id: 4,
      name: "Holiday Promo",
      subject: "Special Holiday Offer Inside",
      status: "Completed",
      sent_count: 15600,
      delivered_count: 15200,
      opened_count: 4560,
      clicked_count: 912,
      open_rate: 29.3,
      click_rate: 5.9,
      created_at: "2026-01-10T11:00:00Z",
      sent_at: "2026-01-10T15:00:00Z",
    },
    {
      id: 5,
      name: "Re-engagement Campaign",
      subject: "We Miss You!",
      status: "Paused",
      sent_count: 3200,
      delivered_count: 3100,
      opened_count: 310,
      clicked_count: 31,
      open_rate: 9.7,
      click_rate: 1.0,
      created_at: "2026-01-12T14:00:00Z",
    },
  ]
}
