
"use client";

import { Header } from "@/components/header";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter, SidebarClose } from "@/components/ui/sidebar";
import { LiveFeed } from "@/components/live-feed";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex items-center justify-between p-2">
                <Link href="/" className="flex items-center gap-2 flex-1 min-w-0">
                    <Logo className="group-data-[collapsible=icon]:hidden" />
                </Link>
                 <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
                 <SidebarClose className="hidden group-data-[collapsible=icon]:flex" />
            </SidebarHeader>
            <SidebarContent>
                <LiveFeed />
            </SidebarContent>
            <SidebarFooter>
                {/* Footer content can go here */}
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
             <Header />
             <main className="flex-1 p-6">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
