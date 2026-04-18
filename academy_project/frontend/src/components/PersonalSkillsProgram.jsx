import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users, 
  DollarSign, 
  MessageSquare, 
  FolderOpen, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BookOpen, 
  Headphones,
  ArrowLeft,
  ArrowRight,
  Play,
  FileText,
  Presentation,
  CheckCircle,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useI18n } from '../lib/i18n';

const PersonalSkillsProgram = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [currentStep, setCurrentStep] = useState(0); // 0 = مقدمة، 1-10 = المهارات

  const skills = [
    {
      id: 'time-management',
      title: lang === 'ar' ? 'إدارة الوقت' : 'Time Management',
      icon: Clock,
      color: 'bg-blue-500',
      description: lang === 'ar' 
        ? 'تعلم كيفية إدارة الوقت بفعالية وزيادة الإنتاجية'
        : 'Learn how to manage time effectively and increase productivity',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية شاملة عن إدارة الوقت تشمل نظريات إدارة الوقت، أدوات التخطيط، وتقنيات تحديد الأولويات'
          : 'Comprehensive scientific material on time management including time management theories, planning tools, and priority setting techniques',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 45 دقيقة يشرح استراتيجيات إدارة الوقت العملية'
          : '45-minute educational video explaining practical time management strategies',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يحتوي على أهم النقاط والخطوات العملية لإدارة الوقت'
          : 'Slide presentation containing key points and practical steps for time management'
      }
    },
    {
      id: 'negotiation-skills',
      title: lang === 'ar' ? 'مهارات التفاوض' : 'Negotiation Skills',
      icon: Users,
      color: 'bg-green-500',
      description: lang === 'ar' 
        ? 'اكتسب مهارات التفاوض الفعالة لتحقيق أفضل النتائج'
        : 'Acquire effective negotiation skills to achieve the best outcomes',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن فن التفاوض تشمل استراتيجيات التفاوض، تقنيات الإقناع، وإدارة الصراعات'
          : 'Scientific material on the art of negotiation including negotiation strategies, persuasion techniques, and conflict management',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 60 دقيقة يعرض سيناريوهات تفاوض واقعية'
          : '60-minute educational video presenting real negotiation scenarios',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يوضح مراحل التفاوض وأدواته الأساسية'
          : 'Slide presentation explaining negotiation stages and essential tools'
      }
    },
    {
      id: 'financial-management',
      title: lang === 'ar' ? 'إدارة الشؤون المالية' : 'Financial Management',
      icon: DollarSign,
      color: 'bg-purple-500',
      description: lang === 'ar' 
        ? 'تعلم أساسيات إدارة الشؤون المالية الشخصية والمؤسسية'
        : 'Learn the basics of personal and institutional financial management',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن إدارة الشؤون المالية تشمل التخطيط المالي، إدارة الميزانية، والاستثمار'
          : 'Scientific material on financial management including financial planning, budget management, and investment',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 50 دقيقة يشرح أساسيات إدارة الشؤون المالية'
          : '50-minute educational video explaining the basics of financial management',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يحتوي على أدوات إدارة الشؤون المالية والخطوات العملية'
          : 'Slide presentation containing financial management tools and practical steps'
      }
    },
    {
      id: 'communication-skills',
      title: lang === 'ar' ? 'مهارات التواصل' : 'Communication Skills',
      icon: MessageSquare,
      color: 'bg-orange-500',
      description: lang === 'ar' 
        ? 'طور مهارات التواصل الفعالة مع الآخرين'
        : 'Develop effective communication skills with others',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن مهارات التواصل تشمل التواصل اللفظي وغير اللفظي، الاستماع الفعال، والتواصل في العمل'
          : 'Scientific material on communication skills including verbal and non-verbal communication, active listening, and workplace communication',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 55 دقيقة يعرض تقنيات التواصل الفعالة'
          : '55-minute educational video presenting effective communication techniques',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يوضح أنواع التواصل ومهاراته الأساسية'
          : 'Slide presentation explaining types of communication and its basic skills'
      }
    },
    {
      id: 'project-management',
      title: lang === 'ar' ? 'إدارة المشاريع' : 'Project Management',
      icon: FolderOpen,
      color: 'bg-red-500',
      description: lang === 'ar' 
        ? 'تعلم أساسيات إدارة المشاريع من التخطيط إلى التنفيذ'
        : 'Learn the basics of project management from planning to execution',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن إدارة المشاريع تشمل دورة حياة المشروع، أدوات التخطيط، وإدارة المخاطر'
          : 'Scientific material on project management including project lifecycle, planning tools, and risk management',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 70 دقيقة يشرح مراحل إدارة المشاريع'
          : '70-minute educational video explaining project management stages',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يحتوي على أدوات إدارة المشاريع والمنهجيات المختلفة'
          : 'Slide presentation containing project management tools and different methodologies'
      }
    },
    {
      id: 'personal-branding',
      title: lang === 'ar' ? 'التسويق الشخصي والعلامة التجارية' : 'Personal Branding & Marketing',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      description: lang === 'ar' 
        ? 'ابني علامتك التجارية الشخصية وطور استراتيجية تسويق فعالة'
        : 'Build your personal brand and develop an effective marketing strategy',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن التسويق الشخصي تشمل بناء الهوية الشخصية، استراتيجيات التسويق، وإدارة السمعة'
          : 'Scientific material on personal marketing including building personal identity, marketing strategies, and reputation management',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 65 دقيقة يشرح استراتيجيات التسويق الشخصي'
          : '65-minute educational video explaining personal marketing strategies',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يوضح خطوات بناء العلامة التجارية الشخصية'
          : 'Slide presentation explaining steps to build personal branding'
      }
    },
    {
      id: 'problem-solving',
      title: lang === 'ar' ? 'حل المشكلات واتخاذ القرارات' : 'Problem Solving & Decision Making',
      icon: Target,
      color: 'bg-pink-500',
      description: lang === 'ar' 
        ? 'تعلم منهجيات حل المشكلات واتخاذ القرارات السليمة'
        : 'Learn problem-solving methodologies and sound decision-making',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن حل المشكلات تشمل منهجيات التحليل، أدوات اتخاذ القرارات، والتفكير النقدي'
          : 'Scientific material on problem solving including analysis methodologies, decision-making tools, and critical thinking',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 60 دقيقة يعرض حالات عملية لحل المشكلات'
          : '60-minute educational video presenting practical problem-solving cases',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يحتوي على خطوات حل المشكلات وأدوات اتخاذ القرارات'
          : 'Slide presentation containing problem-solving steps and decision-making tools'
      }
    },
    {
      id: 'creative-thinking',
      title: lang === 'ar' ? 'التفكير الإبداعي والابتكار' : 'Creative Thinking & Innovation',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      description: lang === 'ar' 
        ? 'طور مهارات التفكير الإبداعي والابتكار لحل المشكلات بطرق جديدة'
        : 'Develop creative thinking and innovation skills to solve problems in new ways',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن التفكير الإبداعي تشمل تقنيات الإبداع، منهجيات الابتكار، وتطوير الأفكار الجديدة'
          : 'Scientific material on creative thinking including creativity techniques, innovation methodologies, and developing new ideas',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 55 دقيقة يعرض تقنيات التفكير الإبداعي'
          : '55-minute educational video presenting creative thinking techniques',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يوضح أدوات التفكير الإبداعي ومراحل الابتكار'
          : 'Slide presentation explaining creative thinking tools and innovation stages'
      }
    },
    {
      id: 'self-learning',
      title: lang === 'ar' ? 'التعلم الذاتي' : 'Self-Learning',
      icon: BookOpen,
      color: 'bg-teal-500',
      description: lang === 'ar' 
        ? 'تعلم كيفية تطوير مهارات التعلم الذاتي والاستمرار في النمو'
        : 'Learn how to develop self-learning skills and continue growing',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن التعلم الذاتي تشمل استراتيجيات التعلم، إدارة المعرفة، والتطوير المستمر'
          : 'Scientific material on self-learning including learning strategies, knowledge management, and continuous development',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 50 دقيقة يشرح تقنيات التعلم الذاتي الفعالة'
          : '50-minute educational video explaining effective self-learning techniques',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يحتوي على خطوات تطوير مهارات التعلم الذاتي'
          : 'Slide presentation containing steps to develop self-learning skills'
      }
    },
    {
      id: 'customer-service',
      title: lang === 'ar' ? 'التعامل مع العملاء' : 'Customer Service',
      icon: Headphones,
      color: 'bg-cyan-500',
      description: lang === 'ar' 
        ? 'اكتسب مهارات التعامل مع العملاء وخدمة العملاء المتميزة'
        : 'Acquire customer service skills and excellent customer service',
      content: {
        scientific: lang === 'ar' 
          ? 'مادة علمية عن خدمة العملاء تشمل مهارات التعامل، حل شكاوى العملاء، وبناء العلاقات'
          : 'Scientific material on customer service including interaction skills, customer complaint resolution, and relationship building',
        video: lang === 'ar' 
          ? 'فيديو تعليمي مدته 45 دقيقة يعرض سيناريوهات خدمة العملاء'
          : '45-minute educational video presenting customer service scenarios',
        presentation: lang === 'ar' 
          ? 'عرض شرائح يوضح مبادئ خدمة العملاء وأدواتها'
          : 'Slide presentation explaining customer service principles and tools'
      }
    }
  ];

  const currentSkill = skills[currentStep - 1];

  const nextStep = () => {
    if (currentStep < skills.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToSkill = (index) => {
    setCurrentStep(index + 1);
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* شريط التقدم */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {currentStep === 0 
                ? (lang === 'ar' ? 'برنامج المهارات الشخصية' : 'Personal Skills Program')
                : currentSkill?.title
              }
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-white border-white/30">
                {currentStep}/{skills.length}
              </Badge>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / skills.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            // صفحة المقدمة
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
                  <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                    {lang === 'ar' ? 'المهارات الشخصية' : 'Personal Skills'}
                  </h1>
                  <p className="text-xl text-white/90 mb-8">
                    {lang === 'ar' 
                      ? 'برنامج شامل لتطوير المهارات الشخصية والمهنية الأساسية للنجاح في الحياة والعمل'
                      : 'Comprehensive program for developing essential personal and professional skills for success in life and work'
                    }
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    {skills.map((skill, index) => (
                      <div key={skill.id} className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-full ${skill.color} flex items-center justify-center`}>
                          <skill.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {skill.title}
                        </h3>
                        <div className="w-2 h-2 bg-white/30 rounded-full mx-auto"></div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={nextStep}
                      className="academy-button bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {lang === 'ar' ? 'ابدأ البرنامج' : 'Start Program'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // صفحة المهارة
            <motion.div
              key={`skill-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-4xl mx-auto">
                {/* رأسية المهارة */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-20 h-20 rounded-full ${currentSkill.color} flex items-center justify-center`}>
                      <currentSkill.icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {currentSkill.title}
                      </h2>
                      <p className="text-white/80 text-lg">
                        {currentSkill.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* محتوى المهارة */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* مادة علمية */}
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white">
                            {lang === 'ar' ? 'مادة علمية' : 'Scientific Material'}
                          </CardTitle>
                          <CardDescription className="text-white/70">
                            {lang === 'ar' ? 'محتوى مكتوب ومنظم' : 'Written and organized content'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 text-sm">
                        {currentSkill.content.scientific}
                      </p>
                      <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md">
                        <FileText className="w-4 h-4 mr-2" />
                        {lang === 'ar' ? 'عرض المادة' : 'View Material'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* فيديو */}
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Play className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white">
                            {lang === 'ar' ? 'فيديو تعليمي' : 'Educational Video'}
                          </CardTitle>
                          <CardDescription className="text-white/70">
                            {lang === 'ar' ? 'محاضرة مسجلة' : 'Recorded lecture'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 text-sm">
                        {currentSkill.content.video}
                      </p>
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md">
                        <Play className="w-4 h-4 mr-2" />
                        {lang === 'ar' ? 'مشاهدة الفيديو' : 'Watch Video'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* عرض شرائح */}
                  <Card className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Presentation className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white">
                            {lang === 'ar' ? 'عرض شرائح' : 'Presentation'}
                          </CardTitle>
                          <CardDescription className="text-white/70">
                            {lang === 'ar' ? 'ملخص بصري' : 'Visual summary'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/80 text-sm">
                        {currentSkill.content.presentation}
                      </p>
                      <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md">
                        <Presentation className="w-4 h-4 mr-2" />
                        {lang === 'ar' ? 'عرض الشرائح' : 'View Slides'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* أزرار التنقل */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={prevStep}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {lang === 'ar' ? 'السابق' : 'Previous'}
                  </Button>

                  <div className="flex gap-2">
                    {skills.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSkill(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentStep === index + 1 
                            ? 'bg-white' 
                            : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentStep === skills.length}
                  >
                    {currentStep === skills.length 
                      ? (lang === 'ar' ? 'إنهاء البرنامج' : 'Complete Program')
                      : (lang === 'ar' ? 'التالي' : 'Next')
                    }
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PersonalSkillsProgram; 