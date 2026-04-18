import React, { useState, useEffect } from 'react';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';
import { User, LogIn } from 'lucide-react';

const ProtectedRoute = ({ children, redirectTo = '/login', showLoginPrompt = true }) => {
  const { lang } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
        const userData = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
        const authenticated = Boolean(token && userData);
        setIsAuthenticated(authenticated);
        setIsChecking(false);
        
        if (!authenticated && redirectTo) {
          console.log('User not authenticated, redirecting to:', redirectTo);
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 2000);
        }
      } catch (_) {
        setIsAuthenticated(false);
        setIsChecking(false);
        if (redirectTo) {
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 2000);
        }
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      setTimeout(checkAuth, 50);
    };
    
    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [redirectTo]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {lang === 'ar' ? 'جاري التحقق من المصادقة...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If not authenticated and we should show login prompt
  if (showLoginPrompt) {
    return (
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 min-h-screen">
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 max-w-md mx-4">
            <User className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              {lang === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required'}
            </h2>
            <p className="text-white/80 mb-6">
              {lang === 'ar' 
                ? 'يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة'
                : 'You need to login to access this page'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild 
                className="academy-button rounded-full"
                onClick={() => window.location.href = '/login'}
              >
                <a href="/login">
                  {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </a>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                className="rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <a href="/register">
                  {lang === 'ar' ? 'إنشاء حساب' : 'Register'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If not authenticated and no login prompt, return null
  return null;
};

export default ProtectedRoute; 