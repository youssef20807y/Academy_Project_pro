import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';
import api from '../services/api';

const CTASection = () => {
  const { t } = useI18n();
  
  const handleSignupClick = () => {
    const isAuthenticated = api.hasToken();
    if (isAuthenticated) {
      window.location.href = '/account';
    } else {
      window.location.href = '/register';
    }
  };
  
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="academy-gradient rounded-2xl p-10 md:p-14 text-white relative overflow-hidden">
          {/* عناصر زخرفية */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/5 rounded-full blur-lg"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-8 md:gap-12">
              <div className="text-center md:text-right flex-1">
                <h3 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">{t('cta.title')}</h3>
                <p className="text-white/90 text-lg mb-6 leading-relaxed">{t('cta.subtitle')}</p>
                
                {/* معلومات إضافية */}
                <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto md:mx-0">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">50,000+</div>
                    <div className="text-white/70 text-sm">طالب مسجل</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">300+</div>
                    <div className="text-white/70 text-sm">دورة تدريبية</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end w-full md:w-auto">
                <Button 
                  onClick={handleSignupClick}
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-8 py-4"
                >
                  {api.hasToken() ? (t('common.nav.settings') === 'Settings' ? 'My Account' : 'حسابي') : t('cta.signup')}
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/about'} 
                  size="lg" 
                  className="bg-white/20 text-white hover:bg-white/30 border border-white/40 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm font-semibold px-8 py-4"
                >
                  <Info className="w-5 h-5 mr-2" />
                  {t('common.nav.about')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 