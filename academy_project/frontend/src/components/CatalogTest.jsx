import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import api from '@/services/api';

const CatalogTest = () => {
  const [testResults, setTestResults] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // اختبار جلب جميع الدروس
      console.log('Testing GET /api/AcademyClaseDetail...');
      const courses = await api.getCourses({ silent: true });
      results.getCourses = {
        success: true,
        count: Array.isArray(courses) ? courses.length : 'Not an array',
        data: courses
      };
      console.log('GET courses result:', courses);
    } catch (error) {
      results.getCourses = {
        success: false,
        error: error.message
      };
      console.error('GET courses error:', error);
    }

    try {
      // اختبار جلب أنواع الدورات
      console.log('Testing GET /api/AcademyClaseType...');
      const types = await api.getCourseTypes({ silent: true });
      results.getTypes = {
        success: true,
        count: Array.isArray(types) ? types.length : 'Not an array',
        data: types
      };
      console.log('GET types result:', types);
    } catch (error) {
      results.getTypes = {
        success: false,
        error: error.message
      };
      console.error('GET types error:', error);
    }

    try {
      // اختبار جلب الدورات الرئيسية
      console.log('Testing GET /api/AcademyClaseMaster...');
      const masters = await api.getCourseMasters({ silent: true });
      results.getMasters = {
        success: true,
        count: Array.isArray(masters) ? masters.length : 'Not an array',
        data: masters
      };
      console.log('GET masters result:', masters);
    } catch (error) {
      results.getMasters = {
        success: false,
        error: error.message
      };
      console.error('GET masters error:', error);
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>اختبار API - AcademyClaseDetail</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTests} disabled={loading}>
            {loading ? 'جاري الاختبار...' : 'تشغيل الاختبارات'}
          </Button>
          
          {Object.keys(testResults).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="p-3 border rounded">
                  <h4 className="font-semibold">{testName}</h4>
                  <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? '✅ نجح' : '❌ فشل'}
                  </div>
                  {result.success && (
                    <div className="text-sm text-gray-600">
                      عدد النتائج: {result.count}
                    </div>
                  )}
                  {!result.success && (
                    <div className="text-sm text-red-600">
                      الخطأ: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogTest; 