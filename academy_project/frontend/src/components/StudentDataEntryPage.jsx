import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useI18n } from '../lib/i18n';
import api from '../services/api';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';

const StudentDataEntryPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  const showIdFields = false;
  const showCodeFields = false;

  const [loading, setLoading] = React.useState(false);
  const [loadingData, setLoadingData] = React.useState(true);
  const [groups, setGroups] = React.useState([]);
  const [branches, setBranches] = React.useState([]);
  const [academies, setAcademies] = React.useState([]);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [studentId, setStudentId] = React.useState(null);

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [groupId, setGroupId] = React.useState('');
  const [branchId, setBranchId] = React.useState('');
  const [academyId, setAcademyId] = React.useState('');
  const [originalStudentData, setOriginalStudentData] = React.useState(null);

  // Additional student fields to be displayed on the page
  const [studentCode, setStudentCode] = React.useState('');
  const [studentBarCode, setStudentBarCode] = React.useState('');
  const [studentNameL1, setStudentNameL1] = React.useState('');
  const [studentNameL2, setStudentNameL2] = React.useState('');
  const [countryCodeId, setCountryCodeId] = React.useState('');
  const [governorateCodeId, setGovernorateCodeId] = React.useState('');
  const [cityCodeId, setCityCodeId] = React.useState('');
  const [trainingTime, setTrainingTime] = React.useState('');
  const [trainingGovernorateId, setTrainingGovernorateId] = React.useState('');
  const [recommendTrack, setRecommendTrack] = React.useState('');
  const [recommendJobProfile, setRecommendJobProfile] = React.useState('');
  const [graduationStatus, setGraduationStatus] = React.useState('');
  const [track, setTrack] = React.useState('');
  const [profileCode, setProfileCode] = React.useState('');
  const [academyClaseDetailsId, setAcademyClaseDetailsId] = React.useState('');
  const [projectsDetailsId, setProjectsDetailsId] = React.useState('');
  const [trainingProvider, setTrainingProvider] = React.useState('');
  const [linkedIn, setLinkedIn] = React.useState('');
  const [facebook, setFacebook] = React.useState('');
  const [language, setLanguage] = React.useState('');
  const [certificateName, setCertificateName] = React.useState('');
  const [studentMobil, setStudentMobil] = React.useState('');
  const [studentWhatsapp, setStudentWhatsapp] = React.useState('');
  const [studentEmail, setStudentEmail] = React.useState('');
  const [emailAcademy, setEmailAcademy] = React.useState('');
  const [emailPassword, setEmailPassword] = React.useState('');

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoadingData(true);
        
        // Load groups, branches, and academies
        const [groupsRes, branchesRes, academiesRes] = await Promise.all([
          api.getStudentGroups({ silent: true }).catch(() => []),
          api.getBranches({ silent: true }).catch(() => []),
          api.getAcademies({ silent: true }).catch(() => [])
        ]);
        
        setGroups(Array.isArray(groupsRes) ? groupsRes : []);
        setBranches(Array.isArray(branchesRes) ? branchesRes : []);
        setAcademies(Array.isArray(academiesRes) ? academiesRes : []);
        
        // Check if we're in edit mode
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('id');
        const isViewMode = urlParams.get('view') === 'true';
        
        console.log('URL parameters:', {
          editId,
          isViewMode,
          search: window.location.search
        });
        
        if (editId) {
          setIsEditMode(true);
          setStudentId(editId);
          
          try {
            console.log('Loading student data for ID:', editId);
            // Load existing student data
            const studentData = await api.getStudent(editId);
            console.log('Student data received:', studentData);
            console.log('Student data keys:', Object.keys(studentData));
            
            if (studentData) {
              // Store original data for comparison
              setOriginalStudentData(studentData);
              
              // Parse the full name into first and last name
              const fullName = studentData.StudentNameL1 || studentData.studentNameL1 || studentData.fullName || studentData.name || studentData.studentName || '';
              console.log('Full name:', fullName);
              const nameParts = fullName.split(' ');
              const first = nameParts[0] || '';
              const last = nameParts.slice(1).join(' ') || '';
              
              // Try multiple possible field names for each property
              const email = studentData.Email || studentData.email || studentData.studentEmail || studentData.StudentEmail || studentData.emailAddress || studentData.EmailAddress || studentData.userEmail || studentData.UserEmail || studentData.mail || studentData.Mail || '';
              const phone = studentData.StudentPhone || studentData.phoneNumber || studentData.phone || studentData.studentPhone || studentData.StudentPhone || studentData.telephone || studentData.Telephone || '';
              const address = studentData.StudentAddress || studentData.address || studentData.studentAddress || studentData.StudentAddress || studentData.location || studentData.Location || '';
              const groupId = studentData.StudentGroupId || studentData.groupId || studentData.studentGroupId || studentData.StudentGroupId || '';
              const branchId = studentData.BranchesDataId || studentData.branchId || studentData.branchesDataId || studentData.BranchesDataId || '';
              const academyId = studentData.AcademyDataId || studentData.academyId || studentData.academyDataId || studentData.AcademyDataId || '';
              
              console.log('Setting form data:', {
                firstName: first,
                lastName: last,
                email,
                phone,
                address,
                groupId,
                branchId,
                academyId
              });
              
              setFirstName(first);
              setLastName(last);
              setEmail(email);
              setPhoneNumber(phone);
              setAddress(address);
              setGroupId(groupId);
              setBranchId(branchId);
              setAcademyId(academyId);

              // Set additional fields if present
              setStudentCode(String(studentData.studentCode || studentData.StudentCode || ''));
              setStudentBarCode(studentData.studentBarCode || studentData.StudentBarCode || '');
              setStudentNameL1(studentData.studentNameL1 || studentData.StudentNameL1 || '');
              setStudentNameL2(studentData.studentNameL2 || studentData.StudentNameL2 || '');
              setCountryCodeId(studentData.countryCodeId || studentData.CountryCodeId || '');
              setGovernorateCodeId(studentData.governorateCodeId || studentData.GovernorateCodeId || '');
              setCityCodeId(studentData.cityCodeId || studentData.CityCodeId || '');
              setTrainingTime((studentData.trainingTime || studentData.TrainingTime || '').replace('Z', ''));
              setTrainingGovernorateId(studentData.trainingGovernorateId || studentData.TrainingGovernorateId || '');
              setRecommendTrack(String(studentData.recommendTrack || studentData.RecommendTrack || ''));
              setRecommendJobProfile(studentData.recommendJobProfile || studentData.RecommendJobProfile || '');
              setGraduationStatus(studentData.graduationStatus || studentData.GraduationStatus || '');
              setTrack(studentData.track || studentData.Track || '');
              setProfileCode(String(studentData.profileCode || studentData.ProfileCode || ''));
              setAcademyClaseDetailsId(studentData.academyClaseDetailsId || studentData.AcademyClaseDetailsId || '');
              setProjectsDetailsId(studentData.projectsDetailsId || studentData.ProjectsDetailsId || '');
              setTrainingProvider(studentData.trainingProvider || studentData.TrainingProvider || '');
              setLinkedIn(studentData.linkedIn || studentData.LinkedIn || '');
              setFacebook(studentData.facebook || studentData.Facebook || '');
              setLanguage(studentData.language || studentData.Language || '');
              setCertificateName(studentData.certificateName || studentData.CertificateName || '');
              setStudentMobil(studentData.studentMobil || studentData.StudentMobil || '');
              setStudentWhatsapp(studentData.studentWhatsapp || studentData.StudentWhatsapp || '');
              setStudentEmail(studentData.studentEmail || studentData.StudentEmail || '');
              setEmailAcademy(studentData.emailAcademy || studentData.EmailAcademy || '');
              setEmailPassword(studentData.emailPassword || studentData.EmailPassword || '');
            } else {
              console.log('No student data received');
            }
          } catch (error) {
            console.error('Error loading student data:', error);
            console.error('Error details:', {
              message: error.message,
              status: error.status,
              body: error.body
            });
            toast.error(lang === 'ar' ? 'خطأ في تحميل بيانات الطالب' : 'Error loading student data');
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [lang]);

  // Debug useEffect to log form state changes
  React.useEffect(() => {
    if (isEditMode) {
      console.log('Form state updated:', {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        groupId,
        branchId,
        academyId
      });
    }
  }, [firstName, lastName, email, phoneNumber, address, groupId, branchId, academyId, isEditMode]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Basic validations for registration
      if (!firstName.trim() || !lastName.trim()) {
        toast.error(lang === 'ar' ? 'الاسم الأول واسم العائلة مطلوبان' : 'First and last name are required');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error(lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email');
        return;
      }
      if (!academyId || !branchId) {
        toast.error(lang === 'ar' ? 'يرجى اختيار الأكاديمية والفرع' : 'Please select academy and branch');
        return;
      }
      if (!password || password.length < 6) {
        toast.error(lang === 'ar' ? 'الرقم السري يجب أن يكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error(lang === 'ar' ? 'تأكيد الرقم السري لا يطابق' : 'Passwords do not match');
        return;
      }

      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'Student',
        academyDataId: academyId,
        branchesDataId: branchId,
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
        confirmPassword
      };

      const res = await api.adminRegister(payload);
      toast.success(lang === 'ar' ? 'تم إنشاء حساب الطالب بنجاح' : 'Student account registered successfully');
      
      // Create StudentData entry in backend so the student appears in /students
      try {
        const studentPayload = {
          AcademyDataId: academyId,
          BranchesDataId: branchId,
          StudentNameL1: `${firstName} ${lastName}`.trim(),
          StudentNameL2: `${firstName} ${lastName}`.trim(),
          StudentAddress: (address || '').trim() || 'N/A',
          StudentPhone: phoneNumber && phoneNumber.length >= 7 ? phoneNumber : '01000000000',
          StudentMobil: phoneNumber && phoneNumber.length >= 7 ? phoneNumber : '01000000000',
          StudentWhatsapp: phoneNumber && phoneNumber.length >= 7 ? phoneNumber : '01000000000',
          StudentEmail: email,
        };
        await api.createStudent(studentPayload);
        // Notify other pages to refresh
        try { window.dispatchEvent(new Event('students-changed')); } catch (_) {}
      } catch (_) {}
      
      // Optional: attempt to send email confirmation and phone code
      try { await api.sendEmailConfirmation(payload.email); } catch (_) {}
      try { if (payload.phoneNumber) await api.sendPhoneCode(payload.phoneNumber); } catch (_) {}
      
      // Clear form after successful registration
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');
      setAddress('');
      setPassword('');
      setConfirmPassword('');
      setBranchId('');
        setAcademyId('');

      setStudentCode('');
      setStudentBarCode('');
      setStudentNameL1('');
      setStudentNameL2('');
      setCountryCodeId('');
      setGovernorateCodeId('');
      setCityCodeId('');
      setTrainingTime('');
      setTrainingGovernorateId('');
      setRecommendTrack('');
      setRecommendJobProfile('');
      setGraduationStatus('');
      setTrack('');
      setProfileCode('');
      setAcademyClaseDetailsId('');
      setProjectsDetailsId('');
      setTrainingProvider('');
      setLinkedIn('');
      setFacebook('');
      setLanguage('');
      setCertificateName('');
      setStudentMobil('');
      setStudentWhatsapp('');
      setStudentEmail('');
      setEmailAcademy('');
      setEmailPassword('');
    } catch (err) {
      let msg = lang === 'ar' ? 'تعذر الحفظ' : 'Save failed';
      try { 
        const errorBody = JSON.parse(err?.body || '{}');
        msg = errorBody.detail || errorBody.title || msg; 
      } catch (_) {}
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {loadingData ? (
          <div className="text-center text-white/90 py-16">
            {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : (
          <>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
              {isEditMode 
                ? (lang === 'ar' ? 'تعديل بيانات الطالب' : 'Edit Student Data')
                : (lang === 'ar' ? 'إنشاء حساب طالب' : 'Create Student Account')
              }
        </h1>

        <form onSubmit={onSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 grid gap-4">
          {isEditMode && showIdFields && (
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'معرّف الطالب' : 'Student ID'}</label>
              <Input value={studentId || ''} readOnly />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'اسم العائلة' : 'Last Name'}</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'اسم الطالب (ع)' : 'Student Name (AR)'}</label>
              <Input value={studentNameL1} onChange={(e) => setStudentNameL1(e.target.value)} placeholder={lang === 'ar' ? 'مثال: أحمد محمد' : 'e.g., Ahmed Mohamed'} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'اسم الطالب (EN)' : 'Student Name (EN)'}</label>
              <Input value={studentNameL2} onChange={(e) => setStudentNameL2(e.target.value)} placeholder={lang === 'ar' ? 'مثال: Ahmed Mohamed' : 'e.g., Ahmed Mohamed'} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                value={phoneNumber}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  setPhoneNumber(digitsOnly);
                }}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'العنوان' : 'Address'}</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={lang === 'ar' ? 'العنوان التفصيلي' : 'Full address'} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الرقم السري' : 'Password'}</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'تأكيد الرقم السري' : 'Confirm Password'}</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الأكاديمية' : 'Academy'} *</label>
              <Select value={academyId} onValueChange={setAcademyId} required>
                <SelectTrigger>
                  <SelectValue placeholder={lang === 'ar' ? 'اختر الأكاديمية' : 'Choose academy'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {academies.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.academyNameL1 || a.AcademyNameL1 || a.academyNameL2 || a.AcademyNameL2 || a.name || a.id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الفرع' : 'Branch'} *</label>
              <Select value={branchId} onValueChange={setBranchId} required>
                <SelectTrigger>
                  <SelectValue placeholder={lang === 'ar' ? 'اختر الفرع' : 'Choose branch'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.branchNameL1 || b.BranchNameL1 || b.branchNameL2 || b.BranchNameL2 || b.name || b.id}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional profile fields (codes hidden) */}
          {showCodeFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'كود الطالب' : 'Student Code'}</label>
                <Input type="number" value={studentCode} onChange={(e) => setStudentCode(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الباركود' : 'Student BarCode'}</label>
                <Input value={studentBarCode} onChange={(e) => setStudentBarCode(e.target.value)} placeholder="UUID" />
              </div>
            </div>
          )}

          {showIdFields && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الدولة (ID)' : 'Country ID'}</label>
                <Input value={countryCodeId} onChange={(e) => setCountryCodeId(e.target.value)} placeholder="UUID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'المحافظة (ID)' : 'Governorate ID'}</label>
                <Input value={governorateCodeId} onChange={(e) => setGovernorateCodeId(e.target.value)} placeholder="UUID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'المدينة (ID)' : 'City ID'}</label>
                <Input value={cityCodeId} onChange={(e) => setCityCodeId(e.target.value)} placeholder="UUID" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'وقت التدريب' : 'Training Time'}</label>
              <Input type="datetime-local" value={trainingTime} onChange={(e) => setTrainingTime(e.target.value)} />
            </div>
            {showIdFields && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'محافظة التدريب (ID)' : 'Training Governorate ID'}</label>
                <Input value={trainingGovernorateId} onChange={(e) => setTrainingGovernorateId(e.target.value)} placeholder="UUID" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'المسار الموصى به (رقم)' : 'Recommend Track (number)'}</label>
              <Input type="number" value={recommendTrack} onChange={(e) => setRecommendTrack(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'الوظيفة الموصى بها' : 'Recommend Job Profile'}</label>
              <Input value={recommendJobProfile} onChange={(e) => setRecommendJobProfile(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'حالة التخرج' : 'Graduation Status'}</label>
              <Input value={graduationStatus} onChange={(e) => setGraduationStatus(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'المسار' : 'Track'}</label>
              <Input value={track} onChange={(e) => setTrack(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showCodeFields && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'كود الملف' : 'Profile Code'}</label>
                <Input type="number" value={profileCode} onChange={(e) => setProfileCode(e.target.value)} />
              </div>
            )}
            {showIdFields && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">Academy Clase Details ID</label>
                <Input value={academyClaseDetailsId} onChange={(e) => setAcademyClaseDetailsId(e.target.value)} placeholder="UUID" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {showIdFields && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">Projects Details ID</label>
                <Input value={projectsDetailsId} onChange={(e) => setProjectsDetailsId(e.target.value)} placeholder="UUID" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'مزود التدريب' : 'Training Provider'}</label>
              <Input value={trainingProvider} onChange={(e) => setTrainingProvider(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">LinkedIn</label>
              <Input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Facebook</label>
              <Input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'اللغة' : 'Language'}</label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'اسم الشهادة' : 'Certificate Name'}</label>
              <Input value={certificateName} onChange={(e) => setCertificateName(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'هاتف الطالب' : 'Student Phone'}</label>
              <Input inputMode="numeric" pattern="[0-9]*" value={studentMobil} onChange={(e) => setStudentMobil(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'واتساب الطالب' : 'Student Whatsapp'}</label>
              <Input inputMode="numeric" pattern="[0-9]*" value={studentWhatsapp} onChange={(e) => setStudentWhatsapp(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'بريد الطالب' : 'Student Email'}</label>
              <Input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'بريد الأكاديمية' : 'Academy Email'}</label>
              <Input type="email" value={emailAcademy} onChange={(e) => setEmailAcademy(e.target.value)} />
          </div>
          <div>
              <label className="block text-sm font-medium text-white mb-1">{lang === 'ar' ? 'كلمة مرور البريد' : 'Email Password'}</label>
              <Input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="rounded-full academy-button">
                {loading 
                  ? (lang === 'ar' ? 'جارٍ الإضافة...' : 'Adding...')
                  : (lang === 'ar' ? 'إضافة' : 'Add')
                }
            </Button>
            <Button asChild variant="outline" className="rounded-full bg-transparent border-white/30 text-white hover:bg-white/10">
              <a href="/students">{lang === 'ar' ? 'رجوع للقائمة' : 'Back to list'}</a>
            </Button>
          </div>
        </form>
        </>
        )}
      </div>
      <Toaster position="top-center" richColors offset="140px" />
    </section>
  );
};

export default StudentDataEntryPage; 