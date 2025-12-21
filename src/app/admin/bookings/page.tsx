
'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, CalendarDays, Phone, User as UserIcon } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getDocs, writeBatch } from 'firebase/firestore';
import { Booking } from '@/types';
import { format } from 'date-fns';
import { arEG } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/lib/notifications';

export default function AdminBookingsPage() {
  const { isAdmin, isLoading: authLoading } = useAdmin();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (!firestore) return;

    // Fetch ALL bookings ordered by date descending
    const q = query(collection(firestore, 'doctor_bookings'), orderBy('appointmentDate', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      setBookings(fetchedBookings);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, isAdmin, authLoading, router]);

  const handleStatusUpdate = async (booking: Booking, newStatus: 'confirmed' | 'cancelled' | 'completed') => {
    if (!firestore) return;
    setUpdatingId(booking.id);

    try {
      const batch = writeBatch(firestore);

      // 1. Update global 'doctor_bookings'
      const globalBookingRef = doc(firestore, 'doctor_bookings', booking.id);
      batch.update(globalBookingRef, { status: newStatus });

      // 2. Update user's specific booking copy: 'users/{uid}/bookings/{id}'
      // Note: Since we duplicate data, we must update both. Ideally we should find the user doc.
      // But waiting for query might be slow. Direct path is known.
      const userBookingRef = doc(firestore, 'users', booking.userId, 'bookings', booking.id);
      batch.update(userBookingRef, { status: newStatus });

      await batch.commit();

      // 3. Send Notification
      let title = '';
      let message = '';
      let type: 'success' | 'warning' | 'info' | 'error' = 'info';

      if (newStatus === 'confirmed') {
        title = 'تم تأكيد الحجز ✅';
        message = `مرحباً ${booking.patientName}، تم تأكيد حجزك مع د. ${booking.doctorName} بتاريخ ${booking.appointmentDate}.`;
        type = 'success';
      } else if (newStatus === 'cancelled') {
        title = 'تم إلغاء الحجز ❌';
        message = `عذراً، تم إلغاء حجزك مع د. ${booking.doctorName}. يرجى التواصل معنا للتفاصيل.`;
        type = 'error';
      } else if (newStatus === 'completed') {
        title = 'تم اكتمال الموعد';
        message = `نتمنى لك الشفاء العاجل. نرجو تقييم تجربتك مع د. ${booking.doctorName}.`;
        type = 'info';
      }

      await sendNotification(booking.userId, title, message, type, '/my-bookings');

      toast({ title: "تم التحديث", description: `تم تغيير حالة الحجز إلى ${newStatus === 'confirmed' ? 'مؤكد' : newStatus === 'cancelled' ? 'ملغي' : 'مكتمل'}` });

    } catch (error) {
      console.error("Error updating status:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الحالة." });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">مؤكد</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">قيد الانتظار</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">ملغي</Badge>;
      case 'completed': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">مكتمل</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">إدارة الحجوزات</h1>
          <p className="text-muted-foreground mt-1">عرض ومتابعة حالة حجوزات المرضى.</p>
        </div>
        <div className="text-left">
          <div className="text-2xl font-bold text-primary">{bookings.length}</div>
          <div className="text-xs text-muted-foreground">إجمالي الحجوزات</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">المريض</TableHead>
              <TableHead className="text-right">الدكتور</TableHead>
              <TableHead className="text-right">التاريخ والوقت</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold flex items-center gap-2">
                        <UserIcon className="h-3 w-3 text-muted-foreground" />
                        {booking.patientName}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                        <Phone className="h-3 w-3" />
                        {booking.patientPhone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.doctorName}</div>
                    <div className="text-xs text-muted-foreground">{booking.doctorSpecialty}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(booking.appointmentDate), 'dd MMMM yyyy', { locale: arEG })}
                      </span>
                      {booking.appointmentTime && (
                        <span className="flex items-center gap-2 text-xs text-muted-foreground mt-1 text-primary">
                          <Clock className="h-3 w-3" />
                          {booking.appointmentTime}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusUpdate(booking, 'confirmed')}
                            disabled={updatingId === booking.id}
                            title="تأكيد الحجز"
                          >
                            {updatingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(booking, 'cancelled')}
                            disabled={updatingId === booking.id}
                            title="إلغاء الحجز"
                          >
                            {updatingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-5 w-5" />}
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleStatusUpdate(booking, 'completed')}
                          disabled={updatingId === booking.id}
                        >
                          إكمال الموعد
                        </Button>
                      )}
                      {booking.status === 'cancelled' && <span className="text-xs text-muted-foreground">-</span>}
                      {booking.status === 'completed' && <span className="text-xs text-green-600 font-medium">تم</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  لا توجد حجوزات حتى الآن.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
