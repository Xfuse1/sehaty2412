
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, CalendarX2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types';
import { BookingCard } from '@/components/booking/booking-card'; // Changed path slightly to match where I saved it, or check previous step.
// Actually, I saved it to src/components/booking/booking-card.tsx in the previous step.
import { FadeIn } from '@/components/animations/fade-in';

export default function MyBookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCancellingId, setIsCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Fetch bookings from users/{uid}/bookings subcollection
      const q = query(
        collection(firestore, "users", user.uid, "bookings"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedBookings: Booking[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        setBookings(fetchedBookings);
        setIsLoadingData(false);
      }, (error) => {
        console.error("Error fetching bookings:", error);
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل تحميل الحجوزات."
        });
        setIsLoadingData(false);
      });

      return () => unsubscribe();
    }
  }, [user, isUserLoading, firestore, router, toast]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    setIsCancellingId(bookingId);
    try {
      // Update in user's subcollection
      const userBookingRef = doc(firestore, "users", user.uid, "bookings", bookingId);
      await updateDoc(userBookingRef, { status: 'cancelled' });

      // Note: If you have a separate 'doctor_bookings' root collection, ideally you should update that too.
      // For now, we update the user's view. In a real app, a Cloud Function would handle the sync.
      try {
        const globalBookingRef = doc(firestore, "doctor_bookings", bookingId);
        await updateDoc(globalBookingRef, { status: 'cancelled' });
      } catch (e) {
        // Ignore if document doesn't exist or permission denied
        console.log("Could not update global booking ref (might act as read-only for user)", e);
      }

      toast({
        title: "تم الإلغاء",
        description: "تم إلغاء الموعد بنجاح.",
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء محاولة الإلغاء.",
      });
    } finally {
      setIsCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  if (isUserLoading || isLoadingData) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <FadeIn>
          <div className="mb-10 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-2">ملف الحجوزات</h1>
            <p className="text-muted-foreground text-lg">متابعة مواعيدك الصحية وتفاصيل زياراتك السابقة.</p>
          </div>
        </FadeIn>

        <Tabs defaultValue="upcoming" className="w-full">
          <FadeIn delay={0.1}>
            <TabsList className="grid w-full grid-cols-3 mb-8 h-12 rounded-xl bg-background border shadow-sm p-1">
              <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base">القادمة ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base">المكتملة ({completedBookings.length})</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base">الملغية ({cancelledBookings.length})</TabsTrigger>
            </TabsList>
          </FadeIn>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                  isCancelling={isCancellingId === booking.id}
                />
              ))
            ) : (
              <EmptyState message="ليس لديك حجوزات قادمة." />
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedBookings.length > 0 ? (
              completedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))
            ) : (
              <EmptyState message="لا يوجد سجل حجوزات سابقة." />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelBooking}
                />
              ))
            ) : (
              <EmptyState message="لا توجد حجوزات ملغية." />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-transparent shadow-none">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <CalendarX2 className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
    </Card>
  )
}
