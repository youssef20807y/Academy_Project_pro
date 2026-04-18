import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// بيانات افتراضية للبرامج
const defaultPrograms = [
  {
    id: 1,
    sessionNameL1: 'برنامج تطوير تطبيقات الويب',
    sessionNameL2: 'Web Application Development Program',
    description: 'برنامج شامل لتعلم تطوير تطبيقات الويب الحديثة باستخدام React و Node.js'
  },
  {
    id: 2,
    sessionNameL1: 'برنامج تطوير التطبيقات المحمولة',
    sessionNameL2: 'Mobile App Development Program',
    description: 'تعلم تطوير تطبيقات iOS و Android باستخدام React Native و Flutter'
  },
  {
    id: 3,
    sessionNameL1: 'برنامج قواعد البيانات المتقدمة',
    sessionNameL2: 'Advanced Database Program',
    description: 'إتقان تصميم وإدارة قواعد البيانات باستخدام MySQL و MongoDB و PostgreSQL'
  },
  {
    id: 4,
    sessionNameL1: 'برنامج الذكاء الاصطناعي والتعلم الآلي',
    sessionNameL2: 'AI and Machine Learning Program',
    description: 'مقدمة شاملة للذكاء الاصطناعي والتعلم الآلي باستخدام Python و TensorFlow'
  },
  {
    id: 5,
    sessionNameL1: 'برنامج الأمن السيبراني',
    sessionNameL2: 'Cybersecurity Program',
    description: 'تعلم أساسيات الأمن السيبراني وحماية البيانات والشبكات'
  },
  {
    id: 6,
    sessionNameL1: 'برنامج DevOps والنشر المستمر',
    sessionNameL2: 'DevOps and CI/CD Program',
    description: 'إتقان ممارسات DevOps وأدوات النشر المستمر مثل Docker و Kubernetes'
  },
  {
    id: 7,
    sessionNameL1: 'برنامج تطوير الألعاب',
    sessionNameL2: 'Game Development Program',
    description: 'تعلم تطوير الألعاب باستخدام Unity و Unreal Engine'
  },
  {
    id: 8,
    sessionNameL1: 'برنامج تحليل البيانات',
    sessionNameL2: 'Data Analytics Program',
    description: 'تعلم تحليل البيانات وإعداد التقارير باستخدام Python و R'
  },
  {
    id: 9,
    sessionNameL1: 'برنامج تطوير واجهات المستخدم',
    sessionNameL2: 'UI/UX Development Program',
    description: 'تصميم وتطوير واجهات مستخدم جذابة ومتجاوبة'
  },
  {
    id: 10,
    sessionNameL1: 'برنامج تطوير الخوادم الخلفية',
    sessionNameL2: 'Backend Development Program',
    description: 'تطوير APIs والخوادم الخلفية باستخدام Node.js و Python و Java'
  }
];

