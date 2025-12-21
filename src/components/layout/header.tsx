"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, LogOut, Shield, User } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { useAdmin } from '@/hooks/use-admin';
import { signOut, getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { BrandLogo } from '@/components/layout/brand-logo';
import { Loader2 } from 'lucide-react';
import { NotificationBell } from './notification-bell';

const navLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/#services', label: 'خدماتنا' },
  { href: '/doctors-directory', label: 'الأطباء' },
  { href: '/#stats', label: 'أرقامنا' },
  { href: '/contact', label: 'تواصل معنا' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const { isAdmin } = useAdmin();

  const handleLogout = async () => {
    const auth = getAuth(getApp());
    await signOut(auth);
  };

  const getInitials = (name: string | null | undefined) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const userMenu = user ? (
    <div className="flex items-center gap-4">
      {isAdmin && (
        <Button variant="secondary" size="sm" asChild className="hidden md:flex">
          <Link href="/admin/dashboard">لوحة التحكم</Link>
        </Button>
      )}
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary-foreground/20 hover:bg-white/10">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback className="bg-primary-foreground text-primary font-bold">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/my-bookings">حجوزاتي</Link></DropdownMenuItem>
          {isAdmin && <DropdownMenuItem asChild><Link href="/admin/dashboard">لوحة التحكم</Link></DropdownMenuItem>}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>تسجيل الخروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild className="hover:bg-white/10 text-primary-foreground">
        <Link href="/login">دخول</Link>
      </Button>
      <Button variant="secondary" asChild className="font-bold text-primary">
        <Link href="/register">حساب جديد</Link>
      </Button>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-md transition-all">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <BrandLogo />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white/80 ${pathname === link.href ? 'text-white font-bold' : 'text-primary-foreground/80'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isUserLoading ? <Loader2 className="animate-spin" /> : userMenu}
        </div>

        <div className="md:hidden flex items-center gap-4">
          {/* Show Bell on Mobile too if logged in */}
          {!isUserLoading && user && <NotificationBell />}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/10 text-primary-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" onClick={() => { }} className="flex items-center gap-2 mb-4">
                  <BrandLogo />
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors border-b pb-2"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t">
                  {isUserLoading ? (
                    <Loader2 className="mx-auto animate-spin text-primary" />
                  ) : user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarImage src={user.photoURL || ''} />
                          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{user.displayName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/my-bookings">حجوزاتي</Link>
                      </Button>
                      {isAdmin && (
                        <Button asChild className="w-full justify-start" variant="outline">
                          <Link href="/admin/dashboard">لوحة التحكم</Link>
                        </Button>
                      )}
                      <Button onClick={handleLogout} variant="destructive" className="w-full justify-start">
                        تسجيل الخروج
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button asChild className="w-full">
                        <Link href="/login">تسجيل الدخول</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/register">إنشاء حساب</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
