import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Palette, 
  Network, 
  Globe, 
  TrendingUp, 
  MapPin, 
  Clock, 
  GraduationCap,
  ExternalLink,
  Search,
  Filter,
  Building,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';
import api from '../services/api';
import { toast, Toaster } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const JobsPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  
  // Academies and branches state
  const [academies, setAcademies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loadingAcademies, setLoadingAcademies] = useState(false);

  // Job form state
  const [jobForm, setJobForm] = useState({
    JobNameL1: '',
    JobNameL2: '',
    Description: '',
    JobLink: '',
    Experience: '',
    Level: '',
    Qualification: '',
    JobCategory: '',
    Location: '',
    Salary: '',
    Type: '',
    Requirements: '',
    AcademyDataId: '',
    BranchesDataId: ''
  });

  const jobCategories = [
    {
      id: 'graphicDesigner',
      name: t('jobs.categories.graphicDesigner'),
      icon: Palette,
      color: 'bg-purple-500',
      description: lang === 'ar' ? 'تصميم الهويات البصرية والمواد الإعلانية' : 'Design visual identities and advertising materials',
      count: 0
    },
    {
      id: 'networkEngineer',
      name: t('jobs.categories.networkEngineer'),
      icon: Network,
      color: 'bg-blue-500',
      description: lang === 'ar' ? 'إدارة وصيانة البنية التحتية للشبكات' : 'Manage and maintain network infrastructure',
      count: 0
    },
    {
      id: 'webDesigner',
      name: t('jobs.categories.webDesigner'),
      icon: Globe,
      color: 'bg-green-500',
      description: lang === 'ar' ? 'تصميم وتطوير المواقع الإلكترونية' : 'Design and develop websites',
      count: 0
    },
    {
      id: 'digitalMarketer',
      name: t('jobs.categories.digitalMarketer'),
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: lang === 'ar' ? 'التسويق الرقمي وإدارة الحملات الإعلانية' : 'Digital marketing and campaign management',
      count: 0
    },
    {
      id: 'general',
      name: lang === 'ar' ? 'عام' : 'General',
      icon: Briefcase,
      color: 'bg-gray-500',
      description: lang === 'ar' ? 'وظائف عامة ومتنوعة' : 'General and miscellaneous jobs',
      count: 0
    }
  ];

  // بيانات تجريبية للوظائف
  const mockJobs = [
    {
      id: '1',
      jobNo: 1001,
      jobNameL1: lang === 'ar' ? 'مصمم جرافيك مبدع' : 'Creative Graphic Designer',
      jobNameL2: 'Creative Graphic Designer',
      description: lang === 'ar' 
        ? 'نبحث عن مصمم جرافيك مبدع لانضمامه لفريقنا التعليمي لتصميم المواد البصرية والهويات البصرية للمنصات التعليمية والمواد الإعلانية'
        : 'We are looking for a creative graphic designer to join our educational team to design visual materials and brand identities for educational platforms and advertising materials',
      jobLink: 'https://example.com/apply',
      category: 'graphicDesigner',
      experience: lang === 'ar' ? 'من 2-4 سنوات' : '2-4 years',
      level: lang === 'ar' ? 'متوسط' : 'Mid-level',
      qualification: lang === 'ar' ? 'بكالوريوس تصميم جرافيك أو الفنون الجميلة' : 'Bachelor in Graphic Design or Fine Arts',
      jobCategory: lang === 'ar' ? 'تصميم' : 'Design',
      location: lang === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
      salary: lang === 'ar' ? '5000-8000 جنيه مصري' : '5000-8000 EGP',
      type: lang === 'ar' ? 'دوام كامل' : 'Full-time',
      postedDate: lang === 'ar' ? 'منذ 3 أيام' : '3 days ago',
      requirements: lang === 'ar' ? [
        'خبرة في برامج Adobe Creative Suite',
        'مهارات في تصميم الهويات البصرية',
        'القدرة على العمل ضمن فريق',
        'الإبداع والاهتمام بالتفاصيل'
      ] : [
        'Experience with Adobe Creative Suite',
        'Skills in visual identity design',
        'Ability to work within a team',
        'Creativity and attention to detail'
      ]
    },
    {
      id: '2',
      jobNo: 1002,
      jobNameL1: lang === 'ar' ? 'مهندس شبكات متقدم' : 'Senior Network Engineer',
      jobNameL2: 'Senior Network Engineer',
      description: lang === 'ar'
        ? 'مهندس شبكات ذو خبرة لإدارة البنية التحتية للشبكات وتطويرها وضمان أمان وسرعة الاتصال'
        : 'Experienced network engineer to manage and develop network infrastructure and ensure security and connection speed',
      jobLink: 'https://example.com/apply',
      category: 'networkEngineer',
      experience: lang === 'ar' ? 'من 5-7 سنوات' : '5-7 years',
      level: lang === 'ar' ? 'متقدم' : 'Senior',
      qualification: lang === 'ar' ? 'بكالوريوس هندسة حاسبات أو تقنية المعلومات' : 'Bachelor in Computer Engineering or IT',
      jobCategory: lang === 'ar' ? 'تقنية' : 'Technology',
      location: lang === 'ar' ? 'الإسكندرية، مصر' : 'Alexandria, Egypt',
      salary: lang === 'ar' ? '8000-12000 جنيه مصري' : '8000-12000 EGP',
      type: lang === 'ar' ? 'دوام كامل' : 'Full-time',
      postedDate: lang === 'ar' ? 'منذ أسبوع' : '1 week ago',
      requirements: lang === 'ar' ? [
        'خبرة في إدارة الشبكات والبنية التحتية',
        'معرفة ببروتوكولات الشبكات',
        'شهادات Cisco أو Microsoft',
        'مهارات حل المشاكل'
      ] : [
        'Experience in network and infrastructure management',
        'Knowledge of network protocols',
        'Cisco or Microsoft certifications',
        'Problem-solving skills'
      ]
    },
    {
      id: '3',
      jobNo: 1003,
      jobNameL1: lang === 'ar' ? 'مطور مواقع ويب' : 'Web Developer',
      jobNameL2: 'Web Developer',
      description: lang === 'ar'
        ? 'مطور مواقع ويب لتصميم وتطوير المواقع الإلكترونية والمنصات التعليمية باستخدام أحدث التقنيات'
        : 'Web developer to design and develop websites and educational platforms using the latest technologies',
      jobLink: 'https://example.com/apply',
      category: 'webDesigner',
      experience: lang === 'ar' ? 'من 3-5 سنوات' : '3-5 years',
      level: lang === 'ar' ? 'متوسط' : 'Mid-level',
      qualification: lang === 'ar' ? 'بكالوريوس علوم حاسبات أو هندسة برمجيات' : 'Bachelor in Computer Science or Software Engineering',
      jobCategory: lang === 'ar' ? 'تطوير' : 'Development',
      location: lang === 'ar' ? 'الجيزة، مصر' : 'Giza, Egypt',
      salary: lang === 'ar' ? '6000-10000 جنيه مصري' : '6000-10000 EGP',
      type: lang === 'ar' ? 'دوام كامل' : 'Full-time',
      postedDate: lang === 'ar' ? 'منذ 5 أيام' : '5 days ago',
      requirements: lang === 'ar' ? [
        'خبرة في React, Angular, أو Vue.js',
        'معرفة بقواعد البيانات SQL و NoSQL',
        'خبرة في تطوير APIs',
        'مهارات في تصميم واجهات المستخدم'
      ] : [
        'Experience with React, Angular, or Vue.js',
        'Knowledge of SQL and NoSQL databases',
        'Experience in API development',
        'UI/UX design skills'
      ]
    },
    {
      id: '4',
      jobNo: 1004,
      jobNameL1: lang === 'ar' ? 'مسوق رقمي' : 'Digital Marketer',
      jobNameL2: 'Digital Marketer',
      description: lang === 'ar'
        ? 'مسوق رقمي لإدارة الحملات الإعلانية والتسويق عبر وسائل التواصل الاجتماعي وزيادة الوعي بالعلامة التجارية'
        : 'Digital marketer to manage advertising campaigns and social media marketing and increase brand awareness',
      jobLink: 'https://example.com/apply',
      category: 'digitalMarketer',
      experience: lang === 'ar' ? 'من 2-4 سنوات' : '2-4 years',
      level: lang === 'ar' ? 'متوسط' : 'Mid-level',
      qualification: lang === 'ar' ? 'بكالوريوس تسويق أو إدارة أعمال' : 'Bachelor in Marketing or Business Administration',
      jobCategory: lang === 'ar' ? 'تسويق' : 'Marketing',
      location: lang === 'ar' ? 'المنصورة، مصر' : 'Mansoura, Egypt',
      salary: lang === 'ar' ? '4000-7000 جنيه مصري' : '4000-7000 EGP',
      type: lang === 'ar' ? 'دوام كامل' : 'Full-time',
      postedDate: lang === 'ar' ? 'منذ يومين' : '2 days ago',
      requirements: lang === 'ar' ? [
        'خبرة في إدارة حسابات وسائل التواصل الاجتماعي',
        'معرفة بأدوات التسويق الرقمي',
        'مهارات في تحليل البيانات',
        'القدرة على إدارة الميزانيات'
      ] : [
        'Experience in managing social media accounts',
        'Knowledge of digital marketing tools',
        'Data analysis skills',
        'Budget management ability'
      ]
    }
  ];

  useEffect(() => {
    loadJobs();
    checkAdminStatus();
    if (isAdmin) {
      loadAcademies();
    }
  }, [isAdmin]);

  // Load academies and branches for admin
  const loadAcademies = async () => {
    if (!isAdmin) return;
    
    setLoadingAcademies(true);
    try {
      const [academiesData, branchesData] = await Promise.all([
        api.getAcademies(),
        api.getBranches()
      ]);
      
      if (academiesData && Array.isArray(academiesData)) {
        setAcademies(academiesData);
      }
      
      if (branchesData && Array.isArray(branchesData)) {
        setBranches(branchesData);
      }
    } catch (error) {
      console.error('Error loading academies and branches:', error);
      setAcademies([]);
      setBranches([]);
    } finally {
      setLoadingAcademies(false);
    }
  };

  // Check if user is admin
  const checkAdminStatus = () => {
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');
      const userEmail = localStorage.getItem('userEmail') || '';
      const userRole = user.role || user.Role || '';
      
      const adminStatus = userRole === 'SupportAgent' || 
                         userRole === 'Admin' || 
                         userRole === 'admin' || 
                         userEmail === 'yjmt469999@gmail.com';
      
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Load Programs Content Detail data from admin panel
      const programsData = await api.getProgramsContentDetail();
      console.log('Programs data from API:', programsData);
      
      if (programsData && Array.isArray(programsData)) {
        // Transform Programs Content Detail data into job format
        const transformedJobs = programsData.map((program, index) => {
          console.log('Processing program:', program);
          return {
            id: program.id || (index + 1),
            jobNo: 1000 + index,
            jobNameL1: program.Title || program.title || (lang === 'ar' ? 'برنامج تدريبي' : 'Training Program'),
            jobNameL2: program.Title || program.title || 'Training Program',
            description: program.Description || program.description || (lang === 'ar' 
              ? 'برنامج تدريبي في مجال' + (program.ProgramsContentMasterId ? 'متقدم' : 'أساسي') + ' مع محتوى تعليمي متقدم'
              : 'Advanced training program with educational content in ' + (program.ProgramsContentMasterId ? 'advanced' : 'basic') + ' level'),
            jobLink: program.SessionVideo || program.sessionVideo || '',
            category: 'general',
            category: 'general',
            experience: '1-2 سنوات' || '1-2 years',
            level: 'متوسط' || 'Mid-level',
            qualification: 'بكالوريوس' || 'Bachelor',
            location: 'أونلاين' || 'Online',
            salary: 'يحدد لاحقاً' || 'To be determined',
            type: 'دوام كامل' || 'Full-time',
            postedDate: program.createdAt ? new Date(program.createdAt).toLocaleDateString() : (lang === 'ar' ? 'منذ يومين' : '2 days ago'),
            requirements: program.Description ? [program.Description] : ['المتطلبات سيتم تحديدها']
          };
        });
        console.log('Transformed jobs from programs:', transformedJobs);
        setJobs(transformedJobs);
      } else {
        console.log('No programs data found, using mock jobs');
        // استخدام البيانات التجريبية كاحتياط خلفي
        setJobs(mockJobs);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      console.log('Using mock jobs due to error');
      // استخدام البيانات التجريبية في حالة الخطأ
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  // Form handling functions
  const openCreateForm = () => {
    setSelectedJob(null);
    setViewMode(false);
    setJobForm({
      JobNameL1: '',
      JobNameL2: '',
      Description: '',
      JobLink: '',
      Experience: '',
      Level: '',
      Qualification: '',
      JobCategory: '',
      Location: '',
      Salary: '',
      Type: '',
      Requirements: '',
      AcademyDataId: '',
      BranchesDataId: ''
    });
    setIsFormOpen(true);
  };

  const openEditForm = (job) => {
    setSelectedJob(job);
    setViewMode(false);
    setJobForm({
      JobNameL1: job.jobNameL1 || job.JobNameL1 || '',
      JobNameL2: job.jobNameL2 || job.JobNameL2 || '',
      Description: job.description || job.Description || '',
      JobLink: job.jobLink || job.JobLink || '',
      Experience: job.experience || job.Experience || '',
      Level: job.level || job.Level || '',
      Qualification: job.qualification || job.Qualification || '',
      JobCategory: job.jobCategory || job.JobCategory || '',
      Location: job.location || job.Location || '',
      Salary: job.salary || job.Salary || '',
      Type: job.type || job.Type || '',
      Requirements: job.requirements ? (Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements) : '',
      AcademyDataId: job.academyDataId || job.AcademyDataId || '',
      BranchesDataId: job.branchesDataId || job.BranchesDataId || ''
    });
    setIsFormOpen(true);
  };

  const openViewDetails = (job) => {
    setSelectedJob(job);
    setViewMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // إضافة البيانات الأساسية من API
      formData.append('JobNameL1', jobForm.JobNameL1);
      formData.append('JobNameL2', jobForm.JobNameL2);
      formData.append('Description', jobForm.Description);
      formData.append('JobLink', jobForm.JobLink);
      
      // إضافة الحقول الإضافية
      if (jobForm.Experience) {
        formData.append('Experience', jobForm.Experience);
      }
      if (jobForm.Level) {
        formData.append('Level', jobForm.Level);
      }
      if (jobForm.Qualification) {
        formData.append('Qualification', jobForm.Qualification);
      }
      if (jobForm.JobCategory) {
        formData.append('JobCategory', jobForm.JobCategory);
      }
      if (jobForm.Location) {
        formData.append('Location', jobForm.Location);
      }
      if (jobForm.Salary) {
        formData.append('Salary', jobForm.Salary);
      }
      if (jobForm.Type) {
        formData.append('Type', jobForm.Type);
      }
      if (jobForm.Requirements) {
        formData.append('Requirements', jobForm.Requirements);
      }
      if (jobForm.AcademyDataId) {
        formData.append('AcademyDataId', jobForm.AcademyDataId);
      }
      if (jobForm.BranchesDataId) {
        formData.append('BranchesDataId', jobForm.BranchesDataId);
      }

      if (selectedJob) {
        // Update existing job
        await api.updateJob(selectedJob.id, formData);
        toast.success(lang === 'ar' ? 'تم تحديث الوظيفة بنجاح' : 'Job updated successfully');
      } else {
        // Create new job
        await api.createJob(formData);
        toast.success(lang === 'ar' ? 'تم إنشاء الوظيفة بنجاح' : 'Job created successfully');
      }
      
      setIsFormOpen(false);
      loadJobs(); // Reload jobs
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error(lang === 'ar' ? 'خطأ في حفظ الوظيفة' : 'Error saving job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (job) => {
    setJobToDelete(job);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      await api.deleteJob(jobToDelete.id);
      toast.success(lang === 'ar' ? 'تم حذف الوظيفة بنجاح' : 'Job deleted successfully');
      loadJobs(); // Reload jobs
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف الوظيفة' : 'Error deleting job');
    } finally {
      setShowDeleteDialog(false);
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesSearch = job.jobNameL1.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.jobNameL2.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // حساب عدد الوظائف لكل فئة
  const categoryCounts = jobCategories.map(category => ({
    ...category,
    count: jobs.filter(job => job.category === category.id).length
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/90">{t('jobs.loading')}</p>
          </div>
        </div>
      </section>
    );
  }

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
            {t('jobs.title')}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {t('jobs.subtitle')}
          </p>
          {isAdmin && (
            <div className="mt-6">
              <Button onClick={openCreateForm} className="rounded-full academy-button inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> {lang === 'ar' ? 'إضافة وظيفة' : 'Add Job'}
              </Button>
            </div>
          )}
        </motion.div>

        {/* أقسام الوظائف */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {categoryCounts.map((category) => (
            <motion.div
              key={category.id}
              variants={itemVariants}
              className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:bg-white/20 transition-all duration-300 ${selectedCategory === category.id ? 'ring-2 ring-white/30' : ''}`}
              onClick={() => setSelectedCategory(category.id === selectedCategory ? 'all' : category.id)}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${category.color} flex items-center justify-center`}>
                <category.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {category.name}
              </h3>
              <p className="text-white/70 text-sm mb-3">
                {category.description}
              </p>
              <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                {category.count} {lang === 'ar' ? 'وظيفة' : 'jobs'}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* البحث والفلترة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن وظيفة...' : 'Search for a job...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <Button
              onClick={() => setSelectedCategory('all')}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              <Filter className="w-4 h-4 mr-2" />
              {lang === 'ar' ? 'عرض الكل' : 'Show All'}
            </Button>
          </div>
        </motion.div>

        {/* قائمة الوظائف */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {filteredJobs.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <Briefcase className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">{t('jobs.noJobs')}</p>
            </motion.div>
          ) : (
            filteredJobs.map((job) => {
              console.log('Rendering job:', job);
              return (
              <motion.div
                key={job.id}
                variants={itemVariants}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {job.jobNameL1}
                        </h3>
                        <p className="text-white/70 mb-4">
                          {job.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          #{job.jobNo}
                        </span>
                      </div>
                    </div>

                    {/* تفاصيل الوظيفة الأساسية */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'الخبرة' : 'Experience'}</p>
                          <p className="text-white font-medium">{job.experience || (lang === 'ar' ? 'يحدد لاحقاً' : 'To be determined')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'المستوى' : 'Level'}</p>
                          <p className="text-white font-medium">{job.level || (lang === 'ar' ? 'يحدد لاحقاً' : 'To be determined')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'المؤهل' : 'Qualification'}</p>
                          <p className="text-white font-medium">{job.qualification || (lang === 'ar' ? 'يحدد لاحقاً' : 'To be determined')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'الفئة' : 'Category'}</p>
                          <p className="text-white font-medium">{job.jobCategory || (lang === 'ar' ? 'عام' : 'General')}</p>
                        </div>
                      </div>
                    </div>

                    {/* معلومات إضافية */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'الموقع' : 'Location'}</p>
                          <p className="text-white font-medium">{job.location || (lang === 'ar' ? 'يحدد لاحقاً' : 'To be determined')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'الراتب' : 'Salary'}</p>
                          <p className="text-white font-medium">{job.salary || (lang === 'ar' ? 'يحدد لاحقاً' : 'To be determined')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'نوع العمل' : 'Job Type'}</p>
                          <p className="text-white font-medium">{job.type || (lang === 'ar' ? 'دوام كامل' : 'Full-time')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/50" />
                        <div>
                          <p className="text-white/50 text-xs">{lang === 'ar' ? 'تاريخ النشر' : 'Posted'}</p>
                          <p className="text-white font-medium">{job.postedDate || (lang === 'ar' ? 'منذ وقت قصير' : 'Recently posted')}</p>
                        </div>
                      </div>
                    </div>

                    {/* المتطلبات */}
                    {job.requirements && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-3">
                          {lang === 'ar' ? 'المتطلبات:' : 'Requirements:'}
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-white/80">
                              <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                    <Button
                      onClick={() => window.open(job.jobLink, '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('jobs.jobDetails.apply')}
                    </Button>
                    <Button
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                      onClick={() => openViewDetails(job)}
                    >
                      {t('jobs.jobDetails.viewDetails')}
                    </Button>
                    
                    {/* Admin action buttons */}
                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => openEditForm(job)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {lang === 'ar' ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button
                          onClick={() => handleDelete(job)}
                          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {lang === 'ar' ? 'حذف' : 'Delete'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
            })
          )}
        </motion.div>
      </div>

      {/* Job Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewMode
                ? (lang === 'ar' ? 'تفاصيل الوظيفة' : 'Job Details')
                : selectedJob 
                ? (lang === 'ar' ? 'تعديل الوظيفة' : 'Edit Job')
                  : (lang === 'ar' ? 'إضافة وظيفة جديدة' : 'Add New Job')}
            </DialogTitle>
            <DialogDescription>
              {viewMode
                ? (lang === 'ar' ? 'عرض تفاصيل الوظيفة' : 'View job details')
                : selectedJob 
                ? (lang === 'ar' ? 'قم بتعديل بيانات الوظيفة' : 'Edit job information')
                  : (lang === 'ar' ? 'أدخل بيانات الوظيفة الجديدة' : 'Enter new job information')}
            </DialogDescription>
          </DialogHeader>
          {viewMode && selectedJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{lang === 'ar' ? 'الوظيفة' : 'Job'}</Label>
                  <div className="mt-1 text-sm">{selectedJob.jobNameL1 || selectedJob.JobNameL1}</div>
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'الوظيفة (EN)' : 'Job (EN)'}</Label>
                  <div className="mt-1 text-sm">{selectedJob.jobNameL2 || selectedJob.JobNameL2}</div>
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'الفئة' : 'Category'}</Label>
                  <div className="mt-1 text-sm">{selectedJob.jobCategory || selectedJob.JobCategory}</div>
                </div>
                <div>
                  <Label>{lang === 'ar' ? 'الموقع' : 'Location'}</Label>
                  <div className="mt-1 text-sm">{selectedJob.location || selectedJob.Location}</div>
                </div>
              </div>
              <div>
                <Label>{lang === 'ar' ? 'الوصف' : 'Description'}</Label>
                <div className="mt-1 text-sm whitespace-pre-wrap">{selectedJob.description || selectedJob.Description}</div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>
          )}

          {!viewMode && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="JobNameL1">{lang === 'ar' ? 'اسم الوظيفة (عربي)*' : 'Job Name (Arabic)*'}</Label>
                <Input
                  id="JobNameL1"
                  value={jobForm.JobNameL1}
                  onChange={(e) => setJobForm({...jobForm, JobNameL1: e.target.value})}
                  placeholder={lang === 'ar' ? 'أدخل اسم الوظيفة بالعربية' : 'Enter job name in Arabic'}
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="JobNameL2">{lang === 'ar' ? 'اسم الوظيفة (إنجليزي)' : 'Job Name (English)'}</Label>
                <Input
                  id="JobNameL2"
                  value={jobForm.JobNameL2}
                  onChange={(e) => setJobForm({...jobForm, JobNameL2: e.target.value})}
                  placeholder={lang === 'ar' ? 'أدخل اسم الوظيفة بالإنجليزية' : 'Enter job name in English'}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="JobNameL2">{lang === 'ar' ? 'اسم الوظيفة (إنجليزي)' : 'Job Name (English)'}</Label>
                <Input
                  id="JobNameL2"
                  value={jobForm.JobNameL2}
                  onChange={(e) => setJobForm({...jobForm, JobNameL2: e.target.value})}
                  placeholder={lang === 'ar' ? 'أدخل اسم الوظيفة بالإنجليزية' : 'Enter job name in English'}
                  maxLength={100}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="JobLink">{lang === 'ar' ? 'رابط التقديم' : 'Application Link'}</Label>
                <Input
                  id="JobLink"
                  type="url"
                  value={jobForm.JobLink}
                  onChange={(e) => setJobForm({...jobForm, JobLink: e.target.value})}
                  placeholder={lang === 'ar' ? 'أدخل رابط التقديم' : 'Enter application link'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="Description">{lang === 'ar' ? 'وصف الوظيفة*' : 'Job Description*'}</Label>
              <Textarea
                id="Description"
                value={jobForm.Description}
                onChange={(e) => setJobForm({...jobForm, Description: e.target.value})}
                placeholder={lang === 'ar' ? 'أدخل وصف الوظيفة' : 'Enter job description'}
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Experience">{lang === 'ar' ? 'الخبرة المطلوبة' : 'Experience Required'}</Label>
                <Input
                  id="Experience"
                  value={jobForm.Experience}
                  onChange={(e) => setJobForm({...jobForm, Experience: e.target.value})}
                  placeholder={lang === 'ar' ? 'مثال: من 2-4 سنوات' : 'Example: 2-4 years'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="Level">{lang === 'ar' ? 'المستوى' : 'Level'}</Label>
                <Input
                  id="Level"
                  value={jobForm.Level}
                  onChange={(e) => setJobForm({...jobForm, Level: e.target.value})}
                  placeholder={lang === 'ar' ? 'مثال: مبتدئ، متوسط، متقدم' : 'Example: Junior, Mid, Senior'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Qualification">{lang === 'ar' ? 'المؤهل المطلوب' : 'Required Qualification'}</Label>
                <Input
                  id="Qualification"
                  value={jobForm.Qualification}
                  onChange={(e) => setJobForm({...jobForm, Qualification: e.target.value})}
                  placeholder={lang === 'ar' ? 'أدخل المؤهل المطلوب' : 'Enter required qualification'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="JobCategory">{lang === 'ar' ? 'فئة الوظيفة' : 'Job Category'}</Label>
                <Input
                  id="JobCategory"
                  value={jobForm.JobCategory}
                  onChange={(e) => setJobForm({...jobForm, JobCategory: e.target.value})}
                  placeholder={lang === 'ar' ? 'مثال: تصميم، تقنية، تسويق' : 'Example: Design, Technology, Marketing'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Location">{lang === 'ar' ? 'الموقع' : 'Location'}</Label>
                <Input
                  id="Location"
                  value={jobForm.Location}
                  onChange={(e) => setJobForm({...jobForm, Location: e.target.value})}
                  placeholder={lang === 'ar' ? 'أدخل موقع الوظيفة' : 'Enter job location'}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="Salary">{lang === 'ar' ? 'الراتب' : 'Salary'}</Label>
                <Input
                  id="Salary"
                  value={jobForm.Salary}
                  onChange={(e) => setJobForm({...jobForm, Salary: e.target.value})}
                  placeholder={lang === 'ar' ? 'أدخل نطاق الراتب' : 'Enter salary range'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Type">{lang === 'ar' ? 'نوع العمل' : 'Job Type'}</Label>
                <Input
                  id="Type"
                  value={jobForm.Type}
                  onChange={(e) => setJobForm({...jobForm, Type: e.target.value})}
                  placeholder={lang === 'ar' ? 'مثال: دوام كامل، دوام جزئي' : 'Example: Full-time, Part-time'}
                />
              </div>
              
                                <div className="space-y-2">
                    <Label htmlFor="AcademyDataId">{lang === 'ar' ? 'الأكاديمية*' : 'Academy*'}</Label>
                    <select
                      id="AcademyDataId"
                      value={jobForm.AcademyDataId}
                      onChange={(e) => setJobForm({...jobForm, AcademyDataId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loadingAcademies}
                    >
                      <option value="">
                        {loadingAcademies 
                          ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...')
                          : (academies.length === 0 
                              ? (lang === 'ar' ? 'لا توجد أكاديميات متاحة' : 'No academies available')
                              : (lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy')
                            )
                        }
                      </option>
                      {academies.map(academy => (
                        <option key={academy.id} value={academy.id}>
                          {academy.academyNameL1 || academy.AcademyNameL1 || academy.academyNameL2 || academy.AcademyNameL2 || academy.name || academy.id}
                        </option>
                      ))}
                    </select>
                    {academies.length === 0 && !loadingAcademies && (
                      <div className="space-y-2">
                        <p className="text-sm text-red-500">
                          {lang === 'ar' 
                            ? 'يجب إنشاء أكاديمية أولاً قبل إضافة الوظائف'
                            : 'You must create an academy first before adding jobs'
                          }
                        </p>
                        <Button
                          type="button"
                          onClick={loadAcademies}
                          className="text-xs px-3 py-1"
                          variant="outline"
                          disabled={loadingAcademies}
                        >
                          {loadingAcademies 
                            ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...')
                            : (lang === 'ar' ? 'إعادة المحاولة' : 'Retry')
                          }
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="BranchesDataId">{lang === 'ar' ? 'الفرع (اختياري)' : 'Branch (Optional)'}</Label>
                    <select
                      id="BranchesDataId"
                      value={jobForm.BranchesDataId}
                      onChange={(e) => setJobForm({...jobForm, BranchesDataId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingAcademies}
                    >
                      <option value="">
                        {loadingAcademies 
                          ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...')
                          : (lang === 'ar' ? 'اختر الفرع (اختياري)' : 'Select Branch (Optional)')
                        }
                      </option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.branchNameL1 || branch.BranchNameL1 || branch.branchNameL2 || branch.BranchNameL2 || branch.name || branch.id}
                        </option>
                      ))}
                    </select>
                  </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="Requirements">{lang === 'ar' ? 'المتطلبات' : 'Requirements'}</Label>
              <Textarea
                id="Requirements"
                value={jobForm.Requirements}
                onChange={(e) => setJobForm({...jobForm, Requirements: e.target.value})}
                placeholder={lang === 'ar' ? 'أدخل المتطلبات (سطر واحد لكل متطلب)' : 'Enter requirements (one per line)'}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="academy-button"
              >
                {isSubmitting 
                  ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : (selectedJob 
                      ? (lang === 'ar' ? 'تحديث' : 'Update')
                      : (lang === 'ar' ? 'إضافة' : 'Add')
                    )
                }
              </Button>
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'ar' 
                ? `هل أنت متأكد من حذف الوظيفة "${jobToDelete?.jobNameL1 || jobToDelete?.JobNameL1}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the job "${jobToDelete?.jobNameL1 || jobToDelete?.JobNameL1}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Toast notifications */}
      <Toaster />
    </section>
  );
};

export default JobsPage; 