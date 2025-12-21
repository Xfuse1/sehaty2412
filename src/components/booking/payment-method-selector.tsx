
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface PaymentMethodSelectorProps {
    paymentMethod: 'cash' | 'online';
    setPaymentMethod: (method: 'cash' | 'online') => void;
}

export function PaymentMethodSelector({ paymentMethod, setPaymentMethod }: PaymentMethodSelectorProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>3. اختر طريقة الدفع</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as 'cash' | 'online')}>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="cash" id="r1" />
                        <Label htmlFor="r1" className="flex-grow">الدفع عند الوصول</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse mt-4">
                        <RadioGroupItem value="online" id="r2" />
                        <Label htmlFor="r2" className="flex-grow">
                            الدفع الآن (أونلاين)
                            <Badge variant="secondary" className="mr-2">يضمن تأكيد الحجز</Badge>
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
