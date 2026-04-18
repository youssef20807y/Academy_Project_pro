import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useI18n } from '../lib/i18n';

const Newsletter = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-10 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">{t('newsletter.title')}</h3>
          <p className="text-muted-foreground mb-6">{t('newsletter.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch" dir={isRtl ? 'rtl' : 'ltr'}>
            <Input type="email" placeholder={t('newsletter.emailPlaceholder')} className="h-11 sm:flex-1" />
            <Button className="h-11 sm:w-40">{t('newsletter.subscribe')}</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter; 