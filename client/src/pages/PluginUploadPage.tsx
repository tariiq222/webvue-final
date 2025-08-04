/**
 * 📤 Plugin Upload Page
 * صفحة رفع البلوجينز
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/useToast';
import { uploadPlugin } from '../api/plugins';

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

const PluginUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    author: '',
    category: 'utility'
  });

  const categories = [
    { value: 'content', label: 'إدارة المحتوى' },
    { value: 'analytics', label: 'التحليلات' },
    { value: 'security', label: 'الأمان' },
    { value: 'communication', label: 'التواصل' },
    { value: 'utility', label: 'الأدوات' },
    { value: 'integration', label: 'التكامل' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.name.endsWith('.zip')) {
        setUploadState(prev => ({
          ...prev,
          error: 'يجب أن يكون الملف من نوع .zip',
          file: null
        }));
        return;
      }

      // التحقق من حجم الملف (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setUploadState(prev => ({
          ...prev,
          error: 'حجم الملف يجب أن يكون أقل من 50 ميجابايت',
          file: null
        }));
        return;
      }

      setUploadState(prev => ({
        ...prev,
        file,
        error: null
      }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = async () => {
    if (!uploadState.file) {
      setUploadState(prev => ({
        ...prev,
        error: 'يرجى اختيار ملف للرفع'
      }));
      return;
    }

    if (!formData.name || !formData.description || !formData.version) {
      setUploadState(prev => ({
        ...prev,
        error: 'يرجى ملء جميع الحقول المطلوبة'
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null
    }));

    try {
      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // رفع البلوجين الفعلي
      const plugin = await uploadPlugin(uploadState.file, {
        name: formData.name,
        description: formData.description,
        version: formData.version,
        author: formData.author,
        category: formData.category
      });

      clearInterval(progressInterval);

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        success: true,
        progress: 100
      }));

      toast({
        title: 'نجح',
        description: `تم رفع ${plugin.name} بنجاح`
      });

      // إعادة توجيه بعد 2 ثانية
      setTimeout(() => {
        navigate('/plugins');
      }, 2000);

    } catch (error: any) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error.message || 'حدث خطأ أثناء رفع البلوجين'
      }));

      toast({
        title: 'خطأ',
        description: error.message || 'فشل في رفع البلوجين',
        variant: 'destructive'
      });
    }
  };

  const resetUpload = () => {
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
    setFormData({
      name: '',
      description: '',
      version: '',
      author: '',
      category: 'utility'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={() => navigate('/plugins')} className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للبلوجينز
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">رفع بلوجين جديد</h1>
          <p className="text-gray-600">ارفع بلوجين جديد لإضافة وظائف جديدة للنظام</p>
        </div>

        {uploadState.success ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">تم رفع البلوجين بنجاح!</h3>
              <p className="text-green-700 mb-4">سيتم إعادة توجيهك لصفحة البلوجينز...</p>
              <Button onClick={() => navigate('/plugins')} className="bg-green-600 hover:bg-green-700">
                عرض البلوجينز
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  رفع ملف البلوجين
                </CardTitle>
                <CardDescription>
                  اختر ملف البلوجين (.zip) للرفع. الحد الأقصى للحجم 50 ميجابايت.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plugin-file">ملف البلوجين</Label>
                    <Input
                      id="plugin-file"
                      type="file"
                      accept=".zip"
                      onChange={handleFileSelect}
                      disabled={uploadState.uploading}
                      className="mt-1"
                    />
                  </div>

                  {uploadState.file && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">{uploadState.file.name}</span>
                      <span className="text-xs text-blue-600">
                        ({(uploadState.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      {!uploadState.uploading && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setUploadState(prev => ({ ...prev, file: null }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}

                  {uploadState.uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>جاري الرفع...</span>
                        <span>{uploadState.progress}%</span>
                      </div>
                      <Progress value={uploadState.progress} className="w-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plugin Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات البلوجين</CardTitle>
                <CardDescription>
                  أدخل معلومات البلوجين الأساسية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plugin-name">اسم البلوجين *</Label>
                      <Input
                        id="plugin-name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="مثال: بلوجين إدارة المحتوى"
                        disabled={uploadState.uploading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="plugin-version">الإصدار *</Label>
                      <Input
                        id="plugin-version"
                        value={formData.version}
                        onChange={(e) => handleInputChange('version', e.target.value)}
                        placeholder="مثال: 1.0.0"
                        disabled={uploadState.uploading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plugin-author">المطور</Label>
                      <Input
                        id="plugin-author"
                        value={formData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        placeholder="اسم المطور"
                        disabled={uploadState.uploading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="plugin-category">الفئة</Label>
                      <select
                        id="plugin-category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        disabled={uploadState.uploading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="plugin-description">الوصف *</Label>
                    <Textarea
                      id="plugin-description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="وصف مختصر للبلوجين ووظائفه..."
                      rows={4}
                      disabled={uploadState.uploading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {uploadState.error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{uploadState.error}</span>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploadState.uploading || !uploadState.file}
                className="flex-1"
              >
                {uploadState.uploading ? 'جاري الرفع...' : 'رفع البلوجين'}
              </Button>
              <Button variant="outline" onClick={resetUpload} disabled={uploadState.uploading}>
                إعادة تعيين
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginUploadPage;
