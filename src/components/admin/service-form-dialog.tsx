
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
import { Loader2, UploadCloud, Plus, Trash } from "lucide-react";
import { ServicePackage } from "@/types";
import Image from "next/image";

const formSchema = z.object({
    title: z.string().min(2, "العنوان مطلوب"),
    description: z.string().min(5, "الوصف مطلوب"),
    price: z.coerce.number().min(0, "السعر يجب أن يكون رقماً موجباً"),
    image: z.string().optional(),
    features: z.string().optional(), // We'll parse this from newline separated string
});

interface ServiceFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serviceToEdit?: ServicePackage | null;
    category: string;
    categoryName: string;
    onSubmit: (values: Partial<ServicePackage>, imageFile?: File) => Promise<void>;
}

export function ServiceFormDialog({ open, onOpenChange, serviceToEdit, category, categoryName, onSubmit }: ServiceFormDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            image: "",
            features: "",
        },
    });

    useEffect(() => {
        if (serviceToEdit) {
            form.reset({
                title: serviceToEdit.title,
                description: serviceToEdit.description,
                price: serviceToEdit.price,
                image: serviceToEdit.image || "",
                features: serviceToEdit.features?.join('\n') || "",
            });
            setPreviewUrl(serviceToEdit.image || null);
        } else {
            form.reset({
                title: "",
                description: "",
                price: 0,
                image: "",
                features: "",
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
    }, [serviceToEdit, form, open]);

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
            // Convert features string to array
            const featuresArray = values.features?.split('\n').filter(line => line.trim() !== "") || [];

            const finalValues = {
                ...values,
                features: featuresArray as any, // Cast to avoid TS issues with the schema mismatch temp hack
            };

            await onSubmit(finalValues as any, selectedFile || undefined);
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
                    <DialogTitle>{serviceToEdit ? "تعديل الخدمة" : "إضافة خدمة جديدة"}</DialogTitle>
                    <DialogDescription>
                        إدارة بيانات خدمة قسم {categoryName}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">

                        {/* Image Upload */}
                        <div className="flex flex-col items-center gap-4 mb-4">
                            <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 group hover:border-primary transition-colors cursor-pointer"
                                onClick={() => document.getElementById('service-image-input')?.click()}
                            >
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-muted-foreground">
                                        <UploadCloud className="h-10 w-10 mb-2 group-hover:text-primary" />
                                        <span className="text-xs">اضغط لرفع صورة توضيحية</span>
                                    </div>
                                )}
                            </div>
                            <Input
                                id="service-image-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>عنوان الخدمة / الباقة</FormLabel>
                                    <FormControl><Input placeholder="مثال: جلسة علاج طبيعي منزلي" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>السعر (ر.س)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>وصف الخدمة</FormLabel>
                                    <FormControl><Textarea placeholder="وصف تفصيلي للخدمة..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="features"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>المميزات (اختياري)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="اكتب كل ميزة في سطر منفصل..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">افصل بين المميزات بسطر جديد.</p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-6 pt-4 border-t gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>إلغاء</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {serviceToEdit ? "حفظ التعديلات" : "إضافة الخدمة"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
