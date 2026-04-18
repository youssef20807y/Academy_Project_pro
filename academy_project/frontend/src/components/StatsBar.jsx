import React from 'react';
import { Users, BookOpen, Award, Globe } from 'lucide-react';
import { useI18n } from '../lib/i18n';

const StatsBar = () => {
  const { t } = useI18n();
  const stats = [
    { icon: Users, label: t('stats.students'), value: '50,000+' },
    { icon: BookOpen, label: t('stats.courses'), value: '300+' },
    { icon: Award, label: t('stats.certificates'), value: '1,000+' },
    { icon: Globe, label: t('stats.countries'), value: '15+' },
  ];

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x-reverse divide-border">
                          {stats.map((s, idx) => (
                <div key={idx} className="flex items-center justify-center gap-3 p-6">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center md:text-start">
                    <div className="text-xl font-bold text-foreground leading-none">{s.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar; 