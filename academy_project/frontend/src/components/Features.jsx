import React from 'react';
import { Rocket, ShieldCheck, Sparkles, Headphones, Info, Target, BookOpen, Users } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';

const Features = () => {
  const { t } = useI18n();
  const features = [
    {
      icon: Rocket,
      title: t('features.items.0.title'),
      desc: t('features.items.0.desc'),
    },
    {
      icon: ShieldCheck,
      title: t('features.items.1.title'),
      desc: t('features.items.1.desc'),
    },
    {
      icon: Sparkles,
      title: t('features.items.2.title'),
      desc: t('features.items.2.desc'),
    },
    {
      icon: Headphones,
      title: t('features.items.3.title'),
      desc: t('features.items.3.desc'),
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">{t('features.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all">
              <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        
        {/* قسم عنّا محسن */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-10 border border-primary/20 shadow-xl backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Info className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-foreground mb-6">
                {t('about.title')}
              </h3>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
                {t('about.subtitle')}
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t('about.initiative.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('about.initiative.description')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-green-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {t('about.academy.title')}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('about.academy.description')}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => window.location.href = '/about'} 
                  size="lg" 
                  className="rounded-full px-10 py-4 text-lg bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Info className="w-5 h-5 mr-2" />
                  {t('common.nav.about')}
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/trainers'} 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-10 py-4 text-lg border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 font-semibold"
                >
                  <Users className="w-5 h-5 mr-2" />
                  {t('common.nav.trainers')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 