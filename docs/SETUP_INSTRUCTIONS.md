# 🚀 إعداد المشروع - Frontend و Backend منفصلين

## 📁 **الهيكل النهائي**

```
webcore-v2/
├── client/
│   ├── node_modules/          ← تبعيات Frontend فقط
│   ├── package.json
│   └── src/
├── server/
│   ├── node_modules/          ← تبعيات Backend فقط
│   ├── package.json
│   └── src/
├── package.json               ← إدارة فقط (بدون node_modules)
└── docker-compose.yml
```

## ⚡ **التثبيت**

### الطريقة 1: تثبيت منفصل (موصى به)

```bash
# Frontend
cd client
npm install

# Backend  
cd ../server
npm install
```

### الطريقة 2: تثبيت من الجذر

```bash
# تثبيت concurrently عالمياً (مرة واحدة فقط)
npm install -g concurrently

# تثبيت كل شيء
npm run install-all
```

## 🚀 **التشغيل**

### تشغيل منفصل

```bash
# Frontend (Terminal 1)
cd client
npm run dev
# يعمل على: http://localhost:5173

# Backend (Terminal 2)
cd server
npm run dev
# يعمل على: http://localhost:3000
```

### تشغيل متزامن

```bash
# تأكد من تثبيت concurrently عالمياً أولاً
npm install -g concurrently

# تشغيل Frontend + Backend معاً
npm run dev
```

## 🏗️ **البناء للإنتاج**

```bash
# بناء منفصل
cd server && npm run build
cd ../client && npm run build

# أو من الجذر
npm run build
```

## 🧪 **الاختبارات**

```bash
# اختبار منفصل
cd server && npm test
cd ../client && npm test

# أو من الجذر
npm run test
```

## 🐳 **Docker**

```bash
# بناء الحاويات
npm run docker:build

# تشغيل
npm run docker:up

# إيقاف
npm run docker:down
```

## 📋 **السكربتات المتاحة**

### من الجذر:
- `npm run client-install` - تثبيت تبعيات Frontend
- `npm run server-install` - تثبيت تبعيات Backend  
- `npm run install-all` - تثبيت كل شيء
- `npm run dev` - تشغيل Frontend + Backend
- `npm run build` - بناء Frontend + Backend
- `npm run test` - اختبار Frontend + Backend

### Frontend (client/):
- `npm run dev` - تشغيل التطوير
- `npm run build` - بناء للإنتاج
- `npm run preview` - معاينة البناء
- `npm test` - اختبارات

### Backend (server/):
- `npm run dev` - تشغيل التطوير
- `npm start` - تشغيل الإنتاج
- `npm run build` - بناء TypeScript
- `npm test` - اختبارات

## ✅ **المزايا**

- 🔥 **فصل كامل** بين Frontend و Backend
- 📦 **لا تضارب** في التبعيات
- 🚀 **أداء أفضل** - كل مشروع مستقل
- 🐳 **Docker friendly** - بناء منفصل
- 🔧 **سهولة الصيانة** - تحديث مستقل
- 📈 **قابلية التوسع** - نشر منفصل

## 🎯 **الاستخدام اليومي**

```bash
# للتطوير السريع
cd client && npm run dev    # Terminal 1
cd server && npm run dev    # Terminal 2

# للاختبار الشامل  
npm run test

# للبناء النهائي
npm run build
```
