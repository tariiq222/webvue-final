# 🚀 دليل النشر على Render.com

## 📋 **نظرة عامة**

هذا الدليل يوضح كيفية نشر WebCore على Render.com مع قاعدة بيانات PostgreSQL مُدارة.

## 🎯 **ما سيتم نشره:**

```
Render.com Services:
├── 🗄️ PostgreSQL Database    ← قاعدة بيانات مُدارة
├── 🔧 Backend Web Service    ← Node.js + Express API
└── 🎨 Frontend Static Site   ← React + Vite
```

## 📦 **المتطلبات**

### 1. **حساب Render.com**
- إنشاء حساب مجاني على [render.com](https://render.com)
- ربط حساب GitHub

### 2. **رفع الكود على GitHub**
```bash
# إنشاء repository جديد
git init
git add .
git commit -m "Initial WebCore deployment"
git remote add origin https://github.com/username/webcore-v2.git
git push -u origin main
```

## 🗄️ **الخطوة 1: إنشاء قاعدة البيانات**

### في Render Dashboard:
1. **New** → **PostgreSQL**
2. **اسم قاعدة البيانات**: `webcore-db`
3. **Database Name**: `webcore`
4. **User**: `webcore`
5. **Region**: اختر الأقرب لك
6. **Plan**: Free (للتجربة) أو Starter ($7/شهر)

### معلومات الاتصال:
```bash
# ستحصل على:
DATABASE_URL=postgresql://webcore:password@hostname:5432/webcore
Internal Database URL=postgresql://webcore:password@internal-hostname:5432/webcore
```

## 🔧 **الخطوة 2: نشر Backend**

### في Render Dashboard:
1. **New** → **Web Service**
2. **Connect Repository**: اختر repository الخاص بك
3. **اسم الخدمة**: `webcore-backend`
4. **Root Directory**: `server`
5. **Environment**: `Node`
6. **Build Command**: `npm install && npm run build`
7. **Start Command**: `npm start`

### متغيرات البيئة:
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=[من قاعدة البيانات]
JWT_SECRET=your-super-secret-jwt-key-32-characters
REFRESH_TOKEN_SECRET=your-refresh-secret-32-characters
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

## 🎨 **الخطوة 3: نشر Frontend**

### في Render Dashboard:
1. **New** → **Static Site**
2. **Connect Repository**: نفس repository
3. **اسم الموقع**: `webcore-frontend`
4. **Root Directory**: `client`
5. **Build Command**: `npm install && npm run build`
6. **Publish Directory**: `dist`

### متغيرات البيئة:
```bash
VITE_API_BASE_URL=https://webcore-backend.onrender.com
VITE_APP_NAME=WebCore Dashboard
```

## ⚙️ **الخطوة 4: إعداد ملفات التكوين**

### 1. إنشاء render.yaml (اختياري)
```yaml
databases:
  - name: webcore-db
    databaseName: webcore
    user: webcore

services:
  - type: web
    name: webcore-backend
    env: node
    rootDir: server
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: webcore-db
          property: connectionString

  - type: web
    name: webcore-frontend
    env: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: dist
```

### 2. تحديث package.json في server
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc && npm run copy-assets && npm run db:generate",
    "postinstall": "npm run db:generate"
  }
}
```

### 3. إنشاء Dockerfile للـ Backend (اختياري)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 10000

CMD ["npm", "start"]
```

## 🔧 **الخطوة 5: إعداد Database Migrations**

### إضافة script للـ migrations:
```json
{
  "scripts": {
    "deploy": "npx prisma migrate deploy && npx prisma db seed"
  }
}
```

### إنشاء seed script:
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // إنشاء المستخدم الأول
  const admin = await prisma.user.create({
    data: {
      email: 'admin@webcore.com',
      password: 'hashed_password',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });

  console.log('Seed data created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 🌐 **الخطوة 6: تكوين CORS والأمان**

### تحديث CORS في Backend:
```typescript
// في server/src/config/cors.ts
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://webcore-frontend.onrender.com', // Frontend URL
  ],
  credentials: true,
};
```

## 📊 **الخطوة 7: مراقبة ولوجز**

### إعداد Logging:
```typescript
// في server/src/config/logger.ts
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    // Render يدعم console logs
  ],
});
```

## 🚀 **الخطوة 8: النشر**

### 1. Push الكود:
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### 2. في Render Dashboard:
- انتظر اكتمال البناء
- تحقق من اللوجز
- اختبر الـ endpoints

## 🔍 **الخطوة 9: الاختبار**

### URLs النهائية:
```bash
# Backend API
https://webcore-backend.onrender.com/api/health

# Frontend
https://webcore-frontend.onrender.com

# Database
postgresql://webcore:password@hostname:5432/webcore
```

## 💰 **التكلفة المتوقعة**

### الخطة المجانية:
- ✅ **Static Sites**: مجاني
- ✅ **Web Services**: 750 ساعة/شهر مجاني
- ❌ **PostgreSQL**: غير متوفر مجاني

### الخطة المدفوعة:
- 💵 **Web Service**: $7/شهر
- 💵 **PostgreSQL**: $7/شهر
- 💵 **المجموع**: ~$14/شهر

## 🛠️ **نصائح للنشر الناجح**

### 1. **متغيرات البيئة**
- استخدم أسرار قوية للـ JWT
- لا تضع أسرار في الكود

### 2. **الأداء**
- فعّل compression
- استخدم CDN للملفات الثابتة

### 3. **الأمان**
- فعّل HTTPS
- استخدم environment variables

### 4. **المراقبة**
- راقب اللوجز
- اعد إنذارات للأخطاء

## 🎯 **الخطوات التالية**

1. **إنشاء حساب Render**
2. **رفع الكود على GitHub**
3. **إنشاء قاعدة البيانات**
4. **نشر Backend**
5. **نشر Frontend**
6. **اختبار التطبيق**

**النتيجة**: تطبيق WebCore كامل يعمل على Render.com! 🚀
