
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

    return (
        <section className="relative w-full overflow-hidden bg-background">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50"
                />
                <motion.div
                    animate={{
                        x: [0, -70, 0],
                        y: [0, 100, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
                    className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl opacity-40"
                />
            </div>

            <div className="container relative z-10 mx-auto grid md:grid-cols-2 gap-8 items-center py-20 md:py-32">
                <div className="text-center md:text-right order-2 md:order-1">
                    <FadeIn delay={0.1} direction="up">
                        <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary leading-tight">
                            {isLoading ? '...' : settings.hero?.title}
                        </h1>
                    </FadeIn>

                    <FadeIn delay={0.3} direction="up">
                        <p className="mt-6 text-xl md:text-2xl max-w-3xl mx-auto md:mx-0 text-muted-foreground leading-relaxed">
                            {isLoading ? '...' : settings.hero?.subtitle}
                        </p>
                    </FadeIn>

                    <FadeIn delay={0.5} direction="up">
                        <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
                            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 duration-300">
                                <Link href="/#services">
                                    ابدأ رحلتك
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-2 hover:bg-secondary/10 hover:text-primary transition-all duration-300">
                                <Link href="/about">من نحن؟</Link>
                            </Button>
                        </div>
                    </FadeIn>
                </div>

                <div className="relative h-[400px] md:h-[600px] order-1 md:order-2 flex items-center justify-center">
                    {/* Decorative Circle behind image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute inset-0 md:inset-x-10 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-2xl"
                    />

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative w-full h-full"
                    >
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full relative"
                        >
                            <Image
                                src={settings.hero?.imageUrl || "https://picsum.photos/seed/hero-doctor/1000/1000"}
                                alt="طبيبة مبتسمة"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="drop-shadow-2xl z-10"
                                priority
                            />
                        </motion.div>

                        {/* Floating Badges */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1, duration: 0.5 }}
                            className="absolute top-10 left-0 md:-left-10 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3 animate-float-slow"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">أطباء معتمدين</p>
                                <p className="text-sm font-bold">100% موثوق</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2, duration: 0.5 }}
                            className="absolute bottom-20 right-0 md:-right-5 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">خدمة 24/7</p>
                                <p className="text-sm font-bold">رعاية فورية</p>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