const ProgramForm = ({ program, onSubmit, onCancel, loading = false }) => {
  const { lang } = useI18n();
  
  console.log('ProgramForm rendered with program:', program);
  console.log('Program sessionNameL1:', program?.sessionNameL1);
  console.log('Program SessionNameL1:', program?.SessionNameL1);
  const [masters, setMasters] = React.useState([]);
  const [mastersLoading, setMastersLoading] = React.useState(false);
  const [mastersError, setMastersError] = React.useState('');
  React.useEffect(() => {
    let isMounted = true;
    setMastersLoading(true);
    setMastersError('');
    api.getProgramsContentMaster()
      .then((res) => {
        const raw = res?.data ?? res;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
        if (isMounted) setMasters(list);
      })
      .catch((err) => {
        console.error('Failed to load ProgramsContentMaster list', err);
        if (isMounted) setMastersError(lang === 'ar' ? 'تعذر تحميل البرامج الرئيسية' : 'Failed to load program masters');
      })
      .finally(() => {
        if (isMounted) setMastersLoading(false);
      });
    return () => { isMounted = false; };
  }, [lang]);
  
  const [formData, setFormData] = React.useState({
    id: program?.id || '',
    ProgramsContentMasterId: program?.ProgramsContentMasterId || program?.programsContentMasterId || '',
    SessionNameL1: program?.sessionNameL1 || program?.SessionNameL1 || '',
    SessionNameL2: program?.sessionNameL2 || program?.SessionNameL2 || '',
    Description: program?.description || program?.Description || ''
  });
  
  console.log('Form initialized with formData:', formData);
  console.log('Initial SessionNameL1:', formData.SessionNameL1);
  
  // Update form data when program changes
  React.useEffect(() => {
    console.log('Program changed, updating form data:', program);
    setFormData({
      id: program?.id || '',
      ProgramsContentMasterId: program?.ProgramsContentMasterId || program?.programsContentMasterId || '',
      SessionNameL1: program?.sessionNameL1 || program?.SessionNameL1 || '',
      SessionNameL2: program?.sessionNameL2 || program?.SessionNameL2 || '',
      Description: program?.description || program?.Description || ''
    });
  }, [program]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submit triggered with formData:', formData);
    
    // تنظيف البيانات بنفس طريقة صفحة المسؤول
    const cleanedData = { ...formData };
    
    // إزالة الحقول الفارغة
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === null || cleanedData[key] === undefined || cleanedData[key] === '') {
        delete cleanedData[key];
      }
    });
    
    if (!formData.ProgramsContentMasterId || String(formData.ProgramsContentMasterId).trim() === '') {
      alert(lang === 'ar' ? 'المعرف ProgramsContentMasterId مطلوب' : 'ProgramsContentMasterId is required');
      return;
    }

    if (!formData.SessionNameL1 || formData.SessionNameL1.trim() === '') {
      console.error('SessionNameL1 validation failed:', formData.SessionNameL1);
      alert(lang === 'ar' ? 'اسم البرنامج مطلوب' : 'Program name is required');
      return;
    }
 
    // قص المسافات
    if (cleanedData.ProgramsContentMasterId) cleanedData.ProgramsContentMasterId = String(cleanedData.ProgramsContentMasterId).trim();
    if (cleanedData.SessionNameL1) cleanedData.SessionNameL1 = cleanedData.SessionNameL1.trim();
    if (cleanedData.SessionNameL2) cleanedData.SessionNameL2 = cleanedData.SessionNameL2.trim();
    if (cleanedData.Description) cleanedData.Description = cleanedData.Description.trim();
 
    if (cleanedData.SessionNameL1 === '') {
      console.error('SessionNameL1 is empty after trimming');
      alert(lang === 'ar' ? 'اسم البرنامج لا يمكن أن يكون فارغاً' : 'Program name cannot be empty');
      return;
    }
    
    console.log('Form submitting with cleaned data:', cleanedData);
    console.log('SessionNameL1 final value:', cleanedData.SessionNameL1);
    console.log('SessionNameL1 final length:', cleanedData.SessionNameL1.length);
    
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="ProgramsContentMasterId" className="text-sm font-medium">
          {lang === 'ar' ? 'البرنامج الرئيسي' : 'Program Master'} *
        </Label>
        <Select
          value={formData.ProgramsContentMasterId || ''}
          onValueChange={(v) => setFormData(prev => ({ ...prev, ProgramsContentMasterId: v }))}
        >
          <SelectTrigger className="w-full bg-white/90 text-gray-800">
            <SelectValue placeholder={mastersLoading ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') : (lang === 'ar' ? 'اختر البرنامج الرئيسي' : 'Select Program Master')} />
          </SelectTrigger>
          <SelectContent>
            {masters.map((m) => (
              <SelectItem key={(m.id || m.Id)} value={(m.id || m.Id)}>
                {m.SessionNameL1 || m.sessionNameL1 || m.name || m.programNameL1 || (m.id || m.Id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {mastersError && <p className="text-xs text-red-500 mt-1">{mastersError}</p>}
      </div>
      <div>
        <Label htmlFor="SessionNameL1" className="text-sm font-medium">
          {lang === 'ar' ? 'اسم البرنامج (عربي)' : 'Program Name (Arabic)'} *
        </Label>
        <Input
          id="SessionNameL1"
          value={formData.SessionNameL1}
          onChange={(e) => setFormData(prev => ({ ...prev, SessionNameL1: e.target.value }))}
          required
          minLength={3}
          maxLength={70}
          className="bg-white/90 text-gray-800 placeholder:text-gray-500"
          placeholder={lang === 'ar' ? 'اسم البرنامج بالعربية (3-70 حرف)' : 'Program name in Arabic (3-70 chars)'}
        />
      </div>
      
      <div>
        <Label htmlFor="SessionNameL2" className="text-sm font-medium">
          {lang === 'ar' ? 'اسم البرنامج (إنجليزي)' : 'Program Name (English)'}
        </Label>
        <Input
          id="SessionNameL2"
          value={formData.SessionNameL2}
          onChange={(e) => setFormData(prev => ({ ...prev, SessionNameL2: e.target.value }))}
          // optional
          minLength={0}
          maxLength={70}
          className="bg-white/90 text-gray-800 placeholder:text-gray-500"
          placeholder={lang === 'ar' ? 'اسم البرنامج بالإنجليزية (اختياري)' : 'Program name in English (optional)'}
        />
      </div>

      <div>
        <Label htmlFor="Description" className="text-sm font-medium">
          {lang === 'ar' ? 'الوصف' : 'Description'}
        </Label>
        <Textarea
          id="Description"
          value={formData.Description}
          onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
          // optional
          minLength={0}
          maxLength={500}
          rows={4}
          className="bg-white/90 text-gray-800 placeholder:text-gray-500"
          placeholder={lang === 'ar' ? 'اكتب وصفاً للبرنامج (اختياري)' : 'Write a program description (optional)'}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
        </Button>
      </div>
    </form>
  );
};

const ProgramDetailsPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // قراءة معاملات URL للأكاديمية والفرع
  const academyId = searchParams.get('academy');
  const branchId = searchParams.get('branch');
  
  console.log('🔍 URL Parameters - Academy:', academyId, 'Branch:', branchId);
  
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [usingDefaultData, setUsingDefaultData] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

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

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading programs data...');
        const data = await api.getPrograms({ silent: true }).catch(() => []);
        console.log('Raw API response:', data);
        const programs = Array.isArray(data) ? data : [];
        console.log('Processed programs:', programs);
        
        if (programs.length > 0) {
          console.log('First program sample:', programs[0]);
          console.log('First program SessionNameL1:', programs[0]?.SessionNameL1);
          console.log('First program sessionNameL1:', programs[0]?.sessionNameL1);
        }
        
        if (programs.length === 0) {
          // استخدام البيانات الافتراضية إذا لم توجد بيانات
          console.log('No programs from API, using default data');
          setRows(defaultPrograms);
          setUsingDefaultData(true);
        } else {
          // تصفية البرامج حسب الأكاديمية والفرع إذا كانت موجودة في URL
          let filteredPrograms = programs;
          
          if (academyId && branchId) {
            console.log('🔍 Filtering programs by Academy:', academyId, 'and Branch:', branchId);
            
            // تصفية البرامج حسب الأكاديمية والفرع
            filteredPrograms = programs.filter(program => {
              const programAcademyId = program.academyDataId || program.AcademyDataId || program.academyId || program.AcademyId;
              const programBranchId = program.branchesDataId || program.BranchesDataId || program.branchId || program.BranchId;
              
              const academyMatch = programAcademyId === academyId;
              const branchMatch = programBranchId === branchId;
              
              console.log('🔍 Program:', program.id, 'Academy:', programAcademyId, 'Branch:', programBranchId, 'Match:', academyMatch && branchMatch);
              
              return academyMatch && branchMatch;
            });
            
            console.log('✅ Filtered programs count:', filteredPrograms.length, 'from total:', programs.length);
          } else {
            console.log('ℹ️ No academy/branch filter applied, showing all programs');
          }
          
          console.log('Setting filtered programs:', filteredPrograms);
          setRows(filteredPrograms);
          setUsingDefaultData(false);
        }
      } catch (e) {
        console.error('Error loading programs:', e);
        // في حالة الخطأ، استخدم البيانات الافتراضية
        setRows(defaultPrograms);
        setUsingDefaultData(false);
        setError(lang === 'ar' ? 'فشل تحميل البيانات - عرض بيانات افتراضية' : 'Failed to load data - showing default data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang, academyId, branchId]); // إضافة academyId و branchId كتبعيات

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      console.log('Main handleSubmit received formData:', formData);
      console.log('SessionNameL1 in received formData:', formData.SessionNameL1);
      console.log('SessionNameL1 type:', typeof formData.SessionNameL1);
      console.log('SessionNameL1 length:', formData.SessionNameL1 ? formData.SessionNameL1.length : 'undefined');
      
      // تنظيف البيانات مع الحفاظ على الحقول المطلوبة
      const cleanedData = { ...formData };
      
      // إزالة الحقول الفارغة غير المطلوبة فقط
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === null || cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });
      
      console.log('After removing null/undefined fields:', cleanedData);
      
      // التأكد من وجود الحقول المطلوبة مع قيم صحيحة
      if (!cleanedData.SessionNameL1 || cleanedData.SessionNameL1.trim() === '') {
        console.error('SessionNameL1 validation failed in main handler:', cleanedData.SessionNameL1);
        alert(lang === 'ar' ? 'اسم البرنامج مطلوب' : 'Program name is required');
        return;
      }
      
      // تنظيف القيم من المسافات الزائدة
      cleanedData.SessionNameL1 = cleanedData.SessionNameL1.trim();
      if (typeof cleanedData.SessionNameL2 === 'string') {
        cleanedData.SessionNameL2 = cleanedData.SessionNameL2.trim();
        if (cleanedData.SessionNameL2 === '') delete cleanedData.SessionNameL2;
      }
      if (typeof cleanedData.Description === 'string') {
        cleanedData.Description = cleanedData.Description.trim();
        if (cleanedData.Description === '') delete cleanedData.Description;
      }
      
      // IMPORTANT: Remove the id field to prevent backend Entity Framework errors
      delete cleanedData.id;
      delete cleanedData.Id;
      
      console.log('Final cleaned data being sent to API:', cleanedData);
      console.log('SessionNameL1 value:', cleanedData.SessionNameL1);
      console.log('SessionNameL1 type:', typeof cleanedData.SessionNameL1);
      console.log('SessionNameL1 length:', cleanedData.SessionNameL1.length);
      console.log('SessionNameL1 truthy check:', !!cleanedData.SessionNameL1);
      console.log('SessionNameL1 empty string check:', cleanedData.SessionNameL1 === '');
      
      if (selectedProgram) {
        console.log('Updating existing program with ID:', selectedProgram.id);
        await api.updateProgramContentMaster(selectedProgram.id, cleanedData);
      } else {
        console.log('Creating new program');
        await api.createProgramContentMaster(cleanedData);
      }
      setIsFormOpen(false);
      setSelectedProgram(null);
      // إعادة تحميل البيانات
      const data = await api.getPrograms({ silent: true }).catch(() => []);
      const programs = Array.isArray(data) ? data : [];
      if (programs.length === 0) {
        setRows(defaultPrograms);
        setUsingDefaultData(true);
      } else {
        setRows(programs);
        setUsingDefaultData(false);
      }
    } catch (err) {
      console.error('Error saving program:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حفظ البرنامج' : 'Error saving program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (programId) => {
    try {
      await api.deleteProgramContentMaster(programId);
      // إعادة تحميل البيانات
      const data = await api.getPrograms({ silent: true }).catch(() => []);
      const programs = Array.isArray(data) ? data : [];
      if (programs.length === 0) {
        setRows(defaultPrograms);
        setUsingDefaultData(true);
      } else {
        setRows(programs);
        setUsingDefaultData(false);
      }
    } catch (err) {
      console.error('Error deleting program:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حذف البرنامج' : 'Error deleting program');
    }
  };

  const openEditForm = (program) => {
    console.log('Opening edit form for program:', program);
    console.log('Program SessionNameL1:', program?.SessionNameL1);
    console.log('Program sessionNameL1:', program?.sessionNameL1);
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    console.log('Opening create form');
    setSelectedProgram(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-red-300 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{lang === 'ar' ? 'Program Details' : 'Program Details'}</h1>
            {isAdmin && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateForm} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {lang === 'ar' ? 'إضافة برنامج' : 'Add Program'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProgram 
                      ? (lang === 'ar' ? 'تعديل البرنامج' : 'Edit Program')
                      : (lang === 'ar' ? 'إضافة برنامج جديد' : 'Add New Program')
                    }
                  </DialogTitle>
                  <div className="text-sm text-muted-foreground mb-4">
                    {lang === 'ar' ? 'أدخل بيانات البرنامج الجديد' : 'Enter the new program data'}
                  </div>
                </DialogHeader>
                <ProgramForm
                  program={selectedProgram}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsFormOpen(false)}
                  loading={isSubmitting}
                />
              </DialogContent>
            </Dialog>
            )}
          </div>
          
          {usingDefaultData && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                {lang === 'ar' 
                  ? '⚠️ عرض بيانات افتراضية - لا توجد بيانات متاحة من الخادم' 
                  : '⚠️ Showing default data - no data available from server'}
              </p>
            </div>
          )}
          
          <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className={`w-full text-sm ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="bg-white/10">
                    <th className={`p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'الاسم (ع)' : 'Name (AR)'}</th>
                    <th className={`p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</th>
                    <th className={`p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                    <th className={`p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    console.log('Rendering row:', r);
                    console.log('Row SessionNameL1:', r.SessionNameL1);
                    console.log('Row sessionNameL1:', r.sessionNameL1);
                    return (
                      <tr key={r.id} className="border-t">
                        <td className={`p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{r.SessionNameL1 || r.sessionNameL1}</td>
                        <td className={`p-2 ${isRtl ? 'text-right' : 'text-left'}`}>{r.SessionNameL2 || r.sessionNameL2}</td>
                        <td className={`p-2 max-w-[320px] truncate ${isRtl ? 'text-right' : 'text-left'}`} title={r.Description || r.description}>{r.Description || r.description}</td>
                        <td className={`p-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => navigate(`/program-details/${r.id || r.Id}`)}
                              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text:white"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {lang === 'ar' ? 'عرض' : 'View'}
                            </Button>
                            {isAdmin && (
                              <>
                            <Button 
                              size="sm" 
                                variant="outline"
                                onClick={() => openEditForm(r)}
                                className="text-xs px-2 py-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {lang === 'ar' ? 'تعديل' : 'Edit'}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" className="text-xs px-2 py-1">
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    {lang === 'ar' ? 'حذف' : 'Delete'}
                              </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {lang === 'ar' 
                                        ? 'هل أنت متأكد من حذف هذا البرنامج؟ لا يمكن التراجع عن هذا الإجراء.'
                                        : 'Are you sure you want to delete this program? This action cannot be undone.'
                                      }
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(r.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {lang === 'ar' ? 'حذف' : 'Delete'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && (
                    <tr>
                      <td className="p-4 text-center text-muted-foreground" colSpan={5}>{lang === 'ar' ? 'لا توجد بيانات.' : 'No data.'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProgramDetailsPage; 