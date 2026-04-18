import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  Heart, 
  Award, 
  Users, 
  BookOpen, 
  Clock, 
  Star,
  CheckCircle,
  TrendingUp,
  Globe,
  Shield
} from 'lucide-react';
import { useI18n } from '../lib/i18n';

const AboutPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* العنوان الرئيسي */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 lg:gap-16"
        >
          {/* قسم عن المبادرة */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t('about.initiative.title')}
                  </h2>
                  <p className="text-white/70">
                    {t('about.initiative.subtitle')}
                  </p>
                </div>
              </div>
              
              <p className="text-white/80 mb-8 leading-relaxed">
                {t('about.initiative.description')}
              </p>

              {/* الرؤية والرسالة */}
              <div className="space-y-6">
                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {t('about.initiative.vision')}
                    </h3>
                  </div>
                  <p className="text-white/70">
                    {t('about.initiative.visionText')}
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {t('about.initiative.mission')}
                    </h3>
                  </div>
                  <p className="text-white/70">
                    {t('about.initiative.missionText')}
                  </p>
                </div>
              </div>

              {/* القيم */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  {t('about.initiative.values')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {t('about.initiative.valuesList').map((value, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* قسم عن الأكاديمية */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {t('about.academy.title')}
                  </h2>
                  <p className="text-white/70">
                    {t('about.academy.subtitle')}
                  </p>
                </div>
              </div>
              
              <p className="text-white/80 mb-8 leading-relaxed">
                {t('about.academy.description')}
              </p>

              {/* المميزات الرئيسية */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  {t('about.academy.features')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {t('about.academy.featuresList').map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* الإحصائيات */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  {t('about.academy.stats')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {t('about.academy.statsList').map((stat, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {stat.number}
                      </div>
                      <div className="text-white/70 text-sm">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* قسم إضافي للتواصل */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              {lang === 'ar' ? 'انضم إلينا اليوم' : 'Join Us Today'}
            </h2>
            <p className="text-white/80 mb-6">
              {lang === 'ar' 
                ? 'ابدأ رحلتك التعليمية معنا واكتشف إمكانياتك الكاملة'
                : 'Start your educational journey with us and discover your full potential'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-3 rounded-full transition-all duration-300 hover:scale-105">
                {lang === 'ar' ? 'تصفح البرامج' : 'Browse Courses'}
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-3 rounded-full transition-all duration-300 hover:scale-105">
                {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutPage; 