
"use client";

import { Header } from "@/components/header";
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { LiveFeed } from "@/components/live-feed";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2">
                    <Logo />
                </Link>
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
