
"use client";

import Link from "next/link";
import { usePathname, useRouter }
from "next/navigation";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Bell,
  Settings,
  LogOut,
  Menu,
  BookOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { mainNavItems, adminNavItems, type NavItemConfig } from "./sidebar-nav";

const getPageTitle = (pathname: string, navItems: NavItemConfig[], adminNavs: NavItemConfig[], userRole?: string): string => {
  const allNavs = [...navItems, ...adminNavs].filter(Boolean);
  
  if (pathname === "/" || pathname === "/(app)") {
     if (userRole === 'mahasiswa') return "Dashboard Mahasiswa";
     if (userRole === 'dosen') return "Dashboard Dosen";
     if (userRole === 'admin') return "Dashboard Admin";
    return "Dashboard";
  }

  let longestMatch = "";
  let title = "EduCentral";

  const findTitleRecursive = (items: NavItemConfig[]) => {
    for (const item of items) {
      if (item.href && item.href !== "/" && pathname.startsWith(item.href)) {
        if (item.href.length > longestMatch.length) {
          longestMatch = item.href;
          title = item.label;
        }
      }
      if (item.children) {
        findTitleRecursive(item.children);
      }
    }
  };

  findTitleRecursive(allNavs);
  
  if (longestMatch) return title;
  
  // Fallback for paths not directly in nav items
  const pathParts = pathname.split('/').filter(Boolean);
  const lastPart = pathParts.length > 0 ? pathParts[pathParts.length -1] : "App";
  
  return lastPart !== "(app)" ? lastPart.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "EduCentral";
};


export function AppHeader() { 
  const { user, logoutUser, loading: authLoading, initialLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const filterNavItems = (items: NavItemConfig[]): NavItemConfig[] => {
    return items.filter(item => {
      if (!user) return false; // Should not happen if layout protects routes
      if (item.requiredRole === 'all' || !item.requiredRole) return true;
      if (user.role === 'admin' && (item.requiredRole === 'admin' || item.requiredRole === 'dosen' || item.requiredRole === 'mahasiswa')) return true;
      return user.role === item.requiredRole;
    }).map(item => ({
      ...item,
      children: item.children ? filterNavItems(item.children) : undefined,
    })).filter(item => item.isDropdown ? item.children && item.children.length > 0 : true);
  };
  
  const filteredMainNavs = filterNavItems(mainNavItems);
  const filteredAdminNavs = filterNavItems(adminNavItems); // For future use
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

  const NavLink = ({ href, children, itemIcon: Icon, className: extraClassName, onClick }: { href: string; children: React.ReactNode, itemIcon?: React.ElementType, className?: string, onClick?: () => void }) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground",
          extraClassName
        )}
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {children}
      </Link>
    );
  };
  
  const UserSpecificInfo = () => {
    if (!user) return null;
    let detail = `Role: ${capitalizeFirstLetter(user.role)}`;
    if (user.role === 'mahasiswa') {
      // Placeholder for NIM. Replace with actual data when available.
      detail = `NIM: ${user.email?.split('@')[0] || 'N/A'}`;
    } else if (user.role === 'dosen') {
      // Placeholder for NIP. Replace with actual data when available.
      detail = `NIP: ${user.email?.split('@')[0] || 'N/A'}`;
    }
    return (
       <>
        <p className="text-sm font-medium leading-none">{user?.email}</p>
        <p className="text-xs leading-none text-muted-foreground pt-1">{detail}</p>
       </>
    );
  };

  const UserProfileDropdownItems = () => (
    <>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <UserSpecificInfo />
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

  const renderNavItems = (items: NavItemConfig[], isMobile: boolean) => {
    return items.map((item) => {
      const ItemIcon = item.icon;
      if (item.isDropdown && item.children && item.children.length > 0) {
        if (isMobile) {
          return (
            <div key={item.label} className="pt-2">
              <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center">
                <ItemIcon className="mr-2 h-4 w-4" /> {item.label}
              </p>
              {item.children.map(child => (
                child.href && (
                  <SheetClose asChild key={child.href}>
                     <NavLink 
                        href={child.href} 
                        itemIcon={child.icon} 
                        className="px-3 py-2 rounded-md hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                      {child.label}
                    </NavLink>
                  </SheetClose>
                )
              ))}
            </div>
          );
        }
        // Desktop Dropdown
        return (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 data-[state=open]:text-primary data-[state=open]:bg-muted">
                <ItemIcon className="mr-2 h-4 w-4" />
                {item.label}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                {item.children.map(child => (
                  child.href && (
                     <DropdownMenuItem key={child.href} asChild className="cursor-pointer">
                      <Link href={child.href} className="flex items-center w-full">
                        {child.icon && <child.icon className="mr-2 h-4 w-4"/>} {child.label}
                      </Link>
                    </DropdownMenuItem>
                  )
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
      // Regular NavLink for Desktop or specific mobile cases if not dropdown
      if (item.href && !isMobile) { // Only render direct links on desktop if not dropdown
        return (
          <NavLink key={item.href} href={item.href} itemIcon={ItemIcon} className="px-3 py-2">
            {item.label}
          </NavLink>
        );
      }
       if (item.href && isMobile) { // Render direct links in mobile sheet
        return (
          <SheetClose asChild key={item.href}>
            <NavLink 
              href={item.href} 
              itemIcon={ItemIcon} 
              className="px-3 py-2 rounded-md hover:bg-muted"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          </SheetClose>
        );
      }
      return null;
    });
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center">
         {/* Mobile Menu Trigger */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden mr-3">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
            <div className="flex h-16 items-center border-b px-6">
               <SheetClose asChild>
                <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span>EduCentral</span>
                </Link>
              </SheetClose>
            </div>
            <nav className="flex-1 grid gap-1 p-4 text-sm">
              {renderNavItems(allUserNavItems, true)}
            </nav>
            <div className="mt-auto border-t p-4">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start items-center gap-2 h-auto py-2 px-3">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || `https://placehold.co/100x100.png?text=${getInitials(user?.email)}`} alt="User Avatar" data-ai-hint="person" />
                            <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                           <UserSpecificInfo />
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" sideOffset={10} className="w-56 mb-2">
                    <UserProfileDropdownItems />
                </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop Logo */}
        <Link href="/" className="hidden items-center gap-2 font-semibold md:flex">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">EduCentral</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden flex-col gap-1 text-lg font-medium md:flex md:flex-row md:items-center md:mx-auto md:gap-0.5 lg:gap-1">
        {renderNavItems(allUserNavItems, false)}
      </nav>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
         <h1 className="text-lg font-semibold md:text-xl hidden lg:block mr-2 md:mr-4 whitespace-nowrap">{pageTitle}</h1>
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
            <DropdownMenuContent align="end" className="w-64"> {/* Increased width for NIP/NIM */}
              <UserProfileDropdownItems />
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}

export function usePageTitle(title: string) {
  useEffect(() => {
    // console.log("Page suggests title:", title);
  }, [title]);
}
