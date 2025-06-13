
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Clipboard,
  FileText,
  CalendarDays,
  GraduationCap,
  Sparkles,
  BookOpen,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const mainNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, requiredRole: undefined },
  { href: "/student-data", label: "Student Data", icon: Clipboard, requiredRole: "mahasiswa" },
  { href: "/krs", label: "KRS Submission", icon: FileText, requiredRole: "mahasiswa" },
  { href: "/schedule", label: "Schedule", icon: CalendarDays, requiredRole: undefined },
  { href: "/khs", label: "KHS", icon: GraduationCap, requiredRole: "mahasiswa" },
  {
    href: "/course-recommendations",
    label: "Course AI",
    icon: Sparkles,
    requiredRole: "mahasiswa"
  },
];

const adminNavItems = [
    // Future admin links can go here e.g.
    // { href: "/admin/users", label: "User Management", icon: Users, requiredRole: "admin" },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { user, initialLoading } = useAuth(); // Removed logoutUser and authLoading as they are not used here anymore

  const renderNavItem = (item: typeof mainNavItems[0]) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
        className={cn(
          "w-full justify-start",
          (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
        tooltip={item.label}
      >
        <Link href={item.href}>
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
  
  const filteredMainNavs = mainNavItems.filter(item => {
    if (!item.requiredRole) return true; 
    if (!user) return false; 
    if (user.role === 'admin') return true; 
    if (user.role === 'dosen') {
        return item.href === "/" || item.href === "/schedule";
    }
    return user.role === item.requiredRole;
  });

  const filteredAdminNavs = adminNavItems.filter(item => user && user.role === 'admin');


  if (initialLoading) {
    return (
      <SidebarMenu>
        {[...Array(5)].map((_, i) => (
          <SidebarMenuItem key={i}>
             <Skeleton className="h-8 w-full rounded-md my-1 px-2" />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {filteredMainNavs.map(renderNavItem)}

      {user && user.role === 'admin' && filteredAdminNavs.length > 0 && (
        <>
          <SidebarSeparator className="my-2" />
           <SidebarMenuItem>
            <div className="px-3 py-1 text-xs font-semibold text-sidebar-foreground/70 tracking-wider">ADMIN</div>
          </SidebarMenuItem>
          {filteredAdminNavs.map(renderNavItem)}
        </>
      )}

      {/* Logout button removed from here as it's in the avatar dropdown */}
      {/* 
      <SidebarSeparator className="my-2" />
      {user && (
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={logoutUser}
            disabled={authLoading}
            className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            tooltip="Logout"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      */}
    </SidebarMenu>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <BookOpen className="h-7 w-7 text-sidebar-primary" />
      <span className="text-xl font-semibold text-sidebar-foreground font-headline">EduCentral</span>
    </div>
  );
}

export function FullSidebar() {
  return (
    <>
      <div data-sidebar="header" className="flex h-16 items-center border-b border-sidebar-border px-2">
         <Logo />
      </div>
      <div data-sidebar="content" className="flex-1 overflow-y-auto py-2">
        <SidebarNav />
      </div>
    </>
  );
}
