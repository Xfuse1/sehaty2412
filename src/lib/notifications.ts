
import { collection, addDoc, serverTimestamp, getFirestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export async function sendNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'info',
    link?: string
) {
    try {
        const { firestore } = initializeFirebase();
        const notificationsRef = collection(firestore, "users", userId, "notifications");
        await addDoc(notificationsRef, {
            title,
            message,
            type,
            link: link || null,
            read: false,
            createdAt: serverTimestamp(),
        });
        console.log(`Notification sent to user ${userId}`);
    } catch (error) {
        console.error("Error sending notification:", error);
        // Don't throw error to prevent interrupting the main flow
    }
}
