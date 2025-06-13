
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react"; 
import {
  LayoutDashboard,
  ClipboardList, // Icon for "Daftar Nilai"
  UserCircle, // Icon for "Data"
  FileText,
  Activity, // Icon for "Kemajuan Belajar"
  GraduationCap,
  Sparkles,
  BookOpen,
  Users, 
  ShieldCheck,
  Archive, // Re-using for Data
  ListChecks, // Re-using for Daftar Nilai
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/contexts/AuthContext"; 


export interface NavItemConfig {
  href?: string; // Optional: not needed if it's just a dropdown trigger that doesn't navigate itself
  label: string;
  icon: LucideIcon;
  requiredRole?: UserRole | 'admin' | 'all'; // 'all' for visible to any logged-in user
  children?: NavItemConfig[]; // For dropdown items
  isDropdown?: boolean; // To explicitly mark a top-level item as a dropdown trigger
  isExternal?: boolean; // For external links if any
}


export const mainNavItems: NavItemConfig[] = [
  { 
    href: "/", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    requiredRole: 'all' 
  },
  {
    label: "Data",
    icon: Archive, // Using Archive icon for "Data"
    isDropdown: true,
    requiredRole: 'mahasiswa', // Assuming "Data" dropdown is mainly for mahasiswa
    children: [
      { href: "/student-data", label: "Biodata Mahasiswa", icon: UserCircle, requiredRole: "mahasiswa" },
    ],
  },
  {
    label: "Daftar Nilai",
    icon: ListChecks, // Using ListChecks icon for "Daftar Nilai"
    isDropdown: true,
    requiredRole: 'mahasiswa', // Assuming "Daftar Nilai" is mainly for mahasiswa
    children: [
      { href: "/khs", label: "KHS", icon: FileText, requiredRole: "mahasiswa" },
      { href: "/", label: "Kemajuan Belajar", icon: Activity, requiredRole: "mahasiswa" }, // Links to dashboard for progress
      { href: "/khs", label: "Resume Nilai", icon: ClipboardList, requiredRole: "mahasiswa" }, // Links to KHS for now
    ],
  },
  // Previous items like KRS, Schedule, Course AI are removed as per new structure.
  // Add them back here if needed.
];

export const adminNavItems: NavItemConfig[] = [
    // Future admin links can go here e.g.
    // { href: "/admin/users", label: "User Management", icon: Users, requiredRole: "admin" },
    // { href: "/admin/settings", label: "System Settings", icon: ShieldCheck, requiredRole: "admin" },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { user, initialLoading } = useAuth();

  if (initialLoading) {
    return null; 
  }
  return null; 
}

export function Logo() {
  return (
    <div className="flex items-center gap-2 px-3 py-4">
      <BookOpen className="h-7 w-7 text-primary" /> 
      <span className="text-xl font-semibold text-foreground font-headline">EduCentral</span>
    </div>
  );
}
