import React from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import api from '@/services/api';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import programPlaceholder from '../assets/program_placeholder.png';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Search } from 'lucide-react';

const SkeletonCard = () => (
  <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
    <div className="w-full aspect-[16/9] rounded-lg bg-white/10 mb-3" />
    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
    <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
    <div className="h-8 bg-white/10 rounded w-24 ml-auto" />
  </div>
);

const ItemCard = ({ title, subtitle, meta, onView, image, details, className = "", courses, isProgram = false }) => {
  const { lang } = useI18n();
  const [imageUrl, setImageUrl] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (image && image.id) {
      setIsLoading(true);
      api.getCourseImage(image.id)
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch(() => {
          setImageUrl(programPlaceholder);
        })
        .finally(() => setIsLoading(false));
    } else if (isProgram) {
      setImageUrl(programPlaceholder);
    }
  }, [image, isProgram]);

  return (
    <div className={`p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 ${className}`}>
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-white/10">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {isProgram && courses && (
          <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              {courses.length} {lang === 'ar' ? 'دورات' : 'courses'}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-white font-semibold text-lg mb-1">
            {title}
          </div>
          {subtitle && <div className="text-white/80 text-sm mb-1">{subtitle}</div>}
          {meta && (
            <div className="mt-1">
              <Badge variant="outline" className="text-xs bg-white/10 text-white/80 border-white/20">
                {meta}
              </Badge>
            </div>
          )}
          {isProgram && courses && (
            <div className="mt-2">
              <div className="inline-flex px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                {courses.length} {lang === 'ar' ? 'دورة' : 'courses'}
              </div>
            </div>
          )}
                        </div>
                      </div>
                      
      {/* Media/Details preview (unchanged) */}
      {/* We keep the optional media and details rendering here if needed later */}

      <div className="mt-4 flex items-center justify-end">
        {onView && (
          <Button onClick={onView} className="text-xs px-3 py-1 inline-flex items-center gap-1">
            {lang === 'ar' ? 'عرض التفاصيل' : 'View Details'} <ArrowRight className={`w-3 h-3 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </Button>
          )}
      </div>
    </div>
  );
};

const CatalogPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newCourse, setNewCourse] = React.useState({
    AcademyClaseMasterId: '',
    AcademyClaseTypeId: '',
    ClaseNumber: '',
    Image: null
  });

  React.useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');
      const userEmail = localStorage.getItem('userEmail') || '';
      const userRole = user.role || user.Role || '';
      const adminStatus = userRole === 'SupportAgent' || userRole === 'Admin' || userRole === 'admin' || userEmail === 'yjmt469999@gmail.com';
      setIsAdmin(adminStatus);
    } catch (e) {
      setIsAdmin(false);
    }
  }, []);

  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('projectMasters');
  const [courses, setCourses] = React.useState([]);
  const [projectMasters, setProjectMasters] = React.useState([]);
  const [projectDetails, setProjectDetails] = React.useState([]);
  const [programDetails, setProgramDetails] = React.useState([]);

  // بيانات افتراضية للكاتالوج
  const defaultCourses = [
    {
      id: 'course-1',
      title: lang === 'ar' ? 'أساسيات البرمجة' : 'Programming Basics',
      description: lang === 'ar' ? 'تعلم أساسيات البرمجة والمفاهيم الأساسية' : 'Learn programming basics and fundamental concepts',
      academyClaseMasterId: 'master-1'
    },
    {
      id: 'course-2',
      title: lang === 'ar' ? 'تطوير الويب' : 'Web Development',
      description: lang === 'ar' ? 'تعلم تطوير مواقع الويب الحديثة' : 'Learn modern web development',
      academyClaseMasterId: 'master-2'
    },
    {
      id: 'course-3',
      title: lang === 'ar' ? 'قواعد البيانات' : 'Database Management',
      description: lang === 'ar' ? 'إدارة وتصميم قواعد البيانات' : 'Database design and management',
      academyClaseMasterId: 'master-3'
    },
    {
      id: 'course-4',
      title: lang === 'ar' ? 'تطوير تطبيقات الموبايل' : 'Mobile App Development',
      description: lang === 'ar' ? 'تطوير تطبيقات الهواتف الذكية' : 'Smartphone app development',
      academyClaseMasterId: 'master-4'
    },
    {
      id: 'course-5',
      title: lang === 'ar' ? 'الذكاء الاصطناعي' : 'Artificial Intelligence',
      description: lang === 'ar' ? 'مقدمة في الذكاء الاصطناعي والتعلم الآلي' : 'Introduction to AI and machine learning',
      academyClaseMasterId: 'master-5'
    },
    {
      id: 'course-6',
      title: lang === 'ar' ? 'أمن المعلومات' : 'Information Security',
      description: lang === 'ar' ? 'مبادئ وأساليب حماية المعلومات' : 'Information protection principles and methods',
      academyClaseMasterId: 'master-6'
    }
  ];

  const defaultMasters = [
    {
      id: 'master-1',
      title: lang === 'ar' ? 'ماجستير علوم الحاسوب' : 'Master of Computer Science',
      description: lang === 'ar' ? 'برنامج شامل في علوم الحاسوب والتقنيات الحديثة' : 'Comprehensive program in computer science and modern technologies',
      academyClaseMasterId: 'CS-MASTER'
    },
    {
      id: 'master-2',
      title: lang === 'ar' ? 'ماجستير هندسة البرمجيات' : 'Master of Software Engineering',
      description: lang === 'ar' ? 'تطوير البرمجيات وهندسة النظم' : 'Software development and systems engineering',
      academyClaseMasterId: 'SE-MASTER'
    },
    {
      id: 'master-3',
      title: lang === 'ar' ? 'ماجستير إدارة تقنية المعلومات' : 'Master of IT Management',
      description: lang === 'ar' ? 'إدارة وتطوير تقنيات المعلومات في المؤسسات' : 'IT management and development in organizations',
      academyClaseMasterId: 'IT-MASTER'
    },
    {
      id: 'master-4',
      title: lang === 'ar' ? 'ماجستير الذكاء الاصطناعي' : 'Master of Artificial Intelligence',
      description: lang === 'ar' ? 'الذكاء الاصطناعي والتعلم الآلي والروبوتات' : 'Artificial intelligence, machine learning and robotics',
      academyClaseMasterId: 'AI-MASTER'
    }
  ];

  const defaultPrograms = [
    {
      id: 'program-1',
      programNameL1: lang === 'ar' ? 'برنامج المهارات الشخصية' : 'Personal Skills Program',
      programNameL2: 'Personal Skills Program',
      programDescriptionL1: lang === 'ar' ? 'برنامج شامل لتطوير المهارات الشخصية والمهنية' : 'Comprehensive program for personal and professional skills development',
      programDescriptionL2: 'Comprehensive program for personal and professional skills development',
      programType: lang === 'ar' ? 'مهارات شخصية' : 'Personal Skills',
      courses: [
        { id: 'ps-1', title: lang === 'ar' ? 'إدارة الوقت' : 'Time Management' },
        { id: 'ps-2', title: lang === 'ar' ? 'التواصل الفعال' : 'Effective Communication' },
        { id: 'ps-3', title: lang === 'ar' ? 'القيادة' : 'Leadership' }
      ]
    },
    {
      id: 'program-2',
      programNameL1: lang === 'ar' ? 'برنامج تطوير الويب' : 'Web Development Program',
      programNameL2: 'Web Development Program',
      programDescriptionL1: lang === 'ar' ? 'برنامج شامل لتطوير تطبيقات الويب الحديثة' : 'Comprehensive program for modern web application development',
      programDescriptionL2: 'Comprehensive program for modern web application development',
      programType: lang === 'ar' ? 'تطوير برمجيات' : 'Software Development',
      courses: [
        { id: 'wd-1', title: lang === 'ar' ? 'HTML و CSS' : 'HTML & CSS' },
        { id: 'wd-2', title: lang === 'ar' ? 'JavaScript' : 'JavaScript' },
        { id: 'wd-3', title: lang === 'ar' ? 'React.js' : 'React.js' },
        { id: 'wd-4', title: lang === 'ar' ? 'Node.js' : 'Node.js' }
      ]
    },
    {
      id: 'program-3',
      programNameL1: lang === 'ar' ? 'برنامج الذكاء الاصطناعي' : 'AI Program',
      programNameL2: 'AI Program',
      programDescriptionL1: lang === 'ar' ? 'برنامج متقدم في الذكاء الاصطناعي والتعلم الآلي' : 'Advanced program in artificial intelligence and machine learning',
      programDescriptionL2: 'Advanced program in artificial intelligence and machine learning',
      programType: lang === 'ar' ? 'ذكاء اصطناعي' : 'Artificial Intelligence',
      courses: [
        { id: 'ai-1', title: lang === 'ar' ? 'Python للذكاء الاصطناعي' : 'Python for AI' },
        { id: 'ai-2', title: lang === 'ar' ? 'التعلم الآلي' : 'Machine Learning' },
        { id: 'ai-3', title: lang === 'ar' ? 'الشبكات العصبية' : 'Neural Networks' },
        { id: 'ai-4', title: lang === 'ar' ? 'معالجة اللغة الطبيعية' : 'Natural Language Processing' }
      ]
    },
    {
      id: 'program-4',
      programNameL1: lang === 'ar' ? 'برنامج إدارة المشاريع' : 'Project Management Program',
      programNameL2: 'Project Management Program',
      programDescriptionL1: lang === 'ar' ? 'برنامج شامل في إدارة المشاريع وأدواتها' : 'Comprehensive program in project management and tools',
      programDescriptionL2: 'Comprehensive program in project management and tools',
      programType: lang === 'ar' ? 'إدارة مشاريع' : 'Project Management',
      courses: [
        { id: 'pm-1', title: lang === 'ar' ? 'أساسيات إدارة المشاريع' : 'Project Management Basics' },
        { id: 'pm-2', title: lang === 'ar' ? 'تخطيط المشاريع' : 'Project Planning' },
        { id: 'pm-3', title: lang === 'ar' ? 'إدارة المخاطر' : 'Risk Management' },
        { id: 'pm-4', title: lang === 'ar' ? 'أدوات إدارة المشاريع' : 'Project Management Tools' }
      ]
    }
  ];

  const defaultSkills = [
    {
      id: 'skill-1',
      title: lang === 'ar' ? 'مهارات التفاوض' : 'Negotiation Skills',
      description: lang === 'ar' ? 'تعلم فن التفاوض الفعال وتحقيق أفضل النتائج' : 'Learn the art of effective negotiation and achieving best results',
      skillType: lang === 'ar' ? 'مهارات شخصية' : 'Personal Skills'
    },
    {
      id: 'skill-2',
      title: lang === 'ar' ? 'التفكير النقدي' : 'Critical Thinking',
      description: lang === 'ar' ? 'تطوير مهارات التفكير النقدي والتحليل المنطقي' : 'Develop critical thinking skills and logical analysis',
      skillType: lang === 'ar' ? 'مهارات عقلية' : 'Mental Skills'
    },
    {
      id: 'skill-3',
      title: lang === 'ar' ? 'العمل الجماعي' : 'Teamwork',
      description: lang === 'ar' ? 'مهارات العمل ضمن فريق والتعاون الفعال' : 'Teamwork skills and effective collaboration',
      skillType: lang === 'ar' ? 'مهارات اجتماعية' : 'Social Skills'
    },
    {
      id: 'skill-4',
      title: lang === 'ar' ? 'حل المشكلات' : 'Problem Solving',
      description: lang === 'ar' ? 'منهجيات حل المشكلات واتخاذ القرارات السليمة' : 'Problem-solving methodologies and sound decision-making',
      skillType: lang === 'ar' ? 'مهارات تحليلية' : 'Analytical Skills'
    },
    {
      id: 'skill-5',
      title: lang === 'ar' ? 'التواصل الكتابي' : 'Written Communication',
      description: lang === 'ar' ? 'تحسين مهارات الكتابة والتواصل الكتابي' : 'Improve writing skills and written communication',
      skillType: lang === 'ar' ? 'مهارات تواصل' : 'Communication Skills'
    },
    {
      id: 'skill-6',
      title: lang === 'ar' ? 'إدارة التغيير' : 'Change Management',
      description: lang === 'ar' ? 'إدارة التغيير والتكيف مع البيئات المتغيرة' : 'Managing change and adapting to changing environments',
      skillType: lang === 'ar' ? 'مهارات إدارية' : 'Management Skills'
    }
  ];

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [coursesRes, projMastersRes, projDetailsRes, progDetailsRes] = await Promise.allSettled([
          api.getCourses(), // AcademyClaseMaster
          api.getProjects(), // ProjectsMaster
          api.getProjectsDetail(), // ProjectsDetail
          api.getPrograms() // ProgramsContentMaster (Program Details)
        ]);

        setCourses(Array.isArray(coursesRes.value) && coursesRes.value.length > 0 ? coursesRes.value : defaultCourses);
        setProjectMasters(Array.isArray(projMastersRes.value) && projMastersRes.value.length > 0 ? projMastersRes.value : [
          { id: 'pm-1', ProjectNameL1: lang === 'ar' ? 'مشروع تجريبي' : 'Sample Project', Description: lang === 'ar' ? 'وصف مشروع تجريبي' : 'Sample project description' }
        ]);
        setProjectDetails(Array.isArray(projDetailsRes.value) && projDetailsRes.value.length > 0 ? projDetailsRes.value : [
          { id: 'pd-1', ProjectNameL1: lang === 'ar' ? 'تفصيل تجريبي' : 'Sample Detail', Description: lang === 'ar' ? 'وصف تفصيلي تجريبي' : 'Sample project detail', ProjectsMasterId: 'pm-1' }
        ]);
        setProgramDetails(Array.isArray(progDetailsRes.value) && progDetailsRes.value.length > 0 ? progDetailsRes.value : defaultPrograms);
      } catch (error) {
        console.error('Error loading catalog data:', error);
        setCourses(defaultCourses);
        setProjectMasters([
          { id: 'pm-1', ProjectNameL1: lang === 'ar' ? 'مشروع تجريبي' : 'Sample Project', Description: lang === 'ar' ? 'وصف مشروع تجريبي' : 'Sample project description' }
        ]);
        setProjectDetails([
          { id: 'pd-1', ProjectNameL1: lang === 'ar' ? 'تفصيل تجريبي' : 'Sample Detail', Description: lang === 'ar' ? 'وصف تفصيلي تجريبي' : 'Sample project detail', ProjectsMasterId: 'pm-1' }
        ]);
        setProgramDetails(defaultPrograms);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang]);

  // Sync query with URL ?q= and debounce
  const [searchParams, setSearchParams] = useSearchParams();
  React.useEffect(() => {
    const qParam = searchParams.get('q') || '';
    setQuery(qParam);
    setDebouncedQuery(qParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(handler);
  }, [query]);

  React.useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) next.set('q', debouncedQuery); else next.delete('q');
    setSearchParams(next, { replace: true });
  }, [debouncedQuery]);

  const getFilteredData = (data) => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => {
      const values = [
        // Common
        item.title,
        item.name,
        item.description,
        // Projects Master
        item.ProjectNameL1, item.projectNameL1,
        item.ProjectNameL2, item.projectNameL2,
        item.Description,
        item.ProjectStart, item.projectStart,
        item.ProjectEnd, item.projectEnd,
        // Projects Detail
        item.ProjectsMasterId, item.projectsMasterId,
        // Program Details (sessions)
        item.SessionNameL1, item.sessionNameL1,
        item.SessionNameL2, item.sessionNameL2,
        item.SessionNo?.toString(),
        // IDs fallback search when user pastes UUID
        item.id, item.Id
      ].filter(Boolean).map((v) => String(v).toLowerCase());
      return values.some((v) => v.includes(q));
    });
  };

  const navigate = useNavigate();
  const filteredCourses = React.useMemo(() => getFilteredData(courses), [courses, debouncedQuery]);
  const filteredProjectMasters = React.useMemo(() => getFilteredData(projectMasters.map(pm => ({
    ...pm,
    title: pm.projectNameL1 || pm.ProjectNameL1 || '',
    description: pm.description || pm.Description || ''
  }))), [projectMasters, debouncedQuery]);
  const filteredProjectDetails = React.useMemo(() => getFilteredData(projectDetails.map(pd => ({
    ...pd,
    title: pd.projectNameL1 || pd.ProjectNameL1 || '',
    description: pd.description || pd.Description || ''
  }))), [projectDetails, debouncedQuery]);
  const filteredProgramDetails = React.useMemo(() => getFilteredData(programDetails.map(pr => ({
    ...pr,
    title: pr.SessionNameL1 || pr.sessionNameL1 || '',
    description: pr.Description || pr.description || ''
  }))), [programDetails, debouncedQuery]);

  const pmCount = filteredProjectMasters.length;
  const pdCount = filteredProjectDetails.length;
  const prCount = filteredProgramDetails.length;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {lang === 'ar' ? 'الكاتالوج' : 'Catalog'}
          </h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => (window.location.href = '/sessions')} className="academy-button rounded-full">
              {lang === 'ar' ? 'تقويم الجلسات' : 'Session Calendar'}
            </Button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="relative">
            <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'} text-white/60`} />
            <Input
              placeholder={lang === 'ar' ? 'ابحث في الكاتالوج...' : 'Search catalog...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} bg-white/5 border-white/20 text-white placeholder:text-white/60`}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'} text-white/60 hover:text-white/80 text-sm`}
                aria-label={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
              <TabsTrigger value="projectMasters" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                {lang === 'ar' ? 'Project Master' : 'Project Master'} {debouncedQuery && `(${pmCount})`}
              </TabsTrigger>
              <TabsTrigger value="projectDetails" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                {lang === 'ar' ? 'Project Details' : 'Project Details'} {debouncedQuery && `(${pdCount})`}
              </TabsTrigger>
              <TabsTrigger value="programDetails" className="text-white data-[state=active]:bg-primary data-[state=active]:text-white">
                {lang === 'ar' ? 'Program Details' : 'Program Details'} {debouncedQuery && `(${prCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projectMasters" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredProjectMasters.length === 0 ? (
                <div className="text-center text-white/80 py-16">
                  {lang === 'ar' ? 'لا توجد مشاريع' : 'No project masters found'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjectMasters.map((pm) => (
                    <motion.div key={pm.id} className="space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <ItemCard
                        title={pm.projectNameL1 || pm.ProjectNameL1 || pm.title || 'Project'}
                        subtitle={pm.description || pm.Description || ''}
                        meta={(pm.projectStart || pm.ProjectStart ? `${lang === 'ar' ? 'بداية' : 'Start'}: ${pm.projectStart || pm.ProjectStart}` : '')}
                        image={pm.image}
                        details={pm}
                        onView={() => navigate(`/project-details/${pm.id || pm.Id}`)}
                    />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="projectDetails" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredProjectDetails.length === 0 ? (
                <div className="text-center text-white/80 py-16">
                  {lang === 'ar' ? 'لا توجد تفاصيل مشاريع' : 'No project details found'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjectDetails.map((pd) => (
                    <motion.div key={pd.id} className="space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <ItemCard
                        title={pd.projectNameL1 || pd.ProjectNameL1 || pd.title || 'Project Detail'}
                        subtitle={pd.description || pd.Description || ''}
                        meta={pd.ProjectsMasterId ? `${lang === 'ar' ? 'مشروع رئيسي' : 'Master'}: ${pd.ProjectsMasterId}` : ''}
                        image={pd.image}
                        details={pd}
                        onView={() => navigate(`/project-details/${pd.ProjectsMasterId || pd.projectsMasterId || pd.id}`)}
                    />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="programDetails" className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredProgramDetails.length === 0 ? (
                <div className="text-center text-white/80 py-16">
                  {lang === 'ar' ? 'لا توجد تفاصيل برامج' : 'No program details found'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProgramDetails.map((pr) => (
                    <motion.div key={pr.id} className="space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    <ItemCard
                        title={pr.SessionNameL1 || pr.sessionNameL1 || 'Program'}
                        subtitle={pr.Description || pr.description || ''}
                        meta={pr.SessionNo ? `${lang === 'ar' ? 'رقم الجلسة' : 'Session No'}: ${pr.SessionNo}` : ''}
                        image={pr.image}
                        details={pr}
                        onView={() => navigate(`/program-details/${pr.id || pr.Id}`)}
                    />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default CatalogPage; 