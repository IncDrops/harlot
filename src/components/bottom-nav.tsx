"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, ThumbsUp, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/create", label: "New Poll", icon: PlusSquare },
  { href: "/second-opinion", label: "2nd Opinion", icon: ThumbsUp, customIcon: true },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-10 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.customIcon && item.label === "2nd Opinion" ? (
                  <span className="relative">
                    <ThumbsUp className="h-6 w-6" />
                    <sup className="absolute -right-2 -top-1 text-xs font-bold">2</sup>
                  </span>
                ) : (
                  <item.icon className="h-6 w-6" />
                )}
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
