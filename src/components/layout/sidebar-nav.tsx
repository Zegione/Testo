
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react"; // Import LucideIcon type
import {
  LayoutDashboard,
  Clipboard,
  FileText,
  CalendarDays,
  GraduationCap,
  Sparkles,
  BookOpen,
  Users, // Example for admin
  ShieldCheck, // Example for admin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/contexts/AuthContext"; // Ensure UserRole is exported or defined here


export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon; // Use LucideIcon type for icon
  requiredRole?: UserRole | 'admin'; // Allow string 'admin' if UserRole doesn't include it
}


export const mainNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, requiredRole: undefined },
  { href: "/student-data", label: "Student Data", icon: Clipboard, requiredRole: "mahasiswa" },
  { href: "/krs", label: "KRS Submission", icon: FileText, requiredRole: "mahasiswa" },
  { href: "/schedule", label: "Schedule", icon: CalendarDays, requiredRole: undefined }, // Visible to all logged-in users
  { href: "/khs", label: "KHS", icon: GraduationCap, requiredRole: "mahasiswa" },
  {
    href: "/course-recommendations",
    label: "Course AI",
    icon: Sparkles,
    requiredRole: "mahasiswa"
  },
];

export const adminNavItems: NavItem[] = [
    // Future admin links can go here e.g.
    // { href: "/admin/users", label: "User Management", icon: Users, requiredRole: "admin" },
    // { href: "/admin/settings", label: "System Settings", icon: ShieldCheck, requiredRole: "admin" },
];


// This component is now significantly simplified as its logic is mostly moved to AppHeader.
// It can primarily serve as a definition for nav items or be removed if items are defined directly in AppHeader.
export function SidebarNav() {
  const pathname = usePathname();
  const { user, initialLoading } = useAuth();

  // Filtering logic is now handled in AppHeader directly.
  // This component might not render anything visible by itself anymore
  // unless you have specific use cases for it.

  if (initialLoading) {
    return null; // Or a skeleton if this component were to render something itself
  }

  // The actual rendering of nav links is done in AppHeader.
  // This component's role has shifted to primarily providing the nav item definitions.
  return null; 
}

// Logo component can be kept if used elsewhere, or moved to AppHeader if only used there.
export function Logo() {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <BookOpen className="h-7 w-7 text-primary" /> {/* Updated icon and color */}
      <span className="text-xl font-semibold text-foreground font-headline">EduCentral</span> {/* Use theme colors */}
    </div>
  );
}

// FullSidebar is no longer used in the new layout.
// export function FullSidebar() { ... }
