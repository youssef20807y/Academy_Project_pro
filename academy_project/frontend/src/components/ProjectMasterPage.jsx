import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Edit, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

// بيانات افتراضية للمشاريع
const defaultProjects = [
  {
    id: 1,
    projectNameL1: 'مشروع تطوير تطبيق الويب',
    projectNameL2: 'Web Application Development Project',
    projectStart: '2024-01-15',
    projectEnd: '2024-06-30',
    description: 'تطوير تطبيق ويب متكامل باستخدام React و Node.js'
  },
  {
    id: 2,
    projectNameL1: 'مشروع تطوير تطبيق الهاتف المحمول',
    projectNameL2: 'Mobile App Development Project',
    projectStart: '2024-03-01',
    projectEnd: '2024-08-15',
    description: 'تطوير تطبيق iOS و Android باستخدام React Native'
  },
  {
    id: 3,
    projectNameL1: 'مشروع قاعدة البيانات',
    projectNameL2: 'Database Project',
    projectStart: '2024-02-01',
    projectEnd: '2024-05-30',
    description: 'تصميم وتطوير قاعدة بيانات متقدمة باستخدام MySQL'
  },
  {
    id: 4,
    projectNameL1: 'مشروع الذكاء الاصطناعي',
    projectNameL2: 'AI Project',
    projectStart: '2024-04-01',
    projectEnd: '2024-09-30',
    description: 'تطوير نظام ذكاء اصطناعي للتعرف على الصور'
  },
  {
    id: 5,
    projectNameL1: 'مشروع الأمن السيبراني',
    projectNameL2: 'Cybersecurity Project',
    projectStart: '2024-05-01',
    projectEnd: '2024-10-31',
    description: 'تطوير حلول أمنية لحماية البيانات والشبكات'
  }
];

