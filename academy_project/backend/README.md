# Academy Backend - Local Version

تم تحويل هذا الـ Backend للعمل بشكل محلي بالكامل بدون الاعتماد على أي API خارجي.

## المميزات

- ✅ قاعدة بيانات SQLite محلية
- ✅ جميع الـ endpoints تعمل محلياً
- ✅ نظام مصادقة JWT
- ✅ بيانات تجريبية للاختبار
- ✅ لا يعتمد على أي API خارجي

## التثبيت والتشغيل

1. تثبيت الاعتماديات:
```bash
pip install -r requirements.txt
```

2. تشغيل الخادم:
```bash
python main.py
```
أو:
```bash
python start_backend.py
```

3. الخادم سيعمل على: `http://localhost:8000`

## حساب تجريبي للاختبار

- **البريد الإلكتروني**: `yjmt469999@gmail.com`
- **كلمة المرور**: `Vx9!pQ2@Lm#7wRz`

## الـ endpoints المتاحة

### المصادقة
- `POST /api/Account/login` - تسجيل الدخول
- `GET /api/Account/me` - بيانات المستخدم الحالي
- `POST /api/Account/register` - إنشاء حساب جديد
- `POST /api/Account/refresh-token` - تجديد التوكن

### الدورات
- `GET /courses` - جميع الدورات
- `GET /courses/{id}` - تفاصيل دورة
- `GET /course-masters` - فئات الدورات
- `GET /course-types` - أنواع الدورات

### البيانات الأساسية
- `GET /academy-data` - بيانات الأكاديمية
- `GET /branches` - الفروع
- `GET /countries` - الدول
- `GET /governorates` - المحافظات
- `GET /cities` - المدن

### المستخدمون
- `GET /students` - الطلاب
- `GET /teachers` - المعلمون

### الشكاوى
- `GET /complaints` - جميع الشكاوى
- `GET /complaint-types` - أنواع الشكاوى
- `GET /complaint-status` - حالات الشكاوى

### وغيرها الكثير...

## التكوين مع الواجهة الأمامية

تم تحديث الواجهة الأمامية لتعمل مع الخادم المحلي:
- تم تغيير الـ proxy في `vite.config.js` لي指向 `http://localhost:8000`
- تم تحديث إعدادات API في `api.js`

## قاعدة البيانات

تستخدم قاعدة بيانات SQLite باسم `academy.db` يتم إنشاؤها تلقائياً عند أول تشغيل.
