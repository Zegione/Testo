
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react"; 
import {
  LayoutDashboard,
  ClipboardList, 
  UserCircle, 
  FileText,
  Activity, 
  GraduationCap,
  Sparkles,
  BookOpen,
  Users, 
  ShieldCheck,
  Archive, 
  ListChecks, 
  CalendarCheck2, 
  Edit3, 
  CheckSquare, 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/contexts/AuthContext"; 


export interface NavItemConfig {
  href?: string; 
  label: string;
  icon: LucideIcon;
  requiredRole?: UserRole | 'admin' | 'all'; 
  children?: NavItemConfig[]; 
  isDropdown?: boolean; 
  isExternal?: boolean; 
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
    icon: Archive, 
    isDropdown: true,
    requiredRole: 'mahasiswa', 
    children: [
      { href: "/student-data", label: "Biodata Mahasiswa", icon: UserCircle, requiredRole: "mahasiswa" },
      { href: "/attendance", label: "Absensi Kuliah", icon: CheckSquare, requiredRole: "mahasiswa" },
    ],
  },
  {
    label: "Daftar Nilai",
    icon: ListChecks, 
    isDropdown: true,
    requiredRole: 'mahasiswa', 
    children: [
      { href: "/khs", label: "KHS", icon: FileText, requiredRole: "mahasiswa" },
      { href: "/", label: "Kemajuan Belajar", icon: Activity, requiredRole: "mahasiswa" }, 
      { href: "/khs", label: "Resume Nilai", icon: ClipboardList, requiredRole: "mahasiswa" }, 
    ],
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: CalendarCheck2,
    requiredRole: "all", // Mahasiswa and Dosen can see schedule
  },
  // {
  //   href: "/krs",
  //   label: "KRS Submission",
  //   icon: Edit3,
  //   requiredRole: "mahasiswa",
  // },
  // {
  //   href: "/course-recommendations",
  //   label: "AI Recommendations",
  //   icon: Sparkles,
  //   requiredRole: "mahasiswa",
  // },
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
