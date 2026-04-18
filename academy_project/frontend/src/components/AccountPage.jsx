import React from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useI18n } from '../lib/i18n';
import { User, LogOut, Mail, Phone, ShieldCheck, ShieldOff, Upload, RefreshCw, Trash2, KeyRound, Image as ImageIcon, Clock, Settings, Building, Users, BookOpen, Briefcase, AlertTriangle, Facebook, Linkedin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast, Toaster } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const AccountPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [user, setUser] = React.useState(null);
  const [lastLogin, setLastLogin] = React.useState('');
  const [emailForConfirm, setEmailForConfirm] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [phoneCode, setPhoneCode] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [profilePreviewUrl, setProfilePreviewUrl] = React.useState('');
  const [profileFile, setProfileFile] = React.useState(null);
  const [tempPreviewUrl, setTempPreviewUrl] = React.useState('');
  const [busyAction, setBusyAction] = React.useState('');
  const [userStats, setUserStats] = React.useState(null);
  
  // State variables for social media links
  const [linkedIn, setLinkedIn] = React.useState('');
  const [facebook, setFacebook] = React.useState('');
  const [studentData, setStudentData] = React.useState(null);
  
  // State variables for academy and branch selection
  const [academies, setAcademies] = React.useState([]);
  const [branches, setBranches] = React.useState([]);
  const [selectedAcademy, setSelectedAcademy] = React.useState('');
  const [selectedBranch, setSelectedBranch] = React.useState('');
  const [loadingAcademyData, setLoadingAcademyData] = React.useState(true);

  const safeUserId = user?.id || user?.userId || user?.guid || '';

  // Function to load academy and branch data
  const loadAcademyData = async () => {
    try {
      setLoadingAcademyData(true);
      
      // Check if user is authenticated
      if (!user || !user.email) {
        console.warn('User not authenticated, skipping academy data load');
        setAcademies([]);
        setBranches([]);
        return;
      }
      
      console.log('🔄 Loading academy and branch data for user:', user.email);
      
      const [academiesRes, branchesRes] = await Promise.all([
        api.getAcademies().catch(err => {
          console.warn('Failed to load academies:', err);
          return [];
        }),
        api.getBranches().catch(err => {
          console.warn('Failed to load branches:', err);
          return [];
        })
      ]);
      
      console.log('📚 Academies loaded:', academiesRes?.length || 0);
      console.log('🏢 Branches loaded:', branchesRes?.length || 0);
      
      setAcademies(Array.isArray(academiesRes) ? academiesRes : []);
      setBranches(Array.isArray(branchesRes) ? branchesRes : []);
      
    } catch (error) {
      console.error('Error loading academy data:', error);
      // Set empty arrays on error to prevent infinite loading
      setAcademies([]);
      setBranches([]);
    } finally {
      setLoadingAcademyData(false);
    }
  };

  const resolveUserId = React.useCallback(async () => {
    let candidate = user?.id || user?.Id || user?.userId || user?.UserId || user?.guid || user?.Guid || user?.nameid || user?.nameId;
    if (candidate && String(candidate).trim()) return String(candidate);
    try {
      const me = await api.getCurrentUser();
      candidate = me?.id || me?.Id || me?.userId || me?.UserId || me?.guid || me?.Guid || me?.nameid || me?.nameId;
      if (candidate && String(candidate).trim()) return String(candidate);
    } catch (_) {}
    try {
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      candidate = stored?.id || stored?.Id || stored?.userId || stored?.UserId || stored?.guid || stored?.Guid || stored?.nameid || stored?.nameId;
      if (candidate && String(candidate).trim()) return String(candidate);
    } catch (_) {}
    try {
      const token = localStorage.getItem('authToken');
      if (token && token.split('.').length === 3) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        candidate = payload?.sub || payload?.nameid || payload?.nameId || payload?.NameId || payload?.NameIdentifier;
        if (candidate && String(candidate).trim()) return String(candidate);
      }
    } catch (_) {}
    return '';
  }, [user]);

  // Check user permissions
  const userEmail = user?.email || user?.Email || '';
  const isAdmin = user?.role === 'SupportAgent' || user?.role === 'Admin' || user?.role === 'admin' || userEmail === 'yjmt469999@gmail.com';
  const isTeacher = user?.role === 'Instructor';
  const isStudent = user?.role === 'Student';
  const isUser = user?.role === 'User' || user?.role === 'Student';
  
  // Debug log to check user role
  React.useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('User role:', user.role);
      console.log('isUser:', isUser);
    }
  }, [user, isUser]);

  // Load academy data once on component mount when user is authenticated
  React.useEffect(() => {
    if (user && user.email) {
      loadAcademyData();
    }
  }, [user]); // Load when user data is available
  
  // Update selected values when student data changes
  React.useEffect(() => {
    if (studentData && academies.length > 0 && branches.length > 0) {
      setSelectedAcademy(studentData.academyDataId || studentData.AcademyDataId || '');
      setSelectedBranch(studentData.branchesDataId || studentData.BranchesDataId || '');
    }
  }, [studentData, academies, branches]);
  
  // Reload academy data when student data is loaded (in case it wasn't loaded before)
  React.useEffect(() => {
    if (studentData && academies.length === 0 && branches.length === 0) {
      loadAcademyData();
    }
  }, [studentData]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Get current user data
        const me = await api.getCurrentUser();
        if (!mounted) return;
        
        if (!me) {
          // Try to get user data from localStorage
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            console.log('📋 User data from localStorage:', parsedUser);
            setUser(parsedUser);
            setEmailForConfirm(parsedUser?.email || parsedUser?.Email || '');
            setPhone(parsedUser?.phoneNumber || parsedUser?.PhoneNumber || '');
            console.log('✅ Set user data from localStorage - firstName:', parsedUser?.firstName, 'lastName:', parsedUser?.lastName, 'phone:', parsedUser?.phoneNumber);
          } else {
            throw new Error('No user data available');
          }
        } else {
          setUser(me);
          console.log('📋 User data from API:', me);
          setEmailForConfirm(me?.email || me?.Email || '');
          setPhone(me?.phoneNumber || me?.PhoneNumber || '');
          setTwoFactorEnabled(Boolean(me?.twoFactorEnabled || me?.TwoFactorEnabled));
          console.log('✅ Set user data from API - firstName:', me?.firstName, 'lastName:', me?.lastName, 'phone:', me?.phoneNumber);
          
          // Try to load student data for social media links (for all users)
          let studentDataLoaded = false;
            try {
              const students = await api.getStudents();
              if (students && Array.isArray(students)) {
                const currentStudent = students.find(s => 
                  s.studentEmail === me.email || 
                  s.StudentEmail === me.email ||
                  s.email === me.email ||
                  s.Email === me.email
                );
                if (currentStudent) {
                  setStudentData(currentStudent);
                  setLinkedIn(currentStudent.linkedIn || currentStudent.LinkedIn || '');
                  setFacebook(currentStudent.facebook || currentStudent.Facebook || '');
                // Set phone number from student data according to API schema
                // Try studentPhone first (required field), then studentMobil as fallback
                const phoneNumber = currentStudent.studentPhone || 
                                  currentStudent.StudentPhone || 
                                  currentStudent.studentMobil || 
                                  currentStudent.StudentMobil || '';
                setPhone(phoneNumber);
                
                // Load academy and branch data
                if (currentStudent.academyDataId || currentStudent.AcademyDataId) {
                  setSelectedAcademy(currentStudent.academyDataId || currentStudent.AcademyDataId);
                }
                if (currentStudent.branchesDataId || currentStudent.BranchesDataId) {
                  setSelectedBranch(currentStudent.branchesDataId || currentStudent.BranchesDataId);
                }
                
                // Save studentData to localStorage for header navigation
                try {
                  const studentDataForStorage = {
                    ...currentStudent,
                    userEmail: me?.email || me?.Email || user?.email || user?.Email || '',
                    updatedAt: new Date().toISOString()
                  };
                  console.log('💾 studentDataForStorage details:', {
                    originalEmail: currentStudent.studentEmail || currentStudent.StudentEmail || currentStudent.email || currentStudent.Email,
                    meEmail: me?.email || me?.Email,
                    userEmail: user?.email || user?.Email,
                    finalUserEmail: studentDataForStorage.userEmail
                  });
                  localStorage.setItem('studentData', JSON.stringify(studentDataForStorage));
                  console.log('💾 Saved studentData to localStorage for header navigation:', studentDataForStorage);
                  
                  // Dispatch event to update header navigation
                  try {
                    window.dispatchEvent(new CustomEvent('student-data-changed'));
                    console.log('📢 Dispatched student-data-changed event after loading student data');
                  } catch (e) {
                    console.warn('Failed to dispatch student-data-changed event:', e);
                  }
                } catch (e) {
                  console.warn('Failed to save studentData to localStorage:', e);
                }
                
                studentDataLoaded = true;
                }
              }
            } catch (studentError) {
              console.log('Could not load student data:', studentError);
            }
          
          // If no student data was loaded, try to load from localStorage
          if (!studentDataLoaded) {
            // Try to load phone from user data as fallback
            if (me?.phoneNumber || me?.PhoneNumber) {
              setPhone(me?.phoneNumber || me?.PhoneNumber || '');
            }
            // Also try to load from localStorage as additional fallback
            try {
              const storedUserData = localStorage.getItem('userData');
              if (storedUserData) {
                const parsedStoredUser = JSON.parse(storedUserData);
                console.log('📋 Additional user data from localStorage:', parsedStoredUser);
                // Update phone if not already set
                if (!phone && (parsedStoredUser?.phoneNumber || parsedStoredUser?.PhoneNumber)) {
                  setPhone(parsedStoredUser?.phoneNumber || parsedStoredUser?.PhoneNumber || '');
                  console.log('✅ Updated phone from localStorage:', parsedStoredUser?.phoneNumber || parsedStoredUser?.PhoneNumber);
                }
                // Also try to load firstName and lastName if not already set
                if (me && (!me.firstName && !me.FirstName) && (parsedStoredUser?.firstName || parsedStoredUser?.FirstName)) {
                  me.firstName = parsedStoredUser?.firstName || parsedStoredUser?.FirstName;
                  me.FirstName = parsedStoredUser?.firstName || parsedStoredUser?.FirstName;
                  console.log('✅ Updated firstName from localStorage:', me.firstName);
                }
                if (me && (!me.lastName && !me.LastName) && (parsedStoredUser?.lastName || parsedStoredUser?.LastName)) {
                  me.lastName = parsedStoredUser?.lastName || parsedStoredUser?.LastName;
                  me.LastName = parsedStoredUser?.lastName || parsedStoredUser?.LastName;
                  console.log('✅ Updated lastName from localStorage:', me.lastName);
                }
                // Update the user state with the enhanced data
                setUser({...me});
              }
            } catch (localStorageError) {
              console.log('Could not load additional user data from localStorage:', localStorageError);
            }
          }
        }

        // Load social media data from localStorage
        try {
          const storedSocialData = localStorage.getItem('userSocialMedia');
          if (storedSocialData) {
            const parsedData = JSON.parse(storedSocialData);
            // Only load data if it belongs to the current user
            const currentUserEmail = me?.email || me?.Email || '';
            if (!parsedData.userEmail || parsedData.userEmail === currentUserEmail) {
              setLinkedIn(parsedData.linkedIn || '');
              setFacebook(parsedData.facebook || '');
              // Also try to load phone from localStorage if available
              if (parsedData.phone) {
                setPhone(parsedData.phone);
              }
              console.log('💾 Loaded social media data from localStorage:', parsedData);
            } else {
              console.log('🗑️ Stored social media data belongs to different user, clearing...');
              localStorage.removeItem('userSocialMedia');
            }
          }
        } catch (localStorageError) {
          console.log('Could not load social media data from localStorage:', localStorageError);
        }

        // Get last login time
        try {
          const currentUserId = me?.id || me?.userId || me?.guid || user?.id || user?.userId || user?.guid || '';
          if (currentUserId && currentUserId.trim()) {
            const last = await api.lastLoginTime(currentUserId);
          if (mounted) setLastLogin(typeof last === 'string' ? last : (last?.lastLogin || ''));
          }
        } catch (e) {
          // Handle 404 error silently - this is normal for new users
          if (e?.status === 404) {
            console.log('Last login time not available (404) - this is normal for new users');
          } else {
            console.log('Last login time not available:', e?.message || 'Unknown error');
          }
        }

        // Load profile picture
        try {
          const currentUserId = me?.id || me?.userId || me?.guid || user?.id || user?.userId || user?.guid || '';
          if (currentUserId && currentUserId.trim()) {
            console.log('Attempting to load profile picture for user:', currentUserId);
            const blob = await api.getProfilePicture(currentUserId);
          if (blob && blob.size) {
            const url = URL.createObjectURL(blob);
            if (mounted) {
              setProfilePreviewUrl(url);
              console.log('Profile picture loaded successfully, size:', blob.size);
            }
          } else {
            console.log('No profile picture found or empty blob');
            }
          }
        } catch (e) {
          // Handle 404 error silently - this is normal for users without profile pictures
          if (e?.status === 404) {
            console.log('Profile picture not found (404) - this is normal for new users');
            // Don't show this as an error, just continue
          } else {
            // Only log other errors, but don't treat them as critical
            console.log('Profile picture not available:', e?.message || 'Unknown error');
          }
        }

        // Load user statistics if admin
        if (isAdmin) {
          try {
            const [courses, students, teachers, academies] = await Promise.all([
              api.getCourses(),
              api.getStudents(),
              api.getTeachers(),
              api.getAcademies()
            ]);
            
            setUserStats({
              courses: Array.isArray(courses) ? courses.length : 0,
              students: Array.isArray(students) ? students.length : 0,
              teachers: Array.isArray(teachers) ? teachers.length : 0,
              academies: Array.isArray(academies) ? academies.length : 0
            });
          } catch (e) {
            console.warn('Failed to load user stats:', e);
          }
        }

      } catch (e) {
        if (e?.status === 401) {
          try { window.location.href = '/login'; } catch (_) {}
          return;
        }
        if (mounted) setError(e?.message || 'Failed to load account');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { 
      mounted = false; 
      if (tempPreviewUrl) {
        URL.revokeObjectURL(tempPreviewUrl);
      }
      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
    };
  }, [isAdmin, safeUserId]);

  const withBusy = async (name, fn) => {
    setBusyAction(name);
    try { 
      await fn(); 
    } catch (e) {
      console.error(`Error in ${name}:`, e);
      let msg = 'Operation failed';
      
      try {
        if (e?.body) {
          const errorData = JSON.parse(e.body);
          msg = errorData?.detail || errorData?.title || errorData?.message || e?.message || 'Operation failed';
        } else {
          msg = e?.message || 'Operation failed';
        }
      } catch (parseError) {
        msg = e?.message || 'Operation failed';
      }
      
      toast.error(lang === 'ar' ? `خطأ: ${msg}` : `Error: ${msg}`);
      // Don't re-throw the error to avoid unhandled promise rejection
    } finally { 
      setBusyAction(''); 
    }
  };

  const logout = () => { 
    api.setToken(null); 
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    try { window.location.href = '/login'; } catch (_) {} 
  };

  const onChangePassword = () => withBusy('changePass', async () => { 
    await api.changePassword(currentPassword, newPassword); 
    setCurrentPassword(''); 
    setNewPassword(''); 
    toast.success(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
  });

  const onSendEmailConfirm = () => withBusy('sendEmail', async () => { 
    if (!emailForConfirm || !emailForConfirm.trim()) {
      toast.error(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForConfirm)) {
      toast.error(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      return;
    }
    
    try {
    await api.sendEmailConfirmation(emailForConfirm); 
    toast.success(lang === 'ar' ? 'تم إرسال رسالة التأكيد' : 'Confirmation email sent');
    } catch (error) {
      console.error('Email confirmation error:', error);
      
      // Check for specific error types
      if (error?.message?.includes('Email service is not configured')) {
        toast.error(lang === 'ar' ? 'خدمة البريد الإلكتروني غير متاحة حالياً. يرجى المحاولة لاحقاً.' : 'Email service is not available at the moment. Please try again later.');
      } else if (error?.status === 400) {
        toast.error(lang === 'ar' ? 'فشل في إرسال رسالة التأكيد. يرجى المحاولة لاحقاً.' : 'Failed to send confirmation email. Please try again later.');
      } else {
        toast.error(lang === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' : 'An unexpected error occurred. Please try again later.');
      }
      
      // Re-throw to be handled by withBusy
      throw error;
    }
  });

  const onConfirmPhone = () => withBusy('confirmPhone', async () => { 
    await api.confirmPhone(phone, phoneCode); 
    setPhoneCode(''); 
    setTwoFactorEnabled(true); 
    toast.success(lang === 'ar' ? 'تم تأكيد رقم الهاتف' : 'Phone number confirmed');
  });

  const onSendPhoneCode = () => withBusy('sendPhone', async () => { 
    await api.sendPhoneCode(phone); 
    toast.success(lang === 'ar' ? 'تم إرسال رمز التأكيد' : 'Verification code sent');
  });

  const onEnable2FA = () => withBusy('2fa', async () => { 
    await api.enable2FA(safeUserId); 
    setTwoFactorEnabled(true); 
    toast.success(lang === 'ar' ? 'تم تفعيل المصادقة الثنائية' : 'Two-factor authentication enabled');
  });

  const onDisable2FA = () => withBusy('2fa', async () => { 
    await api.disable2FA(safeUserId); 
    setTwoFactorEnabled(false); 
    toast.success(lang === 'ar' ? 'تم إلغاء المصادقة الثنائية' : 'Two-factor authentication disabled');
  });

  const onRefreshToken = () => withBusy('refresh', async () => { 
    await api.refreshToken(); 
    toast.success(lang === 'ar' ? 'تم تحديث الجلسة' : 'Session refreshed');
  });

  const onRevokeToken = () => withBusy('revoke', async () => { 
    await api.revokeToken(); 
    toast.success(lang === 'ar' ? 'تم إلغاء الجلسة' : 'Session revoked');
  });

  const onDeactivate = () => withBusy('deactivate', async () => { 
    await api.deactivateUser(safeUserId); 
    toast.success(lang === 'ar' ? 'تم إلغاء تفعيل الحساب' : 'Account deactivated');
  });

  const onActivate = () => withBusy('activate', async () => { 
    await api.activateUser(safeUserId); 
    toast.success(lang === 'ar' ? 'تم تفعيل الحساب' : 'Account activated');
  });

  const onUpdateSocialMedia = () => withBusy('updateSocial', async () => {
    // Validate URLs
    const linkedInUrl = linkedIn.trim();
    const facebookUrl = facebook.trim();
    
    // Basic URL validation - only validate if URL is provided
    const urlRegex = /^https?:\/\/.+/;
    if (linkedInUrl && !urlRegex.test(linkedInUrl)) {
      toast.error(lang === 'ar' ? 'رابط LinkedIn غير صحيح' : 'Invalid LinkedIn URL');
      return;
    }
    if (facebookUrl && !urlRegex.test(facebookUrl)) {
      toast.error(lang === 'ar' ? 'رابط Facebook غير صحيح' : 'Invalid Facebook URL');
      return;
    }
    
    // If URLs are empty, we'll send null to API (which is valid)
    console.log('🔗 URL validation passed:', { linkedIn: linkedInUrl || 'empty', facebook: facebookUrl || 'empty' });
    
    // Validate phone number according to API schema (7-12 characters)
    if (phone && (phone.length < 7 || phone.length > 12)) {
      toast.error(lang === 'ar' ? 'رقم الهاتف يجب أن يكون بين 7 و 12 رقم' : 'Phone number must be between 7 and 12 digits');
      return;
    }
    
    // Ensure phone number is available for API calls
    if (!phone || phone.length < 7) {
      // Set a default phone number if none provided
      const defaultPhone = user?.phoneNumber || user?.PhoneNumber || '1234567';
      console.log('📱 No valid phone number provided, using default:', defaultPhone);
      setPhone(defaultPhone);
    }
    
    // Store social media links and phone in localStorage as fallback
            const socialData = {
          linkedIn: linkedInUrl,
          facebook: facebookUrl,
          phone: (phone && phone.length >= 7) ? phone : (user?.phoneNumber || user?.PhoneNumber || '1234567'), // Ensure valid phone
          userEmail: user?.email || user?.Email || '',
          academyDataId: selectedAcademy || null,
          branchesDataId: selectedBranch || null,
          updatedAt: new Date().toISOString()
        };
        
        console.log('📝 socialData details:', {
          userEmail: user?.email || user?.Email,
          finalUserEmail: socialData.userEmail,
          selectedAcademy,
          selectedBranch
        });
        console.log('📝 Preparing socialData for localStorage:', socialData);
    
    let apiUpdateSuccess = false;
    
    // Try to update student data if available
    if (studentData?.id || studentData?.Id) {
    const studentId = studentData.id || studentData.Id;
    const updateData = {
      ...studentData,
        linkedIn: linkedInUrl || null, // Send null instead of empty string
        facebook: facebookUrl || null, // Send null instead of empty string
        // Update phone number if it has changed (ensure it meets API requirements)
        studentPhone: (phone && phone.length >= 7) ? phone : (studentData.studentPhone || studentData.StudentPhone || '1234567'),
        // Update academy and branch data
        academyDataId: selectedAcademy || studentData.academyDataId || studentData.AcademyDataId || '',
        branchesDataId: selectedBranch || studentData.branchesDataId || studentData.BranchesDataId || '',
        // Add StudentMobil field as required by API
        studentMobil: (phone && phone.length >= 7) ? phone : (studentData.studentMobil || studentData.StudentMobil || studentData.studentPhone || studentData.StudentPhone || '1234567')
      };
      
      try {
        console.log('🔄 Updating existing student data:', updateData);
        
        // Log the exact payload being sent to API
        console.log('📤 API Update Payload:', JSON.stringify(updateData, null, 2));
        
        const updatedStudent = await api.updateStudent(studentId, updateData);
        console.log('✅ Student data updated successfully:', updatedStudent);
        
        // Update studentData state with the updated data
        setStudentData(updatedStudent || updateData);
        
        // Save updated studentData to localStorage for header navigation
        try {
          const studentDataForStorage = {
            ...(updatedStudent || updateData),
            userEmail: user?.email || user?.Email || '',
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem('studentData', JSON.stringify(studentDataForStorage));
          console.log('💾 Saved updated studentData to localStorage for header navigation:', studentDataForStorage);
        } catch (e) {
          console.warn('Failed to save updated studentData to localStorage:', e);
        }
        
        apiUpdateSuccess = true;
        
        // Also update localStorage to keep it in sync
        try {
          localStorage.setItem('userSocialMedia', JSON.stringify(socialData));
          console.log('💾 Updated localStorage after successful API update');
          
          // Dispatch event to update header navigation
          try {
            window.dispatchEvent(new CustomEvent('student-data-changed'));
            console.log('📢 Dispatched student-data-changed event');
          } catch (e) {
            console.warn('Failed to dispatch student-data-changed event:', e);
          }
          
          // Also save academies and branches data to localStorage for header display
          try {
            if (academies.length > 0) {
              localStorage.setItem('academiesData', JSON.stringify(academies));
              console.log('💾 Saved academies data to localStorage for header display');
            }
            if (branches.length > 0) {
              localStorage.setItem('branchesData', JSON.stringify(branches));
              console.log('💾 Saved branches data to localStorage for header display');
            }
          } catch (e) {
            console.warn('Failed to save academies/branches data to localStorage:', e);
          }
        } catch (e) {
          console.warn('Failed to update localStorage after student update:', e);
        }
        
        toast.success(lang === 'ar' ? 'تم تحديث البيانات بنجاح في الخادم' : 'Data updated successfully on server');
        
        // Show additional info about what was saved
        console.log('✅ Successfully saved to server:', {
          linkedIn: linkedInUrl,
          facebook: facebookUrl,
          phone: updateData.studentPhone,
          academy: selectedAcademy,
          branch: selectedBranch
        });
        
        // Auto-reload the page after successful update
        setTimeout(() => {
          console.log('🔄 Auto-reloading page after successful student data update...');
          window.location.reload();
        }, 2000); // Wait 2 seconds to show the success message
        
        return;
      } catch (error) {
        console.error('❌ Failed to update student data:', error);
        // Continue with create student record attempt
      }
    }
    
    // If no student data or update failed, try to create student record
    if (user?.email && (user?.role === 'Student' || user?.role === 'User' || !user?.role)) {
      try {
        const fullName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
        const phoneNumber = phone || user?.phoneNumber || user?.PhoneNumber || '';
        
        // Validate required fields according to StudentDataDto schema
        if (!fullName || fullName.length < 3) {
          throw new Error('Student name must be at least 3 characters long');
        }
        
        // Set default phone number if none provided (API requires 7-12 chars)
        let finalPhoneNumber = phoneNumber;
        if (!finalPhoneNumber || finalPhoneNumber.length < 7) {
          // Use user's phone number or generate a default one
          finalPhoneNumber = user?.phoneNumber || user?.PhoneNumber || '1234567';
          console.log('📱 Using default phone number:', finalPhoneNumber);
        }
        
        const newStudentData = {
          // Required fields
          studentNameL1: fullName,
          studentNameL2: fullName,
          studentAddress: 'N/A', // Required field with min 3 chars
          studentPhone: finalPhoneNumber, // Use validated phone number
          
          // Optional fields
          studentEmail: user.email,
          linkedIn: linkedInUrl || null, // Send null instead of empty string
          facebook: facebookUrl || null, // Send null instead of empty string
          
          // Academy and branch data
          academyDataId: selectedAcademy,
          branchesDataId: selectedBranch,
          
          // Set default values for other optional fields
          active: true,
          language: 'ar', // Default language
          trainingProvider: 'Academy System',
          
          // Add StudentMobil field as required by API
          studentMobil: finalPhoneNumber
        };
        
        console.log('🔄 Creating new student record:', newStudentData);
        
        // Log the exact payload being sent to API
        console.log('📤 API Payload:', JSON.stringify(newStudentData, null, 2));
        
        const createdStudent = await api.createStudent(newStudentData);
        console.log('✅ Student record created successfully:', createdStudent);
        
        // Update studentData state with the created student
        if (createdStudent) {
          setStudentData(createdStudent);
          
          // Save created studentData to localStorage for header navigation
          try {
            const studentDataForStorage = {
              ...createdStudent,
              userEmail: user?.email || user?.Email || '',
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('studentData', JSON.stringify(studentDataForStorage));
            console.log('💾 Saved created studentData to localStorage for header navigation:', studentDataForStorage);
          } catch (e) {
            console.warn('Failed to save created studentData to localStorage:', e);
          }
        }
        
        apiUpdateSuccess = true;
        
        // Also update localStorage to keep it in sync
        try {
          localStorage.setItem('userSocialMedia', JSON.stringify(socialData));
          console.log('💾 Updated localStorage after successful student creation');
          
          // Dispatch event to update header navigation
          try {
            window.dispatchEvent(new CustomEvent('student-data-changed'));
            console.log('📢 Dispatched student-data-changed event');
          } catch (e) {
            console.warn('Failed to dispatch student-data-changed event:', e);
          }
          
          // Also save academies and branches data to localStorage for header display
          try {
            if (academies.length > 0) {
              localStorage.setItem('academiesData', JSON.stringify(academies));
              console.log('💾 Saved academies data to localStorage for header display');
            }
            if (branches.length > 0) {
              localStorage.setItem('branchesData', JSON.stringify(branches));
              console.log('💾 Saved branches data to localStorage for header display');
            }
          } catch (e) {
            console.warn('Failed to save academies/branches data to localStorage:', e);
          }
        } catch (e) {
          console.warn('Failed to update localStorage after student creation:', e);
        }
        
        toast.success(lang === 'ar' ? 'تم إنشاء سجل طالب جديد وحفظ البيانات بنجاح' : 'New student record created and data saved successfully');
        
        // Show additional info about what was saved
        console.log('✅ Successfully created new student record:', {
          linkedIn: linkedInUrl,
          facebook: facebookUrl,
          phone: finalPhoneNumber,
          academy: selectedAcademy,
          branch: selectedBranch
        });
        
        // Auto-reload the page after successful creation
        setTimeout(() => {
          console.log('🔄 Auto-reloading page after successful student record creation...');
          window.location.reload();
        }, 2000); // Wait 2 seconds to show the success message
        
        return;
      } catch (createError) {
        console.error('❌ Failed to create student record:', createError);
        // Continue with localStorage fallback
      }
    }
    
    // If all API attempts failed, save to localStorage and show appropriate message
    try {
      localStorage.setItem('userSocialMedia', JSON.stringify(socialData));
      console.log('💾 Saved social media data to localStorage as fallback:', socialData);
      
      // Dispatch event to update header navigation even for localStorage fallback
      try {
        window.dispatchEvent(new CustomEvent('student-data-changed'));
        console.log('📢 Dispatched student-data-changed event for localStorage fallback');
      } catch (e) {
        console.warn('Failed to dispatch student-data-changed event:', e);
      }
      
      // Also save academies and branches data to localStorage for header display
      try {
        if (academies.length > 0) {
          localStorage.setItem('academiesData', JSON.stringify(academies));
          console.log('💾 Saved academies data to localStorage for header display');
        }
        if (branches.length > 0) {
          localStorage.setItem('branchesData', JSON.stringify(branches));
          console.log('💾 Saved branches data to localStorage for header display');
        }
      } catch (e) {
        console.warn('Failed to save academies/branches data to localStorage:', e);
      }
    } catch (e) {
      console.warn('Failed to save social media links to localStorage:', e);
    }
    
    if (apiUpdateSuccess) {
      toast.success(lang === 'ar' ? 'تم حفظ البيانات بنجاح في الخادم' : 'Data saved successfully on server');
    } else {
      toast.warning(lang === 'ar' 
        ? 'تم حفظ البيانات محلياً فقط. فشل في الاتصال بالخادم.' 
        : 'Data saved locally only. Failed to connect to server.'
      );
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileFile(file);
    
    if (tempPreviewUrl) {
      URL.revokeObjectURL(tempPreviewUrl);
    }
    
    if (file) {
      const url = URL.createObjectURL(file);
      setTempPreviewUrl(url);
      console.log('Temporary preview created for file:', file.name, 'size:', file.size);
    } else {
      setTempPreviewUrl('');
    }
  };

  const onUploadProfile = () => withBusy('upload', async () => { 
    if (profileFile) { 
      const userId = await resolveUserId();
      if (!userId) { toast.error(lang === 'ar' ? 'تعذر تحديد معرف المستخدم' : 'Unable to resolve user ID'); return; }
      console.log('Starting profile picture upload for file:', profileFile.name, 'size:', profileFile.size);
      
      await api.uploadProfilePicture(userId, profileFile); 
      toast.success(lang === 'ar' ? 'تم رفع الصورة بنجاح' : 'Profile picture uploaded successfully');
      
      setTimeout(async () => {
        try {
          console.log('Attempting to load uploaded profile picture from server...');
          const blob = await api.getProfilePicture(userId);
          if (blob && blob.size) {
            if (profilePreviewUrl) {
              URL.revokeObjectURL(profilePreviewUrl);
            }
            const url = URL.createObjectURL(blob);
            setProfilePreviewUrl(url);
            console.log('Profile picture loaded from server successfully, size:', blob.size);
          } else {
            console.warn('Uploaded profile picture not found on server');
            if (tempPreviewUrl) {
              if (profilePreviewUrl) {
                URL.revokeObjectURL(profilePreviewUrl);
              }
              setProfilePreviewUrl(tempPreviewUrl);
              console.log('Using temporary preview as fallback');
            }
          }
        } catch (e) {
          console.warn('Failed to load uploaded profile picture:', e?.message);
          if (tempPreviewUrl) {
            if (profilePreviewUrl) {
              URL.revokeObjectURL(profilePreviewUrl);
            }
            setProfilePreviewUrl(tempPreviewUrl);
          }
        }
      }, 600);
    } 
  });

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SupportAgent':
        return lang === 'ar' ? 'وكيل الدعم' : 'Support Agent';
      case 'Admin':
        return lang === 'ar' ? 'مدير النظام' : 'System Admin';
      case 'Instructor':
        return lang === 'ar' ? 'مدرس' : 'Instructor';
      case 'Student':
        return lang === 'ar' ? 'طالب' : 'Student';
      case 'User':
        return lang === 'ar' ? 'مستخدم' : 'User';
      default:
        return role || 'User';
    }
  };

  // Resolve effective role (upgrade to Admin when eligible)
  const getEffectiveRole = (u) => {
    if (!u) return 'User';
    const email = (u.email || u.Email || '').toLowerCase();
    const baseRole = u.role || u.Role || 'User';
    if (baseRole === 'SupportAgent' || baseRole === 'Admin' || baseRole === 'admin') return 'Admin';
    if (email === 'yjmt469999@gmail.com' || email === 'yjmt4699999@gmail.com') return 'Admin';
    try {
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      const storedRole = stored.role || stored.Role;
      if (storedRole === 'Admin' || storedRole === 'SupportAgent') return 'Admin';
    } catch (_) {}
    return baseRole;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SupportAgent':
      case 'Admin':
        return 'bg-red-500/20 text-red-700 border-red-300';
      case 'Instructor':
        return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'Student':
        return 'bg-green-500/20 text-green-700 border-green-300';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {lang === 'ar' ? 'حسابي' : 'My Account'}
          </h1>
          <p className="text-white/90 mb-6">
            {lang === 'ar' ? 'الملف الشخصي، الأمان وإعدادات الحساب' : 'Profile, security and account settings'}
          </p>

          {loading && (
            <div className="text-center text-white/90 py-16">
              {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {!loading && !error && user && (
            <div className="space-y-6">
              {/* User Profile Header */}
              <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-border overflow-hidden flex items-center justify-center">
                    {tempPreviewUrl ? (
                      <img src={tempPreviewUrl} alt="avatar preview" className="w-full h-full object-cover" />
                    ) : profilePreviewUrl ? (
                      <img src={profilePreviewUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-8 w-8 text-primary" />
                    )}
                  </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-foreground">
                          {user?.fullName || `${user?.firstName || user?.FirstName || ''} ${user?.lastName || user?.LastName || ''}`.trim() || 'User'}
                        </h2>
                        <Badge className={`px-3 py-1 text-sm font-medium border ${getRoleColor(getEffectiveRole(user))}`}>
                          {getRoleDisplayName(getEffectiveRole(user))}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        {user?.email || user?.Email || emailForConfirm || 'No email'}
                      </div>
                    {lastLogin && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3.5 w-3.5" /> 
                          {lang === 'ar' ? 'آخر تسجيل دخول:' : 'Last login:'} {lastLogin}
                        </div>
                    )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Admin Statistics */}
              {isAdmin && userStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-blue-400" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userStats.courses}</div>
                          <div className="text-muted-foreground text-sm">
                            {lang === 'ar' ? 'الدورات' : 'Courses'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-green-400" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userStats.students}</div>
                          <div className="text-muted-foreground text-sm">
                            {lang === 'ar' ? 'الطلاب' : 'Students'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-purple-400" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userStats.teachers}</div>
                          <div className="text-muted-foreground text-sm">
                            {lang === 'ar' ? 'المدرسين' : 'Teachers'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Building className="h-8 w-8 text-orange-400" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userStats.academies}</div>
                          <div className="text-muted-foreground text-sm">
                            {lang === 'ar' ? 'الأكاديميات' : 'Academies'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}



              {/* Profile Settings */}
              <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {lang === 'ar' ? 'إعدادات الملف الشخصي' : 'Profile Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Profile picture */}
                <div className="grid sm:grid-cols-[auto_1fr_auto] gap-3 items-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 border border-border overflow-hidden flex items-center justify-center">
                    {tempPreviewUrl ? (
                      <img src={tempPreviewUrl} alt="avatar preview" className="w-full h-full object-cover" />
                    ) : profilePreviewUrl ? (
                      <img src={profilePreviewUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-7 w-7 text-muted-foreground" />
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                    <Button onClick={onUploadProfile} disabled={!profileFile || busyAction==='upload'} className="rounded-full">
                      <Upload className="h-4 w-4 mr-2" /> 
                      {lang === 'ar' ? 'رفع' : 'Upload'}
                    </Button>
                </div>

                {/* Contact info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-foreground">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.email || user?.Email || emailForConfirm || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.phoneNumber || user?.PhoneNumber || phone || '-'}</span>
                  </div>
                </div>

                {/* Social Media Links for Students */}
                {(isUser || true) && (
                  <div className="space-y-4 border-t border-border pt-4">
                    <div className="text-sm font-medium text-foreground">
                      {lang === 'ar' ? 'روابط وسائل التواصل الاجتماعي' : 'Social Media Links'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lang === 'ar' ? 'أضف روابط حساباتك على وسائل التواصل الاجتماعي' : 'Add your social media profile links'}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          LinkedIn
                        </label>
                        <Input
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          value={linkedIn}
                          onChange={(e) => setLinkedIn(e.target.value)}
                          maxLength={100}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Facebook className="h-4 w-4 text-blue-500" />
                          Facebook
                        </label>
                        <Input
                          type="url"
                          placeholder="https://facebook.com/username"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          maxLength={100}
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={onUpdateSocialMedia}
                      disabled={busyAction === 'updateSocial'}
                      className="rounded-full bg-primary hover:bg-primary/90"
                    >
                      {busyAction === 'updateSocial' ? (
                        lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                      ) : (
                        lang === 'ar' ? 'حفظ الروابط' : 'Save Links'
                      )}
                    </Button>

                  </div>
                )}

                {/* Email confirmation - Read Only */}
                <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lang === 'ar' ? 'البريد الإلكتروني المسجل في الحساب' : 'Email address registered in the account'}
                    </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                      <Input 
                        value={user?.email || user?.Email || emailForConfirm || ''} 
                        disabled={true}
                        className="bg-muted/50"
                      />
                  </div>
                </div>

                {/* Phone verification - Read Only */}
                <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lang === 'ar' ? 'رقم الهاتف المسجل في الحساب' : 'Phone number registered in the account'}
                    </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                      <Input 
                        value={user?.phoneNumber || user?.PhoneNumber || phone || ''} 
                        disabled={true}
                        className="bg-muted/50"
                      />
                  </div>
                </div>

                {/* Academy and Branch Selection */}
                <div className="space-y-4">
                  <div className="text-sm font-medium">
                    {lang === 'ar' ? 'معلومات الأكاديمية' : 'Academy Information'}
                  </div>
                  
                  {/* Status messages */}
                  {loadingAcademyData && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {lang === 'ar' 
                        ? 'جاري تحميل بيانات الأكاديمية والفروع...' 
                        : 'Loading academy and branch data...'
                      }
                      </div>
                  )}
                  
                  {!loadingAcademyData && academies.length === 0 && branches.length === 0 && user && (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <span>
                          {lang === 'ar' 
                            ? 'فشل في تحميل بيانات الأكاديمية والفروع. يرجى المحاولة مرة أخرى.' 
                            : 'Failed to load academy and branch data. Please try again.'
                          }
                        </span>
                      <Button 
                          onClick={loadAcademyData}
                          size="sm"
                        variant="outline" 
                          className="ml-2"
                      >
                          {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!loadingAcademyData && academies.length === 0 && branches.length === 0 && !user && (
                    <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      {lang === 'ar' 
                        ? 'يرجى تسجيل الدخول لتحميل بيانات الأكاديمية والفروع' 
                        : 'Please log in to load academy and branch data'
                      }
                  </div>
                  )}
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Academy Selection */}
                <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {lang === 'ar' ? 'الأكاديمية *' : 'Academy *'}
                      </label>
                      
                      {/* Show academy name if loaded from API, otherwise show selection */}
                      {studentData && (studentData.academyDataId || studentData.AcademyDataId) && !loadingAcademyData ? (
                        // Read-only display for academy loaded from API
                        <div className="p-3 bg-muted/50 rounded-lg border border-border">
                          <div className="text-sm text-muted-foreground mb-1">
                            {lang === 'ar' ? 'الأكاديمية المسجلة:' : 'Registered Academy:'}
                    </div>
                          <div className="font-medium">
                            {(() => {
                              const academyId = studentData.academyDataId || studentData.AcademyDataId;
                              const academy = academies.find(a => a.id === academyId);
                              return academy ? (academy.academyNameL1 || academy.AcademyNameL1 || academy.academyNameL2 || academy.AcademyNameL2 || academy.name || academy.id) : academyId;
                            })()}
                          </div>
                        </div>
                      ) : (
                        // Selection dropdown for new academy
                        <Select 
                          value={selectedAcademy} 
                          onValueChange={setSelectedAcademy}
                          disabled={loadingAcademyData}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue 
                              placeholder={loadingAcademyData 
                                ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') 
                                : academies.length === 0
                                ? (lang === 'ar' ? 'لا توجد أكاديميات' : 'No academies available')
                                : (lang === 'ar' ? 'اختر الأكاديمية' : 'Choose academy')
                              } 
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {academies.map((academy) => (
                              <SelectItem key={academy.id} value={academy.id}>
                                {academy.academyNameL1 || academy.AcademyNameL1 || academy.academyNameL2 || academy.AcademyNameL2 || academy.name || academy.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                  </div>

                                        {/* Branch Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {lang === 'ar' ? 'الفرع *' : 'Branch *'}
                      </label>
                      
                      {/* Show branch name if loaded from API, otherwise show selection */}
                      {studentData && (studentData.branchesDataId || studentData.BranchesDataId) && !loadingAcademyData ? (
                        // Read-only display for branch loaded from API
                        <div className="p-3 bg-muted/50 rounded-lg border border-border">
                          <div className="text-sm text-muted-foreground mb-1">
                            {lang === 'ar' ? 'الفرع المسجل:' : 'Registered Branch:'}
                </div>
                          <div className="font-medium">
                            {(() => {
                              const branchId = studentData.branchesDataId || studentData.BranchesDataId;
                              const branch = branches.find(b => b.id === branchId);
                              return branch ? (branch.branchNameL1 || branch.BranchNameL1 || branch.branchNameL2 || branch.BranchNameL2 || branch.name || branch.id) : branchId;
                            })()}
                          </div>
                        </div>
                      ) : (
                        // Selection logic for new branch
                        <>
                          {/* Check if there are branches for selected academy */}
                          {selectedAcademy && !loadingAcademyData && (() => {
                            const availableBranches = branches.filter(branch => 
                              branch.academyDataId === selectedAcademy || branch.AcademyDataId === selectedAcademy
                            );
                            
                            if (availableBranches.length === 0) {
                              return (
                                <div className="space-y-2">
                                  <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                                      <span className="text-orange-500">⚠️</span>
                                      <span>
                                        {lang === 'ar' 
                                          ? 'لا توجد فروع متاحة لهذه الأكاديمية حالياً' 
                                          : 'No branches available for this academy currently'
                                        }
                                      </span>
                      </div>
                  </div>
                                  
                                  {/* Disabled branch select when no branches available */}
                                  <Select 
                                    value={selectedBranch} 
                                    onValueChange={setSelectedBranch}
                                    disabled={true}
                                  >
                                    <SelectTrigger className="bg-background opacity-50">
                                      <SelectValue 
                                        placeholder={lang === 'ar' ? 'لا توجد فروع متاحة' : 'No branches available'} 
                                      />
                                    </SelectTrigger>
                                  </Select>
                                </div>
                              );
                            }
                            
                            return (
                              <Select 
                                value={selectedBranch} 
                                onValueChange={setSelectedBranch}
                                disabled={loadingAcademyData}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue 
                                    placeholder={loadingAcademyData 
                                      ? (lang === 'ar' ? 'جاري التحميل...' : 'Loading...') 
                                      : (lang === 'ar' ? 'اختر الفرع' : 'Choose branch')
                                    } 
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableBranches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                      {branch.branchNameL1 || branch.BranchNameL1 || branch.branchNameL2 || branch.BranchNameL2 || branch.name || branch.id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          })()}
                          
                          {/* Show disabled select when no academy is selected */}
                          {!selectedAcademy && (
                            <Select 
                              value={selectedBranch} 
                              onValueChange={setSelectedBranch}
                              disabled={true}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue 
                                  placeholder={lang === 'ar' ? 'اختر الأكاديمية أولاً' : 'Choose academy first'} 
                                />
                              </SelectTrigger>
                            </Select>
                          )}
                        </>
                      )}
                  </div>
                </div>

                  {/* Save Academy and Branch Button */}
                  <div className="pt-2">
                    {/* Show info message when data is read-only */}
                    {studentData && (studentData.academyDataId || studentData.AcademyDataId) && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                  <div className="flex items-center gap-2">
                          <span className="text-blue-500">ℹ️</span>
                          <span>
                            {lang === 'ar' 
                              ? 'معلومات الأكاديمية والفرع مسجلة مسبقاً ولا يمكن تعديلها' 
                              : 'Academy and branch information is already registered and cannot be modified'
                            }
                          </span>
                      </div>
                  </div>
                    )}
                    
                      <Button 
                      onClick={onUpdateSocialMedia}
                      disabled={busyAction === 'updateSocial' || 
                        // Disable if data is already loaded from API
                        (studentData && (studentData.academyDataId || studentData.AcademyDataId)) ||
                        // Or if no academy/branch selected for new data
                        !selectedAcademy || (() => {
                          // Check if there are available branches for selected academy
                          if (!selectedAcademy) return true;
                          const availableBranches = branches.filter(branch => 
                            branch.academyDataId === selectedAcademy || branch.AcademyDataId === selectedAcademy
                          );
                          return availableBranches.length === 0 || !selectedBranch;
                        })()
                      }
                      className="rounded-full bg-primary hover:bg-primary/90"
                    >
                      {busyAction === 'updateSocial' ? (
                        lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'
                      ) : studentData && (studentData.academyDataId || studentData.AcademyDataId) ? (
                        lang === 'ar' ? 'معلومات مسجلة مسبقاً' : 'Information Already Registered'
                      ) : (
                        lang === 'ar' ? 'حفظ معلومات الأكاديمية' : 'Save Academy Information'
                      )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* Account Management */}
              <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {lang === 'ar' ? 'إدارة الحساب' : 'Account Management'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Account status - Read Only */}
                <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                      <div className="text-foreground font-medium">
                        {lang === 'ar' ? 'حالة الحساب' : 'Account status'}
                      </div>
                  </div>

                </div>

                {/* Logout */}
                <div className="pt-2">
                  <Button onClick={logout} variant="outline" className="rounded-full inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                      <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                  </Button>
                </div>
                </CardContent>
              </Card>
              </div>
            )}
        </motion.div>
      </div>
      <Toaster position="top-center" richColors offset="140px" />
    </section>
  );
};

export default AccountPage; 