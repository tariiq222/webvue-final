# 🌿 Git Workflow Guide - WebCore v2

## 📋 **نظرة عامة على الفروع**

```
🌳 Git Branch Structure:
├── main          ← 🏆 الكود المستقر (آخر إصدار مُختبر)
├── development   ← 🔧 التطوير النشط (آخر الميزات)
├── testing       ← 🧪 اختبار الميزات الجديدة
├── staging       ← 🎭 بيئة ما قبل الإنتاج
└── production    ← 🚀 الإنتاج الفعلي (مطابق للـ main)
```

## 🎯 **استراتيجية Git Flow**

### 📊 **وصف الفروع:**

#### 🏆 **main**
- **الغرض**: الكود المستقر والمُختبر
- **الحماية**: يتطلب Pull Request + مراجعة
- **النشر**: لا ينشر مباشرة
- **التحديث**: من staging بعد الاختبار الكامل

#### 🔧 **development**
- **الغرض**: التطوير النشط والميزات الجديدة
- **الحماية**: مفتوح للـ push المباشر للمطورين
- **النشر**: Render Dev Environment
- **URL**: `webcore-dev.onrender.com`

#### 🧪 **testing**
- **الغرض**: اختبار الميزات قبل staging
- **الحماية**: يتطلب Pull Request
- **النشر**: Render Test Environment
- **URL**: `webcore-test.onrender.com`

#### 🎭 **staging**
- **الغرض**: بيئة ما قبل الإنتاج
- **الحماية**: يتطلب Pull Request + مراجعة
- **النشر**: Render Staging Environment
- **URL**: `webcore-staging.onrender.com`

#### 🚀 **production**
- **الغرض**: الإنتاج الفعلي
- **الحماية**: يتطلب Pull Request + مراجعة + status checks
- **النشر**: Render Production Environment
- **URL**: `webcore.onrender.com`

## 🔄 **سير العمل (Workflow)**

### 1. **التطوير اليومي**
```bash
# البدء بميزة جديدة
git checkout development
git pull origin development

# إنشاء فرع للميزة (اختياري)
git checkout -b feature/user-management
# ... تطوير الميزة
git add .
git commit -m "Add user management feature"

# دمج في development
git checkout development
git merge feature/user-management
git push origin development

# حذف فرع الميزة
git branch -d feature/user-management
```

### 2. **الانتقال للاختبار**
```bash
# دمج development في testing
git checkout testing
git pull origin testing
git merge development
git push origin testing

# أو استخدام Pull Request (مُفضل)
# GitHub → New Pull Request: development → testing
```

### 3. **الانتقال لـ Staging**
```bash
# بعد نجاح الاختبارات في testing
git checkout staging
git pull origin staging
git merge testing
git push origin staging
```

### 4. **النشر للإنتاج**
```bash
# بعد التأكد من staging
git checkout main
git pull origin main
git merge staging
git push origin main

# ثم نشر للإنتاج
git checkout production
git pull origin production
git merge main
git push origin production
```

## 🛡️ **قواعد الحماية**

### GitHub Branch Protection Rules:

#### **main Branch:**
```yaml
Protection Rules:
  - Require pull request reviews: ✅
  - Required reviewers: 2
  - Dismiss stale reviews: ✅
  - Require status checks: ✅
  - Require up-to-date branches: ✅
  - Include administrators: ✅
```

#### **production Branch:**
```yaml
Protection Rules:
  - Require pull request reviews: ✅
  - Required reviewers: 2
  - Dismiss stale reviews: ✅
  - Require status checks: ✅
  - Require up-to-date branches: ✅
  - Include administrators: ✅
  - Require deployment approval: ✅
```

#### **staging Branch:**
```yaml
Protection Rules:
  - Require pull request reviews: ✅
  - Required reviewers: 1
  - Require status checks: ✅
```

#### **testing Branch:**
```yaml
Protection Rules:
  - Require pull request reviews: ✅
  - Required reviewers: 1
```

## 🚀 **إعداد Render.com للفروع**

### Development Environment:
```yaml
Service: webcore-dev-backend
Branch: development
URL: webcore-dev.onrender.com
Database: webcore-dev-db
Auto-Deploy: ✅
```

### Testing Environment:
```yaml
Service: webcore-test-backend
Branch: testing
URL: webcore-test.onrender.com
Database: webcore-test-db
Auto-Deploy: ✅
```

### Staging Environment:
```yaml
Service: webcore-staging-backend
Branch: staging
URL: webcore-staging.onrender.com
Database: webcore-staging-db
Auto-Deploy: ✅
```

### Production Environment:
```yaml
Service: webcore-backend
Branch: production
URL: webcore.onrender.com
Database: webcore-db
Auto-Deploy: ❌ (Manual approval required)
```

## 📝 **أفضل الممارسات**

### 1. **Commit Messages:**
```bash
# استخدم تنسيق واضح
feat: add user authentication system
fix: resolve database connection issue
docs: update API documentation
style: format code according to eslint rules
refactor: optimize database queries
test: add unit tests for user service
```

### 2. **Pull Request Template:**
```markdown
## 📋 Description
Brief description of changes

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## 📸 Screenshots (if applicable)
Add screenshots here

## 🔗 Related Issues
Closes #123
```

### 3. **Code Review Checklist:**
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered

## 🆘 **استكشاف الأخطاء**

### مشكلة Merge Conflicts:
```bash
# حل التضارب
git checkout development
git pull origin development
git checkout your-branch
git merge development
# حل التضارب يدوياً
git add .
git commit -m "Resolve merge conflicts"
```

### إعادة تعيين فرع:
```bash
# إعادة تعيين فرع للحالة الأصلية
git checkout problematic-branch
git reset --hard origin/problematic-branch
```

### تنظيف الفروع المحلية:
```bash
# حذف الفروع المدموجة
git branch --merged | grep -v main | xargs git branch -d
```

## 📊 **مراقبة الفروع**

### GitHub Actions للمراقبة:
```yaml
# .github/workflows/branch-monitor.yml
name: Branch Monitor
on:
  push:
    branches: [development, testing, staging, production]
  
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Notify deployment
        run: echo "Branch ${{ github.ref }} updated"
```

## 🎯 **الخلاصة**

هذا النظام يضمن:
- ✅ **جودة الكود** من خلال المراجعات
- ✅ **استقرار الإنتاج** من خلال الاختبار المتدرج
- ✅ **تتبع التغييرات** من خلال Git history
- ✅ **نشر آمن** من خلال البيئات المتعددة
- ✅ **تعاون فعال** من خلال Pull Requests

**Repository URL**: https://github.com/tariiq222/webvue-final.git
