"use client"

// Dashboard Stats from /api/v1/analytics/dashboard
export interface DashboardStats {
  total_campaigns: number
  active_campaigns: number
  total_contacts: number
  subscribed_contacts: number
  total_emails_sent: number
  emails_sent_today: number
  emails_sent_this_month: number
  total_delivered: number
  total_opened: number
  total_clicked: number
  average_open_rate: number
  average_click_rate: number
  average_bounce_rate: number
}

// Recent Campaign from /api/v1/dashboard/recent-campaigns
export interface RecentCampaign {
  id: number
  name: string
  subject: string
  status: string
  sent_count: number
  delivered_count: number
  opened_count: number
  clicked_count: number
  open_rate: number
  click_rate: number
  created_at: string
  sent_at?: string
}

// Activity item from /api/v1/dashboard/activity
export interface ActivityItem {
  id: string
  type: "open" | "click" | "bounce" | "subscribe" | "unsubscribe" | "sent" | "delivered"
  description: string
  contact_email?: string
  campaign_name?: string
  created_at: string
}

// Send volume data point
export interface SendVolumePoint {
  date: string
  sent_count: number
}

// Engagement trend data point
export interface EngagementTrendPoint {
  period: string
  open_rate: number
  click_rate: number
  bounce_rate: number
}

// Campaign Comparison for Bar Chart
export interface CampaignComparison {
  id: number
  name: string
  open_rate: number
  click_rate: number
  bounce_rate: number
}

// Contact Distribution for Pie Chart
export interface ContactDistribution {
  name: string
  value: number
}
