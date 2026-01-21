"use client"

import { getAxiosForUseFetch } from "@/lib/axios"
import API_PATH from "@/lib/apiPath"
import { useFetch } from "@/hooks/useApiCalls"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { SendVolumeChart } from "@/components/dashboard/send-volume-chart"
import { EngagementChart } from "@/components/dashboard/engagement-chart"
import { RecentCampaigns } from "@/components/dashboard/recent-campaigns"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ContactDistributionChart } from "@/components/dashboard/contact-distribution-chart"
import { CampaignComparisonChart } from "@/components/dashboard/campaign-comparison-chart"
import { 
  DashboardStats, 
  RecentCampaign, 
  ActivityItem,
  SendVolumePoint,
  EngagementTrendPoint,
  CampaignComparison
} from "@/components/dashboard/types"

export default function DashboardPage() {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useFetch<DashboardStats>(
    getAxiosForUseFetch,
    ["dashboard-stats"],
    { url: { template: API_PATH.ANALYTICS.GET_DASHBOARD_STATS } }
  )

  // Fetch recent campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useFetch<RecentCampaign[]>(
    getAxiosForUseFetch,
    ["recent-campaigns"],
    { url: { template: API_PATH.DASHBOARD.GET_RECENT_CAMPAIGNS } }
  )

  // Fetch recent activity
  const { data: activities, isLoading: activityLoading } = useFetch<ActivityItem[]>(
    getAxiosForUseFetch,
    ["recent-activity"],
    { url: { template: API_PATH.DASHBOARD.GET_RECENT_ACTIVITY } }
  )

  // Fetch send volume
  const { data: volume, isLoading: volumeLoading } = useFetch<SendVolumePoint[]>(
    getAxiosForUseFetch,
    ["send-volume"],
    { url: { template: API_PATH.ANALYTICS.GET_SEND_VOLUME } }
  )

  // Fetch engagement trends
  const { data: trends, isLoading: trendsLoading } = useFetch<EngagementTrendPoint[]>(
    getAxiosForUseFetch,
    ["engagement-trends"],
    { url: { template: API_PATH.ANALYTICS.GET_ENGAGEMENT_TRENDS } }
  )

  // Fetch campaign comparison
  const { data: comparison, isLoading: comparisonLoading } = useFetch<CampaignComparison[]>(
    getAxiosForUseFetch,
    ["campaign-comparison"],
    { url: { template: API_PATH.ANALYTICS.GET_CAMPAIGN_COMPARISON } }
  )

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Stats Cards Row */}
          <StatsCards 
            stats={stats} 
            isLoading={statsLoading} 
          />

          {/* New Charts Row (Pie & Bar) */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <ContactDistributionChart 
              stats={stats}
              isLoading={statsLoading}
            />
            <CampaignComparisonChart 
              data={comparison}
              isLoading={comparisonLoading}
            />
          </div>

          {/* Existing Charts Row */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <SendVolumeChart 
              data={volume} 
              isLoading={volumeLoading} 
            />
            <EngagementChart 
              data={trends} 
              isLoading={trendsLoading} 
            />
          </div>

          {/* Bottom Row: Recent Campaigns + Activity Feed */}
          <div className="flex flex-col gap-4 px-4 lg:flex-row lg:px-6">
            <RecentCampaigns 
              campaigns={campaigns} 
              isLoading={campaignsLoading} 
            />
            <ActivityFeed 
              activities={activities} 
              isLoading={activityLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
