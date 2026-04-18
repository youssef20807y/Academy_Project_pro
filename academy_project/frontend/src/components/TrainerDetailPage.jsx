import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MessageCircle, Download, Eye, MapPin, Calendar, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useI18n } from '../lib/i18n';
import api from '../services/api';

const TrainerDetailPage = () => {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // استخراج معرف المدرب من URL إذا لم يكن متوفراً في useParams
  const trainerId = id || (typeof window !== 'undefined' ? window.location.pathname.split('/trainer/')[1] : null);
  
  console.log('TrainerDetailPage initialized with:', { id, trainerId, pathname: typeof window !== 'undefined' ? window.location.pathname : 'N/A' }); // للتأكد من معرف المدرب

  useEffect(() => {
    if (trainerId) {
      console.log('useEffect triggered with trainerId:', trainerId); // للتأكد من تشغيل useEffect
      loadTrainerData();
    } else {
      console.log('No trainerId found, setting error'); // للتأكد من عدم وجود معرف مدرب
      setError(lang === 'ar' ? 'معرف المدرب غير صحيح' : 'Invalid trainer ID');
      setLoading(false);
    }
  }, [trainerId]);

  const loadTrainerData = async () => {
    setLoading(true);
    try {
      console.log('Loading trainer data for ID:', trainerId); // للتأكد من معرف المدرب
      
      // استدعاء API لجلب بيانات المدرب
      const trainerData = await api.getTrainer(trainerId);
      console.log('API Response (getTrainer):', trainerData); // للتأكد من استجابة API
      console.log('Trainer data type:', typeof trainerData); // للتأكد من نوع البيانات
      console.log('Trainer data keys:', trainerData ? Object.keys(trainerData) : 'No data'); // للتأكد من مفاتيح البيانات
      
      // التحقق من البيانات بطرق مختلفة
      if (trainerData && typeof trainerData === 'object' && Object.keys(trainerData).length > 0) {
        console.log('Setting trainer data:', trainerData);
        setTrainer(trainerData);
        setError(null); // إزالة أي أخطاء سابقة
      } else if (trainerData === null || trainerData === undefined) {
        console.log('Trainer data is null/undefined, using fallback data');
        const fallbackData = {
          id: trainerId,
          teacherNameL1: lang === 'ar' ? 'أحمد محمد علي' : 'Ahmed Mohamed Ali',
          teacherNameL2: 'Ahmed Mohamed Ali',
          teacherAddress: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
          teacherMobile: '+201234567890',
          teacherPhone: '+201234567891',
          teacherWhatsapp: '+201234567890',
          teacherEmail: 'ahmed.mohamed@example.com',
          description: lang === 'ar' 
            ? 'مدرب محترف مع أكثر من 10 سنوات من الخبرة في مجال التدريب والتطوير. متخصص في تطوير المهارات الشخصية والقيادية، مع خبرة واسعة في العمل مع الشركات والمؤسسات التعليمية.'
            : 'Professional trainer with over 10 years of experience in training and development. Specialized in personal and leadership skills development, with extensive experience working with companies and educational institutions.',
          dateStart: '2014-01-01',
          imageFile: null
        };
        console.log('Setting fallback data:', fallbackData);
        setTrainer(fallbackData);
        setError(lang === 'ar' ? 'تم استخدام بيانات تجريبية' : 'Using fallback data');
      } else {
        console.log('Trainer data is empty or invalid, using fallback data');
        const fallbackData = {
          id: trainerId,
          teacherNameL1: lang === 'ar' ? 'أحمد محمد علي' : 'Ahmed Mohamed Ali',
          teacherNameL2: 'Ahmed Mohamed Ali',
          teacherAddress: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
          teacherMobile: '+201234567890',
          teacherPhone: '+201234567891',
          teacherWhatsapp: '+201234567890',
          teacherEmail: 'ahmed.mohamed@example.com',
          description: lang === 'ar' 
            ? 'مدرب محترف مع أكثر من 10 سنوات من الخبرة في مجال التدريب والتطوير. متخصص في تطوير المهارات الشخصية والقيادية، مع خبرة واسعة في العمل مع الشركات والمؤسسات التعليمية.'
            : 'Professional trainer with over 10 years of experience in training and development. Specialized in personal and leadership skills development, with extensive experience working with companies and educational institutions.',
          dateStart: '2014-01-01',
          imageFile: null
        };
        console.log('Setting fallback data:', fallbackData);
        setTrainer(fallbackData);
        setError(lang === 'ar' ? 'تم استخدام بيانات تجريبية' : 'Using fallback data');
      }
    } catch (error) {
      console.error('Error loading trainer data:', error);
      // استخدام بيانات تجريبية في حالة فشل API
      const fallbackData = {
        id: trainerId,
        teacherNameL1: lang === 'ar' ? 'أحمد محمد علي' : 'Ahmed Mohamed Ali',
        teacherNameL2: 'Ahmed Mohamed Ali',
        teacherAddress: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
        teacherMobile: '+201234567890',
        teacherPhone: '+201234567891',
        teacherWhatsapp: '+201234567890',
        teacherEmail: 'ahmed.mohamed@example.com',
        description: lang === 'ar' 
          ? 'مدرب محترف مع أكثر من 10 سنوات من الخبرة في مجال التدريب والتطوير. متخصص في تطوير المهارات الشخصية والقيادية، مع خبرة واسعة في العمل مع الشركات والمؤسسات التعليمية.'
          : 'Professional trainer with over 10 years of experience in training and development. Specialized in personal and leadership skills development, with extensive experience working with companies and educational institutions.',
        dateStart: '2014-01-01',
        imageFile: null
      };
      console.log('Setting fallback data due to error:', fallbackData);
      setTrainer(fallbackData);
      setError(lang === 'ar' ? 'تم استخدام بيانات تجريبية بسبب خطأ في API' : 'Using fallback data due to API error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = () => {
    // هنا سيتم تنفيذ تحميل السيرة الذاتية
    try {
      const url = getCvUrlFromDescription(trainer?.description || trainer?.Description);
      if (!url) {
        alert(lang === 'ar' ? 'لا توجد سيرة ذاتية متاحة' : 'No CV available');
        return;
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (_) {
      alert(lang === 'ar' ? 'تعذر تنزيل السيرة الذاتية' : 'Failed to download CV');
    }
  };

  const handleViewCV = () => {
    // هنا سيتم عرض السيرة الذاتية
    const url = getCvUrlFromDescription(trainer?.description || trainer?.Description);
    if (!url) {
      alert(lang === 'ar' ? 'لا توجد سيرة ذاتية متاحة' : 'No CV available');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getCvUrlFromDescription = (desc) => {
    if (!desc) return '';
    try {
      const text = String(desc);
      const urlMatch = text.match(/https?:\/\/[^\s)]+\.(pdf|doc|docx)(\?[^\s)]*)?/i);
      if (urlMatch && urlMatch[0]) return urlMatch[0];
      const afterTag = text.split(/CV\s*:\s*/i)[1];
      if (afterTag) {
        const direct = afterTag.trim().split(/\s+/)[0];
        // إذا كان رابط كامل
        if (/^https?:\/\//i.test(direct)) return direct;
        // إذا كان مجرد اسم ملف بدون بروتوكول، فلا يمكن استخدامه مباشرة لأن الـ API لا يوفر مساراً موحداً للملفات
        // يجب إدخال رابط كامل (http/https)
        if (/\.(pdf|doc|docx)$/i.test(direct)) {
          return '';
        }
      }
    } catch (_) {}
    return '';
  };

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/90">{t('trainers.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !trainer) {
    console.log('Rendering error/loading state:', { error, trainer, loading }); // للتأكد من حالة البيانات
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <p className="text-white/90 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/trainers'} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
              {lang === 'ar' ? 'العودة للمدربين' : 'Back to Trainers'}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  console.log('Rendering trainer data:', trainer); // للتأكد من بيانات المدرب

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* زر العودة */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/trainers'}
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'ar' ? 'العودة للمدربين' : 'Back to Trainers'}
          </Button>
        </motion.div>

        {/* معلومات المدرب الأساسية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8 text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
            {trainer.imageFile ? (
              <img 
                src={trainer.imageFile} 
                alt={trainer.teacherNameL1}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-white" />
            )}
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {trainer.teacherNameL1}
          </h1>
          
          {trainer.teacherAddress && (
            <div className="flex items-center justify-center gap-2 text-white/80 mb-4">
              <MapPin className="w-4 h-4" />
              <span>{trainer.teacherAddress}</span>
            </div>
          )}
          
          {trainer.dateStart && (
            <div className="flex items-center justify-center gap-2 text-white/80 mb-6">
              <Calendar className="w-4 h-4" />
              <span>
                {lang === 'ar' ? 'خبرة منذ' : 'Experience since'}: {new Date(trainer.dateStart).getFullYear()}
              </span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* About Me */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">{t('trainers.aboutMe')}</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                {trainer.description || (lang === 'ar' 
                  ? 'لا توجد معلومات متاحة حالياً عن هذا المدرب.'
                  : 'No information available for this trainer at the moment.'
                )}
              </p>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="text-lg font-semibold text-white">{t('trainers.contact')}</h3>
              </div>
              <div className="space-y-4">
                {trainer.teacherEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-white/60" />
                    <a 
                      href={`mailto:${trainer.teacherEmail}`}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      {trainer.teacherEmail}
                    </a>
                  </div>
                )}
                
                {trainer.teacherMobile && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-white/60" />
                    <a 
                      href={`tel:${trainer.teacherMobile}`}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      {trainer.teacherMobile}
                    </a>
                  </div>
                )}
                
                {trainer.teacherWhatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-white/60" />
                    <a 
                      href={`https://wa.me/${trainer.teacherWhatsapp.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      WhatsApp: {trainer.teacherWhatsapp}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CV Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">{t('trainers.cv')}</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleViewCV}
                className="flex items-center gap-2 border-white/30 text-white hover:bg-white/20 bg-transparent"
              >
                <Eye className="w-4 h-4" />
                {t('trainers.viewCV')}
              </Button>
            </div>
            <p className="text-sm text-white/70 mt-3">
              {lang === 'ar' 
                ? 'يمكنك عرض أو تحميل السيرة الذاتية للمدرب للحصول على معلومات أكثر تفصيلاً عن خبراته ومؤهلاته.'
                : 'You can view or download the trainer\'s CV to get more detailed information about their experience and qualifications.'
              }
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrainerDetailPage; 