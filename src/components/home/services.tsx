
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Stethoscope, Pill, Microscope, HeartPulse, ShieldPlus, UserPlus } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';
import { motion } from 'framer-motion';

const services = [
  {
    title: "العيادات التخصصية",
    description: "استشارات طبية مع نخبة من الاستشاريين في مختلف التخصصات.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60",
    href: "/specialized-clinics",
    icon: Stethoscope,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "صيدلية أونلاين",
    description: "اطلب أدويتك ومستحضرات التجميل وتوصلك لحد باب البيت.",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=60",
    href: "/pharmacy",
    icon: Pill,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "مختبر التحاليل",
    description: "باقات تحاليل شاملة وفحوصات دورية بأحدث الأجهزة.",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=60",
    href: "/lab-services",
    icon: Microscope,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "العلاج الطبيعي",
    description: "برامج تأهيلية وعلاج طبيعي منزلي أو في المركز.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
    href: "/physiotherapy",
    icon: HeartPulse,
    color: "bg-rose-100 text-rose-600",
  },
  {
    title: "الرعاية التمريضية",
    description: "خدمات تمريض منزلية من قبل ممرضين وممرضات مرخصين.",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=60",
    href: "/nursing-care",
    icon: ShieldPlus,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    title: "زيارة منزلية",
    description: "طبيبك يجيلك لحد البيت للكشف والتشخيص.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&auto=format&fit=crop&q=80",
    href: "/home-visit",
    icon: UserPlus,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 bg-muted/40 relative overflow-hidden">
      {/* Background Bio-Shapes */}
      <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full medical-gradient-soft text-primary font-bold text-sm tracking-wide uppercase mb-4 shadow-sm border border-primary/10">
              <HeartPulse className="w-4 h-4" />
              <span>رعاية صحية بلا حدود</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight">
              خدمات طبية <span className="text-primary italic">بمعايير عالمية</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              نحن هنا لنقدم لك تجربة صحية فريدة تجمع بين الخبرة الطبية العريقة وأحدث التقنيات الرقمية، لتوفير رعاية متكاملة لك ولأحبائك.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative h-full rounded-[2.5rem] overflow-hidden bg-card border border-border/10 shadow-lg hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500"
              >
                <Link href={service.href}>
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity duration-700" />
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />

                    {/* Icon Badge Overlay */}
                    <div className={`absolute top-6 right-6 z-20 p-4 rounded-2xl glass shadow-2xl transition-transform duration-500 group-hover:rotate-12`}>
                      <service.icon size={28} className="text-primary font-bold" />
                    </div>

                    {/* Service Name Overlay */}
                    <div className="absolute bottom-6 right-6 z-20">
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-8 space-y-4">
                    <p className="text-lg text-muted-foreground/90 leading-relaxed h-20 overflow-hidden line-clamp-3">
                      {service.description}
                    </p>

                    <div className="pt-4 flex items-center justify-between border-t border-border/50">
                      <div className="inline-flex items-center gap-2 text-primary font-bold text-lg group/btn">
                        <span>احجز موعد الآن</span>
                        <ArrowLeft size={20} className="mr-2 group-hover/btn:translate-x-[-8px] transition-transform duration-300" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        <ShieldPlus size={18} />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Decorative background glow on hover */}
                <div className="absolute -inset-1 medical-gradient opacity-0 group-hover:opacity-[0.03] transition-opacity blur-2xl pointer-events-none" />
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4} className="mt-20 text-center">
          <Button asChild size="lg" className="rounded-full px-12 py-8 text-xl medical-gradient shadow-xl hover:shadow-primary/30 transition-all hover:scale-105">
            <Link href="/services" className="flex items-center gap-3">
              <span>استكشف كافة خدماتنا</span>
              <ArrowLeft size={20} />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
