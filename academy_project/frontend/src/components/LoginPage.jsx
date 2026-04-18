import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import api from '@/services/api';
import { useI18n } from '../lib/i18n';

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور مطلوبة'),
});

const LoginPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await api.login(values.email, values.password);
      toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully');
      
      // Save user data to localStorage for admin panel access
      let userData = response.user;
      
      // If no user data in response, try to get it from API
      if (!userData) {
        try {
          const currentUser = await api.getCurrentUser();
          if (currentUser) {
            userData = {
              id: currentUser.id || currentUser.Id,
              email: currentUser.email || currentUser.Email,
              firstName: currentUser.firstName || currentUser.FirstName,
              lastName: currentUser.lastName || currentUser.LastName,
              role: currentUser.role || currentUser.Role,
              active: currentUser.active ?? currentUser.Active ?? true
            };
          }
        } catch (_) {
          // If API call fails, create basic user data
          userData = {
            id: response.id || response.Id || Date.now(),
            email: values.email,
            role: 'User' // Default role
          };
        }
      }
      
      if (userData) {
        // Check if user has admin email and update role accordingly
        if (userData.email === 'yjmt469999@gmail.com' || userData.Email === 'yjmt469999@gmail.com' || 
            userData.email === 'yjmt4699999@gmail.com' || userData.Email === 'yjmt4699999@gmail.com') {
          userData.role = 'Admin';
          userData.Role = 'Admin';
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Trigger auth change event for header to update
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      setTimeout(() => {
        // التوجيه حسب نوع المستخدم
        if (userData && (userData.role === 'Student' || userData.Role === 'Student')) {
          window.location.href = '/profile'; // الطالب يذهب إلى ProfilePage
        } else {
          window.location.href = '/account'; // باقي المستخدمين يذهبون إلى AccountPage
        }
      }, 800);
    } catch (err) {
      console.error('Login error details:', err);
      
      let msg = lang === 'ar' ? 'فشل تسجيل الدخول. تحقق من البيانات وحاول مجدداً' : 'Login failed. Check your data and try again';
      
      try {
        // Try to parse error body for better error messages
        if (err?.body) {
          const errorData = JSON.parse(err.body);
          console.log('Parsed error data:', errorData);
          
          // Handle different error types from backend
          if (errorData.detail) {
            msg = errorData.detail;
          } else if (errorData.title) {
            // Map backend error titles to user-friendly messages
            switch (errorData.title) {
              case 'Auth.Failed':
                msg = lang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials';
                break;
              case 'Auth.AccountLocked':
                msg = lang === 'ar' ? 'الحساب مؤقتاً مقفل' : 'Account is temporarily locked';
                break;
              case 'Auth.AccountDisabled':
                msg = lang === 'ar' ? 'الحساب معطل' : 'Account is disabled';
                break;
              case 'Login.Exception':
                msg = lang === 'ar' ? 'خطأ في الخادم، حاول مرة أخرى لاحقاً' : 'Server error, please try again later';
                break;
              default:
                msg = errorData.detail || errorData.title || msg;
            }
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse error response:', parseError);
        // Fall back to generic message
      }
      
      // Show error message
      toast.error(msg);
      
      // Log additional error information for debugging
      if (err?.status) {
        console.error(`HTTP Status: ${err.status}`);
      }
      if (err?.url) {
        console.error(`Request URL: ${err.url}`);
      }
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
              {t('authPages.login.title')}
            </h1>
            <p className="text-white/90 text-base sm:text-lg mb-6">
              {t('authPages.login.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-6 sm:p-8"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <FormField name="email" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('authPages.login.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="password" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('authPages.login.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={isSubmitting} className="mt-2 rounded-full">
                  {isSubmitting ? t('authPages.login.submitting') : t('authPages.login.submit')}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
      <Toaster position="top-center" richColors offset="140px" />
    </section>
  );
};

export default LoginPage; 