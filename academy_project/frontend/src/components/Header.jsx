import React, { useState, useEffect } from 'react';
import { Search, Menu, X, User, LogIn, Home, BookOpen, Briefcase, Users, Settings, Info, ChevronDown, ArrowRight, Briefcase as BriefcaseIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import academyLogo from '../assets/academy_logo.png';
import { useI18n } from '../lib/i18n';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
  const [userRole, setUserRole] = React.useState(null);
  const [userEmail, setUserEmail] = React.useState('');
  const [studentAcademy, setStudentAcademy] = React.useState(null);
  const [studentBranch, setStudentBranch] = React.useState(null);
  const [academies, setAcademies] = React.useState([]);
  const [branches, setBranches] = React.useState([]);
  const { lang, t } = useI18n();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
        const userData = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
        
        console.log('Checking auth - Token:', !!token, 'UserData:', !!userData); // Debug log
        console.log('📦 Raw userData:', userData); // Debug log
        
        // User is authenticated if both token and userData exist
        const authenticated = Boolean(token && userData);
        setIsAuthenticated(authenticated);
        
        if (authenticated && userData) {
          try {
            const user = JSON.parse(userData);
            console.log('User authenticated:', user); // Debug log
            const role = user.role;
            setUserRole(role);
            console.log('🔑 Set userRole:', role);
            const email = user.email || user.Email || '';
            setUserEmail(email);
            console.log('🔑 Set userEmail:', email);
          } catch (_) {
            console.log('Failed to parse user data'); // Debug log
            setUserRole(null);
            setUserEmail('');
          }
        } else {
          console.log('User not authenticated. Token:', !!token, 'UserData:', !!userData); // Debug log
          setUserRole(null);
          setUserEmail('');
        }
      } catch (_) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };
    
    // Check immediately
    checkAuth();
    
    // Also check after a short delay to ensure localStorage is updated
    const timeoutId = setTimeout(checkAuth, 100);
    
    const onAuthChanged = () => {
      console.log('Auth changed event triggered'); // Debug log
      // Add a small delay to ensure localStorage is updated
      setTimeout(checkAuth, 50);
    };
    
    const onStudentDataChanged = () => {
      console.log('Student data changed event triggered');
      console.log('🔍 Current state:', { userEmail, userRole, isAuthenticated });
      
      // If userEmail is not yet set, wait for it
      if (!userEmail) {
        console.log('⏳ userEmail not yet set, waiting...');
        return;
      }
      
      try {
        // Try to load from userSocialMedia first
        const storedSocialData = localStorage.getItem('userSocialMedia');
        console.log('📦 userSocialMedia from event:', storedSocialData);
        if (storedSocialData) {
          const parsedData = JSON.parse(storedSocialData);
          console.log('📦 Parsed userSocialMedia from event:', parsedData);
          if (parsedData.userEmail === userEmail) {
            setStudentAcademy(parsedData.academyDataId || null);
            setStudentBranch(parsedData.branchesDataId || null);
            console.log('✅ Updated student navigation from userSocialMedia:', { academy: parsedData.academyDataId, branch: parsedData.branchesDataId });
          } else {
            console.log('❌ userEmail mismatch in event userSocialMedia:', { stored: parsedData.userEmail, current: userEmail });
          }
        }
        
        // Also try to load from studentData
        const studentDataFromStorage = localStorage.getItem('studentData');
        console.log('📦 studentData from event:', studentDataFromStorage);
        if (studentDataFromStorage) {
          try {
            const parsedStudentData = JSON.parse(studentDataFromStorage);
            console.log('📦 Parsed studentData from event:', parsedStudentData);
            if (parsedStudentData.userEmail === userEmail) {
              // Check if student has academy and branch data
              if (parsedStudentData.academyDataId || parsedStudentData.AcademyDataId) {
                const academyId = parsedStudentData.academyDataId || parsedStudentData.AcademyDataId;
                setStudentAcademy(academyId);
                console.log('📚 Updated academy from studentData event:', academyId);
              }
              if (parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId) {
                const branchId = parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId;
                setStudentBranch(branchId);
                console.log('🏢 Updated branch from studentData event:', branchId);
              }
            } else {
              console.log('❌ userEmail mismatch in event studentData:', { stored: parsedStudentData.userEmail, current: userEmail });
            }
          } catch (e) {
            console.log('Failed to parse studentData from event:', e);
          }
        }
      } catch (error) {
        console.log('Failed to parse student data from event:', error);
      }
    };
    
    const onStorage = (e) => { 
      if (e.key === 'authToken' || e.key === 'userData') {
        console.log('Storage changed:', e.key); // Debug log
        setTimeout(checkAuth, 50);
      }
      
      // Check for student data changes
      if (e.key === 'userSocialMedia') {
        console.log('Student data changed:', e.key);
        console.log('🔍 Current state in storage:', { userEmail, userRole, isAuthenticated });
        
        // If userEmail is not yet set, wait for it
        if (!userEmail) {
          console.log('⏳ userEmail not yet set in storage, waiting...');
          return;
        }
        
        try {
          const storedSocialData = localStorage.getItem('userSocialMedia');
          console.log('📦 userSocialMedia from storage event:', storedSocialData);
          if (storedSocialData) {
            const parsedData = JSON.parse(storedSocialData);
            console.log('📦 Parsed userSocialMedia from storage event:', parsedData);
            if (parsedData.userEmail === userEmail) {
              setStudentAcademy(parsedData.academyDataId || null);
              setStudentBranch(parsedData.branchesDataId || null);
              console.log('✅ Updated student navigation from userSocialMedia storage:', { academy: parsedData.academyDataId, branch: parsedData.branchesDataId });
            } else {
              console.log('❌ userEmail mismatch in storage userSocialMedia:', { stored: parsedData.userEmail, current: userEmail });
            }
          }
        } catch (error) {
          console.log('Failed to parse student data from storage:', error);
        }
      }
      
      // Check for studentData changes
      if (e.key === 'studentData') {
        console.log('StudentData changed:', e.key);
        console.log('🔍 Current state in storage:', { userEmail, userRole, isAuthenticated });
        
        // If userEmail is not yet set, wait for it
        if (!userEmail) {
          console.log('⏳ userEmail not yet set in storage, waiting...');
          return;
        }
        
        try {
          const studentDataFromStorage = localStorage.getItem('studentData');
          console.log('📦 studentData from storage event:', studentDataFromStorage);
          if (studentDataFromStorage) {
            const parsedStudentData = JSON.parse(studentDataFromStorage);
            console.log('📦 Parsed studentData from storage event:', parsedStudentData);
            if (parsedStudentData.userEmail === userEmail) {
              // Check if student has academy and branch data
              if (parsedStudentData.academyDataId || parsedStudentData.AcademyDataId) {
                const academyId = parsedStudentData.academyDataId || parsedStudentData.AcademyDataId;
                setStudentAcademy(academyId);
                console.log('📚 Updated academy from studentData storage:', academyId);
              }
              if (parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId) {
                const branchId = parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId;
                setStudentBranch(branchId);
                console.log('🏢 Updated branch from studentData storage:', branchId);
              }
            } else {
              console.log('❌ userEmail mismatch in storage studentData:', { stored: parsedStudentData.userEmail, current: userEmail });
            }
          }
        } catch (error) {
          console.log('Failed to parse studentData from storage:', error);
        }
      }
    };
    
    window.addEventListener('auth-changed', onAuthChanged);
    window.addEventListener('storage', onStorage);
    window.addEventListener('student-data-changed', onStudentDataChanged);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('auth-changed', onAuthChanged);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('student-data-changed', onStudentDataChanged);
    };
  }, []);

  // Separate useEffect for loading student data when userEmail is available
  useEffect(() => {
    if (isAuthenticated && userEmail && (userRole === 'Student' || userRole === 'User' || !userRole)) {
      console.log('🔍 Loading student data for user:', { userEmail, userRole, isAuthenticated });
      console.log('🔍 Condition check:', { 
        isAuthenticated, 
        userRole, 
        isStudent: userRole === 'Student' || userRole === 'User' || !userRole 
      });
      
      try {
        // Try to load from localStorage first
        const storedSocialData = localStorage.getItem('userSocialMedia');
        console.log('📦 userSocialMedia from localStorage:', storedSocialData);
        if (storedSocialData) {
          const parsedData = JSON.parse(storedSocialData);
          console.log('📦 Parsed userSocialMedia:', parsedData);
          if (parsedData.userEmail === userEmail) {
            // Check if student has selected academy and branch
            if (parsedData.academyDataId) {
              setStudentAcademy(parsedData.academyDataId);
              console.log('✅ Set academy from userSocialMedia:', parsedData.academyDataId);
            }
            if (parsedData.branchesDataId) {
              setStudentBranch(parsedData.branchesDataId);
              console.log('✅ Set branch from userSocialMedia:', parsedData.branchesDataId);
            }
          } else {
            console.log('❌ userEmail mismatch:', { stored: parsedData.userEmail, current: userEmail });
          }
        }
        
        // Also try to load from studentData if available in localStorage
        const studentDataFromStorage = localStorage.getItem('studentData');
        console.log('📦 studentData from localStorage:', studentDataFromStorage);
        if (studentDataFromStorage) {
          try {
            const parsedStudentData = JSON.parse(studentDataFromStorage);
            console.log('📦 Parsed studentData:', parsedStudentData);
            if (parsedStudentData.userEmail === userEmail) {
              // Check if student has academy and branch data
              if (parsedStudentData.academyDataId || parsedStudentData.AcademyDataId) {
                const academyId = parsedStudentData.academyDataId || parsedStudentData.AcademyDataId;
                setStudentAcademy(academyId);
                console.log('📚 Set academy from studentData:', academyId);
              }
              if (parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId) {
                const branchId = parsedStudentData.branchesDataId || parsedStudentData.BranchesDataId;
                setStudentBranch(branchId);
                console.log('🏢 Set branch from studentData:', branchId);
              }
            } else {
              console.log('❌ userEmail mismatch in studentData:', { stored: parsedStudentData.userEmail, current: userEmail });
            }
          } catch (e) {
            console.log('Failed to parse studentData from localStorage:', e);
          }
        }
        
        // If no data in localStorage, try to load from API
        if (!studentAcademy || !studentBranch) {
          // This will be handled by the student-data-changed event
          console.log('Student data not found in localStorage, waiting for API data...');
        } else {
          console.log('✅ Student navigation data loaded successfully:', { academy: studentAcademy, branch: studentBranch });
        }
        
        // Load academies and branches data for display names
        if (isAuthenticated) {
          try {
            // Load academies
            const academiesData = localStorage.getItem('academiesData');
            if (academiesData) {
              setAcademies(JSON.parse(academiesData));
            }
            
            // Load branches
            const branchesData = localStorage.getItem('branchesData');
            if (branchesData) {
              setBranches(JSON.parse(branchesData));
            }
          } catch (error) {
            console.log('Failed to load academies/branches data from localStorage:', error);
          }
        }
      } catch (error) {
        console.log('Failed to load student data from localStorage:', error);
      }
    }
  }, [isAuthenticated, userEmail, userRole]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // التوجيه إلى صفحة البحث مع استعلام البحث
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Add admin navigation for SupportAgent role
  const isAdmin = (userRole === 'SupportAgent' || userRole === 'Admin' || userRole === 'admin' || (userEmail && userEmail.toLowerCase() === 'yjmt469999@gmail.com'));
  const isStudent = userRole === 'Student' || userRole === 'User' || !userRole;
  
  console.log('🔍 Navigation state:', { userRole, userEmail, isAdmin, isStudent });

  const navigationItems = [
    // إخفاء جميع العناصر ما عدا Home Page قبل تسجيل الدخول
    ...(isAuthenticated ? [
      // Home Page يظهر للجميع (المسؤول والطالب) - تم إزالته من هنا لتجنب التكرار
      
      // Courses تظهر فقط للمسؤول
      ...(isAdmin ? [{
        name: t('common.nav.coursesPrograms'), href: '/catalog', icon: BookOpen, children: [
          { name: 'Project Master', href: '/projects-master' },
          { name: 'Project Details', href: '/projects-details' },
          { name: 'Program Details', href: '/programs-details' },
          { name: 'Sessions', href: '/sessions' },
        ]
      }] : []),
      // Videos تظهر فقط للمسؤول
      ...(isAdmin ? [{
        name: lang === 'ar' ? 'الفيديوهات' : 'Videos', href: '/videos', icon: BookOpen
      }] : []),
      // Students تظهر فقط للمسؤول
      ...(isAdmin ? [{
        name: lang === 'ar' ? 'الطلاب' : 'Student',
        href: '/students',
        icon: Users,
        children: [
          { name: lang === 'ar' ? 'شاشة إدخال بيانات الطلاب' : 'Student Data Entry', href: '/students/data' },
          { name: lang === 'ar' ? 'شاشة الحضور والانصراف' : 'Attendance Screen', href: '/students/attendance' },
          { name: lang === 'ar' ? 'شاشة التقييمات' : 'Evaluations Screen', href: '/students/evaluations' },
        ],
      }] : []),
      // Services تظهر فقط للمسؤول
      ...(isAdmin ? [{
        name: t('common.nav.services'), href: '/certificates', icon: Briefcase
      }] : []),
      // Trainers تظهر فقط للمسؤول
      ...(isAdmin ? [{
        name: t('common.nav.trainers'), href: '/trainers', icon: Users
      }] : []),
      // Jobs تظهر فقط للمسؤول
      ...(isAdmin ? [{
        name: t('common.nav.jobs'), href: '/jobs', icon: BriefcaseIcon
      }] : []),
      
      // Student Navigation Items - تظهر فقط للطالب الذي اختار أكاديمية وفرع
      ...(isStudent && studentAcademy && studentBranch ? [
        {
          name: lang === 'ar' ? 'المشاريع الرئيسية' : 'Project Master',
          href: `/projects-master?academy=${studentAcademy}&branch=${studentBranch}`,
          icon: Briefcase,
          description: lang === 'ar' ? 'إدارة المشاريع الرئيسية' : 'Manage main projects'
        },
        {
          name: lang === 'ar' ? 'الجلسات' : 'Sessions',
          href: `/sessions?academy=${studentAcademy}&branch=${studentBranch}`,
          icon: BookOpen,
          description: lang === 'ar' ? 'عرض الجلسات التدريبية' : 'View training sessions'
        },
        {
          name: lang === 'ar' ? 'الفيديوهات' : 'Videos',
          href: `/videos?academy=${studentAcademy}&branch=${studentBranch}`,
          icon: BookOpen,
          description: lang === 'ar' ? 'عرض الفيديوهات التعليمية' : 'View educational videos'
        }
      ] : []),
    ] : [])
    // Home Page يظهر فقط في الأزرار الجانبية لتجنب التكرار
  ];

  // Admin link moved to Settings page; no admin link in header navigation
  const adminNavigationItems = [];

  // Debug log for admin items
  console.log('User role:', userRole);
  console.log('Admin navigation items:', adminNavigationItems);

  // Combine navigation items with admin items
  const allNavigationItems = [...navigationItems, ...adminNavigationItems];

  const isRtl = lang === 'ar';
  const iconMarginClass = isRtl ? 'ml-2' : 'mr-2';
  const desktopInputPadding = isRtl ? 'pr-4 pl-4' : 'pl-4 pr-4';
  const mobileInputPadding = isRtl ? 'pr-4 pl-4' : 'pl-4 pr-4';
  const searchIconPos = isRtl ? 'right-3' : 'left-3';
  
  // Helper function to get academy and branch names
  const getAcademyName = (academyId) => {
    if (!academyId || !academies.length) return academyId;
    const academy = academies.find(a => a.id === academyId);
    return academy ? (academy.academyNameL1 || academy.AcademyNameL1 || academy.academyNameL2 || academy.AcademyNameL2 || academy.name || academyId) : academyId;
  };
  
  const getBranchName = (branchId) => {
    if (!branchId || !branches.length) return branchId;
    const branch = branches.find(b => b.id === branchId);
    return branch ? (branch.branchNameL1 || branch.BranchNameL1 || branch.branchNameL2 || branch.BranchNameL2 || branch.name || branchId) : branchId;
  };

  return (
    <header className="sticky top-0 z-50 supports-[backdrop-filter]:bg-white/50 bg-white/80 backdrop-blur-md border-b border-border/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <div className="flex items-center">
            <img 
              src={academyLogo} 
              alt="أكاديمية الإبداع" 
              className="h-10 w-auto select-none"
            />
          </div>

          {/* شريط البحث - مخفي على الشاشات الصغيرة */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <Input
                  type="text"
                  placeholder={t('common.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className={`${desktopInputPadding} py-3 w-full rounded-full focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-300 border-gray-200 hover:border-primary/50 focus:border-primary shadow-sm search-input-focus ${isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                <Search className={`pointer-events-none absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-300 group-focus-within:text-primary search-icon-transition`} />
                
                {/* زر البحث - يظهر فقط عند الكتابة */}
                {searchQuery.trim() && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 search-button-animate search-button-hover"
                  >
                    {lang === 'ar' ? 'بحث' : 'Search'}
                  </button>
                )}
              </form>
            </div>
          )}

          {/* التنقل الرئيسي - مخفي على الشاشات الصغيرة */}
          <nav className="hidden lg:flex items-center gap-2">
            {allNavigationItems.map((item) => {
              const isAdminItem = adminNavigationItems.some(adminItem => adminItem.name === item.name);
              
              return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown((prev) => (prev === item.name ? null : prev))}
              >
                <a
                  href={item.href}
                    className={`px-3 py-2 rounded-full text-foreground hover:text-primary hover:bg-muted transition-colors duration-200 font-medium inline-flex items-center ${
                      isAdminItem ? 'text-red-600 hover:text-red-700' : ''
                    }`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <item.icon className={`h-4 w-4 ${iconMarginClass}`} />
                  <span>{item.name}</span>
                </a>
                {item.children && (
                  <div className={`absolute left-0 top-full w-56 rounded-xl border border-border bg-card shadow-lg transition-opacity ${openDropdown === item.name ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                    <ul className="py-2">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <a href={child.href} className="block px-4 py-2 hover:bg-muted text-sm" onClick={() => setOpenDropdown(null)}>
                            {child.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              );
            })}
            
            {/* رسالة للطالب الذي لم يختر أكاديمية وفرع بعد */}
            {isStudent && isAuthenticated && (!studentAcademy || !studentBranch) && (
              <div className="px-3 py-2 rounded-full text-orange-600 bg-orange-50 border border-orange-200 text-sm font-medium">
                {lang === 'ar' ? 'يرجى اختيار الأكاديمية والفرع أولاً في صفحة الحساب لعرض العناصر المتاحة' : 'Please select Academy and Branch first in Account page to view available items'}
              </div>
            )}
          </nav>

          {/* أزرار تسجيل الدخول والتسجيل أو الملف الشخصي */}
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              {/* Home Page Link - يظهر فقط عندما لا يكون مسجل دخول */}
              <a 
                href="/" 
                className="px-4 py-2 rounded-full text-foreground hover:text-primary hover:bg-muted transition-colors duration-200 font-medium inline-flex items-center"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <Home className={`h-4 w-4 ${iconMarginClass}`} />
                <span>{t('common.nav.home')}</span>
              </a>
              
              {/* Login Button */}
              <Button asChild size="sm" className="academy-button rounded-full px-6">
                <a href="/login">
                  <User className="h-4 w-4 ml-2" />
                  {t('common.auth.login')}
                </a>
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              {/* Home Page Link - يظهر للطلاب بجوار Profile */}
              <Button asChild variant="ghost" size="sm" className="text-foreground rounded-full">
                <a href="/">
                  <Home className="h-4 w-4 ml-2" />
                  {t('common.nav.home')}
                </a>
              </Button>
              
              <Button asChild variant="ghost" size="sm" className="text-foreground rounded-full">
                <a href="/profile">
                  <User className="h-4 w-4 ml-2" />
                  {lang === 'ar' ? 'الحساب' : 'Profile'}
                </a>
              </Button>
            </div>
          )}

          {/* زر القائمة + بروفايل للشاشات الصغيرة */}
          <div className="md:hidden flex items-center gap-1">
            {isAuthenticated && (
              <Button asChild variant="ghost" size="sm" className="rounded-full" aria-label={lang === 'ar' ? 'الطالب' : 'Student'}>
                <a href="/profile">
                  <User className="h-5 w-5" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full"
              aria-label={isMenuOpen ? (lang === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (lang === 'ar' ? 'فتح القائمة' : 'Open menu')}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* القائمة المنسدلة للشاشات الصغيرة */}
        {isMenuOpen && (
          <div className="md:hidden py-4 px-3 border-t border-border/60 bg-card/95 supports-[backdrop-filter]:bg-card/80 backdrop-blur rounded-b-2xl shadow-md">
            {/* شريط البحث للشاشات الصغيرة */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative group">
                <Input
                  type="text"
                  placeholder={t('common.search.placeholderShort')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className={`${mobileInputPadding} py-3 w-full rounded-full focus-visible:ring-2 focus-visible:ring-primary/30 shadow-sm border-gray-200 hover:border-primary/50 focus:border-primary transition-all duration-300 search-input-focus ${isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                <Search className={`pointer-events-none absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-300 group-focus-within:text-primary search-icon-transition`} />
                
                {/* زر البحث - يظهر فقط عند الكتابة */}
                {searchQuery.trim() && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 search-button-animate search-button-hover"
                  >
                    {lang === 'ar' ? 'بحث' : 'Search'}
                  </button>
                )}
              </div>
            </form>
 
            {/* عناصر التنقل */}
            <nav className="grid grid-cols-1 gap-2">
              {allNavigationItems.map((item) => {
                const isOpen = openMobileDropdown === item.name;
                const ItemIcon = item.icon;
                const isAdminItem = adminNavigationItems.some(adminItem => adminItem.name === item.name);
                
                return (
                  <div key={item.name} className="rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <a
                        href={item.href}
                        className="flex items-center gap-3 flex-1 px-4 py-3 text-foreground"
                        onClick={() => setIsMenuOpen(false)}
                        dir={isRtl ? 'rtl' : 'ltr'}
                      >
                        <ItemIcon className="h-4 w-4 text-muted-foreground" />
                        <span className={`font-medium ${isAdminItem ? 'text-red-600' : ''}`}>{item.name}</span>
                      </a>
                      {item.children && (
                        <button
                          aria-label="toggle submenu"
                          className="px-3 py-3 text-muted-foreground"
                          onClick={() => setOpenMobileDropdown(isOpen ? null : item.name)}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    {item.children && (
                      <div className={`grid overflow-hidden transition-all ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="min-h-0">
                          <div className="px-4 pb-3 pt-1 space-y-1">
                            {item.children.map((child) => (
                              <a
                                key={child.href}
                                href={child.href}
                                className="block px-3 py-2 rounded-lg text-sm text-foreground/90 hover:bg-muted"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {child.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
 
            {/* أزرار تسجيل الدخول للشاشات الصغيرة */}
            {!isAuthenticated ? (
              <div className="mt-4 space-y-3">
                {/* Home Page Link - يظهر فقط عندما لا يكون مسجل دخول */}
                <a 
                  href="/" 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{t('common.nav.home')}</span>
                </a>
                
                {/* Login Button */}
                <Button asChild className="w-full academy-button rounded-full">
                  <a href="/login">
                    <User className="h-4 w-4 ml-2" />
                    {t('common.auth.login')}
                  </a>
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <Button asChild variant="ghost" className="w-full rounded-full">
                  <a href="/profile">
                    <User className="h-4 w-4 ml-2" />
                    {lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                  </a>
                </Button>
              </div>
            )}

            {/* CTA أسفل القائمة */}
            {isAuthenticated && (
              <div className="mt-3">
                <Button asChild className="w-full academy-button rounded-full">
                  <a href="/catalog" className="flex items-center justify-center gap-2">
                    {lang === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

