/**
 * سكريپت لتطبيق الترجمات على جميع الصفحات
 * Script to apply translations to all pages
 */

// قائمة النصوص الثابتة التي تحتاج ترجمة
const translationMappings = {
  // User Management
  'User Management': 'userManagement',
  'Manage user accounts, roles, and permissions': 'manageUserAccounts',
  'Add User': 'addUser',
  'Search users...': 'searchUsers',
  'Filter by role': 'filterByRole',
  'Filter by status': 'filterByStatus',
  'All Roles': 'allRoles',
  'All Status': 'allStatus',
  'Import': 'import',
  'Export': 'export',
  'Full Name': 'fullName',
  'Email': 'email',
  'Role': 'role',
  'Department': 'department',
  'Status': 'status',
  'Last Login': 'lastLogin',
  'Actions': 'actions',
  'Active': 'active',
  'Inactive': 'inactive',
  'Suspended': 'suspended',
  'Edit': 'edit',
  'Suspend': 'suspend',
  'Activate': 'activate',
  'Delete': 'delete',
  'Loading users...': 'loading',
  'No users found.': 'noUsersFound',
  'No users found matching your search.': 'noUsersFoundSearch',
  'Create your first user': 'createFirstUser',

  // Role Management
  'Role Management': 'roleManagement',
  'Configure roles and permissions with hierarchical access control': 'configureRolesPermissions',
  'Create New Role': 'createNewRole',
  'Search roles...': 'searchRoles',
  'Users': 'users',
  'Permissions': 'permissions',
  'Type': 'type',
  'Created': 'created',
  'System': 'system',
  'Custom': 'custom',
  'Loading roles...': 'loading',
  'No roles found.': 'noRolesFound',
  'No roles found matching your search.': 'noRolesFoundSearch',
  'Create your first role': 'createFirstRole',
  'permissions': 'permissionsCount',

  // Module Management
  'Module Management': 'moduleManagement',
  'Install, configure, and monitor system modules': 'installConfigureMonitor',
  'Browse Library': 'browseLibrary',
  'Upload Module': 'uploadModule',
  'Search modules...': 'searchModules',
  'All Categories': 'allCategories',
  'Authentication': 'authentication',
  'Integration': 'integration',
  'Analytics': 'analytics',
  'Version': 'version',
  'Health': 'health',
  'Author': 'author',
  'Size': 'size',
  'Installed': 'installed',
  'Configure': 'configure',
  'View Logs': 'viewLogs',
  'Uninstall': 'uninstall',
  'Loading modules...': 'loading',
  'No modules found.': 'noModulesFound',
  'No modules found matching your search.': 'noModulesFoundSearch',
  'Install your first module': 'installFirstModule',

  // Common terms
  'Loading...': 'loading',
  'Cancel': 'cancel',
  'Create': 'create',
  'Update': 'update',
  'Save': 'saveChanges',
  'Success': 'success',
  'Error': 'error',
  'Warning': 'warning',
  'Info': 'info'
};

// دالة لتطبيق الترجمات على ملف
function applyTranslationsToFile(filePath, content) {
  let updatedContent = content;
  
  // استبدال النصوص الثابتة بالترجمات
  Object.entries(translationMappings).forEach(([englishText, translationKey]) => {
    // البحث عن النصوص في أماكن مختلفة
    const patterns = [
      // في النصوص العادية
      new RegExp(`"${englishText}"`, 'g'),
      new RegExp(`'${englishText}'`, 'g'),
      // في placeholder
      new RegExp(`placeholder="${englishText}"`, 'g'),
      new RegExp(`placeholder='${englishText}'`, 'g'),
      // في title
      new RegExp(`title="${englishText}"`, 'g'),
      new RegExp(`title='${englishText}'`, 'g'),
      // في aria-label
      new RegExp(`aria-label="${englishText}"`, 'g'),
      new RegExp(`aria-label='${englishText}'`, 'g')
    ];

    patterns.forEach(pattern => {
      if (pattern.test(updatedContent)) {
        console.log(`Found "${englishText}" in ${filePath}, replacing with {t('${translationKey}')}`);
        
        // استبدال النص بالترجمة
        if (pattern.source.includes('placeholder=')) {
          updatedContent = updatedContent.replace(pattern, `placeholder={t('${translationKey}')}`);
        } else if (pattern.source.includes('title=')) {
          updatedContent = updatedContent.replace(pattern, `title={t('${translationKey}')}`);
        } else if (pattern.source.includes('aria-label=')) {
          updatedContent = updatedContent.replace(pattern, `aria-label={t('${translationKey}')}`);
        } else {
          updatedContent = updatedContent.replace(pattern, `{t('${translationKey}')}`);
        }
      }
    });
  });

  return updatedContent;
}

// قائمة الملفات التي تحتاج ترجمة
const filesToTranslate = [
  'src/pages/UserManagement.tsx',
  'src/pages/RoleManagement.tsx',
  'src/pages/ModuleManagement.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/SettingsPage.tsx',
  'src/components/Sidebar.tsx',
  'src/components/Header.tsx',
  'src/components/DashboardHeader.tsx'
];

console.log('🌐 تطبيق الترجمات على الصفحات...');
console.log('Files to process:', filesToTranslate.length);
console.log('Translation mappings:', Object.keys(translationMappings).length);

// تصدير الدوال للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    translationMappings,
    applyTranslationsToFile,
    filesToTranslate
  };
}
