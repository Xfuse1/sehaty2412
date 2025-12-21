
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SiteSettings } from '@/types';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useAdmin } from '@/hooks/use-admin';
import Image from 'next/image';

const defaultSettings: SiteSettings = {
    general: {
        siteName: 'صحتي',
        description: 'منصة الرعاية الصحية المتكاملة',
        logoUrl: '',
    },
    contact: {
        whatsapp: '',
        phone: '',
        email: '',
        facebookUrl: '',
        instagramUrl: '',
        location: '',
    },
    theme: {
        primaryColor: '#75A2C6',
        accentColor: '#A283B3',
    },
    hero: {
        title: 'رعاية صحية تثق بها، بين يديك',
        subtitle: 'نوفر لك الوصول السريع والموثوق للخدمات الصحية المتنوعة.',
        imageUrl: '',
    }
};

export default function SettingsPage() {
    const { isAdmin, isLoading: authLoading } = useAdmin();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();

    const { register, handleSubmit, setValue, watch, reset } = useForm<SiteSettings>({
        defaultValues: defaultSettings
    });

    const logoUrl = watch('general.logoUrl');
    const heroImageUrl = watch('hero.imageUrl');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(firestore, 'settings', 'general');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    reset(docSnap.data() as SiteSettings);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: "فشل تحميل الإعدادات الحالية."
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (isAdmin) {
            fetchSettings();
        }
    }, [firestore, reset, toast, isAdmin]);


    const onSubmit = async (data: SiteSettings) => {
        setIsSaving(true);
        try {
            await setDoc(doc(firestore, 'settings', 'general'), data);
            toast({
                title: "تم الحفظ",
                description: "تم تحديث إعدادات الموقع بنجاح.",
            });
            // Here you might want to trigger a global refresh or reload to apply theme changes immediately
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                variant: 'destructive',
                title: "خطأ",
                description: "فشل حفظ الإعدادات."
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldCheck: 'general.logoUrl' | 'hero.imageUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsSaving(true);
            const url = await uploadToCloudinary(file);
            setValue(fieldCheck, url, { shouldDirty: true });
            toast({ title: "تم الرفع", description: "تم رفع الصورة بنجاح." });
        } catch (error) {
            toast({ variant: 'destructive', title: "خطأ", description: "فشل رفع الصورة." });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!isAdmin) {
        return <div className="p-8 text-center text-destructive">غير مصرح لك بالوصول.</div>
    }

    return (
        <div className="container mx-auto py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-primary">إعدادات الموقع</h1>
                    <p className="text-muted-foreground mt-1">تحكم كامل في محتوى ومظهر الموقع.</p>
                </div>
                <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
                    {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                    حفظ التغييرات
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-8 w-full justify-start">
                    <TabsTrigger value="general">بيانات عامة</TabsTrigger>
                    <TabsTrigger value="contact">التواصل</TabsTrigger>
                    <TabsTrigger value="appearance">المظهر والألوان</TabsTrigger>
                    <TabsTrigger value="home">محتوى الرئيسية</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>بيانات الموقع الأساسية</CardTitle>
                            <CardDescription>اسم الموقع والشعار والوصف.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <Label>اسم الموقع</Label>
                                <Input {...register('general.siteName')} />
                            </div>
                            <div className="grid gap-4">
                                <Label>وصف الموقع (SEO)</Label>
                                <Textarea {...register('general.description')} />
                            </div>
                            <div className="grid gap-4">
                                <Label>شعار الموقع (Logo)</Label>
                                <div className="flex items-center gap-4">
                                    {logoUrl && (
                                        <div className="relative w-16 h-16 border rounded bg-muted">
                                            <Image src={logoUrl} alt="Logo" fill className="object-contain p-1" />
                                        </div>
                                    )}
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="logo" className="cursor-pointer bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 inline-flex items-center w-fit">
                                            <UploadCloud className="ml-2 h-4 w-4" />
                                            رفع شعار جديد
                                        </Label>
                                        <Input id="logo" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'general.logoUrl')} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contact Settings */}
                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle>بيانات التواصل</CardTitle>
                            <CardDescription>كيف يتواصل العملاء معك.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>رقم الواتساب (مع كود الدولة)</Label>
                                <Input {...register('contact.whatsapp')} placeholder="+201xxxxxxxxx" />
                            </div>
                            <div className="space-y-2">
                                <Label>رقم الهاتف</Label>
                                <Input {...register('contact.phone')} />
                            </div>
                            <div className="space-y-2">
                                <Label>البريد الإلكتروني</Label>
                                <Input {...register('contact.email')} />
                            </div>
                            <div className="space-y-2">
                                <Label>العنوان</Label>
                                <Input {...register('contact.location')} />
                            </div>
                            <div className="space-y-2">
                                <Label>رابط فيسبوك</Label>
                                <Input {...register('contact.facebookUrl')} />
                            </div>
                            <div className="space-y-2">
                                <Label>رابط انستجرام</Label>
                                <Input {...register('contact.instagramUrl')} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>ألوان الموقع</CardTitle>
                            <CardDescription>التحكم في الهوية البصرية.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label>اللون الأساسي (Primary)</Label>
                                    <div className="flex gap-2">
                                        <Input type="color" className="w-12 h-10 p-1" {...register('theme.primaryColor')} />
                                        <Input {...register('theme.primaryColor')} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">يستخدم في الأزرار والعناوين الرئيسية.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>اللون الثانوي (Accent)</Label>
                                    <div className="flex gap-2">
                                        <Input type="color" className="w-12 h-10 p-1" {...register('theme.accentColor')} />
                                        <Input {...register('theme.accentColor')} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">يستخدم في الخلفيات الفرعية والتفاصيل.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Home Content Settings */}
                <TabsContent value="home">
                    <Card>
                        <CardHeader>
                            <CardTitle>واجهة الصفحة الرئيسية</CardTitle>
                            <CardDescription>نصوص وصور قسم الـ Hero.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4">
                                <Label>العنوان الرئيسي (Headline)</Label>
                                <Input {...register('hero.title')} />
                            </div>
                            <div className="grid gap-4">
                                <Label>الوصف الفرعي (Subtitle)</Label>
                                <Textarea {...register('hero.subtitle')} />
                            </div>
                            <div className="grid gap-4">
                                <Label>صورة الـ Hero</Label>
                                <div className="flex flex-col gap-4">
                                    {heroImageUrl && (
                                        <div className="relative w-full h-48 border rounded bg-muted overflow-hidden">
                                            <Image src={heroImageUrl} alt="Hero" fill className="object-cover" />
                                        </div>
                                    )}
                                    <div className="grid w-full max-w-sm items-center gap-1.5">
                                        <Label htmlFor="heroImg" className="cursor-pointer bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 inline-flex items-center w-fit">
                                            <UploadCloud className="ml-2 h-4 w-4" />
                                            رفع صورة جديدة
                                        </Label>
                                        <Input id="heroImg" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'hero.imageUrl')} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
