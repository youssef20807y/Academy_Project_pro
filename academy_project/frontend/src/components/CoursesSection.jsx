import React, { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Grid, List } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import CourseCard from './CourseCard';
import api from '../services/api';
import { useI18n } from '../lib/i18n';

const CoursesSection = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [searchParams] = useSearchParams();
  
  // قراءة معاملات URL للأكاديمية والفرع
  const academyId = searchParams.get('academy');
  const branchId = searchParams.get('branch');
  
  console.log('🔍 URL Parameters - Academy:', academyId, 'Branch:', branchId);
  
  const [courses, setCourses] = useState([]);
  const [courseMasters, setCourseMasters] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('courses.categories.all') },
    { id: 'tech', name: t('courses.categories.tech') },
    { id: 'business', name: t('courses.categories.business') },
    { id: 'design', name: t('courses.categories.design') },
    { id: 'language', name: t('courses.categories.language') },
    { id: 'skills', name: t('courses.categories.skills') }
  ];

  // بيانات دورات افتراضية في حالة فشل API
  const defaultCourses = [
    {
      id: 1,
      title: 'تطوير المواقع الإلكترونية',
      description: 'تعلم أساسيات تطوير المواقع باستخدام HTML, CSS, JavaScript',
      duration: '8 أسابيع',
      students: '2,450',
      rating: '4.9',
      level: 'مبتدئ',
      instructor: 'د. سارة أحمد',
      category: 'tech'
    },
    {
      id: 2,
      title: 'إدارة الأعمال الحديثة',
      description: 'مهارات القيادة والإدارة في بيئة العمل المعاصرة',
      duration: '6 أسابيع',
      students: '1,890',
      rating: '4.7',
      level: 'متوسط',
      instructor: 'أ. محمد علي',
      category: 'business'
    },
    {
      id: 3,
      title: 'التصميم الجرافيكي',
      description: 'أساسيات التصميم الجرافيكي وبرامج Adobe Creative Suite',
      duration: '10 أسابيع',
      students: '3,200',
      rating: '4.8',
      level: 'مبتدئ',
      instructor: 'د. فاطمة حسن',
      category: 'design'
    },
    {
      id: 4,
      title: 'اللغة الإنجليزية للأعمال',
      description: 'تطوير مهارات اللغة الإنجليزية في بيئة العمل',
      duration: '12 أسبوع',
      students: '4,100',
      rating: '4.6',
      level: 'متوسط',
      instructor: 'أ. ليلى محمود',
      category: 'language'
    },
    {
      id: 5,
      title: 'مهارات التواصل الفعال',
      description: 'تطوير مهارات التواصل والعرض والتقديم',
      duration: '4 أسابيع',
      students: '2,800',
      rating: '4.9',
      level: 'سهل',
      instructor: 'د. أحمد خالد',
      category: 'skills'
    },
    {
      id: 6,
      title: 'البرمجة بلغة Python',
      description: 'تعلم أساسيات البرمجة وتطبيقاتها العملية',
      duration: '14 أسبوع',
      students: '5,600',
      rating: '4.8',
      level: 'متوسط',
      instructor: 'د. عمر يوسف',
      category: 'tech'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // محاولة جلب البيانات من API مع معالجة صامتة للأخطاء
        // نستخدم silent: true للطلبات الصامتة التي لا تظهر أخطاء للمستخدم
        const [coursesData, mastersData, typesData] = await Promise.all([
          api.getCourses().catch(() => null),
          api.getCourseMasters().catch(() => null),
          api.getCourseTypes().catch(() => null)
        ]);

        // معالجة استجابة الدورات
        if (coursesData) {
          const items = Array.isArray(coursesData) ? coursesData : (coursesData?.courses || []);
          if (Array.isArray(items) && items.length > 0) {
            // تصفية الدورات حسب الأكاديمية والفرع إذا كانت موجودة في URL
            let filteredItems = items;
            
            if (academyId && branchId) {
              console.log('🔍 Filtering courses by Academy:', academyId, 'and Branch:', branchId);
              
              // تصفية الدورات حسب الأكاديمية والفرع
              filteredItems = items.filter(course => {
                const courseAcademyId = course.academyDataId || course.AcademyDataId || course.academyId || course.AcademyId;
                const courseBranchId = course.branchesDataId || course.BranchesDataId || course.branchId || course.BranchId;
                
                const academyMatch = courseAcademyId === academyId;
                const branchMatch = courseBranchId === branchId;
                
                console.log('🔍 Course:', course.id, 'Academy:', courseAcademyId, 'Branch:', courseBranchId, 'Match:', academyMatch && branchMatch);
                
                return academyMatch && branchMatch;
              });
              
              console.log('✅ Filtered courses count:', filteredItems.length, 'from total:', items.length);
            } else {
              console.log('ℹ️ No academy/branch filter applied, showing all courses');
            }
            
            const apiCourses = filteredItems.map((course, index) => {
              const id = course.id || course.Id || index + 1;
              const title = course.title || course.name || course.Name || course.ClaseNameL1 || `دورة ${index + 1}`;
              const description = course.description || course.Description || 'وصف الدورة غير متوفر';
              const duration = course.duration || course.Duration || '8 أسابيع';
              const students = course.studentsCount || course.Students || Math.floor(Math.random() * 5000) + 500;
              const rating = course.rating || (4.5 + Math.random() * 0.5).toFixed(1);
              const level = course.level || course.Level || 'متوسط';
              return {
                id,
                title,
                description,
                duration,
                students,
                rating,
                level,
                instructor: course.instructor || course.Instructor || 'مدرب معتمد',
                category: 'tech',
              }
            });
            setCourses(apiCourses);
          } else {
            setCourses(defaultCourses);
          }
        } else {
          setCourses(defaultCourses);
        }

        // معالجة استجابة الفئات الرئيسية
        if (mastersData) {
          const items = Array.isArray(mastersData) ? mastersData : (mastersData?.masters || []);
          if (Array.isArray(items)) setCourseMasters(items);
        }

        // معالجة استجابة أنواع الدورات
        if (typesData) {
          const items = Array.isArray(typesData) ? typesData : (typesData?.types || []);
          if (Array.isArray(items)) setCourseTypes(items);
        }

      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        setCourses(defaultCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [academyId, branchId]); // إضافة academyId و branchId كتبعيات

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t('courses.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('courses.loading')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="academy-card animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-6">
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* العنوان الرئيسي */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t('courses.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {lang === 'ar' ? 'اكتشف أبرز الدورات التي تساهم في تعزيز مهاراتك وتطوير مسيرتك المهنية، مصممة بعناية لتوفير أعلى مستويات الجودة والتأثير' : 'Discover top courses that enhance your skills and advance your career, carefully designed for maximum quality and impact.'}
          </p>
        </div>

        {/* أدوات التصفية والعرض */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4">
          {/* فئات الدورات */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "academy-button" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* أدوات العرض */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* عرض الدورات */}
        <div className={`grid gap-8 mb-12 ${
          viewMode === 'grid' 
            ? 'md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 lg:grid-cols-2'
        }`}>
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {/* زر عرض المزيد */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="px-8">
            {t('common.actions.viewAllCourses')}
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;

