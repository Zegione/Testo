"use client";

import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { FullSidebar } from "@/components/layout/sidebar-nav";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, initialLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, initialLoading, router]);

  if (initialLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:flex flex-col w-[16rem] border-r border-sidebar-border bg-sidebar p-2">
          <div className="flex h-16 items-center border-b border-sidebar-border px-2">
             <Skeleton className="h-7 w-7 mr-2 rounded-md" />
             <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <div className="flex-1 overflow-y-auto py-2 space-y-1">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
            <Skeleton className="h-7 w-7 md:hidden rounded-md" />
            <Skeleton className="h-6 w-40 rounded-md" />
            <div className="ml-auto flex items-center gap-2 md:gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    // This state will be briefly active while useEffect triggers the redirect.
    // Display a full-page loader to prevent content flash.
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <FullSidebar />
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
