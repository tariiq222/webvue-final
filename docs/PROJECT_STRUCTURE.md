# 🏗️ WebCore v2.0 - Project Structure

## 📋 نظرة عامة

هذا الملف يوضح الهيكل المنظم والشامل لمشروع WebCore v2.0، مع توضيح الغرض من كل مجلد وملف.

## 📁 الهيكل الكامل

```
WebCore/
├── 📁 new/                           # النظام الجديد المنظم
│   ├── 📄 README.md                  # توثيق المشروع الرئيسي
│   ├── 📄 PROJECT_STRUCTURE.md       # هذا الملف - شرح الهيكل
│   ├── 📄 package.json               # إعدادات المشروع الرئيسي
│   ├── 📄 .env                       # متغيرات البيئة
│   ├── 📄 .env.example               # مثال متغيرات البيئة
│   ├── 📄 .gitignore                 # ملفات Git المتجاهلة
│   ├── 📄 docker-compose.yml         # إعدادات Docker
│   │
│   ├── 📁 server/                    # الخادم الخلفي (Backend)
│   │   ├── 📄 package.json           # تبعيات الخادم
│   │   ├── 📄 .env                   # متغيرات بيئة الخادم
│   │   ├── 📄 Dockerfile             # إعدادات Docker للخادم
│   │   │
│   │   ├── 📁 prisma/                # إعدادات قاعدة البيانات
│   │   │   ├── 📄 schema.prisma      # مخطط قاعدة البيانات
│   │   │   ├── 📁 migrations/        # ملفات الترحيل
│   │   │   └── 📁 seeds/             # بيانات أولية
│   │   │
│   │   ├── 📁 src/                   # الكود المصدري
│   │   │   ├── 📄 app.js             # نقطة دخول التطبيق
│   │   │   ├── 📄 server.js          # إعداد الخادم
│   │   │   │
│   │   │   ├── 📁 config/            # إعدادات التطبيق
│   │   │   │   ├── 📄 database.js    # إعدادات قاعدة البيانات
│   │   │   │   ├── 📄 auth.js        # إعدادات المصادقة
│   │   │   │   ├── 📄 swagger.js     # إعدادات التوثيق
│   │   │   │   └── 📄 constants.js   # الثوابت
│   │   │   │
│   │   │   ├── 📁 database/          # إدارة قاعدة البيانات
│   │   │   │   ├── 📄 connection.js  # الاتصال بقاعدة البيانات
│   │   │   │   ├── 📄 migrations.js  # إدارة الترحيل
│   │   │   │   └── 📁 seeders/       # البيانات الأولية
│   │   │   │
│   │   │   ├── 📁 shared/            # المكونات المشتركة
│   │   │   │   ├── 📁 utils/         # الأدوات المساعدة
│   │   │   │   │   ├── 📄 logger.js  # نظام السجلات
│   │   │   │   │   ├── 📄 helpers.js # دوال مساعدة
│   │   │   │   │   ├── 📄 crypto.js  # التشفير
│   │   │   │   │   └── 📄 validators.js # التحقق من البيانات
│   │   │   │   │
│   │   │   │   ├── 📁 middleware/    # الوسطاء
│   │   │   │   │   ├── 📄 errorHandler.js # معالج الأخطاء
│   │   │   │   │   ├── 📄 requestLogger.js # مسجل الطلبات
│   │   │   │   │   ├── 📄 security.js # الأمان
│   │   │   │   │   ├── 📄 validation.js # التحقق
│   │   │   │   │   └── 📄 cors.js    # CORS
│   │   │   │   │
│   │   │   │   └── 📁 services/      # الخدمات المشتركة
│   │   │   │       ├── 📄 emailService.js # خدمة البريد
│   │   │   │       ├── 📄 fileService.js # خدمة الملفات
│   │   │   │       └── 📄 cacheService.js # خدمة التخزين المؤقت
│   │   │   │
│   │   │   ├── 📁 features/          # الميزات حسب المجال
│   │   │   │   ├── 📁 auth/          # نظام المصادقة
│   │   │   │   │   ├── 📁 controllers/ # تحكم المصادقة
│   │   │   │   │   │   ├── 📄 authController.js
│   │   │   │   │   │   └── 📄 twoFactorController.js
│   │   │   │   │   ├── 📁 services/   # خدمات المصادقة
│   │   │   │   │   │   ├── 📄 authService.js
│   │   │   │   │   │   ├── 📄 tokenService.js
│   │   │   │   │   │   └── 📄 passwordService.js
│   │   │   │   │   ├── 📁 middleware/ # وسطاء المصادقة
│   │   │   │   │   │   ├── 📄 authMiddleware.js
│   │   │   │   │   │   └── 📄 roleMiddleware.js
│   │   │   │   │   ├── 📁 validators/ # التحقق من البيانات
│   │   │   │   │   │   ├── 📄 loginValidator.js
│   │   │   │   │   │   └── 📄 registerValidator.js
│   │   │   │   │   └── 📄 routes.js   # مسارات المصادقة
│   │   │   │   │
│   │   │   │   ├── 📁 users/         # إدارة المستخدمين
│   │   │   │   │   ├── 📁 controllers/
│   │   │   │   │   │   ├── 📄 userController.js
│   │   │   │   │   │   └── 📄 profileController.js
│   │   │   │   │   ├── 📁 services/
│   │   │   │   │   │   ├── 📄 userService.js
│   │   │   │   │   │   └── 📄 profileService.js
│   │   │   │   │   ├── 📁 validators/
│   │   │   │   │   │   └── 📄 userValidator.js
│   │   │   │   │   └── 📄 routes.js
│   │   │   │   │
│   │   │   │   ├── 📁 roles/         # إدارة الأدوار
│   │   │   │   │   ├── 📁 controllers/
│   │   │   │   │   │   └── 📄 roleController.js
│   │   │   │   │   ├── 📁 services/
│   │   │   │   │   │   └── 📄 roleService.js
│   │   │   │   │   ├── 📁 validators/
│   │   │   │   │   │   └── 📄 roleValidator.js
│   │   │   │   │   └── 📄 routes.js
│   │   │   │   │
│   │   │   │   ├── 📁 plugins/       # نظام البلوجينز
│   │   │   │   │   ├── 📁 controllers/
│   │   │   │   │   │   ├── 📄 pluginController.js
│   │   │   │   │   │   └── 📄 uploadController.js
│   │   │   │   │   ├── 📁 services/
│   │   │   │   │   │   ├── 📄 pluginService.js
│   │   │   │   │   │   ├── 📄 sandboxService.js
│   │   │   │   │   │   └── 📄 securityService.js
│   │   │   │   │   ├── 📁 middleware/
│   │   │   │   │   │   └── 📄 pluginMiddleware.js
│   │   │   │   │   ├── 📁 validators/
│   │   │   │   │   │   └── 📄 pluginValidator.js
│   │   │   │   │   └── 📄 routes.js
│   │   │   │   │
│   │   │   │   ├── 📁 settings/      # إدارة الإعدادات
│   │   │   │   │   ├── 📁 controllers/
│   │   │   │   │   │   └── 📄 settingController.js
│   │   │   │   │   ├── 📁 services/
│   │   │   │   │   │   └── 📄 settingService.js
│   │   │   │   │   ├── 📁 validators/
│   │   │   │   │   │   └── 📄 settingValidator.js
│   │   │   │   │   └── 📄 routes.js
│   │   │   │   │
│   │   │   │   └── 📁 notifications/ # نظام الإشعارات
│   │   │   │       ├── 📁 controllers/
│   │   │   │       │   └── 📄 notificationController.js
│   │   │   │       ├── 📁 services/
│   │   │   │       │   ├── 📄 notificationService.js
│   │   │   │       │   └── 📄 pushService.js
│   │   │   │       ├── 📁 validators/
│   │   │   │       │   └── 📄 notificationValidator.js
│   │   │   │       └── 📄 routes.js
│   │   │   │
│   │   │   └── 📁 routes/            # مسارات API الرئيسية
│   │   │       ├── 📄 index.js       # مسارات رئيسية
│   │   │       ├── 📄 api.js         # مسارات API
│   │   │       └── 📄 health.js      # فحص الصحة
│   │   │
│   │   ├── 📁 tests/                 # الاختبارات
│   │   │   ├── 📁 unit/              # اختبارات الوحدة
│   │   │   ├── 📁 integration/       # اختبارات التكامل
│   │   │   ├── 📁 e2e/               # اختبارات شاملة
│   │   │   ├── 📁 fixtures/          # بيانات اختبار
│   │   │   └── 📄 setup.js           # إعداد الاختبارات
│   │   │
│   │   ├── 📁 storage/               # التخزين
│   │   │   ├── 📁 uploads/           # الملفات المرفوعة
│   │   │   ├── 📁 logs/              # ملفات السجلات
│   │   │   ├── 📁 temp/              # ملفات مؤقتة
│   │   │   └── 📁 backups/           # النسخ الاحتياطية
│   │   │
│   │   └── 📁 docs/                  # التوثيق
│   │       ├── 📄 API.md             # توثيق API
│   │       ├── 📄 DEPLOYMENT.md      # دليل النشر
│   │       └── 📄 DEVELOPMENT.md     # دليل التطوير
│   │
│   ├── 📁 client/                    # الواجهة الأمامية (Frontend)
│   │   ├── 📄 package.json           # تبعيات العميل
│   │   ├── 📄 vite.config.ts         # إعدادات Vite
│   │   ├── 📄 tsconfig.json          # إعدادات TypeScript
│   │   ├── 📄 tailwind.config.js     # إعدادات Tailwind
│   │   ├── 📄 Dockerfile             # إعدادات Docker للعميل
│   │   │
│   │   ├── 📁 public/                # الملفات العامة
│   │   │   ├── 📄 index.html         # الصفحة الرئيسية
│   │   │   ├── 📁 icons/             # الأيقونات
│   │   │   └── 📁 images/            # الصور
│   │   │
│   │   └── 📁 src/                   # الكود المصدري
│   │       ├── 📄 main.tsx           # نقطة دخول التطبيق
│   │       ├── 📄 App.tsx            # المكون الرئيسي
│   │       ├── 📄 index.css          # الأنماط الرئيسية
│   │       │
│   │       ├── 📁 components/        # المكونات
│   │       ├── 📁 pages/             # الصفحات
│   │       ├── 📁 hooks/             # React Hooks
│   │       ├── 📁 contexts/          # React Contexts
│   │       ├── 📁 services/          # خدمات API
│   │       ├── 📁 utils/             # الأدوات المساعدة
│   │       ├── 📁 types/             # أنواع TypeScript
│   │       └── 📁 assets/            # الموارد
│   │
│   ├── 📁 docs/                      # التوثيق العام
│   │   ├── 📄 README.md              # دليل المشروع
│   │   ├── 📄 INSTALLATION.md        # دليل التثبيت
│   │   ├── 📄 CONFIGURATION.md       # دليل الإعداد
│   │   └── 📄 CONTRIBUTING.md        # دليل المساهمة
│   │
│   ├── 📁 scripts/                   # سكريبتات المساعدة
│   │   ├── 📄 setup.sh               # إعداد المشروع
│   │   ├── 📄 deploy.sh              # نشر المشروع
│   │   └── 📄 backup.sh              # النسخ الاحتياطي
│   │
│   └── 📁 docker/                    # ملفات Docker
│       ├── 📄 Dockerfile.server      # Docker للخادم
│       ├── 📄 Dockerfile.client      # Docker للعميل
│       └── 📄 nginx.conf             # إعدادات Nginx
│
└── 📁 old/                           # النظام القديم (للمرجعية)
    └── ... (الملفات القديمة)
```

## 🎯 مبادئ التنظيم

### 1. **فصل الاهتمامات (Separation of Concerns)**
- كل ميزة في مجلد منفصل
- فصل المنطق عن العرض
- فصل الإعدادات عن الكود

### 2. **البنية المعيارية (Modular Architecture)**
- مكونات قابلة لإعادة الاستخدام
- خدمات مستقلة
- واجهات برمجة واضحة

### 3. **قابلية الصيانة (Maintainability)**
- أسماء واضحة ومفهومة
- توثيق شامل
- اختبارات شاملة

### 4. **الأمان (Security)**
- فصل الإعدادات الحساسة
- التحقق من البيانات
- مراقبة الأمان

## 📝 ملاحظات مهمة

1. **استخدم النظام الجديد فقط** - مجلد `new/`
2. **مجلد `old/` للمرجعية فقط** - لا تعدل عليه
3. **اتبع القوانين الذهبية** - حد أقصى 180 سطر لكل ملف
4. **التوثيق إجباري** - لكل ملف ودالة
5. **الاختبارات ضرورية** - تغطية 80%+
