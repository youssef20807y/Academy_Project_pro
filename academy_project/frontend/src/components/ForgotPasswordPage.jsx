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
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
});

const ForgotPasswordPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
    mode: 'onTouched',
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      console.log('Sending forgot password request for email:', values.email);
      await api.forgotPassword(values.email);
      setEmailSent(true);
      toast.success(
        lang === 'ar' 
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' 
          : 'Password reset link has been sent to your email'
      );
    } catch (err) {
      console.error('Forgot password error:', err);
      let friendly = lang === 'ar' 
        ? 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور' 
        : 'An error occurred while sending the password reset link';
      
      try {
        const data = err?.body ? JSON.parse(err.body) : null;
        console.log('Error response data:', data);
        const detail = data?.detail || data?.title || err?.message;
        if (detail) {
          // ترجمة رسائل الخطأ الشائعة
          if (detail.includes('Failed to send password reset email')) {
            friendly = lang === 'ar' 
              ? 'فشل في إرسال رابط إعادة تعيين كلمة المرور. قد تكون المشكلة في: 1) البريد الإلكتروني غير مسجل 2) مشكلة في الخادم. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.'
              : 'Failed to send password reset link. The issue might be: 1) Email not registered 2) Server issue. Please try again later or contact support.';
          } else if (detail.includes('User not found') || detail.includes('not found')) {
            friendly = lang === 'ar' 
              ? 'البريد الإلكتروني غير مسجل في النظام. تأكد من إدخال البريد الإلكتروني الصحيح.'
              : 'Email address is not registered in the system. Please verify you entered the correct email.';
          } else if (detail.includes('Invalid email')) {
            friendly = lang === 'ar' 
              ? 'البريد الإلكتروني غير صحيح. تأكد من تنسيق البريد الإلكتروني.'
              : 'Invalid email format. Please check the email format.';
          } else {
            friendly = detail;
          }
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
      }
      
      toast.error(friendly);
      
      // إضافة زر "إرسال رابط آخر" في حالة الخطأ
      setTimeout(() => {
        toast.error(
          lang === 'ar' 
            ? 'يمكنك المحاولة مرة أخرى أو التواصل مع الدعم الفني'
            : 'You can try again or contact support',
          {
            action: {
              label: lang === 'ar' ? 'إعادة المحاولة' : 'Try Again',
              onClick: () => {
                form.reset();
                setEmailSent(false);
              }
            }
          }
        );
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-6 sm:p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {lang === 'ar' ? 'تم إرسال الرابط' : 'Link Sent'}
              </h1>
              
              <p className="text-muted-foreground mb-6">
                {lang === 'ar' 
                  ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك (و مجلد الرسائل غير المرغوب فيها).'
                  : 'Password reset link has been sent to your email. Please check your inbox (and spam folder).'
                }
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/login'} 
                  className="w-full rounded-full"
                >
                  {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setEmailSent(false)} 
                  className="w-full rounded-full bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  {lang === 'ar' ? 'إرسال رابط آخر' : 'Send Another Link'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        <Toaster position="top-center" richColors />
      </section>
    );
  }

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
              {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </h1>
            <p className="text-white/90 text-base sm:text-lg mb-6">
              {lang === 'ar' 
                ? 'لا تقلق! أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
                : 'Don\'t worry! Enter your registered email and we\'ll send you a link to reset your password.'
              }
            </p>
            <div className="flex items-center gap-2 text-white/80">
              <Mail className="w-5 h-5" />
              <span className="text-sm">
                {lang === 'ar' 
                  ? 'سيتم إرسال الرابط إلى بريدك الإلكتروني المسجل'
                  : 'The link will be sent to your registered email'
                }
              </span>
            </div>
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
                    <FormLabel>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="user@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={isSubmitting} className="mt-2 rounded-full">
                  {isSubmitting 
                    ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                    : (lang === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link')
                  }
                </Button>

                <div className="text-center space-y-3">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => window.location.href = '/login'}
                    className="text-muted-foreground hover:text-primary flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    {lang === 'ar' 
                      ? 'إذا كنت تواجه مشكلة، يمكنك التواصل مع الدعم الفني'
                      : 'If you are having trouble, you can contact support'
                    }
                  </div>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </section>
  );
};

export default ForgotPasswordPage; 