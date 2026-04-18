import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';
import api from '../services/api';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

const EvaluationsPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [evaluations, setEvaluations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [openStudent, setOpenStudent] = useState(false);

  useEffect(() => {
    loadEvaluationsData();
  }, []);

  const loadEvaluationsData = async () => {
    setLoading(true);
    try {
      const [evaluationsRes, attendanceRes, studentsRes] = await Promise.all([
        api.getEvaluations().catch(() => []),
        api.getAttendance().catch(() => []),
        api.getStudents().catch(() => [])
      ]);

      if (evaluationsRes && Array.isArray(evaluationsRes)) {
        setEvaluations(evaluationsRes);
      }
      if (attendanceRes && Array.isArray(attendanceRes)) {
        setAttendance(attendanceRes);
      }
      if (Array.isArray(studentsRes)) {
        setStudents(studentsRes);
      }
    } catch (error) {
      console.error('Error loading evaluations data:', error);
      // استخدام بيانات تجريبية في حالة الخطأ
      setEvaluations([
        {
          id: '1',
          studentDataId: '1',
          attendanceRate: 85,
          absenceRate: 15,
          browsingRate: 78,
          contentRatio: 92,
          date: '2024-01-15'
        },
        {
          id: '2',
          studentDataId: '1',
          attendanceRate: 90,
          absenceRate: 10,
          browsingRate: 85,
          contentRatio: 88,
          date: '2024-01-08'
        }
      ]);
      setAttendance([
        {
          id: '1',
          studentDataId: '1',
          dateAttend: '2024-01-15',
          attendAccept: true
        },
        {
          id: '2',
          studentDataId: '1',
          dateAttend: '2024-01-14',
          attendAccept: true
        },
        {
          id: '3',
          studentDataId: '1',
          dateAttend: '2024-01-13',
          attendAccept: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeLabel = (percentage) => {
    if (percentage >= 90) return lang === 'ar' ? 'ممتاز' : 'Excellent';
    if (percentage >= 80) return lang === 'ar' ? 'جيد جداً' : 'Very Good';
    if (percentage >= 70) return lang === 'ar' ? 'جيد' : 'Good';
    if (percentage >= 60) return lang === 'ar' ? 'مقبول' : 'Acceptable';
    return lang === 'ar' ? 'ضعيف' : 'Poor';
  };

  const studentOptions = React.useMemo(() => {
    const raw = Array.isArray(students) ? students : [];
    const byName = new Map();
    for (const s of raw) {
      const id = s.id ?? s.Id ?? null;
      if (id === null || id === undefined) continue;
      const nameParts = [s.firstName || s.FirstName || '', s.lastName || s.LastName || '']
        .join(' ')
        .trim();
      const name = s.fullName || s.studentNameL1 || s.StudentNameL1 || s.studentNameL2 || s.StudentNameL2 || nameParts || (lang === 'ar' ? 'طالب' : 'Student');
      const email = s.email || s.Email || '';
      const key = String(name).trim().toLowerCase();
      if (!byName.has(key)) {
        byName.set(key, { id, name, email });
      }
    }
    return Array.from(byName.values()).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [students, lang]);

  const selectedStudent = React.useMemo(() => {
    return studentOptions.find(o => String(o.id) === String(studentId)) || null;
  }, [studentOptions, studentId]);

  const getRecStudentId = (r) => (
    r?.studentDataId ?? r?.StudentDataId ?? r?.StudentsDataId ??
    r?.studentId ?? r?.StudentId ??
    (r?.student && (r.student.id ?? r.student.Id)) ?? null
  );

  const evalsToShow = React.useMemo(() => {
    const raw = Array.isArray(evaluations) ? evaluations : [];
    if (!studentId) return raw;
    return raw.filter((rec) => String(getRecStudentId(rec)) === String(studentId));
  }, [evaluations, studentId]);

  const attendanceToShow = React.useMemo(() => {
    const raw = Array.isArray(attendance) ? attendance : [];
    if (!studentId) return raw;
    return raw.filter((rec) => String(getRecStudentId(rec)) === String(studentId));
  }, [attendance, studentId]);

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/90">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* زر العودة */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'ar' ? 'العودة' : 'Back'}
          </Button>
        </motion.div>

        {/* العنوان الرئيسي */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {lang === 'ar' ? 'التقييمات' : 'Evaluations'}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {lang === 'ar' 
              ? 'تابع تقييماتك وأداءك التعليمي عبر الزمن'
              : 'Track your evaluations and educational performance over time'
            }
          </p>
        </motion.div>

        {/* اختيار الطالب */}
        <div className="mb-10">
          <label className="block text-sm font-medium text-white mb-2">{lang === 'ar' ? 'الطالب' : 'Student'}</label>
          <Popover open={openStudent} onOpenChange={setOpenStudent}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStudent}
                className="w-full max-w-xl justify-between bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <span className="truncate text-left">
                  {selectedStudent ? (
                    <>
                      <span className="font-medium">{selectedStudent.name}</span>
                      {selectedStudent.email && (
                        <span className="block text-xs text-white/70">{selectedStudent.email}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-white/70">{lang === 'ar' ? 'اختر طالباً' : 'Select a student'}</span>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-white" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border border-white/20 text-white">
              <Command className="bg-transparent">
                <CommandInput placeholder={lang === 'ar' ? 'ابحث عن طالب...' : 'Search students...'} className="placeholder:text-white/60 text-white" />
                <CommandEmpty className="text-white/70 px-3 py-2">{lang === 'ar' ? 'لا نتائج' : 'No results found.'}</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {studentOptions.map((s) => (
                    <CommandItem
                      key={s.id}
                      value={s.name}
                      className="cursor-pointer text-white hover:bg-white/10"
                      onSelect={() => {
                        setStudentId(String(s.id));
                        setOpenStudent(false);
                      }}
                    >
                      <Check className={`mr-2 h-4 w-4 ${String(studentId) === String(s.id) ? 'opacity-100' : 'opacity-0'}`} />
                      {s.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* ملخص التقييمات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {lang === 'ar' ? 'ملخص الأداء العام' : 'Overall Performance Summary'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {evalsToShow.length > 0 ? Math.round(evalsToShow.reduce((sum, item) => sum + item.attendanceRate, 0) / evalsToShow.length) : 0}%
              </div>
              <div className="text-white/70">
                {lang === 'ar' ? 'متوسط الحضور' : 'Avg Attendance'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {evalsToShow.length > 0 ? Math.round(evalsToShow.reduce((sum, item) => sum + item.browsingRate, 0) / evalsToShow.length) : 0}%
              </div>
              <div className="text-white/70">
                {lang === 'ar' ? 'متوسط التصفح' : 'Avg Browsing'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {evalsToShow.length > 0 ? Math.round(evalsToShow.reduce((sum, item) => sum + item.contentRatio, 0) / evalsToShow.length) : 0}%
              </div>
              <div className="text-white/70">
                {lang === 'ar' ? 'متوسط المحتوى' : 'Avg Content'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Star className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {evalsToShow.length > 0 ? Math.round(evalsToShow.reduce((sum, item) => sum + (item.attendanceRate + item.browsingRate + item.contentRatio) / 3, 0) / evalsToShow.length) : 0}%
              </div>
              <div className="text-white/70">
                {lang === 'ar' ? 'المعدل العام' : 'Overall Avg'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* تفاصيل التقييمات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {lang === 'ar' ? 'تفاصيل التقييمات' : 'Evaluation Details'}
          </h2>
          
          {evalsToShow.length > 0 ? (
            <div className="space-y-6">
              {evalsToShow.map((evaluationItem, index) => (
                <motion.div
                  key={evaluationItem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-6"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                    <div className="flex items-center gap-3 mb-4 lg:mb-0">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {lang === 'ar' ? 'تقييم' : 'Evaluation'} #{index + 1}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {evaluationItem.date ? new Date(evaluationItem.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getGradeColor((evaluationItem.attendanceRate + evaluationItem.browsingRate + evaluationItem.contentRatio) / 3)}`}>
                        {Math.round((evaluationItem.attendanceRate + evaluationItem.browsingRate + evaluationItem.contentRatio) / 3)}%
                      </div>
                      <div className="text-white/70 text-sm">
                        {getGradeLabel((evaluationItem.attendanceRate + evaluationItem.browsingRate + evaluationItem.contentRatio) / 3)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-white/80 text-sm">
                          {lang === 'ar' ? 'الحضور' : 'Attendance'}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {evaluationItem.attendanceRate}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-white/80 text-sm">
                          {lang === 'ar' ? 'التصفح' : 'Browsing'}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {evaluationItem.browsingRate}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-white/80 text-sm">
                          {lang === 'ar' ? 'المحتوى' : 'Content'}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {evaluationItem.contentRatio}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <Star className="w-12 h-12 text-white/60" />
              </div>
              <p className="text-white/70 text-lg">
                {studentId
                  ? (lang === 'ar' ? 'لا توجد تقييمات لهذا الطالب' : 'No evaluations for this student')
                  : (lang === 'ar' ? 'لا توجد تقييمات متاحة حالياً' : 'No evaluations available at the moment')}
              </p>
            </div>
          )}
        </motion.div>

        {/* سجل الحضور */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {lang === 'ar' ? 'سجل الحضور' : 'Attendance Record'}
          </h2>
          
          {attendanceToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attendanceToShow.slice(0, 12).map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    record.attendAccept 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 text-white">
                    <div className="flex items-center gap-2">
                      {record.attendAccept ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm text-white/90">
                        {record.attendAccept ? (lang === 'ar' ? 'حضور' : 'Present') : (lang === 'ar' ? 'غياب' : 'Absent')}
                      </span>
                    </div>
                    <span className="text-sm text-white/90">
                      {new Date(record.dateAttend).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  
                  <div className="text-white font-medium">
                    {record.dateAttend ? new Date(record.dateAttend).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-white/60" />
              </div>
              <p className="text-white/70 text-lg">
                {studentId
                  ? (lang === 'ar' ? 'لا توجد سجلات حضور لهذا الطالب' : 'No attendance records for this student')
                  : (lang === 'ar' ? 'لا توجد سجلات حضور متاحة' : 'No attendance records available')}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default EvaluationsPage; 