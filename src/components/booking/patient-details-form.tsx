
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientDetails } from '@/types';

interface PatientDetailsFormProps {
    patientDetails: PatientDetails;
    setPatientDetails: (details: PatientDetails) => void;
}

export function PatientDetailsForm({ patientDetails, setPatientDetails }: PatientDetailsFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>1. تأكيد بيانات المريض</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">الاسم الكامل</Label>
                        <Input id="name" value={patientDetails.name} onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })} />
                    </div>
                    <div>
                        <Label htmlFor="phone">رقم الموبايل</Label>
                        <Input id="phone" value={patientDetails.phone} onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })} placeholder="e.g., 05xxxxxxx" />
                    </div>
                    <div>
                        <Label htmlFor="address">العنوان</Label>
                        <Input id="address" value={patientDetails.address} onChange={(e) => setPatientDetails({ ...patientDetails, address: e.target.value })} placeholder="المدينة، الحي، الشارع" />
                    </div>
                    <div>
                        <Label htmlFor="age">العمر</Label>
                        <Input id="age" type="number" value={patientDetails.age} onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })} placeholder="أدخل عمرك" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
