
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, writeBatch, where } from 'firebase/firestore';
import { Notification } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType>({
    notifications: [],
    unreadCount: 0,
    isLoading: true,
    markAsRead: async () => { },
    markAllAsRead: async () => { },
});

export const useNotifications = () => useContext(NotificationsContext);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!user || !firestore) {
            setNotifications([]);
            setIsLoading(false);
            return;
        }

        const q = query(
            collection(firestore, 'users', user.uid, 'notifications'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];
            setNotifications(fetchedNotifications);
            setIsLoading(false);
        }, (error) => {
            console.error("Error listening to notifications:", error);
            // Silent fail or minimal log to avoid spamming user
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id: string) => {
        if (!user) return;
        try {
            await updateDoc(doc(firestore, 'users', user.uid, 'notifications', id), {
                read: true
            });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user) return;
        try {
            const batch = writeBatch(firestore);
            const unreadDocs = notifications.filter(n => !n.read);

            unreadDocs.forEach(n => {
                const docRef = doc(firestore, 'users', user.uid, 'notifications', n.id);
                batch.update(docRef, { read: true });
            });

            if (unreadDocs.length > 0) {
                await batch.commit();
            }
        } catch (error) {
            console.error("Error marking all as read:", error);
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الإشعارات." });
        }
    };

    return (
        <NotificationsContext.Provider value={{ notifications, unreadCount, isLoading, markAsRead, markAllAsRead }}>
            {children}
        </NotificationsContext.Provider>
    );
}
