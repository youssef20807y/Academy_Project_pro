import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import api from '@/services/api';
import { useI18n } from '../lib/i18n';

// Fallback IDs for public registration when we cannot fetch due to no auth
const DEFAULT_ACADEMY_ID = 'ecb737b0-65a5-42c7-beb8-08dddc02cda4';
const DEFAULT_BRANCH_ID = '374aabc9-26d1-442d-f4d4-08ddda576b20';

const passwordPolicyMessage = 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وتضم حرفاً كبيراً وصغيراً ورقماً ورمزاً.';

const schema = z.object({
  firstName: z.string().min(2, 'الاسم الأول قصير جداً'),
  lastName: z.string().min(2, 'اسم العائلة قصير جداً'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  phoneNumber: z.string()
    .min(11, 'رقم الهاتف يجب أن يكون 11 رقم')
    .max(11, 'رقم الهاتف يجب أن يكون 11 رقم')
    .regex(/^01[0-9]{9}$/, 'رقم الهاتف يجب أن يبدأ بـ 01 ويحتوي على 11 رقم'),
  password: z.string()
    .min(8, passwordPolicyMessage)
    .regex(/(?=.*[a-z])/, passwordPolicyMessage)
    .regex(/(?=.*[A-Z])/, passwordPolicyMessage)
    .regex(/(?=.*\d)/, passwordPolicyMessage)
    .regex(/(?=.*[^A-Za-z0-9])/, passwordPolicyMessage),
  confirmPassword: z.string().min(8, 'تأكيد كلمة المرور مطلوب'),
}).refine((v) => v.password === v.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword']
});

const RegisterPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // دالة التسجيل
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // إضافة role كطالب بشكل افتراضي
      const registrationData = {
        ...data,
        role: 'Student'
      };
      // تسجيل المستخدم
      const user = await api.register(registrationData);
      console.log('User registered successfully:', user);
      
      // After account creation, also create StudentData so the student appears in /students
      try {
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        
        // Try to derive academy/branch from current user (token claims)
        let academyId = null;
        let branchId = null;
        try {
          const me = await api.getCurrentUser();
          academyId = me?.academyDataId || me?.AcademyDataId || null;
          branchId = me?.branchesDataId || me?.BranchesDataId || null;
        } catch (_) {}
        
        // Fallback: fetch lists and pick the first item
        if (!academyId || !branchId) {
          try {
            const [academies, branches] = await Promise.all([
              api.getAcademies({ silent: true }).catch(() => []),
              api.getBranches({ silent: true }).catch(() => [])
            ]);
            if (!academyId && Array.isArray(academies) && academies.length > 0) {
              academyId = academies[0].id || academies[0].Id;
            }
            if (!branchId && Array.isArray(branches) && branches.length > 0) {
              branchId = branches[0].id || branches[0].Id;
            }
          } catch (_) {}
        }
        // Final fallback to known valid IDs
        if (!academyId) academyId = DEFAULT_ACADEMY_ID;
        if (!branchId) branchId = DEFAULT_BRANCH_ID;
        
        const studentPayload = {
          AcademyDataId: academyId || undefined,
          BranchesDataId: branchId || undefined,
          StudentNameL1: fullName,
          StudentNameL2: fullName,
          StudentAddress: 'N/A',
          StudentPhone: data.phoneNumber,
          StudentMobil: data.phoneNumber,
          StudentWhatsapp: data.phoneNumber,
          StudentEmail: data.email,
        };
        await api.createStudent(studentPayload);
        try { window.dispatchEvent(new Event('students-changed')); } catch (_) {}
      } catch (_) {}
      
      // حفظ بيانات المستخدم في localStorage مع جميع البيانات المطلوبة
      const userData = {
        id: user.id || user.Id || user.userId || user.UserId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: 'Student',
        active: true,
        // إضافة الحقول البديلة للتأكد من التوافق
        FirstName: data.firstName,
        LastName: data.lastName,
        PhoneNumber: data.phoneNumber,
        Email: data.email,
        Role: 'Student'
      };
      
      localStorage.setItem('userData', JSON.stringify(userData));
      console.log('User data saved to localStorage:', userData);
      
      setSuccess(true);
      toast.success(lang === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
      try { await api.sendEmailConfirmation(data.email); } catch (_) {}
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      let friendly = lang === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'An error occurred during registration';
      try {
        const data = err?.body ? JSON.parse(err.body) : null;
        const detail = data?.detail || data?.title || err?.message;
        if (detail) friendly = detail;
        mapServerPasswordErrors(detail);
      } catch (_) {}
      toast.error(friendly);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
              {t('authPages.register.title')}
            </h1>
            <p className="text-white/90 text-base sm:text-lg mb-6">
              {t('authPages.register.subtitle')}
            </p>
            <ul className="space-y-2 text-white/85 text-sm sm:text-base">
              <li>{t('authPages.register.bullets.0')}</li>
              <li>{t('authPages.register.bullets.1')}</li>
              <li>{t('authPages.register.bullets.2')}</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-6 sm:p-8"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField name="firstName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('authPages.register.firstName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={lang === 'ar' ? 'أدخل الاسم الأول' : 'Enter first name'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="lastName" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('authPages.register.lastName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={lang === 'ar' ? 'أدخل اسم العائلة' : 'Enter last name'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('authPages.register.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="phoneNumber" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder={lang === 'ar' ? '01xxxxxxxxx' : '01xxxxxxxxx'} 
                          pattern="[0-9]{11}"
                          maxLength={11}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {lang === 'ar' ? 'أدخل رقم هاتف مصري صحيح (11 رقم)' : 'Enter a valid Egyptian phone number (11 digits)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField name="password" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('authPages.register.password')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="confirmPassword" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('authPages.register.confirmPassword')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* تم إزالة حقل الدور - سيتم تعيينه كطالب تلقائياً */}

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="mt-2 rounded-full"
                >
                  {isSubmitting ? t('authPages.register.submitting') : t('authPages.register.submit')}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </section>
  );
};

export default RegisterPage; 