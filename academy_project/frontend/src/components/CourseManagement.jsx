import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import api from '@/services/api';
import { useI18n } from '../lib/i18n';

const CourseForm = ({ course, onSubmit, onCancel, loading = false }) => {
  const { lang } = useI18n();
  const [formData, setFormData] = React.useState({
    id: course?.id || '',
    academyClaseMasterId: course?.academyClaseMasterId || '',
    academyClaseTypeId: course?.academyClaseTypeId || '',
    claseNumber: course?.claseNumber || '',
    image: null
  });
  const [masters, setMasters] = React.useState([]);
  const [types, setTypes] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [m, t] = await Promise.all([
          api.getCourseMasters({ silent: true }).catch(() => []),
          api.getCourseTypes({ silent: true }).catch(() => [])
        ]);
        setMasters(Array.isArray(m) ? m : []);
        setTypes(Array.isArray(t) ? t : []);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('Id', formData.id);
    data.append('AcademyClaseMasterId', formData.academyClaseMasterId);
    data.append('AcademyClaseTypeId', formData.academyClaseTypeId);
    data.append('ClaseNumber', formData.claseNumber);
    if (formData.image) {
      data.append('Image', formData.image);
    }
    onSubmit(data);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="claseNumber">{lang === 'ar' ? 'رقم الدرس' : 'Lesson Number'}</Label>
          <Input
            id="claseNumber"
            type="number"
            value={formData.claseNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, claseNumber: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="academyClaseMasterId">{lang === 'ar' ? 'الدورة الرئيسية' : 'Master Course'}</Label>
          <Select
            value={formData.academyClaseMasterId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, academyClaseMasterId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={lang === 'ar' ? 'اختر الدورة الرئيسية' : 'Select master course'} />
            </SelectTrigger>
            <SelectContent>
              {masters.map((master) => (
                <SelectItem key={master.id} value={master.id}>
                  {master.claseNameL1 || master.claseNameL2 || master.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="academyClaseTypeId">{lang === 'ar' ? 'نوع الدورة' : 'Course Type'}</Label>
          <Select
            value={formData.academyClaseTypeId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, academyClaseTypeId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder={lang === 'ar' ? 'اختر نوع الدورة' : 'Select course type'} />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.typeNameL1 || type.typeNameL2 || type.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="image">{lang === 'ar' ? 'صورة الدرس' : 'Lesson Image'}</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
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

const CourseManagement = ({ onCourseChange }) => {
  const { lang } = useI18n();
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedCourse, setSelectedCourse] = React.useState(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCourses({ silent: true });
      setCourses(Array.isArray(data) ? data : []);
      if (onCourseChange) onCourseChange(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(lang === 'ar' ? 'حدث خطأ في تحميل الدورات' : 'Error loading courses');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCourses();
  }, [lang]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedCourse) {
        await api.updateCourse(selectedCourse.id, formData);
      } else {
        await api.createCourse(formData);
      }
      setIsFormOpen(false);
      setSelectedCourse(null);
      loadCourses();
    } catch (err) {
      console.error('Error saving course:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حفظ الدرس' : 'Error saving lesson');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId) => {
    try {
      await api.deleteCourse(courseId);
      loadCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(lang === 'ar' ? 'حدث خطأ في حذف الدرس' : 'Error deleting lesson');
    }
  };

  const openEditForm = (course) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadCourses}>
          {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{lang === 'ar' ? 'إدارة الدروس' : 'Lesson Management'}</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateForm}>
              {lang === 'ar' ? 'إضافة درس جديد' : 'Add New Lesson'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCourse 
                  ? (lang === 'ar' ? 'تعديل الدرس' : 'Edit Lesson')
                  : (lang === 'ar' ? 'إضافة درس جديد' : 'Add New Lesson')
                }
              </DialogTitle>
            </DialogHeader>
            <CourseForm
              course={selectedCourse}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              loading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {lang === 'ar' ? 'درس' : 'Lesson'} {course.claseNumber || course.id}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    ID: {course.id}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(course)}
                  >
                    {lang === 'ar' ? 'تعديل' : 'Edit'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
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
                            ? 'هل أنت متأكد من حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء.'
                            : 'Are you sure you want to delete this lesson? This action cannot be undone.'
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(course.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {lang === 'ar' ? 'حذف' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Badge variant="secondary" className="mb-1">
                  {lang === 'ar' ? 'معرف الدورة الرئيسية' : 'Master ID'}
                </Badge>
                <p className="text-sm">{course.academyClaseMasterId}</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">
                  {lang === 'ar' ? 'نوع الدورة' : 'Type ID'}
                </Badge>
                <p className="text-sm">{course.academyClaseTypeId}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {lang === 'ar' ? 'لا توجد دروس متاحة' : 'No lessons available'}
        </div>
      )}
    </div>
  );
};

export default CourseManagement; 