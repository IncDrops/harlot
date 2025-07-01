"use client";

import Link from "next/link";
import { Settings, UserCircle2, LogOut } from "lucide-react";
import { Logo, Tagline } from "@/components/logo";
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
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { user, profile, signOut } = useAuth(); // Get profile from useAuth
  const router = useRouter();
  const { toast } = useToast();

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
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/">
          <div>
            <Logo className="text-3xl" />
            <Tagline className="text-[10px] -mt-1" />
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                     <AvatarImage src={profile?.avatar || `https://avatar.iran.liara.run/public/?username=${user.email}`} alt={profile?.username || ""} />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(profile ? `/profile/${profile.username}` : '/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>App Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/signin">
              <Button variant="ghost" className="hidden sm:flex">
                Sign In / Sign Up
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <UserCircle2 className="h-5 w-5" />
                <span className="sr-only">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
