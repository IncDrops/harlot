
"use client";

import { Header } from "@/components/header";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter, SidebarClose, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { LiveFeed } from "@/components/live-feed";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CheckSquare, MessageSquare, Settings, BarChart2 } from "lucide-react";
import { StockTicker } from "@/components/stock-ticker";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col">
        <div className="flex flex-1 overflow-hidden">
            <Sidebar collapsible="icon" className="h-full sticky top-0">
                <SidebarHeader className="flex items-center justify-between p-2">
                    <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
                        <Logo className="group-data-[collapsible=icon]:hidden" />
                    </Link>
                    <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
                    <SidebarClose className="hidden group-data-[collapsible=icon]:flex" />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                       <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/analytics">
                            <BarChart2 />
                            <span>Analytics</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                       <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/planner">
                            <CheckSquare />
                            <span>Planner</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                       <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/messages">
                            <MessageSquare />
                            <span>Messages</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                       <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link href="/settings">
                            <Settings />
                            <span>Settings</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                    <hr className="my-4 border-border" />
                    <LiveFeed />
                </SidebarContent>
                <SidebarFooter>
                    {/* Footer content can go here */}
                </SidebarFooter>
            </Sidebar>
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className={cn("flex-1 overflow-y-auto")}>
                    {children}
                </main>
                <footer className="border-t">
                    <StockTicker />
                </footer>
            </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
