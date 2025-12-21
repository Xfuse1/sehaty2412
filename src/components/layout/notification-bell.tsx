
"use client";

import { useNotifications } from '@/providers/notifications-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { arEG } from 'date-fns/locale';

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted">
                    <Bell className="h-5 w-5 text-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 text-[8px] font-bold text-white items-center justify-center">
                                {/* Small dot instead of number for minimal look, or remove inner span content */}
                            </span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <h4 className="font-semibold text-sm">الإشعارات ({unreadCount})</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="text-xs text-primary hover:text-primary/80 h-auto p-1 px-2">
                            <Check className="h-3 w-3 mr-1" />
                            تحديد الكل كمقروء
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notification.read && "bg-primary/5"
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className={cn("text-sm font-medium leading-none", !notification.read && "font-bold")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70 pt-1">
                                            {notification.createdAt?.seconds
                                                ? formatDistanceToNow(new Date(notification.createdAt.seconds * 1000), { addSuffix: true, locale: arEG })
                                                : "الآن"
                                            }
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">لا توجد إشعارات جديدة</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
