import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="sidebar" />
                <SidebarInset >
                    <SiteHeader />
                    <ScrollArea className="h-[calc(100svh-var(--header-height))]">
                        {children}
                    </ScrollArea>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    )
}

//className="max-h-[calc(100svh-2.25svh)] overflow-hidden"