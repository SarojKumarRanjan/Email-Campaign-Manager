"use client"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
  }[]
}) {
  const pathname = usePathname()

  const isActive = (item: { url: string }) => {
    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }
  return (
    <SidebarGroup>
      <SidebarGroupContent >
        <SidebarMenu className="flex flex-col gap-3">
          {
            items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  isActive={isActive(item)}
                  tooltip={item.title}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <p>{item.title}</p>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          }
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}