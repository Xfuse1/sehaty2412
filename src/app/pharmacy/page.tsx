
"use client"

import { useState, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Camera, Bot, Star, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { productsData, Product } from "@/lib/products-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { savePrescriptionToAirtable } from '@/lib/airtable';


export default function PharmacyPage() {
  const whatsappLink = "https://wa.me/201000476674";
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [prescriptionText, setPrescriptionText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!user) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // Save to Airtable
      await savePrescriptionToAirtable(
        user.uid,
        user.displayName || 'Unknown User',
        imageUrl
      );

      // Save to Firestore for real-time updates
      await addDoc(collection(db, "prescriptions"), {
        userId: user.uid,
        patientName: user.displayName || 'Unknown User',
        imageUrl,
        text: prescriptionText,
        type: "pharmacy",
        status: "pending",
        createdAt: Timestamp.now(),
      });

      toast({
        title: "تم الرفع بنجاح",
        description: "تم استلام الروشتة وحفظها في قاعدة البيانات بنجاح.",
      });

      setPrescriptionText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading prescription:", error);
      toast({
        title: "فشل في رفع الروشتة",
        description: error.message || "حدث خطأ غير متوقع أثناء محاولة رفع الملف. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeTab === 'all' || product.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  const categories = {
    'all': 'الكل',
    'skin-care': 'العناية بالبشرة',
    'hair-care': 'العناية بالشعر',
    'baby-care': 'العناية بالطفل',
    'essentials': 'أساسيات'
  }

  return (
    <div className="bg-background text-foreground">
      <header className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4 bg-accent border-transparent text-primary font-semibold">
            الصيدلية الرقمية
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            عنايتك الكاملة تصلك لباب بيتك
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
            تصفح مجموعتنا المختارة من منتجات العناية واطلبها بسهولة عبر واتساب.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24 space-y-20">

        <section>
          <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-xl border-primary/20 rounded-[2.5rem]">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="text-3xl text-primary font-headline text-center">هل لديك روشتة؟ اطلبها فوراً</CardTitle>
              <CardDescription className="text-center text-lg mt-2">
                صوّر الروشتة أو اكتب طلبك، وسنتواصل معك عبر واتساب للتوصيل.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      ref={fileInputRef}
                      className="hidden"
                      id="prescription-upload"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full h-56 flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-dashed border-2 border-primary/20 group-hover:border-primary/50 transition-all bg-primary/5 hover:bg-white hover:shadow-xl group"
                      disabled={isUploading || !user}
                    >
                      {isUploading ? (
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                      ) : (
                        <Camera className="w-10 h-10 text-primary" />
                      )}
                      <span className="text-lg font-medium">{isUploading ? "جاري التحميل..." : "اضغط لتحميل أو تصوير الروشتة"}</span>
                    </Button>
                  </div>
                  {!user && (
                    <div className="text-sm text-muted-foreground text-center bg-muted/50 p-3 rounded-xl border border-dashed">
                      يرجى <Link href="/login" className="text-primary font-bold hover:underline">تسجيل الدخول</Link> لتتمكن من تحميل الروشتة
                    </div>
                  )}
                </div>

                <div className="space-y-6 flex flex-col h-full">
                  <div className="space-y-2 flex-grow">
                    <label className="text-sm font-bold text-muted-foreground pr-2">وصف إضافي (اختياري)</label>
                    <Textarea
                      placeholder="أو اكتب اسم الدواء والكمية المطلوبة هنا..."
                      value={prescriptionText}
                      onChange={(e) => setPrescriptionText(e.target.value)}
                      className="min-h-[160px] rounded-2xl resize-none text-right bg-muted/30 focus:bg-background"
                      disabled={isUploading || !user}
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-muted-foreground text-center">بمجرد التحميل، سيتم حفظ طلبك وسيتاح للصيدلي مراجعته.</p>
                    <Button asChild size="lg" className="w-full text-xl h-16 rounded-[1.5rem] medical-gradient shadow-lg">
                      <Link href={`${whatsappLink}?text=${encodeURIComponent(`مرحباً، لدي طلب من الصيدلية: ${prescriptionText}`)}`} target="_blank">
                        <Bot className="ml-3 h-6 w-6" />
                        تواصل مع الصيدلي الآن
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-12 space-y-6">
            <div className="relative max-w-2xl mx-auto">
              <Input
                placeholder="ابحث عن منتج..."
                className="pl-10 h-12 text-base"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-2xl mx-auto h-auto">
                {Object.entries(categories).map(([key, value]) => (
                  <TabsTrigger key={key} value={key} className="text-base h-10">{value}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative w-full h-48 bg-card flex items-center justify-center">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="transition-transform duration-300 group-hover:scale-110 p-4"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <CardTitle className="text-lg font-semibold mb-2 h-12">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mb-3 h-20 overflow-hidden">{product.description}</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">{product.rating}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex-col items-start gap-4">
                  <p className="text-primary font-bold text-xl">{product.price.toFixed(2)} ر.س</p>
                  <Button asChild className="w-full" variant="secondary">
                    <Link href={`${whatsappLink}?text=${encodeURIComponent(`أرغب في طلب منتج: ${product.name}`)}`} target="_blank">
                      اطلب الآن عبر واتساب
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="text-center text-muted-foreground py-16 col-span-full">
                <p className="text-lg">لا توجد منتجات تطابق بحثك الحالي.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div >
  );
}
