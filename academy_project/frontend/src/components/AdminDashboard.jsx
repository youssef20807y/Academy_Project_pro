import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Eye, Search, Users, BookOpen, Building } from 'lucide-react';
import api from '../services/api';
import { useI18n } from '../lib/i18n';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';

  const [courses, setCourses] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const [academies, setAcademies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [coursesRes, studentsRes, teachersRes, academiesRes] = await Promise.all([
        api.getCourses(),
        api.getStudents(),
        api.getTeachers(),
        api.getAcademies()
      ]);

      setCourses(Array.isArray(coursesRes) ? coursesRes : []);
      setStudents(Array.isArray(studentsRes) ? studentsRes : []);
      setTeachers(Array.isArray(teachersRes) ? teachersRes : []);
      setAcademies(Array.isArray(academiesRes) ? academiesRes : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    try {
      switch (type) {
        case 'course':
          await api.deleteCourse(id);
          setCourses(courses.filter(c => c.id !== id));
          break;
        case 'student':
          await api.deleteStudent(id);
          setStudents(students.filter(s => s.id !== id));
          break;
        case 'teacher':
          await api.deleteTeacher(id);
          setTeachers(teachers.filter(t => t.id !== id));
          break;
        case 'academy':
          await api.deleteAcademy(id);
          setAcademies(academies.filter(a => a.id !== id));
          break;
      }
      toast.success(lang === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
    } catch (error) {
      toast.error(lang === 'ar' ? 'خطأ في الحذف' : 'Error deleting');
    }
  };

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10">
          <div className="text-center text-white/90">
            {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {lang === 'ar' ? 'لوحة إدارة النظام' : 'System Administration'}
          </h1>
          <p className="text-white/80 text-lg">
            {lang === 'ar' ? 'إدارة جميع عناصر النظام' : 'Manage all system elements'}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{courses.length}</div>
                  <div className="text-white/60 text-sm">{lang === 'ar' ? 'الدورات' : 'Courses'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{students.length}</div>
                  <div className="text-white/60 text-sm">{lang === 'ar' ? 'الطلاب' : 'Students'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{teachers.length}</div>
                  <div className="text-white/60 text-sm">{lang === 'ar' ? 'المدرسين' : 'Teachers'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-orange-400" />
                <div>
                  <div className="text-2xl font-bold text-white">{academies.length}</div>
                  <div className="text-white/60 text-sm">{lang === 'ar' ? 'الأكاديميات' : 'Academies'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="courses" className="data-[state=active]:bg-white/20">
              <BookOpen className="h-4 w-4 ml-2" />
              {lang === 'ar' ? 'الدورات' : 'Courses'}
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 ml-2" />
              {lang === 'ar' ? 'الطلاب' : 'Students'}
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 ml-2" />
              {lang === 'ar' ? 'المدرسين' : 'Teachers'}
            </TabsTrigger>
            <TabsTrigger value="academies" className="data-[state=active]:bg-white/20">
              <Building className="h-4 w-4 ml-2" />
              {lang === 'ar' ? 'الأكاديميات' : 'Academies'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4`} />
                  <Input
                    placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                </div>
                <Button className="academy-button rounded-full">
                  <Plus className="h-4 w-4 ml-2" />
                  {lang === 'ar' ? 'إضافة دورة' : 'Add Course'}
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'اسم الدورة' : 'Course Name'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الوصف' : 'Description'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {course.name || course.courseName || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {course.description || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={course.active ? 'default' : 'secondary'}>
                              {course.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete('course', course.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4`} />
                  <Input
                    placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                </div>
                <Button className="academy-button rounded-full">
                  <Plus className="h-4 w-4 ml-2" />
                  {lang === 'ar' ? 'إضافة طالب' : 'Add Student'}
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'اسم الطالب' : 'Student Name'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {student.firstName || student.FirstName || ''} {student.lastName || student.LastName || ''}
                          </td>
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {student.email || student.Email || student.studentEmail || student.StudentEmail || student.emailAddress || student.EmailAddress || student.userEmail || student.UserEmail || student.mail || student.Mail || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={student.active ? 'default' : 'secondary'}>
                              {student.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete('student', student.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="teachers">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4`} />
                  <Input
                    placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                </div>
                <Button className="academy-button rounded-full">
                  <Plus className="h-4 w-4 ml-2" />
                  {lang === 'ar' ? 'إضافة مدرس' : 'Add Teacher'}
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'اسم المدرس' : 'Teacher Name'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {teacher.firstName || teacher.FirstName || ''} {teacher.lastName || teacher.LastName || ''}
                          </td>
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {teacher.email || teacher.Email || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={teacher.active ? 'default' : 'secondary'}>
                              {teacher.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete('teacher', teacher.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academies">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative">
                  <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4`} />
                  <Input
                    placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                </div>
                <Button className="academy-button rounded-full">
                  <Plus className="h-4 w-4 ml-2" />
                  {lang === 'ar' ? 'إضافة أكاديمية' : 'Add Academy'}
                </Button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'اسم الأكاديمية' : 'Academy Name'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الوصف' : 'Description'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                        <th className="px-4 py-3 text-left text-white/80 font-medium text-sm">
                          {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {academies.map((academy) => (
                        <tr key={academy.id} className="hover:bg-white/5">
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {academy.name || academy.academyName || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-white/90 text-sm">
                            {academy.description || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={academy.active ? 'default' : 'secondary'}>
                              {academy.active ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDelete('academy', academy.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default AdminDashboard; 