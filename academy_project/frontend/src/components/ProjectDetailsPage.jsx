import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// بيانات افتراضية لتفاصيل المشاريع
const defaultProjectDetails = [
  {
    id: 1,
    projectsMasterId: 1,
    projectNameL1: 'واجهة المستخدم الأمامية',
    projectNameL2: 'Frontend User Interface',
    description: 'تطوير واجهة مستخدم تفاعلية باستخدام React و Tailwind CSS'
  },
  {
    id: 2,
    projectsMasterId: 1,
    projectNameL1: 'الخادم الخلفي',
    projectNameL2: 'Backend Server',
    description: 'تطوير API RESTful باستخدام Node.js و Express'
  },
  {
    id: 3,
    projectsMasterId: 2,
    projectNameL1: 'واجهة التطبيق',
    projectNameL2: 'App Interface',
    description: 'تصميم واجهة مستخدم للتطبيق المحمول'
  },
  {
    id: 4,
    projectsMasterId: 2,
    projectNameL1: 'إدارة الحالة',
    projectNameL2: 'State Management',
    description: 'تنفيذ إدارة الحالة باستخدام Redux'
  },
  {
    id: 5,
    projectsMasterId: 3,
    projectNameL1: 'تصميم قاعدة البيانات',
    projectNameL2: 'Database Design',
    description: 'تصميم مخطط قاعدة البيانات وعلاقات الجداول'
  },
  {
    id: 6,
    projectsMasterId: 3,
    projectNameL1: 'تحسين الأداء',
    projectNameL2: 'Performance Optimization',
    description: 'تحسين استعلامات قاعدة البيانات والفهارس'
  },
  {
    id: 7,
    projectsMasterId: 4,
    projectNameL1: 'معالجة الصور',
    projectNameL2: 'Image Processing',
    description: 'تطوير خوارزميات معالجة الصور والتعرف عليها'
  },
  {
    id: 8,
    projectsMasterId: 4,
    projectNameL1: 'نموذج التعلم الآلي',
    projectNameL2: 'Machine Learning Model',
    description: 'تدريب وتطوير نموذج التعلم الآلي للتعرف على الصور'
  },
  {
    id: 9,
    projectsMasterId: 5,
    projectNameL1: 'نظام المصادقة',
    projectNameL2: 'Authentication System',
    description: 'تطوير نظام مصادقة آمن باستخدام JWT'
  },
  {
    id: 10,
    projectsMasterId: 5,
    projectNameL1: 'حماية البيانات',
    projectNameL2: 'Data Protection',
    description: 'تنفيذ تشفير البيانات وحماية الخصوصية'
  }
];

