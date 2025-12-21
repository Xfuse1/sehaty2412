
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"

interface AppointmentSchedulerProps {
    selectedDate: Date | undefined;
    setSelectedDate: (date: Date | undefined) => void;
    selectedTime: string | undefined;
    setSelectedTime: (time: string) => void;
    availableTimes: string[];
}

export function AppointmentScheduler({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, availableTimes }: AppointmentSchedulerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>2. اختر الموعد المناسب</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-4 text-center">اختر التاريخ</h3>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                        />
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold mb-4 text-center">اختر الوقت</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {availableTimes.map(time => (
                            <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                onClick={() => setSelectedTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
