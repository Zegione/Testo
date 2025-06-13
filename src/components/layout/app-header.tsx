
"use client";

import Link from "next/link";
import { usePathname, useRouter }
from "next/navigation";
import React, { useState, useEffect } from "react"; // Added useEffect
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  BookOpen,
  LayoutDashboard,
  Clipboard,
  FileText,
  CalendarDays,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { mainNavItems, adminNavItems, NavItem } from "./sidebar-nav"; 

// Helper function to extract page title from pathname or use a default
const getPageTitle = (pathname: string, navItems: NavItem[], adminNavs: NavItem[], userRole?: string): string => {
  const allNavs = [...navItems, ...adminNavs].filter(Boolean); // Ensure no undefined items
  
  // Exact match for homepage first
  if (pathname === "/" || pathname === "/(app)") {
    const dashboardItem = allNavs.find(item => item.href === "/");
    return dashboardItem ? dashboardItem.label : "Dashboard";
  }

  // Find the most specific matching path
  let longestMatch = "";
  let title = "EduCentral";

  for (const item of allNavs) {
    if (item.href !== "/" && pathname.startsWith(item.href)) {
      if (item.href.length > longestMatch.length) {
        longestMatch = item.href;
        title = item.label;
      }
    }
  }
  
  if (longestMatch) return title;

  // Fallback titles for common pages not in nav or dynamic ones
  if (pathname.startsWith("/(app)/course-recommendations") || pathname.startsWith("/course-recommendations")) return "AI Course Recommendations";
  
  // Default or derive from path if no match found
  const pathParts = pathname.split('/').filter(Boolean);
  const lastPart = pathParts.length > 1 ? pathParts[pathParts.length -1] : (pathParts[0] || "App"); // Avoid using '(app)'
  
  return lastPart !== "(app)" ? lastPart.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "EduCentral";
};


export function AppHeader() { // Removed initialPageTitle prop
  const { user, logoutUser, loading: authLoading, initialLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();


  const filteredMainNavs = mainNavItems.filter(item => {
    if (!item.requiredRole) return true;
    if (!user) return false; // Should not happen if layout protects routes
    if (user.role === 'admin') return true; // Admin sees all main navs
    if (user.role === 'dosen') { // Dosen sees dashboard and schedule
        return item.href === "/" || item.href === "/schedule";
    }
    // Mahasiswa sees items matching 'mahasiswa' role or undefined role
    return user.role === item.requiredRole || item.requiredRole === undefined;
  });

  const filteredAdminNavs = adminNavItems.filter(item => user && user.role === 'admin');
  const allUserNavItems = [...filteredMainNavs, ...filteredAdminNavs];

  const pageTitle = getPageTitle(pathname, filteredMainNavs, filteredAdminNavs, user?.role);


  const getInitials = (email?: string | null) => {
    if (!email) return "??";
    const parts = email.split("@")[0].split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + (parts[1][0] || parts[0][1] || "")).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const capitalizeFirstLetter = (string?: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const NavLink = ({ href, children, itemIcon: Icon, isSheetLink = false }: { href: string; children: React.ReactNode, itemIcon: React.ElementType, isSheetLink?: boolean }) => (
    <Link
      href={href}
      onClick={() => { if (isSheetLink) setMobileMenuOpen(false); }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        (pathname === href || (href !== "/" && pathname.startsWith(item.href || href))) && "text-primary bg-muted",
        !isSheetLink && "px-2 py-1 text-sm transition-colors hover:text-foreground", // Desktop specific
        !isSheetLink && (pathname === href || (href !== "/" && pathname.startsWith(item.href || href))) ? "text-foreground font-medium" : !isSheetLink && "text-muted-foreground" // Desktop active/inactive
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
  
  const UserProfileDropdownItems = () => (
    <>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{user?.email}</p>
          {user?.role && (
            <p className="text-xs leading-none text-muted-foreground">
              Role: {capitalizeFirstLetter(user.role)}
            </p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="cursor-pointer">
        <Bell className="mr-2 h-4 w-4" />
        <span>Notifications</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer">
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={logoutUser} disabled={authLoading} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </>
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden mr-3">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                <BookOpen className="h-6 w-6 text-primary" />
                <span>EduCentral</span>
              </Link>
            </div>
            <nav className="flex-1 grid gap-2 p-4 text-sm font-medium">
              {allUserNavItems.map((item) => (
                <NavLink key={item.href} href={item.href} itemIcon={item.icon} isSheetLink={true}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto border-t p-4">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start items-center gap-2">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || `https://placehold.co/100x100.png?text=${getInitials(user?.email)}`} alt="User Avatar" data-ai-hint="person" />
                            <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                            {user?.role && <span className="text-xs text-muted-foreground">{capitalizeFirstLetter(user.role)}</span>}
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={10} className="w-56 mb-2">
                    <UserProfileDropdownItems />
                </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">EduCentral</span>
        </Link>
      </div>

      <nav className="hidden flex-col gap-1 text-lg font-medium md:flex md:flex-row md:items-center md:mx-auto md:gap-3 lg:gap-4">
        {allUserNavItems.map((item) => (
          <NavLink key={item.href} href={item.href} itemIcon={item.icon}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4 ml-auto">
         <h1 className="text-lg font-semibold md:text-xl hidden lg:block mr-4 whitespace-nowrap">{pageTitle}</h1>
        {initialLoading ? (
            <Avatar className="h-9 w-9">
                 <AvatarFallback>?</AvatarFallback>
            </Avatar>
        ): user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png?text=${getInitials(user.email)}`} alt="User Avatar" data-ai-hint="person"/>
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <UserProfileDropdownItems />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}

// Hook to allow pages to suggest a title, though AppHeader's getPageTitle is primary
export function usePageTitle(title: string) {
  useEffect(() => {
    // This could potentially integrate with a context if more complex title management is needed
    // For now, it's a conceptual hook that pages *could* use.
    // console.log("Page suggests title:", title);
  }, [title]);
}
