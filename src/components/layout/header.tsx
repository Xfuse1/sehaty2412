"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, LogOut, Shield, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { useAdmin } from '@/hooks/use-admin';
import { signOut, getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { BrandLogo } from '@/components/layout/brand-logo';
import { NotificationBell } from './notification-bell';
import { motion } from 'framer-motion';

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
        <Button variant="ghost" size="sm" asChild className="hidden md:flex rounded-full text-foreground/80 hover:text-primary">
          <Link href="/admin/dashboard">لوحة التحكم</Link>
        </Button>
      )}
      <NotificationBell />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-11 w-11 rounded-full border border-primary/20 p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20">
            <Avatar className="h-full w-full">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-2 p-2 rounded-[1.5rem] glass shadow-2xl" align="end" forceMount>
          <DropdownMenuLabel className="font-normal mb-2">
            <div className="flex flex-col space-y-1 p-2 bg-primary/5 rounded-2xl">
              <p className="text-sm font-bold leading-none">{user.displayName || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="opacity-50" />
          <div className="p-1 space-y-1">
            <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3"><Link href="/my-bookings" className="w-full flex items-center gap-2"><User size={16} />حجوزاتي</Link></DropdownMenuItem>
            {isAdmin && <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3"><Link href="/admin/dashboard" className="w-full flex items-center gap-2"><Shield size={16} />لوحة الإدارة</Link></DropdownMenuItem>}
          </div>
          <DropdownMenuSeparator className="opacity-50" />
          <DropdownMenuItem onClick={handleLogout} className="rounded-xl cursor-pointer text-red-600 focus:text-red-600 font-bold py-3 mt-1">
            <LogOut className="mr-2 h-4 w-4" />
            <span>تسجيل الخروج</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <Button variant="ghost" asChild className="rounded-full px-6 hover:text-primary transition-colors text-foreground/80">
        <Link href="/login">دخول</Link>
      </Button>
      <Button asChild className="medical-gradient rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
        <Link href="/signup">حساب جديد</Link>
      </Button>
    </div>
  );

  return (
    <header className="fixed top-0 z-50 w-full transition-all duration-500 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/20 shadow-[0_2px_15px_rgba(0,0,0,0.05)]">
      <div className="container flex h-20 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 group">
            <div className="group-hover:rotate-12 transition-transform duration-500">
              <BrandLogo />
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative text-base font-bold transition-all duration-300 ${pathname === link.href ? 'text-primary' : 'text-foreground/70 hover:text-primary'}`}
              >
                {link.label}
                <span className={`absolute -bottom-1 right-0 h-1 bg-primary rounded-full transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isUserLoading ? <Loader2 className="animate-spin text-primary" /> : userMenu}
        </div>

        <div className="md:hidden flex items-center gap-4">
          {!isUserLoading && user && <NotificationBell />}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl border border-primary/20 text-primary">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/95 backdrop-blur-2xl border-l border-primary/10 w-[85vw] rounded-l-[3rem]">
              <div className="flex flex-col gap-8 mt-10 h-full">
                <Link href="/" className="flex items-center gap-2 mb-4 animate-float">
                  <BrandLogo />
                </Link>
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={`text-xl font-bold p-4 rounded-2xl flex items-center justify-between group ${pathname === link.href ? 'bg-primary/10 text-primary' : 'text-foreground/80'}`}
                      >
                        {link.label}
                        <ArrowLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-2 ${pathname === link.href ? 'opacity-100' : 'opacity-0'}`} />
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <div className="mt-auto pb-12">
                  {isUserLoading ? (
                    <Loader2 className="mx-auto animate-spin text-primary" />
                  ) : user ? (
                    <div className="space-y-4 bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                          <AvatarImage src={user.photoURL || ''} />
                          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-lg">{user.displayName}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <Button asChild className="rounded-2xl h-12 justify-start ps-5" variant="ghost">
                          <Link href="/my-bookings" className="flex items-center gap-3"><User size={18} />حجوزاتي</Link>
                        </Button>
                        {isAdmin && (
                          <Button asChild className="rounded-2xl h-12 justify-start ps-5" variant="ghost">
                            <Link href="/admin/dashboard" className="flex items-center gap-3"><Shield size={18} />لوحة التحكم</Link>
                          </Button>
                        )}
                        <Button onClick={handleLogout} variant="destructive" className="rounded-2xl h-12 justify-start ps-5 mt-4">
                          <LogOut className="mr-3 h-5 w-5" />
                          تسجيل الخروج
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Button asChild className="medical-gradient rounded-2xl h-14 text-lg font-bold shadow-xl">
                        <Link href="/login">تسجيل الدخول</Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-2xl h-14 text-lg font-bold border-primary/20 text-primary">
                        <Link href="/signup">إنشاء حساب جديد</Link>
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
