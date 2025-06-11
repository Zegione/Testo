
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student-data", label: "Student Data", icon: Clipboard },
  { href: "/krs", label: "KRS Submission", icon: FileText },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/khs", label: "KHS", icon: GraduationCap },
  {
    href: "/course-recommendations",
    label: "Course AI",
    icon: Sparkles,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
      ))}
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
