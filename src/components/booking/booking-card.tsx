
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Phone, User, XCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Booking } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface BookingCardProps {
    booking: Booking;
    onCancel: (id: string) => void;
    isCancelling?: boolean;
}

const statusStyles = {
    confirmed: { label: 'مؤكد', className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' },
    pending: { label: 'قيد الانتظار', className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100' },
    cancelled: { label: 'ملغي', className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100' },
    completed: { label: 'مكتمل', className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' },
};

export function BookingCard({ booking, onCancel, isCancelling }: BookingCardProps) {
    const status = statusStyles[booking.status] || statusStyles.pending;
    const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
    const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="p-0">
                    <div className="bg-primary/5 p-4 flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <Image
                                    src={booking.doctorImage || "https://placehold.co/100x100/png?text=Doctor"}
                                    alt={booking.doctorName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary">{booking.doctorName}</h3>
                                <p className="text-sm text-muted-foreground">{booking.doctorSpecialty}</p>
                            </div>
                        </div>
                        <Badge variant="outline" className={cn("px-3 py-1 font-medium border", status.className)}>
                            {status.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Calendar size={18} />
                            </div>
                            <span>{appointmentDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-foreground/80">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                <Clock size={18} />
                            </div>
                            <span>{booking.appointmentTime || 'غير محدد'}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">بيانات المريض</div>
                        <div className="flex items-center gap-2 text-sm">
                            <User size={14} className="text-muted-foreground" />
                            <span>{booking.patientName}</span>
                        </div>
                        {booking.patientPhone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-muted-foreground" />
                                <span dir="ltr">{booking.patientPhone}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                {isUpcoming && (
                    <CardFooter className="bg-muted/30 p-4 flex justify-end gap-3">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full md:w-auto hover:bg-red-600"
                            onClick={() => onCancel(booking.id)}
                            disabled={isCancelling}
                        >
                            {isCancelling ? 'جارِ الإلغاء...' : 'إلغاء الموعد'}
                        </Button>
                    </CardFooter>
                )}
                {booking.status === 'completed' && (
                    <CardFooter className="bg-muted/30 p-4 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full md:w-auto border-primary text-primary hover:bg-primary hover:text-white"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            كتابة تقييم
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    );
}