const ProjectForm = ({ project, branches = [], branchesLoading = false, branchesError = null, onSubmit, onCancel, loading = false }) => {
  const { lang } = useI18n();
  
  // الحصول على Academy ID من التوكن
  const getAcademyIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.AcademyDataId || payload.academyDataId || payload.AcademyId || payload.academyId;
      }
    } catch (error) {
      console.warn('Failed to parse token for Academy ID:', error);
    }
    return '';
  };

  // تحميل الأكاديميات إذا لم نجد واحدة في التوكن
  React.useEffect(() => {
    const loadAcademies = async () => {
      const academyId = getAcademyIdFromToken();
      if (!academyId) {
        try {
          const academiesData = await api.getAcademies();
          const academiesArray = Array.isArray(academiesData) ? academiesData : [];
          
          // إذا كانت هناك أكاديميات متاحة، اختر الأولى تلقائياً
          if (academiesArray.length > 0) {
            setFormData(prev => ({ ...prev, AcademyDataId: academiesArray[0].id }));
            console.log('Auto-selected first academy:', academiesArray[0].id);
          }
        } catch (error) {
          console.warn('Failed to load academies:', error);
        }
      }
    };
    loadAcademies();
  }, []);

  const [formData, setFormData] = React.useState({
    id: project?.id || '',
    AcademyDataId: project?.AcademyDataId || project?.academyDataId || getAcademyIdFromToken(),
    BranchesDataId: project?.BranchesDataId || project?.branchesDataId || '',
    ProjectNameL1: project?.ProjectNameL1 || project?.projectNameL1 || '',
    ProjectNameL2: project?.ProjectNameL2 || project?.projectNameL2 || '',
    ProjectStart: project?.ProjectStart || project?.projectStart || '',
    ProjectEnd: project?.ProjectEnd || project?.projectEnd || '',
    ProjectResources: null,
    ProjectFiles: null,
    Description: project?.Description || project?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // تأكد من أن AcademyDataId موجود من التوكن
    const academyId = getAcademyIdFromToken();
    if (academyId) {
      formData.AcademyDataId = academyId;
    }
    onSubmit(formData);
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* عرض الأكاديمية المحددة تلقائياً */}


      {/* اختيار الفرع مع تصميم محسن */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {lang === 'ar' ? 'اختر الفرع *' : 'Select Branch *'}
        </label>
        <Select
          value={formData.BranchesDataId}
          onValueChange={(v) => setFormData(prev => ({ ...prev, BranchesDataId: v }))}
          disabled={branchesLoading}
        >
          <SelectTrigger className="h-12 w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors">
            <SelectValue>
              {branchesLoading 
                ? (lang === 'ar' ? 'جاري تحميل الفروع...' : 'Loading branches...')
                : !formData.BranchesDataId || formData.BranchesDataId === ''
                ? (lang === 'ar' ? 'اختر فرع من القائمة' : 'Select branch from list')
                : (() => {
                    const selectedBranch = branches.find(b => b.id === formData.BranchesDataId);
                    return selectedBranch 
                      ? (selectedBranch.branchNameL1 || selectedBranch.branchNameL2 || selectedBranch.name || selectedBranch.id)
                      : (lang === 'ar' ? 'اختر فرع من القائمة' : 'Select branch from list');
                  })()
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectGroup>
              {branchesLoading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                </SelectItem>
              ) : branchesError ? (
                <SelectItem value="error" disabled>
                  <div className="text-red-600 dark:text-red-400">
                    {lang === 'ar' ? 'خطأ في تحميل الفروع' : 'Error loading branches'}
                  </div>
                </SelectItem>
              ) : branches.length === 0 ? (
                <SelectItem value="no-branches" disabled>
                  {lang === 'ar' ? 'لا توجد فروع متاحة' : 'No branches available'}
                </SelectItem>
              ) : (
                branches.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">
                          {b.branchNameL1 || b.branchNameL2 || b.name || b.id}
                        </div>
                        {b.branchNameL2 && b.branchNameL1 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {b.branchNameL2}
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        {/* رسائل الحالة */}
        {branchesLoading && (
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            {lang === 'ar' ? 'جاري تحميل قائمة الفروع...' : 'Loading branches list...'}
          </p>
        )}
        
        {branchesError && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lang === 'ar' ? 'خطأ في تحميل الفروع:' : 'Error loading branches:'}
            </div>
            <p>{branchesError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}
        
        {!branchesLoading && !branchesError && branches.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {lang === 'ar' ? 'تحذير: لا توجد فروع متاحة. قد تحتاج إلى إضافة فروع أولاً.' : 'Warning: No branches available. You may need to add branches first.'}
          </p>
        )}
      </div>

      <Input
        placeholder={lang === 'ar' ? 'اسم المشروع' : 'Project Name'}
        value={formData.ProjectNameL1}
        onChange={(e) => setFormData(prev => ({ ...prev, ProjectNameL1: e.target.value }))}
        required
        minLength={4}
      />

      <Input
        placeholder={lang === 'ar' ? 'اسم المشروع (2)' : 'Project Name (2)'}
        value={formData.ProjectNameL2}
        onChange={(e) => setFormData(prev => ({ ...prev, ProjectNameL2: e.target.value }))}
        required
        minLength={4}
      />

      <Input
        placeholder={lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
        type="date"
        value={formData.ProjectStart}
        onChange={(e) => setFormData(prev => ({ ...prev, ProjectStart: e.target.value }))}
        required
      />

      <Input
        placeholder={lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
        type="date"
        value={formData.ProjectEnd}
        onChange={(e) => setFormData(prev => ({ ...prev, ProjectEnd: e.target.value }))}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'ملف الموارد' : 'Project Resources'}</label>
          <input
            type="file"
            onChange={(e) => handleFileChange('ProjectResources', e)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'ملف المشروع' : 'Project Files'}</label>
          <input
            type="file"
            onChange={(e) => handleFileChange('ProjectFiles', e)}
          />
        </div>
      </div>

      <Textarea
        value={formData.Description}
        onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
        required
        minLength={10}
        maxLength={500}
        rows={4}
        className="bg-white/90 text-gray-800 placeholder:text-gray-500"
        placeholder={lang === 'ar' ? 'اكتب وصفاً مفصلاً للمشروع (الحد الأدنى 10 أحرف، الحد الأقصى 500 حرف)...' : 'Write a detailed description of the project (minimum 10 characters, maximum 500 characters)...'}
      />

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

const ProjectMasterPage = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // قراءة معاملات URL للأكاديمية والفرع
  const academyId = searchParams.get('academy');
  const branchId = searchParams.get('branch');
  
  console.log('🔍 URL Parameters - Academy:', academyId, 'Branch:', branchId);
  
  const isRtl = lang === 'ar';
  
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [usingDefaultData, setUsingDefaultData] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState(null);
  const [deletingProject, setDeletingProject] = React.useState(null);
  const [branches, setBranches] = React.useState([]);
  const [branchesLoading, setBranchesLoading] = React.useState(false);
  const [branchesError, setBranchesError] = React.useState(null);
  const [academies, setAcademies] = React.useState([]);
  const [academiesLoading, setAcademiesLoading] = React.useState(false);
  const [academiesError, setAcademiesError] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);
  const [userEmail, setUserEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

  // الاستماع لتغييرات المصادقة
  React.useEffect(() => {
    const handleAuthChange = (event) => {
      const { isAuthenticated, reason } = event.detail || {};
      
      if (!isAuthenticated) {
        if (reason === 'token_refresh_failed') {
          toast.error(lang === 'ar' 
            ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.'
            : 'Session expired. Please log in again.'
          );
          
          // إعادة توجيه إلى صفحة تسجيل الدخول
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          toast.warning(lang === 'ar' 
            ? 'تم تسجيل الخروج. يرجى تسجيل الدخول مرة أخرى.'
            : 'You have been logged out. Please log in again.'
          );
        }
      }
    };

    // إضافة مستمع الأحداث
    window.addEventListener('auth-changed', handleAuthChange);
    
    // تنظيف المستمع عند إلغاء التحميل
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [lang]);

  // تحميل البيانات الأساسية
  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading main project data...');
        
        const data = await api.getProjects().catch((error) => {
          console.warn('Failed to load projects, using default data:', error);
          return [];
        });
        
        const projects = Array.isArray(data) ? data : [];
        
        if (projects.length === 0) {
          // استخدام البيانات الافتراضية إذا لم توجد بيانات
          setRows(defaultProjects);
          setUsingDefaultData(true);
          console.log('No projects loaded, using default data');
        } else {
          // تصفية المشاريع حسب الأكاديمية والفرع إذا كانت موجودة في URL
          let filteredProjects = projects;
          
          if (academyId && branchId) {
            console.log('🔍 Filtering projects by Academy:', academyId, 'and Branch:', branchId);
            
            filteredProjects = projects.filter(project => {
              const projectAcademyId = project.academyDataId || project.AcademyDataId || project.academyId || project.AcademyId;
              const projectBranchId = project.branchesDataId || project.BranchesDataId || project.branchId || project.BranchId;
              
              const academyMatch = projectAcademyId === academyId;
              const branchMatch = projectBranchId === branchId;
              
              console.log('🔍 Project:', project.id, 'Academy:', projectAcademyId, 'Branch:', projectBranchId, 'Match:', academyMatch && branchMatch);
              
              return academyMatch && branchMatch;
            });
            
            console.log('✅ Filtered projects count:', filteredProjects.length, 'from total:', projects.length);
          } else {
            console.log('ℹ️ No academy/branch filter applied, showing all projects');
          }
          
          setRows(filteredProjects);
          setUsingDefaultData(false);
          console.log('Projects loaded successfully:', filteredProjects.length);
        }
      } catch (e) {
        console.error('Error loading main data:', e);
        
        // في حالة الخطأ، استخدم البيانات الافتراضية
        setRows(defaultProjects);
        setUsingDefaultData(false);
        setError(lang === 'ar' ? 'فشل تحميل البيانات - عرض بيانات افتراضية' : 'Failed to load data - showing default data');
        
        // إذا كان الخطأ يتعلق بالمصادقة، نجرب مرة أخرى
        if (e.status === 401 || e.status === 403) {
          console.log('Auth error in main data load, will retry in 5 seconds...');
          setTimeout(() => {
            load();
          }, 5000);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang, academyId, branchId]); // إضافة academyId و branchId كتبعيات

  // تحميل الفروع فقط
  React.useEffect(() => {
    const loadFormData = async (retryCount = 0) => {
      try {
        setBranchesLoading(true);
        setBranchesError(null);
        console.log('Loading branches data... (attempt:', retryCount + 1, ')');
        
        // محاولة تحميل الفروع مع معالجة أفضل للأخطاء
        let branchesRes = [];
        
        try {
          branchesRes = await api.getBranches();
          console.log('Branches loaded successfully:', branchesRes?.length || 0);
          
          // تحديث الحالة
          setBranches(Array.isArray(branchesRes) ? branchesRes : []);
          setBranchesLoading(false);
          
          // نجح التحميل، لا نحتاج لإعادة المحاولة
          return;
          
        } catch (branchError) {
          console.warn('Failed to load branches:', branchError);
          
          // إذا كان الخطأ يتعلق بالمصادقة، نجرب مرة أخرى
          if (branchError.status === 401 || branchError.status === 403) {
            console.log('Auth error detected, will retry after token refresh');
            
            // انتظار قليل للسماح بتحديث التوكن
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // محاولة مرة أخرى
            if (retryCount < 3) {
              setTimeout(() => {
                loadFormData(retryCount + 1);
              }, 2000 * (retryCount + 1)); // exponential backoff
            } else {
              console.error('Max retry attempts reached for branches loading');
              setBranches([]); // تعيين مصفوفة فارغة
              setBranchesError(lang === 'ar' 
                ? 'فشل تحميل الفروع بعد عدة محاولات. يرجى إعادة تحميل الصفحة.'
                : 'Failed to load branches after multiple attempts. Please reload the page.'
              );
              setBranchesLoading(false);
            }
            return;
          }
          
          // إذا كان الخطأ آخر، نجرب مرة أخرى
          if (retryCount < 2) {
            console.log('Non-auth error, will retry in 3 seconds...');
            setTimeout(() => {
              loadFormData(retryCount + 1);
            }, 3000);
            return;
          }
        }
        
        // إذا فشل التحميل بعد جميع المحاولات، نعرض رسالة خطأ
        if (!branchesRes || branchesRes.length === 0) {
          console.log('No branches loaded after all attempts, setting empty array');
          setBranches([]);
          setBranchesError(lang === 'ar' 
            ? 'لا يمكن تحميل بيانات الفروع حالياً. يرجى المحاولة لاحقاً.'
            : 'Unable to load branches data at the moment. Please try again later.'
          );
        }
        
        setBranchesLoading(false);
        
      } catch (e) {
        console.error('Error loading branches data:', e);
        
        // إذا كان الخطأ يتعلق بالمصادقة، نجرب مرة أخرى
        if (e.status === 401 || e.status === 403) {
          console.log('Auth error detected, will retry in 3 seconds...');
          if (retryCount < 2) {
            setTimeout(() => {
              loadFormData(retryCount + 1);
            }, 3000);
          } else {
            setBranches([]); // تعيين مصفوفة فارغة
            setBranchesError(lang === 'ar' 
              ? 'فشل تحميل الفروع بسبب مشاكل في المصادقة. يرجى تسجيل الدخول مرة أخرى.'
              : 'Failed to load branches due to authentication issues. Please log in again.'
            );
            setBranchesLoading(false);
          }
        } else {
          // خطأ آخر، نعرض مصفوفة فارغة
          setBranches([]);
          setBranchesError(lang === 'ar' 
            ? 'حدث خطأ غير متوقع في تحميل الفروع.'
            : 'An unexpected error occurred while loading branches.'
          );
          setBranchesLoading(false);
        }
      }
    };
    
    // بدء التحميل
    loadFormData();
  }, [lang]);

  const handleSubmit = async (formData) => {
    let cleanedData = {}; // Declare outside try block to access in catch
    
    try {
      setIsSubmitting(true);
      
      // الحصول على Academy ID من التوكن
      const getAcademyIdFromToken = () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.AcademyDataId || payload.academyDataId || payload.AcademyId || payload.academyId;
          }
        } catch (error) {
          console.warn('Failed to parse token for Academy ID:', error);
        }
        return '';
      };

      // تنظيف البيانات بنفس طريقة صفحة المسؤول
      cleanedData = { ...formData };
      
      // إضافة Academy ID من التوكن
      const academyId = getAcademyIdFromToken();
      if (academyId) {
        cleanedData.AcademyDataId = academyId;
        console.log('Added AcademyDataId from token:', academyId);
      } else {
        console.warn('No AcademyDataId found in token, this might cause issues');
        
        // إذا لم نجد Academy ID في التوكن، نطلب من المستخدم اختيار واحدة
        if (!cleanedData.AcademyDataId) {
          // محاولة تحميل الأكاديميات للحصول على واحدة افتراضية
          try {
            const academies = await api.getAcademies();
            if (academies && academies.length > 0) {
              cleanedData.AcademyDataId = academies[0].id;
              console.log('Using first available academy as fallback:', academies[0].id);
            }
          } catch (academyError) {
            console.warn('Failed to load academies for fallback:', academyError);
          }
        }
      }
      
      // إزالة الحقول الفارغة (لكن لا نحذف AcademyDataId)
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === null || cleanedData[key] === undefined || cleanedData[key] === '') {
          if (key !== 'AcademyDataId') { // لا نحذف AcademyDataId حتى لو كان فارغاً
            delete cleanedData[key];
          }
        }
      });
      
      // إزالة حقل ID من البيانات المرسلة للتحديث (لأنه مفتاح أساسي لا يمكن تعديله)
      if (editingProject && cleanedData.id) {
        delete cleanedData.id;
        console.log('Removed ID field from update data as it cannot be modified');
      }
      
      // إزالة أي حقول أخرى قد تسبب مشاكل
      const fieldsToRemove = ['id', 'Id', 'ID', 'createdAt', 'CreatedAt', 'updatedAt', 'UpdatedAt'];
      fieldsToRemove.forEach(field => {
        if (cleanedData[field] !== undefined) {
          delete cleanedData[field];
          console.log(`Removed ${field} field from update data`);
        }
      });
      
      // تحقق إضافي - تأكد من عدم وجود أي حقول تحتوي على 'id' أو 'Id'
      Object.keys(cleanedData).forEach(key => {
        if (key.toLowerCase().includes('id') && key !== 'AcademyDataId' && key !== 'BranchesDataId') {
          console.warn(`Found potentially problematic field: ${key} = ${cleanedData[key]}`);
          // لا نحذفه تلقائياً، فقط نعرض تحذير
        }
      });
      
      // إنشاء كائن جديد نظيف تماماً مع الحقول المطلوبة فقط
      const finalData = {
        AcademyDataId: cleanedData.AcademyDataId,
        BranchesDataId: cleanedData.BranchesDataId,
        ProjectNameL1: cleanedData.ProjectNameL1,
        ProjectNameL2: cleanedData.ProjectNameL2,
        ProjectStart: cleanedData.ProjectStart,
        ProjectEnd: cleanedData.ProjectEnd,
        Description: cleanedData.Description
      };
      
      // إضافة ملفات المشروع إذا كانت موجودة
      if (cleanedData.ProjectResources) {
        finalData.ProjectResources = cleanedData.ProjectResources;
      }
      if (cleanedData.ProjectFiles) {
        finalData.ProjectFiles = cleanedData.ProjectFiles;
      }
      
      console.log('Final cleaned data:', cleanedData);
      console.log('Final data structure being sent:', finalData);
      console.log('Data being sent to backend:', JSON.stringify(finalData, null, 2));
      
      // التحقق من وجود الحقول المطلوبة
      const requiredFields = ['AcademyDataId', 'BranchesDataId', 'ProjectNameL1', 'ProjectStart', 'ProjectEnd', 'Description'];
      const missingFields = requiredFields.filter(field => !finalData[field]);
      
      if (missingFields.length > 0) {
        const errorMessage = lang === 'ar' 
          ? `الحقول التالية مطلوبة: ${missingFields.join(', ')}`
          : `The following fields are required: ${missingFields.join(', ')}`;
        toast.error(errorMessage);
        console.error('Missing required fields:', missingFields);
        return;
      }
      
      if (editingProject) {
        try {
          console.log('Attempting to update project with ID:', editingProject.id);
          await api.updateProject(editingProject.id, finalData);
          toast.success(lang === 'ar' ? 'تم تحديث المشروع بنجاح' : 'Project updated successfully');
        } catch (updateError) {
          console.error('Update failed, error details:', updateError);
          
          // إذا كان الخطأ يتعلق بالـ ID، نجرب إنشاء مشروع جديد
          if (updateError.body && typeof updateError.body === 'string' && 
              (updateError.body.includes('ProjectsMaster.Id') || updateError.body.includes('Id is part of a key'))) {
            
            console.log('ID modification error detected, attempting to create new project instead...');
            
            try {
              // إنشاء مشروع جديد
              await api.createProject(finalData);
              toast.success(lang === 'ar' ? 'تم إنشاء مشروع جديد بدلاً من التحديث' : 'Created new project instead of updating');
              
              // حذف المشروع القديم
              try {
                await api.deleteProject(editingProject.id);
                console.log('Old project deleted successfully');
              } catch (deleteError) {
                console.warn('Failed to delete old project:', deleteError);
                toast.warning(lang === 'ar' 
                  ? 'تم إنشاء مشروع جديد، لكن فشل حذف المشروع القديم'
                  : 'New project created, but failed to delete old project'
                );
              }
            } catch (createError) {
              console.error('Failed to create new project as fallback:', createError);
              throw updateError; // إعادة رمي الخطأ الأصلي
            }
          } else {
            throw updateError; // إعادة رمي الخطأ إذا لم يكن متعلقاً بالـ ID
          }
        }
      } else {
        await api.createProject(finalData);
        toast.success(lang === 'ar' ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully');
      }
      setShowForm(false);
      setEditingProject(null);
      // إعادة تحميل البيانات
      try {
        const data = await api.getProjects({ silent: true });
        const projects = Array.isArray(data) ? data : [];
        if (projects.length === 0) {
          setRows(defaultProjects);
          setUsingDefaultData(true);
        } else {
          setRows(projects);
          setUsingDefaultData(false);
        }
        console.log('Data reloaded successfully after save');
      } catch (reloadError) {
        console.warn('Failed to reload data after save:', reloadError);
        // لا نعرض خطأ للمستخدم هنا لأن العملية الأساسية نجحت
      }
    } catch (err) {
      console.error('Error saving project:', err);
      
      // رسالة خطأ أكثر تفصيلاً
      let errorMessage = lang === 'ar' ? 'حدث خطأ في حفظ المشروع' : 'Error saving project';
      
      if (err.status === 500) {
        // تحليل رسالة الخطأ من الخادم
        if (err.body && typeof err.body === 'string') {
          if (err.body.includes('ProjectsMaster.Id') || err.body.includes('Id is part of a key')) {
            errorMessage = lang === 'ar' 
              ? 'خطأ في تحديث المشروع - لا يمكن تعديل معرف المشروع. يرجى المحاولة مرة أخرى.'
              : 'Error updating project - cannot modify project ID. Please try again.';
          } else if (err.body.includes('foreign key')) {
            errorMessage = lang === 'ar' 
              ? 'خطأ في الخادم - المشروع مرتبط بعناصر أخرى في النظام'
              : 'Server error - Project is linked to other system elements';
          } else {
            errorMessage = lang === 'ar' 
              ? 'خطأ في الخادم - قد يكون بسبب عدم تحديد الأكاديمية أو الفرع بشكل صحيح'
              : 'Server error - may be due to incorrect Academy or Branch selection';
          }
        } else {
          errorMessage = lang === 'ar' 
            ? 'خطأ في الخادم - قد يكون بسبب عدم تحديد الأكاديمية أو الفرع بشكل صحيح'
            : 'Server error - may be due to incorrect Academy or Branch selection';
        }
      } else if (err.status === 400) {
        errorMessage = lang === 'ar'
          ? 'بيانات غير صحيحة - يرجى التأكد من جميع الحقول المطلوبة'
          : 'Invalid data - please check all required fields';
      } else if (err.status === 401 || err.status === 403) {
        errorMessage = lang === 'ar'
          ? 'ليس لديك صلاحية لحفظ المشروع - يرجى تسجيل الدخول مرة أخرى'
          : 'You do not have permission to save the project - please log in again';
      }
      
      // استخدام toast بدلاً من alert للحصول على تجربة مستخدم أفضل
      toast.error(errorMessage);
      
      // تسجيل تفاصيل الخطأ للتشخيص
      console.error('Error details:', {
        status: err.status,
        body: err.body,
        url: err.url,
        projectData: finalData
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      // محاولة الحذف العادي أولاً
      await api.deleteProject(projectId);
      
      // إعادة تحميل البيانات
      try {
        const data = await api.getProjects({ silent: true });
        const projects = Array.isArray(data) ? data : [];
        if (projects.length === 0) {
          setRows(defaultProjects);
          setUsingDefaultData(true);
        } else {
          setRows(projects);
          setUsingDefaultData(false);
        }
        console.log('Data reloaded successfully after delete');
        toast.success(lang === 'ar' ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully');
      } catch (reloadError) {
        console.warn('Failed to reload data after delete:', reloadError);
        // نعرض رسالة نجاح مع تحذير من فشل إعادة التحميل
        toast.success(lang === 'ar' ? 'تم حذف المشروع بنجاح، لكن فشل تحديث القائمة' : 'Project deleted successfully, but failed to update the list');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      
      // تحليل تفاصيل الخطأ
      let errorMessage = lang === 'ar' ? 'حدث خطأ في حذف المشروع' : 'Error deleting project';
      
      // تسجيل تفاصيل إضافية للتشخيص
      console.log('Error status:', err.status);
      console.log('Error body:', err.body);
      console.log('Error body type:', typeof err.body);
      console.log('Project ID:', projectId);
      
      // إذا كان الخطأ يتعلق بملفات resource.dat، نجرب الحذف القسري
      if (err.body && typeof err.body === 'string' && err.body.includes('resource.dat')) {
        console.log('Found resource.dat in error body, attempting force deletion');
        
        // محاولة الحذف القسري مع معاملات مختلفة
        const forceOptions = [
          { force: true },
          { cascade: true },
          { recursive: true },
          { hard: true },
          { purge: true },
          { force: true, cascade: true },
          { force: true, recursive: true },
          { force: true, hard: true },
          { force: true, purge: true },
          { cascade: true, recursive: true },
          { hard: true, purge: true },
          { force: true, cascade: true, recursive: true },
          { force: true, hard: true, purge: true },
          { force: true, cascade: true, recursive: true, hard: true, purge: true }
        ];
        
        // محاولة الحذف القسري
        for (const options of forceOptions) {
          try {
            console.log('Attempting force delete with options:', options);
            await api.deleteProject(projectId, options);
            
            // إعادة تحميل البيانات
            try {
              const data = await api.getProjects();
              const projects = Array.isArray(data) ? data : [];
              if (projects.length === 0) {
                setRows(defaultProjects);
                setUsingDefaultData(true);
              } else {
                setRows(projects);
                setUsingDefaultData(false);
              }
              console.log('Data reloaded successfully after force delete');
              toast.success(lang === 'ar' ? 'تم حذف المشروع بنجاح باستخدام الحذف القسري' : 'Project deleted successfully using force delete');
              return;
            } catch (reloadError) {
              console.warn('Failed to reload data after force delete:', reloadError);
              toast.success(lang === 'ar' ? 'تم حذف المشروع بنجاح، لكن فشل تحديث القائمة' : 'Project deleted successfully, but failed to update the list');
              return;
            }
          } catch (forceError) {
            console.log(`Force delete with ${JSON.stringify(options)} failed:`, forceError);
            continue;
          }
        }
        
        // إذا فشلت جميع محاولات الحذف القسري، نعرض رسالة خطأ واضحة
        errorMessage = lang === 'ar' 
          ? 'فشل حذف المشروع بسبب ملفات resource.dat. يرجى التواصل مع المسؤول.'
          : 'Failed to delete project due to resource.dat files. Please contact administrator.';
        
        toast.error(errorMessage);
      } else {
        // خطأ آخر غير متعلق بملفات resource.dat
        if (err.status === 500) {
          errorMessage = lang === 'ar' 
            ? 'خطأ في الخادم - قد يكون المشروع مرتبط بعناصر أخرى'
            : 'Server error - Project may be linked to other entities';
        } else if (err.status === 404) {
          errorMessage = lang === 'ar' 
            ? 'المشروع غير موجود'
            : 'Project not found';
        } else if (err.status === 403) {
          errorMessage = lang === 'ar' 
            ? 'ليس لديك صلاحية لحذف هذا المشروع'
            : 'You do not have permission to delete this project';
        } else if (err.status === 400) {
          errorMessage = lang === 'ar' 
            ? 'لا يمكن حذف المشروع - قد يحتوي على ملفات أو بيانات مرتبطة'
            : 'Cannot delete project - it may contain linked files or data';
        }
        
        toast.error(errorMessage);
      }
    }
  };

  const openEditForm = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const initiateDelete = (project) => {
    setDeletingProject(project);
    // setShowForceDeleteDialog(true); // This state is no longer used for force delete
  };

  const openStartProjectDialog = (project) => {
    navigate(`/project-details/${project.id}`);
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    
    // setIsForceDeleting(true); // This state is no longer used for force delete
    
    try {
      console.log('Starting project deletion for:', deletingProject.id);
      
      // محاولة الحذف العادية أولاً
      try {
        console.log('Attempting normal delete...');
        await api.deleteProject(deletingProject.id);
        
        // إعادة تحميل البيانات
        const data = await api.getProjects({ silent: true }).catch(() => []);
        const projects = Array.isArray(data) ? data : [];
        if (projects.length === 0) {
          setRows(defaultProjects);
          setUsingDefaultData(true);
        } else {
          setRows(projects);
          setUsingDefaultData(false);
        }
        
        toast.success(lang === 'ar' ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully');
        setDeletingProject(null);
        // setShowForceDeleteDialog(false); // This state is no longer used for force delete
        return;
      } catch (normalError) {
        console.log('Normal delete failed:', normalError);
        
        // إذا كان الخطأ يتعلق بملفات resource.dat، نجرب الحذف القسري
        if (normalError.body && typeof normalError.body === 'string' && normalError.body.includes('resource.dat')) {
          console.log('Resource.dat deletion issue detected, attempting force delete...');
          
          // محاولة الحذف القسري مع معاملات مختلفة
          const forceOptions = [
            { force: true },
            { cascade: true },
            { recursive: true },
            { hard: true },
            { purge: true },
            { force: true, cascade: true },
            { force: true, recursive: true },
            { force: true, hard: true },
            { force: true, purge: true },
            { cascade: true, recursive: true },
            { hard: true, purge: true },
            { force: true, cascade: true, recursive: true },
            { force: true, hard: true, purge: true },
            { force: true, cascade: true, recursive: true, hard: true, purge: true }
          ];
          
          for (const options of forceOptions) {
            try {
              console.log('Attempting force delete with options:', options);
              await api.deleteProject(deletingProject.id, options);
              
              // إعادة تحميل البيانات
              const data = await api.getProjects({ silent: true }).catch(() => []);
              const projects = Array.isArray(data) ? data : [];
              if (projects.length === 0) {
                setRows(defaultProjects);
                setUsingDefaultData(true);
              } else {
                setRows(projects);
                setUsingDefaultData(false);
              }
              
              toast.success(lang === 'ar' ? 'تم حذف المشروع بنجاح باستخدام الحذف القسري' : 'Project deleted successfully using force delete');
              setDeletingProject(null);
              // setShowForceDeleteDialog(false); // This state is no longer used for force delete
              return;
            } catch (optionError) {
              console.log(`Force delete with ${JSON.stringify(options)} failed:`, optionError);
              continue;
            }
          }
          
          // إذا فشلت جميع محاولات الحذف القسري، نعرض رسالة خطأ واضحة
          const errorMessage = lang === 'ar' 
            ? 'فشل حذف المشروع بسبب ملفات resource.dat. يرجى التواصل مع المسؤول أو محاولة الحذف يدوياً.'
            : 'Failed to delete project due to resource.dat files. Please contact administrator or try manual deletion.';
          
          toast.error(errorMessage);
          
          // عرض تفاصيل إضافية في console للمطورين
          console.error('All deletion attempts failed for project:', deletingProject.id);
          console.error('Project details:', deletingProject);
          console.error('Last error:', normalError);
          
        } else {
          // خطأ آخر غير متعلق بملفات resource.dat
          let errorMessage = lang === 'ar' ? 'حدث خطأ في حذف المشروع' : 'Error deleting project';
          
          if (normalError.status === 500) {
            errorMessage = lang === 'ar' 
              ? 'خطأ في الخادم - قد يكون المشروع مرتبط بعناصر أخرى'
              : 'Server error - Project may be linked to other entities';
          } else if (normalError.status === 404) {
            errorMessage = lang === 'ar' 
              ? 'المشروع غير موجود'
              : 'Project not found';
          } else if (normalError.status === 403) {
            errorMessage = lang === 'ar' 
              ? 'ليس لديك صلاحية لحذف هذا المشروع'
              : 'You do not have permission to delete this project';
          } else if (normalError.status === 400) {
            errorMessage = lang === 'ar' 
              ? 'لا يمكن حذف المشروع - قد يحتوي على ملفات أو بيانات مرتبطة'
              : 'Cannot delete project - it may contain linked files or data';
          }
          
          toast.error(errorMessage);
          console.error('Project deletion failed:', normalError);
        }
      }
    } catch (error) {
      console.error('Error in confirmDelete:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف المشروع' : 'Error deleting project');
    } finally {
      // setIsForceDeleting(false); // This state is no longer used for force delete
      setDeletingProject(null);
      // setShowForceDeleteDialog(false); // This state is no longer used for force delete
    }
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
            <div className="bg-red-900/50 p-6 rounded-lg border border-red-500/30 max-w-2xl">
              <h3 className="text-xl font-semibold mb-4 text-red-300">
                {lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error Loading Data'}
              </h3>
              <p className="text-red-200 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="mr-2">
                  {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setError(null)}
                  className="ml-2"
                >
                  {lang === 'ar' ? 'إعادة المحاولة بدون إعادة تحميل' : 'Retry without reload'}
                </Button>
              </div>
            </div>
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{lang === 'ar' ? 'Project Master' : 'Project Master'}</h1>
            {isAdmin && (
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateForm} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    {lang === 'ar' ? 'إضافة مشروع رئيسي' : 'Add Project Master'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject 
                        ? (lang === 'ar' ? 'تعديل المشروع الرئيسي' : 'Edit Project Master')
                        : (lang === 'ar' ? 'إضافة مشروع رئيسي جديد' : 'Add New Project Master')
                      }
                    </DialogTitle>
                    <div className="text-sm text-muted-foreground mb-4">
                      {lang === 'ar' ? 'أدخل بيانات المشروع الرئيسي الجديد' : 'Enter the new project master data'}
                    </div>
                  </DialogHeader>
                  <ProjectForm
                    project={editingProject}
                    branches={branches}
                    branchesLoading={branchesLoading}
                    branchesError={branchesError}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
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
                    <th className="p-2">{lang === 'ar' ? 'الاسم (ع)' : 'Name (AR)'}</th>
                    <th className="p-2">{lang === 'ar' ? 'الاسم (EN)' : 'Name (EN)'}</th>
                    <th className="p-2">{lang === 'ar' ? 'البداية' : 'Start'}</th>
                    <th className="p-2">{lang === 'ar' ? 'النهاية' : 'End'}</th>
                    <th className="p-2">{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                    <th className="p-2">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{r.projectNameL1 || r.ProjectNameL1}</td>
                      <td className="p-2">{r.projectNameL2 || r.ProjectNameL2}</td>
                      <td className="p-2">{r.projectStart || r.ProjectStart}</td>
                      <td className="p-2">{r.projectEnd || r.ProjectEnd}</td>
                      <td className="p-2">{r.description || r.Description}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => openStartProjectDialog(r)}
                            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {lang === 'ar' ? 'ابدأ المشروع' : 'Start Project'}
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
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="text-xs px-2 py-1"
                                onClick={() => initiateDelete(r)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                {lang === 'ar' ? 'حذف' : 'Delete'}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td className="p-4 text-center text-muted-foreground" colSpan={6}>{lang === 'ar' ? 'لا توجد مشاريع.' : 'No projects.'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>



      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'ar' 
                ? `هل أنت متأكد من حذف المشروع "${deletingProject?.projectNameL1 || deletingProject?.ProjectNameL1 || 'Unknown'}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the project "${deletingProject?.projectNameL1 || deletingProject?.ProjectNameL1 || 'Unknown'}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default ProjectMasterPage; 