import React from 'react';

import { useI18n } from '../lib/i18n';
import { useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, CalendarIcon } from 'lucide-react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  isToday
} from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';

// بيانات افتراضية للمشاريع
const generateDefaultProjects = () => {
  const projects = [];
  const currentDate = new Date();
  
  // إنشاء مشاريع لشهرين (الشهر الحالي والشهر القادم)
  for (let i = 0; i < 20; i++) {
    const projectStartDate = new Date(currentDate);
    projectStartDate.setDate(currentDate.getDate() + (i * 7)); // مشروع كل أسبوع
    
    const projectEndDate = new Date(projectStartDate);
    projectEndDate.setDate(projectStartDate.getDate() + 14); // مدة المشروع أسبوعين
    
    const projectTypes = [
        {
        projectNameL1: 'مشروع تطوير الويب',
        projectNameL2: 'Web Development Project',
        description: 'تطوير موقع ويب متكامل باستخدام React و Node.js',
        projectStart: projectStartDate,
        projectEnd: projectEndDate
        },
        {
        projectNameL1: 'مشروع تطوير التطبيقات المحمولة',
        projectNameL2: 'Mobile App Development Project',
        description: 'تطوير تطبيق iOS و Android باستخدام React Native',
        projectStart: projectStartDate,
        projectEnd: projectEndDate
        },
        {
        projectNameL1: 'مشروع قواعد البيانات',
        projectNameL2: 'Database Project',
        description: 'تصميم وإدارة قاعدة بيانات متقدمة باستخدام MySQL و MongoDB',
        projectStart: projectStartDate,
        projectEnd: projectEndDate
        },
        {
        projectNameL1: 'مشروع الذكاء الاصطناعي',
        projectNameL2: 'AI Project',
        description: 'تطوير نظام ذكاء اصطناعي للتعرف على الصور',
        projectStart: projectStartDate,
        projectEnd: projectEndDate
        },
        {
        projectNameL1: 'مشروع الأمن السيبراني',
        projectNameL2: 'Cybersecurity Project',
        description: 'تطوير نظام حماية متقدم للأمن السيبراني',
        projectStart: projectStartDate,
        projectEnd: projectEndDate
        }
      ];
      
    const randomType = projectTypes[Math.floor(Math.random() * projectTypes.length)];
      
    projects.push({
      id: i + 1,
      ...randomType,
      date: projectStartDate,
      startDate: projectStartDate.toISOString(),
      endDate: projectEndDate.toISOString(),
      raw: {
        id: i + 1,
        ...randomType,
        projectStart: projectStartDate.toISOString(),
        projectEnd: projectEndDate.toISOString()
        }
      });
  }
  
  return projects;
};

const defaultProjects = generateDefaultProjects();

