
import { useUser } from '@/firebase';

// In a real production app, this should be handled via Custom Claims or a backend validation.
// For now, we centralize the email check here.
const ADMIN_EMAILS = ["sarsor6578@gmail.com"];

export function useAdmin() {
    const { user, isUserLoading } = useUser();

    const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

    return {
        isAdmin,
        isLoading: isUserLoading,
        user
    };
}
