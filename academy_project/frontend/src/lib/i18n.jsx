import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  en: {
    common: {
      nav: {
        home: 'Home',
        coursesPrograms: 'Courses',
        services: 'Services',
        trainers: 'Trainers',
        jobs: 'Jobs',
        about: 'About Us',
        settings: 'Settings'
      },
      auth: {
        login: 'Login',
        registerFree: 'Sign up free'
      },
      search: {
        placeholder: 'Search courses and programs...',
        placeholderShort: 'Search...'
      },
      actions: {
        viewAllCourses: 'View all courses',
        previewProject: 'Preview project',
        subscribe: 'Subscribe',
        subscribeNow: 'Subscribe now',
        registerNow: 'Register now',
        startNowFree: 'Start now for free',
        browseCourses: 'Browse courses',
        open: 'Open'
      },
      ui: {
        followUs: 'Follow us:'
      }
    },
    hero: {
      title: 'Learn smarter, start your career now',
      subtitle: 'High-quality free courses and programs with accredited certificates and focused practical content.',
      imageAlt: 'Students learning online',
      stats: {
        students: 'Registered students',
        courses: 'Courses',
        certificates: 'Accredited certificates',
        countries: 'Countries'
      }
    },
    stats: {
      students: 'Registered students',
      courses: 'Courses',
      certificates: 'Accredited certificates',
      countries: 'Countries'
    },
    features: {
      title: 'Why Academy Creativity?',
      subtitle: 'An integrated platform to develop your skills from basics to mastery, with a modern user experience and high-quality content.',
      items: [
        { title: 'Fast and modern learning', desc: 'Practical curricula focused on in-demand job market skills.' },
        { title: 'Accredited certificates', desc: 'Earn trusted certificates that boost your career opportunities.' },
        { title: 'Outstanding user experience', desc: 'Elegant, easy-to-use interface with full Arabic support.' },
        { title: 'Continuous technical support', desc: 'A dedicated team to assist you throughout your learning journey.' }
      ]
    },

    cta: {
      title: 'Start your learning journey today',
      subtitle: 'Join thousands of learners and level up your skills with free training programs and accredited certificates.',
      signup: 'Sign up now'
    },
    authPages: {
      login: {
        title: 'Log in to your account',
        subtitle: 'Continue learning and access your courses and certificates easily.',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        forgot: 'Forgot password?',
        create: 'Create new account',
        submit: 'Login',
        submitting: 'Logging in...'
      },
      register: {
        title: 'Sign up free and start now',
        subtitle: 'Create your account to get high-quality free courses and programs with accredited certificates.',
        bullets: [
          'Access to focused free content',
          'Track progress and certificates',
          'Personalized course alerts for you'
        ],
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        phone: 'Phone number',
        password: 'Password',
        confirmPassword: 'Confirm password',
        role: 'Role',
        academyId: 'Academy ID',
        branchId: 'Branch ID',
        submit: 'Create free account',
        submitting: 'Creating account...'
      }
    },
    courses: {
      title: 'Most in-demand courses',
      loading: 'Loading courses...',
      categories: {
        all: 'All courses',
        tech: 'Technology',
        business: 'Business',
        design: 'Design',
        language: 'Languages',
        skills: 'Self development'
      }
    },
    trainers: {
      title: 'Our Expert Trainers',
      subtitle: 'Learn from industry professionals and certified experts',
      loading: 'Loading trainers...',
      categories: {
        softSkill: 'Soft Skills',
        technical: 'Technical',
        freelancer: 'Freelancer',
        english: 'English'
      },
      aboutMe: 'About Me',
      contact: 'Contact',
      cv: 'CV',
      downloadCV: 'Download CV',
      viewCV: 'View CV',
      noTrainers: 'No trainers found for this category'
    },
    about: {
      title: 'About Us',
      subtitle: 'Learn more about our initiative and academy',
      initiative: {
        title: 'About the Initiative',
        subtitle: 'Our vision and mission',
        description: 'We are committed to providing high-quality education and training programs that empower individuals and communities.',
        vision: 'Our Vision',
        visionText: 'To be a leading educational institution that fosters innovation and excellence in learning.',
        mission: 'Our Mission',
        missionText: 'To provide accessible, quality education that transforms lives and builds stronger communities.',
        values: 'Our Values',
        valuesList: ['Excellence', 'Innovation', 'Accessibility', 'Community']
      },
      academy: {
        title: 'About the Academy',
        subtitle: 'Excellence in education',
        description: 'Our academy offers comprehensive training programs designed to meet the evolving needs of the modern workforce.',
        features: 'Key Features',
        featuresList: ['Expert Trainers', 'Modern Curriculum', 'Flexible Learning', 'Career Support'],
        stats: 'Our Impact',
        statsList: [
          { number: '1000+', label: 'Students Trained' },
          { number: '50+', label: 'Expert Trainers' },
          { number: '95%', label: 'Success Rate' },
          { number: '24/7', label: 'Support Available' }
        ]
      }
    },
    jobs: {
      title: 'Job Opportunities',
      subtitle: 'Join our team and be part of our educational mission',
      categories: {
        graphicDesigner: 'Graphic Designer',
        networkEngineer: 'Network Engineer',
        webDesigner: 'Web Designer',
        digitalMarketer: 'Digital Marketer'
      },
      jobDetails: {
        experience: 'Required Experience',
        level: 'Job Level',
        qualification: 'Qualification',
        category: 'Job Category',
        apply: 'Apply Now',
        viewDetails: 'View Details'
      },
      loading: 'Loading jobs...',
      noJobs: 'No jobs available at the moment'
    },
    footer: {
      stayInformed: 'Stay informed',
      latest: '— Latest courses, programs, and offers',
      emailPlaceholder: 'Your email',
      subscribe: 'Subscribe',
      description: 'Academy Creativity is a leading educational platform aimed at developing skills and enhancing capabilities through specialized and accredited training programs.',
      rights: (year) => `© ${year} Academy Creativity. All rights reserved.`,
    },
    pages: {
      about: { title: 'About us', content: 'Company information, vision and mission...' },
      team: { title: 'Team', content: 'Meet our team...' },
      partners: { title: 'Partners', content: 'Our strategic partners...' },
      jobs: { title: 'Jobs', content: 'Join us...' },
      news: { title: 'News', content: 'Latest news...' },
      help: { title: 'Help Center', content: 'Usage guide and instructions...' },
      faq: { title: 'Frequently Asked Questions', content: 'Common questions...' },
      privacy: { title: 'Privacy Policy', content: 'Policy details...' },
      terms: { title: 'Terms of Use', content: 'Terms and conditions...' },
      certificates: { 
        title: 'Accredited certificates', 
        content: `
          <div class="space-y-8">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 border">
              <h3 class="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">Professional Certificates</h3>
              <p class="text-blue-700 dark:text-blue-300 mb-4">Our certificates are internationally recognized and help you advance your career.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Web Development</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Complete web development certification covering HTML, CSS, JavaScript, and modern frameworks.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Data Science</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Comprehensive data science certification including Python, machine learning, and analytics.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Digital Marketing</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Professional digital marketing certification covering SEO, social media, and content marketing.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Project Management</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Project management certification with practical tools and methodologies.</p>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg p-6 border">
              <h3 class="text-xl font-bold mb-4 text-green-900 dark:text-green-100">Certificate Features</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Internationally Recognized</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Certificates accepted by employers worldwide</p>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Lifetime Access</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Access your certificates anytime, anywhere</p>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">Verifiable</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Digital verification system for employers</p>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-6 border">
              <h3 class="text-xl font-bold mb-4 text-orange-900 dark:text-orange-100">How to Earn Certificates</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">1</div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">Complete Course Requirements</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Finish all modules, assignments, and assessments in your chosen course.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">2</div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">Pass Final Assessment</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Achieve the minimum required score in the final course assessment.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">3</div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">Download Certificate</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Access and download your certificate from your account dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      corporate: { title: 'Corporate training', content: 'Courses for companies...' },
      consulting: { title: 'Educational consulting', content: 'Our consulting services...' },
      scholarships: { title: 'Scholarships', content: 'Scholarships and opportunities...' },
      support: { title: 'Technical support', content: 'Support channels...' },
      account: { title: 'My account', content: 'Profile, security and account settings.' }
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your site preferences and language.',
      language: {
        title: 'Language',
        description: 'Choose your preferred interface language.',
        selectLabel: 'Select language',
        en: 'English',
        ar: 'Arabic'
      },
      site: {
        title: 'Site preferences',
        subtitle: 'Adjust interface behavior.',
        reduceMotionLabel: 'Reduce motion',
        reduceMotionDesc: 'Limit animations and motion effects.',
        compactLayoutLabel: 'Compact layout',
        compactLayoutDesc: 'Use denser spacing for lists and cards.'
      },
      reset: 'Reset to defaults'
    },
    branches: {
      title: 'Academy branches',
      subtitle: 'Find the nearest branch or use filters to locate the right one.',
      searchLabel: 'Search',
      searchPlaceholder: 'Branch name, address or mobile',
      governorateLabel: 'Governorate',
      governoratePlaceholder: 'Select governorate',
      cityLabel: 'City',
      cityPlaceholder: 'Select city',
      refreshBtn: 'Refresh',
      resetBtn: 'Reset',
      loading: 'Loading...',
      empty: 'No matching branches.',
      card: { mobile: 'Mobile', phone: 'Phone', whatsapp: 'WhatsApp', email: 'Email' }
    },
    contact: {
      title: 'Contact us',
      subtitle: 'We are happy to hear from you. Send a complaint/note with an attachment and we will follow up promptly.',
      form: {
        branchLabel: 'Branch',
        branchPlaceholder: 'Select branch',
        typeLabel: 'Complaint type',
        typePlaceholder: 'Select type',
        descriptionLabel: 'Description',
        descriptionPlaceholder: 'Describe the issue in detail...',
        fileLabel: 'Attachment (optional)',
        fileNote: 'PDF/Image up to 5MB.',
        studentIdLabel: 'Student ID (optional)',
        studentIdPlaceholder: 'UUID',
        studentIdDesc: 'Helps us track the complaint faster.',
        submit: 'Send',
        submitting: 'Sending...'
      },
      status: { title: 'Complaint status', empty: 'No data available yet.' },
      info: { title: 'Contact info', supportEmailLabel: 'Support email', whatsappLabel: 'WhatsApp' }
    }
  },
  ar: {
    common: {
      nav: {
        home: 'الرئيسية',
        coursesPrograms: 'البرامج',
        services: 'الخدمات',
        trainers: 'المدربين',
        jobs: 'التوظيف',
        about: 'عنّا',
        settings: 'الإعدادات'
      },
      auth: {
        login: 'دخول',
        registerFree: 'سجّل مجاناً'
      },
      search: {
        placeholder: 'ابحث عن الدورات والبرامج...',
        placeholderShort: 'ابحث...'
      },
      actions: {
        viewAllCourses: 'عرض جميع الدورات',
        previewProject: 'معاينة المشروع',
        subscribe: 'اشتراك',
        subscribeNow: 'اشترك الآن',
        registerNow: 'سجّل الآن',
        startNowFree: 'ابدأ الآن مجاناً',
        browseCourses: 'تصفّح الدورات',
        open: 'فتح'
      },
      ui: {
        followUs: 'تابعنا:'
      }
    },
    hero: {
      title: 'تعلّم بذكاء، وابدأ مسيرتك المهنية الآن',
      subtitle: 'دورات وبرامج مجانية عالية الجودة مع شهادات معتمدة ومحتوى عملي مُركّز.',
      imageAlt: 'طلاب يتعلمون عبر الإنترنت',
      stats: {
        students: 'طالب مسجل',
        courses: 'دورة تدريبية',
        certificates: 'شهادة معتمدة',
        countries: 'دولة'
      }
    },
    stats: {
      students: 'طالب مسجل',
      courses: 'دورة تدريبية',
      certificates: 'شهادة معتمدة',
      countries: 'دولة'
    },
    features: {
      title: 'لماذا أكاديمية الإبداع؟',
      subtitle: 'منصة متكاملة لتطوير مهاراتك من الأساسيات حتى الاحتراف، بتجربة مستخدم حديثة ومحتوى عالي الجودة.',
      items: [
        { title: 'تعلم سريع وحديث', desc: 'مناهج عملية تركز على المهارات المطلوبة في سوق العمل.' },
        { title: 'شهادات معتمدة', desc: 'احصل على شهادات موثوقة تزيد من فرصك الوظيفية.' },
        { title: 'تجربة مستخدم متميزة', desc: 'واجهة أنيقة وسهلة الاستخدام تدعم اللغة العربية بالكامل.' },
        { title: 'دعم فني مستمر', desc: 'فريق متخصص لمساعدتك خلال رحلتك التعليمية.' }
      ]
    },
    cta: {
      title: 'ابدأ رحلتك التعليمية اليوم',
      subtitle: 'انضم لآلاف المتعلمين، وارتقِ بمهاراتك مع برامج تدريبية مجانية وشهادات معتمدة.',
      signup: 'سجّل الآن'
    },
    authPages: {
      login: {
        title: 'دخول إلى حسابك',
        subtitle: 'تابع تعلمك واطّلع على دوراتك وشهاداتك بسهولة.',
        emailLabel: 'البريد الإلكتروني',
        passwordLabel: 'كلمة المرور',
        forgot: 'نسيت كلمة المرور؟',
        create: 'إنشاء حساب جديد',
        submit: 'دخول',
        submitting: 'جارٍ تسجيل الدخول...'
      },
      register: {
        title: 'سجّل مجاناً وابدأ رحلتك الآن',
        subtitle: 'أنشئ حسابك للحصول على دورات وبرامج مجانية عالية الجودة مع شهادات معتمدة.',
        bullets: [
          'الوصول إلى محتوى مُركّز',
          'متابعة التقدّم والشهادات',
          'تنبيهات مخصّصة بالدورات المناسبة لك'
        ],
        firstName: 'الاسم الأول',
        lastName: 'اسم العائلة',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        role: 'الدور',
        academyId: 'معرّف الأكاديمية',
        branchId: 'معرّف الفرع',
        submit: 'إنشاء حساب مجاني',
        submitting: 'جارٍ إنشاء الحساب...'
      }
    },
    courses: {
      title: 'الدورات الأكثر طلباً',
      loading: 'جاري تحميل الدورات...',
      categories: {
        all: 'جميع الدورات',
        tech: 'التكنولوجيا',
        business: 'الأعمال',
        design: 'التصميم',
        language: 'اللغات',
        skills: 'تطوير الذات'
      }
    },
    trainers: {
      title: 'مدربونا الخبراء',
      subtitle: 'تعلم من المحترفين في الصناعة والخبراء المعتمدين',
      loading: 'جاري تحميل المدربين...',
      categories: {
        softSkill: 'المهارات الناعمة',
        technical: 'التقني',
        freelancer: 'العمل الحر',
        english: 'اللغة الإنجليزية'
      },
      aboutMe: 'نبذة عني',
      contact: 'التواصل',
      cv: 'السيرة الذاتية',
      downloadCV: 'تحميل السيرة الذاتية',
      viewCV: 'عرض السيرة الذاتية',
      noTrainers: 'لا يوجد مدربون لهذه الفئة'
    },
    about: {
      title: 'عنّا',
      subtitle: 'تعرف على مبادرتنا وأكاديميتنا',
      initiative: {
        title: 'عن المبادرة',
        subtitle: 'رؤيتنا ورسالتنا',
        description: 'نحن ملتزمون بتقديم برامج تعليمية وتدريبية عالية الجودة تمكن الأفراد والمجتمعات.',
        vision: 'رؤيتنا',
        visionText: 'أن نكون مؤسسة تعليمية رائدة تعزز الابتكار والتميز في التعلم.',
        mission: 'رسالتنا',
        missionText: 'تقديم تعليم عالي الجودة ومتاح يحول الحياة ويبني مجتمعات أقوى.',
        values: 'قيمنا',
        valuesList: ['التميز', 'الابتكار', 'السهولة', 'المجتمع']
      },
      academy: {
        title: 'عن الأكاديمية',
        subtitle: 'التميز في التعليم',
        description: 'تقدم أكاديميتنا برامج تدريبية شاملة مصممة لتلبية الاحتياجات المتطورة للقوى العاملة الحديثة.',
        features: 'المميزات الرئيسية',
        featuresList: ['مدربون خبراء', 'مناهج حديثة', 'تعلم مرن', 'دعم مهني'],
        stats: 'تأثيرنا',
        statsList: [
          { number: '+1000', label: 'طالب مدرب' },
          { number: '+50', label: 'مدرب خبير' },
          { number: '95%', label: 'معدل النجاح' },
          { number: '24/7', label: 'دعم متاح' }
        ]
      }
    },
    jobs: {
      title: 'فرص التوظيف',
      subtitle: 'انضم إلى فريقنا وكن جزءاً من مهمتنا التعليمية',
      categories: {
        graphicDesigner: 'مصمم جرافيك',
        networkEngineer: 'مهندس شبكات',
        webDesigner: 'مصمم مواقع',
        digitalMarketer: 'مسوق إلكتروني'
      },
      jobDetails: {
        experience: 'الخبرة المطلوبة',
        level: 'مستوى الوظيفة',
        qualification: 'المؤهل',
        category: 'الفئة الوظيفية',
        apply: 'تقدم الآن',
        viewDetails: 'عرض التفاصيل'
      },
      loading: 'جاري تحميل الوظائف...',
      noJobs: 'لا توجد وظائف متاحة حالياً'
    },
    footer: {
      stayInformed: 'ابقَ على اطلاع',
      latest: '- أحدث الدورات، البرامج، والعروض',
      emailPlaceholder: 'بريدك الإلكتروني',
      subscribe: 'اشترك',
      description: 'أكاديمية الإبداع هي منصة تعليمية رائدة تهدف إلى تطوير المهارات وتعزيز القدرات من خلال برامج تدريبية متخصصة ومعتمدة.',
      rights: (year) => `© ${year} أكاديمية الإبداع. جميع الحقوق محفوظة.`,
    },
    pages: {
      about: { title: 'من نحن', content: 'محتوى عن الشركة ورؤيتها ورسالتها...' },
      team: { title: 'فريق العمل', content: 'تعرف على فريقنا...' },
      partners: { title: 'الشركاء', content: 'شركاؤنا الاستراتيجيون...' },
      jobs: { title: 'الوظائف', content: 'انضم إلينا...' },
      news: { title: 'الأخبار', content: 'آخر الأخبار...' },
      help: { title: 'مركز المساعدة', content: 'دليل الاستخدام والإرشادات...' },
      faq: { title: 'الأسئلة الشائعة', content: 'أسئلة متكررة...' },
      privacy: { title: 'سياسة الخصوصية', content: 'تفاصيل السياسة...' },
      terms: { title: 'شروط الاستخدام', content: 'الشروط والأحكام...' },
      certificates: { 
        title: 'الشهادات المعتمدة', 
        content: `
          <div class="space-y-8">
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-6 border">
              <h3 class="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">الشهادات المهنية</h3>
              <p class="text-blue-700 dark:text-blue-300 mb-4">شهاداتنا معترف بها دولياً وتساعدك على تطوير مسيرتك المهنية.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">تطوير الويب</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">شهادة تطوير الويب الشاملة تغطي HTML و CSS و JavaScript والأطر الحديثة.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">علوم البيانات</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">شهادة علوم البيانات الشاملة تشمل Python والتعلم الآلي والتحليلات.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">التسويق الرقمي</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">شهادة التسويق الرقمي المهنية تغطي SEO ووسائل التواصل الاجتماعي والتسويق بالمحتوى.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">إدارة المشاريع</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">شهادة إدارة المشاريع مع الأدوات العملية والمنهجيات.</p>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg p-6 border">
              <h3 class="text-xl font-bold mb-4 text-green-900 dark:text-green-100">مميزات الشهادات</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">معترف بها دولياً</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">شهادات مقبولة من أصحاب العمل في جميع أنحاء العالم</p>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">وصول مدى الحياة</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">الوصول إلى شهاداتك في أي وقت وأي مكان</p>
                </div>
                <div class="text-center">
                  <div class="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">قابلة للتحقق</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">نظام التحقق الرقمي لأصحاب العمل</p>
                </div>
              </div>
            </div>
            
            <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 rounded-lg p-6 border">
              <h3 class="text-xl font-bold mb-4 text-orange-900 dark:text-orange-100">كيفية الحصول على الشهادات</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">1</div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">إكمال متطلبات الدورة</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">إنهاء جميع الوحدات والواجبات والتقييمات في الدورة المختارة.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">2</div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">اجتياز التقييم النهائي</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">تحقيق الحد الأدنى المطلوب من النقاط في التقييم النهائي للدورة.</p>
                  </div>
                </div>
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">3</div>
                  <div>
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">تحميل الشهادة</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">الوصول إلى شهادتك وتحميلها من لوحة تحكم حسابك.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      },
      corporate: { title: 'التدريب المؤسسي', content: 'برامج للشركات...' },
      consulting: { title: 'الاستشارات التعليمية', content: 'خدماتنا الاستشارية...' },
      scholarships: { title: 'المنح الدراسية', content: 'منح وفرص...' },
      support: { title: 'الدعم الفني', content: 'قنوات الدعم...' },
      account: { title: 'حسابي', content: 'الملف الشخصي والأمان وإعدادات الحساب.' }
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'إدارة تفضيلات الموقع واللغة.',
      language: {
        title: 'اللغة',
        description: 'اختر لغة الواجهة المفضلة.',
        selectLabel: 'اختر اللغة',
        en: 'English',
        ar: 'العربية'
      },
      site: {
        title: 'تفضيلات الموقع',
        subtitle: 'اضبط سلوك الواجهة.',
        reduceMotionLabel: 'تقليل الحركة',
        reduceMotionDesc: 'تقليل الرسوم المتحركة وتأثيرات الحركة.',
        compactLayoutLabel: 'عرض مدمج',
        compactLayoutDesc: 'استخدام مسافات أكثر كثافة في القوائم والبطاقات.'
      },
      reset: 'إعادة الوضع الافتراضي'
    },
    branches: {
      title: 'فروع الأكاديمية',
      subtitle: 'ابحث عن أقرب فرع أو استخدم المرشحات للعثور على الفرع المناسب.',
      searchLabel: 'بحث',
      searchPlaceholder: 'اسم الفرع أو العنوان أو الجوال',
      governorateLabel: 'المحافظة',
      governoratePlaceholder: 'اختر المحافظة',
      cityLabel: 'المدينة',
      cityPlaceholder: 'اختر المدينة',
      refreshBtn: 'تحديث',
      resetBtn: 'إعادة تعيين',
      loading: 'جارٍ التحميل...',
      empty: 'لا توجد فروع مطابقة.',
      card: { mobile: 'جوال', phone: 'هاتف', whatsapp: 'واتساب', email: 'بريد' }
    },
    contact: {
      title: 'اتصل بنا',
      subtitle: 'يسعدنا تواصلك. يمكنك إرسال شكوى/ملاحظة مع مرفق، وسنتابع معك فوراً.',
      form: {
        branchLabel: 'الفرع',
        branchPlaceholder: 'اختر الفرع',
        typeLabel: 'نوع الشكوى',
        typePlaceholder: 'اختر النوع',
        descriptionLabel: 'الوصف',
        descriptionPlaceholder: 'صف المشكلة بالتفصيل...',
        fileLabel: 'المرفق (اختياري)',
        fileNote: 'PDF/صورة حتى 5MB.',
        studentIdLabel: 'معرف الطالب (اختياري)',
        studentIdPlaceholder: 'UUID',
        studentIdDesc: 'يساعدنا على تتبّع الشكوى بسرعة.',
        submit: 'إرسال',
        submitting: 'جارٍ الإرسال...'
      },
      status: { title: 'حالة الشكاوى', empty: 'لا تتوفر بيانات حالياً.' },
      info: { title: 'معلومات التواصل', supportEmailLabel: 'بريد الدعم', whatsappLabel: 'واتساب' }
    }
  }
};

const I18nContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, fallback) => fallback ?? key,
});

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') || 'en';
    } catch (_) {
      return 'en';
    }
  });

  useEffect(() => {
    try { localStorage.setItem('lang', lang); } catch (_) {}
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const html = document.documentElement;
    html.setAttribute('dir', dir);
    html.setAttribute('lang', lang);
  }, [lang]);

  const dict = translations[lang] || translations.en;

  const t = useMemo(() => {
    const getByPath = (obj, path) => path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
    return (key, fallback) => {
      const val = getByPath(dict, key);
      return typeof val === 'function' ? val(new Date().getFullYear()) : (val ?? fallback ?? key);
    };
  }, [dict]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext); 