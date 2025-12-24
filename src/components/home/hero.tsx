
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useUser } from '@/firebase';
import { useSiteSettings } from '@/providers/site-settings-provider';
import { FadeIn } from '@/components/animations/fade-in';
import { motion } from 'framer-motion';

export default function Hero() {
    const { user } = useUser();
    const { settings, isLoading } = useSiteSettings();

    // The generated image path from the previous step
    const heroImage = "/medical_hero_doctor_smiling.png";

    return (
        <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-background pt-16 md:pt-20">
            {/* Dynamic Medical Background Elements */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[10%] right-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/10 rounded-full blur-3xl md:blur-[120px] animate-pulse-subtle" />
                <div className="absolute bottom-[10%] left-[10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-secondary/10 rounded-full blur-3xl md:blur-[100px] animate-float-slow" />

                {/* SVG Medical Pattern */}
                <svg className="absolute top-0 right-0 opacity-[0.03] dark:opacity-[0.05]" width="600" height="600" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" />
                    <path d="M50 20V80M20 50H80" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>

            <div className="container relative z-10 mx-auto px-4 grid md:grid-cols-2 gap-12 items-center py-12 md:py-28">
                <div className="text-center md:text-right space-y-8 order-2 md:order-1">
                    <FadeIn delay={0.1} direction="up">
                        <div className="inline-flex items-center gap-2 glass-pill mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
                            <span className="text-sm font-medium text-secondary-foreground">رعاية صحية ذكية وموثوقة</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-headline leading-[1.2] tracking-tight">
                            <span className="text-foreground">صحتك هي </span>
                            <span className="text-medical-gradient">كنزك الأغلى</span>
                            <br />
                            <span className="text-primary">{isLoading ? '...' : (settings.hero?.title || 'نعتني بك أينما كنت')}</span>
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.3} direction="up">
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                            {isLoading ? '...' : (settings.hero?.subtitle || 'مجموعة متكاملة من الخدمات الطبية المتميزة، تصلك إلى باب بيتك أو في مراكزنا المتخصصة بأعلى معايير الجودة.')}
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.5} direction="up">
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 md:gap-6 pt-4">
                            <Button asChild size="lg" className="w-full sm:w-auto medical-gradient rounded-2xl px-8 md:px-10 py-6 md:py-8 text-lg md:text-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-500 group">
                                <Link href="/#services" className="flex items-center gap-3">
                                    <span>ابدأ الآن</span>
                                    <svg className="w-5 h-5 md:w-6 md:h-6 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="ghost" className="w-full sm:w-auto rounded-2xl px-6 md:px-8 py-6 md:py-8 text-lg md:text-xl hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-border">
                                <Link href="/about">اكتشف خدماتنا</Link>
                            </Button>
                        </div>
                    </FadeIn>

                    {/* Trust Indicators */}
                    <FadeIn delay={0.7} direction="up">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-8 pt-6 border-t border-border/50">
                            <div>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">+50</p>
                                <p className="text-xs md:text-sm text-muted-foreground">طبيب مختص</p>
                            </div>
                            <div className="hidden sm:block w-px h-10 bg-border/50" />
                            <div>
                                <p className="text-2xl md:text-3xl font-bold text-foreground">+10k</p>
                                <p className="text-xs md:text-sm text-muted-foreground">مريض سعيد</p>
                            </div>
                            <div className="hidden sm:block w-px h-10 bg-border/50" />
                            <div className="flex -space-x-3 space-x-reverse">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                </div>

                <div className="relative order-1 md:order-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        <div className="relative aspect-square md:aspect-auto md:h-[700px] w-full max-w-2xl mx-auto md:mx-0">
                            {/* Decorative Elements around image */}
                            <div className="absolute inset-0 medical-gradient rounded-[3rem] rotate-3 opacity-10 blur-xl" />
                            <div className="absolute inset-0 border-2 border-primary/20 rounded-[3rem] -rotate-3" />

                            <motion.div
                                className="relative h-full w-full rounded-[3.5rem] overflow-hidden shadow-2xl z-10 animate-float"
                                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Image
                                    src={heroImage}
                                    alt="Medical Specialist"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className="scale-105"
                                    priority
                                />
                            </motion.div>

                            {/* Floating Glass Stats */}
                            <motion.div
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1, duration: 0.8 }}
                                className="absolute -right-2 md:-right-8 top-[15%] md:top-[15%] glass p-2 md:p-5 rounded-xl md:rounded-[2rem] z-20 flex items-center gap-2 md:gap-4 animate-float-slow"
                            >
                                <div className="p-1.5 md:p-3 bg-secondary/10 rounded-lg md:rounded-2xl text-secondary">
                                    <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                                </div>
                                <div className="whitespace-nowrap">
                                    <p className="text-[8px] md:text-xs text-muted-foreground">رعاية قلبية</p>
                                    <p className="text-[10px] md:text-lg font-bold">موثوقة 100%</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.3, duration: 0.8 }}
                                className="absolute -left-2 md:-left-12 bottom-[20%] md:bottom-[20%] glass p-2 md:p-5 rounded-xl md:rounded-[2rem] z-20 flex items-center gap-2 md:gap-4 animate-float"
                            >
                                <div className="p-1.5 md:p-3 bg-primary/10 rounded-lg md:rounded-2xl text-primary">
                                    <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                </div>
                                <div className="whitespace-nowrap">
                                    <p className="text-[8px] md:text-xs text-muted-foreground">معدل الاستجابة</p>
                                    <p className="text-[10px] md:text-lg font-bold">فوري وسريع</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
