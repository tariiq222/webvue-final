# 🚀 WebCore Server - Backend API

## 📋 نظرة عامة

خادم WebCore هو الجزء الخلفي من نظام إدارة المحتوى المتقدم، مبني بـ Node.js + Express + TypeScript مع قاعدة بيانات PostgreSQL وPrisma ORM.

## ✨ الميزات الرئيسية

- 🔐 **نظام مصادقة متقدم** - JWT + 2FA + RBAC
- 👥 **إدارة المستخدمين والأدوار** - نظام صلاحيات مرن ومتقدم
- 🔌 **نظام البلوجينز الآمن** - بيئة معزولة مع فحص أمني شامل
- ⚙️ **إدارة الإعدادات** - تخصيص شامل لجميع جوانب النظام
- 📢 **نظام الإشعارات** - إشعارات فورية داخل التطبيق
- 📊 **مراقبة وتدقيق** - سجلات شاملة ومقاييس أداء
- 🛡️ **أمان متعدد الطبقات** - حماية شاملة ضد التهديدات
- 📚 **توثيق تلقائي** - Swagger/OpenAPI documentation

## 🏗️ التقنيات المستخدمة

### Core Technologies
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Primary database

### Security & Authentication
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **Joi** - Input validation

### Development & Testing
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server

### Monitoring & Logging
- **Winston** - Logging library
- **Morgan** - HTTP request logger
- **Swagger** - API documentation

## 📁 هيكل المشروع

```
src/
├── config/                 # إعدادات التطبيق
│   └── environment.ts      # متغيرات البيئة
├── database/               # إدارة قاعدة البيانات
│   └── connection.ts       # اتصال قاعدة البيانات
├── features/               # الميزات حسب المجال
│   ├── auth/              # المصادقة والتفويض
│   ├── users/             # إدارة المستخدمين
│   ├── roles/             # إدارة الأدوار
│   ├── plugins/           # نظام البلوجينز
│   ├── settings/          # إعدادات النظام
│   └── notifications/     # نظام الإشعارات
├── shared/                # المكونات المشتركة
│   ├── middleware/        # Middleware functions
│   ├── utils/             # دوال مساعدة
│   ├── types/             # TypeScript types
│   └── routes/            # مسارات مشتركة
├── app.ts                 # إعداد التطبيق
└── server.ts              # نقطة دخول الخادم
```

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- PostgreSQL 14+
- npm 8+

### التثبيت السريع

```bash
# تشغيل سكريبت الإعداد التلقائي
chmod +x scripts/dev.sh
./scripts/dev.sh
```

### التثبيت اليدوي

```bash
# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.example .env

# تحرير متغيرات البيئة
nano .env

# إنشاء قاعدة البيانات
npm run db:migrate

# إضافة البيانات الأولية
npm run db:seed
```

### التشغيل

```bash
# تشغيل في وضع التطوير
npm run dev

# بناء المشروع
npm run build

# تشغيل في وضع الإنتاج
npm start
```

## 🧪 الاختبارات

```bash
# تشغيل جميع الاختبارات
npm test

# تشغيل اختبارات محددة
chmod +x scripts/test.sh
./scripts/test.sh unit          # اختبارات الوحدة
./scripts/test.sh integration   # اختبارات التكامل
./scripts/test.sh auth          # اختبارات المصادقة
./scripts/test.sh coverage      # اختبارات مع التغطية
./scripts/test.sh watch         # اختبارات مع المراقبة

# اختبارات يدوية
npm run test:watch              # مراقبة الاختبارات
npm run test:coverage           # تقرير التغطية
```

## 🔧 التطوير

### فحص الكود

```bash
# فحص الكود
npm run lint

# إصلاح مشاكل الكود
npm run lint:fix

# فحص الأنواع
npm run type-check
```

### قاعدة البيانات

```bash
# إنشاء migration جديد
npx prisma migrate dev --name migration_name

# تطبيق migrations في الإنتاج
npm run db:migrate:prod

# إعادة تعيين قاعدة البيانات
npm run db:reset

# فتح Prisma Studio
npm run db:studio
```

## 📚 API Documentation

بعد تشغيل الخادم، يمكن الوصول للتوثيق على:
- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs/json

## 🔐 المصادقة

### JWT Tokens
- **Access Token**: صالح لمدة 15 دقيقة
- **Refresh Token**: صالح لمدة 7 أيام
- **2FA Support**: دعم المصادقة الثنائية

### Headers المطلوبة
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 🛡️ الأمان

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### Rate Limiting
- عام: 1000 طلب كل 15 دقيقة
- المصادقة: 5 طلبات كل 15 دقيقة
- الرفع: 10 طلبات كل ساعة

## 📊 المراقبة

### Health Checks
- `/health` - فحص أساسي
- `/health/detailed` - فحص مفصل
- `/health/ready` - فحص الجاهزية
- `/health/live` - فحص الحيوية

### Logging
- **Development**: Console + File
- **Production**: File only
- **Levels**: error, warn, info, debug

## 🐳 Docker

```bash
# بناء الصورة
npm run docker:build

# تشغيل الحاوية
npm run docker:run
```

## 🔧 متغيرات البيئة

راجع ملف `.env.example` للحصول على قائمة كاملة بمتغيرات البيئة المطلوبة.

### المتغيرات الأساسية
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/webcore
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
```

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch للميزة (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](../LICENSE) للتفاصيل.

---

**WebCore Server** - قوة الخادم الخلفي 🚀
