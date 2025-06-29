
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader, 
  SheetTitle,  
} from "@/components/ui/sheet";
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
  User,
  GraduationCap
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
  let title = "MySiakad"; 

  const findTitleRecursive = (items: NavItemConfig[], currentPath: string) => {
    for (const item of items) {
      if (item.href && item.href !== "/" && currentPath.startsWith(item.href)) {
        if (item.href.length > longestMatch.length) {
          longestMatch = item.href;
          title = item.label;
        }
      }
      if (item.children) {
        if (!longestMatch || (item.href && currentPath.startsWith(item.href))) {
           findTitleRecursive(item.children, currentPath);
        }
      }
    }
  };
  
  findTitleRecursive(allNavs, pathname);
  
  if (longestMatch) return title;
  
  const pathParts = pathname.split('/').filter(Boolean);
  const relevantPathParts = pathParts[0] === '(app)' ? pathParts.slice(1) : pathParts;
  const lastPart = relevantPathParts.length > 0 ? relevantPathParts[relevantPathParts.length -1] : "App";
  
  return lastPart.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};


export function AppHeader() { 
  const { user, logoutUser, loading: authLoading, initialLoading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const filterNavItems = (items: NavItemConfig[]): NavItemConfig[] => {
    if (!user) return [];
    return items.filter(item => {
      if (item.requiredRole === 'all' || !item.requiredRole) return true;
      if (user.role === 'admin' && (item.requiredRole === 'admin' || item.requiredRole === 'dosen' || item.requiredRole === 'mahasiswa')) return true;
      return user.role === item.requiredRole;
    }).map(item => ({
      ...item,
      children: item.children ? filterNavItems(item.children) : undefined,
    })).filter(item => {
      // If it's a dropdown, ensure it has children after filtering.
      // Otherwise, keep it.
      return item.isDropdown ? item.children && item.children.length > 0 : true;
    });
  };
  
  const filteredMainNavs = filterNavItems(mainNavItems);
  const filteredAdminNavs = filterNavItems(adminNavItems); 
  const allUserNavItems = [...filteredMainNavs, ...filteredAdminNavs];

  const pageTitle = getPageTitle(pathname, filteredMainNavs, filteredAdminNavs, user?.role);

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const nameParts = name.split(' ').filter(Boolean);
      if (nameParts.length > 1) {
        return (nameParts[0][0] + (nameParts[1][0] || nameParts[0][1] || "")).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      const emailParts = email.split("@")[0].split(/[._-]/);
      if (emailParts.length > 1) {
        return (emailParts[0][0] + (emailParts[1][0] || emailParts[0][1] || "")).toUpperCase();
      }
      return email.substring(0, 2).toUpperCase();
    }
    return "??";
  };

  const NavLink = ({ href, children, itemIcon: Icon, className: extraClassName, onClick, isSheetLink = false }: { href: string; children: React.ReactNode, itemIcon?: React.ElementType, className?: string, onClick?: () => void, isSheetLink?: boolean }) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center text-sm transition-colors",
          isSheetLink 
            ? "px-3 py-2.5 rounded-md hover:bg-muted text-foreground"  // Mobile sheet links
            : "px-3 py-2 hover:text-primary text-muted-foreground font-medium", // Desktop links
          isActive && isSheetLink && "bg-primary/10 text-primary font-semibold", // Active mobile
          isActive && !isSheetLink && "text-primary font-semibold", // Active desktop
          extraClassName
        )}
      >
        {Icon && <Icon className={cn("mr-2 h-4 w-4", isActive && "text-primary")} />}
        {children}
      </Link>
    );
  };
  
  const UserSpecificInfo = () => {
    if (!user) return null;
    
    let detailLine = "";
    if (user.role === 'mahasiswa' && user.studentId) {
      detailLine = `NIM: ${user.studentId}`;
    } else if (user.role === 'dosen' && user.studentId) { // Assuming studentId field is used for NIP for dosen
      detailLine = `NIP: ${user.studentId}`;
    } else if (user.role === 'admin') {
      detailLine = `Role: Admin`;
    }

    return (
       <>
        <p className="text-sm font-medium leading-none truncate" title={user.name || user.email || ""}>
          {user.name || user.email}
        </p>
        {detailLine && <p className="text-xs leading-none text-muted-foreground pt-1">{detailLine}</p>}
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
      <DropdownMenuItem onClick={logoutUser} disabled={authLoading} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </>
  );

  const renderNavItems = (items: NavItemConfig[], isMobile: boolean) => {
    return items.map((item) => {
      const ItemIcon = item.icon;
      const key = `${item.href || item.label}-${item.label}`; 

      if (item.isDropdown && item.children && item.children.length > 0) {
        if (isMobile) {
          return (
            <div key={key} className="pt-2">
              <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center">
                {ItemIcon && <ItemIcon className="mr-2 h-4 w-4" />} {item.label}
              </p>
              {item.children.map(child => (
                child.href && (
                  <SheetClose asChild key={`${child.href}-${child.label}`}>
                     <NavLink 
                        href={child.href} 
                        itemIcon={child.icon} 
                        className="font-normal pl-5"
                        onClick={() => setMobileMenuOpen(false)}
                        isSheetLink={true}
                      >
                      {child.label}
                    </NavLink>
                  </SheetClose>
                )
              ))}
            </div>
          );
        }
        return (
          <DropdownMenu key={key}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary px-3 py-2 data-[state=open]:text-primary data-[state=open]:bg-muted">
                {ItemIcon && <ItemIcon className="mr-2 h-4 w-4" />}
                {item.label}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuGroup>
                {item.children.map(child => (
                  child.href && (
                     <DropdownMenuItem key={`${child.href}-${child.label}`} asChild className="cursor-pointer">
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
      if (item.href) { 
        return (
          <NavLink 
            key={key} 
            href={item.href} 
            itemIcon={ItemIcon} 
            onClick={isMobile ? () => setMobileMenuOpen(false) : undefined}
            isSheetLink={isMobile}
          >
            {item.label}
          </NavLink>
        );
      }
      return null;
    });
  };


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
          <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle> 
            <div className="flex h-16 items-center border-b px-6">
               <SheetClose asChild>
                <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span className="text-lg">MySiakad</span>
                </Link>
              </SheetClose>
            </div>
            <nav className="flex-1 grid gap-1 p-4 text-sm">
              {renderNavItems(allUserNavItems, true)}
            </nav>
            <div className="mt-auto border-t p-4">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start items-center gap-2 h-auto py-2 px-3 text-left">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user?.name, user?.email)}`} alt="User Avatar" data-ai-hint="person" />
                            <AvatarFallback>{getInitials(user?.name, user?.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start overflow-hidden">
                           <UserSpecificInfo />
                        </div>
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50 flex-shrink-0"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" sideOffset={10} className="w-64 mb-2">
                    <UserProfileDropdownItems />
                </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="hidden items-center gap-2 md:flex">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">MySiakad</span>
        </Link>
      </div>

      <nav className="hidden flex-col gap-1 md:flex md:flex-row md:items-center md:mx-auto md:gap-0.5 lg:gap-1 text-sm">
        {renderNavItems(allUserNavItems, false)}
      </nav>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
         <h1 className="text-lg font-semibold md:text-xl hidden lg:block mr-2 md:mr-4 whitespace-nowrap overflow-hidden text-ellipsis" title={pageTitle}>
           {pageTitle}
         </h1>
        {initialLoading ? (
            <Avatar className="h-9 w-9">
                 <AvatarFallback>?</AvatarFallback>
            </Avatar>
        ): user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.name, user.email)}`} alt="User Avatar" data-ai-hint="person"/>
                  <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64"> 
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
    // This hook is not strictly necessary for the header to set the title itself,
    // but can be kept if pages want to suggest titles for other purposes.
  }, [title]);
}
