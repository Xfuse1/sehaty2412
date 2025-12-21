
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadToCloudinary } from '@/lib/cloudinary';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, PlusCircle, Trash2, Edit, Search, UploadCloud, Info } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useFirestore } from '@/firebase';
import { addDoc, collection, doc, deleteDoc, updateDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdmin } from '@/hooks/use-admin';
import { Doctor } from '@/types';
import { DoctorFormDialog } from '@/components/admin/doctor-form-dialog';
import { useRouter } from 'next/navigation';
import { read, utils } from 'xlsx';

export default function DoctorsPage() {
  const { isAdmin, isLoading: authLoading } = useAdmin();
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Delete States
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Excel File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }

    const q = query(collection(firestore, 'doctors'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDoctors: Doctor[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doctor[];
      setDoctors(fetchedDoctors);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching doctors:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل قائمة الأطباء" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, isAdmin, authLoading, router, toast]);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        toast({ variant: "destructive", title: "تنبيه", description: "الملف فارغ." });
        setIsLoading(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        // Map Excel columns (support both English and typical Arabic headers)
        const name = row['Name'] || row['name'] || row['الاسم'] || row['اسم الطبيب'];
        const specialty = row['Specialty'] || row['specialty'] || row['التخصص'];
        const price = row['Price'] || row['price'] || row['السعر'];
        // Optional fields
        const location = row['Location'] || row['location'] || row['الموقع'] || row['العنوان'] || "";
        const experience = row['Experience'] || row['experience'] || row['الخبرة'] || 0;
        const about = row['About'] || row['about'] || row['نبذة'] || "";
        const image = row['Image'] || row['image'] || row['الصورة'] || "";

        if (name && specialty && price) {
          try {
            await addDoc(collection(firestore, 'doctors'), {
              name: String(name),
              specialty: String(specialty),
              price: Number(price),
              location: String(location),
              experience: Number(experience),
              about: String(about),
              image: String(image),
              rating: 5,
              reviews: 0,
              createdAt: serverTimestamp(),
            });
            successCount++;
          } catch (err) {
            console.error("Error adding row:", row, err);
            errorCount++;
          }
        } else {
          errorCount++;
        }
      }

      toast({
        title: "تم الاستيراد",
        description: `تمت إضافة ${successCount} طبيب بنجاح. ${errorCount > 0 ? `فشل ${errorCount} صفوف.` : ''}`
      });

      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input

    } catch (error) {
      console.error("Excel import error:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل قراءة ملف الإكسل." });
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddDoctor = () => {
    setEditingDoctor(null);
    setIsDialogOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(firestore, 'doctors', doctorToDelete.id));
      toast({ title: "تم الحذف", description: "تم حذف الطبيب بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحذف." });
    } finally {
      setIsDeleting(false);
      setDoctorToDelete(null);
    }
  };

  const handleSaveDoctor = async (values: Partial<Doctor>, imageFile?: File) => {
    try {
      let imageUrl = values.image;

      // Upload new image if provided
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile);
      }

      const doctorData = {
        ...values,
        image: imageUrl || "", // Ensure image is string
        price: Number(values.price), // Ensure number
        experience: Number(values.experience),
        updatedAt: serverTimestamp(),
      };

      if (editingDoctor?.id) {
        // Update existing
        await updateDoc(doc(firestore, 'doctors', editingDoctor.id), doctorData);
        toast({ title: "تم التحديث", description: "تم تعديل بيانات الطبيب بنجاح." });
      } else {
        // Create new
        await addDoc(collection(firestore, 'doctors'), {
          ...doctorData,
          rating: 5, // Default rating
          reviews: 0,
          createdAt: serverTimestamp(),
        });
        toast({ title: "تم الحفظ", description: "تم إضافة الطبيب الجديد بنجاح." });
      }
    } catch (error) {
      console.error("Error saving doctor:", error);
      throw error; // Let the dialog handle the error state
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">إدارة الأطباء</h1>
          <p className="text-muted-foreground mt-1">إضافة وتعديل وحذف بيانات الأطباء.</p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleExcelUpload}
          />

          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Info className="h-4 w-4" />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] bg-card text-card-foreground border shadow-xl p-4" side="bottom">
                <div className="space-y-2">
                  <h4 className="font-bold text-sm text-primary">تعليمات ملف الإكسل</h4>
                  <p className="text-xs text-muted-foreground">يجب أن يحتوي الملف على الأعمدة التالية (بالعربي أو الإنجليزي):</p>
                  <ul className="text-xs list-disc list-inside space-y-1 mt-2">
                    <li><span className="font-semibold text-foreground">الاسم (Name)</span> <span className="text-red-500">*</span></li>
                    <li><span className="font-semibold text-foreground">التخصص (Specialty)</span> <span className="text-red-500">*</span></li>
                    <li><span className="font-semibold text-foreground">السعر (Price)</span> <span className="text-red-500">*</span></li>
                    <li>الخبرة (Experience)</li>
                    <li>الموقع (Location)</li>
                    <li>نبذة (About)</li>
                  </ul>
                  <p className="text-[10px] text-muted-foreground mt-2 border-t pt-2">
                    * الحقول المعلمة بـ <span className="text-red-500">*</span> إجبارية.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="shadow-sm">
            <UploadCloud className="ml-2 h-5 w-5" />
            استيراد إكسل
          </Button>
          <Button onClick={handleAddDoctor} className="shadow-lg">
            <PlusCircle className="ml-2 h-5 w-5" />
            إضافة طبيب جديد
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <CardTitle>قائمة الأطباء ({doctors.length})</CardTitle>
              <CardDescription>جميع الأطباء المسجلين في النظام.</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو التخصص..."
                className="pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الطبيب</TableHead>
                <TableHead>التخصص</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>الخبرة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border">
                          <Image
                            src={doctor.image || "https://placehold.co/100x100/png?text=Dr"}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium">{doctor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{doctor.specialty}</span></TableCell>
                    <TableCell>{doctor.price} ر.س</TableCell>
                    <TableCell>{doctor.location || '-'}</TableCell>
                    <TableCell>{doctor.experience ? `${doctor.experience} سنوات` : '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditDoctor(doctor)} title="تعديل">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteClick(doctor)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {searchTerm ? 'لا توجد نتائج مطابقة للبحث.' : 'لا يوجد أطباء حالياً. ابدأ بإضافة طبيب جديد.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Doctor Form Dialog (Add/Edit) */}
      <DoctorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        doctorToEdit={editingDoctor}
        onSubmit={handleSaveDoctor}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!doctorToDelete} onOpenChange={() => setDoctorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الطبيب "{doctorToDelete?.name}" نهائياً من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Trash2 className="ml-2 h-4 w-4" />}
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
