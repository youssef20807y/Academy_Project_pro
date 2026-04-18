import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import api from '@/services/api';
import { useI18n } from '../lib/i18n';

const schema = z.object({
  academyDataId: z.string().uuid('اختر الأكاديمية'),
  branchesDataId: z.string().uuid('اختر الفرع'),
  complaintsTypeId: z.string().uuid('اختر نوع الشكوى'),
  description: z.string().min(10, 'أدخل وصفاً مفصلاً للشكوى'),
  studentsDataId: z.string().optional(),
});

const ContactPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      academyDataId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      branchesDataId: '',
      complaintsTypeId: '',
      description: '',
      studentsDataId: '',
    },
    mode: 'onTouched',
  });

  const [loading, setLoading] = React.useState(false);
  const [types, setTypes] = React.useState([]);
  const [branches, setBranches] = React.useState([]);
  const [file, setFile] = React.useState(null);
  const [statusCounts, setStatusCounts] = React.useState([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [typesRes, branchesRes] = await Promise.all([
                  api.getComplaintTypes({ silent: true }).catch(() => []),
        api.getBranches({ silent: true }).catch(() => []),
        ]);
        setTypes(Array.isArray(typesRes) ? typesRes : []);
        setBranches(Array.isArray(branchesRes) ? branchesRes : []);
      } catch (_) {}
    };
    load();
  }, []);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const statuses = await api.getComplaintStatus({ silent: true }).catch(() => []);
        if (Array.isArray(statuses)) {
          const pairs = await Promise.all(
            statuses.slice(0, 5).map(async (s) => {
              try {
                const c = await api.getComplaintsCountByStatus(s.id, { silent: true }).catch(() => 0);
                return { name: s.statusNameL1 || s.statusNameL2 || s.name || (lang === 'ar' ? 'غير معروف' : 'Unknown'), count: Number(c) || 0 };
              } catch (_) {
                return { name: s.statusNameL1 || s.statusNameL2 || s.name || (lang === 'ar' ? 'غير معروف' : 'Unknown'), count: 0 };
              }
            })
          );
          setStatusCounts(pairs);
        }
      } catch (_) {}
    };
    fetchCounts();
  }, [lang]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const fd = new FormData();
      if (values.id) fd.append('Id', values.id);
      fd.append('AcademyDataId', values.academyDataId);
      fd.append('BranchesDataId', values.branchesDataId);
      fd.append('ComplaintsTypeId', values.complaintsTypeId);
      if (values.studentsDataId) fd.append('StudentsDataId', values.studentsDataId);
      fd.append('Date', new Date().toISOString().slice(0, 10));
      fd.append('Description', values.description);
      if (file) fd.append('FilesAttach', file);

      await api.createComplaint(fd);
      toast.success(lang === 'ar' ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!');
      form.reset({
        academyDataId: values.academyDataId,
        branchesDataId: '',
        complaintsTypeId: '',
        description: '',
        studentsDataId: values.studentsDataId || '',
      });
      setFile(null);
    } catch (err) {
      let msg = lang === 'ar' ? 'تعذر إرسال الشكوى، حاول لاحقاً' : 'Failed to send the complaint, please try later';
      try {
        const data = err?.body ? JSON.parse(err.body) : null;
        msg = data?.detail || data?.title || msg;
      } catch (_) {}
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t('contact.title')}</h1>
          <p className="text-white/90 mb-8">{t('contact.subtitle')}</p>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-6 sm:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField name="branchesDataId" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.branchLabel')}</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('contact.form.branchPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {branches.map(b => (
                                  <SelectItem key={b.id} value={b.id}>{b.branchNameL1 || b.branchNameL2}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField name="complaintsTypeId" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.typeLabel')}</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('contact.form.typePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {types.map(ti => (
                                  <SelectItem key={ti.id} value={ti.id}>{ti.typeNameL1 || ti.typeNameL2}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.form.descriptionLabel')}</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder={t('contact.form.descriptionPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">{t('contact.form.fileLabel')}</label>
                      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      <p className="text-xs text-muted-foreground mt-1">{t('contact.form.fileNote')}</p>
                    </div>
                    <FormField name="studentsDataId" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.form.studentIdLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('contact.form.studentIdPlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>{t('contact.form.studentIdDesc')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Button type="submit" disabled={loading} className="mt-2 rounded-full">
                    {loading ? t('contact.form.submitting') : t('contact.form.submit')}
                  </Button>
                </form>
              </Form>
            </div>

            <div>
              <div className="academy-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">{t('contact.status.title')}</h3>
                <div className="space-y-2">
                  {statusCounts.length ? statusCounts.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s.name}</span>
                      <span className="text-foreground font-semibold">{s.count}</span>
                    </div>
                  )) : (
                    <div className="text-muted-foreground text-sm">{t('contact.status.empty')}</div>
                  )}
                </div>
              </div>

              <div className="academy-card rounded-2xl p-6 mt-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('contact.info.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('contact.info.supportEmailLabel')}: support@academy.com</p>
                <p className="text-sm text-muted-foreground">{t('contact.info.whatsappLabel')}: +000 000 0000</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <Toaster position="top-center" richColors offset="140px" />
    </section>
  );
};

export default ContactPage; 