
'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, PlusCircle, Trash2, Edit, Search, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
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
import { ServicePackage } from '@/types';
import { useRouter, useParams } from 'next/navigation';
import { ServiceFormDialog } from '@/components/admin/service-form-dialog';
import Link from 'next/link';

const CATEGORY_MAP: Record<string, { label: string, collection: string }> = {
    'physiotherapy': { label: 'العلاج الطبيعي', collection: 'physiotherapy_packages' },
    'nursing': { label: 'الرعاية التمريضية', collection: 'nursing_packages' },
    'lab-tests': { label: 'التحاليل الطبية', collection: 'lab_packages' },
    'surgeries': { label: 'العمليات', collection: 'surgery_packages' },
};

export default function GenericServicePage() {
    const { isAdmin, isLoading: authLoading } = useAdmin();
    const { toast } = useToast();
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();

    // Ensure category is a string
    const category = Array.isArray(params.category) ? params.category[0] : params.category;
    const categoryConfig = CATEGORY_MAP[category || ''] || null;

    const [services, setServices] = useState<ServicePackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Dialog States
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServicePackage | null>(null);

    // Delete States
    const [serviceToDelete, setServiceToDelete] = useState<ServicePackage | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
            return;
        }

        if (!categoryConfig || !firestore) {
            setIsLoading(false);
            return;
        }

        const q = query(collection(firestore, categoryConfig.collection), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedServices: ServicePackage[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ServicePackage[];
            setServices(fetchedServices);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching services:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, isAdmin, authLoading, router, categoryConfig]);


    const handleAddService = () => {
        setEditingService(null);
        setIsDialogOpen(true);
    };

    const handleEditService = (service: ServicePackage) => {
        setEditingService(service);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (service: ServicePackage) => {
        setServiceToDelete(service);
    };

    const confirmDelete = async () => {
        if (!serviceToDelete?.id || !categoryConfig) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(firestore, categoryConfig.collection, serviceToDelete.id));
            toast({ title: "تم الحذف", description: "تم حذف الخدمة بنجاح" });
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء الحذف." });
        } finally {
            setIsDeleting(false);
            setServiceToDelete(null);
        }
    };

    const handleSaveService = async (values: Partial<ServicePackage>, imageFile?: File) => {
        if (!categoryConfig) return;
        try {
            let imageUrl = values.image;

            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            }

            const serviceData = {
                ...values,
                image: imageUrl || "",
                price: Number(values.price),
                category: category as any, // Store category tag
                updatedAt: serverTimestamp(),
            };

            if (editingService?.id) {
                await updateDoc(doc(firestore, categoryConfig.collection, editingService.id), serviceData);
                toast({ title: "تم التحديث", description: "تم تعديل بيانات الخدمة بنجاح." });
            } else {
                await addDoc(collection(firestore, categoryConfig.collection), {
                    ...serviceData,
                    createdAt: serverTimestamp(),
                });
                toast({ title: "تم الحفظ", description: "تم إضافة الخدمة الجديدة بنجاح." });
            }
        } catch (error) {
            console.error("Error saving service:", error);
            throw error;
        }
    };

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || isLoading) {
        return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (!isAdmin || !categoryConfig) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold text-destructive">قسم غير موجود أو غير مصرّح به</h1>
                <Button asChild className="mt-4"><Link href="/admin/dashboard">عودة للوحة التحكم</Link></Button>
            </div>
        );
    };

    return (
        <div className="container mx-auto py-12 px-4">

            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
                <Link href="/admin/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link>
                <span>/</span>
                <span className="text-foreground font-medium">{categoryConfig.label}</span>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-primary">إدارة {categoryConfig.label}</h1>
                    <p className="text-muted-foreground mt-1">إضافة وتعديل الخدمات والباقات لقسم {categoryConfig.label}.</p>
                </div>
                <Button onClick={handleAddService} className="shadow-lg">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إضافة خدمة جديدة
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle>قائمة الخدمات ({services.length})</CardTitle>
                            <CardDescription>الخدمات المتاحة حالياً في التطبيق.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="بحث بالعنوان..."
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
                                <TableHead>الصورة</TableHead>
                                <TableHead>عنوان الخدمة</TableHead>
                                <TableHead>السعر</TableHead>
                                <TableHead>الوصف المختصر</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted">
                                                <Image
                                                    src={service.image || "https://placehold.co/100x100/png?text=Service"}
                                                    alt={service.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{service.title}</TableCell>
                                        <TableCell>{service.price} ر.س</TableCell>
                                        <TableCell className="max-w-xs truncate text-muted-foreground" title={service.description}>
                                            {service.description}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEditService(service)} title="تعديل">
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="border-red-200 hover:bg-red-50"
                                                    onClick={() => handleDeleteClick(service)}
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
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        {searchTerm ? 'لا توجد نتائج.' : 'لا توجد خدمات مضافة. ابدأ بإضافة خدمة جديدة.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ServiceFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                serviceToEdit={editingService}
                category={category || ''}
                categoryName={categoryConfig.label}
                onSubmit={handleSaveService}
            />

            <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>حذف الخدمة؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            سيتم حذف "{serviceToDelete?.title}" نهائياً.
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
