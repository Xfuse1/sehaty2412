
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar as CalendarIcon, Star } from 'lucide-react';
import Image from 'next/image';
import { Doctor } from '@/types';

interface BookingSummaryProps {
    doctor: Doctor;
    selectedDate: Date | undefined;
    selectedTime: string | undefined;
    isBooking: boolean;
    onConfirm: () => void;
}

export function BookingSummary({ doctor, selectedDate, selectedTime, isBooking, onConfirm }: BookingSummaryProps) {
    return (
        <Card className="sticky top-24">
            <CardHeader className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <Image src={doctor.image} alt={doctor.name} layout="fill" className="rounded-full object-cover border-4 border-primary/20" Data-ai-hint="doctor portrait" />
                </div>
                <CardTitle className="text-primary">{doctor.name}</CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
                <div className="flex items-center justify-center gap-1 text-amber-500 text-sm mt-2">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{doctor.rating}</span>
                    <span>({doctor.reviews} مراجعة)</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="border-t pt-4">
                    <h4 className="font-bold mb-4">ملخص الحجز</h4>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">التاريخ:</span>
                        <span className="font-semibold">{selectedDate ? selectedDate.toLocaleDateString('ar-EG') : 'لم يحدد'}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-muted-foreground">الوقت:</span>
                        <span className="font-semibold">{selectedTime || 'لم يحدد'}</span>
                    </div>
                    <div className="flex justify-between mt-4 pt-4 border-t">
                        <span className="text-muted-foreground font-bold">رسوم الكشف:</span>
                        <span className="font-bold text-lg text-primary">{doctor.price} ر.س</span>
                    </div>
                </div>
                <Button
                    className="w-full mt-6"
                    size="lg"
                    disabled={!selectedDate || !selectedTime || isBooking}
                    onClick={onConfirm}
                >
                    {isBooking ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <CalendarIcon className="ml-2 h-5 w-5" />}
                    {isBooking ? "جارِ تأكيد الحجز..." : "تأكيد الحجز"}
                </Button>
            </CardContent>
        </Card>
    );
}
