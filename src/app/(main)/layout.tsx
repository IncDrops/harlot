
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
      <div className="flex">
        <Sidebar collapsible="icon" className="h-screen sticky top-0">
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
        <div className="flex-1 flex flex-col">
             <Header />
             <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
