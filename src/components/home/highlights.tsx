import { Clock, ShieldCheck, Smartphone, Users, Award, HeartPulse, Sparkles, Activity } from 'lucide-react';
import { FadeIn } from '@/components/animations/fade-in';

const highlights = [
  {
    icon: <Activity className="h-10 w-10 text-primary" />,
    title: 'سرعة الاستجابة',
    description: 'نظام حجز ذكي يضمن لك موعدك في أسرع وقت ممكن وبكل سهولة.',
    color: 'bg-primary/10'
  },
  {
    icon: <Award className="h-10 w-10 text-secondary" />,
    title: 'أطباء معتمدون',
    description: 'نخبة من أفضل الأستشاريين والأخصائيين المعتمدين دولياً ومحلياً.',
    color: 'bg-secondary/10'
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-blue-500" />,
    title: 'أمان وخصوصية',
    description: 'تشفير كامل لبياناتك الطبية وسرية تامة في التعامل مع سجلاتك الصحية.',
    color: 'bg-blue-100/50'
  },
  {
    icon: <Sparkles className="h-10 w-10 text-amber-500" />,
    title: 'رعاية شاملة',
    description: 'خدمات طبية متكاملة تغطي كافة احتياجاتك من العيادات إلى الصيدلية.',
    color: 'bg-amber-100/50'
  }
];

export default function Highlights() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => (
            <FadeIn key={highlight.title} delay={index * 0.15} direction="up">
              <div className="group relative p-8 rounded-[2.5rem] bg-card/50 hover:bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden h-full">
                <div className={`absolute top-0 right-0 w-32 h-32 ${highlight.color} rounded-bl-[5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />

                <div className="relative mb-6 inline-flex p-4 rounded-2xl bg-background shadow-inner ring-1 ring-border/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  {highlight.icon}
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3">{highlight.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{highlight.description}</p>

                <div className="mt-6 flex h-1 w-0 group-hover:w-full bg-primary/30 transition-all duration-500 rounded-full" />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
