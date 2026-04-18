import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';

const StaticPage = ({ title, children }) => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/50" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{title}</h1>
          <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-6 sm:p-8 text-foreground leading-8">
            {children}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StaticPage; 