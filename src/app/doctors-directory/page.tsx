
"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Stethoscope, Briefcase, DollarSign, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, query, orderBy, limit, startAfter, getDocs, where, Query, DocumentSnapshot } from 'firebase/firestore';
import { Doctor } from '@/types';
import { FadeIn } from '@/components/animations/fade-in';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 9;

export default function DoctorsDirectoryPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

    // Initial Fetch
    const fetchDoctors = useCallback(async (isLoadMore = false) => {
        if (!firestore) return;

        try {
            if (!isLoadMore) setIsLoading(true);
            else setLoadingMore(true);

            let q: Query = collection(firestore, 'doctors');

            // Note: Compound queries in Firestore require indexes. 
            // For simplicity and speed without complex indexing setup errors, 
            // we will fetch by creation date and filter client side for Search Text,
            // but we CAN filter by Specialty server side if we index it.
            // Let's stick to client side filtering for small datasets (< 500 docs) as it's blazing fast
            // and provides better UX for search (partial match).
            // Once scaling, we would use Algolia or Typesense.

            // Ensure rapid loading without complex index requirements
            q = query(q, orderBy('rating', 'desc'));

            if (isLoadMore && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            q = query(q, limit(ITEMS_PER_PAGE));

            const snapshot = await getDocs(q);
            const fetchedDoctors = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Doctor[];

            if (snapshot.docs.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

            if (isLoadMore) {
                setDoctors(prev => [...prev, ...fetchedDoctors]);
            } else {
                setDoctors(fetchedDoctors);
            }

        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast({ variant: "destructive", title: "خطأ", description: "فشل تحميل الأطباء." });
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    }, [firestore, lastDoc, toast]);


    useEffect(() => {
        fetchDoctors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firestore]); // Only on mount

    const handleBooking = (doctor: Doctor) => {
        if (!user) {
            toast({
                title: "تنبيه",
                description: "يجب عليك تسجيل الدخول أولاً لحجز موعد.",
            });
            router.push('/login');
            return;
        }
        const doctorData = encodeURIComponent(JSON.stringify(doctor));
        router.push(`/booking?doctor=${doctorData}`);
    };

    // Client-side filtering wrapper (Blazing fast for < 1000 items)
    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    // Extract unique specialties for filter dropdown
    const specialties = Array.from(new Set(doctors.map(d => d.specialty))).filter(Boolean);

    return (
        <div className="min-h-screen bg-muted/10 pb-20">
            {/* Header Section */}
            <header className="bg-primary/5 pt-24 pb-16 px-4 mb-12">
                <div className="container mx-auto max-w-4xl text-center">
                    <FadeIn>
                        <Badge variant="outline" className="mb-4 bg-background px-4 py-1 text-primary border-primary/20">
                            نخبة الأطباء
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground mb-6">
                            ابحث عن طبيبك المفضل
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            قائمة بأفضل الاستشاريين والأخصائيين جاهزون لخدمتك. احجز موعدك الآن بكل سهولة.
                        </p>
                    </FadeIn>

                    {/* Modern Premium Search & Filter Bar */}
                    <FadeIn delay={0.2}>
                        <div className="relative mt-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/20 ring-1 ring-black/5"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                    {/* Name/Keywords Search */}
                                    <div className="relative md:col-span-5">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                            <Search className="text-primary h-5 w-5" />
                                            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                        <Input
                                            className="pr-14 h-14 text-lg border-none shadow-none bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/60 rounded-xl"
                                            placeholder="اسم الطبيب أو كلمة مفتاحية..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    {/* Specialty Selection */}
                                    <div className="relative md:col-span-4 border-r border-gray-100 dark:border-gray-800 pr-2">
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
                                            <Stethoscope className="text-primary/70 h-5 w-5" />
                                            <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-700" />
                                        </div>
                                        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                                            <SelectTrigger className="h-14 border-none shadow-none bg-transparent focus:ring-0 pr-14 pl-4 text-base rounded-xl">
                                                <SelectValue placeholder="اختر التخصص" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-white/20 backdrop-blur-lg">
                                                <SelectItem value="all" className="rounded-lg">جميع التخصصات</SelectItem>
                                                {specialties.map(s => (
                                                    <SelectItem key={s} value={s} className="rounded-lg">{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Search Button */}
                                    <div className="md:col-span-3 px-1">
                                        <Button
                                            className="w-full h-12 md:h-12 font-bold text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group transition-all duration-300 overflow-hidden relative"
                                            onClick={() => { }}
                                        >
                                            <motion.span
                                                className="flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
                                            >
                                                استكشف الآن
                                                <Search className="h-4 w-4" />
                                            </motion.span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Quick Stats/Badges beneath search */}
                            <div className="flex flex-wrap justify-center gap-4 mt-6">
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                    أفضل التقييمات
                                </span>
                                <div className="w-1 h-1 rounded-full bg-gray-300 mt-2" />
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                                    أقرب العيادات
                                </span>
                                <div className="w-1 h-1 rounded-full bg-gray-300 mt-2" />
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 text-primary">
                                    {filteredDoctors.length} طبيب متاح
                                </span>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </header>

            {/* Doctors Grid */}
            <main className="container mx-auto px-4">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="h-[400px] bg-muted/20 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDoctors.map((doctor, idx) => (
                            <FadeIn key={doctor.id} delay={idx * 0.05} className="h-full">
                                <motion.div whileHover={{ y: -5 }} className="h-full">
                                    <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
                                        <div className="relative h-64 w-full bg-muted overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                                            <Image
                                                src={doctor.image || "https://placehold.co/400x400/png?text=Doctor"}
                                                alt={doctor.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <Badge className="absolute top-4 right-4 z-20 bg-white/90 text-foreground hover:bg-white border-0 backdrop-blur-sm shadow-sm">
                                                {doctor.specialty}
                                            </Badge>
                                            <div className="absolute bottom-4 right-4 z-20 text-white">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="font-bold">{doctor.rating || 5.0}</span>
                                                </div>
                                                <h3 className="font-bold text-xl">{doctor.name}</h3>
                                            </div>
                                        </div>

                                        <CardContent className="p-6 flex-grow space-y-4">
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span>{doctor.location || "غير محدد"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <Briefcase className="h-4 w-4 text-primary" />
                                                <span>{doctor.experience ? `${doctor.experience} سنوات خبرة` : "خبرة واسعة"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <DollarSign className="h-4 w-4 text-primary" />
                                                <span>سعر الكشف: <span className="font-bold text-foreground">{doctor.price} ر.س</span></span>
                                            </div>

                                            {doctor.about && (
                                                <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                                                    {doctor.about}
                                                </p>
                                            )}
                                        </CardContent>

                                        <CardFooter className="p-6 pt-0">
                                            <Button className="w-full h-12 text-lg shadow-lg hover:shadow-primary/25 rounded-xl" onClick={() => handleBooking(doctor)}>
                                                احجز موعد
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            </FadeIn>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Stethoscope className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">لا توجد نتائج</h3>
                        <p className="text-muted-foreground">جرب البحث بكلمات مختلفة أو تغيير التخصص.</p>
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && !searchTerm && (
                    <div className="flex justify-center mt-12">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => fetchDoctors(true)}
                            disabled={loadingMore}
                            className="px-8 rounded-full"
                        >
                            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            عرض المزيد من الأطباء
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
