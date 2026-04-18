import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Code, Globe, MessageCircle, FileText, Video, X, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';
import api from '../services/api';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

const TrainersPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [academies, setAcademies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [trainerToDelete, setTrainerToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loadingAcademies, setLoadingAcademies] = useState(false);

  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState('basic'); // 'basic' | 'cv' | 'video'
  const [selectedAddCategory, setSelectedAddCategory] = useState('softSkill');
  const [lastCreatedTrainerId, setLastCreatedTrainerId] = useState('');

  // Forms state
  const [form, setForm] = useState({
    TeacherNameL1: '',
    TeacherNameL2: '',
    TeacherAddress: '',
    NationalId: '',
    TeacherMobile: '',
    TeacherPhone: '',
    TeacherWhatsapp: '',
    TeacherEmail: '',
    Description: '',
    AcademyDataId: '',
    BranchesDataId: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [cvUrlInput, setCvUrlInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [updateTrainerId, setUpdateTrainerId] = useState('');

  const categories = [];

  useEffect(() => { if (selectedCategory) { loadTrainersByCategory(selectedCategory); } }, [selectedCategory]);

  // Check if user is admin and load academies/branches
  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const user = JSON.parse(localStorage.getItem('userData') || '{}');
        const userEmail = localStorage.getItem('userEmail') || '';
        const userRole = user.role || user.Role || '';
        
        const adminStatus = userRole === 'SupportAgent' || 
                           userRole === 'Admin' || 
                           userRole === 'admin' || 
                           userEmail === 'yjmt469999@gmail.com';
        
        setIsAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Load academies and branches for admin
  useEffect(() => {
    if (isAdmin) {
      const loadAcademiesAndBranches = async () => {
        setLoadingAcademies(true);
        try {
          // Try to load academies and branches individually to handle token issues better
          let academiesRes = [];
          let branchesRes = [];
          
          try {
            academiesRes = await api.getAcademies();
            if (Array.isArray(academiesRes)) {
              setAcademies(academiesRes);
            }
          } catch (academyError) {
            console.warn('Could not load academies:', academyError);
            // Check if it's a token issue
            if (academyError.status === 401) {
              handleAuthIssue();
            }
            setAcademies([]);
          }
          
          try {
            branchesRes = await api.getBranches();
            if (Array.isArray(branchesRes)) {
              setBranches(branchesRes);
            }
          } catch (branchError) {
            console.warn('Could not load branches:', branchError);
            // Check if it's a token issue
            if (branchError.status === 401) {
              handleAuthIssue();
            }
            setBranches([]);
          }
          
        } catch (error) {
          console.error('Error loading academies and branches:', error);
          setAcademies([]);
          setBranches([]);
        } finally {
          setLoadingAcademies(false);
        }
      };
      
      loadAcademiesAndBranches();
    }
  }, [isAdmin, lang]);

  // Function to retry loading academies and branches
  const retryLoadAcademiesAndBranches = async () => {
    if (isAdmin) {
      setLoadingAcademies(true);
      try {
        // Try to load academies and branches individually
        let academiesRes = [];
        let branchesRes = [];
        
        try {
          academiesRes = await api.getAcademies();
          if (Array.isArray(academiesRes)) {
            setAcademies(academiesRes);
          }
        } catch (academyError) {
          console.warn('Could not load academies on retry:', academyError);
          if (academyError.status === 401) {
            handleAuthIssue();
            return; // Don't continue if token is invalid
          }
        }
        
        try {
          branchesRes = await api.getBranches();
          if (Array.isArray(branchesRes)) {
            setBranches(branchesRes);
          }
        } catch (branchError) {
          console.warn('Could not load branches on retry:', branchError);
          if (branchError.status === 401) {
            handleAuthIssue();
            return; // Don't continue if token is invalid
          }
        }
        
        if (academiesRes.length > 0 || branchesRes.length > 0) {
          toast.success(lang === 'ar' ? 'تم تحميل البيانات بنجاح' : 'Data loaded successfully');
        } else {
          toast.warning(lang === 'ar' ? 'لا توجد بيانات متاحة' : 'No data available');
        }
      } catch (error) {
        console.error('Error retrying to load academies and branches:', error);
        toast.error(lang === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data');
      } finally {
        setLoadingAcademies(false);
      }
    }
  };

  // Function to handle authentication issues
  const handleAuthIssue = () => {
    toast.error(lang === 'ar' 
      ? 'مشكلة في المصادقة. يرجى إعادة تسجيل الدخول' 
      : 'Authentication issue. Please login again'
    );
    
    // Clear local storage and redirect to login
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }, 2000);
  };

  // تحميل جميع المدربين عند تحميل الصفحة
  useEffect(() => {
    loadAllTrainers();
  }, []);

  const loadAllTrainers = async () => {
    setLoading(true);
    try {
      const response = await api.getTrainers();
      console.log('API Response:', response); // للتأكد من البيانات
      
      if (response && Array.isArray(response)) {
        const formattedTrainers = response.map(trainer => {
          // تحديد التخصص بناءً على الوصف أو الحقول الأخرى
          let specialty = 'general';
          if (trainer.description) {
            const desc = trainer.description.toLowerCase();
            if (desc.includes('soft skill') || desc.includes('communication') || desc.includes('leadership')) {
              specialty = 'softSkill';
            } else if (desc.includes('technical') || desc.includes('programming') || desc.includes('development')) {
              specialty = 'technical';
            } else if (desc.includes('freelancer') || desc.includes('freelance') || desc.includes('project')) {
              specialty = 'freelancer';
            } else if (desc.includes('english') || desc.includes('language')) {
              specialty = 'english';
            }
          }
          
          return {
            id: trainer.id || trainer.Id,
            name: trainer.teacherNameL1 || trainer.TeacherNameL1 || trainer.teacherNameL2 || trainer.TeacherNameL2 || 'Unknown',
            specialty: specialty,
            description: trainer.description || trainer.Description || (lang === 'ar' ? 'مدرب محترف في مجال التدريب والتطوير' : 'Professional trainer in training and development'),
            image: trainer.imageFile || trainer.ImageFile || '/placeholder-trainer.jpg',
            email: trainer.teacherEmail || trainer.TeacherEmail,
            phone: trainer.teacherMobile || trainer.TeacherMobile || trainer.teacherPhone || trainer.TeacherPhone,
            whatsapp: trainer.teacherWhatsapp || trainer.TeacherWhatsapp,
            address: trainer.teacherAddress || trainer.TeacherAddress
          };
        });
        
        console.log('Formatted Trainers:', formattedTrainers); // للتأكد من البيانات المعالجة
        setTrainers(formattedTrainers);
      } else {
        console.log('No trainers data or invalid response:', response);
        setTrainers([]);
      }
    } catch (error) {
      console.error('Error loading all trainers:', error);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainersByCategory = async (category) => {
    setLoading(true);
    try {
      const response = await api.getTrainers();
      console.log('API Response for category:', category, response); // للتأكد من البيانات
      
      if (response && Array.isArray(response)) {
        const filteredTrainers = response.filter(trainer => {
          // تحسين فلترة المدربين حسب الفئة
          const desc = (trainer.description || trainer.Description || '').toLowerCase();
          const categoryLower = category.toLowerCase();
          
          return desc.includes(`category: ${categoryLower}`) || 
                 desc.includes(categoryLower) ||
                 desc.includes('soft skill') && category === 'softSkill' ||
                 desc.includes('technical') && category === 'technical' ||
                 desc.includes('freelancer') && category === 'freelancer' ||
                 desc.includes('english') && category === 'english';
        });
        
        console.log('Filtered Trainers for category:', category, filteredTrainers); // للتأكد من الفلترة
        
        const formattedTrainers = filteredTrainers.map(trainer => ({
          id: trainer.id || trainer.Id,
          name: trainer.teacherNameL1 || trainer.TeacherNameL1 || trainer.teacherNameL2 || trainer.TeacherNameL2 || 'Unknown',
          specialty: category,
          description: trainer.description || trainer.Description || (lang === 'ar' ? 'مدرب محترف في مجال التدريب والتطوير' : 'Professional trainer in training and development'),
          image: trainer.imageFile || trainer.ImageFile || '/placeholder-trainer.jpg',
          email: trainer.teacherEmail || trainer.TeacherEmail,
          phone: trainer.teacherMobile || trainer.TeacherMobile || trainer.teacherPhone || trainer.TeacherPhone,
          whatsapp: trainer.teacherWhatsapp || trainer.TeacherWhatsapp,
          address: trainer.teacherAddress || trainer.TeacherAddress
        }));
        
        setTrainers(formattedTrainers);
      } else {
        setTrainers([]);
      }
    } catch (error) {
      console.error('Error loading trainers for category:', category, error);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    loadTrainersByCategory(category);
  };

  const handleTrainerClick = (trainerId) => {
    console.log('Navigating to trainer:', trainerId); // للتأكد من معرف المدرب
    window.location.href = `/trainer/${trainerId}`;
  };

  const handleEdit = (trainer) => {
    // Redirect to edit page
    window.location.href = `/trainers/edit?id=${trainer.id}`;
  };

  const handleDelete = async (trainerId) => {
    try {
      await api.deleteTrainer(trainerId);
      setTrainers(trainers.filter(t => t.id !== trainerId));
      toast.success(lang === 'ar' ? 'تم حذف المدرب بنجاح' : 'Trainer deleted successfully');
    } catch (error) {
      console.error('Error deleting trainer:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف المدرب' : 'Error deleting trainer');
    }
  };

  const confirmDelete = async () => {
    if (trainerToDelete) {
      await handleDelete(trainerToDelete.id);
      setTrainerToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const openDeleteDialog = (trainer) => {
    setTrainerToDelete(trainer);
    setShowDeleteDialog(true);
  };

  const validateTrainerForm = () => {
    const name1 = (form.TeacherNameL1 || '').trim();
    const name2 = (form.TeacherNameL2 || '').trim();
    const nid = (form.NationalId || '').trim();
    if (name1.length < 3 || name1.length > 70) { toast.error(lang === 'ar' ? 'اسم المدرب (عربي) يجب أن يكون بين 3 و 70 حرفاً' : 'Trainer name (AR) must be 3-70 characters'); return false; }
    if (name2 && (name2.length < 3 || name2.length > 70)) { toast.error(lang === 'ar' ? 'اسم المدرب (إنجليزي) يجب أن يكون بين 3 و 70 حرفاً' : 'Trainer name (EN) must be 3-70 characters'); return false; }
    if (!/^\d{14}$/.test(nid)) { toast.error(lang === 'ar' ? 'الرقم القومي يجب أن يكون 14 رقماً' : 'National ID must be exactly 14 digits'); return false; }
    if (!form.TeacherWhatsapp?.trim()) { toast.error(lang === 'ar' ? 'واتساب مطلوب' : 'Whatsapp is required'); return false; }
    if (!form.TeacherEmail?.trim()) { toast.error(lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required'); return false; }
    return true;
  };

  // Helper: merge description safely under 500 chars
  const mergeDescription = (prev, add) => {
    const MAX = 500;
    const p = (prev || '').trim();
    const a = (add || '').trim();
    if (!p) return a.slice(0, MAX);
    const sep = ' | ';
    const total = p.length + sep.length + a.length;
    if (total <= MAX) return p + sep + a;
    const allowedPrev = Math.max(0, MAX - sep.length - a.length);
    const trimmedPrev = p.slice(0, allowedPrev);
    if (trimmedPrev) return trimmedPrev + sep + a.slice(0, MAX - trimmedPrev.length - sep.length);
    return a.slice(0, MAX);
  };

  const openAddModal = () => { setIsAddOpen(true); setActiveAddTab('basic'); setSelectedAddCategory('softSkill'); setUpdateTrainerId(lastCreatedTrainerId || ''); };

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, NationalId: (prev.NationalId || '').replace(/\D/g, '').slice(0, 14) }));
    if (!validateTrainerForm()) return;
    
    // Check if AcademyDataId is selected
    if (!form.AcademyDataId) {
      toast.error(lang === 'ar' ? 'يرجى اختيار الأكاديمية' : 'Please select an academy');
      return;
    }
    
    // Wizard: move to CV step without API call
      setActiveAddTab('cv');
  };

  // Helper: ensure all required base fields for PUT
  const getBaseFieldsForUpdate = async (id) => {
    const base = {
      TeacherNameL1: (form.TeacherNameL1 || '').trim(),
      TeacherNameL2: (form.TeacherNameL2 || '').trim(),
      TeacherAddress: (form.TeacherAddress || '').trim(),
      NationalId: (form.NationalId || '').trim(),
      TeacherWhatsapp: (form.TeacherWhatsapp || '').trim(),
      TeacherEmail: (form.TeacherEmail || '').trim(),
    };
    const hasAll = base.TeacherNameL1 && base.TeacherAddress && /^\d{14}$/.test(base.NationalId) && base.TeacherWhatsapp && base.TeacherEmail;
    if (hasAll) return base;
    // fetch from API
    try {
      const tr = await api.getTrainer(id);
      const derived = {
        TeacherNameL1: tr.teacherNameL1 || tr.TeacherNameL1 || '',
        TeacherNameL2: tr.teacherNameL2 || tr.TeacherNameL2 || '',
        TeacherAddress: tr.teacherAddress || tr.TeacherAddress || '',
        NationalId: (tr.nationalId || tr.NationalId || '').toString(),
        TeacherWhatsapp: tr.teacherWhatsapp || tr.TeacherWhatsapp || '',
        TeacherEmail: tr.teacherEmail || tr.TeacherEmail || '',
      };
      const ok = derived.TeacherNameL1 && derived.TeacherAddress && /^\d{14}$/.test(derived.NationalId) && derived.TeacherWhatsapp && derived.TeacherEmail;
      return ok ? derived : null;
    } catch (_) { return null; }
  };

  const handleUploadCv = async (e) => {
    e.preventDefault();
    // CV step: no API call here, just move to next if any input is provided (optional)
    setActiveAddTab('video');
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      // video is optional; proceed to final submission anyway
    }
    setSavingVideo(true);
    try {
      // Final submission: send all data at once
      const base = {
        TeacherNameL1: (form.TeacherNameL1 || '').trim(),
        TeacherNameL2: (form.TeacherNameL2 || '').trim(),
        TeacherAddress: (form.TeacherAddress || '').trim(),
        NationalId: (form.NationalId || '').trim(),
        TeacherWhatsapp: (form.TeacherWhatsapp || '').trim(),
        TeacherEmail: (form.TeacherEmail || '').trim(),
        AcademyDataId: form.AcademyDataId,
        BranchesDataId: form.BranchesDataId,
      };
      // Validate again before submit
      if (!base.TeacherNameL1 || !base.TeacherAddress || !/^\d{14}$/.test(base.NationalId) || !base.TeacherWhatsapp || !base.TeacherEmail || !base.AcademyDataId) {
        toast.error(lang === 'ar' ? 'يرجى إكمال البيانات الأساسية' : 'Please complete the basic information');
        setActiveAddTab('basic');
        return;
      }

      const fd = new FormData();
      Object.entries(base).forEach(([k,v]) => fd.append(k, v));

      // Build Description with category + optional description + CV + Video
      const categoryTag = `Category: ${selectedAddCategory}`;
      let desc = form.Description?.trim() || '';
      desc = desc ? `${desc} | ${categoryTag}` : categoryTag;
      if (cvUrlInput.trim()) {
        desc = mergeDescription(desc, `CV: ${cvUrlInput.trim()}`);
      }
      if (videoUrl.trim()) {
      const shortUrl = (videoUrl || '').slice(0, 100);
        desc = mergeDescription(desc, `Video: ${shortUrl}`);
      }
      fd.append('Description', desc);

      // Optional image
      if (imageFile) fd.append('Image', imageFile);

      await api.createTrainer(fd);
      toast.success(lang === 'ar' ? 'تم إضافة المدرب بنجاح' : 'Trainer added successfully');
      setIsAddOpen(false);
      setVideoUrl(''); setCvUrlInput(''); setForm(prev=>({...prev, Description: '' }));
      // Refresh trainers list
      loadAllTrainers();
    } catch (err) {
      console.error('Create trainer (final) failed', err);
      let msg = lang === 'ar' ? 'تعذر إضافة المدرب' : 'Failed to add trainer';
      try { 
        const errorBody = JSON.parse(err?.body || '{}');
        msg = errorBody.detail || errorBody.title || msg; 
      } catch (_) {}
      toast.error(msg);
    } finally { setSavingVideo(false); }
  };

  const getCvUrlFromDescription = (desc) => {
    if (!desc) return '';
    try {
      const text = String(desc);
      const urlMatch = text.match(/https?:\/\/[^\s)]+\.(pdf|doc|docx)(\?[^\s)]*)?/i);
      if (urlMatch && urlMatch[0]) return urlMatch[0];
      const afterTag = text.split(/CV\s*:\s*/i)[1];
      if (afterTag) {
        const direct = afterTag.trim().split(/\s+/)[0];
        if (/^https?:\/\//i.test(direct)) return direct;
        if (/\.(pdf|doc|docx)$/i.test(direct)) {
          return '';
        }
      }
    } catch (_) {}
    return '';
  };

    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* العنوان الرئيسي + زر الإضافة */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
        >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t('trainers.title')}
          </h1>
              <p className="text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
            {t('trainers.subtitle')}
          </p>
          {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Button 
                    onClick={openAddModal} 
                    className="rounded-full academy-button inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" /> 
                    {lang === 'ar' ? 'إضافة مدرب' : 'Add Trainer'}
            </Button>
                </motion.div>
          )}
            </div>
        </motion.div>

        {/* الأقسام الأربعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <category.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {category.name}
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {category.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>



        {/* عرض جميع المدربين */}
        {!selectedCategory && trainers.length > 0 && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                {lang === 'ar' ? 'جميع المدربين' : 'All Trainers'}
              </h2>
              <p className="text-white/80">
                {lang === 'ar' ? 'تعرف على جميع مدربينا المحترفين' : 'Meet all our professional trainers'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/90">{t('trainers.loading')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map((trainer) => (
                  <motion.div
                    key={trainer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleTrainerClick(trainer.id)}
                  >
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        {trainer.image && trainer.image !== '/placeholder-trainer.jpg' ? (
                          <img
                            src={trainer.image}
                            alt={trainer.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                        <Users className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{trainer.name}</h3>
                      <p className="text-white/80 mb-2 text-sm">{trainer.specialty}</p>
                      <p className="text-white/80 mb-4 text-sm">{trainer.description}</p>
                      
                      {/* Admin Action Buttons */}
                      {isAdmin && (
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-400 hover:text-blue-300 p-1 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrainerClick(trainer.id);
                            }}
                            title={lang === 'ar' ? 'عرض' : 'View'}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-400 hover:text-green-300 p-1 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(trainer);
                            }}
                            title={lang === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 p-1 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(trainer);
                            }}
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300 rounded-lg"
                        onClick={() => handleTrainerClick(trainer.id)}
                      >
                        {lang === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* رسالة عندما لا يوجد مدربون في البداية */}
        {!selectedCategory && !loading && trainers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <Users className="w-12 h-12 text-white/60" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {lang === 'ar' ? 'مرحباً بك في صفحة المدربين' : 'Welcome to Trainers Page'}
            </h3>
            <p className="text-white/80 text-lg mb-8">
              {lang === 'ar' 
                ? 'اضغط على زر "عرض جميع المدربين" لتحميل المدربين، أو اختر قسم معين من الأقسام أعلاه'
                : 'Click "Show All Trainers" button to load trainers, or select a specific category from above'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setSelectedCategory('softSkill')} 
                variant="outline"
                className="text-white border-white/30 hover:bg-white/20 rounded-full"
              >
                {lang === 'ar' ? 'Soft Skills' : 'Soft Skills'}
              </Button>
            </div>
          </div>
        )}

        {/* شاشة القسم المختار */}
        {selectedCategory && (
          <div className="mt-12">
            <div className="text-center mb-6">
              <Button variant="outline" onClick={() => setSelectedCategory(null)} className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300 rounded-full mb-4">
                ← {lang === 'ar' ? 'العودة للأقسام' : 'Back to Categories'}
              </Button>
              <h2 className="text-3xl font-bold text-white mt-2">
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-white/80">{categories.find(c => c.id === selectedCategory)?.desc}</p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/90">{t('trainers.loading')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainers.map((trainer) => (
                  <motion.div
                    key={trainer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleTrainerClick(trainer.id)}
                  >
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                        {trainer.image && trainer.image !== '/placeholder-trainer.jpg' ? (
                          <img
                            src={trainer.image}
                            alt={trainer.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                        <Users className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white">{trainer.name}</h3>
                      <p className="text-white/80 mb-4">{trainer.description}</p>
                      
                      
                      {/* Admin Action Buttons */}
                      {isAdmin && (
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-400 hover:text-blue-300 p-1 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrainerClick(trainer.id);
                            }}
                            title={lang === 'ar' ? 'عرض' : 'View'}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-400 hover:text-green-300 p-1 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(trainer);
                            }}
                            title={lang === 'ar' ? 'تعديل' : 'Edit'}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 p-1 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(trainer);
                            }}
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-all duration-300 rounded-lg"
                        onClick={() => handleTrainerClick(trainer.id)}
                      >
                        {lang === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {!loading && trainers.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="w-12 h-12 text-white/60" />
                </div>
                <p className="text-white/90 text-lg mb-8">{t('trainers.noTrainers')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Trainer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{lang === 'ar' ? 'إضافة مدرب' : 'Add Trainer'}</h3>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setIsAddOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Category selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'نوع التدريب' : 'Training Type'}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedAddCategory(c.id)}
                    className={`border rounded-lg p-2 text-sm transition-all duration-300 ${
                      selectedAddCategory === c.id 
                        ? 'border-blue-500 bg-blue-500 text-white shadow-md' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">{categories.find(c=>c.id===selectedAddCategory)?.desc}</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-4">
              {['basic','cv','video'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveAddTab(tab)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all duration-300 ${
                    activeAddTab===tab
                      ? 'border-blue-500 text-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  {tab==='basic' ? (lang==='ar'?'البيانات الأساسية':'Basic') : tab==='cv' ? 'CV' : (lang==='ar'?'فيديو':'Video')}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeAddTab === 'basic' && (
              <form onSubmit={handleCreateTrainer} className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'اسم المدرب (عربي)*':'Trainer name (AR)*'} value={form.TeacherNameL1} onChange={e=>setForm(f=>({...f,TeacherNameL1:e.target.value}))} minLength={3} maxLength={70} required />
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'اسم المدرب (إنجليزي)':'Trainer name (EN)'} value={form.TeacherNameL2} onChange={e=>setForm(f=>({...f,TeacherNameL2:e.target.value}))} minLength={3} maxLength={70} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'العنوان*':'Address*'} value={form.TeacherAddress} onChange={e=>setForm(f=>({...f,TeacherAddress:e.target.value}))} required />
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'الرقم القومي (14 رقم)*':'National ID (14 digits)*'} value={form.NationalId} onChange={e=>setForm(f=>({...f,NationalId:e.target.value.replace(/\D/g,'').slice(0,14)}))} inputMode="numeric" pattern="\d{14}" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'موبايل':'Mobile'} value={form.TeacherMobile} onChange={e=>setForm(f=>({...f,TeacherMobile:e.target.value}))} />
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'تليفون':'Phone'} value={form.TeacherPhone} onChange={e=>setForm(f=>({...f,TeacherPhone:e.target.value}))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'واتساب*':'Whatsapp*'} value={form.TeacherWhatsapp} onChange={e=>setForm(f=>({...f,TeacherWhatsapp:e.target.value}))} required />
                  <input type="email" className="px-3 py-2 rounded border" placeholder={lang==='ar'?'البريد الإلكتروني*':'Email*'} value={form.TeacherEmail} onChange={e=>setForm(f=>({...f,TeacherEmail:e.target.value}))} required />
                </div>
                
                {/* Academy and Branch Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <select 
                      className="px-3 py-2 rounded border w-full" 
                      value={form.AcademyDataId} 
                      onChange={e=>setForm(f=>({...f,AcademyDataId:e.target.value}))} 
                      required
                      disabled={loadingAcademies}
                    >
                      <option value="">{lang==='ar'?'اختر الأكاديمية*':'Select Academy*'}</option>
                      {academies.length > 0 ? (
                        academies.map(academy => (
                          <option key={academy.id} value={academy.id}>
                            {academy.academyNameL1 || academy.AcademyNameL1 || academy.academyNameL2 || academy.AcademyNameL2 || academy.name || academy.id}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {loadingAcademies 
                            ? (lang==='ar'?'جاري التحميل...':'Loading...') 
                            : (lang==='ar'?'لا يمكن تحميل الأكاديميات - مشكلة في المصادقة':'Cannot load academies - Authentication issue')
                          }
                        </option>
                      )}
                    </select>
                    {academies.length === 0 && !loadingAcademies && (
                      <div className="absolute right-1 top-1 flex gap-1">
                        <Button 
                          type="button"
                          onClick={retryLoadAcademiesAndBranches}
                          className="h-6 w-6 p-0 text-xs"
                          variant="outline"
                          title={lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                        >
                          ↻
                        </Button>
                      </div>
                    )}
                  </div>
                  <select 
                    className="px-3 py-2 rounded border" 
                    value={form.BranchesDataId} 
                    onChange={e=>setForm(f=>({...f,BranchesDataId:e.target.value}))}
                    disabled={loadingAcademies}
                  >
                    <option value="">{lang==='ar'?'اختر الفرع (اختياري)':'Select Branch (optional)'}</option>
                    {branches.length > 0 ? (
                      branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.branchNameL1 || branch.BranchNameL1 || branch.branchNameL2 || branch.BranchNameL2 || branch.name || branch.id}
                        </option>
                      ))
                    ) : (
                                              <option value="" disabled>
                          {loadingAcademies 
                            ? (lang==='ar'?'جاري التحميل...':'Loading...') 
                            : (lang==='ar'?'لا يمكن تحميل الفروع - مشكلة في المصادقة':'Cannot load branches - Authentication issue')
                          }
                        </option>
                    )}
                  </select>
                </div>
                
                <textarea className="px-3 py-2 rounded border min-h-20" placeholder={lang==='ar'?'وصف (اختياري)':'Description (optional)'} value={form.Description} onChange={e=>setForm(f=>({...f,Description:e.target.value}))} />
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0]||null)} />
                </div>
                <div className="flex justify-between">
                  <div />
                  <Button type="submit" className="rounded-full academy-button">
                    {lang==='ar'? 'التالي': 'Next'}
                  </Button>
                </div>
                
                {/* Help message when academies can't be loaded */}
                {academies.length === 0 && !loadingAcademies && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <span className="text-sm">
                          {lang === 'ar' 
                            ? 'لا يمكن تحميل قائمة الأكاديميات والفروع. قد تكون هناك مشكلة في المصادقة. يرجى المحاولة مرة أخرى أو إعادة تسجيل الدخول.'
                            : 'Cannot load academies and branches list. There may be an authentication issue. Please try again or login again.'
                          }
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          onClick={retryLoadAcademiesAndBranches}
                          className="text-xs px-3 py-1"
                          variant="outline"
                        >
                          {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                        </Button>
                        <Button 
                          type="button"
                          onClick={handleAuthIssue}
                          className="text-xs px-3 py-1"
                          variant="destructive"
                        >
                          {lang === 'ar' ? 'إعادة تسجيل الدخول' : 'Login Again'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}

            {activeAddTab === 'cv' && (
              <form onSubmit={handleUploadCv} className="grid gap-3">
                <div className="grid grid-cols-1 gap-3">
                <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'رابط السيرة (اختياري)':'CV URL (optional)'} value={cvUrlInput} onChange={e=>setCvUrlInput(e.target.value)} />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={()=>setActiveAddTab('basic')}>
                    {lang==='ar'? 'السابق': 'Back'}
                  </Button>
                  <Button type="submit" className="rounded-full academy-button">
                    {lang==='ar'? 'التالي': 'Next'}
                  </Button>
                </div>
              </form>
            )}

            {activeAddTab === 'video' && (
              <form onSubmit={handleSaveVideo} className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="px-3 py-2 rounded border" placeholder={lang==='ar'?'رابط الفيديو (YouTube/Vimeo) (اختياري)':'Video URL (YouTube/Vimeo) (optional)'} value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} />
                  </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={()=>setActiveAddTab('cv')}>
                    {lang==='ar'? 'السابق': 'Back'}
                  </Button>
                  <Button type="submit" disabled={savingVideo} className="rounded-full academy-button">
                    {savingVideo ? (lang==='ar'?'جارٍ الإضافة...':'Adding...') : (lang==='ar'?'إضافة المدرب':'Add Trainer')}
                  </Button>
                </div>
              </form>
            )}
              </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'ar' 
                ? `هل أنت متأكد من حذف المدرب "${trainerToDelete ? trainerToDelete.name : ''}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the trainer "${trainerToDelete ? trainerToDelete.name : ''}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="top-center" offset="140px" />
    </section>
  );
};

export default TrainersPage; 