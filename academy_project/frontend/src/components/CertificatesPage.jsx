import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { Award, CheckCircle, Clock, Shield, Download, BookOpen, Users, Globe } from 'lucide-react';

const CertificatesPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';

  const certificates = [
    {
      id: 1,
      title: lang === 'ar' ? 'تطوير الويب' : 'Web Development',
      description: lang === 'ar' 
        ? 'شهادة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript والأطر الحديثة'
        : 'Complete web development certification covering HTML, CSS, JavaScript, and modern frameworks',
      icon: '🌐',
      duration: lang === 'ar' ? '3-6 أشهر' : '3-6 months',
      level: lang === 'ar' ? 'مبتدئ - متقدم' : 'Beginner - Advanced'
    },
    {
      id: 2,
      title: lang === 'ar' ? 'علوم البيانات' : 'Data Science',
      description: lang === 'ar'
        ? 'شهادة علوم البيانات الشاملة تشمل Python والتعلم الآلي والتحليلات'
        : 'Comprehensive data science certification including Python, machine learning, and analytics',
      icon: '📊',
      duration: lang === 'ar' ? '4-8 أشهر' : '4-8 months',
      level: lang === 'ar' ? 'متوسط - متقدم' : 'Intermediate - Advanced'
    },
    {
      id: 3,
      title: lang === 'ar' ? 'التسويق الرقمي' : 'Digital Marketing',
      description: lang === 'ar'
        ? 'شهادة التسويق الرقمي المهنية تغطي SEO ووسائل التواصل الاجتماعي والتسويق بالمحتوى'
        : 'Professional digital marketing certification covering SEO, social media, and content marketing',
      icon: '📱',
      duration: lang === 'ar' ? '2-4 أشهر' : '2-4 months',
      level: lang === 'ar' ? 'مبتدئ - متوسط' : 'Beginner - Intermediate'
    },
    {
      id: 4,
      title: lang === 'ar' ? 'إدارة المشاريع' : 'Project Management',
      description: lang === 'ar'
        ? 'شهادة إدارة المشاريع مع الأدوات العملية والمنهجيات'
        : 'Project management certification with practical tools and methodologies',
      icon: '📋',
      duration: lang === 'ar' ? '3-5 أشهر' : '3-5 months',
      level: lang === 'ar' ? 'متوسط - متقدم' : 'Intermediate - Advanced'
    }
  ];

  const features = [
    {
      icon: Globe,
      title: lang === 'ar' ? 'معترف بها دولياً' : 'Internationally Recognized',
      description: lang === 'ar' ? 'شهادات مقبولة من أصحاب العمل في جميع أنحاء العالم' : 'Certificates accepted by employers worldwide'
    },
    {
      icon: Clock,
      title: lang === 'ar' ? 'وصول مدى الحياة' : 'Lifetime Access',
      description: lang === 'ar' ? 'الوصول إلى شهاداتك في أي وقت وأي مكان' : 'Access your certificates anytime, anywhere'
    },
    {
      icon: Shield,
      title: lang === 'ar' ? 'قابلة للتحقق' : 'Verifiable',
      description: lang === 'ar' ? 'نظام التحقق الرقمي لأصحاب العمل' : 'Digital verification system for employers'
    }
  ];

  const steps = [
    {
      number: 1,
      title: lang === 'ar' ? 'إكمال متطلبات الدورة' : 'Complete Course Requirements',
      description: lang === 'ar' ? 'إنهاء جميع الوحدات والواجبات والتقييمات في الدورة المختارة' : 'Finish all modules, assignments, and assessments in your chosen course'
    },
    {
      number: 2,
      title: lang === 'ar' ? 'اجتياز التقييم النهائي' : 'Pass Final Assessment',
      description: lang === 'ar' ? 'تحقيق الحد الأدنى المطلوب من النقاط في التقييم النهائي للدورة' : 'Achieve the minimum required score in the final course assessment'
    },
    {
      number: 3,
      title: lang === 'ar' ? 'تحميل الشهادة' : 'Download Certificate',
      description: lang === 'ar' ? 'الوصول إلى شهادتك وتحميلها من لوحة تحكم حسابك' : 'Access and download your certificate from your account dashboard'
    }
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* العنوان الرئيسي */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Award className="w-12 h-12 text-primary" />
            <h1 className="text-4xl lg:text-6xl font-bold text-white">
              {lang === 'ar' ? 'الشهادات المعتمدة' : 'Accredited Certificates'}
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {lang === 'ar' 
              ? 'شهاداتنا معترف بها دولياً وتساعدك على تطوير مسيرتك المهنية'
              : 'Our certificates are internationally recognized and help you advance your career'
            }
          </p>
        </motion.div>

        {/* الشهادات المهنية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {lang === 'ar' ? 'الشهادات المهنية' : 'Professional Certificates'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{cert.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{cert.title}</h3>
                    <p className="text-white/80 mb-4">{cert.description}</p>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {cert.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {cert.level}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* مميزات الشهادات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {lang === 'ar' ? 'مميزات الشهادات' : 'Certificate Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* كيفية الحصول على الشهادات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {lang === 'ar' ? 'كيفية الحصول على الشهادات' : 'How to Earn Certificates'}
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-6"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-white/80">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* دعوة للعمل */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              {lang === 'ar' ? 'ابدأ رحلتك نحو الشهادات المهنية' : 'Start Your Journey to Professional Certificates'}
            </h3>
            <p className="text-white/80 mb-6">
              {lang === 'ar' 
                ? 'انضم إلى آلاف الطلاب الذين حصلوا على شهادات معتمدة وساعدتهم في تطوير مسيرتهم المهنية'
                : 'Join thousands of students who have earned accredited certificates and advanced their careers'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/catalog'}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center"
              >
                <BookOpen className="w-5 h-5" />
                {lang === 'ar' ? 'تصفح الدورات' : 'Browse Courses'}
              </button>
              <button 
                onClick={() => window.location.href = '/contact'}
                className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <CheckCircle className="w-5 h-5" />
                {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CertificatesPage; 