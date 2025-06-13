
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
    if (!initialLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (user.role === 'mahasiswa' && (!user.name || !user.studentId)) {
        // If user is mahasiswa and profile (name or studentId/NIM) is not complete,
        // redirect to complete profile page.
        // Also check if they are already on the complete-profile page to avoid redirect loop.
        if (router.pathname !== '/auth/complete-profile') {
           router.push("/auth/complete-profile");
        }
      }
    }
  }, [user, initialLoading, router]);

  if (initialLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <Skeleton className="h-7 w-7 rounded-md md:hidden" /> 
          <Skeleton className="h-6 w-24 rounded-md" /> 
          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Skeleton className="h-9 w-9 rounded-full" /> 
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // If user exists but profile is incomplete, show loader while redirecting or if already on complete-profile page
  if (user && user.role === 'mahasiswa' && (!user.name || !user.studentId)) {
     // If they are navigating to complete-profile, let the complete-profile page render itself
    if (router.pathname === '/auth/complete-profile') {
        return <>{children}</>; // This case should ideally not happen if /auth/complete-profile is outside this layout.
                                // Assuming /auth/complete-profile uses AuthLayout.
    }
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">Mengarahkan untuk melengkapi profil...</p>
      </div>
    );
  }
  
  if (!user) { // This handles the case where user becomes null after initial load (e.g., during logout process)
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader /> 
      <main className="flex-1 overflow-y-auto p-4 pt-6 md:p-6 md:pt-8"> 
        {children}
      </main>
    </div>
  );
}
