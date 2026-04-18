# خريطة تفصيلية شاملة لمشروع الأكاديمية

> هذا المستند يغطي **كل ما يتعلق بواجهة المستخدم والواجهة الخلفية** داخل المستودع، مع التركيز على دور كل ملف/مجلد، ومسارات التطبيق، والمكوّنات المشتركة، وآليات الصلاحيات، وأي ملاحظات تشغيلية. الهدف هو أن يتمكن أي عضو جديد من فهم المشروع بالكامل دون الرجوع إلى مصادر إضافية.

---

## 1. نظرة عامة على بنية المستودع

| المسار | الوصف المختصر |
|--------|----------------|
| `frontend/academy-frontend/` | تطبيق React مبني بواسطة Vite. |
| `backend/` | واجهة برمجة REST (FastAPI/Starlette). |
| `run_the_web.md` | تعليمات تشغيل سريعة للمشروع. |

---

## 2. الواجهة الأمامية (frontend/academy-frontend)

### 2.1 ملفات البنية والتشغيل

| الملف/المجلد | الدور |
|--------------|-------|
| `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `npm/` | إدارة الحزم والأوامر (npm/pnpm). |
| `vite.config.js` | إعدادات Vite + alias `@` → `src`. |
| `components.json` | سجل مكونات Shadcn UI المستوردة. |
| `eslint.config.js` | قواعد اللنتينغ. |
| `index.html` | القالب الأساسي الذي يحقن فيه Vite التطبيق. |
| `src/main.jsx` | نقطة تشغيل React، تركيب `<App />`. |
| `src/App.jsx` | ملف التوجيه الرئيسي وإعداد تخطيط التطبيق. |
| `src/App.css`, `src/index.css` | الأنماط العامة وإعدادات الثيم. |

### 2.2 الهياكل المشتركة

- **Header / Footer / FloatingAssistant**: تظهر في كل الصفحات، تدعم العربية/الإنجليزية، وتقرأ بيانات المستخدم من التخزين المحلي.
- **ProtectedRoute.jsx**: يحمي المسارات الحساسة بإعادة التوجيه إلى `/login` عند غياب التوكن أو الصلاحية.
- **useI18n** (`src/lib/i18n.jsx`): نظام الترجمة مع دعم RTL.

---

## 3. خريطة المسارات (Routes) بالتفصيل

> جميع المكوّنات مذكورة مع موقعها الفعلي. الصفحات داخل `src/app/pages` تُشير إلى ملفات خاصة إن وجدت.

### 3.1 صفحات عامة (لا تتطلب تسجيل دخول)

| المسار | المكوّنات | الوصف |
|--------|-----------|--------|
| `/` | `Hero`, `StatsBar`, `Features`, `CoursesSection`, `CTASection` | الصفحة الرئيسية التعريفية. |
| `/about` | `AboutPage.jsx` | نبذة تفصيلية عن الأكاديمية. |
| `/jobs` | `JobsPage.jsx` | عروض وفرص العمل. |
| `/personal-skills` | `PersonalSkillsProgram.jsx` | برنامج المهارات الشخصية. |
| `/catalog` | `CatalogPage.jsx` | كتالوج متعدد التبويبات للمشاريع/البرامج/الدورات. |
| `/search` | `SearchPage.jsx` | بحث موحّد في المحتوى. |
| `/corporate-training` | `StaticPage.jsx` | محتوى ثابت مترجم عن تدريب الشركات. |
| `/edu-consulting` | `StaticPage.jsx` | استشارات تعليمية. |
| `/scholarships` | `StaticPage.jsx` | معلومات المنح. |
| `/support` | `StaticPage.jsx` | الدعم والخدمات. |
| `/certificates` | `CertificatesPage.jsx` | عرض/تحميل الشهادات. |
| `/contact` | `ContactPage.jsx` | نماذج وروابط التواصل. |
| `/branches` | `BranchesPage.jsx` | عرض فروع الأكاديمية. |
| `/admin-dashboard` | `AdminDashboard.jsx` | لوحة معلومات مختصرة (تستخدم داخل صفحات أخرى). |

### 3.2 المصادقة والحسابات

| المسار | المكوّن | الملاحظات |
|--------|---------|-----------|
| `/register` | `RegisterPage.jsx` | استخدام `react-hook-form` + `zod`، إنشاء سجل طالب تلقائي. |
| `/login` | `LoginPage.jsx` | تسجيل الدخول وإدارة التوكن. |
| `/forgot` | `ForgotPasswordPage.jsx` | استرجاع كلمة المرور. |
| `/account` | `AccountPage.jsx` | لوحة مستخدم متقدمة (بيانات، صور، روابط، إحصاءات). |
| `/profile` | `ProfilePage.jsx` | عرض الملف الشخصي العام. |
| `/settings` | `SettingsPage.jsx` | إعدادات اللغة/الإشعارات. |

### 3.3 المحتوى الأكاديمي *(ProtectedRoute)*

| المسار | الموقع | الوظيفة |
|--------|--------|----------|
| `/projects-master` | `ProjectMasterPage.jsx` | إدارة المشاريع الرئيسية. |
| `/projects-master/edit/:projectId` | `ProjectMasterPage.jsx` | تعديل مشروع محدد. |
| `/projects-details` | `ProjectDetailsPage.jsx` | إدارة تفاصيل المشاريع. |
| `/project-details/:projectId` | `src/app/pages/project-details-page/ProjectDetailsViewPage.jsx` | عرض مشروع محدد. |
| `/programs-details` | `ProgramDetailsPage.jsx` | إدارة تفاصيل البرامج. |
| `/program-details/:programId` | `src/app/pages/program-details-page/ProgramDetailsViewPage.jsx` | عرض برنامج محدد. |
| `/sessions` | `SessionsPage.jsx` | إدارة جلسات التدريب. |
| `/videos` | `src/app/pages/video-gallery/VideoGalleryPage.jsx` | معرض فيديوهات الجلسات. |
| `/videos/:id` | `src/app/pages/video-gallery/VideoViewPage.jsx` | عرض فيديو مفرد. |
| `/content-upload` | `src/app/pages/content-upload/ContentUploadPage.jsx` | رفع محتوى (محاضرات/ملفات). |

### 3.4 الطلاب *(ProtectedRoute)*

| المسار | المكوّن | الوصف |
|--------|---------|--------|
| `/students` | `StudentsPage.jsx` | قائمة وإحصاءات الطلاب. |
| `/students/data` | `StudentDataEntryPage.jsx` | إدخال/تعديل بيانات الطلاب. |
| `/students/attendance` | `StudentAttendancePage.jsx` | إدارة الحضور. |
| `/students/evaluations` | `StudentEvaluationsPage.jsx` | تقييم الطلاب. |

### 3.5 المدربون *(ProtectedRoute)*

| المسار | المكوّن | الوصف |
|--------|---------|--------|
| `/trainers` | `TrainersPage.jsx` | لوحة إدارة المدربين. |
| `/trainers/edit` | `TrainerEditPage.jsx` | تعديل بيانات مدرب. |
| `/trainer/:trainerId` | `TrainerDetailPage.jsx` | عرض مدرب محدد. |
| `/trainers/soft-skills` | `TrainersCategoryPage.jsx` | عرض مدربين مهارات شخصية. |
| `/trainers/technical` | `TrainersCategoryPage.jsx` | مدربون تقنيون. |
| `/trainers/freelancer` | `TrainersCategoryPage.jsx` | مدربو العمل الحر. |
| `/trainers/english` | `TrainersCategoryPage.jsx` | مدربون لغة إنجليزية. |

### 3.6 التقييم، الشكاوى، الإدارة *(ProtectedRoute)*

| المسار | المكوّن | الوصف |
|--------|---------|--------|
| `/evaluations` | `EvaluationsPage.jsx` | إدارة تقييمات الدورات. |
| `/complaints` | `src/app/pages/complaints-page/ComplaintsPage.jsx` | نظام الشكاوى الكامل. |
| `/admin` | `AdminPage.jsx` | لوحة إدارة شاملة (طلاب، معلمون، فروع، مشاريع، برامج، دورات، شكاوى). |
| `/course-management` | `CourseManagement.jsx` | إدارة الدورات كمكوّن مساعد. |
| `/projects` | `Projects.jsx` | عرض المشاريع بشكل كروت. |

### 3.7 مسارات ومجلدات إضافية

- `src/app/pages/{account-page, branches-page, catalog-page, contact-page, home, login-page, register-page, settings-page, static-page}/`: مجلدات جاهزة لتصدير صفحات بنمط Next.js مستقبلاً (قد تكون فارغة حالياً).
- Catch-all `*`: يعرض الصفحة الرئيسية كمسار بديل.

---

## 4. المكوّنات في `src/components/`

| الملف | الدور |
|-------|-------|
| `AboutPage.jsx` | المعلومات العامة عن الأكاديمية. |
| `AccountPage.jsx` | إدارة الحساب والبيانات، التكامل مع API لحفظ التغييرات. |
| `AdminDashboard.jsx` | لوحة مختصر نتائج. |
| `AdminPage.jsx` | لوحة إدارة متكاملة بكل التبويبات والخدمات. |
| `BranchesPage.jsx` | عرض فروع الأكاديمية. |
| `CatalogPage.jsx` | كتالوج تفاعلي مع تبويبات وإضافة عناصر (للمشرف). |
| `CatalogTest.jsx` | نسخة تجريبية للكاتالوج. |
| `CertificatesPage.jsx` | إدارة الشهادات. |
| `ContactPage.jsx` | صفحة التواصل. |
| `CourseCard.jsx` | بطاقة دورة. |
| `CourseManagement.jsx` | إنشاء/تعديل الدورات. |
| `CoursesSection.jsx` | جزء من الصفحة الرئيسية. |
| `CTASection.jsx` | دعوة للتسجيل/التصفح. |
| `EvaluationsPage.jsx` | إدارة التقييمات. |
| `Features.jsx` | عرض المزايا. |
| `FloatingAssistant.jsx` | مساعد تفاعلي فوقي. |
| `Footer.jsx` | تذييل الموقع. |
| `ForgotPasswordPage.jsx` | استرجاع كلمة المرور. |
| `Header.jsx` | شريط التنقل مع دعم التبديل اللغوي. |
| `Hero.jsx` | المقدمة البصرية للصفحة الرئيسية. |
| `JobsPage.jsx` | عروض العمل. |
| `LoginPage.jsx` | تسجيل الدخول. |
| `Newsletter.jsx` | الاشتراك في النشرة البريدية. |
| `PersonalSkillsProgram.jsx` | برنامج المهارات الشخصية. |
| `ProfilePage.jsx` | عرض الملف الشخصي العام. |
| `ProgramDetailsPage.jsx` | إدارة تفاصيل البرامج. |
| `ProjectDetailsPage.jsx` | إدارة تفاصيل المشاريع. |
| `ProjectMasterPage.jsx` | إدارة المشاريع الرئيسية. |
| `Projects.jsx` | عرض مشاريع بواجهة عامة. |
| `ProtectedRoute.jsx` | حماية المسارات. |
| `RegisterPage.jsx` | تسجيل المستخدمين. |
| `SearchPage.jsx` | واجهة البحث. |
| `SessionsPage.jsx` | جلسات التدريب. |
| `SettingsPage.jsx` | إعدادات المستخدم. |
| `StaticPage.jsx` | صفحات ذات محتوى ثابت متعدد اللغات. |
| `StatsBar.jsx` | شريط الإحصاءات. |
| `StudentAttendancePage.jsx` | حضور الطلاب. |
| `StudentDataEntryPage.jsx` | إدخال بيانات الطلاب. |
| `StudentEvaluationsPage.jsx` | تقييم الطلاب. |
| `StudentsPage.jsx` | قائمة الطلاب. |
| `TrainerDetailPage.jsx` | عرض مدرب واحد. |
| `TrainerEditPage.jsx` | تعديل بيانات المدرب. |
| `TrainersCategoryPage.jsx` | تصنيف المدربين. |
| `TrainersPage.jsx` | لوحة إدارة المدربين. |

### 4.1 مكتبة Shadcn UI (`src/components/ui/…`)

> تحتوي على جميع المكونات الأساسية مثل: `accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`. جميعها مغلفة لتتلاءم مع التصميم المعتمد.

---

## 5. مجلد `src/app/`

| المسار | المحتوى |
|--------|---------|
| `app/components/...` | إصدارات مجزأة من المكونات (courses-section, hero, …) للاستخدام مع بنية الصفحات المبنية على المجلدات. |
| `app/pages/complaints-page/` | `ComplaintsPage.jsx` + `page.jsx` لتصدير الصفحة. |
| `app/pages/content-upload/` | `ContentUploadPage.jsx`. |
| `app/pages/program-details-page/` | `ProgramDetailsViewPage.jsx`. |
| `app/pages/project-details-page/` | `ProjectDetailsViewPage.jsx`. |
| `app/pages/video-gallery/` | `VideoGalleryPage.jsx`, `VideoViewPage.jsx`. |
| `app/services/` | جاهز لتعريف خدمات خاصة بالصفحات (فارغ حالياً). |

---

## 6. الخدمات والمكتبات

| الملف | الوظيفة |
|-------|---------|
| `src/services/api.js` | جميع استدعاءات REST (مصادقة، مشاريع، برامج، طلاب، معلمين، فروع، شكاوى، فيديوهات، ملفات). |
| `src/services/geminiApi.js` | تكامل مع Gemini API لاستخدامات الذكاء الاصطناعي (المساعد العائم). |
| `src/lib/i18n.jsx` | نظام الترجمة + hook `useI18n`. |
| `src/lib/arabGeo.js` | بيانات الدول/المحافظات/المدن. |
| `src/lib/utils.js` | دوال مساعدة (تنسيق، توليد معرّفات، معالجة النصوص). |
| `src/hooks/use-mobile.js` | كاشف حجم الشاشة (مفيد للت responsive). |

---

## 7. الأصول (Assets)

| المسار | الوصف |
|--------|-------|
| `src/assets/academy_logo.png` | شعار الأكاديمية. |
| `src/assets/course_placeholder.png` | صورة افتراضية للدورات. |
| `src/assets/hero_image.png` | صورة قسم المقدمة. |
| `src/assets/program_placeholder.png` | صورة افتراضية للبرامج. |
| `src/assets/pشrogram_placeholder.png` | نسخة باسم يحتوي حرف عربي؛ يفضّل إعادة تسميته لتجنّب مشاكل المنصات. |
| `src/assets/react.svg` | شعار React الافتراضي. |
| `src/assets/New folder/` | مجلد أصول إضافية (يُنصح بمراجعته وتنظيفه عند الإنتاج). |
| `public/favicon.ico` | أيقونة المتصفح. |

---

## 8. ملاحظات حول البيانات والصلاحيات

- يتم حفظ `authToken`, `userData`, `studentData`, `userSocialMedia` في `localStorage`، وتُقرأ في `Header`, `Hero`, `AccountPage`, `AdminPage`, `TrainersPage`, `ComplaintsPage`, `ProjectMasterPage`، وغيرها.
- الصلاحيات تعتمد على `role` أو البريد الإلكتروني (مثل السماح للإيميل `yjmt469999@gmail.com` بالدخول الإداري).
- `ProtectedRoute` يضمن إعادة التوجيه إلى `/login` عند غياب الصلاحيات.
- معظم الصفحات الإدارية تعرض رسائل باستخدام `sonner` (التوست)، وتستخدم `framer-motion` للحركة.
- عند فشل تحميل البيانات من الـ API يتم استخدام بيانات افتراضية (`defaultProjects`, `defaultCourses`, …) للحفاظ على تجربة المستخدم.

---

## 9. الواجهة الخلفية (backend/)

| الملف | الدور |
|-------|-------|
| `main.py` | نقطة الدخول لتطبيق FastAPI (يحتوي تعريف المسارات/خدمات REST). |
| `start_backend.py` | سكربت تشغيل/تمهيد (قد يستخدم لإعدادات خاصة قبل التشغيل). |
| `requirements.txt` | الحزم المطلوبة (FastAPI, Uvicorn, SQLAlchemy, ...). |
| `Procfile` | تعريف أمر التشغيل عند النشر (Heroku/Render). |
| `__pycache__/` | مجلد compiled python (يتجاهل). |
| `python` | قد يحتوي ملفات إضافية/مجلد بيئة (يُنصح بمراجعته). |

> ملاحظة: تفاصيل API الفعلية غير معروضة هنا، لكن جميع الاستدعاءات موثّقة في `src/services/api.js`.

---

## 10. تعليمات عامة وتشغيل

- **تشغيل الواجهة الأمامية:**  
  ```
  cd frontend/academy-frontend
  npm install
  npm run dev
  ```
- **تشغيل الواجهة الخلفية:**  
  ```
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload
  ```
- **الدليل السريع:** راجع `run_the_web.md` لأي ملاحظات إضافية.

---

## 11. توصيات الصيانة والتطوير

- تحديث هذا المستند مع أي تغيير في المسارات أو الملفات.
- مراجعة الأصول ذات الأسماء غير القياسية (`pشrogram_placeholder.png`).
- استكمال المجلدات الجاهزة في `app/pages` عند الانتقال لبنية تعتمد صفحات مجلدية.
- التأكد من التزامن بين الصلاحيات في الواجهة الأمامية والباك إند.
- اختبار استدعاءات `api.js` بشكل دوري خصوصاً مع تغيّر مخططات الواجهة الخلفية.

---

> **الخلاصة:** هذه الخريطة تسجّل كل الملفات والمسارات والمكوّنات والخدمات في مشروع الأكاديمية، مما يجعلها مرجعاً موحّدًا لأي تحسينات أو انضمام أعضاء جدد إلى الفريق.

