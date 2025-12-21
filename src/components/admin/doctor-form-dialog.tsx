
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Doctor } from "@/types";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

const formSchema = z.object({
    name: z.string().min(2, "الاسم مطلوب"),
    specialty: z.string().min(2, "التخصص مطلوب"),
    price: z.coerce.number().min(0, "السعر يجب أن يكون رقماً موجباً"),
    experience: z.coerce.number().min(0).optional(),
    about: z.string().optional(),
    location: z.string().optional(),
    image: z.string().optional(),
});

interface DoctorFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    doctorToEdit?: Doctor | null;
    onSubmit: (values: Partial<Doctor>, imageFile?: File) => Promise<void>;
}

export function DoctorFormDialog({ open, onOpenChange, doctorToEdit, onSubmit }: DoctorFormDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            specialty: "",
            price: 0,
            experience: 0,
            about: "",
            location: "",
            image: "",
        },
    });

    useEffect(() => {
        if (doctorToEdit) {
            form.reset({
                name: doctorToEdit.name,
                specialty: doctorToEdit.specialty,
                price: doctorToEdit.price,
                experience: doctorToEdit.experience || 0,
                about: doctorToEdit.about || "",
                location: doctorToEdit.location || "",
                image: doctorToEdit.image || "",
            });
            setPreviewUrl(doctorToEdit.image);
        } else {
            form.reset({
                name: "",
                specialty: "",
                price: 0,
                experience: 0,
                about: "",
                location: "",
                image: "",
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
    }, [doctorToEdit, form, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            await onSubmit(values, selectedFile || undefined);
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{doctorToEdit ? "تعديل بيانات الطبيب" : "إضافة طبيب جديد"}</DialogTitle>
                    <DialogDescription>
                        {doctorToEdit ? "قم بتعديل البيانات ثم اضغط حفظ للتحديث." : "أدخل بيانات الطبيب الجديد لإضافته للقائمة."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">

                        {/* Image Upload */}
                        <div className="flex flex-col items-center gap-4 mb-4">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group hover:border-primary transition-colors cursor-pointer"
                                onClick={() => document.getElementById('doctor-image-input')?.click()}
                            >
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <UploadCloud className="text-muted-foreground group-hover:text-primary" />
                                )}
                            </div>
                            <Input
                                id="doctor-image-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('doctor-image-input')?.click()}>
                                {previewUrl ? "تغيير الصورة" : "رفع صورة"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>اسم الطبيب</FormLabel>
                                        <FormControl><Input placeholder="د. محمد أحمد" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="specialty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>التخصص</FormLabel>
                                        <FormControl><Input placeholder="مثال: باطنة، أطفال..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>سعر الكشف (ج.م)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>سنوات الخبرة</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الموقع / العيادة</FormLabel>
                                    <FormControl><Input placeholder="مثال: المعادي، القاهرة" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="about"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>نبذة عن الطبيب</FormLabel>
                                    <FormControl><Textarea placeholder="اكتب نبذة مختصرة..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-6 pt-4 border-t gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {doctorToEdit ? "حفظ التعديلات" : "إضافة الطبيب"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
