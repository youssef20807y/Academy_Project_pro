import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useI18n } from '../lib/i18n';
import api from '../services/api';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { ChevronsUpDown, Check } from 'lucide-react';

const StudentEvaluationsPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';

  const [loading, setLoading] = React.useState(true);
  const [students, setStudents] = React.useState([]);
  const [evaluations, setEvaluations] = React.useState([]);

  const [studentId, setStudentId] = React.useState('');
  const [date, setDate] = React.useState('');
  const [attendanceRate, setAttendanceRate] = React.useState('80');
  const [browsingRate, setBrowsingRate] = React.useState('80');
  const [contentRatio, setContentRatio] = React.useState('80');
  const [openStudent, setOpenStudent] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [st, ev] = await Promise.all([
          api.getStudents().catch(() => []),
          api.getEvaluations().catch(() => [])
        ]);
        setStudents(Array.isArray(st) ? st : []);
        setEvaluations(Array.isArray(ev) ? ev : []);
      } catch (_) {
        setStudents([]);
        setEvaluations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

  const getEvaluationStudentId = React.useCallback((r) => {
    if (!r || typeof r !== 'object') return null;
    return (
      r.studentDataId ?? r.StudentDataId ?? r.StudentsDataId ??
      r.studentId ?? r.StudentId ??
      (r.student && (r.student.id ?? r.student.Id)) ?? null
    );
  }, []);

  const recordsToShow = React.useMemo(() => {
    const raw = Array.isArray(evaluations) ? evaluations : [];
    if (!studentId) return raw;
    return raw.filter((rec) => String(getEvaluationStudentId(rec)) === String(studentId));
  }, [evaluations, studentId, getEvaluationStudentId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    try {
      const selected = students.find(s => [s.id, s.Id, s.guid, s.Guid, s.studentsDataId, s.StudentsDataId, s.studentBarCode, s.StudentBarCode, s.studentCode, s.StudentCode]
        .some(v => v !== undefined && v !== null && String(v) === String(studentId))
      );
      const preferredNumericId = selected?.id ?? selected?.Id ?? selected?.studentsDataId ?? selected?.StudentsDataId;
      const resolvedStudentId = (typeof preferredNumericId === 'number' && Number.isFinite(preferredNumericId))
        ? preferredNumericId
        : (String(preferredNumericId || '').match(/^\d+$/) ? Number(preferredNumericId) : (selected?.guid ?? selected?.Guid ?? studentId));

      await api.createEvaluation({
        studentDataId: resolvedStudentId,
        date: date || new Date().toISOString(),
        attendanceRate: Number(attendanceRate),
        browsingRate: Number(browsingRate),
        contentRatio: Number(contentRatio)
      });
      toast.success(lang === 'ar' ? 'تم إنشاء تقييم' : 'Evaluation created');
      const ev = await api.getEvaluations().catch(() => []);
      setEvaluations(Array.isArray(ev) ? ev : []);
      setStudentId('');
      setDate('');
      setAttendanceRate('80');
      setBrowsingRate('80');
      setContentRatio('80');
    } catch (err) {
      let msg = lang === 'ar' ? 'تعذر الإنشاء' : 'Creation failed';
      try { msg = JSON.parse(err?.body || '{}')?.detail || msg; } catch (_) {}
      toast.error(msg);
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {lang === 'ar' ? 'التقييمات' : 'Evaluations'}
          </h1>
          <Button asChild variant="outline" className="rounded-full bg-transparent border-white/30 text-white hover:bg-white/10">
            <a href="/students">{lang === 'ar' ? 'الطلاب' : 'Students'}</a>
          </Button>
        </div>

        <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6 grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الطالب' : 'Student'}</label>
              <Popover open={openStudent} onOpenChange={setOpenStudent}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStudent}
                    className="w-full justify-between"
                  >
                    <span className="truncate text-left">
                      {selectedStudent ? (
                        <>
                          <span className="font-medium">{selectedStudent.name}</span>
                          {selectedStudent.email && (
                            <span className="block text-xs text-muted-foreground">{selectedStudent.email}</span>
                          )}
                        </>
                      ) : (
                        lang === 'ar' ? 'اختر طالباً' : 'Select student'
                      )}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align={isRtl ? 'end' : 'start'}>
                  <Command>
                    <CommandInput placeholder={lang === 'ar' ? 'ابحث عن طالب...' : 'Search student...'} />
                    <CommandList>
                      <CommandEmpty>{lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}</CommandEmpty>
                      <CommandGroup>
                        {studentOptions.map((o) => (
                          <CommandItem
                            key={o.id}
                            value={`${o.name} ${o.email}`.trim()}
                            onSelect={() => {
                              setStudentId(String(o.id));
                              setOpenStudent(false);
                            }}
                            className="flex items-start gap-2"
                          >
                            <Check
                              className={`h-4 w-4 mt-0.5 ${String(studentId) === String(o.id) ? 'opacity-100' : 'opacity-0'}`}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{o.name}</span>
                              {o.email && (
                                <span className="text-xs text-muted-foreground">{o.email}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'التاريخ' : 'Date'}</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الحضور %' : 'Attendance %'}</label>
              <Input type="number" min="0" max="100" value={attendanceRate} onChange={(e) => setAttendanceRate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'التصفح %' : 'Browsing %'}</label>
              <Input type="number" min="0" max="100" value={browsingRate} onChange={(e) => setBrowsingRate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'المحتوى %' : 'Content %'}</label>
              <Input type="number" min="0" max="100" value={contentRatio} onChange={(e) => setContentRatio(e.target.value)} />
            </div>
          </div>
          <div>
            <Button type="submit" className="rounded-full academy-button">{lang === 'ar' ? 'إنشاء' : 'Create'}</Button>
          </div>
        </form>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
          {loading ? (
            <div className="text-center text-white/90 py-16">
              {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : recordsToShow.length === 0 ? (
            <div className="text-center text-white/80 py-16">
              {studentId
                ? (lang === 'ar' ? 'لا توجد تقييمات لهذا الطالب' : 'No evaluations for this student')
                : (lang === 'ar' ? 'لا توجد تقييمات' : 'No evaluations')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordsToShow.map((e) => (
                <div key={e.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="text-white font-semibold">{lang === 'ar' ? 'التقييم' : 'Evaluation'}</div>
                    <div className="text-white/70 text-sm">{e.date ? new Date(e.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : ''}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-white">
                    <div>
                      <div className="text-xs text-white/70">{lang === 'ar' ? 'الحضور' : 'Attendance'}</div>
                      <div className="font-bold">{e.attendanceRate ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/70">{lang === 'ar' ? 'التصفح' : 'Browsing'}</div>
                      <div className="font-bold">{e.browsingRate ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/70">{lang === 'ar' ? 'المحتوى' : 'Content'}</div>
                      <div className="font-bold">{e.contentRatio ?? '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </section>
  );
};

export default StudentEvaluationsPage; 