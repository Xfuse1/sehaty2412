
"use client"

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Doctor, PatientDetails } from '@/types';

import { PatientDetailsForm } from '@/components/booking/patient-details-form';
import { AppointmentScheduler } from '@/components/booking/appointment-scheduler';
import { PaymentMethodSelector } from '@/components/booking/payment-method-selector';
import { BookingSummary } from '@/components/booking/booking-summary';

const availableTimes = ["09:00 ص", "10:00 ص", "11:00 ص", "01:00 م", "02:00 م", "03:00 م"];

function BookingFlow() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | undefined>();
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>("cash");
    const [isBooking, setIsBooking] = useState(false);
    const [patientDetails, setPatientDetails] = useState<PatientDetails>({
        name: '',
        phone: '',
        address: '',
        age: '',
    });


    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        } else if (user) {
            setPatientDetails(prev => ({
                ...prev,
                name: user.displayName || '',
                phone: user.phoneNumber || '',
            }))
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        const doctorData = searchParams.get('doctor');
        if (doctorData) {
            try {
                const parsedDoctor = JSON.parse(decodeURIComponent(doctorData));
                if (JSON.stringify(parsedDoctor) !== JSON.stringify(doctor)) {
                    setDoctor(parsedDoctor);
                }
            } catch (e) {
                console.error("Failed to parse doctor data", e);
            }
        }
    }, [searchParams, doctor]);

    const handleConfirmBooking = async () => {
        setIsBooking(true);

        if (!user) {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: "يجب تسجيل الدخول أولاً.",
            });
            setIsBooking(false);
            return;
        }

        if (!doctor) {
            setIsBooking(false);
            return;
        }

        const bookingId = `booking_${Date.now()}`;
        const bookingDetails = {
            id: bookingId,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorImage: doctor.image,
            doctorSpecialty: doctor.specialty,
            userId: user.uid,
            patientName: patientDetails.name,
            patientPhone: patientDetails.phone,
            patientAddress: patientDetails.address,
            patientAge: patientDetails.age,
            appointmentDate: selectedDate?.toISOString(),
            appointmentTime: selectedTime,
            paymentMethod: paymentMethod,
            fee: doctor.price || 0,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        // Save to user's bookings subcollection
        const userBookingRef = doc(firestore, "users", user.uid, "bookings", bookingId);
        setDocumentNonBlocking(userBookingRef, bookingDetails, { merge: true });

        // Save to doctor_bookings collection for admin access
        const doctorBookingRef = doc(firestore, "doctor_bookings", bookingId);
        setDocumentNonBlocking(doctorBookingRef, bookingDetails, { merge: true });


        // If online payment selected, create a Kashier session and redirect
        if (paymentMethod === 'online') {
            try {
                const resp = await fetch('/api/kashier/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: bookingDetails.fee,
                        orderId: bookingDetails.id,
                        description: `حجز ${bookingDetails.doctorName}`,
                        merchantRedirect: `${window.location.origin}/payment/success`,
                        failureRedirect: `${window.location.origin}/payment/failure`,
                        serverWebhook: undefined,
                        metadata: { serviceType: 'consultation', userId: bookingDetails.userId }
                    }),
                });

                const data = await resp.json();
                if (data?.checkoutUrl) {
                    const redirectingUrl = `/payment/redirecting?checkoutUrl=${encodeURIComponent(data.checkoutUrl)}&orderId=${encodeURIComponent(bookingDetails.id)}`;
                    window.location.href = redirectingUrl;
                    return; // stop further execution
                } else {
                    console.error('Failed to create payment', data);
                    toast({ variant: 'destructive', title: 'خطأ في الدفع', description: 'لم نتمكن من إنشاء جلسة الدفع. حاول مرة أخرى.' });
                }
            } catch (error) {
                console.error('Payment creation error', error);
                toast({ variant: 'destructive', title: 'خطأ في الدفع', description: 'حدث خطأ داخلي أثناء محاولة الدفع.' });
            }
        }

        // For cash flow or when payment creation failed, navigate to confirmation page
        const queryParams = new URLSearchParams({
            patientName: bookingDetails.patientName,
            patientPhone: bookingDetails.patientPhone,
            appointmentDate: selectedDate?.toLocaleDateString('ar-EG') || 'N/A',
            appointmentTime: bookingDetails.appointmentTime || 'N/A',
            doctorName: bookingDetails.doctorName,
            bookingId: bookingDetails.id,
        }).toString();

        // small delay to give background writes a moment to persist
        setTimeout(() => {
            router.push(`/booking-confirmation?${queryParams}`);
        }, 800);
    }

    if (isUserLoading || !user || !doctor) {
        return (
            <div className="container py-12 flex justify-center items-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline text-primary">تأكيد الحجز</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    أنت على وشك حجز موعد جديد. يرجى مراجعة التفاصيل وتأكيد الحجز.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <PatientDetailsForm patientDetails={patientDetails} setPatientDetails={setPatientDetails} />

                    <AppointmentScheduler
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                        availableTimes={availableTimes}
                    />

                    <PaymentMethodSelector
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                    />
                </div>

                <div className="space-y-6">
                    <BookingSummary
                        doctor={doctor}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        isBooking={isBooking}
                        onConfirm={handleConfirmBooking}
                    />
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className="container py-12 flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <BookingFlow />
        </Suspense>
    )
}
