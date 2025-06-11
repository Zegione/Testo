
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function AppHeader({ pageTitle }: { pageTitle: string }) {
  const { user, initialLoading, logoutUser, loading: authLoading } = useAuth();

  const getInitials = (email?: string | null) => {
    if (!email) return "??";
    const parts = email.split("@")[0].split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-semibold md:text-2xl font-headline">{pageTitle}</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        {initialLoading ? (
          <>
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </>
        ) : user ? (
          <>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png?text=${getInitials(user.email)}`} alt="User Avatar" data-ai-hint="person" />
              <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={logoutUser} disabled={authLoading}>
              <LogOut className="mr-0 md:mr-2 h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/auth/login">
                <LogIn className="mr-0 md:mr-2 h-4 w-4" />
                <span className="hidden md:inline">Login</span>
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">
                <UserPlus className="mr-0 md:mr-2 h-4 w-4" />
                 <span className="hidden md:inline">Register</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
