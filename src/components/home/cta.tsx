import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/fade-in';
import { Rocket, CalendarCheck, PhoneCall } from 'lucide-react';

export default function Cta() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 medical-gradient opacity-90" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

      {/* Decorative Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl animate-float-slow" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto glass p-12 md:p-20 rounded-[4rem] border-white/30 shadow-[0_40px_100px_rgba(0,0,0,0.2)] text-center space-y-10 group">
          <FadeIn>
            <div className="inline-flex p-5 rounded-[2rem] bg-white/20 mb-6 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <Rocket className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl md:text-7xl font-bold font-headline text-white leading-tight">
              ابدأ رحلتك نحو <span className="underline decoration-secondary decoration-wavy underline-offset-8">صحة أفضل</span> اليوم
            </h2>
            <p className="mt-8 text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              انضم إلى آلاف العائلات التي تضع ثقتها فينا. فريقنا الطبي المتميز بانتظارك لتقديم الرعاية التي تليق بك.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-[2rem] px-12 py-10 text-2xl font-bold shadow-2xl hover:scale-105 transition-all duration-300">
                <Link href="/new-booking" className="flex items-center gap-4">
                  <CalendarCheck className="w-8 h-8" />
                  <span>احجز استشارتك الآن</span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-[2rem] px-12 py-10 text-2xl font-bold backdrop-blur-sm transition-all duration-300">
                <Link href="/contact" className="flex items-center gap-4">
                  <PhoneCall className="w-8 h-8" />
                  <span>تواصل مع الدعم</span>
                </Link>
              </Button>
            </div>
          </FadeIn>

          <div className="pt-10 flex items-center justify-center gap-3 text-white/70">
            <div className="flex -space-x-2 space-x-reverse">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">انضم إلى أكثر من 10,000 عميل يثقون في خدماتنا</p>
          </div>
        </div>
      </div>
    </section>
  );
}
