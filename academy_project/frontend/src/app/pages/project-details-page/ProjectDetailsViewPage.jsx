import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../../lib/i18n';
import api from '@/services/api';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Calendar, MapPin, Building, FileText, Clock, Users, Target } from 'lucide-react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const ProjectDetailsViewPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  
  const [project, setProject] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // تحميل بيانات المشروع
        const projectData = await api.getProject(projectId);
        setProject(projectData);

        // تحميل بيانات الفروع
        const branchesData = await api.getBranches({ silent: true });
        setBranches(Array.isArray(branchesData) ? branchesData : []);

      } catch (err) {
        console.error('Error loading project data:', err);
        setError(lang === 'ar' ? 'فشل في تحميل بيانات المشروع' : 'Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProjectData();
    }
  }, [projectId, lang]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');
      const userEmail = localStorage.getItem('userEmail') || '';
      const role = user.role || user.Role || '';
      const admin = role === 'SupportAgent' || role === 'Admin' || role === 'admin' || userEmail === 'yjmt469999@gmail.com';
      setIsAdmin(admin);
    } catch (_) {
      setIsAdmin(false);
    }
  }, []);

  const handleEditProject = () => {
    navigate(`/projects-master/edit/${projectId}`);
  };

  const handleBackToList = () => {
    navigate('/projects-master');
  };

  const downloadBlob = async (endpoint, suggestedName) => {
    try {
      const blob = await api.request(endpoint, { headers: { Accept: 'application/octet-stream' } }, { silent: true });
      if (!(blob instanceof Blob)) throw new Error('No file data');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = suggestedName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      toast.success(lang === 'ar' ? 'بدأ تنزيل الملف' : 'Download started');
    } catch (e) {
      console.error('Download failed', e);
      toast.error(lang === 'ar' ? 'تعذر تنزيل الملف' : 'Failed to download file');
    }
  };

  const handleDownloadProjectFile = () => {
    downloadBlob(`/api/ProjectsMaster/${projectId}/file`, 'project-file');
  };

  const handleDownloadProjectResource = () => {
    downloadBlob(`/api/ProjectsMaster/${projectId}/resource`, 'project-resources');
  };

  const formatDate = (dateString) => {
    if (!dateString) return lang === 'ar' ? 'غير محدد' : 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return lang === 'ar' ? 'غير محدد' : 'Not specified';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} ${lang === 'ar' ? 'يوم' : 'days'}`;
    } catch {
      return lang === 'ar' ? 'غير محدد' : 'Not specified';
    }
  };

  const getBranchName = (branchId) => {
    if (!branchId) return lang === 'ar' ? 'غير محدد' : 'Not specified';
    const branch = branches.find(b => b.id === branchId);
    return branch ? (branch.branchNameL1 || branch.branchNameL2 || branch.name || branch.id) : lang === 'ar' ? 'غير محدد' : 'Not specified';
  };

  if (loading) {
    return (
      <section className="relative isolate overflow-hidden min-h-screen">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
            <p className="text-xl">{lang === 'ar' ? 'جاري تحميل بيانات المشروع...' : 'Loading project data...'}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section className="relative isolate overflow-hidden min-h-screen">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="bg-red-900/50 p-8 rounded-lg border border-red-500/30 max-w-2xl">
              <h3 className="text-2xl font-semibold mb-4 text-red-300">
                {lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error Loading Data'}
              </h3>
              <p className="text-red-200 mb-6">{error || (lang === 'ar' ? 'المشروع غير موجود' : 'Project not found')}</p>
              <div className="space-y-3">
                <Button onClick={handleBackToList} className="mr-3">
                  {lang === 'ar' ? 'العودة إلى القائمة' : 'Back to List'}
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden min-h-screen">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <Button 
                onClick={handleBackToList}
                variant="outline" 
                className="mb-4 bg-white/20 text-white border-white/50 hover:bg-white/30 hover:border-white/70 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {lang === 'ar' ? 'العودة إلى القائمة' : 'Back to List'}
              </Button>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                {project.projectNameL1 || project.ProjectNameL1 || project.id}
              </h1>
              
              {project.projectNameL2 || project.ProjectNameL2 ? (
                <p className="text-xl text-gray-300 mb-2">
                  {project.projectNameL2 || project.ProjectNameL2}
                </p>
              ) : null}
              
              <div className="flex flex-wrap gap-4 mt-6">
                {/* Buttons removed as requested */}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Description */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {lang === 'ar' ? 'وصف المشروع' : 'Project Description'}
                  </h2>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-lg">
                  {project.description || project.Description || 
                    (lang === 'ar' ? 'لا يوجد وصف متاح لهذا المشروع.' : 'No description available for this project.')}
                </p>
              </motion.div>

              {/* Timeline Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {lang === 'ar' ? 'الجدول الزمني' : 'Timeline'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatDate(project.projectStart || project.ProjectStart)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">
                          {lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatDate(project.projectEnd || project.ProjectEnd)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        {lang === 'ar' ? 'المدة الإجمالية' : 'Total Duration'}
                      </p>
                      <p className="text-lg font-semibold text-blue-800">
                        {calculateDuration(project.projectStart || project.ProjectStart, project.projectEnd || project.ProjectEnd)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sessions Section */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {lang === 'ar' ? 'الجلسات' : 'Sessions'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      {lang === 'ar' ? 'بداية الجلسات' : 'Sessions Start'}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatDate(project.projectStart || project.ProjectStart)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      {lang === 'ar' ? 'نهاية الجلسات' : 'Sessions End'}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-red-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatDate(project.projectEnd || project.ProjectEnd)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6">
              {/* Branch Information */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {lang === 'ar' ? 'معلومات الفرع' : 'Branch Information'}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {lang === 'ar' ? 'الفرع' : 'Branch'}
                      </p>
                      <p className="font-semibold text-gray-800">
                        {getBranchName(project.BranchesDataId)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Project Status */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {lang === 'ar' ? 'حالة المشروع' : 'Project Status'}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">
                      {lang === 'ar' ? 'نشط' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {lang === 'ar' 
                      ? 'المشروع جاهز للبدء والعمل عليه'
                      : 'Project is ready to start and work on'
                    }
                  </div>
                </div>
              </motion.div>
 
              {/* Student Files */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {lang === 'ar' ? 'ملفات للطلاب' : 'Student Files'}
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{lang==='ar'?'ملف المشروع':'Project File'}</p>
                        <p className="text-sm text-gray-500">{lang==='ar'?'تحميل الملف الرئيسي للمشروع':'Download the main project file'}</p>
                      </div>
                    </div>
                    <Button onClick={handleDownloadProjectFile} className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      {lang==='ar'?'تحميل':'Download'}
                    </Button>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{lang==='ar'?'الموارد التعليمية':'Learning Resources'}</p>
                        <p className="text-sm text-gray-500">{lang==='ar'?'مواد مساعدة ومراجع':'Supporting materials and references'}</p>
                      </div>
                    </div>
                    <Button onClick={handleDownloadProjectResource} className="bg-emerald-600 hover:bg-emerald-700">
                      <Download className="w-4 h-4 mr-2" />
                      {lang==='ar'?'تحميل':'Download'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center pt-8"
          >
            <div className="flex gap-4">
              <Button 
                onClick={handleBackToList}
                variant="outline" 
                className="px-8 py-3 text-lg bg-white/20 text-white border-white/50 hover:bg-white/30 hover:border-white/70 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                {lang === 'ar' ? 'العودة إلى القائمة' : 'Back to List'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectDetailsViewPage; 