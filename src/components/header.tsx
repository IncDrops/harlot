"use client";

import Link from "next/link";
import { Settings, LogOut, Bell, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  const getAvatarFallback = () => {
    if (profile?.displayName) return profile.displayName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/">
            <Logo className="text-3xl" />
        </Link>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search analyses..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        {user ? (
          <>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                     <AvatarImage src={profile?.avatar || `https://avatar.iran.liara.run/public/?username=${user.email}`} alt={profile?.username || ""} />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(profile ? `/profile` : '/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/support')}>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
