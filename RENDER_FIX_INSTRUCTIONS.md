# 🔧 إصلاح مشكلة Prisma في Render

## 🚨 **المشكلة:**
```
sh: 1: prisma: not found
==> Build failed 😞
```

## ✅ **الحل المطبق:**

### 1. **تم إصلاح package.json:**
- ✅ نقل `ts-node` و `typescript` إلى `dependencies`
- ✅ تغيير build script إلى `npx prisma generate`
- ✅ إصلاح postinstall script
- ✅ إصلاح deploy script

### 2. **إعدادات Render الصحيحة:**

#### **في Render Dashboard:**
```
Name: webcore-backend
Repository: tariiq222/webvue-final
Branch: main
Root Directory: server  ← مهم جداً!
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

#### **متغيرات البيئة:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://webcore:t4khDuHmTsr2XVijnweCUo84Pf4nTV3u@dpg-d28efof5r7bs738stk0g-a/webcore
JWT_SECRET=your-32-character-secret-key-here-123456
REFRESH_TOKEN_SECRET=your-32-character-refresh-secret-123456
CORS_ORIGIN=https://webcore-frontend.onrender.com
BCRYPT_ROUNDS=12
LOG_LEVEL=info
COMPRESSION_ENABLED=true
HELMET_ENABLED=true
CSP_ENABLED=true
```

### 3. **بعد النشر:**
```bash
# في Render Console (Shell):
npm run deploy
```

## 🔄 **إعادة النشر:**

### الطريقة 1: Manual Deploy
1. اذهب إلى Render Dashboard
2. اختر webcore-backend service
3. اضغط "Manual Deploy"
4. اختر "Deploy latest commit"

### الطريقة 2: Git Push
```bash
# في مجلد المشروع المحلي
git add .
git commit -m "Fix Prisma build issue for Render deployment"
git push origin main
```

## 🧪 **اختبار النشر:**

### بعد نجاح النشر:
```bash
# اختبر Health Check
curl https://webcore-backend.onrender.com/api/health

# اختبر API Documentation
https://webcore-backend.onrender.com/api-docs
```

## 📋 **Troubleshooting:**

### إذا استمرت المشكلة:
1. **تحقق من Root Directory**: يجب أن يكون `server`
2. **تحقق من Build Command**: `npm install && npm run build`
3. **تحقق من Start Command**: `npm start`
4. **تحقق من متغيرات البيئة**: خاصة DATABASE_URL

### إذا فشل Database Migration:
```bash
# في Render Console:
npx prisma migrate deploy
npx ts-node prisma/seeds/index.ts
```

## ✅ **النتيجة المتوقعة:**

بعد الإصلاح:
```
✅ Build successful
✅ Prisma Client generated
✅ TypeScript compiled
✅ Server started
✅ Database connected
✅ API endpoints available
```

## 🔗 **URLs بعد النشر:**
- **API**: https://webcore-backend.onrender.com
- **Health**: https://webcore-backend.onrender.com/api/health
- **Docs**: https://webcore-backend.onrender.com/api-docs

**الآن جرب إعادة النشر!** 🚀
