import React, { useRef } from 'react';
import { ArrowLeft, BookOpen, Users, Award, Globe } from 'lucide-react';
import { Button } from './ui/button';
import heroImage from '../assets/hero_image.png';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import api from '../services/api';

const Hero = () => {
  const { t, lang } = useI18n();
  const [studentAcademy, setStudentAcademy] = React.useState(null);
  const [studentBranch, setStudentBranch] = React.useState(null);
  
  const stats = [
    { icon: Users, label: t('hero.stats.students'), value: '50,000+' },
    { icon: BookOpen, label: t('hero.stats.courses'), value: '300+' },
    { icon: Award, label: t('hero.stats.certificates'), value: '1,000+' },
    { icon: Globe, label: t('hero.stats.countries'), value: '15+' }
  ];

  const sectionRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mx = useSpring(mouseX, { stiffness: 500, damping: 90, mass: 0.3 });
  const my = useSpring(mouseY, { stiffness: 500, damping: 90, mass: 0.3 });
  const spotlight = useMotionTemplate`radial-gradient(650px circle at ${mx}px ${my}px, rgba(255,255,255,0.14), transparent 60%)`;

  const handleMouseMove = (event) => {
    const node = sectionRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  // تحميل بيانات الطالب من localStorage
  React.useEffect(() => {
    const loadStudentData = () => {
      try {
        // محاولة تحميل من userSocialMedia
        const storedSocialData = localStorage.getItem('userSocialMedia');
        if (storedSocialData) {
          const parsedData = JSON.parse(storedSocialData);
          if (parsedData.academyDataId) {
            setStudentAcademy(parsedData.academyDataId);
          }
          if (parsedData.branchesDataId) {
            setStudentBranch(parsedData.branchesDataId);
          }
        }
        
        // محاولة تحميل من studentData
        const studentDataFromStorage = localStorage.getItem('studentData');
        if (studentDataFromStorage) {
          const parsedStudentData = JSON.parse(studentDataFromStorage);
          if (parsedStudentData.academyDataId || parsedStudentData.AcademyDataId) {
            const academyId = parsedStudentData.academyDataId || parsedStudentData.AcademyDataId;
            setStudentAcademy(academyId);
          }
          if (parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId) {
            const branchId = parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId;
            setStudentBranch(branchId);
          }
        }
      } catch (error) {
        console.log('Error loading student data in Hero:', error);
      }
    };

    // تحميل البيانات الأولية
    loadStudentData();

    // إضافة event listener للتحديثات
    const handleStudentDataChanged = () => {
      loadStudentData();
    };

    window.addEventListener('student-data-changed', handleStudentDataChanged);

    return () => {
      window.removeEventListener('student-data-changed', handleStudentDataChanged);
    };
  }, []);

  const goTo = (path) => { try { window.location.href = path; } catch (_) {} };
  
  const onBrowse = () => {
    // إذا كان الطالب لديه أكاديمية وفرع، وجهه للرابط مع المعاملات
    if (studentAcademy && studentBranch) {
      goTo(`/projects-master?academy=${studentAcademy}&branch=${studentBranch}`);
    } else {
      // وإلا وجهه للصفحة العادية
      goTo('/projects-master');
    }
  };
  
  const onStart = () => {
    const isAuthed = api.hasToken();
    goTo(isAuthed ? '/account' : '/register');
  };
  
  const getStartButtonText = () => {
    const isAuthed = api.hasToken();
    return isAuthed ? (lang === 'ar' ? 'حسابي' : 'My Account') : t('common.actions.startNowFree');
  };

  return (
    <section ref={sectionRef} onMouseMove={handleMouseMove} className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen hidden md:block"
        style={{ background: spotlight }}
      />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />
      {/* جسيمات عائمة خفيفة */}
      <div className="pointer-events-none absolute inset-0 z-[1] hidden md:block">
        {[ 
          { left: '12%', top: '18%', size: 'w-2 h-2', delay: 0 },
          { left: '28%', top: '72%', size: 'w-1.5 h-1.5', delay: 0.8 },
          { left: '55%', top: '12%', size: 'w-2 h-2', delay: 1.4 },
          { left: '68%', top: '65%', size: 'w-1.5 h-1.5', delay: 0.4 },
          { left: '82%', top: '30%', size: 'w-2 h-2', delay: 1.1 },
          { left: '38%', top: '40%', size: 'w-1.5 h-1.5', delay: 0.2 },
        ].map((p, i) => (
          <motion.span key={i} className={`absolute ${p.size} rounded-full bg-white/30 shadow-[0_0_8px_rgba(255,255,255,0.35)]`} style={{ left: p.left, top: p.top }} initial={{ y: 0, opacity: 0.7 }} animate={{ y: [-6, 6, -6], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* المحتوى النصي */}
          <motion.div 
            className="text-center lg:text-right text-white max-w-2xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-[1.2] sm:leading-tight tracking-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 lg:mb-12">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={onStart} size="lg" className="text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg shadow-black/20 focus-visible:ring-white/30 w-full sm:w-auto">
                  {getStartButtonText()}
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={onBrowse} variant="outline" size="lg" className="text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border-2 border-white text-white bg-transparent hover:bg.white/10 hover:text-white focus-visible:ring-white/30 w-full sm:w-auto">
                  {lang === 'ar' ? 'عرض المشاريع' : 'View Projects'}
                </Button>
              </motion.div>
            </div>
            


            {/* الإحصائيات */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center lg:text-start rounded-xl bg-white/5 p-3 sm:bg-transparent sm:p-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                >
                  <div className="flex items-center justify-center lg:justify-start mb-1.5 sm:mb-2">
                    <div className="p-1.5 sm:p-2 bg-white/15 rounded-lg">
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white leading-none">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/85 mt-0.5 sm:mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>


          </motion.div>

          {/* الصورة */}
          <motion.div 
            className="relative mt-10 lg:mt-0"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative z-10">
              <motion.img 
                src={heroImage} 
                alt={t('hero.imageAlt')}
                className="w-full h-auto rounded-3xl shadow-2xl border border-white/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
            </div>
            
            {/* عناصر زخرفية */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl hidden md:block"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/10 rounded-full blur-xl hidden md:block"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

