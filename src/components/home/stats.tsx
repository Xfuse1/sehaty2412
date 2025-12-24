import { Clock, Heart, Users, Award, TrendingUp, CheckCircle2, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/fade-in';

const stats = [
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    value: '24/7',
    label: 'رعاية على مدار الساعة',
    sub: 'دعم طبي فوري',
    gradient: 'from-primary/10 to-transparent'
  },
  {
    icon: <Heart className="h-10 w-10 text-rose-500" />,
    value: '+15k',
    label: 'قصة نجاح سعيدة',
    sub: 'مرضى راضون تماماً',
    gradient: 'from-rose-500/10 to-transparent'
  },
  {
    icon: <UserCheck className="h-10 w-10 text-secondary" />,
    value: '+75',
    label: 'طبيب مختص',
    sub: 'نخبة من الأطباء',
    gradient: 'from-secondary/10 to-transparent'
  },
  {
    icon: <TrendingUp className="h-10 w-10 text-blue-500" />,
    value: '+12',
    label: 'تخصص طبي',
    sub: 'تغطية شاملة',
    gradient: 'from-blue-500/10 to-transparent'
  },
];

export default function Stats() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border/50 text-sm font-bold text-muted-foreground mb-4">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>نحن نكبر بثقتكم</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-headline text-foreground tracking-tight">إنجازاتنا في لغة الأرقام</h2>
            <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
              نحن ملتزمون بتقديم الرعاية الصحية الأكثر موثوقية وتميزاً، وهذه الأرقام هي حصاد جهود فريقنا وثقتكم المستمرة بنا.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {stats.map((stat, index) => (
            <FadeIn key={stat.label} delay={index * 0.1}>
              <div
                className={`relative group p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-card border border-border/10 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden text-center`}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative mb-6 md:mb-8 inline-flex p-4 md:p-6 rounded-2xl md:rounded-3xl bg-muted/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>

                <p className="relative text-4xl md:text-5xl lg:text-6xl font-bold font-mono text-foreground tracking-tighter mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-500">
                  {stat.value}
                </p>
                <div className="relative space-y-1">
                  <p className="text-lg md:text-xl font-bold text-foreground">{stat.label}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.sub}</p>
                </div>

                {/* Decorative border bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-primary/20 rounded-full group-hover:w-1/2 transition-all duration-500" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
