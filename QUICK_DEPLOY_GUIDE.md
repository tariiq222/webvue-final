# ⚡ دليل النشر السريع على Render.com

## 🎯 **خطوات سريعة للنشر**

### 1. **إعداد GitHub Repository**
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial WebCore v2 deployment"

# إنشاء repository على GitHub ثم:
git remote add origin https://github.com/username/webcore-v2.git
git push -u origin main
```

### 2. **إنشاء حساب Render.com**
- اذهب إلى [render.com](https://render.com)
- سجل دخول بحساب GitHub
- اربط repository الخاص بك

### 3. **إنشاء قاعدة البيانات**
```
Render Dashboard → New → PostgreSQL
├── Name: webcore-db
├── Database: webcore  
├── User: webcore
├── Region: Oregon (أو Singapore)
└── Plan: Starter ($7/month)
```

### 4. **نشر Backend**
```
Render Dashboard → New → Web Service
├── Repository: webcore-v2
├── Name: webcore-backend
├── Root Directory: server
├── Environment: Node
├── Build Command: npm install && npm run build
├── Start Command: npm start
└── Plan: Starter ($7/month)
```

**متغيرات البيئة للـ Backend:**
```bash
NODE_ENV=production
DATABASE_URL=[Auto from database]
JWT_SECRET=[Generate 32 chars]
REFRESH_TOKEN_SECRET=[Generate 32 chars]
CORS_ORIGIN=https://webcore-frontend.onrender.com
```

### 5. **نشر Frontend**
```
Render Dashboard → New → Static Site
├── Repository: webcore-v2
├── Name: webcore-frontend
├── Root Directory: client
├── Build Command: npm install && npm run build
└── Publish Directory: dist
```

**متغيرات البيئة للـ Frontend:**
```bash
VITE_API_BASE_URL=https://webcore-backend.onrender.com
VITE_APP_NAME=WebCore Dashboard
```

### 6. **تشغيل Database Migrations**
```bash
# في Render Backend Console:
npm run deploy
```

## 🔗 **URLs النهائية**

بعد النشر ستحصل على:
- **Frontend**: `https://webcore-frontend.onrender.com`
- **Backend API**: `https://webcore-backend.onrender.com`
- **API Health**: `https://webcore-backend.onrender.com/api/health`

## 👤 **بيانات الدخول الافتراضية**

```
Email: admin@webcore.com
Password: admin123
```

⚠️ **مهم**: غيّر كلمة المرور بعد أول تسجيل دخول!

## 💰 **التكلفة الشهرية**

```
PostgreSQL Database: $7/month
Backend Web Service: $7/month
Frontend Static Site: Free
─────────────────────────────
Total: $14/month
```

## 🛠️ **استكشاف الأخطاء**

### مشكلة Database Connection:
```bash
# تحقق من DATABASE_URL في متغيرات البيئة
# تأكد من أن قاعدة البيانات تعمل
```

### مشكلة CORS:
```bash
# تأكد من CORS_ORIGIN يشير للـ Frontend URL الصحيح
CORS_ORIGIN=https://webcore-frontend.onrender.com
```

### مشكلة Build:
```bash
# تحقق من Build Logs في Render Dashboard
# تأكد من أن جميع dependencies موجودة
```

## 🚀 **بعد النشر**

1. **اختبر الـ API**: `https://webcore-backend.onrender.com/api/health`
2. **افتح Frontend**: `https://webcore-frontend.onrender.com`
3. **سجل دخول**: `admin@webcore.com` / `admin123`
4. **غيّر كلمة المرور**
5. **اختبر الميزات**

## 📞 **الدعم**

إذا واجهت مشاكل:
1. راجع [RENDER_DEPLOYMENT_GUIDE.md](./docs/RENDER_DEPLOYMENT_GUIDE.md)
2. تحقق من Render Logs
3. راجع متغيرات البيئة

**النتيجة**: WebCore v2 يعمل على Render.com! 🎉
