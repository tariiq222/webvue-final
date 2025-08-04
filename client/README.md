# 🎨 WebCore v2.0 - Frontend Client

## 📋 نظرة عامة

واجهة المستخدم الأمامية لنظام WebCore v2.0 مبنية بـ React 18 + TypeScript مع Tailwind CSS و Radix UI، توفر تجربة مستخدم عصرية ومتجاوبة مع دعم كامل للغة العربية.

## ✨ الميزات

- 🎨 **تصميم عصري** - Tailwind CSS + Radix UI
- 🌍 **دعم RTL** - دعم كامل للغة العربية
- 📱 **تصميم متجاوب** - يعمل على جميع الأجهزة
- 🔐 **مصادقة آمنة** - JWT + 2FA
- 🎯 **TypeScript** - نوع آمن ومطور-ودود
- ⚡ **أداء عالي** - Vite + React 18
- 🧪 **اختبارات شاملة** - Vitest + Testing Library

## 🏗️ هيكل المشروع

```
src/
├── features/           # الميزات حسب المجال
│   ├── auth/          # المصادقة وتسجيل الدخول
│   ├── users/         # إدارة المستخدمين
│   ├── roles/         # إدارة الأدوار
│   ├── plugins/       # إدارة البلوجينز
│   ├── settings/      # إعدادات النظام
│   ├── notifications/ # الإشعارات
│   └── dashboard/     # لوحة التحكم
├── shared/            # المكونات المشتركة
│   ├── components/    # مكونات UI قابلة للإعادة
│   │   └── ui/        # مكونات UI الأساسية
│   ├── hooks/         # React Hooks مخصصة
│   ├── services/      # خدمات API
│   ├── utils/         # دوال مساعدة
│   └── types/         # TypeScript types
├── app/               # إعدادات التطبيق
│   ├── config/        # إعدادات التطبيق
│   └── providers/     # React Providers
└── styles/            # ملفات التصميم العامة
```

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- npm 8+

### التثبيت والتشغيل

```bash
# تثبيت التبعيات
npm install

# تشغيل الخادم التطويري
npm run dev

# بناء للإنتاج
npm run build

# معاينة البناء
npm run preview
```

### الاختبارات

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع واجهة
npm run test:ui

# تشغيل اختبارات التغطية
npm run test:coverage
```

### فحص الكود

```bash
# فحص TypeScript
npm run type-check

# فحص ESLint
npm run lint

# إصلاح مشاكل ESLint
npm run lint:fix

# تنسيق الكود
npm run format
```

## 🎨 نظام التصميم

### الألوان
- **Primary**: Blue-600 (#2563eb)
- **Secondary**: Gray-600 (#4b5563)
- **Success**: Green-600 (#16a34a)
- **Warning**: Yellow-600 (#ca8a04)
- **Error**: Red-600 (#dc2626)

### الخطوط
- **العربية**: IBM Plex Sans Arabic
- **الإنجليزية**: Inter, system fonts

### المكونات
جميع مكونات UI مبنية على Radix UI مع تخصيص Tailwind CSS:
- Button, Input, Select
- Dialog, Dropdown, Tooltip
- Table, Card, Badge
- Navigation, Sidebar, Header

## 🌍 التدويل

### اللغات المدعومة
- العربية (ar) - RTL
- الإنجليزية (en) - LTR

### استخدام الترجمة
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <h1>{t('welcome.title')}</h1>
  );
}
```

## 🔧 التطوير

### إضافة ميزة جديدة

1. إنشاء مجلد في `src/features/`
2. إضافة المكونات والصفحات
3. إضافة خدمات API
4. إضافة الاختبارات
5. تحديث التوجيه

### إضافة مكون UI جديد

1. إنشاء المكون في `src/shared/components/ui/`
2. إضافة TypeScript types
3. إضافة Storybook story (إذا متوفر)
4. إضافة الاختبارات

### معايير الكود

- استخدم TypeScript للنوع الآمن
- اتبع ESLint rules
- اكتب اختبارات للمكونات الجديدة
- استخدم Prettier للتنسيق
- اتبع نمط Feature-based organization

## 📦 التبعيات الرئيسية

### Core
- React 18.3+
- TypeScript 5.6+
- Vite 5.4+

### UI & Styling
- Tailwind CSS 3.4+
- Radix UI Components
- Lucide React (Icons)
- IBM Plex Sans Arabic

### State & Data
- React Router DOM 7+
- React Hook Form
- Axios
- Zod (Validation)

### Development
- Vitest (Testing)
- ESLint + Prettier
- TypeScript ESLint

## 🚀 النشر

### بناء الإنتاج
```bash
npm run build
```

### متغيرات البيئة
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=WebCore
VITE_APP_VERSION=2.0.0
```

### Docker
```bash
# بناء الصورة
docker build -t webcore-client .

# تشغيل الحاوية
docker run -p 5173:5173 webcore-client
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

**WebCore v2.0 Frontend** - واجهة المستقبل 🚀