const ProjectDetailForm = ({ projectDetail, projectsMaster, onSubmit, onCancel, loading = false }) => {
  const { lang } = useI18n();
  const isEditMode = !!(projectDetail && (projectDetail.id || projectDetail?.Id));
  const [formData, setFormData] = React.useState({
    id: projectDetail?.id || '',
    ProjectsMasterId: projectDetail?.projectsMasterId || projectDetail?.ProjectsMasterId || '',
    ProjectNameL1: projectDetail?.projectNameL1 || projectDetail?.ProjectNameL1 || '',
    ProjectNameL2: projectDetail?.projectNameL2 || projectDetail?.ProjectNameL2 || '',
    Description: projectDetail?.description || projectDetail?.Description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // تنظيف البيانات بنفس طريقة صفحة المسؤول
    const cleanedData = { ...formData };
    
    // إزالة الحقول الفارغة
    Object.keys(cleanedData).forEach(key => {
      if (cleanedData[key] === null || cleanedData[key] === undefined || cleanedData[key] === '') {
        delete cleanedData[key];
      }
    });
    
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="ProjectsMasterId" className="text-sm font-medium">
          {lang === 'ar' ? 'المشروع الرئيسي' : 'Project Master'} *
        </Label>
        <Select
          value={formData.ProjectsMasterId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, ProjectsMasterId: value }))}
          disabled={false}
        >
          <SelectTrigger className="w-full bg-white/90 text-gray-800">
            <SelectValue placeholder={lang === 'ar' ? 'اختر المشروع الرئيسي' : 'Select Project Master'} />
          </SelectTrigger>
          <SelectContent>
            {projectsMaster.map((master) => (
              <SelectItem key={master.id} value={master.id}>
                {master.projectNameL1 || master.ProjectNameL1 || master.projectNameL2 || master.ProjectNameL2 || master.name || master.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="ProjectNameL1" className="text-sm font-medium">
          {lang === 'ar' ? 'اسم المشروع (عربي)' : 'Project Name (Arabic)'} *
        </Label>
        <Input
          id="ProjectNameL1"
          value={formData.ProjectNameL1}
          onChange={(e) => setFormData(prev => ({ ...prev, ProjectNameL1: e.target.value }))}
          required
          minLength={3}
          maxLength={70}
          className="bg-white/90 text-gray-800 placeholder:text-gray-500"
          placeholder={lang === 'ar' ? 'اسم المشروع بالعربية (3-70 حرف)' : 'Project name in Arabic (3-70 chars)'}
        />
      </div>
      
      <div>
        <Label htmlFor="ProjectNameL2" className="text-sm font-medium">
          {lang === 'ar' ? 'اسم المشروع (إنجليزي)' : 'Project Name (English)'}
        </Label>
        <Input
          id="ProjectNameL2"
          value={formData.ProjectNameL2}
          onChange={(e) => setFormData(prev => ({ ...prev, ProjectNameL2: e.target.value }))}
          // optional
          minLength={0}
          maxLength={70}
          className="bg-white/90 text-gray-800 placeholder:text-gray-500"
          placeholder={lang === 'ar' ? 'اسم المشروع بالإنجليزية (اختياري)' : 'Project name in English (optional)'}
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
          placeholder={lang === 'ar' ? 'اكتب وصفاً للمشروع (اختياري)' : 'Write a project description (optional)'}
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

const ProjectDetailsPage = () => {
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
  const [selectedProjectDetail, setSelectedProjectDetail] = React.useState(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [projectsMaster, setProjectsMaster] = React.useState([]);
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
        const data = await api.getProjectDetails().catch(() => []);
        const details = Array.isArray(data) ? data : [];
        
        if (details.length === 0) {
          // استخدام البيانات الافتراضية إذا لم توجد بيانات
          setRows(defaultProjectDetails);
          setUsingDefaultData(true);
        } else {
          // تصفية تفاصيل المشاريع حسب الأكاديمية والفرع إذا كانت موجودة في URL
          let filteredDetails = details;
          
          if (academyId && branchId) {
            console.log('🔍 Filtering project details by Academy:', academyId, 'and Branch:', branchId);
            
            // أولاً نحتاج لتصفية المشاريع الرئيسية حسب الأكاديمية والفرع
            const projectsData = await api.getProjects().catch(() => []);
            const filteredProjects = Array.isArray(projectsData) ? projectsData.filter(project => {
              const projectAcademyId = project.academyDataId || project.AcademyDataId || project.academyId || project.AcademyId;
              const projectBranchId = project.branchesDataId || project.BranchesDataId || project.branchId || project.BranchId;
              
              return projectAcademyId === academyId && projectBranchId === branchId;
            }) : [];
            
            // ثم نفلتر تفاصيل المشاريع حسب المشاريع المفلترة
            filteredDetails = details.filter(detail => {
              const detailProjectId = detail.projectsMasterId || detail.ProjectsMasterId;
              return filteredProjects.some(project => 
                project.id === detailProjectId || project.Id === detailProjectId
              );
            });
            
            console.log('✅ Filtered project details count:', filteredDetails.length, 'from total:', details.length);
          } else {
            console.log('ℹ️ No academy/branch filter applied, showing all project details');
          }
          
          setRows(filteredDetails);
          setUsingDefaultData(false);
        }
      } catch (e) {
        // في حالة الخطأ، استخدم البيانات الافتراضية
        setRows(defaultProjectDetails);
        setUsingDefaultData(false);
        setError(lang === 'ar' ? 'فشل تحميل البيانات - عرض بيانات افتراضية' : 'Failed to load data - showing default data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang, academyId, branchId]); // إضافة academyId و branchId كتبعيات

  // تحميل المشاريع الرئيسية
  React.useEffect(() => {
    const loadProjectsMaster = async () => {
      try {
        const data = await api.getProjects().catch(() => []);
        setProjectsMaster(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error loading projects master:', e);
      }
    };
    loadProjectsMaster();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // تنظيف البيانات بنفس طريقة صفحة المسؤول
      const cleanedData = { ...formData };
      
      // إزالة الحقول الفارغة
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === null || cleanedData[key] === undefined || cleanedData[key] === '') {
          delete cleanedData[key];
        }
      });
      // لا ترسل المفاتيح الأساسية مع التحديث لتجنب محاولة تعديل المفتاح
      if (selectedProjectDetail) {
        delete cleanedData.id;
        delete cleanedData.Id;
        // حدد ProjectsMasterId الجديد إن وُجِد وإلا استخدم القديم
        const providedMasterId = cleanedData.ProjectsMasterId || cleanedData.projectsMasterId;
        const currentMasterId = providedMasterId || selectedProjectDetail?.ProjectsMasterId || selectedProjectDetail?.projectsMasterId;
        // تحقق من وجود المشروع الرئيسي المرتبط قبل محاولة التحديث لتجنب 404 من السيرفر
        const masterExists = projectsMaster.some((pm) => pm.id === currentMasterId || pm.Id === currentMasterId);
        if (!masterExists) {
          alert(lang === 'ar' 
            ? 'لا يمكن تعديل هذا السجل لأن المشروع الرئيسي المرتبط غير موجود. احذف السجل ثم أنشئ واحداً جديداً واختر مشروعاً رئيسياً صالحاً.'
            : 'Cannot update this record because its related Project Master does not exist. Please delete this detail and create a new one under a valid Project Master.'
          );
          return;
        }
        // مرّر ProjectsMasterId النهائي لكي يتعامل الـ API مع التغيير (وسيسقط للت حذف+إنشاء عند الحاجة)
        cleanedData.ProjectsMasterId = currentMasterId;
      }
      
      if (selectedProjectDetail) {
        await api.updateProjectDetail(selectedProjectDetail.id || selectedProjectDetail.Id, cleanedData);
      } else {
        await api.createProjectDetail(cleanedData);
      }
      setIsFormOpen(false);
      setSelectedProjectDetail(null);
      // إعادة تحميل البيانات
      const data = await api.getProjectDetails().catch(() => []);
      const details = Array.isArray(data) ? data : [];
      if (details.length === 0) {
        setRows(defaultProjectDetails);
        setUsingDefaultData(true);
      } else {
        setRows(details);
        setUsingDefaultData(false);
      }
    } catch (err) {
      console.error('Error saving project detail:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حفظ تفاصيل المشروع' : 'Error saving project detail');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectDetailId) => {
    try {
      await api.deleteProjectDetail(projectDetailId);
      // إعادة تحميل البيانات
      const data = await api.getProjectDetails().catch(() => []);
      const details = Array.isArray(data) ? data : [];
      if (details.length === 0) {
        setRows(defaultProjectDetails);
        setUsingDefaultData(true);
      } else {
        setRows(details);
        setUsingDefaultData(false);
      }
    } catch (err) {
      console.error('Error deleting project detail:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حذف تفاصيل المشروع' : 'Error deleting project detail');
    }
  };

  const openEditForm = (projectDetail) => {
    setSelectedProjectDetail(projectDetail);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setSelectedProjectDetail(null);
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{lang === 'ar' ? 'Project Details' : 'Project Details'}</h1>
            {isAdmin && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateForm} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {lang === 'ar' ? 'إضافة تفاصيل مشروع' : 'Add Project Detail'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProjectDetail 
                      ? (lang === 'ar' ? 'تعديل تفاصيل المشروع' : 'Edit Project Detail')
                      : (lang === 'ar' ? 'إضافة تفاصيل مشروع جديد' : 'Add New Project Detail')
                    }
                  </DialogTitle>
                  <DialogDescription>
                    {lang === 'ar' ? 'أدخل بيانات تفاصيل المشروع الجديد' : 'Enter the new project detail data'}
                  </DialogDescription>
                </DialogHeader>
                <ProjectDetailForm
                  projectDetail={selectedProjectDetail}
                  projectsMaster={projectsMaster}
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="p-2">{lang === 'ar' ? 'المشروع' : 'Project Master'}</th>
                    <th className="p-2">{lang === 'ar' ? 'الاسم (ع)' : 'Name (AR)'}</th>
                    <th className="p-2">{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</th>
                    <th className="p-2">{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                    <th className="p-2">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id || r.Id} className="border-t">
                      <td className="p-2">{
                        (() => {
                          const mid = r.ProjectsMasterId || r.projectsMasterId;
                          const m = projectsMaster.find((pm) => pm.id === mid || pm.Id === mid);
                          return m ? (m.ProjectNameL1 || m.projectNameL1 || m.ProjectNameL2 || m.projectNameL2 || mid) : mid;
                        })()
                      }</td>
                      <td className="p-2">{r.projectNameL1 || r.ProjectNameL1}</td>
                      <td className="p-2">{r.projectNameL2 || r.ProjectNameL2}</td>
                      <td className="p-2">{r.description || r.Description}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => navigate(`/project-details/${r.projectsMasterId || r.ProjectsMasterId || r.id || r.Id}`)}
                            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white"
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
                                      ? 'هل أنت متأكد من حذف تفاصيل هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.'
                                      : 'Are you sure you want to delete this project detail? This action cannot be undone.'
                                    }
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(r.id || r.Id)}
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
                  ))}
                  {!rows.length && (
                    <tr>
                      <td className="p-4 text-center text-muted-foreground" colSpan={6}>{lang === 'ar' ? 'لا توجد تفاصيل.' : 'No details.'}</td>
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

export default ProjectDetailsPage; 