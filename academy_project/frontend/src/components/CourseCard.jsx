import React from 'react';
import { Clock, Users, Star, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import coursePlaceholder from '../assets/course_placeholder.png';
import { useI18n } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  // بيانات افتراضية في حالة عدم توفر البيانات من API
  const defaultCourse = {
    title: 'دورة تطوير الويب',
    description: 'تعلم أساسيات تطوير المواقع الإلكترونية باستخدام أحدث التقنيات',
    duration: '8 أسابيع',
    students: '1,250',
    rating: '4.8',
    level: 'متوسط',
    image: coursePlaceholder,
    instructor: 'د. أحمد محمد',
    price: 'مجاني'
  };

  const courseData = course || defaultCourse;

  return (
    <div className="academy-card group cursor-pointer overflow-hidden hover:shadow-md transition-all">
      {/* صورة الدورة */}
      <div className="relative overflow-hidden">
        <img 
          src={courseData.image || coursePlaceholder} 
          alt={courseData.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'}`}>
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
            {courseData.level}
          </span>
        </div>
        <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'}`}>
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
            {courseData.price}
          </span>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {courseData.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {courseData.description}
        </p>

        {/* إحصائيات الدورة */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 ml-1" />
            <span>{courseData.duration}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-4 w-4 ml-1" />
            <span>{courseData.students} {lang === 'ar' ? 'طالب' : 'students'}</span>
          </div>
          
          <div className="flex items-center">
            <Star className="h-4 w-4 ml-1 text-yellow-500 fill-current" />
            <span>{courseData.rating}</span>
          </div>
        </div>

        {/* زر التسجيل */}
        <Button 
          className="w-full academy-button group-hover:shadow-md transition-shadow duration-200"
          onClick={() => {
            const q = encodeURIComponent(courseData.title || '');
            navigate(`/search?q=${q}`);
          }}
        >
          <BookOpen className="h-4 w-4 ml-2" />
          {lang === 'ar' ? 'ابدأ التعلم الآن' : 'Start learning now'}
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;

