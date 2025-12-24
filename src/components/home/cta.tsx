import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/fade-in';
import { Rocket, CalendarCheck, PhoneCall, Sparkles } from 'lucide-react';

export default function Cta() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#0ea5e9]/5 rounded-[100%] blur-[120px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#14b8a6]/10 rounded-full blur-[100px] animate-pulse-subtle" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#0ea5e9]/10 rounded-full blur-[100px] animate-float" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-[3rem] p-8 md:p-16 overflow-hidden relative border-white/40 shadow-2xl">
            {/* Inner background pattern */}
            <div className="absolute inset-0 bg-[#0ea5e9] opacity-[0.85] z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-[1]" />

            <div className="relative z-10 text-center space-y-8">
              <FadeIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>انضم إلينا اليوم</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline text-white leading-[1.3]">
                  ابدأ رحلتك نحو <br className="md:hidden" />
                  <span className="bg-white/10 px-4 py-1 rounded-2xl border border-white/20 whitespace-nowrap">صحة أفضل</span> اليوم
                </h2>

                <p className="mt-6 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                  انضم إلى آلاف العائلات التي تضع ثقتها في فريقنا الطبي المتميز. نحن هنا لنقدم لك الرعاية التي تستحقها بأحدث التقنيات.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 md:gap-6 pt-6">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-white text-[#0ea5e9] hover:bg-slate-50 rounded-2xl px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                    <Link href="/new-booking" className="flex items-center justify-center gap-3">
                      <CalendarCheck className="w-6 h-6" />
                      <span>احجز استشارتك الآن</span>
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-2 border-white/50 text-white hover:bg-white/20 rounded-2xl px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold backdrop-blur-sm transition-all duration-300">
                    <Link href="/contact" className="flex items-center justify-center gap-3">
                      <PhoneCall className="w-6 h-6" />
                      <span>تواصل مع الدعم</span>
                    </Link>
                  </Button>
                </div>
              </FadeIn>

              <div className="pt-10 flex flex-col md:flex-row items-center justify-center gap-4 text-white/80 border-t border-white/10 mt-12">
                <div className="flex -space-x-3 space-x-reverse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/10 overflow-hidden shadow-inner">
                      <img src={`https://i.pravatar.cc/100?u=medical${i}`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-sm md:text-base font-medium">نحن نخدم أكثر من <span className="text-white font-bold">10,000</span> عميل راضٍ عن خدماتنا</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
