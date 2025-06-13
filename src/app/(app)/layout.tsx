
"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="flex flex-col min-h-screen bg-background">
        {/* Simplified Skeleton for Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <Skeleton className="h-7 w-7 rounded-md md:hidden" /> {/* Hamburger placeholder */}
          <Skeleton className="h-6 w-24 rounded-md" /> {/* Logo placeholder */}
          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Skeleton className="h-9 w-9 rounded-full" /> {/* Avatar placeholder */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // AppHeader will now manage its own navigation structure
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader pageTitle="Dynamic Title" /> {/* pageTitle will be set by individual pages or a context */}
      <main className="flex-1 overflow-y-auto p-4 pt-6 md:p-6 md:pt-8"> {/* Added padding top */}
        {children}
      </main>
    </div>
  );
}
