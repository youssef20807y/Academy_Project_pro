import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X, User, MapPin, Phone, Mail, MessageCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useI18n } from '../lib/i18n';
import { toast, Toaster } from 'sonner';
import api from '../services/api';
const TrainerEditPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  
  // Get trainer ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const trainerId = urlParams.get('id');
  
  // State management
  const [trainer, setTrainer] = useState(null);
  const [academies, setAcademies] = useState([]);
  const [branches, setBranches] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    TeacherNameL1: '',
    TeacherNameL2: '',
    TeacherAddress: '',
    NationalId: '',
    DateStart: '',
    TeacherMobile: '',
    TeacherPhone: '',
    TeacherWhatsapp: '',
    TeacherEmail: '',
    Description: '',
    AcademyDataId: '',
    BranchesDataId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // File states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Load data on component mount
  useEffect(() => {
    if (trainerId) {
      loadAllData();
    } else {
      toast.error(lang === 'ar' ? 'معرف المدرب غير صحيح' : 'Invalid trainer ID');
      setTimeout(() => {
        window.location.href = '/trainers';
      }, 2000);
    }
  }, [trainerId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [trainerData, academiesData, branchesData] = await Promise.all([
        api.getTrainer(trainerId),
        api.getAcademies().catch(() => []),
        api.getBranches().catch(() => [])
      ]);

      // Set trainer data
      if (trainerData) {
        setTrainer(trainerData);
        setFormData({
          TeacherNameL1: trainerData.teacherNameL1 || trainerData.TeacherNameL1 || '',
          TeacherNameL2: trainerData.teacherNameL2 || trainerData.TeacherNameL2 || '',
          TeacherAddress: trainerData.teacherAddress || trainerData.TeacherAddress || '',
          NationalId: trainerData.nationalId || trainerData.NationalId || '',
          DateStart: trainerData.dateStart || trainerData.DateStart || '',
          TeacherMobile: trainerData.teacherMobile || trainerData.TeacherMobile || '',
          TeacherPhone: trainerData.teacherPhone || trainerData.TeacherPhone || '',
          TeacherWhatsapp: trainerData.teacherWhatsapp || trainerData.TeacherWhatsapp || '',
          TeacherEmail: trainerData.teacherEmail || trainerData.TeacherEmail || '',
          Description: trainerData.description || trainerData.Description || '',
          AcademyDataId: trainerData.academyDataId && trainerData.academyDataId !== '00000000-0000-0000-0000-000000000000' ? trainerData.academyDataId : (trainerData.AcademyDataId && trainerData.AcademyDataId !== '00000000-0000-0000-0000-000000000000' ? trainerData.AcademyDataId : ''),
          BranchesDataId: trainerData.branchesDataId && trainerData.branchesDataId !== '00000000-0000-0000-0000-000000000000' ? trainerData.branchesDataId : (trainerData.BranchesDataId && trainerData.BranchesDataId !== '00000000-0000-0000-0000-000000000000' ? trainerData.BranchesDataId : '')
        });
        
        // Set image preview if exists
        if (trainerData.imageFile || trainerData.ImageFile) {
          setImagePreview(trainerData.imageFile || trainerData.ImageFile);
        }
      }

      // Set academies and branches
      setAcademies(Array.isArray(academiesData) ? academiesData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Show more specific error message
      let errorMessage = lang === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data';
      
      // Try to parse error body for more details
      try {
        if (error.body) {
          const errorBody = JSON.parse(error.body);
          if (errorBody.detail) {
            errorMessage = errorBody.detail;
          } else if (errorBody.title) {
            errorMessage = errorBody.title;
          }
        }
      } catch (parseError) {
        console.log('Could not parse error body');
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!trainer) return false;
    
    return (
      formData.TeacherNameL1 !== (trainer.teacherNameL1 || trainer.TeacherNameL1 || '') ||
      formData.TeacherNameL2 !== (trainer.teacherNameL2 || trainer.TeacherNameL2 || '') ||
      formData.TeacherAddress !== (trainer.teacherAddress || trainer.TeacherAddress || '') ||
      formData.NationalId !== (trainer.nationalId || trainer.NationalId || '') ||
      formData.DateStart !== (trainer.dateStart || trainer.DateStart || '') ||
      formData.TeacherMobile !== (trainer.teacherMobile || trainer.TeacherMobile || '') ||
      formData.TeacherPhone !== (trainer.teacherPhone || trainer.TeacherPhone || '') ||
      formData.TeacherWhatsapp !== (trainer.teacherWhatsapp || trainer.TeacherWhatsapp || '') ||
      formData.TeacherEmail !== (trainer.teacherEmail || trainer.TeacherEmail || '') ||
      formData.Description !== (trainer.description || trainer.Description || '') ||
      formData.AcademyDataId !== (trainer.academyDataId && trainer.academyDataId !== '00000000-0000-0000-0000-000000000000' ? trainer.academyDataId : (trainer.AcademyDataId && trainer.AcademyDataId !== '00000000-0000-0000-0000-000000000000' ? trainer.AcademyDataId : '')) ||
      formData.BranchesDataId !== (trainer.branchesDataId && trainer.branchesDataId !== '00000000-0000-0000-0000-000000000000' ? trainer.branchesDataId : (trainer.BranchesDataId && trainer.BranchesDataId !== '00000000-0000-0000-0000-000000000000' ? trainer.BranchesDataId : ''))
    );
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.TeacherNameL1 || formData.TeacherNameL1.trim().length < 3) {
      errors.TeacherNameL1 = lang === 'ar' ? 'اسم المدرب (عربي) مطلوب ويجب أن يكون 3 أحرف على الأقل' : 'Trainer name (AR) is required and must be at least 3 characters';
    }
    if (formData.TeacherNameL2 && formData.TeacherNameL2.trim().length < 3) {
      errors.TeacherNameL2 = lang === 'ar' ? 'اسم المدرب (إنجليزي) يجب أن يكون 3 أحرف على الأقل' : 'Trainer name (EN) must be at least 3 characters';
    }
    if (!formData.TeacherAddress || formData.TeacherAddress.trim().length < 3) {
      errors.TeacherAddress = lang === 'ar' ? 'العنوان مطلوب ويجب أن يكون 3 أحرف على الأقل' : 'Address is required and must be at least 3 characters';
    }
    if (!formData.NationalId || !/^\d{14}$/.test(formData.NationalId)) {
      errors.NationalId = lang === 'ar' ? 'الرقم القومي مطلوب ويجب أن يكون 14 رقماً' : 'National ID is required and must be exactly 14 digits';
    }
    if (!formData.TeacherWhatsapp || formData.TeacherWhatsapp.trim().length === 0) {
      errors.TeacherWhatsapp = lang === 'ar' ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required';
    }
    if (!formData.TeacherEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.TeacherEmail)) {
      errors.TeacherEmail = lang === 'ar' ? 'البريد الإلكتروني مطلوب ويجب أن يكون صحيحاً' : 'Email is required and must be valid';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(lang === 'ar' ? 'يرجى تصحيح الأخطاء في النموذج' : 'Please correct the form errors');
      return;
    }

    try {
      setSubmitting(true);
      setFormErrors({});
      
      // Build FormData with only changed fields
      const fd = new FormData();
      const original = trainer || {};
      
      // Always include Id for backends that require it on PUT
      if (trainerId) {
        fd.set('Id', trainerId);
      }

      const normalizedOriginal = {
        TeacherNameL1: original.teacherNameL1 || original.TeacherNameL1 || '',
        TeacherNameL2: original.teacherNameL2 || original.TeacherNameL2 || '',
        TeacherAddress: original.teacherAddress || original.TeacherAddress || '',
        NationalId: (original.nationalId || original.NationalId || '').toString(),
        DateStart: original.dateStart || original.DateStart || '',
        TeacherMobile: original.teacherMobile || original.TeacherMobile || '',
        TeacherPhone: original.teacherPhone || original.TeacherPhone || '',
        TeacherWhatsapp: original.teacherWhatsapp || original.TeacherWhatsapp || '',
        TeacherEmail: original.teacherEmail || original.TeacherEmail || '',
        Description: original.description || original.Description || '',
        AcademyDataId: original.academyDataId || original.AcademyDataId || '',
        BranchesDataId: original.branchesDataId || original.BranchesDataId || '',
      };

      const keys = Object.keys(formData);
      keys.forEach((key) => {
        const newVal = (formData[key] ?? '').toString();
        const oldVal = (normalizedOriginal[key] ?? '').toString();
        if (key === 'AcademyDataId' || key === 'BranchesDataId') {
          // Only send if actually changed and not empty/zero GUID
          if (newVal && newVal !== '00000000-0000-0000-0000-000000000000' && newVal !== oldVal) {
            fd.append(key, newVal);
          }
        } else {
          if (newVal !== oldVal) {
            if (newVal !== '') fd.append(key, newVal);
          }
        }
      });
      
      // Image only if selected
      if (imageFile) {
        fd.append('Image', imageFile);
      }

      // Ensure backend-required fields are present (PUT expects full payload for required fields)
      const requiredFields = ['TeacherNameL1','TeacherAddress','NationalId','TeacherWhatsapp','TeacherEmail'];
      requiredFields.forEach((field) => {
        if (!fd.has(field)) {
          const val = (formData[field] ?? normalizedOriginal[field] ?? '').toString();
          if (val) fd.append(field, val);
        }
      });

      // Ensure current Academy/Branch IDs are present if non-zero (backend expects them on PUT)
      const ZERO = '00000000-0000-0000-0000-000000000000';
      const currentAcademy = (formData.AcademyDataId || normalizedOriginal.AcademyDataId || '').toString();
      if (currentAcademy && currentAcademy !== ZERO) {
        fd.set('AcademyDataId', currentAcademy);
      }
      const currentBranch = (formData.BranchesDataId || normalizedOriginal.BranchesDataId || '').toString();
      if (currentBranch && currentBranch !== ZERO) {
        fd.set('BranchesDataId', currentBranch);
      }

      // If still nothing to update besides required preserved, check if any real update happened
      const keysNow = [...fd.keys()];
      const onlyRequired = keysNow.every(k => requiredFields.includes(k) || k === 'AcademyDataId' || k === 'BranchesDataId');
      if (onlyRequired && !imageFile) {
        toast.info(lang === 'ar' ? 'لا توجد تغييرات لإرسالها' : 'No changes to submit');
        setSubmitting(false);
        return;
      }
      
      // Call API to update trainer
      await api.updateTrainer(trainerId, fd);
      
      toast.success(lang === 'ar' ? 'تم تحديث المدرب بنجاح' : 'Trainer updated successfully');
      setTimeout(() => { window.location.href = '/trainers'; }, 1500);
    } catch (error) {
      console.error('Error updating trainer:', error);
      let errorMessage = lang === 'ar' ? 'خطأ في تحديث المدرب' : 'Error updating trainer';
      try {
        if (error.body) {
          const errorBody = JSON.parse(error.body);
          if (errorBody.detail) errorMessage = errorBody.detail; else if (errorBody.title) errorMessage = errorBody.title;
        }
      } catch (_) {}
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges() && !window.confirm(lang === 'ar' ? 'هل تريد إلغاء التعديلات؟' : 'Do you want to cancel the changes?')) {
      return; // Don't navigate if user cancels
    }
    
    window.location.href = '/trainers';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            {lang === 'ar' ? 'جاري تحميل بيانات المدرب...' : 'Loading trainer data...'}
          </p>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            {lang === 'ar' ? 'المدرب غير موجود' : 'Trainer not found'}
          </p>
          <Button onClick={handleBack} className="mt-4">
            {lang === 'ar' ? 'العودة للمدربين' : 'Back to Trainers'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBack} className="rounded-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {lang === 'ar' ? 'العودة' : 'Back'}
              </Button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                  {lang === 'ar' ? 'تعديل المدرب' : 'Edit Trainer'}
                </h1>
                <p className="text-white/90">
                  {lang === 'ar' ? 'تعديل بيانات المدرب' : 'Edit trainer information'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {lang === 'ar' ? 'بيانات المدرب' : 'Trainer Information'}
              </CardTitle>
              <CardDescription>
                {lang === 'ar' ? 'أدخل البيانات المطلوبة لتعديل المدرب' : 'Enter the required information to edit the trainer'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {lang === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'اسم المدرب (عربي) *' : 'Trainer Name (Arabic) *'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'أدخل الاسم بالعربية' : 'Enter name in Arabic'}
                        value={formData.TeacherNameL1}
                        onChange={(e) => handleFormChange('TeacherNameL1', e.target.value)}
                        className={formErrors.TeacherNameL1 ? 'border-destructive' : ''}
                        minLength={3}
                        maxLength={70}
                      />
                      {formErrors.TeacherNameL1 && (
                        <p className="text-sm text-destructive mt-1">{formErrors.TeacherNameL1}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'اسم المدرب (إنجليزي)' : 'Trainer Name (English)'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'أدخل الاسم بالإنجليزية' : 'Enter name in English'}
                        value={formData.TeacherNameL2}
                        onChange={(e) => handleFormChange('TeacherNameL2', e.target.value)}
                        className={formErrors.TeacherNameL2 ? 'border-destructive' : ''}
                        minLength={3}
                        maxLength={70}
                      />
                      {formErrors.TeacherNameL2 && (
                        <p className="text-sm text-destructive mt-1">{formErrors.TeacherNameL2}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'العنوان *' : 'Address *'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'أدخل العنوان' : 'Enter address'}
                        value={formData.TeacherAddress}
                        onChange={(e) => handleFormChange('TeacherAddress', e.target.value)}
                        className={formErrors.TeacherAddress ? 'border-destructive' : ''}
                        minLength={3}
                        maxLength={150}
                      />
                      {formErrors.TeacherAddress && (
                        <p className="text-sm text-destructive mt-1">{formErrors.TeacherAddress}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'الرقم القومي *' : 'National ID *'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'أدخل الرقم القومي (14 رقم)' : 'Enter National ID (14 digits)'}
                        value={formData.NationalId}
                        onChange={(e) => handleFormChange('NationalId', e.target.value.replace(/\D/g, '').slice(0, 14))}
                        className={formErrors.NationalId ? 'border-destructive' : ''}
                        inputMode="numeric"
                        pattern="\d{14}"
                        maxLength={14}
                      />
                      {formErrors.NationalId && (
                        <p className="text-sm text-destructive mt-1">{formErrors.NationalId}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                      </label>
                      <Input
                        type="date"
                        value={formData.DateStart}
                        onChange={(e) => handleFormChange('DateStart', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {lang === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'رقم الموبايل' : 'Mobile Number'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'أدخل رقم الموبايل' : 'Enter mobile number'}
                        value={formData.TeacherMobile}
                        onChange={(e) => handleFormChange('TeacherMobile', e.target.value)}
                        maxLength={12}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'رقم التليفون' : 'Phone Number'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'أدخل رقم التليفون' : 'Enter phone number'}
                        value={formData.TeacherPhone}
                        onChange={(e) => handleFormChange('TeacherPhone', e.target.value)}
                        maxLength={12}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'رقم الواتساب *' : 'WhatsApp Number *'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'أدخل رقم الواتساب' : 'Enter WhatsApp number'}
                        value={formData.TeacherWhatsapp}
                        onChange={(e) => handleFormChange('TeacherWhatsapp', e.target.value)}
                        className={formErrors.TeacherWhatsapp ? 'border-destructive' : ''}
                        maxLength={20}
                      />
                      {formErrors.TeacherWhatsapp && (
                        <p className="text-sm text-destructive mt-1">{formErrors.TeacherWhatsapp}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                      </label>
                      <Input
                        type="email"
                        placeholder={lang === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                        value={formData.TeacherEmail}
                        onChange={(e) => handleFormChange('TeacherEmail', e.target.value)}
                        className={formErrors.TeacherEmail ? 'border-destructive' : ''}
                        maxLength={80}
                      />
                      {formErrors.TeacherEmail && (
                        <p className="text-sm text-destructive mt-1">{formErrors.TeacherEmail}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Academy and Branch */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {lang === 'ar' ? 'الأكاديمية والفرع' : 'Academy and Branch'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'الأكاديمية' : 'Academy'}
                      </label>
                      <Select
                        value={formData.AcademyDataId}
                        onValueChange={(value) => handleFormChange('AcademyDataId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy'} />
                        </SelectTrigger>
                        <SelectContent>
                          {academies.map((academy) => (
                            <SelectItem key={academy.id} value={academy.id}>
                              {academy.academyNameL1 || academy.academyNameL2 || academy.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'الفرع' : 'Branch'}
                      </label>
                      <Select
                        value={formData.BranchesDataId}
                        onValueChange={(value) => handleFormChange('BranchesDataId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={lang === 'ar' ? 'اختر الفرع' : 'Select Branch'} />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.branchNameL1 || branch.branchNameL2 || branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {lang === 'ar' ? 'الوصف' : 'Description'}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'وصف المدرب' : 'Trainer Description'}
                    </label>
                    <Textarea
                      placeholder={lang === 'ar' ? 'أدخل وصف المدرب' : 'Enter trainer description'}
                      value={formData.Description}
                      onChange={(e) => handleFormChange('Description', e.target.value)}
                      rows={4}
                      maxLength={500}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {lang === 'ar' ? 'الصورة الشخصية' : 'Profile Picture'}
                  </h3>
                  
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt={lang === 'ar' ? 'صورة المدرب' : 'Trainer Image'}
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'اختر صورة جديدة' : 'Choose New Image'}
                      </label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        {lang === 'ar' ? 'جاري التحديث...' : 'Updating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'تحديث المدرب' : 'Update Trainer'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Toaster position="top-center" richColors offset="140px" />
    </section>
  );
};

export default TrainerEditPage; 