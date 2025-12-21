
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
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <FadeIn>
            <Badge variant="outline" className="mb-4 px-4 py-1 text-primary border-primary/20 bg-primary/5">خدماتنا المتميزة</Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 text-foreground">
              كل ما تحتاجه لصحتك في مكان واحد
            </h2>
            <p className="text-lg text-muted-foreground">
              نقدم مجموعة متكاملة من الخدمات الطبية لتلبية احتياجاتك واحتياجات أسرتك بأعلى معايير الجودة.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 0.1}>
              <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link href={service.href}>
                  <Card className="group h-full overflow-hidden border-0 shadow-sm hover:shadow-2xl transition-all duration-300 bg-card rounded-2xl ring-1 ring-border/50 hover:ring-primary/20">
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                      <Image
                        src={service.image}
                        alt={service.title}
                        layout="fill"
                        objectFit="cover"
                        className="group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute top-4 right-4 z-20 p-3 rounded-xl ${service.color} shadow-lg`}>
                        <service.icon size={24} />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all duration-300">
                        <span>احجز الآن</span>
                        <ArrowLeft size={16} className="mr-1 group-hover:translate-x-[-4px] transition-transform" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4} className="mt-16 text-center">
          <Button asChild size="lg" variant="secondary" className="px-8 rounded-full">
            <Link href="/services">عرض جميع الخدمات</Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
