"use client"

import * as React from "react"
import {
  AudioWaveform,
  Command,
  SquareUser,
  GalleryVerticalEnd,
  ChartColumnStacked,
  LayoutDashboard,
  Settings2,
  ListChevronsDownUp,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
//import { NavProjects } from "@/components/layout/nav-projects"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
      ],
    },
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: ChartColumnStacked,
      isActive: false,
      items: [
      ],
    },
    {
      title: "Contacts",
      url: "/contacts",
      icon: SquareUser,
      items: [
      ],
    },
    {
      title: "Lists",
      url: "/lists",
      icon: ListChevronsDownUp,
      items: [
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [

      ],
    },
  ],
  /*   projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: Frame,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: PieChart,
      },
      {
        name: "Travel",
        url: "#",
        icon: Map,
      },
    ], */
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
