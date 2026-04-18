import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  Star, 
  BookOpen, 
  Calendar,
  TrendingUp,
  BarChart3,
  ArrowRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';
import api from '../services/api';

const ProfilePage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [studentData, setStudentData] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const getEffectiveRole = (u) => {
    if (!u) return 'User';
    const email = (u.email || '').toLowerCase();
    const baseRole = u.role || 'User';
    if (baseRole === 'SupportAgent' || baseRole === 'Admin' || baseRole === 'admin') return 'Admin';
    if (email === 'yjmt469999@gmail.com' || email === 'yjmt4699999@gmail.com') return 'Admin';
    try {
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      const storedRole = stored.role || stored.Role;
      if (storedRole === 'Admin' || storedRole === 'SupportAgent') return 'Admin';
    } catch (_) {}
    return baseRole;
  };

  useEffect(() => {
    // فحص حالة المصادقة
    const checkAuth = () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
        setIsAuthenticated(Boolean(token));
      } catch (_) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    loadProfileData();
  }, []);

  // إعادة تحميل البيانات عند تغيير حالة المصادقة
  useEffect(() => {
    const handleAuthChange = () => {
      loadProfileData();
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      // فحص إذا كان المستخدم مسجل دخوله
      const localStorageToken = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
      console.log('localStorage token:', localStorageToken);
      console.log('api.hasToken():', api.hasToken());
      
      if (!api.hasToken()) {
        console.log('No authentication token found, showing login prompt');
        setStudentData(null); // إلغاء البيانات
        setLoading(false);
        return;
      }

      console.log('Loading profile data with token:', api.hasToken());
      console.log('Token value:', api.token);
      
      // جلب بيانات الطالب والتقييمات والحضور
      const [studentRes, evaluationRes, attendanceRes] = await Promise.all([
        api.me(),
        api.getEvaluations(),
        api.getAttendance()
      ]);

      console.log('API Response - studentRes:', studentRes);
      console.log('API Response - evaluationRes:', evaluationRes);
      console.log('API Response - attendanceRes:', attendanceRes);
      
      // فحص إذا كان المستخدم مسجل دخوله فعلاً
      if (!studentRes) {
        console.log('No student data received, user might not be logged in');
        setStudentData(null);
        setLoading(false);
        return;
      }

      if (studentRes) {
        // استخراج البيانات بنفس طريقة صفحة account
        const extractedData = {
          firstName: studentRes?.firstName || '',
          lastName: studentRes?.lastName || '',
          fullName: studentRes?.fullName || `${studentRes?.firstName || ''} ${studentRes?.lastName || ''}`.trim() || 'User',
          email: studentRes?.email || '',
          phoneNumber: studentRes?.phoneNumber || '',
          role: studentRes?.role || 'User',
          id: studentRes?.id || studentRes?.userId || studentRes?.guid || ''
        };
        
        console.log('Extracted student data:', extractedData);
        setStudentData(extractedData);
        
        // تحميل الصورة الشخصية إذا توفرت
        try {
          const blob = await api.getProfilePicture(extractedData.id);
          if (blob && blob.size > 0) {
            const url = URL.createObjectURL(blob);
            setProfileImageUrl(url);
          } else {
            setProfileImageUrl('');
          }
        } catch (_) {
          setProfileImageUrl('');
        }
      } else {
        console.log('No student data received from API');
      }
      if (evaluationRes && Array.isArray(evaluationRes)) {
        // استخدام أول تقييم أو إنشاء بيانات افتراضية
        setEvaluation(evaluationRes[0] || {
          attendanceRate: 85,
          absenceRate: 15,
          browsingRate: 78,
          contentRatio: 92
        });
      }
      if (attendanceRes && Array.isArray(attendanceRes)) {
        setAttendance(attendanceRes);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      
      // إذا كان الخطأ 401 (غير مصرح)، إعادة توجيه لتسجيل الدخول
      if (error?.status === 401) {
        console.log('Unauthorized access, clearing token and showing login prompt');
        api.setToken(null);
        setStudentData(null);
        setLoading(false);
        return;
      }
      
      // استخدام بيانات افتراضية في حالة الخطأ
      setStudentData({
        firstName: lang === 'ar' ? 'أحمد' : 'Ahmed',
        lastName: lang === 'ar' ? 'محمد' : 'Mohamed',
        fullName: lang === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed',
        email: 'ahmed@example.com',
        phoneNumber: '',
        role: 'User',
        id: ''
      });
      setEvaluation({
        attendanceRate: 85,
        absenceRate: 15,
        browsingRate: 78,
        contentRatio: 92
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBasicData = () => {
    window.location.href = '/settings';
  };

  const handleEvaluations = () => {
    window.location.href = '/evaluations';
  };

  const calculateCircleProgress = (percentage, size = 120) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;
    const remaining = circumference - progress;
    
    return {
      radius,
      circumference,
      progress,
      remaining,
      size
    };
  };

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/90">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </section>
    );
  }

  // إذا لم يكن المستخدم مسجل دخوله
  if (!studentData || !isAuthenticated) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-4">
            <User className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {lang === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
            </h2>
            <p className="text-white/80 mb-6">
              {lang === 'ar' 
                ? 'يجب عليك تسجيل الدخول لعرض ملفك الشخصي'
                : 'You need to login to view your profile'
              }
            </p>
            <p className="text-white/60 text-sm mb-6">
              {lang === 'ar' 
                ? `حالة المصادقة: ${isAuthenticated ? 'مسجل دخول' : 'غير مسجل دخول'}`
                : `Auth Status: ${isAuthenticated ? 'Logged In' : 'Not Logged In'}`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild 
                className="academy-button rounded-full"
                onClick={() => window.location.href = '/login'}
              >
                <a href="/login">
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <a href="/register">
                  {lang === 'ar' ? 'إنشاء حساب' : 'Register'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const browsingProgress = calculateCircleProgress(evaluation?.browsingRate || 0);
  const absenceProgress = calculateCircleProgress(evaluation?.absenceRate || 0);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* العنوان الرئيسي */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {lang === 'ar' ? 'الطالب' : 'Student'}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {lang === 'ar' 
              ? 'مرحباً بك في حساب الطالب، تابع تقدمك وأداءك التعليمي'
                : 'Welcome to your student page, track your progress and educational performance'
            }
          </p>
        </motion.div>

        {/* معلومات الطالب الأساسية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12 text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
            <User className="w-16 h-16 text-white" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            {studentData?.fullName || `${studentData?.firstName} ${studentData?.lastName}`.trim()}
          </h2>
          
          <p className="text-white/80 mb-6">
            {studentData?.email}
          </p>
          
          {studentData && (
            <p className="text-white/60 mb-4">
              {getEffectiveRole(studentData)}
            </p>
          )}

          {/* الأزرار - الطالب يرى فقط البيانات الأساسية والتقييمات */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleBasicData}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              {lang === 'ar' ? 'البيانات الأساسية' : 'Basic Data'}
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              onClick={handleEvaluations}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              {lang === 'ar' ? 'التقييمات' : 'Evaluations'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* دوائر النسب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* نسبة التصفح للمحتوى */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <BookOpen className="w-8 h-8 text-blue-400 mr-3" />
              <h3 className="text-2xl font-bold text-white">
                {lang === 'ar' ? 'نسبة التصفح للمحتوى' : 'Content Browsing Rate'}
              </h3>
            </div>
            
            <div className="relative inline-block mb-6">
              <svg width={browsingProgress.size} height={browsingProgress.size} className="transform -rotate-90">
                {/* الخلفية */}
                <circle
                  cx={browsingProgress.size / 2}
                  cy={browsingProgress.size / 2}
                  r={browsingProgress.radius}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* التقدم */}
                <circle
                  cx={browsingProgress.size / 2}
                  cy={browsingProgress.size / 2}
                  r={browsingProgress.radius}
                  stroke="#60A5FA"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={browsingProgress.circumference}
                  strokeDashoffset={browsingProgress.remaining}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {evaluation?.browsingRate || 0}%
                  </div>
                  <div className="text-sm text-white/70">
                    {lang === 'ar' ? 'مكتمل' : 'Complete'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/80">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>{lang === 'ar' ? 'مستوى جيد' : 'Good Level'}</span>
            </div>
          </motion.div>

          {/* نسبة الغياب */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-red-400 mr-3" />
              <h3 className="text-2xl font-bold text-white">
                {lang === 'ar' ? 'نسبة الغياب' : 'Absence Rate'}
              </h3>
            </div>
            
            <div className="relative inline-block mb-6">
              <svg width={absenceProgress.size} height={absenceProgress.size} className="transform -rotate-90">
                {/* الخلفية */}
                <circle
                  cx={absenceProgress.size / 2}
                  cy={absenceProgress.size / 2}
                  r={absenceProgress.radius}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* التقدم */}
                <circle
                  cx={absenceProgress.size / 2}
                  cy={absenceProgress.size / 2}
                  r={absenceProgress.radius}
                  stroke="#F87171"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={absenceProgress.circumference}
                  strokeDashoffset={absenceProgress.remaining}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {evaluation?.absenceRate || 0}%
                  </div>
                  <div className="text-sm text-white/70">
                    {lang === 'ar' ? 'غياب' : 'Absent'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/80">
              <BarChart3 className="w-4 h-4 text-red-400" />
              <span>{lang === 'ar' ? 'مستوى مقبول' : 'Acceptable Level'}</span>
            </div>
          </motion.div>
        </div>

        {/* إحصائيات إضافية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {lang === 'ar' ? 'إحصائيات إضافية' : 'Additional Statistics'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {evaluation?.attendanceRate || 0}%
              </div>
              <div className="text-white/70">
                {lang === 'ar' ? 'نسبة الحضور' : 'Attendance Rate'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {evaluation?.contentRatio || 0}%
              </div>
              <div className="text-white/70">
                {lang === 'ar' ? 'نسبة المحتوى' : 'Content Ratio'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Star className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {Math.round(((evaluation?.browsingRate || 0) + (evaluation?.contentRatio || 0)) / 2)}%
              </div>
              <div className="text-white/70">
                {lang === 'ar' ? 'المعدل العام' : 'Overall Average'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfilePage; 