import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useI18n } from '../lib/i18n';
import api from '../services/api';
import { Trash2, Eye, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner';

const StudentsPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';

  const [loading, setLoading] = React.useState(true);
  const [students, setStudents] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const [displayCount, setDisplayCount] = React.useState(Infinity);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [studentImages, setStudentImages] = React.useState({});

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getStudents();
        const studentsList = Array.isArray(res) ? res : [];
        setStudents(studentsList);
        
        // تحميل صور الطلاب
        await loadStudentImages(studentsList);
      } catch (_) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    // تنظيف URLs عند إزالة المكون
    return () => {
      Object.values(studentImages).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  // Check if user is admin
  React.useEffect(() => {
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
    
    checkAdminStatus();
  }, []);

  const getName = (s) => {
    const first = s.firstName || s.FirstName || '';
    const last = s.lastName || s.LastName || '';
    return (
      s.fullName ||
      s.studentNameL1 || s.StudentNameL1 ||
      s.studentNameL2 || s.StudentNameL2 ||
      `${first} ${last}`.trim() ||
      (lang === 'ar' ? 'طالب' : 'Student')
    );
  };

  const getEmail = (s) => s.email || s.Email || '';
  const getPhone = (s) => s.phoneNumber || s.PhoneNumber || s.studentPhone || s.StudentPhone || '';
  const isActive = (s) => (typeof s.active === 'boolean' ? s.active : (typeof s.Active === 'boolean' ? s.Active : !!s.active));
  const getId = (s) => s.id || s.Id || s.guid || s.Guid || getName(s);

  // Prefer account user id for profile picture; must be a GUID
  const getAccountIdForImage = (s) => {
    const candidate = s.userId || s.UserId || s.id || s.Id || '';
    const str = String(candidate);
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(str) ? str : '';
  };

  // دالة لتحميل صور الطلاب
  const loadStudentImages = async (studentsList) => {
    const images = {};
    for (const student of studentsList) {
      const studentId = getAccountIdForImage(student);
      if (!studentId) continue;
      try {
        const imageBlob = await api.getProfilePicture(studentId);
        if (imageBlob && imageBlob.size > 0) {
          const imageUrl = URL.createObjectURL(imageBlob);
          images[studentId] = imageUrl;
        }
      } catch (error) {
        console.log(`No profile picture for student ${studentId}:`, error.message);
        // لا نحتاج لإضافة أي شيء للصور إذا لم توجد
      }
    }
    setStudentImages(images);
  };

  // Refresh the current user's picture in list when auth changes (after upload in /account)
  React.useEffect(() => {
    const handler = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        const userId = user.id || user.Id || user.userId || user.UserId || '';
        const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!guidRegex.test(String(userId))) return;
        const blob = await api.getProfilePicture(userId);
        if (blob && blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setStudentImages((prev) => ({ ...prev, [userId]: url }));
        }
      } catch (_) {}
    };
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, []);

  const handleDelete = async (studentId) => {
    try {
      await api.deleteStudent(studentId);
      setStudents(students.filter(s => s.id !== studentId));
      toast.success(lang === 'ar' ? 'تم حذف الطالب بنجاح' : 'Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف الطالب' : 'Error deleting student');
    }
  };

  const confirmDelete = async () => {
    if (studentToDelete) {
      await handleDelete(studentToDelete.id);
      setStudentToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const openDeleteDialog = (student) => {
    setStudentToDelete(student);
    setShowDeleteDialog(true);
  };



  const handleView = (student) => {
    // Redirect to student details page
    window.location.href = `/students/data?id=${student.id}&view=true`;
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const values = [
        getName(s),
        getEmail(s),
        getPhone(s),
      ].filter(Boolean).map((v) => String(v).toLowerCase());
      return values.some((v) => v.includes(q));
    });
  }, [students, query]);

  const displayedStudents = React.useMemo(() => {
    return filtered.slice(0, displayCount);
  }, [filtered, displayCount]);

  const hasMoreStudents = false;

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {lang === 'ar' ? 'الطلاب' : 'Students'}
          </h1>
          <div className="flex items-center gap-2">
            <Button asChild className="rounded-full academy-button">
              <a href="/students/data">{lang === 'ar' ? 'إضافة طالب' : 'Add Student'}</a>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-transparent border-white/30 text-white hover:bg-white/10">
              <a href="/students/attendance">{lang === 'ar' ? 'الحضور' : 'Attendance'}</a>
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-transparent border-white/30 text-white hover:bg-white/10">
              <a href="/students/evaluations">{lang === 'ar' ? 'التقييمات' : 'Evaluations'}</a>
            </Button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="relative">
            <Input
              placeholder={lang === 'ar' ? 'ابحث باسم الطالب أو البريد...' : 'Search by name or email...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={isRtl ? 'pr-4 pl-4' : 'pl-4 pr-4'}
              dir={isRtl ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6">
          {loading ? (
            <div className="text-center text-white/90 py-16">
              {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-white/80 py-16">
              {lang === 'ar' ? 'لا يوجد طلاب' : 'No students found'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedStudents.map((s) => (
                <div key={getId(s)} className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/10">
                  <div className="flex items-start justify-between gap-4">
                    {/* صورة الطالب */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/30 overflow-hidden flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        {studentImages[getId(s)] ? (
                          <img 
                            src={studentImages[getId(s)]} 
                            alt={getName(s)}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            loading="lazy"
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${studentImages[getId(s)] ? 'hidden' : 'flex'}`}>
                          <User className="h-8 w-8 text-white/60" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-lg mb-1 truncate">
                        {getName(s)}
                      </div>
                      {getEmail(s) && <div className="text-white/80 text-sm truncate mb-1">{getEmail(s)}</div>}
                      {getPhone(s) && <div className="text-white/60 text-sm truncate">{getPhone(s)}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${isActive(s) ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'}`}>
                        {isActive(s) ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                      </div>
                      
                      {/* Admin Action Buttons */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-1 h-8 w-8 rounded-full transition-all duration-200"
                            onClick={() => handleView(s)}
                            title={lang === 'ar' ? 'عرض' : 'View'}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-8 w-8 rounded-full transition-all duration-200"
                            onClick={() => openDeleteDialog(s)}
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'ar' 
                ? `هل أنت متأكد من حذف الطالب "${studentToDelete ? getName(studentToDelete) : ''}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the student "${studentToDelete ? getName(studentToDelete) : ''}"? This action cannot be undone.`
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

export default StudentsPage; 