const ProjectForm = ({ project, onSubmit, onCancel, loading = false }) => {
  const { lang } = useI18n();
  const [formData, setFormData] = React.useState({
    id: project?.id || '',
    ProjectNameL1: project?.ProjectNameL1 || project?.projectNameL1 || project?.title || '',
    ProjectNameL2: project?.ProjectNameL2 || project?.projectNameL2 || '',
    Description: project?.description || project?.Description || '',
    ProjectStart: project?.startDate || project?.ProjectStart || project?.projectStart || '',
    ProjectEnd: project?.endDate || project?.ProjectEnd || project?.projectEnd || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ProjectNameL1">{lang === 'ar' ? 'اسم المشروع (عربي)' : 'Project Name (Arabic)'} *</Label>
          <Input
            id="ProjectNameL1"
            value={formData.ProjectNameL1}
            onChange={(e) => setFormData(prev => ({ ...prev, ProjectNameL1: e.target.value }))}
            placeholder={lang === 'ar' ? 'أدخل اسم المشروع بالعربية' : 'Enter project name in Arabic'}
            className="bg-white/90 text-gray-800"
          />
        </div>
        <div>
          <Label htmlFor="ProjectNameL2">{lang === 'ar' ? 'اسم المشروع (إنجليزي)' : 'Project Name (English)'}</Label>
          <Input
            id="ProjectNameL2"
            value={formData.ProjectNameL2}
            onChange={(e) => setFormData(prev => ({ ...prev, ProjectNameL2: e.target.value }))}
            placeholder={lang === 'ar' ? 'أدخل اسم المشروع بالإنجليزية' : 'Enter project name in English'}
            className="bg-white/90 text-gray-800"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ProjectStart">{lang === 'ar' ? 'تاريخ البداية' : 'Start Date'} *</Label>
          <Input
            id="ProjectStart"
            type="date"
            value={formData.ProjectStart}
            onChange={(e) => setFormData(prev => ({ ...prev, ProjectStart: e.target.value }))}
            className="bg-white/90 text-gray-800"
          />
        </div>
        <div>
          <Label htmlFor="ProjectEnd">{lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}</Label>
          <Input
            id="ProjectEnd"
            type="date"
            value={formData.ProjectEnd}
            onChange={(e) => setFormData(prev => ({ ...prev, ProjectEnd: e.target.value }))}
            className="bg-white/90 text-gray-800"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="Description">{lang === 'ar' ? 'الوصف' : 'Description'}</Label>
        <Textarea
          id="Description"
          value={formData.Description}
          onChange={(e) => setFormData(prev => ({ ...prev, Description: e.target.value }))}
          placeholder={lang === 'ar' ? 'أدخل وصف المشروع' : 'Enter project description'}
          className="bg-white/90 text-gray-800"
          rows={3}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ' : 'Save')}
        </Button>
      </div>
    </form>
  );
};

const SessionsPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  const locale = isRtl ? arSA : enUS;
  const [searchParams] = useSearchParams();
  
  // قراءة معاملات URL للأكاديمية والفرع
  const academyId = searchParams.get('academy');
  const branchId = searchParams.get('branch');
  
  console.log('🔍 URL Parameters - Academy:', academyId, 'Branch:', branchId);

  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [usingDefaultData, setUsingDefaultData] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [projectDatesMap, setProjectDatesMap] = React.useState(() => {
    try {
      const raw = localStorage.getItem('projectDatesMap');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // التحقق من صلاحيات المستخدم
  const [userRole, setUserRole] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    // Update page title
    document.title = lang === 'ar' ? 'إدارة المشاريع - الأكاديمية' : 'Projects Management - Academy';
    
    // التحقق من دور المستخدم
    const checkUserRole = () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          setUserRole(user.role || user.Role || user.roleName || user.RoleName);
          setIsAdmin(user.role === 'admin' || user.Role === 'admin' || user.roleName === 'admin' || user.RoleName === 'admin');
        }
      } catch (error) {
        console.log('Error parsing user info:', error);
      }
    };
    
    checkUserRole();
  }, [lang]);

  const persistProjectDate = React.useCallback((projectId, dateStr) => {
    if (!projectId || !dateStr) return;
    setProjectDatesMap((prev) => {
      const next = { ...prev, [projectId]: dateStr };
      try { localStorage.setItem('projectDatesMap', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const extractDate = (row) => {
    // حاول اكتشاف حقل التاريخ من عدة احتمالات
    const candidates = [
      row.date,
      row.sessionDate,
      row.startDate,
      row.DateStart,
      row.createdAt,
      row.updatedAt,
    ].filter(Boolean);
    for (const c of candidates) {
      const d = new Date(c);
      if (!isNaN(d)) return d;
    }
    return null;
  };

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load projects master data instead of ProgramsContentDetail
        const data = await api.getProjects().catch(() => []);
        const rows = Array.isArray(data) ? data : [];
        
        if (rows.length === 0) {
          // استخدام البيانات الافتراضية إذا لم توجد بيانات
          setProjects(defaultProjects);
          setUsingDefaultData(true);
        } else {
          // تصفية المشاريع حسب الأكاديمية والفرع إذا كانت موجودة في URL
          let filteredRows = rows;
          
          if (academyId && branchId) {
            console.log('🔍 Filtering projects by Academy:', academyId, 'and Branch:', branchId);
            
            // تصفية المشاريع حسب الأكاديمية والفرع
            filteredRows = rows.filter(project => {
              const projectAcademyId = project.academyDataId || project.AcademyDataId || project.academyId || project.AcademyId;
              const projectBranchId = project.branchesDataId || project.BranchesDataId || project.branchId || project.BranchId;
              
              const academyMatch = projectAcademyId === academyId;
              const branchMatch = projectBranchId === branchId;
              
              console.log('🔍 Project:', project.id, 'Academy:', projectAcademyId, 'Branch:', projectBranchId, 'Match:', academyMatch && branchMatch);
              
              return academyMatch && branchMatch;
            });
            
            console.log('✅ Filtered projects count:', filteredRows.length, 'from total:', rows.length);
          } else {
            console.log('ℹ️ No academy/branch filter applied, showing all projects');
          }
          
          const normalized = filteredRows.map((r) => {
          const sid = r.id || r.Id;
          const mappedDate = sid && projectDatesMap[sid] ? new Date(projectDatesMap[sid]) : null;
          return {
            id: sid,
            title: r.ProjectNameL1 || r.projectNameL1 || r.ProjectNameL2 || r.projectNameL2 || 'Project',
            description: r.Description || r.description || '',
            raw: r,
            date: mappedDate || extractDate(r),
            startDate: r.ProjectStart || r.projectStart || r.raw?.projectStart,
            endDate: r.ProjectEnd || r.projectEnd || r.raw?.projectEnd
          };
        });
        setProjects(normalized);
          setUsingDefaultData(false);
        }
      } catch (e) {
        // في حالة الخطأ، استخدم البيانات الافتراضية
        setProjects(defaultProjects);
        setUsingDefaultData(false);
        setError(lang === 'ar' ? 'فشل تحميل البيانات - عرض بيانات افتراضية' : 'Failed to load data - showing default data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lang, projectDatesMap, academyId, branchId]); // إضافة academyId و branchId كتبعيات

  const daysInCalendar = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: isRtl ? 6 : 0 }); // السبت للعربية، الأحد للإنجليزية
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: isRtl ? 6 : 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth, isRtl]);

  const projectsByDate = React.useMemo(() => {
    const map = new Map();
    for (const s of projects) {
      // Use start date for calendar display
      const displayDate = s.startDate ? new Date(s.startDate) : s.date;
      if (!displayDate) continue;
      const key = format(displayDate, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return map;
  }, [projects]);

  const tableProjects = React.useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      // Sort by start date first, then by generic date
      const aStartDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bStartDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      if (aStartDate && bStartDate) {
        return aStartDate - bStartDate;
      }
      // Fallback to generic date
      const at = a.date ? a.date.getTime() : 0;
      const bt = b.date ? b.date.getTime() : 0;
      return at - bt;
    });
    if (selectedDate) {
      return sorted.filter((s) => {
        const startDate = s.startDate ? new Date(s.startDate) : s.date;
        return startDate && isSameDay(startDate, selectedDate);
      });
    }
    return sorted;
  }, [projects, selectedDate]);

  const weekdayNames = React.useMemo(() => {
    // 0: Sunday .. 6: Saturday; نضبط الترتيب بحسب بداية الأسبوع
    const base = [0,1,2,3,4,5,6];
    const startIdx = isRtl ? 6 : 0;
    const order = [...base.slice(startIdx), ...base.slice(0, startIdx)];
    return order.map((d) => format(new Date(2024, 8, d + 1), 'EEE', { locale }));
  }, [isRtl, locale]);

  const monthLabel = format(currentMonth, lang === 'ar' ? 'MMMM yyyy' : 'MMMM yyyy', { locale });

  const goPrev = () => setCurrentMonth((m) => subMonths(m, 1));
  const goNext = () => setCurrentMonth((m) => addMonths(m, 1));

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      // Validate Project data
      if (!formData.ProjectNameL1) {
        alert(lang === 'ar' ? 'الرجاء إدخال اسم المشروع بالعربية' : 'Please enter project name in Arabic');
        return;
      }
      if (!formData.ProjectStart) {
        alert(lang === 'ar' ? 'الرجاء إدخال تاريخ بداية المشروع' : 'Please enter project start date');
        return;
      }
      if (selectedProject) {
        await api.updateProject(selectedProject.id, formData);
      } else {
        const created = await api.createProject(formData);
        const newId = created?.id || created?.Id;
        if (newId) {
          persistProjectDate(newId, formData.ProjectStart);
        }
      }
      setIsFormOpen(false);
      setSelectedProject(null);
      // إعادة تحميل البيانات
      const data = await api.getProjects().catch(() => []);
      const rows = Array.isArray(data) ? data : [];
      if (rows.length === 0) {
        setProjects(defaultProjects);
        setUsingDefaultData(true);
      } else {
        const normalized = rows.map((r) => {
          const sid = r.id || r.Id;
          const mappedDate = sid && projectDatesMap[sid] ? new Date(projectDatesMap[sid]) : null;
          return {
            id: sid,
            title: r.ProjectNameL1 || r.projectNameL1 || r.ProjectNameL2 || r.projectNameL2 || 'Project',
            description: r.Description || r.description || '',
            raw: r,
            date: mappedDate || extractDate(r),
            startDate: r.ProjectStart || r.projectStart || r.raw?.projectStart,
            endDate: r.ProjectEnd || r.projectEnd || r.raw?.projectEnd
          };
        });
        setProjects(normalized);
        setUsingDefaultData(false);
      }
    } catch (err) {
      console.error('Error saving project:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حفظ المشروع' : 'Error saving project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await api.deleteProject(projectId);
      // remove persisted date
      setProjectDatesMap((prev) => {
        const next = { ...prev };
        delete next[projectId];
        try { localStorage.setItem('projectDatesMap', JSON.stringify(next)); } catch {}
        return next;
      });
      // إعادة تحميل البيانات
      const data = await api.getProjects().catch(() => []);
      const rows = Array.isArray(data) ? data : [];
      if (rows.length === 0) {
        setProjects(defaultProjects);
        setUsingDefaultData(true);
      } else {
        const normalized = rows.map((r) => {
          const sid = r.id || r.Id;
          const mappedDate = sid && projectDatesMap[sid] ? new Date(projectDatesMap[sid]) : null;
          return {
            id: sid,
            title: r.ProjectNameL1 || r.projectNameL1 || r.ProjectNameL2 || r.projectNameL2 || 'Project',
            description: r.Description || r.description || '',
            raw: r,
            date: mappedDate || extractDate(r),
            startDate: r.ProjectStart || r.projectStart || r.raw?.projectStart,
            endDate: r.ProjectEnd || r.projectEnd || r.raw?.projectEnd
          };
        });
        setProjects(normalized);
        setUsingDefaultData(false);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حذف المشروع' : 'Error deleting project');
    }
  };

  const openEditForm = (project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white p-4" style={{ backgroundColor: '#274e73' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-lg">{lang === 'ar' ? 'جاري تحميل المشاريع...' : 'Loading projects...'}</p>
          </div>
        </div>
      </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white flex items-center gap-1 sm:gap-2">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              {lang === 'ar' ? 'تقويم المشاريع' : 'Projects Calendar'}
            </h1>
            <div className="flex items-center gap-2">
              {isAdmin && (
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateForm} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                      {lang === 'ar' ? 'إضافة مشروع' : 'Add Project'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                        {selectedProject 
                          ? (lang === 'ar' ? 'تعديل المشروع' : 'Edit Project')
                          : (lang === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project')}
                    </DialogTitle>
                    <DialogDescription>
                        {lang === 'ar' ? 'أدخل تفاصيل المشروع مع تواريخ البداية والنهاية' : 'Enter project details with start and end dates'}
                    </DialogDescription>
                  </DialogHeader>
                    <ProjectForm
                      project={selectedProject}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    loading={isSubmitting}
                  />
                </DialogContent>
              </Dialog>
              )}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent p-1 sm:p-2" onClick={goPrev}>
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <div className="text-white/90 font-semibold min-w-[100px] sm:min-w-[120px] lg:min-w-[160px] text-center text-xs sm:text-sm lg:text-base">{monthLabel}</div>
              <Button variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent p-1 sm:p-2" onClick={goNext}>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              </div>
            </div>
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

          <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-2 sm:p-4 lg:p-6">
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-2 text-center text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">
              {weekdayNames.map((name, idx) => (
                <div key={idx} className="py-1 px-0.5 sm:px-1 text-[10px] sm:text-xs">{name}</div>
              ))}
            </div>
            
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
              {daysInCalendar.map((day) => {
                const key = format(day, 'yyyy-MM-dd');
                const dayProjects = projectsByDate.get(key) || [];
                const inMonth = isSameMonth(day, currentMonth);
                const isTodayFlag = isToday(day);
                return (
                  <div
                    key={key}
                    className={`min-h-16 sm:min-h-20 lg:min-h-28 rounded-md sm:rounded-lg lg:rounded-xl border p-0.5 sm:p-1 lg:p-2 flex flex-col ${inMonth ? 'border-border bg-white/5' : 'border-border/40 bg-black/10'} ${isTodayFlag ? 'ring-1 sm:ring-2 ring-primary/40' : ''} cursor-pointer hover:bg-white/10 transition-colors`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <div className={`text-[10px] sm:text-xs lg:text-sm font-medium ${inMonth ? 'text-white' : 'text-white/50'}`}>{format(day, 'd', { locale })}</div>
                      {isTodayFlag && <span className="text-[6px] sm:text-[8px] lg:text-[10px] text-primary font-bold">{lang === 'ar' ? 'اليوم' : 'Today'}</span>}
                    </div>
                    <div className="flex-1 space-y-0.5 overflow-hidden">
                      {dayProjects.slice(0, 1).map((s) => (
                        <div key={s.id} className="text-[6px] sm:text-[8px] lg:text-xs px-0.5 sm:px-1 lg:px-2 py-0.5 rounded bg-primary/20 text-primary truncate font-medium">
                          {s.title}
                        </div>
                      ))}
                      {dayProjects.length > 1 && (
                        <div className="text-[6px] sm:text-[8px] lg:text-[10px] text-white/70 font-medium">+{dayProjects.length - 1}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected day drawer-like summary */}
            {selectedDate && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-black font-semibold text-sm sm:text-base">
                    {lang === 'ar' ? 'مشاريع يوم' : 'Projects on'} {format(selectedDate, 'PPP', { locale })}
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-full text-black hover:bg-black/10 bg-transparent" onClick={() => setSelectedDate(null)}>
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </Button>
                </div>
                <div className="grid gap-2">
                  {(() => {
                    const key = format(selectedDate, 'yyyy-MM-dd');
                    const dayProjects = projectsByDate.get(key) || [];
                    if (!dayProjects.length) {
                      return <div className="text-sm text-black">{lang === 'ar' ? 'لا توجد مشاريع في هذا اليوم.' : 'No projects for this day.'}</div>;
                    }
                    return dayProjects.map((s) => (
                      <div key={s.id} className="p-2 sm:p-3 rounded-lg border border-border/60 bg-white/95">
                        <div className="text-black font-medium mb-1 truncate text-sm sm:text-base">{s.title}</div>
                        {s.description && <div className="text-black text-xs mb-1 line-clamp-2">{s.description}</div>}
                        <div className="text-xs text-black mt-2">
                          <div>{lang === 'ar' ? 'تاريخ البداية:' : 'Start Date:'} {s.startDate ? format(new Date(s.startDate), 'PPP', { locale }) : (lang === 'ar' ? 'غير محدد' : 'Not specified')}</div>
                          <div>{lang === 'ar' ? 'تاريخ النهاية:' : 'End Date:'} {s.endDate ? format(new Date(s.endDate), 'PPP', { locale }) : (lang === 'ar' ? 'غير محدد' : 'Not specified')}</div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Form Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedProject 
                    ? (lang === 'ar' ? 'تعديل المشروع' : 'Edit Project')
                    : (lang === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project')}
                </DialogTitle>
                <DialogDescription>
                  {lang === 'ar' ? 'أدخل تفاصيل المشروع مع تواريخ البداية والنهاية' : 'Enter project details with start and end dates'}
                </DialogDescription>
              </DialogHeader>
              <ProjectForm
                project={selectedProject}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                loading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </section>
  );
};

export default SessionsPage; 