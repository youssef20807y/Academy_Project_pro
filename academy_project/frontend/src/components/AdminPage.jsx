import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useI18n } from '../lib/i18n';
import { 
  Settings, Building, Users, BookOpen, Briefcase, 
  Plus, Search, Edit, Trash2, Eye, FileText, 
  Calendar, MapPin, Mail, Phone, Globe, 
  Database, BarChart3, Shield, UserCheck, 
  GraduationCap, BookOpenCheck, ClipboardList,
  MessageSquare, AlertTriangle, CheckCircle, XCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { toast, Toaster } from 'sonner';
import api from '../services/api';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';


const AdminPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  
  // Check admin permissions
  const [user, setUser] = React.useState(null);
  const [hasAccess, setHasAccess] = React.useState(false);
  
  // State for different data types
  const [projectsMaster, setProjectsMaster] = React.useState([]);
  const [projectsDetail, setProjectsDetail] = React.useState([]);
  const [programsContentMaster, setProgramsContentMaster] = React.useState([]);
  const [programsContentDetail, setProgramsContentDetail] = React.useState([]);
  const [programsDetails, setProgramsDetails] = React.useState([]);
  const [academies, setAcademies] = React.useState([]);
  const [branches, setBranches] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [governorates, setGovernorates] = React.useState([]);
  const [cities, setCities] = React.useState([]);
  const [projectCategories, setProjectCategories] = React.useState([]);

  
  // Complaints data
  const [complaints, setComplaints] = React.useState([]);
  const [complaintTypes, setComplaintTypes] = React.useState([]);
  const [complaintStatuses, setComplaintStatuses] = React.useState([]);
  
  // Loading states
  const [loading, setLoading] = React.useState(true);
  const [loadingStates, setLoadingStates] = React.useState({
    students: false,
    teachers: false,
    academies: false,
    branches: false,
    projects: false,
    programs: false,
    courses: false,
    complaints: false
  });
  const [sectionsLoaded, setSectionsLoaded] = React.useState({
    students: false,
    teachers: false,
    academies: false,
    branches: false,
    projects: false,
    programs: false,
    courses: false,
    complaints: false
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // رسائل النجاح المخصصة
  const [successMessage, setSuccessMessage] = React.useState('');
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [complaintStatusDialogOpen, setComplaintStatusDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [selectedType, setSelectedType] = React.useState('');
  
  // Form states
  const [formData, setFormData] = React.useState({});
  const [formErrors, setFormErrors] = React.useState({});

  React.useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const userData = localStorage.getItem('userData');
        const authToken = localStorage.getItem('authToken');
        
        if (!authToken) {
          toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }
        
        if (userData) {
          const userObj = JSON.parse(userData);
          setUser(userObj);
          
          const userEmail = userObj.email || userObj.Email || '';
          const userRole = userObj.role || userObj.Role || '';
          
          // Check if user has admin access
          const isAdmin = userRole === 'SupportAgent' || userRole === 'Admin' || userRole === 'admin' || userEmail === 'yjmt469999@gmail.com';
          
          if (!isAdmin) {
            toast.error(lang === 'ar' ? 'ليس لديك صلاحية للوصول للوحة الإدارة' : 'You do not have permission to access the admin panel');
            setTimeout(() => {
              window.location.href = '/account';
            }, 2000);
            return;
          }
          
          setHasAccess(true);
        } else {
          toast.error(lang === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        toast.error(lang === 'ar' ? 'خطأ في التحقق من الصلاحيات' : 'Error checking permissions');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    };
    
    checkAdminAccess();
  }, [lang]);

  React.useEffect(() => {
    if (hasAccess) {
      loadAllData();
    }
  }, [hasAccess]);
  
  // Don't render admin panel if user doesn't have access
  if (!hasAccess) {
    return (
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
        <div className="absolute inset-0 z-0 bg-black/55" />
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/90">{lang === 'ar' ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...'}</p>
          </div>
        </div>
      </section>
    );
  }

  const setLoadingState = (section, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [section]: isLoading
    }));
  };

  const loadSectionData = async (section) => {
    setLoadingState(section, true);
    try {
      let data = [];
      switch (section) {
        case 'students':
          data = await api.getStudents();
          setStudents(Array.isArray(data) ? data : []);
          break;
        case 'teachers':
          data = await api.getTeachers();
          setTeachers(Array.isArray(data) ? data : []);
          break;
        case 'academies':
          data = await api.getAcademies();
          const academiesData = data?.academies || data || [];
          setAcademies(Array.isArray(academiesData) ? academiesData : []);
          break;
        case 'branches':
          data = await api.getBranches();
          setBranches(Array.isArray(data) ? data : []);
          break;
        case 'projects':
          const [projectsMaster, projectsDetail] = await Promise.all([
            api.getProjects().catch(() => []),
            api.getProjectsDetail().catch(() => [])
          ]);
          console.log('Loaded projectsMaster:', projectsMaster);
          console.log('Loaded projectsDetail:', projectsDetail);
          
          // Extract data from responses
          const projectsMasterData = projectsMaster?.projects || projectsMaster || [];
          const projectsDetailData = projectsDetail?.project_details || projectsDetail || [];
          
          console.log('Extracted projectsMasterData:', projectsMasterData);
          console.log('Extracted projectsDetailData:', projectsDetailData);
          
          setProjectsMaster(Array.isArray(projectsMasterData) ? projectsMasterData : []);
          setProjectsDetail(Array.isArray(projectsDetailData) ? projectsDetailData : []);
          
          // Extract unique categories from existing projects
          const uniqueCategories = [...new Set(projectsMasterData
            .filter(project => project.category)
            .map(project => project.category)
          )];
          setProjectCategories(uniqueCategories);
          break;
        case 'programs':
          const [programsMaster, programsDetail] = await Promise.all([
            api.getProgramsContentMaster().catch(() => []),
            api.getProgramsContentDetail().catch(() => [])
          ]);
          console.log('Loaded programsMaster:', programsMaster);
          console.log('Loaded programsContentDetail:', programsDetail);
          
          // Extract programs array from response
          const programsData = programsMaster?.programs || programsMaster || [];
          const programsDetailData = programsDetail?.program_details || programsDetail || [];
          
          console.log('Extracted programsData:', programsData);
          console.log('Extracted programsDetailData:', programsDetailData);
          
          if (programsDetailData && programsDetailData.length > 0) {
            console.log('Sample programsContentDetail item:', programsDetailData[0]);
            console.log('Available fields in programsContentDetail:', Object.keys(programsDetailData[0]));
          }
          setProgramsContentMaster(Array.isArray(programsData) ? programsData : []);
          setProgramsContentDetail(Array.isArray(programsDetailData) ? programsDetailData : []);
          break;
        case 'courses':
          data = await api.getCourses();
          setCourses(Array.isArray(data) ? data : []);
          break;
        case 'complaints':
          const [complaintsData, typesData, statusesData] = await Promise.all([
            api.getComplaints().catch(() => []),
            api.getComplaintTypes().catch(() => []),
            api.getComplaintStatus().catch(() => [])
          ]);
          
          setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
          setComplaintTypes(Array.isArray(typesData) ? typesData : []);
          setComplaintStatuses(Array.isArray(statusesData) ? statusesData : []);
          break;
        default:
          break;
      }
      
      setSectionsLoaded(prev => ({ ...prev, [section]: true }));
      
      // عرض رسالة نجاح مخصصة
      const message = lang === 'ar' ? `تم تحميل بيانات ${getSectionDisplayName(section)}` : `Loaded ${getSectionDisplayName(section)} data`;
      setSuccessMessage(message);
      setShowSuccessMessage(true);
      
      // إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (error) {
      console.error(`Error loading ${section} data:`, error);
      
      // Check if it's an authentication error
      if (error.status === 401 || error.status === 403) {
        toast.error(lang === 'ar' ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(lang === 'ar' ? `خطأ في تحميل بيانات ${getSectionDisplayName(section)}` : `Error loading ${getSectionDisplayName(section)} data`);
      }
    } finally {
      setLoadingState(section, false);
    }
  };

  const getSectionDisplayName = (section) => {
    switch (section) {
      case 'students': return lang === 'ar' ? 'الطلاب' : 'Students';
      case 'teachers': return lang === 'ar' ? 'المدرسين' : 'Teachers';
      case 'academies': return lang === 'ar' ? 'الأكاديميات' : 'Academies';
      case 'branches': return lang === 'ar' ? 'الفروع' : 'Branches';
      case 'projects': return lang === 'ar' ? 'المشاريع' : 'Projects';
      case 'programs': return lang === 'ar' ? 'البرامج' : 'Programs';
      case 'courses': return lang === 'ar' ? 'الدورات' : 'Courses';
      case 'complaints': return lang === 'ar' ? 'الشكاوى' : 'Complaints';
      default: return section;
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading all data for admin panel...');
      
      // تحميل البيانات الأساسية أولاً (بدون إعادة محاولة طويلة)
      const loadDataFast = async (apiCall, name) => {
        try {
          const data = await apiCall();
          console.log(`Successfully loaded ${name}`);
          console.log(`Raw ${name} data:`, data);
          
          // Handle different response formats
          let result = data;
          if (data && typeof data === 'object') {
            // Extract array from response object based on the data type
            if (name === 'academies' && data.academies) {
              result = data.academies;
            } else if (name === 'students' && data.students) {
              result = data.students;
            } else if (name === 'teachers' && data.teachers) {
              result = data.teachers;
            } else if (name === 'branches' && data.branches) {
              result = data.branches;
            } else if (name === 'countries' && data.countries) {
              result = data.countries;
            } else if (name === 'governorates' && data.governorates) {
              result = data.governorates;
            } else if (name === 'cities' && data.cities) {
              result = data.cities;
            } else if (name === 'projects' && data.projects) {
              result = data.projects;
            } else if (name === 'project_details' && data.project_details) {
              result = data.project_details;
            } else if (name === 'programs' && data.programs) {
              result = data.programs;
            } else if (name === 'programs master' && data.programs) {
              result = data.programs;
            } else if (name === 'program_details' && data.program_details) {
              result = data.program_details;
            } else if (name === 'programs content detail' && data.program_details) {
              result = data.program_details;
            } else if (name === 'courses' && data.courses) {
              result = data.courses;
            } else if (name === 'complaints' && data.complaints) {
              result = data.complaints;
            } else if (name === 'complaint_types' && data.complaint_types) {
              result = data.complaint_types;
            } else if (name === 'complaint_status' && data.complaint_status) {
              result = data.complaint_status;
            }
          }
          
          return Array.isArray(result) ? result : [];
        } catch (error) {
          console.warn(`Failed to load ${name}:`, error);
          
          // Check if it's an authentication error
          if (error.status === 401 || error.status === 403) {
            console.warn(`Authentication error loading ${name}, redirecting to login`);
            toast.error(lang === 'ar' ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return [];
          }
          
          return [];
        }
      };

      // تحميل البيانات الأساسية أولاً (الضرورية للعمل)
      const essentialData = await Promise.allSettled([
        loadDataFast(() => api.getStudents(), 'students'),
        loadDataFast(() => api.getTeachers(), 'teachers'),
        loadDataFast(() => api.getAcademies(), 'academies'),
        loadDataFast(() => api.getBranches(), 'branches'),
        loadDataFast(() => api.getCountries(), 'countries'),
        loadDataFast(() => api.getGovernorates(), 'governorates'),
        loadDataFast(() => api.getCities(), 'cities')
      ]);

      // استخراج البيانات الأساسية
      const extractData = (result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error('Promise rejected:', result.reason);
          return [];
        }
      };

      const [finalStudents, finalTeachers, finalAcademies, finalBranches, finalCountries, finalGovernorates, finalCities] = essentialData.map(extractData);

      // Extract academies data from response format
      const academiesArray = finalAcademies?.academies || finalAcademies || [];

      // Assign essential data immediately
      setStudents(finalStudents);
      setTeachers(finalTeachers);
      setAcademies(Array.isArray(academiesArray) ? academiesArray : []);
      setBranches(finalBranches);
      
      // تعيين بيانات الموقع من الخادم فقط
      setCountries(finalCountries);
      setGovernorates(finalGovernorates);
      setCities(finalCities);

      // إيقاف التحميل الرئيسي بعد تحميل البيانات الأساسية
      setLoading(false);

      // تحميل البيانات الثانوية في الخلفية (غير ضرورية للعمل الفوري)
      setTimeout(async () => {
        try {
          const secondaryData = await Promise.allSettled([
            loadDataFast(() => api.getProjects(), 'projects'),
            loadDataFast(() => api.getProjectsDetail(), 'projects detail'),
            loadDataFast(() => api.getProgramsContentMaster(), 'programs master'),
            loadDataFast(() => api.getProgramsContentDetail(), 'programs content detail'),
            loadDataFast(() => api.getCourses(), 'courses')
          ]);

          const [finalProjectsMaster, finalProjectsDetail, finalProgramsContentMaster, finalProgramsContentDetail, finalCourses] = secondaryData.map(extractData);

          // تعيين البيانات الثانوية
          setProjectsMaster(finalProjectsMaster);
          setProjectsDetail(finalProjectsDetail);
          setProgramsContentMaster(finalProgramsContentMaster);
          setProgramsContentDetail(finalProgramsContentDetail);
          setCourses(finalCourses);
          
          // تحميل بيانات الشكاوى من الخادم
          try {
            const [complaintsData, typesData, statusesData] = await Promise.all([
              api.getComplaints().catch(() => []),
              api.getComplaintTypes().catch(() => []),
              api.getComplaintStatus().catch(() => [])
            ]);
            
            console.log('Raw complaints data:', complaintsData);
            console.log('Raw complaint types data:', typesData);
            console.log('Raw complaint statuses data:', statusesData);
            
            // Extract arrays from response objects
            const complaintsArray = (complaintsData && complaintsData.complaints) ? complaintsData.complaints : Array.isArray(complaintsData) ? complaintsData : [];
            const typesArray = (typesData && typesData.complaint_types) ? typesData.complaint_types : Array.isArray(typesData) ? typesData : [];
            const statusesArray = (statusesData && statusesData.complaint_status) ? statusesData.complaint_status : Array.isArray(statusesData) ? statusesData : [];
            
            setComplaintTypes(typesArray);
            setComplaintStatuses(statusesArray);
            setComplaints(complaintsArray);
            
            // تحديث حالة التحميل للشكاوى
            setSectionsLoaded(prev => ({ ...prev, complaints: true }));
          } catch (complaintError) {
            console.error('Error loading complaints data:', complaintError);
            if (complaintError.status === 401 || complaintError.status === 403) {
              toast.error(lang === 'ar' ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again');
              setTimeout(() => {
                window.location.href = '/login';
              }, 2000);
            }
          }

          console.log('Secondary data loaded successfully:', {
            projectsMaster: finalProjectsMaster?.length || 0,
            projectsDetail: finalProjectsDetail?.length || 0,
            programsContentMaster: finalProgramsContentMaster?.length || 0,
            programsContentDetail: finalProgramsContentDetail?.length || 0,
            courses: finalCourses?.length || 0
          });
          
          console.log('programsContentDetail data:', finalProgramsContentDetail);
          if (finalProgramsContentDetail && finalProgramsContentDetail.length > 0) {
            console.log('Sample programsContentDetail item from loadAllData:', finalProgramsContentDetail[0]);
            console.log('Available fields in programsContentDetail from loadAllData:', Object.keys(finalProgramsContentDetail[0]));
          }

        } catch (error) {
          console.error('Error loading secondary data:', error);
          if (error.status === 401 || error.status === 403) {
            toast.error(lang === 'ar' ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        }
      }, 100); // تأخير قصير جداً

      console.log('Essential data loaded successfully:', {
        students: finalStudents?.length || 0,
        teachers: finalTeachers?.length || 0,
        academies: finalAcademies?.length || 0,
        branches: finalBranches?.length || 0,
        countries: finalCountries?.length || 0,
        governorates: finalGovernorates?.length || 0,
        cities: finalCities?.length || 0
      });

      // عرض رسالة نجاح إذا تم تحميل البيانات الأساسية
      const totalLoaded = [
        finalStudents.length,
        finalTeachers.length,
        finalAcademies.length,
        finalBranches.length
      ].reduce((sum, count) => sum + count, 0);

      if (totalLoaded > 0) {
        const message = lang === 'ar' ? `تم تحميل ${totalLoaded} عنصر بنجاح` : `Successfully loaded ${totalLoaded} items`;
        setSuccessMessage(message);
        setShowSuccessMessage(true);
        
        // إخفاء الرسالة بعد 3 ثواني
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      
      // Check if it's an authentication error
      if (error.status === 401 || error.status === 403) {
        toast.error(lang === 'ar' ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' : 'Session expired, please login again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(lang === 'ar' ? 'خطأ في تحميل البيانات - يرجى إعادة تحميل الصفحة' : 'Error loading data - Please refresh the page');
      }
      
      setLoading(false);
    }
  };

  const handleAdd = async (type) => {
    setSelectedType(type);
    setFormData({});
    setFormErrors({}); // Clear any previous errors
    
    console.log('Adding new item of type:', type);
    
    // Ensure location data is loaded from server when needed
    if (type === 'academy' || type === 'branch' || type === 'teacher') {
      if (!countries?.length) {
        const countriesData = await api.getCountries();
        setCountries(Array.isArray(countriesData) ? countriesData : []);
      }
      if (!governorates?.length) {
        const governoratesData = await api.getGovernorates();
        setGovernorates(Array.isArray(governoratesData) ? governoratesData : []);
      }
      if (!cities?.length) {
        const citiesData = await api.getCities();
        setCities(Array.isArray(citiesData) ? citiesData : []);
      }
    }
    setAddDialogOpen(true);
  };

  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    
    // Reset form data
    setFormData({});
    setFormErrors({});
    
    // Populate form with item data based on type
    if (type === 'programMaster') {
      console.log('Setting form data for programMaster:', {
        item: item,
        name: item.name,
        name2: item.name2,
        description: item.description
      });
      
      setFormData({
        SessionNameL1: item.name || '',
        SessionNameL2: item.name2 || '',
        Description: item.description || ''
      });
    } else if (type === 'projectDetail') {
      setFormData({
        ProjectsMasterId: item.projectsMasterId || item.ProjectsMasterId || '',
        ProjectNameL1: item.projectNameL1 || item.ProjectNameL1 || '',
        ProjectNameL2: item.projectNameL2 || item.ProjectNameL2 || '',
        Description: item.description || item.Description || ''
      });
    } else if (type === 'programDetail') {
      setFormData({
        ProgramsContentMasterId: item.programsContentMasterId || item.ProgramsContentMasterId || '',
        Description: item.description || item.Description || '',
        SessionVideo: item.sessionVideo || item.SessionVideo || ''
      });
    } else if (type === 'student') {
      setFormData({
        StudentName: item.name || '',
        Email: item.email || '',
        Phone: item.phone || '',
        Address: item.address || '',
        BirthDate: item.birth_date || '',
        EnrollmentDate: item.enrollment_date || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'teacher') {
      setFormData({
        TeacherName: item.name || '',
        Email: item.email || '',
        Phone: item.phone || '',
        Specialization: item.specialization || '',
        ExperienceYears: item.experience_years || '',
        Bio: item.bio || '',
        ImageUrl: item.image_url || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'academy') {
      setFormData({
        AcademyName: item.name || '',
        Description: item.description || '',
        Address: item.address || '',
        Phone: item.phone || '',
        Email: item.email || '',
        Website: item.website || ''
      });
    } else if (type === 'branch') {
      setFormData({
        AcademyId: item.academy_id || '',
        BranchName: item.name || '',
        Address: item.address || '',
        Phone: item.phone || '',
        Email: item.email || '',
        GovernorateId: item.governorate_id || '',
        CityId: item.city_id || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'academyMaster') {
      setFormData({
        MasterName: item.name || '',
        Description: item.description || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'academyType') {
      setFormData({
        TypeName: item.name || '',
        Description: item.description || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'job') {
      setFormData({
        JobTitle: item.title || '',
        Description: item.description || '',
        Requirements: item.requirements || '',
        SalaryRange: item.salary_range || '',
        Location: item.location || '',
        JobType: item.type || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'projectMaster') {
      setFormData({
        ProjectName: item.name || '',
        Description: item.description || '',
        Category: item.category || '',
        Status: item.status || '',
        StartDate: item.start_date || '',
        EndDate: item.end_date || '',
        ImageUrl: item.image_url || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'projectDetail') {
      setFormData({
        ProjectsMasterId: item.project_id || '',
        ProjectTitle: item.title || '',
        ProjectContent: item.content || '',
        OrderIndex: item.order_index || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'programDetail') {
      setFormData({
        ProgramsContentMasterId: item.program_id || '',
        Description: item.content || '',
        SessionVideo: item.session_video || '',
        OrderIndex: item.order_index || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else if (type === 'complaint') {
      console.log('Setting form data for complaint:', {
        item: item,
        StudentsDataId: item.StudentsDataId || item.studentsDataId,
        ComplaintsTypeId: item.ComplaintsTypeId || item.complaintsTypeId,
        ComplaintsStatusesId: item.ComplaintsStatusesId || item.complaintsStatusesId,
        Description: item.Description || item.description,
        Date: item.Date || item.date
      });
      
      const complaintFormData = {
        StudentsDataId: item.StudentsDataId || item.studentsDataId || '',
        ComplaintsTypeId: item.ComplaintsTypeId || item.complaintsTypeId || '',
        ComplaintsStatusesId: item.ComplaintsStatusesId || item.complaintsStatusesId || '',
        Description: item.Description || item.description || '',
        Date: item.Date || item.date || new Date().toISOString().split('T')[0],
        AcademyDataId: item.AcademyDataId || item.academyDataId || '',
        BranchesDataId: item.BranchesDataId || item.branchesDataId || ''
      };
      
      console.log('Final complaint form data:', complaintFormData);
      setFormData(complaintFormData);
    } else if (type === 'complaintType') {
      setFormData({
        AcademyDataId: item.AcademyDataId || item.academyDataId || '',
        BranchesDataId: item.BranchesDataId || item.branchesDataId || '',
        typeNameL1: item.typeNameL1 || item.TypeNameL1 || '',
        typeNameL2: item.typeNameL2 || item.TypeNameL2 || '',
        Description: item.Description || item.description || ''
      });
    } else if (type === 'complaintStatus') {
      setFormData({
        AcademyDataId: item.AcademyDataId || item.academyDataId || '',
        BranchesDataId: item.BranchesDataId || item.branchesDataId || '',
        statusNameL1: item.statusNameL1 || item.StatusNameL1 || item.StatusesNameL1 || '',
        statusNameL2: item.statusNameL2 || item.StatusNameL2 || item.StatusesNameL2 || '',
        Description: item.Description || item.description || ''
      });
    } else if (type === 'projectMaster') {
      setFormData({
        AcademyDataId: item.academyDataId || item.AcademyDataId || '',
        BranchesDataId: item.branchesDataId || item.BranchesDataId || '',
        ProjectNameL1: item.projectNameL1 || item.ProjectNameL1 || '',
        ProjectNameL2: item.projectNameL2 || item.ProjectNameL2 || '',
        ProjectStart: item.projectStart || item.ProjectStart || '',
        ProjectEnd: item.projectEnd || item.ProjectEnd || '',
        ProjectCategory: item.category || item.ProjectCategory || '',
        NewProjectCategory: '',
        Description: item.description || item.Description || '',
        Active: item.active !== undefined ? item.active : true
      });
    } else {
      // For other types, use the item directly
      setFormData(item);
    }
    
    setEditDialogOpen(true);
  };

  const handleDelete = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedItem || !selectedType) {
      toast.error(lang === 'ar' ? 'خطأ: لم يتم تحديد العنصر للتعديل' : 'Error: No item selected for editing');
      return;
    }

    try {
      // Validate required fields based on type
      const errors = {};
      
      if (selectedType === 'student') {
        if (!formData.StudentNameL1) errors.StudentNameL1 = lang === 'ar' ? 'اسم الطالب مطلوب' : 'Student name is required';
        if (!formData.Email) errors.Email = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      } else if (selectedType === 'teacher') {
        if (!formData.TeacherNameL1) errors.TeacherNameL1 = lang === 'ar' ? 'اسم المدرس مطلوب' : 'Teacher name is required';
        if (!formData.Email) errors.Email = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      } else if (selectedType === 'academy') {
        if (!formData.AcademyNameL1) errors.AcademyNameL1 = lang === 'ar' ? 'اسم الأكاديمية مطلوب' : 'Academy name is required';
      } else if (selectedType === 'branch') {
        if (!formData.BranchNameL1) errors.BranchNameL1 = lang === 'ar' ? 'اسم الفرع مطلوب' : 'Branch name is required';
        if (!formData.AcademyDataId) errors.AcademyDataId = lang === 'ar' ? 'الأكاديمية مطلوبة' : 'Academy is required';
      } else if (selectedType === 'course') {
        if (!formData.CourseNameL1) errors.CourseNameL1 = lang === 'ar' ? 'اسم الدورة مطلوب' : 'Course name is required';
      } else if (selectedType === 'projectMaster') {
        if (!formData.ProjectNameL1) errors.ProjectNameL1 = lang === 'ar' ? 'اسم المشروع مطلوب' : 'Project name is required';
        if (!formData.AcademyDataId) errors.AcademyDataId = lang === 'ar' ? 'الأكاديمية مطلوبة' : 'Academy is required';
        if (!formData.BranchesDataId) errors.BranchesDataId = lang === 'ar' ? 'الفرع مطلوب' : 'Branch is required';
      } else if (selectedType === 'projectDetail') {
        if (!formData.ProjectNameL1) errors.ProjectNameL1 = lang === 'ar' ? 'اسم المشروع مطلوب' : 'Project name is required';
        if (!formData.ProjectsMasterId) errors.ProjectsMasterId = lang === 'ar' ? 'المشروع الرئيسي مطلوب' : 'Project master is required';
      } else if (selectedType === 'programMaster') {
        if (!formData.SessionNameL1) errors.SessionNameL1 = lang === 'ar' ? 'اسم الجلسة مطلوب' : 'Session name is required';
      } else if (selectedType === 'programDetail') {
        if (!formData.Description) errors.Description = lang === 'ar' ? 'الوصف مطلوب' : 'Description is required';
        if (!formData.ProgramsContentMasterId) errors.ProgramsContentMasterId = lang === 'ar' ? 'البرنامج الرئيسي مطلوب' : 'Program master is required';
      } else if (selectedType === 'complaint') {
        if (!formData.StudentsDataId) errors.StudentsDataId = lang === 'ar' ? 'الطالب مطلوب' : 'Student is required';
        if (!formData.ComplaintsTypeId) errors.ComplaintsTypeId = lang === 'ar' ? 'نوع الشكوى مطلوب' : 'Complaint type is required';
        if (!formData.ComplaintsStatusesId) errors.ComplaintsStatusesId = lang === 'ar' ? 'حالة الشكوى مطلوبة' : 'Complaint status is required';
        if (!formData.Description) errors.Description = lang === 'ar' ? 'وصف الشكوى مطلوب' : 'Complaint description is required';
        if (formData.Description && formData.Description.length < 10) {
          errors.Description = lang === 'ar' ? 'وصف الشكوى يجب أن يكون 10 أحرف على الأقل' : 'Complaint description must be at least 10 characters';
        }
      } else if (selectedType === 'complaintType') {
        if (!formData.typeNameL1) errors.typeNameL1 = lang === 'ar' ? 'اسم النوع مطلوب' : 'Type name is required';
      } else if (selectedType === 'complaintStatus') {
        if (!formData.statusNameL1) errors.statusNameL1 = lang === 'ar' ? 'اسم الحالة مطلوب' : 'Status name is required';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      // Clean the form data for API
      const cleanedData = cleanFormDataForAPI(formData, selectedType);
      console.log('Cleaned data:', cleanedData);
      console.log('Cleaned data type:', typeof cleanedData);
      console.log('Cleaned data keys:', Object.keys(cleanedData));
      console.log('Original formData:', formData);
      console.log('formData.SessionNameL1:', formData.SessionNameL1);
      console.log('formData.SessionNameL1 type:', typeof formData.SessionNameL1);
      console.log('formData.SessionNameL1 length:', formData.SessionNameL1 ? formData.SessionNameL1.length : 'undefined');

      // Update the item based on type
      let result;
      
      if (selectedType === 'student') {
        result = await api.updateStudent(selectedItem.id, cleanedData);
      } else if (selectedType === 'teacher') {
        result = await api.updateTeacher(selectedItem.id, cleanedData);
      } else if (selectedType === 'academy') {
        result = await api.updateAcademy(selectedItem.id, cleanedData);
      } else if (selectedType === 'branch') {
        result = await api.updateBranch(selectedItem.id, cleanedData);
      } else if (selectedType === 'course') {
        result = await api.updateCourse(selectedItem.id, cleanedData);
      } else if (selectedType === 'projectMaster') {
        result = await api.updateProject(selectedItem.id, cleanedData);
      } else if (selectedType === 'projectDetail') {
        result = await api.updateProjectDetail(selectedItem.id, cleanedData);
      } else if (selectedType === 'programMaster') {
        console.log('Calling updateProgramContentMaster with:', selectedItem.id, cleanedData);
        result = await api.updateProgramContentMaster(selectedItem.id, cleanedData);
      } else if (selectedType === 'programDetail') {
        result = await api.updateProgramContentDetail(selectedItem.id, cleanedData);
      } else if (selectedType === 'complaint') {
        console.log('Calling updateComplaint with:', selectedItem.id, cleanedData);
        result = await api.updateComplaint(selectedItem.id, cleanedData);
      } else if (selectedType === 'complaintType') {
        result = await api.updateComplaintType(selectedItem.id, cleanedData);
      } else if (selectedType === 'complaintStatus') {
        result = await api.updateComplaintStatus(selectedItem.id, cleanedData);
      } else {
        toast.error(lang === 'ar' ? 'نوع العنصر غير مدعوم للتعديل' : 'Item type not supported for editing');
        return;
      }

      if (result) {
        toast.success(lang === 'ar' ? 'تم تحديث العنصر بنجاح' : 'Item updated successfully');
        setEditDialogOpen(false);
        setSelectedItem(null);
        setSelectedType('');
        setFormData({});
        setFormErrors({});
        
        // Reload the specific section data
        // Map complaint type to complaints section
        const sectionToLoad = selectedType === 'complaint' ? 'complaints' : selectedType;
        await loadSectionData(sectionToLoad);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      
      // تحليل تفاصيل الخطأ
      let errorMessage = lang === 'ar' ? 'حدث خطأ في تحديث العنصر' : 'Error updating item';
      
      // تسجيل تفاصيل إضافية للتشخيص
      console.log('Error status:', error.status);
      console.log('Error body:', error.body);
      console.log('Error body type:', typeof error.body);
      console.log('Selected type:', selectedType);
      console.log('Selected item ID:', selectedItem?.id);
      
      // إذا كان الخطأ يتعلق بمفتاح خارجي أو Id
      if (error.body && typeof error.body === 'string') {
        if (error.body.includes('Id') && error.body.includes('key') && error.body.includes('modified')) {
          errorMessage = lang === 'ar' 
            ? 'خطأ في تحديث المعرف - لا يمكن تعديل الحقول الأساسية'
            : 'Error updating ID - cannot modify primary key fields';
        } else if (error.body.includes('foreign key')) {
          errorMessage = lang === 'ar' 
            ? 'خطأ في العلاقات - تأكد من صحة البيانات المرتبطة'
            : 'Relationship error - ensure linked data is valid';
        } else if (error.body.includes('500')) {
          errorMessage = lang === 'ar' 
            ? 'خطأ في الخادم - يرجى المحاولة مرة أخرى'
            : 'Server error - please try again';
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleView = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setViewDialogOpen(true);
  };

  const handleComplaintStatusChange = (item) => {
    setSelectedItem(item);
    setSelectedType('complaint');
    setComplaintStatusDialogOpen(true);
  };

  const handleComplaintStatusUpdate = async (newStatusId) => {
    if (!selectedItem) return;
    
    try {
      console.log('Updating complaint status:', selectedItem.id, 'to:', newStatusId);
      console.log('Selected item data:', selectedItem);
      
      // Check if the complaint has valid relationships before updating
      const academyId = selectedItem.AcademyDataId || selectedItem.academyDataId || selectedItem.academyId;
      if (!academyId) {
        console.log('No Academy ID found in:', selectedItem);
        console.log('Available fields:', Object.keys(selectedItem));
        toast.error(lang === 'ar' ? 'لا يمكن تحديث الشكوى - الأكاديمية غير موجودة' : 'Cannot update complaint - Academy not found');
        return;
      }
      
      console.log('Found Academy ID:', academyId);
      
      // Try to update the complaint status
      try {
        // Create FormData with all required fields for ComplaintsStudent update
        const fd = new FormData();
        
        // Required fields - ensure Description is at least 10 characters
        const description = selectedItem.Description || selectedItem.description || 'Complaint status update';
        const finalDescription = description.length >= 10 ? description : `${description} ..........`;
        fd.append('Description', finalDescription);
        fd.append('ComplaintsStatusesId', newStatusId);
        
        // Add all required fields for ComplaintsStudent update - handle both PascalCase and camelCase
        const academyId = selectedItem.AcademyDataId || selectedItem.academyDataId;
        const branchesId = selectedItem.BranchesDataId || selectedItem.branchesDataId;
        const complaintsTypeId = selectedItem.ComplaintsTypeId || selectedItem.complaintsTypeId;
        const studentsDataId = selectedItem.StudentsDataId || selectedItem.studentsDataId;
        const date = selectedItem.Date || selectedItem.date;
        
        fd.append('AcademyDataId', academyId);
        if (branchesId) fd.append('BranchesDataId', branchesId);
        fd.append('ComplaintsTypeId', complaintsTypeId);
        fd.append('StudentsDataId', studentsDataId);
        fd.append('Date', date || new Date().toISOString().split('T')[0]);
        
        // Remove duplicate code - we already added these fields above
        
        // Ensure we have all required fields - handle both PascalCase and camelCase
        if (!academyId) {
          toast.error(lang === 'ar' ? 'معرف الأكاديمية مطلوب' : 'Academy ID is required');
          return;
        }
        if (!complaintsTypeId) {
          toast.error(lang === 'ar' ? 'نوع الشكوى مطلوب' : 'Complaint type is required');
          return;
        }
        if (!studentsDataId) {
          toast.error(lang === 'ar' ? 'معرف الطالب مطلوب - الشكوى يجب أن تكون مرتبطة بطالب' : 'Student ID is required - Complaint must be associated with a student');
          return;
        }
        
        // Log the selected item data for debugging
        console.log('Selected item data for update:', {
          id: selectedItem.id,
          AcademyDataId: academyId,
          BranchesDataId: branchesId,
          ComplaintsTypeId: complaintsTypeId,
          StudentsDataId: studentsDataId,
          Date: date,
          Description: selectedItem.Description || selectedItem.description
        });
        
        // Add files if they exist
        if (selectedItem.Files && selectedItem.Files.length > 0) {
          for (let i = 0; i < selectedItem.Files.length; i++) {
            fd.append('Files', selectedItem.Files[i]);
          }
        }
        
        // Log the FormData contents for debugging
        console.log('FormData contents:');
        for (let [key, value] of fd.entries()) {
          console.log(`${key}:`, value);
        }
        
        // Instead of updating, we need to create a new complaint and delete the old one
        // This is because the server has foreign key constraints that prevent updates
        console.log('Creating new complaint with updated status...');
        
        // Create a new complaint with the updated status
        const newComplaintData = new FormData();
        newComplaintData.append('Description', finalDescription);
        newComplaintData.append('ComplaintsStatusesId', newStatusId);
        newComplaintData.append('AcademyDataId', academyId);
        if (branchesId) newComplaintData.append('BranchesDataId', branchesId);
        newComplaintData.append('ComplaintsTypeId', complaintsTypeId);
        newComplaintData.append('StudentsDataId', studentsDataId);
        newComplaintData.append('Date', date || new Date().toISOString().split('T')[0]);
        
        // Add files if they exist
        if (selectedItem.Files && selectedItem.Files.length > 0) {
          for (let i = 0; i < selectedItem.Files.length; i++) {
            newComplaintData.append('Files', selectedItem.Files[i]);
          }
        }
        
        // Create the new complaint
        await api.createComplaint(newComplaintData);
        
        // Delete the old complaint
        await api.deleteComplaint(selectedItem.id);
        
        // Show success message
        toast.success(lang === 'ar' ? 'تم تحديث حالة الشكوى بنجاح' : 'Complaint status updated successfully');
        
      } catch (updateError) {
        console.log('Update failed, trying alternative approach:', updateError);
        
        // Check if it's a validation error (like missing Description or StudentsDataId)
        if (updateError.status === 400) {
          try {
            const errorBody = JSON.parse(updateError.body);
            if (errorBody.errors) {
              // Handle specific validation errors
              if (errorBody.errors.Description) {
                toast.error(lang === 'ar' ? 'خطأ في الوصف - يجب أن يكون 10 أحرف على الأقل' : 'Description error - must be at least 10 characters');
                return;
              }
              if (errorBody.errors.StudentsDataId) {
                toast.error(lang === 'ar' ? 'معرف الطالب مطلوب - الشكوى يجب أن تكون مرتبطة بطالب' : 'Student ID is required - Complaint must be associated with a student');
                return;
              }
              if (errorBody.errors.AcademyDataId) {
                toast.error(lang === 'ar' ? 'معرف الأكاديمية مطلوب' : 'Academy ID is required');
                return;
              }
              if (errorBody.errors.ComplaintsTypeId) {
                toast.error(lang === 'ar' ? 'نوع الشكوى مطلوب' : 'Complaint type is required');
                return;
              }
              // Show generic validation error
              const errorMessages = Object.entries(errorBody.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
              toast.error(lang === 'ar' ? `أخطاء في التحقق: ${errorMessages}` : `Validation errors: ${errorMessages}`);
              return;
            }
          } catch (parseError) {
            console.warn('Could not parse error body:', parseError);
          }
        }
        
        // If update fails due to missing Academy, try to create a new complaint with the new status
        if (updateError.body && updateError.body.includes('Academy not found')) {
          console.log('Academy not found, creating new complaint with updated status');
          
          // Create a new complaint with the updated status (multipart/form-data)
          const newFd = new FormData();
          const baseDesc = selectedItem.Description || selectedItem.description || 'Complaint status update';
          const desc = (baseDesc && baseDesc.length >= 10) ? baseDesc : `${baseDesc} ..........`;
          newFd.append('Description', desc);
          newFd.append('ComplaintsStatusesId', newStatusId);
          newFd.append('Date', (selectedItem.Date || selectedItem.date || new Date().toISOString().split('T')[0]));
          const studentId = selectedItem.StudentsDataId || selectedItem.studentsDataId;
          if (studentId) newFd.append('StudentsDataId', studentId);
          const typeId = selectedItem.ComplaintsTypeId || selectedItem.complaintsTypeId;
          if (typeId) newFd.append('ComplaintsTypeId', typeId);
          
          await api.createComplaint(newFd);
          
          // Delete the old complaint with broken relationships
          await api.deleteComplaint(selectedItem.id);
          
          toast.success(lang === 'ar' ? 'تم تحديث حالة الشكوى بنجاح (تم إنشاء شكوى جديدة)' : 'Complaint status updated successfully (new complaint created)');
        } else {
          throw updateError; // Re-throw if it's not an Academy-related error
        }
      }
      
      // Reload complaints data
      setLoadingState('complaints', true);
      try {
        const complaintsData = await api.getComplaints();
        setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      } catch (error) {
        console.error('Error reloading complaints:', error);
      } finally {
        setLoadingState('complaints', false);
      }
      
      setComplaintStatusDialogOpen(false);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      
      // Handle specific error cases
      if (error.body) {
        try {
          const errorBody = JSON.parse(error.body);
          if (errorBody.detail && errorBody.detail.includes('Academy not found')) {
            toast.error(lang === 'ar' ? 'لا يمكن تحديث الشكوى - الأكاديمية المرتبطة غير موجودة' : 'Cannot update complaint - Associated Academy not found');
          } else {
      toast.error(lang === 'ar' ? 'خطأ في تحديث حالة الشكوى' : 'Error updating complaint status');
          }
        } catch (parseError) {
          toast.error(lang === 'ar' ? 'خطأ في تحديث حالة الشكوى' : 'Error updating complaint status');
        }
      } else {
        toast.error(lang === 'ar' ? 'خطأ في تحديث حالة الشكوى' : 'Error updating complaint status');
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem || !selectedType) return;
    
    try {
      console.log(`Attempting to delete ${selectedType} with ID:`, selectedItem.id);
      
      switch (selectedType) {
        case 'projectMaster':
          await api.deleteProject(selectedItem.id);
          // تحديث بيانات Projects Master مباشرة
          try {
            const updatedProjectsMaster = await api.getProjects();
            const projectsMasterData = updatedProjectsMaster?.projects || updatedProjectsMaster || [];
            setProjectsMaster(Array.isArray(projectsMasterData) ? projectsMasterData : []);
            
            // Update categories
            const uniqueCategories = [...new Set(projectsMasterData
              .filter(project => project.category)
              .map(project => project.category)
            )];
            setProjectCategories(uniqueCategories);
            console.log('Updated projectsMaster after deleting:', projectsMasterData);
          } catch (error) {
            console.error('Error updating projectsMaster:', error);
          }
          break;
        case 'projectDetail':
          await api.deleteProjectDetail(selectedItem.id);
          // تحديث بيانات Projects Detail مباشرة
          try {
            const updatedProjectsDetail = await api.getProjectsDetail();
            const projectsDetailData = updatedProjectsDetail?.project_details || updatedProjectsDetail || [];
            setProjectsDetail(Array.isArray(projectsDetailData) ? projectsDetailData : []);
            console.log('Updated projectsDetail after deleting:', projectsDetailData);
          } catch (error) {
            console.error('Error updating projectsDetail:', error);
          }
          break;
        case 'programMaster':
          await api.deleteProgramContentMaster(selectedItem.id);
          // تحديث بيانات Programs Content Master مباشرة
          try {
            const updatedProgramsContentMaster = await api.getProgramsContentMaster();
            const programsData = updatedProgramsContentMaster?.programs || updatedProgramsContentMaster || [];
            setProgramsContentMaster(Array.isArray(programsData) ? programsData : []);
            console.log('Updated programsContentMaster after deleting:', programsData);
          } catch (error) {
            console.error('Error updating programsContentMaster:', error);
          }
          break;
        case 'programDetail':
          await api.deleteProgramContentDetail(selectedItem.id);
          // تحديث بيانات Programs Content Detail مباشرة
          try {
            const updatedProgramsContentDetail = await api.getProgramsContentDetail();
            const programsDetailData = updatedProgramsContentDetail?.program_details || updatedProgramsContentDetail || [];
            setProgramsContentDetail(Array.isArray(programsDetailData) ? programsDetailData : []);
            console.log('Updated programsContentDetail after deleting:', programsDetailData);
          } catch (error) {
            console.error('Error updating programsContentDetail:', error);
          }
          break;
        case 'academy':
          await api.deleteAcademy(selectedItem.id);
          break;
        case 'branch':
          await api.deleteBranch(selectedItem.id);
          break;
        case 'student':
          await api.deleteStudent(selectedItem.id);
          break;
        case 'teacher':
          console.log('Deleting teacher with ID:', selectedItem.id);
          await api.deleteTrainer(selectedItem.id);
          break;
        case 'course':
          await api.deleteCourse(selectedItem.id);
          break;
        case 'complaint':
          await api.deleteComplaint(selectedItem.id);
          break;
        case 'complaintType':
          await api.deleteComplaintType(selectedItem.id);
          break;
        case 'complaintStatus':
          await api.deleteComplaintStatus(selectedItem.id);
          break;
        default:
          toast.error(lang === 'ar' ? 'نوع غير معروف' : 'Unknown type');
          return;
      }
      
      toast.success(lang === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      // إعادة تحميل البيانات بعد الحذف (للباقي)
      if (selectedType !== 'programDetail' && selectedType !== 'programMaster' && selectedType !== 'projectDetail' && selectedType !== 'projectMaster') {
        loadAllData();
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting item:', error);
      
      // Parse error details
      let errorMessage = lang === 'ar' ? 'خطأ في الحذف' : 'Error deleting item';
      
      if (error.body) {
        try {
          const errorBody = JSON.parse(error.body);
          if (errorBody.detail) {
            errorMessage = errorBody.detail;
          } else if (errorBody.title) {
            errorMessage = errorBody.title;
          }
        } catch (parseError) {
          console.warn('Failed to parse error body:', parseError);
        }
      }
      
      // Show specific error messages based on status
      if (error.status === 500) {
        errorMessage = lang === 'ar' 
          ? 'خطأ في الخادم - قد يكون العنصر مرتبط بعناصر أخرى'
          : 'Server error - Item may be linked to other entities';
      } else if (error.status === 404) {
        errorMessage = lang === 'ar' 
          ? 'العنصر غير موجود'
          : 'Item not found';
      } else if (error.status === 403) {
        errorMessage = lang === 'ar' 
          ? 'ليس لديك صلاحية لحذف هذا العنصر'
          : 'You do not have permission to delete this item';
      }
      
      toast.error(errorMessage);
      
      // Log additional details for debugging
      console.log('Error status:', error.status);
      console.log('Error body:', error.body);
      console.log('Selected item:', selectedItem);
      console.log('Selected type:', selectedType);
    }
  };

  // Helper function to validate UUID
  const isValidUUID = (uuid) => {
    if (!uuid) return false;
    
    // Check if it's a standard UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Helper function to clean form data for API submission
  const cleanFormDataForAPI = (data, type) => {
    console.log('cleanFormDataForAPI called with type:', type);
    console.log('cleanFormDataForAPI called with data:', data);
    const cleaned = { ...data };
    
    // For branch forms, filter out invalid location field values
    if (type === 'branch') {
      // Remove location fields if they're not valid UUIDs
      if (!isValidUUID(cleaned.CountryCodeId)) {
        delete cleaned.CountryCodeId;
      }
      if (!isValidUUID(cleaned.GovernorateCodeId)) {
        delete cleaned.GovernorateCodeId;
      }
      if (!isValidUUID(cleaned.CityCodeId)) {
        delete cleaned.CityCodeId;
      }
      
      // For branch, also check BranchManager
      if (!isValidUUID(cleaned.BranchManager)) {
        delete cleaned.BranchManager;
      }
    }

    // For teacher forms, handle file uploads and required fields
    if (type === 'teacher') {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Clean and validate National ID
      if (cleaned.NationalId) {
        // Remove any non-numeric characters
        const cleanNationalId = cleaned.NationalId.replace(/\D/g, '');
        if (cleanNationalId.length === 14) {
          formData.append('NationalId', cleanNationalId);
        } else {
          // If not exactly 14 digits, don't send it and let server validation handle it
          console.warn('National ID must be exactly 14 digits');
        }
      }
      
      // Handle location fields - only send if they are valid UUIDs or generated IDs
      if (cleaned.AcademyDataId && isValidUUID(cleaned.AcademyDataId)) {
        formData.append('AcademyDataId', cleaned.AcademyDataId);
      }
      if (cleaned.BranchesDataId && isValidUUID(cleaned.BranchesDataId)) {
        formData.append('BranchesDataId', cleaned.BranchesDataId);
      }
      if (cleaned.CountryCodeId && isValidUUID(cleaned.CountryCodeId)) {
        formData.append('CountryCodeId', cleaned.CountryCodeId);
      }
      if (cleaned.GovernorateCodeId && isValidUUID(cleaned.GovernorateCodeId)) {
        formData.append('GovernorateCodeId', cleaned.GovernorateCodeId);
      }
      if (cleaned.CityCodeId && isValidUUID(cleaned.CityCodeId)) {
        formData.append('CityCodeId', cleaned.CityCodeId);
      }
      
      // Add all other fields to FormData
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] !== null && cleaned[key] !== undefined && cleaned[key] !== '') {
          // Skip location fields as they're handled above
          if (['AcademyDataId', 'BranchesDataId', 'CountryCodeId', 'GovernorateCodeId', 'CityCodeId', 'NationalId'].includes(key)) {
            return;
          }
          
          if (key === 'ImageFile' && cleaned[key] instanceof File) {
            formData.append(key, cleaned[key]);
          } else {
            formData.append(key, cleaned[key]);
          }
        }
      });
      
      return formData;
    }
    
    // For project detail forms, handle required fields
    if (type === 'projectDetail') {
      console.log('Cleaning projectDetail data:', cleaned);
      console.log('Entering projectDetail case in cleanFormDataForAPI');
      
      // For updates, send as JSON to avoid FormData issues
      // Only include the fields that should be updated
      const updateData = {
        ProjectsMasterId: cleaned.ProjectsMasterId || '',
        ProjectNameL1: cleaned.ProjectNameL1 || '',
        Description: cleaned.Description || ''
      };
      
      // Only add optional fields if they exist
      if (cleaned.ProjectNameL2) updateData.ProjectNameL2 = cleaned.ProjectNameL2;
      
      console.log('Cleaned projectDetail updateData:', updateData);
      console.log('Returning updateData from projectDetail case');
      return updateData;
    }
    
          // For program content master forms, handle required fields




      // For program master forms, handle required fields
      if (type === 'programMaster') {
        console.log('Cleaning programMaster data:', cleaned);
        console.log('Raw cleaned data:', {
          SessionNameL1: cleaned.SessionNameL1,
          SessionNameL2: cleaned.SessionNameL2,
          Description: cleaned.Description,
          ProgramsDetailsId: cleaned.ProgramsDetailsId,
          SessionNo: cleaned.SessionNo
        });
        
        // For updates, send as JSON to avoid FormData issues
        // Only include the fields that should be updated
        const updateData = {
          SessionNameL1: cleaned.SessionNameL1 || '',
          SessionNameL2: cleaned.SessionNameL2 || '',
          Description: cleaned.Description || ''
        };
        
        // Only add other fields if they exist and are not null/undefined
        if (cleaned.ProgramsDetailsId) updateData.ProgramsDetailsId = cleaned.ProgramsDetailsId;
        if (cleaned.SessionNo) updateData.SessionNo = cleaned.SessionNo;
        
        // Handle file uploads if they exist
        if (cleaned.ScientificMaterial && cleaned.ScientificMaterial instanceof File) {
          // Check file size (max 10MB)
          if (cleaned.ScientificMaterial.size <= 10 * 1024 * 1024) {
            updateData.ScientificMaterial = cleaned.ScientificMaterial;
          }
        }
        
        console.log('Final updateData to send:', updateData);
        console.log('SessionNameL1 value:', updateData.SessionNameL1);
        console.log('SessionNameL1 type:', typeof updateData.SessionNameL1);
        console.log('SessionNameL1 length:', updateData.SessionNameL1 ? updateData.SessionNameL1.length : 'undefined');
        console.log('SessionNameL1 truthy check:', !!updateData.SessionNameL1);
        console.log('SessionNameL1 empty string check:', updateData.SessionNameL1 === '');
        
        return updateData;
      }

      // For program detail forms, handle required fields
      if (type === 'programDetail') {
        console.log('Cleaning programDetail data:', cleaned);
        
        // For updates, send as JSON to avoid FormData issues
        // Only include the fields that should be updated
        const updateData = {
          ProgramsContentMasterId: cleaned.ProgramsContentMasterId || '',
          Title: cleaned.Description || '' // Backend expects 'Title' but frontend form uses 'Description'
        };
        
        // SessionVideo must be URL (string uri) per API docs, not a file
        if (cleaned.SessionVideo && typeof cleaned.SessionVideo === 'string') {
          updateData.SessionVideo = cleaned.SessionVideo;
        }
        
        // Handle file uploads if they exist
                                if (cleaned.SessionTasks && cleaned.SessionTasks instanceof File) {
                          // Check file size (max 10MB)
                          if (cleaned.SessionTasks.size <= 10 * 1024 * 1024) {
            updateData.SessionTasks = cleaned.SessionTasks;
                          }
                        }
                        if (cleaned.SessionProject && cleaned.SessionProject instanceof File) {
                          // Check file size (max 10MB)
                          if (cleaned.SessionProject.size <= 10 * 1024 * 1024) {
            updateData.SessionProject = cleaned.SessionProject;
                          }
                        }
                        if (cleaned.ScientificMaterial && cleaned.ScientificMaterial instanceof File) {
                          // Check file size (max 10MB)
                          if (cleaned.ScientificMaterial.size <= 10 * 1024 * 1024) {
            updateData.ScientificMaterial = cleaned.ScientificMaterial;
                          }
                        }
                        if (cleaned.SessionQuiz && cleaned.SessionQuiz instanceof File) {
                          // Check file size (max 10MB)
                          if (cleaned.SessionQuiz.size <= 10 * 1024 * 1024) {
            updateData.SessionQuiz = cleaned.SessionQuiz;
                          }
                        }
        
        console.log('Cleaned programDetail updateData:', updateData);
        return updateData;
      }
    
    // For complaint forms, handle multipart/form-data format
    if (type === 'complaint') {
      console.log('Cleaning complaint data:', cleaned);
      const formData = new FormData();
      
      // Add required fields
      if (cleaned.StudentsDataId) formData.append('StudentsDataId', cleaned.StudentsDataId);
      if (cleaned.ComplaintsTypeId) formData.append('ComplaintsTypeId', cleaned.ComplaintsTypeId);
      if (cleaned.ComplaintsStatusesId) formData.append('ComplaintsStatusesId', cleaned.ComplaintsStatusesId);
      if (cleaned.Description) formData.append('Description', cleaned.Description);
      if (cleaned.Date) formData.append('Date', cleaned.Date);
      
      // Add optional fields
      if (cleaned.AcademyDataId) formData.append('AcademyDataId', cleaned.AcademyDataId);
      if (cleaned.BranchesDataId) formData.append('BranchesDataId', cleaned.BranchesDataId);
      
      // Add files if present
      if (cleaned.Files && cleaned.Files.length > 0) {
        for (let i = 0; i < cleaned.Files.length; i++) {
          formData.append('Files', cleaned.Files[i]);
        }
      }
      
      console.log('Cleaned complaint data (FormData):', formData);
      return formData;
    }
    
    // For complaint type forms, handle required fields
    if (type === 'complaintType') {
      console.log('Cleaning complaintType data:', cleaned);
      const cleanedComplaintType = {};
      if (cleaned.AcademyDataId) cleanedComplaintType.AcademyDataId = cleaned.AcademyDataId;
      if (cleaned.BranchesDataId) cleanedComplaintType.BranchesDataId = cleaned.BranchesDataId;
      if (cleaned.typeNameL1) cleanedComplaintType.typeNameL1 = cleaned.typeNameL1;
      if (cleaned.typeNameL2) cleanedComplaintType.typeNameL2 = cleaned.typeNameL2;
      if (cleaned.Description) cleanedComplaintType.Description = cleaned.Description;
      console.log('Cleaned complaintType data:', cleanedComplaintType);
      return cleanedComplaintType;
    }
    
    // For complaint status forms, handle required fields
    if (type === 'complaintStatus') {
      console.log('Cleaning complaintStatus data:', cleaned);
      const cleanedComplaintStatus = {};
      if (cleaned.AcademyDataId) cleanedComplaintStatus.AcademyDataId = cleaned.AcademyDataId;
      if (cleaned.BranchesDataId) cleanedComplaintStatus.BranchesDataId = cleaned.BranchesDataId;
      if (cleaned.statusNameL1) cleanedComplaintStatus.StatusesNameL1 = cleaned.statusNameL1;
      if (cleaned.statusNameL2) cleanedComplaintStatus.StatusesNameL2 = cleaned.statusNameL2;
      if (cleaned.Description) cleanedComplaintStatus.Description = cleaned.Description;
      console.log('Cleaned complaintStatus data:', cleanedComplaintStatus);
      return cleanedComplaintStatus;
    }
    
    // Handle URL fields for academy and other forms
    const urlFields = ['AcademyWebSite', 'AcademyFacebook', 'AcademyInstagram', 'AcademyTiktok', 'AcademyTwitter', 'AcademySnapchat', 'AcademyYoutube'];
    urlFields.forEach(field => {
      if (cleaned[field] && cleaned[field].trim() !== '') {
        // Add protocol if missing
        if (!cleaned[field].startsWith('http://') && !cleaned[field].startsWith('https://') && !cleaned[field].startsWith('ftp://')) {
          cleaned[field] = 'https://' + cleaned[field];
        }
      }
    });
    
    // Handle SessionVideo URL validation
    if (cleaned.SessionVideo && cleaned.SessionVideo.trim() !== '') {
      try {
        const url = new URL(cleaned.SessionVideo);
        const videoDomains = [
          'youtube.com', 'youtu.be', 'www.youtube.com',
          'vimeo.com', 'www.vimeo.com',
          'dailymotion.com', 'www.dailymotion.com',
          'facebook.com', 'www.facebook.com',
          'instagram.com', 'www.instagram.com',
          'tiktok.com', 'www.tiktok.com',
          'twitch.tv', 'www.twitch.tv',
          'streamable.com', 'www.streamable.com',
          'wistia.com', 'www.wistia.com',
          'brightcove.com', 'www.brightcove.com'
        ];
        
        const isVideoUrl = videoDomains.some(domain => 
          url.hostname === domain || url.hostname.endsWith('.' + domain)
        );
        
        if (!isVideoUrl) {
          // Remove invalid video URL
          delete cleaned.SessionVideo;
        }
      } catch {
        // Remove invalid URL
        delete cleaned.SessionVideo;
      }
    }
    
    // For student forms, handle required fields
    if (type === 'student') {
      console.log('Cleaning student data:', cleaned);
      
      // Map frontend form fields to backend expected fields
      const studentData = {
        StudentName: cleaned.FirstName || '',
        StudentEmail: cleaned.Email || '',
        StudentPhone: cleaned.PhoneNumber || '',
        StudentAddress: cleaned.StudentAddress || '',
        BirthDate: cleaned.StudentBirthDate || '',
        EnrollmentDate: cleaned.StudentEnrollmentDate || ''
      };
      
      console.log('Cleaned student data:', studentData);
      return studentData;
    }
    
    // For project master forms, handle category field
    if (type === 'projectMaster') {
      console.log('Cleaning projectMaster data:', cleaned);
      
      // For updates, send as JSON to avoid FormData issues
      const updateData = {
        ProjectNameL1: cleaned.ProjectNameL1 || '',
        ProjectNameL2: cleaned.ProjectNameL2 || '',
        Description: cleaned.Description || '',
        AcademyDataId: cleaned.AcademyDataId || '',
        BranchesDataId: cleaned.BranchesDataId || ''
      };
      
      // Handle category field
      if (cleaned.ProjectCategory && cleaned.ProjectCategory !== 'new') {
        updateData.ProjectCategory = cleaned.ProjectCategory;
      } else if (cleaned.NewProjectCategory) {
        updateData.ProjectCategory = cleaned.NewProjectCategory;
      }
      
      // Add optional fields if they exist
      if (cleaned.ProjectStart) updateData.ProjectStart = cleaned.ProjectStart;
      if (cleaned.ProjectEnd) updateData.ProjectEnd = cleaned.ProjectEnd;
      
      console.log('Final projectMaster updateData:', updateData);
      return updateData;
    }
    
    console.log('No specific type handler found, returning cleaned object:', cleaned);
    return cleaned;
  };

  const validateField = (fieldName, value) => {
    const errors = { ...formErrors };
    
    switch (fieldName) {
      case 'TeacherNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم المدرب (عربي) مطلوب' : 'Teacher Name (Arabic) is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم المدرب يجب أن يكون 4 أحرف على الأقل' : 'Teacher Name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'TeacherNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم المدرب (إنجليزي) يجب أن يكون 4 أحرف على الأقل' : 'Teacher Name (English) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم الأكاديمية مطلوب' : 'Academy Name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم الأكاديمية يجب أن يكون 4 أحرف على الأقل' : 'Academy Name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم الأكاديمية (2) يجب أن يكون 4 أحرف على الأقل' : 'Academy Name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم الفرع مطلوب' : 'Branch Name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم الفرع يجب أن يكون 4 أحرف على الأقل' : 'Branch Name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم الفرع (2) يجب أن يكون 4 أحرف على الأقل' : 'Branch Name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'CourseNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم الدورة مطلوب' : 'Course Name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم الدورة يجب أن يكون 4 أحرف على الأقل' : 'Course Name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'CourseNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم الدورة (2) يجب أن يكون 4 أحرف على الأقل' : 'Course Name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'StudentNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم الطالب مطلوب' : 'Student Name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم الطالب يجب أن يكون 4 أحرف على الأقل' : 'Student Name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'StudentNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم الطالب (2) يجب أن يكون 4 أحرف على الأقل' : 'Student Name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'typeNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم النوع مطلوب' : 'Type name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم النوع يجب أن يكون 4 أحرف على الأقل' : 'Type name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'typeNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم النوع (2) يجب أن يكون 4 أحرف على الأقل' : 'Type name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'statusNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم الحالة مطلوب' : 'Status name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم الحالة يجب أن يكون 4 أحرف على الأقل' : 'Status name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'statusNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم الحالة (2) يجب أن يكون 4 أحرف على الأقل' : 'Status name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'ProjectNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم المشروع مطلوب' : 'Project Name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم المشروع يجب أن يكون 4 أحرف على الأقل' : 'Project Name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'ProjectNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم المشروع (2) يجب أن يكون 4 أحرف على الأقل' : 'Project Name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'SessionNameL1':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'اسم الجلسة مطلوب' : 'Session Name is required';
        } else if (value.length < 4) {
          errors[fieldName] = lang === 'ar' ? 'اسم الجلسة يجب أن يكون 4 أحرف على الأقل' : 'Session Name must be at least 4 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'SessionNameL2':
        if (value && value.trim() !== '') {
          if (value.length < 4) {
            errors[fieldName] = lang === 'ar' ? 'اسم الجلسة (2) يجب أن يكون 4 أحرف على الأقل' : 'Session Name (2) must be at least 4 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'Title':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'العنوان مطلوب' : 'Title is required';
        } else if (value.length < 3) {
          errors[fieldName] = lang === 'ar' ? 'العنوان يجب أن يكون 3 أحرف على الأقل' : 'Title must be at least 3 characters';
        } else if (value.length > 100) {
          errors[fieldName] = lang === 'ar' ? 'العنوان يجب أن لا يزيد عن 100 حرف' : 'Title must not exceed 100 characters';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'Description':
        if (value && value.trim() !== '') {
          if (value.length < 10) {
            errors[fieldName] = lang === 'ar' ? 'الوصف يجب أن يكون 10 أحرف على الأقل' : 'Description must be at least 10 characters';
          } else if (value.length > 500) {
            errors[fieldName] = lang === 'ar' ? 'الوصف يجب أن لا يزيد عن 500 حرف' : 'Description must not exceed 500 characters';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyDataId':
        if ((selectedType === 'complaintType' || selectedType === 'complaintStatus') && !value) {
          errors[fieldName] = lang === 'ar' ? 'يجب اختيار الأكاديمية' : 'Academy must be selected';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchesDataId':
        if ((selectedType === 'complaintType' || selectedType === 'complaintStatus') && !value) {
          errors[fieldName] = lang === 'ar' ? 'يجب اختيار الفرع' : 'Branch must be selected';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyWebSite':
        if (value && value.trim() !== '') {
          try {
            // Add protocol if missing
            let urlToValidate = value;
            if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://') && !urlToValidate.startsWith('ftp://')) {
              urlToValidate = 'https://' + urlToValidate;
            }
            new URL(urlToValidate);
          delete errors[fieldName];
          } catch {
            errors[fieldName] = lang === 'ar' ? 'رابط الموقع الإلكتروني غير صحيح' : 'Invalid website URL';
        }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyFacebook':
      case 'AcademyInstagram':
      case 'AcademyTiktok':
      case 'AcademyTwitter':
      case 'AcademySnapchat':
      case 'AcademyYoutube':
        if (value && value.trim() !== '') {
          try {
            // Add protocol if missing
            let urlToValidate = value;
            if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://') && !urlToValidate.startsWith('ftp://')) {
              urlToValidate = 'https://' + urlToValidate;
            }
            new URL(urlToValidate);
            delete errors[fieldName];
          } catch {
            errors[fieldName] = lang === 'ar' ? 'رابط غير صحيح' : 'Invalid URL';
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyAddress':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'عنوان الأكاديمية مطلوب' : 'Academy address is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'Location':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'الموقع مطلوب' : 'Location is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyMobil':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'رقم الجوال مطلوب' : 'Mobile number is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'AcademyEmail':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'TaxRegistrationNumber':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'الرقم الضريبي مطلوب' : 'Tax registration number is required';
          } else {
            delete errors[fieldName];
          }
        break;
        
      case 'TaxesErrand':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'ملف الضرائب مطلوب' : 'Taxes errand is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'CommercialRegisterNumber':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'السجل التجاري مطلوب' : 'Commercial register number is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchMobile':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'رقم الجوال مطلوب' : 'Mobile number is required';
        } else if (!/^\d+$/.test(value)) {
          errors[fieldName] = lang === 'ar' ? 'رقم الجوال يجب أن يحتوي على أرقام فقط' : 'Mobile number must contain only digits';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchPhone':
        if (value && value.trim() !== '') {
          if (!/^\d+$/.test(value)) {
            errors[fieldName] = lang === 'ar' ? 'رقم الهاتف يجب أن يحتوي على أرقام فقط' : 'Phone number must contain only digits';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchWhatsapp':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required';
        } else if (!/^\d+$/.test(value)) {
          errors[fieldName] = lang === 'ar' ? 'رقم الواتساب يجب أن يحتوي على أرقام فقط' : 'WhatsApp number must contain only digits';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchEmail':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'BranchAddress':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'عنوان الفرع مطلوب' : 'Branch address is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'TeacherAddress':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'عنوان المدرب مطلوب' : 'Teacher Address is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'TeacherWhatsapp':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'TeacherEmail':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'NationalId':
        if (value) {
          const cleanNationalId = value.replace(/\D/g, '');
          if (cleanNationalId.length !== 14) {
            errors[fieldName] = lang === 'ar' ? 'الرقم القومي يجب أن يكون 14 رقم بالضبط' : 'National ID must be exactly 14 digits';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'CountryCodeId':
      case 'GovernorateCodeId':
      case 'CityCodeId':
      case 'AcademyDataId':
      case 'BranchesDataId':
        if (value && !isValidUUID(value)) {
          errors[fieldName] = lang === 'ar' ? 'يرجى اختيار قيمة صحيحة' : 'Please select a valid value';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'ProjectsMasterId':
        if (!value || value.trim() === '') {
          errors[fieldName] = lang === 'ar' ? 'المشروع الرئيسي مطلوب' : 'Project Master is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'ProgramsContentMasterId':
        if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value === 'number' && !value)) {
          errors[fieldName] = lang === 'ar' ? 'البرنامج الرئيسي مطلوب' : 'Program Master is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'SessionVideo':
        if (value && value.trim() !== '') {
          try {
            const url = new URL(value);
            // Check if it's a valid video platform URL
            const videoDomains = [
              'youtube.com', 'youtu.be', 'www.youtube.com',
              'vimeo.com', 'www.vimeo.com',
              'dailymotion.com', 'www.dailymotion.com',
              'facebook.com', 'www.facebook.com',
              'instagram.com', 'www.instagram.com',
              'tiktok.com', 'www.tiktok.com',
              'twitch.tv', 'www.twitch.tv',
              'streamable.com', 'www.streamable.com',
              'wistia.com', 'www.wistia.com',
              'brightcove.com', 'www.brightcove.com',
              'vimeo.com', 'www.vimeo.com',
              'dailymotion.com', 'www.dailymotion.com'
            ];
            
            const isVideoUrl = videoDomains.some(domain => 
              url.hostname === domain || url.hostname.endsWith('.' + domain)
            );
            
            if (!isVideoUrl) {
              errors[fieldName] = lang === 'ar' ? 'الرابط يجب أن يكون من موقع فيديو معروف (مثل YouTube, Vimeo, Facebook)' : 'URL must be from a known video platform (e.g., YouTube, Vimeo, Facebook)';
          } else {
            delete errors[fieldName];
        }
          } catch {
            errors[fieldName] = lang === 'ar' ? 'رابط الفيديو غير صحيح' : 'Invalid video URL';
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'SessionNo':
        if (value && value.trim() !== '') {
          if (isNaN(value) || parseInt(value) < 1) {
            errors[fieldName] = lang === 'ar' ? 'رقم الجلسة يجب أن يكون رقماً موجباً' : 'Session number must be a positive number';
          } else {
            delete errors[fieldName];
          }
        } else {
          delete errors[fieldName];
        }
        break;
        
      default:
        break;
    }
    
    setFormErrors(errors);
  };

  // Clear form errors when field is focused
  const clearFieldError = (fieldName) => {
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const validateProjectDetailData = (data) => {
    const errors = [];
    
    if (!data.ProjectsMasterId) {
      errors.push('ProjectsMasterId');
    }
    
    if (!data.ProjectNameL1 || data.ProjectNameL1.length < 4) {
      errors.push('ProjectNameL1');
    }
    
    // ProjectNameL2 is optional, but if provided, it should meet length requirements
    if (data.ProjectNameL2 && data.ProjectNameL2.length < 4) {
      errors.push('ProjectNameL2');
    }
    
    if (!data.Description || data.Description.length < 10 || data.Description.length > 500) {
      errors.push('Description');
    }
    
    return errors;
  };

  const validateTeacherData = (data) => {
    const errors = [];
    
    // Check required fields
    if (!data.TeacherNameL1 || data.TeacherNameL1.trim() === '') {
      errors.push(lang === 'ar' ? 'اسم المدرب (عربي) مطلوب' : 'Teacher Name (Arabic) is required');
    } else if (data.TeacherNameL1.length < 4) {
      errors.push(lang === 'ar' ? 'اسم المدرب يجب أن يكون 4 أحرف على الأقل' : 'Teacher Name must be at least 4 characters');
    }
    
    if (data.TeacherNameL2 && data.TeacherNameL2.trim() !== '') {
      if (data.TeacherNameL2.length < 4) {
        errors.push(lang === 'ar' ? 'اسم المدرب (إنجليزي) يجب أن يكون 4 أحرف على الأقل' : 'Teacher Name (English) must be at least 4 characters');
      }
    }
    
    if (!data.TeacherAddress || data.TeacherAddress.trim() === '') {
      errors.push(lang === 'ar' ? 'عنوان المدرب مطلوب' : 'Teacher Address is required');
    }
    
    if (!data.TeacherWhatsapp || data.TeacherWhatsapp.trim() === '') {
      errors.push(lang === 'ar' ? 'رقم الواتساب مطلوب' : 'WhatsApp number is required');
    }
    
    if (!data.TeacherEmail || data.TeacherEmail.trim() === '') {
      errors.push(lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required');
    }
    
    // Validate National ID
    if (data.NationalId) {
      const cleanNationalId = data.NationalId.replace(/\D/g, '');
      if (cleanNationalId.length !== 14) {
        errors.push(lang === 'ar' ? 'الرقم القومي يجب أن يكون 14 رقم بالضبط' : 'National ID must be exactly 14 digits');
      }
    }
    
    // Validate location fields
    if (data.CountryCodeId && !isValidUUID(data.CountryCodeId)) {
      errors.push(lang === 'ar' ? 'يرجى اختيار دولة صحيحة' : 'Please select a valid country');
    }
    
    if (data.GovernorateCodeId && !isValidUUID(data.GovernorateCodeId)) {
      errors.push(lang === 'ar' ? 'يرجى اختيار محافظة صحيحة' : 'Please select a valid governorate');
    }
    
    if (data.CityCodeId && !isValidUUID(data.CityCodeId)) {
      errors.push(lang === 'ar' ? 'يرجى اختيار مدينة صحيحة' : 'Please select a valid city');
    }
    
    // Validate Academy and Branch if provided
    if (data.AcademyDataId && !isValidUUID(data.AcademyDataId)) {
      errors.push(lang === 'ar' ? 'يرجى اختيار أكاديمية صحيحة' : 'Please select a valid academy');
    }
    
    if (data.BranchesDataId && !isValidUUID(data.BranchesDataId)) {
      errors.push(lang === 'ar' ? 'يرجى اختيار فرع صحيح' : 'Please select a valid branch');
    }
    
    return errors;
  };

  const validateComplaintTypeData = (data) => {
    const errors = [];
    
    if (!data.AcademyDataId) {
      errors.push(lang === 'ar' ? 'يجب اختيار الأكاديمية' : 'Academy must be selected');
    }
    
    if (!data.BranchesDataId) {
      errors.push(lang === 'ar' ? 'يجب اختيار الفرع' : 'Branch must be selected');
    }
    
    if (!data.typeNameL1 || data.typeNameL1.trim() === '') {
      errors.push(lang === 'ar' ? 'اسم النوع مطلوب' : 'Type name is required');
    }
    
    if (data.typeNameL1 && data.typeNameL1.length < 4) {
      errors.push(lang === 'ar' ? 'اسم النوع يجب أن يكون 4 أحرف على الأقل' : 'Type name must be at least 4 characters');
    }
    
    return errors;
  };

  const validateComplaintStatusData = (data) => {
    const errors = [];
    
    if (!data.AcademyDataId) {
      errors.push(lang === 'ar' ? 'يجب اختيار الأكاديمية' : 'Branch must be selected');
    }
    
    if (!data.BranchesDataId) {
      errors.push(lang === 'ar' ? 'يجب اختيار الفرع' : 'Branch must be selected');
    }
    
    if (!data.statusNameL1 || data.statusNameL1.trim() === '') {
      errors.push(lang === 'ar' ? 'اسم الحالة مطلوب' : 'Status name is required');
    }
    
    if (data.statusNameL1 && data.statusNameL1.length < 4) {
      errors.push(lang === 'ar' ? 'اسم الحالة يجب أن يكون 4 أحرف على الأقل' : 'Status name must be at least 4 characters');
    }
    
    return errors;
  };

  const validateComplaintData = (data) => {
    const errors = [];
    
    if (!data.Description || data.Description.trim() === '') {
      errors.push(lang === 'ar' ? 'وصف الشكوى مطلوب' : 'Complaint description is required');
    }
    
    if (data.Description && data.Description.length < 10) {
      errors.push(lang === 'ar' ? 'وصف الشكوى يجب أن يكون 10 أحرف على الأقل' : 'Complaint description must be at least 10 characters');
    }
    
    if (!data.StudentsDataId) {
      errors.push(lang === 'ar' ? 'يجب اختيار الطالب' : 'Student must be selected');
    }
    
    if (!data.ComplaintsTypeId) {
      errors.push(lang === 'ar' ? 'يجب اختيار نوع الشكوى' : 'Complaint type must be selected');
    }
    
    if (!data.ComplaintsStatusesId) {
      errors.push(lang === 'ar' ? 'يجب اختيار حالة الشكوى' : 'Complaint status must be selected');
    }
    
    return errors;
  };

  const handleFormSubmit = async () => {
    if (!selectedType) return;
    
    // Declare dataToSend outside try block so it's available in catch block
    let dataToSend = null;
    
    try {
      // التحقق من صحة البيانات حسب النوع
      let validationErrors = [];
      if (selectedType === 'teacher') {
        validationErrors = validateTeacherData(formData);
      } else if (selectedType === 'projectDetail') {
        validationErrors = validateProjectDetailData(formData);
      } else if (selectedType === 'complaintType') {
        validationErrors = validateComplaintTypeData(formData);
      } else if (selectedType === 'complaintStatus') {
        validationErrors = validateComplaintStatusData(formData);
      } else if (selectedType === 'complaint') {
        validationErrors = validateComplaintData(formData);
              } else if (selectedType === 'programMaster') {
          // validation for program master
          console.log('Validating programMaster formData:', formData);
          if (!formData.SessionNameL1 || formData.SessionNameL1.length < 4) {
            validationErrors = ['SessionNameL1'];
            console.log('SessionNameL1 validation failed:', formData.SessionNameL1);
          } else if (!formData.Description || formData.Description.length < 10) {
            validationErrors = ['Description'];
            console.log('Description validation failed:', formData.Description);
          }
          
          // Validate SessionVideo if provided
          if (formData.SessionVideo && formData.SessionVideo.trim() !== '') {
            try {
              const url = new URL(formData.SessionVideo);
              const videoDomains = [
                'youtube.com', 'youtu.be', 'www.youtube.com',
                'vimeo.com', 'www.vimeo.com',
                'dailymotion.com', 'www.dailymotion.com',
                'facebook.com', 'www.facebook.com',
                'instagram.com', 'www.instagram.com',
                'tiktok.com', 'www.tiktok.com',
                'twitch.tv', 'www.twitch.tv',
                'streamable.com', 'www.streamable.com',
                'wistia.com', 'www.wistia.com',
                'brightcove.com', 'www.brightcove.com'
              ];
              
              const isVideoUrl = videoDomains.some(domain => 
                url.hostname === domain || url.hostname.endsWith('.' + domain)
              );
              
              if (!isVideoUrl) {
                validationErrors.push('SessionVideo');
              }
            } catch {
              validationErrors.push('SessionVideo');
            }
          }
      } else if (selectedType === 'programDetail') {
          // minimal validation for program detail
          console.log('Validating programDetail formData:', formData);
          if (!formData.ProgramsContentMasterId) {
            validationErrors = ['ProgramsContentMasterId'];
            console.log('ProgramsContentMasterId validation failed:', formData.ProgramsContentMasterId);
          } else if (!formData.Title || formData.Title.trim().length < 3) {
            validationErrors = ['Title'];
            console.log('Title validation failed:', formData.Title);
          } else if (!formData.Description || formData.Description.length < 10) {
            validationErrors = ['Description'];
            console.log('Description validation failed:', formData.Description);
          }
      } else if (selectedType === 'branch') {
        // validation for branch
        console.log('Validating branch formData:', formData);
        
        if (!formData.AcademyDataId) {
          validationErrors.push('AcademyDataId');
        }
        
        if (!formData.BranchNameL1 || formData.BranchNameL1.trim() === '') {
          validationErrors.push('BranchNameL1');
        } else if (formData.BranchNameL1.length < 4) {
          validationErrors.push('BranchNameL1');
        }
        
        if (formData.BranchNameL2 && formData.BranchNameL2.trim() !== '') {
          if (formData.BranchNameL2.length < 4) {
            validationErrors.push('BranchNameL2');
          }
        }
        
        if (!formData.BranchAddress || formData.BranchAddress.trim() === '') {
          validationErrors.push('BranchAddress');
        }
        
        if (!formData.BranchMobile || formData.BranchMobile.trim() === '') {
          validationErrors.push('BranchMobile');
        } else if (!/^\d+$/.test(formData.BranchMobile)) {
          validationErrors.push('BranchMobile');
        }
        
        if (formData.BranchPhone && formData.BranchPhone.trim() !== '') {
          if (!/^\d+$/.test(formData.BranchPhone)) {
            validationErrors.push('BranchPhone');
          }
        }
        
        if (!formData.BranchWhatsapp || formData.BranchWhatsapp.trim() === '') {
          validationErrors.push('BranchWhatsapp');
        } else if (!/^\d+$/.test(formData.BranchWhatsapp)) {
          validationErrors.push('BranchWhatsapp');
        }
        
        if (!formData.BranchEmail || formData.BranchEmail.trim() === '') {
          validationErrors.push('BranchEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.BranchEmail)) {
          validationErrors.push('BranchEmail');
        }
      } else if (selectedType === 'academy') {
        // validation for academy
        console.log('Validating academy formData:', formData);
        
        // Required fields validation - only check fields that exist in database
        if (!formData.AcademyNameL1 || formData.AcademyNameL1.trim() === '') {
          validationErrors.push('AcademyNameL1');
        } else if (formData.AcademyNameL1.length < 4) {
          validationErrors.push('AcademyNameL1');
        }
        
        if (!formData.AcademyAddress || formData.AcademyAddress.trim() === '') {
          validationErrors.push('AcademyAddress');
        }
        
        if (!formData.AcademyEmail || formData.AcademyEmail.trim() === '') {
          validationErrors.push('AcademyEmail');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.AcademyEmail)) {
          validationErrors.push('AcademyEmail');
        }
        
        // Optional fields - validate if provided
        if (formData.AcademyPhone && formData.AcademyPhone.trim() !== '') {
          if (!/^\d+$/.test(formData.AcademyPhone)) {
            validationErrors.push('AcademyPhone');
          }
        }
        
        // Validate Description (optional but if provided, must be valid)
        if (formData.Description && formData.Description.trim() !== '') {
          if (formData.Description.length < 10) {
            validationErrors.push('Description');
          } else if (formData.Description.length > 500) {
            validationErrors.push('Description');
          }
        }
        
        // Validate AcademyNameL2 if provided
        if (formData.AcademyNameL2 && formData.AcademyNameL2.trim() !== '') {
          if (formData.AcademyNameL2.length < 4) {
            validationErrors.push('AcademyNameL2');
          }
        }
        
        // Validate URL fields if provided
        if (formData.AcademyWebSite && formData.AcademyWebSite.trim() !== '') {
          try {
            let urlToValidate = formData.AcademyWebSite;
            if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://') && !urlToValidate.startsWith('ftp://')) {
              urlToValidate = 'https://' + urlToValidate;
            }
            new URL(urlToValidate);
          } catch {
            validationErrors.push('AcademyWebSite');
          }
        }
        
        // Validate other social media URLs if provided
        const socialMediaFields = ['AcademyFacebook', 'AcademyInstagram', 'AcademyTiktok', 'AcademyTwitter', 'AcademySnapchat', 'AcademyYoutube'];
        socialMediaFields.forEach(field => {
          if (formData[field] && formData[field].trim() !== '') {
            try {
              let urlToValidate = formData[field];
              if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://') && !urlToValidate.startsWith('ftp://')) {
                urlToValidate = 'https://' + urlToValidate;
              }
              new URL(urlToValidate);
            } catch {
              validationErrors.push(field);
            }
          }
        });
      }
      
      if (validationErrors.length > 0) {
        const errors = {};
        validationErrors.forEach(field => {
          // Provide specific error messages for different field types
          switch (field) {
            case 'AcademyNameL1':
              errors[field] = lang === 'ar' ? 'اسم الأكاديمية يجب أن يكون 4 أحرف على الأقل' : 'Academy name must be at least 4 characters';
              break;
            case 'AcademyNameL2':
              errors[field] = lang === 'ar' ? 'اسم الأكاديمية (2) يجب أن يكون 4 أحرف على الأقل' : 'Academy name (2) must be at least 4 characters';
              break;
            case 'AcademyAddress':
              errors[field] = lang === 'ar' ? 'عنوان الأكاديمية مطلوب' : 'Academy address is required';
              break;
            case 'Location':
              errors[field] = lang === 'ar' ? 'الموقع مطلوب' : 'Location is required';
              break;
            case 'AcademyMobil':
              errors[field] = lang === 'ar' ? 'رقم الجوال مطلوب' : 'Mobile number is required';
              break;
            case 'AcademyEmail':
              errors[field] = lang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
              break;
            case 'TaxRegistrationNumber':
              errors[field] = lang === 'ar' ? 'الرقم الضريبي مطلوب' : 'Tax registration number is required';
              break;
            case 'TaxesErrand':
              errors[field] = lang === 'ar' ? 'ملف الضرائب مطلوب' : 'Taxes errand is required';
              break;
            case 'CommercialRegisterNumber':
              errors[field] = lang === 'ar' ? 'السجل التجاري مطلوب' : 'Commercial register number is required';
              break;
            case 'AcademyWebSite':
              errors[field] = lang === 'ar' ? 'رابط الموقع الإلكتروني غير صحيح' : 'Invalid website URL';
              break;
            case 'AcademyFacebook':
              errors[field] = lang === 'ar' ? 'رابط فيسبوك غير صحيح' : 'Invalid Facebook URL';
              break;
            case 'AcademyInstagram':
              errors[field] = lang === 'ar' ? 'رابط انستغرام غير صحيح' : 'Invalid Instagram URL';
              break;
            case 'AcademyTiktok':
              errors[field] = lang === 'ar' ? 'رابط تيك توك غير صحيح' : 'Invalid TikTok URL';
              break;
            case 'AcademyTwitter':
              errors[field] = lang === 'ar' ? 'رابط تويتر غير صحيح' : 'Invalid Twitter URL';
              break;
            case 'AcademySnapchat':
              errors[field] = lang === 'ar' ? 'رابط سناب شات غير صحيح' : 'Invalid Snapchat URL';
              break;
                        case 'AcademyYoutube':
              errors[field] = lang === 'ar' ? 'رابط يوتيوب غير صحيح' : 'Invalid YouTube URL';
              break;
            case 'SessionVideo':
              errors[field] = lang === 'ar' ? 'الرابط يجب أن يكون من موقع فيديو معروف' : 'URL must be from a known video platform';
              break;
            case 'AcademyDataId':
              errors[field] = lang === 'ar' ? 'يجب اختيار الأكاديمية' : 'Academy must be selected';
              break;
            case 'BranchNameL1':
              errors[field] = lang === 'ar' ? 'اسم الفرع يجب أن يكون 4 أحرف على الأقل' : 'Branch name must be at least 4 characters';
              break;
            case 'BranchNameL2':
              errors[field] = lang === 'ar' ? 'اسم الفرع (2) يجب أن يكون 4 أحرف على الأقل' : 'Branch name (2) must be at least 4 characters';
              break;
            case 'BranchAddress':
              errors[field] = lang === 'ar' ? 'عنوان الفرع مطلوب' : 'Branch address is required';
              break;
            case 'BranchMobile':
              errors[field] = lang === 'ar' ? 'رقم الجوال يجب أن يحتوي على أرقام فقط' : 'Mobile number must contain only digits';
              break;
            case 'BranchPhone':
              errors[field] = lang === 'ar' ? 'رقم الهاتف يجب أن يحتوي على أرقام فقط' : 'Phone number must contain only digits';
              break;
            case 'BranchWhatsapp':
              errors[field] = lang === 'ar' ? 'رقم الواتساب يجب أن يحتوي على أرقام فقط' : 'WhatsApp number must contain only digits';
              break;
            case 'BranchEmail':
              errors[field] = lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
              break;
            case 'Title':
              errors[field] = lang === 'ar' ? 'العنوان مطلوب ويجب أن يكون 3 أحرف على الأقل' : 'Title is required and must be at least 3 characters';
              break;
            case 'ProgramsContentMasterId':
              errors[field] = lang === 'ar' ? 'البرنامج الرئيسي مطلوب' : 'Program Master is required';
              break;
            default:
          errors[field] = lang === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
          }
        });
        setFormErrors(errors);
        return;
      }
      
      // Clean the form data before sending to API
      const cleanedFormData = cleanFormDataForAPI(formData, selectedType);
      console.log('Original formData:', formData);
      console.log('Cleaned formData:', cleanedFormData);
      console.log('Selected type:', selectedType);
      
      // Additional logging for FormData
      if (cleanedFormData instanceof FormData) {
        console.log('FormData contents before sending:');
        for (let [key, value] of cleanedFormData.entries()) {
          console.log(`${key}:`, value);
        }
      }
      
      // For projectDetail, pass the original formData to ensure data integrity
      dataToSend = cleanedFormData;
      if (selectedType === 'projectDetail' && cleanedFormData instanceof FormData) {
        // Extract the data from FormData and pass as object to let API service handle conversion
        const extractedData = {};
        for (let [key, value] of cleanedFormData.entries()) {
          extractedData[key] = value;
        }
        dataToSend = extractedData;
        console.log('Extracted data for projectDetail:', extractedData);
      }
      
      if (editDialogOpen) {
        // Handle edit
        switch (selectedType) {
          case 'projectMaster':
            await api.updateProject(selectedItem.id, dataToSend);
            break;
          case 'projectDetail':
            await api.updateProjectDetail(selectedItem.id, dataToSend);
            break;
          case 'programMaster':
            await api.updateProgramContentMaster(selectedItem.id, dataToSend);
            break;
          case 'programDetail':
            await api.updateProgramContentDetail(selectedItem.id, dataToSend);
            break;
          case 'academy':
            await api.updateAcademy(selectedItem.id, dataToSend);
            break;
          case 'branch':
            await api.updateBranch(selectedItem.id, dataToSend);
            break;
          case 'student':
            await api.updateStudent(selectedItem.id, dataToSend);
            break;
          case 'teacher':
            await api.updateTrainer(selectedItem.id, dataToSend);
            break;
          case 'course':
            await api.updateCourse(selectedItem.id, dataToSend);
            break;
                  case 'complaint':
          await api.updateComplaint(selectedItem.id, dataToSend);
          break;
        case 'complaintType':
          await api.updateComplaintType(selectedItem.id, dataToSend);
          break;
        case 'complaintStatus':
          await api.updateComplaintStatus(selectedItem.id, dataToSend);
          break;
        case 'programDetail':
          await api.updateProgramContentDetail(selectedItem.id, dataToSend);
          // تحديث بيانات Programs Content Detail مباشرة
          try {
            const updatedProgramsContentDetail = await api.getProgramsContentDetail();
            const programsDetailData = updatedProgramsContentDetail?.program_details || updatedProgramsContentDetail || [];
            setProgramsContentDetail(Array.isArray(programsDetailData) ? programsDetailData : []);
            console.log('Updated programsContentDetail after updating:', programsDetailData);
          } catch (error) {
            console.error('Error updating programsContentDetail:', error);
          }
          break;
        }
        toast.success(lang === 'ar' ? 'تم التحديث بنجاح' : 'Updated successfully');
        setEditDialogOpen(false);
      } else {
        // Handle add
        switch (selectedType) {
          case 'projectMaster':
            await api.createProject(dataToSend);
            // تحديث بيانات Projects Master مباشرة
            try {
              const updatedProjectsMaster = await api.getProjects();
              const projectsMasterData = updatedProjectsMaster?.projects || updatedProjectsMaster || [];
              setProjectsMaster(Array.isArray(projectsMasterData) ? projectsMasterData : []);
              
              // Update categories
              const uniqueCategories = [...new Set(projectsMasterData
                .filter(project => project.category)
                .map(project => project.category)
              )];
              setProjectCategories(uniqueCategories);
              console.log('Updated projectsMaster after adding:', projectsMasterData);
            } catch (error) {
              console.error('Error updating projectsMaster:', error);
            }
            break;
          case 'projectDetail':
            console.log('Creating project detail with data:', dataToSend);
            await api.createProjectDetail(dataToSend);
            // تحديث بيانات Projects Detail مباشرة
            try {
              const updatedProjectsDetail = await api.getProjectsDetail();
              const projectsDetailData = updatedProjectsDetail?.project_details || updatedProjectsDetail || [];
              setProjectsDetail(Array.isArray(projectsDetailData) ? projectsDetailData : []);
              console.log('Updated projectsDetail after adding:', projectsDetailData);
            } catch (error) {
              console.error('Error updating projectsDetail:', error);
            }
            break;
          case 'programMaster':
            await api.createProgramContentMaster(dataToSend);
            break;
          case 'programDetail':
            console.log('=== Programs Detail Save Process Started ===');
            console.log('Data to send:', dataToSend);
            console.log('Data to send type:', typeof dataToSend);
            console.log('Data to send keys:', dataToSend ? Object.keys(dataToSend) : 'No data');
            
            // Log each field in the dataToSend object
            if (dataToSend) {
              Object.keys(dataToSend).forEach(key => {
                console.log(`Sending field "${key}":`, dataToSend[key]);
                console.log(`  Type:`, typeof dataToSend[key]);
                console.log(`  Is FormData:`, dataToSend[key] instanceof FormData);
              });
            }
            
            const saveResponse = await api.createProgramContentDetail(dataToSend);
            console.log('=== Save Response ===');
            console.log('Save API Response:', saveResponse);
            console.log('Save Response Type:', typeof saveResponse);
            console.log('Save Response Keys:', saveResponse ? Object.keys(saveResponse) : 'No response');
            
            // Update Programs Content Detail data directly
            try {
              console.log('=== Waiting for database commit ===');
              // Wait a moment for database commit to complete
              await new Promise(resolve => setTimeout(resolve, 500));
              
              console.log('=== Starting Data Reload ===');
              const updatedProgramsContentDetail = await api.getProgramsContentDetail();
              console.log('Raw API Response:', updatedProgramsContentDetail);
              console.log('Response Type:', typeof updatedProgramsContentDetail);
              console.log('Response Keys:', updatedProgramsContentDetail ? Object.keys(updatedProgramsContentDetail) : 'No response');
              
              // Log each key and its value
              if (updatedProgramsContentDetail) {
                Object.keys(updatedProgramsContentDetail).forEach(key => {
                  console.log(`Key "${key}":`, updatedProgramsContentDetail[key]);
                  console.log(`Value Type:`, typeof updatedProgramsContentDetail[key]);
                  console.log(`Is Array:`, Array.isArray(updatedProgramsContentDetail[key]));
                  console.log(`Length:`, updatedProgramsContentDetail[key]?.length || 'N/A');
                });
              }
              
              const programsDetailData = updatedProgramsContentDetail?.program_details || updatedProgramsContentDetail || [];
              console.log('Extracted programsDetailData:', programsDetailData);
              console.log('programsDetailData Type:', typeof programsDetailData);
              console.log('programsDetailData Length:', programsDetailData?.length || 'N/A');
              console.log('Is Array?', Array.isArray(programsDetailData));
              
              if (programsDetailData && programsDetailData.length > 0) {
                console.log('Sample program detail item:', programsDetailData[0]);
                console.log('Sample item keys:', Object.keys(programsDetailData[0]));
              }
              
              setProgramsContentDetail(Array.isArray(programsDetailData) ? programsDetailData : []);
              console.log('=== State Updated ===');
              console.log('Final programsContentDetail set to:', programsDetailData);
            } catch (error) {
              console.error('=== Error During Reload ===');
              console.error('Error updating programsContentDetail:', error);
              console.error('Error Stack:', error.stack);
            }
            console.log('=== Programs Detail Save Process Complete ===');
            break;
          case 'student':
            await api.createStudent(dataToSend);
            break;
          case 'teacher':
            await api.createTrainer(dataToSend);
            break;
          case 'course':
            await api.createCourse(dataToSend);
            break;
                  case 'complaint':
          await api.createComplaint(dataToSend);
          break;
        case 'complaintType':
          await api.createComplaintType(dataToSend);
          break;
        case 'complaintStatus':
          await api.createComplaintStatus(dataToSend);
          break;
        }
        toast.success(lang === 'ar' ? 'تم الإضافة بنجاح' : 'Added successfully');
        setAddDialogOpen(false);
      }
      
      // إعادة تحميل البيانات بعد الحفظ (للباقي)
      if (selectedType !== 'programDetail') {
        loadAllData();
      }
      setFormData({});
    } catch (error) {
      console.error('Error saving item:', error);
      
      // Parse error details
      let errorMessage = lang === 'ar' ? 'خطأ في الحفظ' : 'Error saving item';
      
      if (error.body) {
        try {
          const errorBody = JSON.parse(error.body);
          if (errorBody.errors) {
            // Handle validation errors
            const errorDetails = Object.entries(errorBody.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('; ');
            errorMessage = `Validation errors: ${errorDetails}`;
          } else if (errorBody.detail) {
            errorMessage = errorBody.detail;
          } else if (errorBody.title) {
            errorMessage = errorBody.title;
          }
        } catch (parseError) {
          console.warn('Failed to parse error body:', parseError);
        }
      }
      
      // Show specific error messages based on status
      if (error.status === 500) {
        errorMessage = lang === 'ar' 
          ? 'خطأ في الخادم - يرجى التحقق من البيانات المدخلة'
          : 'Server error - Please check the entered data';
      } else if (error.status === 404) {
        errorMessage = lang === 'ar' 
          ? 'العنصر غير موجود'
          : 'Item not found';
      } else if (error.status === 400) {
        errorMessage = lang === 'ar' 
          ? 'بيانات غير صحيحة - يرجى التحقق من الحقول المطلوبة'
          : 'Invalid data - Please check required fields';
      }
      
      toast.error(errorMessage);
      
      // Log additional details for debugging
      console.log('Error status:', error.status);
      console.log('Error body:', error.body);
      console.log('Form data that was sent:', selectedType === 'teacher' ? 'FormData object' : dataToSend);
      console.log('Selected type:', selectedType);
    }
  };

  const getTypeDisplayName = (type) => {
    switch (type) {
      case 'projectMaster':
        return lang === 'ar' ? 'مشروع رئيسي' : 'Project Master';
      case 'projectDetail':
        return lang === 'ar' ? 'تفاصيل المشروع' : 'Project Detail';
      case 'programMaster':
        return lang === 'ar' ? 'البرنامج الرئيسي' : 'Program Master';
      case 'programDetail':
        return lang === 'ar' ? 'تفاصيل البرنامج' : 'Program Detail';
      case 'academy':
        return lang === 'ar' ? 'أكاديمية' : 'Academy';
      case 'branch':
        return lang === 'ar' ? 'فرع' : 'Branch';
      case 'student':
        return lang === 'ar' ? 'طالب' : 'Student';
      case 'teacher':
        return lang === 'ar' ? 'مدرس' : 'Teacher';
      case 'course':
        return lang === 'ar' ? 'دورة' : 'Course';
      case 'complaint':
        return lang === 'ar' ? 'شكوى' : 'Complaint';
      case 'complaintType':
        return lang === 'ar' ? 'نوع شكوى' : 'Complaint Type';
      case 'complaintStatus':
        return lang === 'ar' ? 'حالة شكوى' : 'Complaint Status';
      default:
        return type;
    }
  };

  const renderDataTable = (data, type, columns) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <div className="mb-4">
            <Database className="h-12 w-12 mx-auto text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium mb-2">
          {lang === 'ar' ? 'لا توجد بيانات' : 'No data available'}
          </p>
          <p className="text-sm mb-4">
            {lang === 'ar' 
              ? 'لم يتم العثور على بيانات لهذا القسم. قد تكون هناك مشكلة في الاتصال بالخادم.'
              : 'No data found for this section. There might be a connection issue with the server.'
            }
          </p>
          <Button 
            onClick={loadAllData} 
            variant="outline" 
            size="sm"
            className="rounded-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {lang === 'ar' ? 'إعادة تحميل البيانات' : 'Reload Data'}
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted/50">
              {columns.map((column) => (
                <th key={column.key} className="border border-border px-4 py-2 text-left text-sm font-medium">
                  {column.label}
                </th>
              ))}
              <th className="border border-border px-4 py-2 text-center text-sm font-medium">
                {lang === 'ar' ? 'الإجراءات' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-muted/30">
                {columns.map((column) => (
                  <td key={column.key} className="border border-border px-4 py-2 text-sm">
                    {column.render ? column.render(item[column.key], item) : item[column.key] || '-'}
                  </td>
                ))}
                <td className="border border-border px-4 py-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(item, type)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item, type)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item, type)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                {lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              </h1>
              <p className="text-white/90">
                {lang === 'ar' ? 'إدارة النظام والبيانات' : 'Manage system and data'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${students.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{lang === 'ar' ? 'الطلاب' : 'Students'}: {students.length}</span>
                  {!sectionsLoaded.students && (
                    <Button 
                      onClick={() => loadSectionData('students')} 
                      size="sm" 
                      variant="outline"
                      className="h-6 w-6 p-0 ml-1"
                      disabled={loadingStates.students}
                    >
                      {loadingStates.students ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${teachers.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{lang === 'ar' ? 'المدرسين' : 'Teachers'}: {teachers.length}</span>
                  {!sectionsLoaded.teachers && (
                    <Button 
                      onClick={() => loadSectionData('teachers')} 
                      size="sm" 
                      variant="outline"
                      className="h-6 w-6 p-0 ml-1"
                      disabled={loadingStates.teachers}
                    >
                      {loadingStates.teachers ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${academies.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{lang === 'ar' ? 'الأكاديميات' : 'Academies'}: {academies.length}</span>
                  {!sectionsLoaded.academies && (
                    <Button 
                      onClick={() => loadSectionData('academies')} 
                      size="sm" 
                      variant="outline"
                      className="h-6 w-6 p-0 ml-1"
                      disabled={loadingStates.academies}
                    >
                      {loadingStates.academies ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${branches.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>{lang === 'ar' ? 'الفروع' : 'Branches'}: {branches.length}</span>
                  {!sectionsLoaded.branches && (
                    <Button 
                      onClick={() => loadSectionData('branches')} 
                      size="sm" 
                      variant="outline"
                      className="h-6 w-6 p-0 ml-1"
                      disabled={loadingStates.branches}
                    >
                      {loadingStates.branches ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <Button onClick={loadAllData} variant="outline" className="rounded-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                {lang === 'ar' ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={lang === 'ar' ? 'البحث في جميع البيانات...' : 'Search all data...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Warning for missing essential data */}
          {(students.length === 0 || teachers.length === 0 || academies.length === 0 || branches.length === 0) && (
            <Card className="bg-yellow-500/20 border-yellow-500/30 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800 font-medium">
                      {lang === 'ar' ? 'تحذير: بيانات مفقودة' : 'Warning: Missing Data'}
                    </p>
                    <p className="text-yellow-700 text-sm">
                      {lang === 'ar' 
                        ? 'بعض البيانات الأساسية مفقودة. قد يؤثر هذا على عمل النظام.'
                        : 'Some essential data is missing. This may affect system functionality.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* مساحة مخصصة لرسائل النجاح */}
          <div className="mb-6">
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">{successMessage}</span>
                <Button
                  onClick={() => setShowSuccessMessage(false)}
                  size="sm"
                  variant="ghost"
                  className="ml-auto h-6 w-6 p-0 text-green-600 hover:text-green-800"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="projects" className="w-full" onValueChange={(value) => {
            // تحميل البيانات عند التبديل للقسم
            if (value === 'projects' && !sectionsLoaded.projects) {
              loadSectionData('projects');
            } else if (value === 'programs' && !sectionsLoaded.programs) {
              loadSectionData('programs');
            } else if (value === 'academies' && !sectionsLoaded.academies) {
              loadSectionData('academies');
            } else if (value === 'users' && (!sectionsLoaded.students || !sectionsLoaded.teachers)) {
              if (!sectionsLoaded.students) loadSectionData('students');
              if (!sectionsLoaded.teachers) loadSectionData('teachers');
            } else if (value === 'complaints' && !sectionsLoaded.complaints) {
              loadSectionData('complaints');
            }
          }}>
            <TabsList className="grid w-full grid-cols-5 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {lang === 'ar' ? 'المشاريع' : 'Projects'}
              </TabsTrigger>
              <TabsTrigger value="programs" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {lang === 'ar' ? 'البرامج' : 'Programs'}
              </TabsTrigger>
              <TabsTrigger value="academies" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                {lang === 'ar' ? 'الأكاديميات' : 'Academies'}
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {lang === 'ar' ? 'المستخدمين' : 'Users'}
              </TabsTrigger>
              <TabsTrigger value="complaints" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {lang === 'ar' ? 'الشكاوى' : 'Complaints'}
              </TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6 mt-6">
              {loadingStates.projects && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lang === 'ar' ? 'جاري تحميل المشاريع...' : 'Loading projects...'}
                    </p>
                  </div>
                </div>
              )}
              {!loadingStates.projects && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Master */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          {lang === 'ar' ? 'المشاريع الرئيسية' : 'Project Master'}
                        </CardTitle>
                        <CardDescription>
                          {lang === 'ar' ? 'إدارة المشاريع الرئيسية' : 'Manage main projects'}
                        </CardDescription>
                      </div>
                      <Button onClick={() => handleAdd('projectMaster')} size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDataTable(projectsMaster, 'projectMaster', [
                      { key: 'name', label: lang === 'ar' ? 'Project Name' : 'Project Name' },
                      { key: 'description', label: lang === 'ar' ? 'Description' : 'Description' },
                      { key: 'category', label: lang === 'ar' ? 'Category' : 'Category' },
                      { key: 'status', label: lang === 'ar' ? 'Status' : 'Status' },
                      { key: 'start_date', label: lang === 'ar' ? 'Start Date' : 'Start Date' },
                      { key: 'end_date', label: lang === 'ar' ? 'End Date' : 'End Date' }
                    ])}
                  </CardContent>
                </Card>

                {/* Project Details */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {lang === 'ar' ? 'تفاصيل المشاريع' : 'Project Details'}
                        </CardTitle>
                        <CardDescription>
                          {lang === 'ar' ? 'إدارة تفاصيل المشاريع' : 'Manage project details'}
                        </CardDescription>
                      </div>
                      <Button onClick={() => handleAdd('projectDetail')} size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDataTable(projectsDetail, 'projectDetail', [
                      { key: 'project_id', label: lang === 'ar' ? 'Project Master' : 'Project Master', render: (_, item) => {
                        const master = projectsMaster.find(p => p.id === item.project_id);
                        return master ? (master.name || master.id) : '-';
                      }},
                      { key: 'title', label: lang === 'ar' ? 'Title' : 'Title' },
                      { key: 'content', label: lang === 'ar' ? 'Content' : 'Content' },
                      { key: 'order_index', label: lang === 'ar' ? 'Order' : 'Order' }
                    ])}
                  </CardContent>
                </Card>
              </div>
              )}
            </TabsContent>

            {/* Programs Tab */}
            <TabsContent value="programs" className="space-y-6 mt-6">
              {loadingStates.programs && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lang === 'ar' ? 'جاري تحميل البرامج...' : 'Loading programs...'}
                    </p>
                  </div>
                </div>
              )}
              {!loadingStates.programs && (
                <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Programs Master */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {lang === 'ar' ? 'البرامج الرئيسية' : 'Programs Master'}
                        </CardTitle>
                        <CardDescription>
                              {lang === 'ar' ? 'إدارة البرامج الرئيسية' : 'Manage main programs'}
                        </CardDescription>
                      </div>
                          <Button onClick={() => handleAdd('programMaster')} size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                        {renderDataTable(programsContentMaster, 'programMaster', [
                      { key: 'sessionNameL1', label: lang === 'ar' ? 'اسم الجلسة' : 'Session Name', render: (_, item) => item.name || item.SessionNameL1 || item.sessionNameL1 || '-' },
                      { key: 'sessionNameL2', label: lang === 'ar' ? 'اسم الجلسة (2)' : 'Session Name (2)', render: (_, item) => item.name2 || item.SessionNameL2 || item.sessionNameL2 || '-' },
                      { key: 'description', label: lang === 'ar' ? 'الوصف' : 'Description', render: (_, item) => item.description || item.Description || '-' }
                    ])}
                  </CardContent>
                </Card>

                    {/* Programs Detail */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                              <ClipboardList className="h-4 w-4" />
                              {lang === 'ar' ? 'تفاصيل البرامج' : 'Programs Detail'}
                        </CardTitle>
                        <CardDescription>
                              {lang === 'ar' ? 'إدارة تفاصيل البرامج' : 'Manage program details'}
                        </CardDescription>
                      </div>
                          <Button onClick={() => handleAdd('programDetail')} size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                        {renderDataTable(programsContentDetail, 'programDetail', [
                      { key: 'program_id', label: lang === 'ar' ? 'Program Master' : 'Program Master', render: (_, item) => {
                        const master = programsContentMaster.find(p => p.id === item.program_id);
                        return master ? (master.name || master.id) : '-';
                      }},
                      { key: 'title', label: lang === 'ar' ? 'العنوان' : 'Title' },
                      { key: 'content', label: lang === 'ar' ? 'المحتوى' : 'Content' },
                      { key: 'session_video', label: lang === 'ar' ? 'فيديو الجلسة' : 'Session Video', render: (_, item) => {
                        const video = item.session_video || '';
                        return video ? (
                          <a href={video} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {video.length > 30 ? video.substring(0, 30) + '...' : video}
                          </a>
                        ) : '-';
                      }},
                      { key: 'order_index', label: lang === 'ar' ? 'الترتيب' : 'Order' }
                    ])}
                  </CardContent>
                </Card>
              </div>


                </>
              )}
            </TabsContent>

            {/* Academies Tab */}
            <TabsContent value="academies" className="space-y-6 mt-6">
              {loadingStates.academies && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lang === 'ar' ? 'جاري تحميل الأكاديميات...' : 'Loading academies...'}
                    </p>
                  </div>
                </div>
              )}
              {!loadingStates.academies && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Academies */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {lang === 'ar' ? 'الأكاديميات' : 'Academies'}
                        </CardTitle>
                        <CardDescription>
                          {lang === 'ar' ? 'إدارة الأكاديميات' : 'Manage academies'}
                        </CardDescription>
                      </div>
                      <Button onClick={() => handleAdd('academy')} size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDataTable(academies, 'academy', [
                      { key: 'name', label: lang === 'ar' ? 'اسم الأكاديمية' : 'Academy Name' },
                      { key: 'description', label: lang === 'ar' ? 'الوصف' : 'Description' },
                      { key: 'address', label: lang === 'ar' ? 'العنوان' : 'Address' },
                      { key: 'phone', label: lang === 'ar' ? 'الهاتف' : 'Phone' },
                      { key: 'email', label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email' }
                    ])}
                  </CardContent>
                </Card>

                {/* Branches */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {lang === 'ar' ? 'الفروع' : 'Branches'}
                        </CardTitle>
                        <CardDescription>
                          {lang === 'ar' ? 'إدارة فروع الأكاديميات' : 'Manage academy branches'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                      <Button onClick={() => handleAdd('branch')} size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDataTable(branches, 'branch', [
                      { key: 'name', label: lang === 'ar' ? 'اسم الفرع' : 'Branch Name' },
                      { key: 'address', label: lang === 'ar' ? 'العنوان' : 'Address' },
                      { key: 'phone', label: lang === 'ar' ? 'الهاتف' : 'Phone' },
                      { key: 'email', label: lang === 'ar' ? 'البريد الإلكتروني' : 'Email' }
                    ])}
                  </CardContent>
                </Card>
              </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Students */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="h-5 w-5" />
                          {lang === 'ar' ? 'الطلاب' : 'Students'}
                        </CardTitle>
                        <CardDescription>
                          {lang === 'ar' ? 'إدارة الطلاب' : 'Manage students'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                                              <Button onClick={() => handleAdd('student')} size="sm" className="rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        {lang === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDataTable(students, 'student', [
                      { key: 'name', label: lang === 'ar' ? 'Name' : 'Name' },
                      { key: 'email', label: lang === 'ar' ? 'Email' : 'Email', render: (_, it) => (
                        it.email ? (
                          <a href={`mailto:${it.email}`} className="text-blue-600 hover:underline">
                            {it.email}
                          </a>
                        ) : '-'
                      )},
                      { key: 'phone', label: lang === 'ar' ? 'Phone' : 'Phone' },
                      { key: 'address', label: lang === 'ar' ? 'Address' : 'Address' },
                      { key: 'birth_date', label: lang === 'ar' ? 'Birth Date' : 'Birth Date' },
                      { key: 'enrollment_date', label: lang === 'ar' ? 'Enrollment Date' : 'Enrollment Date' }
                    ])}
                  </CardContent>
                </Card>

                {/* Teachers */}
                <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5" />
                          {lang === 'ar' ? 'المدرسين' : 'Teachers'}
                        </CardTitle>
                        <CardDescription>
                          {lang === 'ar' ? 'إدارة المدرسين' : 'Manage teachers'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => handleAdd('teacher')} size="sm" className="rounded-full">
                          <Plus className="h-4 w-4 mr-2" />
                          {lang === 'ar' ? 'Add' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderDataTable(teachers, 'teacher', [
                      { key: 'name', label: lang === 'ar' ? 'Name' : 'Name' },
                      { key: 'email', label: lang === 'ar' ? 'Email' : 'Email', render: (_, it) => (
                        it.email ? (
                          <a href={`mailto:${it.email}`} className="text-blue-600 hover:underline">
                            {it.email}
                          </a>
                        ) : '-'
                      )},
                      { key: 'phone', label: lang === 'ar' ? 'Phone' : 'Phone' },
                      { key: 'specialization', label: lang === 'ar' ? 'Specialization' : 'Specialization' },
                      { key: 'experience_years', label: lang === 'ar' ? 'Experience' : 'Experience', render: (_, it) => (it.experience_years ? `${it.experience_years} years` : '-') },
                      { key: 'bio', label: lang === 'ar' ? 'Bio' : 'Bio' }
                    ])}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Complaints Tab */}
            <TabsContent value="complaints" className="space-y-6 mt-6">
              {loadingStates.complaints && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {lang === 'ar' ? 'جاري تحميل الشكاوى...' : 'Loading complaints...'}
                    </p>
                  </div>
                </div>
              )}
              {!loadingStates.complaints && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Complaints */}
                  <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border lg:col-span-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            {lang === 'ar' ? 'الشكاوى' : 'Complaints'}
                          </CardTitle>
                          <CardDescription>
                            {lang === 'ar' ? 'إدارة شكاوى الطلاب' : 'Manage student complaints'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={async () => {
                              setLoadingState('complaints', true);
                              try {
                                const [complaintsData, typesData, statusesData] = await Promise.all([
                                  api.getComplaints().catch(() => []),
                                  api.getComplaintTypes().catch(() => []),
                                  api.getComplaintStatus().catch(() => [])
                                ]);
                                setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
                                setComplaintTypes(Array.isArray(typesData) ? typesData : []);
                                setComplaintStatuses(Array.isArray(statusesData) ? statusesData : []);
                                
                                const message = lang === 'ar' ? 'تم تحديث بيانات الشكاوى' : 'Complaints data updated';
                                setSuccessMessage(message);
                                setShowSuccessMessage(true);
                                setTimeout(() => setShowSuccessMessage(false), 3000);
                                
                              } catch (error) {
                                toast.error(lang === 'ar' ? 'خطأ في تحديث بيانات الشكاوى' : 'Error updating complaints data');
                              } finally {
                                setLoadingState('complaints', false);
                              }
                            }} 
                            size="sm" 
                            variant="outline"
                            className="rounded-full"
                            disabled={loadingStates.complaints}
                          >
                            {loadingStates.complaints ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button onClick={() => handleAdd('complaint')} size="sm" className="rounded-full">
                            <Plus className="h-4 w-4 mr-2" />
                            {lang === 'ar' ? 'إضافة' : 'Add'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-border">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                                {lang === 'ar' ? 'رقم الشكوى' : 'Complaint No'}
                              </th>
                              <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                                {lang === 'ar' ? 'الوصف' : 'Description'}
                              </th>
                              <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                                {lang === 'ar' ? 'التاريخ' : 'Date'}
                              </th>
                              <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                                {lang === 'ar' ? 'نوع الشكوى' : 'Type'}
                              </th>
                              <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                                {lang === 'ar' ? 'الحالة' : 'Status'}
                              </th>
                              <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                                {lang === 'ar' ? 'الطالب' : 'Student'}
                              </th>
                              <th className="border border-border px-4 py-2 text-center text-sm font-medium">
                                {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {complaints.map((item, index) => (
                              <tr key={item.id || index} className="hover:bg-muted/30">
                                <td className="border border-border px-4 py-2 text-sm">
                                  {item.ComplaintsNo || item.complaintsNo || '-'}
                                </td>
                                <td className="border border-border px-4 py-2 text-sm">
                                  {(() => {
                          const desc = item.Description || item.description || '';
                          return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc || '-';
                                  })()}
                                </td>
                                <td className="border border-border px-4 py-2 text-sm">
                                  {(() => {
                          const date = item.Date || item.date;
                          return date ? new Date(date).toLocaleDateString() : '-';
                                  })()}
                                </td>
                                <td className="border border-border px-4 py-2 text-sm">
                                  {(() => {
                          const type = complaintTypes.find(t => t.id === (item.ComplaintsTypeId || item.complaintsTypeId));
                          if (!type) return '-';
                          
                          // Try different possible field names for type names
                          const typeNameL1 = type.typeNameL1 || type.typeNameL2 || type.nameL1 || type.name;
                          const typeNameL2 = type.typeNameL2 || type.nameL2;
                          
                          // Use the appropriate language or fallback to ID
                          const typeName = lang === 'ar' 
                            ? (typeNameL1 || typeNameL2 || type.id)
                            : (typeNameL2 || typeNameL1 || type.id);
                          
                          return typeName;
                                  })()}
                                </td>
                                <td className="border border-border px-4 py-2 text-sm">
                                  {(() => {
                          const status = complaintStatuses.find(s => s.id === (item.ComplaintsStatusesId || item.complaintsStatusesId));
                          if (!status) return '-';
                          
                          // Try different possible field names for status names
                          const statusNameL1 = status.statusNameL1 || status.statusesNameL1 || status.nameL1 || status.name;
                          const statusNameL2 = status.statusNameL2 || status.statusesNameL2 || status.nameL2;
                          
                          // Use the appropriate language or fallback to ID
                          const statusName = lang === 'ar' 
                            ? (statusNameL1 || statusNameL2 || status.id)
                            : (statusNameL2 || statusNameL1 || status.id);
                          
                          const isResolved = statusName?.toLowerCase().includes('resolved') || statusName?.toLowerCase().includes('محلول');
                          return (
                            <Badge variant={isResolved ? "default" : "secondary"}>
                              {statusName}
                            </Badge>
                          );
                                  })()}
                                </td>
                                <td className="border border-border px-4 py-2 text-sm">
                                  {(() => {
                          const student = students.find(s => s.id === (item.StudentsDataId || item.studentsDataId));
                          return student ? (student.studentNameL1 || student.studentNameL2 || student.firstName || student.name || student.id) : '-';
                                  })()}
                                </td>
                                <td className="border border-border px-4 py-2 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleView(item, 'complaint')}
                                      className="h-8 w-8 p-0"
                                      title={lang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleComplaintStatusChange(item)}
                                      className="h-8 w-8 p-0"
                                      title={lang === 'ar' ? 'تغيير الحالة' : 'Change Status'}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(item, 'complaint')}
                                      className="h-8 w-8 p-0"
                                      title={lang === 'ar' ? 'تعديل' : 'Edit'}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDelete(item, 'complaint')}
                                      className="h-8 w-8 p-0"
                                      title={lang === 'ar' ? 'حذف' : 'Delete'}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Complaint Types & Statuses */}
                  <div className="space-y-6">
                    {/* Complaint Types */}
                    <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" />
                              {lang === 'ar' ? 'أنواع الشكاوى' : 'Complaint Types'}
                            </CardTitle>
                            <CardDescription>
                              {lang === 'ar' ? 'إدارة أنواع الشكاوى' : 'Manage complaint types'}
                            </CardDescription>
                          </div>
                          <Button onClick={() => handleAdd('complaintType')} size="sm" className="rounded-full">
                            <Plus className="h-4 w-4 mr-2" />
                            {lang === 'ar' ? 'إضافة' : 'Add'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderDataTable(complaintTypes, 'complaintType', [
                          { key: 'name', label: lang === 'ar' ? 'النوع' : 'Type' },
                          { key: 'description', label: lang === 'ar' ? 'الوصف' : 'Description', render: (_, item) => {
                            const desc = item.description || '';
                            return desc.length > 50 ? desc.substring(0, 50) + '...' : desc || '-';
                          }}
                        ])}
                      </CardContent>
                    </Card>

                    {/* Complaint Statuses */}
                    <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              {lang === 'ar' ? 'حالات الشكاوى' : 'Complaint Statuses'}
                            </CardTitle>
                            <CardDescription>
                              {lang === 'ar' ? 'إدارة حالات الشكاوى' : 'Manage complaint statuses'}
                            </CardDescription>
                          </div>
                          <Button onClick={() => handleAdd('complaintStatus')} size="sm" className="rounded-full">
                            <Plus className="h-4 w-4 mr-2" />
                            {lang === 'ar' ? 'إضافة' : 'Add'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderDataTable(complaintStatuses, 'complaintStatus', [
                          { key: 'name', label: lang === 'ar' ? 'الحالة' : 'Status' },
                          { key: 'description', label: lang === 'ar' ? 'الوصف' : 'Description', render: (_, item) => {
                            const desc = item.description || '';
                            return desc.length > 50 ? desc.substring(0, 50) + '...' : desc || '-';
                          }}
                        ])}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar' 
                ? `هل أنت متأكد من حذف ${getTypeDisplayName(selectedType)}؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete this ${getTypeDisplayName(selectedType)}? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {lang === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Status Change Dialog */}
      <Dialog open={complaintStatusDialogOpen} onOpenChange={setComplaintStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {lang === 'ar' ? 'تغيير حالة الشكوى' : 'Change Complaint Status'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar' 
                ? 'اختر الحالة الجديدة للشكوى. يمكنك الموافقة أو رفض الطلب أو تغيير الحالة إلى أي حالة أخرى متاحة.'
                : 'Select the new status for the complaint. You can approve or reject the request or change the status to any other available status.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'الحالة الحالية' : 'Current Status'}
              </label>
              <div className="p-3 bg-muted rounded-md">
                {(() => {
                  if (!selectedItem) return '-';
                  const status = complaintStatuses.find(s => s.id === (selectedItem.ComplaintsStatusesId || selectedItem.complaintsStatusesId));
                  if (!status) return '-';
                  
                  // Try different possible field names for status names
                  const statusNameL1 = status.statusNameL1 || status.statusesNameL1 || status.nameL1 || status.name;
                  const statusNameL2 = status.statusNameL2 || status.statusesNameL2 || status.nameL2;
                  
                  // Use the appropriate language or fallback to ID
                  const statusName = lang === 'ar' 
                    ? (statusNameL1 || statusNameL2 || status.id)
                    : (statusNameL2 || statusNameL1 || status.id);
                  
                  const isResolved = statusName?.toLowerCase().includes('resolved') || statusName?.toLowerCase().includes('محلول');
                  return (
                    <Badge variant={isResolved ? "default" : "secondary"}>
                      {statusName}
                    </Badge>
                  );
                })()}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'الحالة الجديدة' : 'New Status'}
              </label>
              <Select
                value={formData.ComplaintsStatusesId || ''}
                onValueChange={(v) => setFormData({ ...formData, ComplaintsStatusesId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={lang === 'ar' ? 'اختر الحالة الجديدة' : 'Select New Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {complaintStatuses.map((status) => {
                      // Try different possible field names for status names
                      const statusNameL1 = status.statusNameL1 || status.statusesNameL1 || status.nameL1 || status.name;
                      const statusNameL2 = status.statusNameL2 || status.statusesNameL2 || status.nameL2;
                      
                      // Use the appropriate language or fallback to ID
                      const displayName = lang === 'ar' 
                        ? (statusNameL1 || statusNameL2 || status.id)
                        : (statusNameL2 || statusNameL1 || status.id);
                      
                      return (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex items-center gap-2">
                            <span>{displayName}</span>
                            {statusNameL1?.toLowerCase().includes('resolved') || statusNameL1?.toLowerCase().includes('محلول') ? (
                              <Badge variant="default" className="text-xs">✓</Badge>
                            ) : statusNameL1?.toLowerCase().includes('rejected') || statusNameL1?.toLowerCase().includes('مرفوض') ? (
                              <Badge variant="destructive" className="text-xs">✗</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">○</Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComplaintStatusDialogOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={() => handleComplaintStatusUpdate(formData.ComplaintsStatusesId)}
              disabled={!formData.ComplaintsStatusesId}
              className="bg-green-600 hover:bg-green-700"
            >
              {lang === 'ar' ? 'تحديث الحالة' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {selectedType === 'projectMaster' && (lang === 'ar' ? 'إضافة مشروع رئيسي جديد' : 'Add New Project Master')}
              {selectedType === 'projectDetail' && (lang === 'ar' ? 'إضافة تفاصيل مشروع جديد' : 'Add New Project Detail')}
              {selectedType === 'programMaster' && (lang === 'ar' ? 'إضافة برنامج رئيسي جديد' : 'Add New Program Master')}
              {selectedType === 'programDetail' && (lang === 'ar' ? 'إضافة تفاصيل برنامج جديد' : 'Add New Program Detail')}
              {selectedType === 'academy' && (lang === 'ar' ? 'إضافة أكاديمية جديدة' : 'Add New Academy')}
              {selectedType === 'branch' && (lang === 'ar' ? 'إضافة فرع جديد' : 'Add New Branch')}
              {selectedType === 'student' && (lang === 'ar' ? 'إضافة طالب جديد' : 'Add New Student')}
              {selectedType === 'teacher' && (lang === 'ar' ? 'إضافة مدرس جديد' : 'Add New Teacher')}
              {selectedType === 'course' && (lang === 'ar' ? 'إضافة دورة جديدة' : 'Add New Course')}
              {selectedType === 'complaint' && (lang === 'ar' ? 'إضافة شكوى جديدة' : 'Add New Complaint')}
              {selectedType === 'complaintType' && (lang === 'ar' ? 'إضافة نوع شكوى جديد' : 'Add New Complaint Type')}
              {selectedType === 'complaintStatus' && (lang === 'ar' ? 'إضافة حالة شكوى جديدة' : 'Add New Complaint Status')}
            </DialogTitle>
            <DialogDescription>
              {selectedType === 'projectMaster' && (lang === 'ar' ? 'أدخل بيانات المشروع الرئيسي الجديد' : 'Enter the new project master data')}
              {selectedType === 'projectDetail' && (lang === 'ar' ? 'أدخل بيانات تفاصيل المشروع الجديد' : 'Enter the new project detail data')}
              {selectedType === 'programMaster' && (lang === 'ar' ? 'أدخل بيانات البرنامج الرئيسي الجديد' : 'Enter the new program master data')}
              {selectedType === 'programDetail' && (lang === 'ar' ? 'أدخل بيانات تفاصيل البرنامج الجديد' : 'Enter the new program detail data')}
              {selectedType === 'academy' && (lang === 'ar' ? 'أدخل بيانات الأكاديمية الجديدة' : 'Enter the new academy data')}
              {selectedType === 'branch' && (lang === 'ar' ? 'أدخل بيانات الفرع الجديد' : 'Enter the new branch data')}
              {selectedType === 'student' && (lang === 'ar' ? 'أدخل بيانات الطالب الجديد' : 'Enter the new student data')}
              {selectedType === 'teacher' && (lang === 'ar' ? 'أدخل بيانات المدرس الجديد' : 'Enter the new teacher data')}
              {selectedType === 'course' && (lang === 'ar' ? 'أدخل بيانات الدورة الجديدة' : 'Enter the new course data')}
              {selectedType === 'complaint' && (lang === 'ar' ? 'أدخل بيانات الشكوى الجديدة' : 'Enter the new complaint data')}
              {selectedType === 'complaintType' && (lang === 'ar' ? 'أدخل بيانات نوع الشكوى الجديد' : 'Enter the new complaint type data')}
              {selectedType === 'complaintStatus' && (lang === 'ar' ? 'أدخل بيانات حالة الشكوى الجديدة' : 'Enter the new complaint status data')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[75vh] overflow-y-auto p-6">
            {/* Dynamic form fields based on type */}
            {selectedType === 'projectMaster' && (
              <>
                <Select
                  value={formData.AcademyDataId || ''}
                  onValueChange={(v) => setFormData({ ...formData, AcademyDataId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {academies.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.academyNameL1 || a.academyNameL2 || a.name || a.id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.BranchesDataId || ''}
                  onValueChange={(v) => setFormData({ ...formData, BranchesDataId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={lang === 'ar' ? 'اختر الفرع' : 'Select Branch'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.branchNameL1 || b.branchNameL2 || b.name || b.id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  value={formData.ProjectCategory || ''}
                  onValueChange={(v) => setFormData({ ...formData, ProjectCategory: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={lang === 'ar' ? 'اختر الفئة' : 'Select Category'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {projectCategories.length > 0 ? (
                        <>
                          {projectCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">
                            {lang === 'ar' ? '+ add new' : '+ Add New'}
                          </SelectItem>
                        </>
                      ) : (
                        <SelectItem value="new">
                          {lang === 'ar' ? '+ add first' : '+ Add First'}
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {(formData.ProjectCategory === 'new' || !formData.ProjectCategory) && (
                  <Input
                    placeholder={lang === 'ar' ? 'اسم الفئة' : 'Category Name'}
                    value={formData.NewProjectCategory || ''}
                    onChange={(e) => setFormData({ ...formData, NewProjectCategory: e.target.value })}
                  />
                )}
                <Input
                  placeholder={lang === 'ar' ? 'اسم المشروع' : 'Project Name'}
                  value={formData.ProjectNameL1 || ''}
                  onChange={(e) => setFormData({...formData, ProjectNameL1: e.target.value})}
                />
                <Input
                  placeholder={lang === 'ar' ? 'اسم المشروع (2)' : 'Project Name (2)'}
                  value={formData.ProjectNameL2 || ''}
                  onChange={(e) => setFormData({...formData, ProjectNameL2: e.target.value})}
                />
                <Input
                  placeholder={lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                  type="date"
                  value={formData.ProjectStart || ''}
                  onChange={(e) => setFormData({...formData, ProjectStart: e.target.value})}
                />
                <Input
                  placeholder={lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                  type="date"
                  value={formData.ProjectEnd || ''}
                  onChange={(e) => setFormData({...formData, ProjectEnd: e.target.value})}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'ملف الموارد' : 'Project Resources'}</label>
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, ProjectResources: e.target.files && e.target.files[0] ? e.target.files[0] : null })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'ملف المشروع' : 'Project Files'}</label>
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, ProjectFiles: e.target.files && e.target.files[0] ? e.target.files[0] : null })}
                    />
                  </div>
                </div>
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </>
            )}
            {selectedType === 'projectDetail' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'المشروع الرئيسي *' : 'Project Master *'}
                    </label>
                    <Select
                      value={formData.ProjectsMasterId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, ProjectsMasterId: v });
                        validateField('ProjectsMasterId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.ProjectsMasterId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر المشروع الرئيسي' : 'Select Project Master'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {projectsMaster.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.projectNameL1 || project.projectNameL2 || project.name || project.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.ProjectsMasterId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.ProjectsMasterId}</p>
                    )}
                    {!projectsMaster.length && (
                      <p className="text-sm text-amber-600 mt-1">
                        {lang === 'ar' ? 'لا توجد مشاريع رئيسية متاحة. يرجى إضافة مشروع رئيسي أولاً.' : 'No project masters available. Please add a project master first.'}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'اسم المشروع *' : 'Project Name *'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'اسم المشروع (3-70 حرف)' : 'Project Name (3-70 chars)'}
                        value={formData.ProjectNameL1 || ''}
                        onChange={(e) => {
                          setFormData({...formData, ProjectNameL1: e.target.value});
                          validateField('ProjectNameL1', e.target.value);
                        }}
                        className={formErrors.ProjectNameL1 ? 'border-red-500' : ''}
                        maxLength={70}
                        minLength={3}
                      />
                      {formErrors.ProjectNameL1 && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.ProjectNameL1}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'اسم المشروع (2) *' : 'Project Name (2) *'}
                      </label>
                      <Input
                        placeholder={lang === 'ar' ? 'اسم المشروع (2) (3-70 حرف)' : 'Project Name (2) (3-70 chars)'}
                        value={formData.ProjectNameL2 || ''}
                        onChange={(e) => {
                          setFormData({...formData, ProjectNameL2: e.target.value});
                          validateField('ProjectNameL2', e.target.value);
                        }}
                        className={formErrors.ProjectNameL2 ? 'border-red-500' : ''}
                        maxLength={70}
                        minLength={3}
                      />
                      {formErrors.ProjectNameL2 && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.ProjectNameL2}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الوصف *' : 'Description *'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'الوصف (10-500 حرف)' : 'Description (10-500 chars)'}
                      value={formData.Description || ''}
                      onChange={(e) => {
                        setFormData({...formData, Description: e.target.value});
                        validateField('Description', e.target.value);
                      }}
                      className={formErrors.Description ? 'border-red-500' : ''}
                      maxLength={500}
                      minLength={10}
                    />
                    {formErrors.Description && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.Description}</p>
                    )}
                  </div>
                </div>
              </>
            )}


            {selectedType === 'programMaster' && (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'اسم الجلسة *' : 'Session Name *'}</label>
                      <Input
                        placeholder={lang === 'ar' ? 'اسم الجلسة (3-70 حرف)' : 'Session Name (3-70 chars)'}
                        value={formData.SessionNameL1 || ''}
                        onChange={(e) => {
                          setFormData({...formData, SessionNameL1: e.target.value});
                          validateField('SessionNameL1', e.target.value);
                        }}
                        className={formErrors.SessionNameL1 ? 'border-red-500' : ''}
                        maxLength={70}
                        minLength={3}
                        required
                      />
                      {formErrors.SessionNameL1 && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.SessionNameL1}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'اسم الجلسة (2)' : 'Session Name (2)'}</label>
                      <Input
                        placeholder={lang === 'ar' ? 'اسم الجلسة (2) (3-70 حرف)' : 'Session Name (2) (3-70 chars)'}
                        value={formData.SessionNameL2 || ''}
                        onChange={(e) => setFormData({...formData, SessionNameL2: e.target.value})}
                        maxLength={70}
                        minLength={3}
                      />
                    </div>
                  </div>


                  
                  <div>
                    <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'الوصف *' : 'Description *'}</label>
                    <Input
                      placeholder={lang === 'ar' ? 'الوصف (10-500 حرف)' : 'Description (10-500 chars)'}
                      value={formData.Description || ''}
                      onChange={(e) => {
                        setFormData({...formData, Description: e.target.value});
                        validateField('Description', e.target.value);
                      }}
                      className={formErrors.Description ? 'border-red-500' : ''}
                      minLength={10}
                      maxLength={500}
                      required
                    />
                    {formErrors.Description && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.Description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'المواد العلمية (PDF)' : 'Scientific Material (PDF)'}</label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Check file size (max 10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            alert(lang === 'ar' ? 'حجم الملف يجب أن يكون أقل من 10 ميجابايت' : 'File size must be less than 10MB');
                            return;
                          }
                          setFormData({...formData, ScientificMaterial: file});
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'اختر ملف PDF أو Word (أقل من 10 ميجابايت)' : 'Select PDF or Word file (less than 10MB)'}</p>
                  </div>
                </div>
              </>
            )}

            {selectedType === 'programDetail' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'البرنامج الرئيسي *' : 'Program Master *'}</label>
                    <Select
                        value={formData.ProgramsContentMasterId || ''}
                        onValueChange={(v) => {
                          setFormData({ ...formData, ProgramsContentMasterId: v });
                          validateField('ProgramsContentMasterId', v);
                        }}
                    >
                      <SelectTrigger className={formErrors.ProgramsContentMasterId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر البرنامج الرئيسي' : 'Select Program Master'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {programsContentMaster.map((program) => (
                            <SelectItem key={program.id} value={program.id}>
                              {program.SessionNameL1 || program.SessionNameL2 || program.sessionNameL1 || program.sessionNameL2 || program.name || program.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.ProgramsContentMasterId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.ProgramsContentMasterId}</p>
                    )}
                    {!programsContentMaster.length && (
                      <p className="text-sm text-amber-600 mt-1">
                        {lang === 'ar' ? 'لا توجد برامج رئيسية متاحة. يرجى إضافة برنامج رئيسي أولاً.' : 'No program masters available. Please add a program master first.'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'العنوان *' : 'Title *'}</label>
                    <Input
                      placeholder={lang === 'ar' ? 'العنوان (3-100 حرف)' : 'Title (3-100 chars)'}
                      value={formData.Title || ''}
                      onChange={(e) => {
                        setFormData({...formData, Title: e.target.value});
                        validateField('Title', e.target.value);
                      }}
                      className={formErrors.Title ? 'border-red-500' : ''}
                      minLength={3}
                      maxLength={100}
                    />
                    {formErrors.Title && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.Title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'الوصف *' : 'Description *'}</label>
                    <Input
                      placeholder={lang === 'ar' ? 'الوصف (10-500 حرف)' : 'Description (10-500 chars)'}
                      value={formData.Description || ''}
                      onChange={(e) => {
                        setFormData({...formData, Description: e.target.value});
                        validateField('Description', e.target.value);
                      }}
                      className={formErrors.Description ? 'border-red-500' : ''}
                      minLength={10}
                      maxLength={500}
                    />
                    {formErrors.Description && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.Description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'رابط فيديو الجلسة (اختياري)' : 'Session Video URL (optional)'}</label>
                    <Input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.SessionVideo || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, SessionVideo: e.target.value });
                        validateField('SessionVideo', e.target.value);
                      }}
                      className={formErrors.SessionVideo ? 'border-red-500' : ''}
                    />
                    {formErrors.SessionVideo && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.SessionVideo}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {lang === 'ar' 
                        ? 'أدخل رابط فيديو من موقع معروف مثل YouTube, Vimeo, Facebook, Instagram, TikTok' 
                        : 'Enter a video URL from a known platform like YouTube, Vimeo, Facebook, Instagram, TikTok'
                      }
                    </p>
                  </div>

                  {/* File Upload Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'مهام الجلسة (PDF)' : 'Session Tasks (PDF)'}</label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, SessionTasks: file});
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'اختر ملف PDF أو Word' : 'Select PDF or Word file'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'مشروع الجلسة (PDF)' : 'Session Project (PDF)'}</label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, SessionProject: file});
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'اختر ملف PDF أو Word' : 'Select PDF or Word file'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'المواد العلمية (PDF)' : 'Scientific Material (PDF)'}</label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, ScientificMaterial: file});
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'اختر ملف PDF أو Word' : 'Select PDF or Word file'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'اختبار الجلسة (PDF)' : 'Session Quiz (PDF)'}</label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({...formData, SessionQuiz: file});
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">{lang === 'ar' ? 'اختر ملف PDF أو Word' : 'Select PDF or Word file'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedType === 'academy' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'اسم الأكاديمية' : 'Academy Name'} 
                      value={formData.AcademyNameL1 || ''} 
                      onChange={(e) => {
                        setFormData({...formData, AcademyNameL1: e.target.value});
                        validateField('AcademyNameL1', e.target.value);
                      }}
                      className={formErrors.AcademyNameL1 ? 'border-red-500' : ''}
                    />
                    {formErrors.AcademyNameL1 && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyNameL1}</p>
                    )}
                </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'اسم الأكاديمية (2)' : 'Academy Name (2)'} 
                      value={formData.AcademyNameL2 || ''} 
                      onChange={(e) => setFormData({...formData, AcademyNameL2: e.target.value})} 
                    />
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'العنوان' : 'Address'} 
                      value={formData.AcademyAddress || ''} 
                      onChange={(e) => {
                        setFormData({...formData, AcademyAddress: e.target.value});
                        validateField('AcademyAddress', e.target.value);
                      }}
                      className={formErrors.AcademyAddress ? 'border-red-500' : ''}
                    />
                    {formErrors.AcademyAddress && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyAddress}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الموقع' : 'Location'} 
                      value={formData.Location || ''} 
                      onChange={(e) => {
                        setFormData({...formData, Location: e.target.value});
                        validateField('Location', e.target.value);
                      }}
                      className={formErrors.Location ? 'border-red-500' : ''}
                    />
                    {formErrors.Location && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.Location}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الجوال' : 'Mobile'} 
                      value={formData.AcademyMobil || ''} 
                      onChange={(e) => {
                        setFormData({...formData, AcademyMobil: e.target.value});
                        validateField('AcademyMobil', e.target.value);
                      }}
                      className={formErrors.AcademyMobil ? 'border-red-500' : ''}
                    />
                    {formErrors.AcademyMobil && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyMobil}</p>
                    )}
                </div>

                <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الهاتف' : 'Phone'} 
                      value={formData.AcademyPhone || ''} 
                      onChange={(e) => setFormData({...formData, AcademyPhone: e.target.value})} 
                    />
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الواتساب' : 'Whatsapp'} 
                      value={formData.AcademyWhatsapp || ''} 
                      onChange={(e) => setFormData({...formData, AcademyWhatsapp: e.target.value})} 
                    />
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} 
                      type="email" 
                      value={formData.AcademyEmail || ''} 
                      onChange={(e) => {
                        setFormData({...formData, AcademyEmail: e.target.value});
                        validateField('AcademyEmail', e.target.value);
                      }}
                      className={formErrors.AcademyEmail ? 'border-red-500' : ''}
                    />
                    {formErrors.AcademyEmail && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyEmail}</p>
                  )}
                </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الموقع الإلكتروني' : 'Website'} 
                      value={formData.AcademyWebSite || ''} 
                      onChange={(e) => {
                        setFormData({...formData, AcademyWebSite: e.target.value});
                        validateField('AcademyWebSite', e.target.value);
                      }}
                      className={formErrors.AcademyWebSite ? 'border-red-500' : ''}
                    />
                    {formErrors.AcademyWebSite && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyWebSite}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الرقم الضريبي' : 'Tax Registration Number'} 
                      value={formData.TaxRegistrationNumber || ''} 
                      onChange={(e) => {
                        setFormData({...formData, TaxRegistrationNumber: e.target.value});
                        validateField('TaxRegistrationNumber', e.target.value);
                      }}
                      className={formErrors.TaxRegistrationNumber ? 'border-red-500' : ''}
                    />
                    {formErrors.TaxRegistrationNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.TaxRegistrationNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'ملف الضرائب' : 'Taxes Errand'} 
                      value={formData.TaxesErrand || ''} 
                      onChange={(e) => {
                        setFormData({...formData, TaxesErrand: e.target.value});
                        validateField('TaxesErrand', e.target.value);
                      }}
                      className={formErrors.TaxesErrand ? 'border-red-500' : ''}
                    />
                    {formErrors.TaxesErrand && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.TaxesErrand}</p>
                    )}
                  </div>
                  
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'السجل التجاري' : 'Commercial Register Number'} 
                      value={formData.CommercialRegisterNumber || ''} 
                      onChange={(e) => {
                        setFormData({...formData, CommercialRegisterNumber: e.target.value});
                        validateField('CommercialRegisterNumber', e.target.value);
                      }}
                      className={formErrors.CommercialRegisterNumber ? 'border-red-500' : ''}
                    />
                    {formErrors.CommercialRegisterNumber && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.CommercialRegisterNumber}</p>
                    )}
                  </div>
                </div>
                
                {/* Description Field */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'الوصف *' : 'Description *'}</label>
                  <textarea
                    className={`w-full px-3 py-2 border rounded-md min-h-24 resize-none ${
                      formErrors.Description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={lang === 'ar' ? 'وصف الأكاديمية (10-500 حرف)' : 'Academy description (10-500 characters)'}
                    value={formData.Description || ''}
                    onChange={(e) => {
                      setFormData({...formData, Description: e.target.value});
                      validateField('Description', e.target.value);
                    }}
                    minLength={10}
                    maxLength={500}
                    required
                  />
                  {formErrors.Description && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.Description}</p>
                    )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === 'ar' 
                      ? `الحد الأدنى: 10 أحرف، الحد الأقصى: 500 حرف. الحالي: ${(formData.Description || '').length} حرف`
                      : `Min: 10 chars, Max: 500 chars. Current: ${(formData.Description || '').length} chars`
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'الصورة' : 'Image'}</label>
                    <input type="file" onChange={(e) => setFormData({ ...formData, Image: e.target.files && e.target.files[0] ? e.target.files[0] : null })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{lang === 'ar' ? 'المرفقات' : 'Attachments'}</label>
                    <input type="file" onChange={(e) => setFormData({ ...formData, Attachments: e.target.files && e.target.files[0] ? e.target.files[0] : null })} />
                  </div>
                </div>

              </>
            )}
            {selectedType === 'branch' && (
              <>
                <div>
                <Select
                  value={formData.AcademyDataId || ''}
                    onValueChange={(v) => {
                      setFormData({ ...formData, AcademyDataId: v });
                      validateField('AcademyDataId', v);
                    }}
                >
                    <SelectTrigger className={formErrors.AcademyDataId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {academies.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.academyNameL1 || a.academyNameL2 || a.name || a.id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                  {formErrors.AcademyDataId && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.AcademyDataId}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'اسم الفرع' : 'Branch Name'} 
                      value={formData.BranchNameL1 || ''} 
                      onChange={(e) => {
                        setFormData({ ...formData, BranchNameL1: e.target.value });
                        validateField('BranchNameL1', e.target.value);
                      }}
                      minLength={4}
                      className={formErrors.BranchNameL1 ? 'border-red-500' : ''}
                    />
                    {formErrors.BranchNameL1 && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchNameL1}</p>
                    )}
                </div>
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'اسم الفرع (2)' : 'Branch Name (2)'} 
                      value={formData.BranchNameL2 || ''} 
                      onChange={(e) => {
                        setFormData({ ...formData, BranchNameL2: e.target.value });
                        validateField('BranchNameL2', e.target.value);
                      }}
                      minLength={4}
                      className={formErrors.BranchNameL2 ? 'border-red-500' : ''}
                    />
                    {formErrors.BranchNameL2 && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchNameL2}</p>
                    )}
                </div>
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'العنوان' : 'Branch Address'} 
                      value={formData.BranchAddress || ''} 
                      onChange={(e) => {
                        setFormData({ ...formData, BranchAddress: e.target.value });
                        validateField('BranchAddress', e.target.value);
                      }}
                      className={formErrors.BranchAddress ? 'border-red-500' : ''}
                    />
                    {formErrors.BranchAddress && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchAddress}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الجوال' : 'Mobile'} 
                      value={formData.BranchMobile || ''} 
                      onChange={(e) => {
                        setFormData({ ...formData, BranchMobile: e.target.value });
                        validateField('BranchMobile', e.target.value);
                      }}
                      type="tel"
                      pattern="[0-9]*"
                      className={formErrors.BranchMobile ? 'border-red-500' : ''}
                    />
                    {formErrors.BranchMobile && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchMobile}</p>
                    )}
                  </div>
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الهاتف' : 'Phone'} 
                      value={formData.BranchPhone || ''} 
                      onChange={(e) => {
                        setFormData({ ...formData, BranchPhone: e.target.value });
                        validateField('BranchPhone', e.target.value);
                      }}
                      type="tel"
                      pattern="[0-9]*"
                      className={formErrors.BranchPhone ? 'border-red-500' : ''}
                    />
                    {formErrors.BranchPhone && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchPhone}</p>
                    )}
                  </div>
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'الواتساب' : 'Whatsapp'} 
                      value={formData.BranchWhatsapp || ''} 
                      onChange={(e) => {
                        setFormData({ ...formData, BranchWhatsapp: e.target.value });
                        validateField('BranchWhatsapp', e.target.value);
                      }}
                      type="tel"
                      pattern="[0-9]*"
                      className={formErrors.BranchWhatsapp ? 'border-red-500' : ''}
                    />
                    {formErrors.BranchWhatsapp && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchWhatsapp}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input 
                      placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} 
                      type="email" 
                      value={formData.BranchEmail || ''} 
                      onChange={(e) => {
                        setFormData({ ...formData, BranchEmail: e.target.value });
                        validateField('BranchEmail', e.target.value);
                      }}
                      className={formErrors.BranchEmail ? 'border-red-500' : ''}
                    />
                    {formErrors.BranchEmail && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchEmail}</p>
                    )}
                  </div>
                </div>
              </>
            )}
            {selectedType === 'student' && (
              <>
                <div>
                <Input
                  placeholder={lang === 'ar' ? 'الاسم الأول' : 'First Name'}
                  value={formData.FirstName || ''}
                    onChange={(e) => {
                      setFormData({...formData, FirstName: e.target.value});
                      validateField('StudentNameL1', e.target.value);
                    }}
                    minLength={4}
                    className={formErrors.StudentNameL1 ? 'border-red-500' : ''}
                  />
                  {formErrors.StudentNameL1 && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.StudentNameL1}</p>
                  )}
                </div>
                <div>
                <Input
                  placeholder={lang === 'ar' ? 'الاسم الأخير' : 'Last Name'}
                  value={formData.LastName || ''}
                    onChange={(e) => {
                      setFormData({...formData, LastName: e.target.value});
                      validateField('StudentNameL2', e.target.value);
                    }}
                    minLength={4}
                    className={formErrors.StudentNameL2 ? 'border-red-500' : ''}
                  />
                  {formErrors.StudentNameL2 && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.StudentNameL2}</p>
                  )}
                </div>
                <Input
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  type="email"
                  value={formData.Email || ''}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                />
                <Input
                  placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  value={formData.PhoneNumber || ''}
                  onChange={(e) => setFormData({...formData, PhoneNumber: e.target.value})}
                />
              </>
            )}
            {selectedType === 'teacher' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={formData.AcademyDataId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, AcademyDataId: v });
                        validateField('AcademyDataId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.AcademyDataId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {academies.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.academyNameL1 || a.academyNameL2 || a.name || a.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.AcademyDataId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyDataId}</p>
                    )}
                  </div>
                  
                  <div>
                    <Select
                      value={formData.BranchesDataId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, BranchesDataId: v });
                        validateField('BranchesDataId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.BranchesDataId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الفرع' : 'Select Branch'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {branches.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.branchNameL1 || b.branchNameL2 || b.name || b.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.BranchesDataId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchesDataId}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Select
                      value={formData.CountryCodeId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, CountryCodeId: v });
                        validateField('CountryCodeId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.CountryCodeId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الدولة' : 'Select Country'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {countries.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.countryNameL1 || c.countryNameL2 || c.name || c.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.CountryCodeId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.CountryCodeId}</p>
                    )}
                  </div>
                  
                  <div>
                    <Select
                      value={formData.GovernorateCodeId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, GovernorateCodeId: v });
                        validateField('GovernorateCodeId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.GovernorateCodeId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر المحافظة' : 'Select Governorate'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {governorates.map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              {g.governorateNameL1 || g.governorateNameL2 || g.name || g.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.GovernorateCodeId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.GovernorateCodeId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Select
                    value={formData.CityCodeId || ''}
                    onValueChange={(v) => {
                      setFormData({ ...formData, CityCodeId: v });
                      validateField('CityCodeId', v);
                    }}
                  >
                    <SelectTrigger className={formErrors.CityCodeId ? 'border-red-500' : ''}>
                      <SelectValue placeholder={lang === 'ar' ? 'اختر المدينة' : 'Select City'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {cities.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.cityNameL1 || c.cityNameL2 || c.name || c.id}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {formErrors.CityCodeId && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.CityCodeId}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                <Input
                      placeholder={lang === 'ar' ? 'اسم المدرب (عربي) *' : 'Teacher Name (Arabic) *'}
                      value={formData.TeacherNameL1 || ''}
                      onChange={(e) => {
                        setFormData({...formData, TeacherNameL1: e.target.value});
                        validateField('TeacherNameL1', e.target.value);
                      }}
                      className={formErrors.TeacherNameL1 ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.TeacherNameL1 && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.TeacherNameL1}</p>
                    )}
                  </div>
                <Input
                    placeholder={lang === 'ar' ? 'اسم المدرب (إنجليزي)' : 'Teacher Name (English)'}
                    value={formData.TeacherNameL2 || ''}
                    onChange={(e) => setFormData({...formData, TeacherNameL2: e.target.value})}
                  />
                </div>

                <div>
                <Input
                    placeholder={lang === 'ar' ? 'عنوان المدرب *' : 'Teacher Address *'}
                    value={formData.TeacherAddress || ''}
                    onChange={(e) => {
                      setFormData({...formData, TeacherAddress: e.target.value});
                      validateField('TeacherAddress', e.target.value);
                    }}
                    className={formErrors.TeacherAddress ? 'border-red-500' : ''}
                    required
                  />
                  {formErrors.TeacherAddress && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.TeacherAddress}</p>
                  )}
                </div>

                <div>
                <Input
                    placeholder={lang === 'ar' ? 'الرقم القومي (14 رقم) *' : 'National ID (14 digits) *'}
                    value={formData.NationalId || ''}
                    onChange={(e) => {
                      setFormData({...formData, NationalId: e.target.value});
                      validateField('NationalId', e.target.value);
                    }}
                    className={formErrors.NationalId ? 'border-red-500' : ''}
                    maxLength={14}
                    required
                  />
                  {formErrors.NationalId && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.NationalId}</p>
                  )}
                </div>

                <Input
                  placeholder={lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                  type="date"
                  value={formData.DateStart || ''}
                  onChange={(e) => setFormData({...formData, DateStart: e.target.value})}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="tel"
                      placeholder={lang === 'ar' ? 'رقم الهاتف المحمول' : 'Mobile Number'}
                      value={formData.TeacherMobile || ''}
                      onChange={(e) => setFormData({...formData, TeacherMobile: e.target.value})}
                    />
                  </div>
                  <div>
                    <Input
                      type="tel"
                  placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      value={formData.TeacherPhone || ''}
                      onChange={(e) => setFormData({...formData, TeacherPhone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Input
                    type="tel"
                    placeholder={lang === 'ar' ? 'رقم الواتساب *' : 'WhatsApp Number *'}
                    value={formData.TeacherWhatsapp || ''}
                    onChange={(e) => {
                      setFormData({...formData, TeacherWhatsapp: e.target.value});
                      validateField('TeacherWhatsapp', e.target.value);
                    }}
                    className={formErrors.TeacherWhatsapp ? 'border-red-500' : ''}
                    required
                  />
                  {formErrors.TeacherWhatsapp && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.TeacherWhatsapp}</p>
                  )}
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder={lang === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                    value={formData.TeacherEmail || ''}
                    onChange={(e) => {
                      setFormData({...formData, TeacherEmail: e.target.value});
                      validateField('TeacherEmail', e.target.value);
                    }}
                    className={formErrors.TeacherEmail ? 'border-red-500' : ''}
                    required
                  />
                  {formErrors.TeacherEmail && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.TeacherEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'صورة المدرب' : 'Teacher Image'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, ImageFile: e.target.files && e.target.files[0] ? e.target.files[0] : null })}
                  />
                </div>

                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />

                <Input
                  placeholder={lang === 'ar' ? 'تاريخ الإلغاء' : 'Cancel Date'}
                  type="date"
                  value={formData.TeacherCancel || ''}
                  onChange={(e) => setFormData({...formData, TeacherCancel: e.target.value})}
                />
              </>
            )}
            {selectedType === 'complaint' && (
              <>
                {/* Debug section - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-4 bg-gray-100 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">Debug Info:</h4>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify({
                        selectedItem,
                        formData,
                        students: students.length,
                        complaintTypes: complaintTypes.length,
                        complaintStatuses: complaintStatuses.length
                      }, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'الطالب *' : 'Student *'}
                      </label>
                      <Select
                        value={formData.StudentsDataId || ''}
                        onValueChange={(v) => {
                          setFormData({ ...formData, StudentsDataId: v });
                          validateField('StudentsDataId', v);
                        }}
                        onOpenChange={(open) => !open && clearFieldError('StudentsDataId')}
                      >
                        <SelectTrigger className={formErrors.StudentsDataId ? 'border-red-500' : ''}>
                          <SelectValue placeholder={lang === 'ar' ? 'اختر الطالب' : 'Select Student'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.studentNameL1 || student.studentNameL2 || student.firstName || student.name || student.id}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {formErrors.StudentsDataId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.StudentsDataId}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'نوع الشكوى *' : 'Complaint Type *'}
                      </label>
                      <Select
                        value={formData.ComplaintsTypeId || ''}
                        onValueChange={(v) => {
                          setFormData({ ...formData, ComplaintsTypeId: v });
                          validateField('ComplaintsTypeId', v);
                        }}
                        onOpenChange={(open) => !open && clearFieldError('ComplaintsTypeId')}
                      >
                        <SelectTrigger className={formErrors.ComplaintsTypeId ? 'border-red-500' : ''}>
                          <SelectValue placeholder={lang === 'ar' ? 'اختر نوع الشكوى' : 'Select Complaint Type'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {complaintTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.typeNameL1 || type.typeNameL2 || type.name || type.id}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {formErrors.ComplaintsTypeId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.ComplaintsTypeId}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'حالة الشكوى *' : 'Complaint Status *'}
                      </label>
                      <Select
                        value={formData.ComplaintsStatusesId || ''}
                        onValueChange={(v) => {
                          setFormData({ ...formData, ComplaintsStatusesId: v });
                          validateField('ComplaintsStatusesId', v);
                        }}
                        onOpenChange={(open) => !open && clearFieldError('ComplaintsStatusesId')}
                      >
                        <SelectTrigger className={formErrors.ComplaintsStatusesId ? 'border-red-500' : ''}>
                          <SelectValue placeholder={lang === 'ar' ? 'اختر حالة الشكوى' : 'Select Complaint Status'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {complaintStatuses.map((status) => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.statusNameL1 || status.statusNameL2 || status.name || status.id}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {formErrors.ComplaintsStatusesId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.ComplaintsStatusesId}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {lang === 'ar' ? 'التاريخ' : 'Date'}
                      </label>
                      <Input
                        type="date"
                        value={formData.Date || ''}
                        onChange={(e) => setFormData({...formData, Date: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الوصف *' : 'Description *'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'وصف الشكوى (10+ حروف)' : 'Complaint description (10+ chars)'}
                      value={formData.Description || ''}
                      onChange={(e) => {
                        setFormData({...formData, Description: e.target.value});
                        validateField('Description', e.target.value);
                      }}
                      onFocus={() => clearFieldError('Description')}
                      className={formErrors.Description ? 'border-red-500' : ''}
                      minLength={10}
                    />
                    {formErrors.Description && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.Description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الملفات المرفقة' : 'Attached Files'}
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFormData({ ...formData, Files: e.target.files })}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedType === 'complaintType' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الأكاديمية *' : 'Academy *'}
                    </label>
                    <Select
                      value={formData.AcademyDataId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, AcademyDataId: v });
                        validateField('AcademyDataId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.AcademyDataId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {academies.map((academy) => (
                            <SelectItem key={academy.id} value={academy.id}>
                              {academy.academyNameL1 || academy.academyNameL2 || academy.name || academy.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.AcademyDataId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyDataId}</p>
                    )}
                    {!academies.length && (
                      <p className="text-sm text-amber-600 mt-1">
                        {lang === 'ar' ? 'لا توجد أكاديميات متاحة. يرجى إضافة أكاديمية أولاً.' : 'No academies available. Please add an academy first.'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الفرع *' : 'Branch *'}
                    </label>
                    <Select
                      value={formData.BranchesDataId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, BranchesDataId: v });
                        validateField('BranchesDataId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.BranchesDataId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الفرع' : 'Select Branch'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.branchNameL1 || branch.branchNameL2 || branch.name || branch.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.BranchesDataId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.BranchesDataId}</p>
                    )}
                    {!branches.length && (
                      <p className="text-sm text-amber-600 mt-1">
                        {lang === 'ar' ? 'لا توجد فروع متاحة. يرجى إضافة فرع أولاً.' : 'No branches available. Please add a branch first.'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'اسم النوع *' : 'Type Name *'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'اسم نوع الشكوى' : 'Complaint type name'}
                      value={formData.typeNameL1 || ''}
                      onChange={(e) => {
                        setFormData({...formData, typeNameL1: e.target.value});
                        validateField('typeNameL1', e.target.value);
                      }}
                      className={formErrors.typeNameL1 ? 'border-red-500' : ''}
                    />
                    {formErrors.typeNameL1 && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.typeNameL1}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'اسم النوع (2)' : 'Type Name (2)'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'اسم نوع الشكوى باللغة الثانية' : 'Complaint type name in second language'}
                      value={formData.typeNameL2 || ''}
                      onChange={(e) => setFormData({...formData, typeNameL2: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الوصف' : 'Description'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'وصف نوع الشكوى' : 'Complaint type description'}
                      value={formData.Description || ''}
                      onChange={(e) => setFormData({...formData, Description: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}
            {selectedType === 'complaintStatus' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الأكاديمية *' : 'Academy *'}
                    </label>
                    <Select
                      value={formData.AcademyDataId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, AcademyDataId: v });
                        validateField('AcademyDataId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.AcademyDataId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {academies.map((academy) => (
                            <SelectItem key={academy.id} value={academy.id}>
                              {academy.academyNameL1 || academy.academyNameL2 || academy.name || academy.id}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {formErrors.AcademyDataId && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.AcademyDataId}</p>
                    )}
                    {!academies.length && (
                      <p className="text-sm text-amber-600 mt-1">
                        {lang === 'ar' ? 'لا توجد أكاديميات متاحة. يرجى إضافة أكاديمية أولاً.' : 'No academies available. Please add an academy first.'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الفرع *' : 'Branch *'}
                    </label>
                    <Select
                      value={formData.BranchesDataId || ''}
                      onValueChange={(v) => {
                        setFormData({ ...formData, BranchesDataId: v });
                        validateField('BranchesDataId', v);
                      }}
                    >
                      <SelectTrigger className={formErrors.BranchesDataId ? 'border-red-500' : ''}>
                        <SelectValue placeholder={lang === 'ar' ? 'اختر الفرع' : 'Select Branch'} />
                      </SelectTrigger>
                                              <SelectContent>
                          <SelectGroup>
                            {branches.map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.branchNameL1 || branch.branchNameL2 || branch.name || branch.id}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {formErrors.BranchesDataId && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.BranchesDataId}</p>
                      )}
                      {!branches.length && (
                        <p className="text-sm text-amber-600 mt-1">
                          {lang === 'ar' ? 'لا توجد فروع متاحة. يرجى إضافة فرع أولاً.' : 'No branches available. Please add a branch first.'}
                        </p>
                      )}
                    </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'اسم الحالة *' : 'Status Name *'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'اسم حالة الشكوى' : 'Complaint status name'}
                      value={formData.statusNameL1 || ''}
                      onChange={(e) => {
                        setFormData({...formData, statusNameL1: e.target.value});
                        validateField('statusNameL1', e.target.value);
                      }}
                      className={formErrors.statusNameL1 ? 'border-red-500' : ''}
                    />
                    {formErrors.statusNameL1 && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.statusNameL1}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'اسم الحالة (2)' : 'Status Name (2)'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'اسم حالة الشكوى باللغة الثانية' : 'Complaint status name in second language'}
                      value={formData.statusNameL2 || ''}
                      onChange={(e) => setFormData({...formData, statusNameL2: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === 'ar' ? 'الوصف' : 'Description'}
                    </label>
                    <Input
                      placeholder={lang === 'ar' ? 'وصف حالة الشكوى' : 'Complaint status description'}
                      value={formData.Description || ''}
                      onChange={(e) => setFormData({...formData, Description: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleFormSubmit}>
              {lang === 'ar' ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {lang === 'ar' ? 'عرض التفاصيل' : 'Viewing details'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar' ? 'تفاصيل السجل المحدد' : 'Selected record details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {selectedItem && Object.entries(selectedItem).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[180px_1fr] gap-3 items-center">
                <div className="text-muted-foreground break-all">{k}</div>
                <div className="break-all">{String(v)}</div>              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {lang === 'ar' ? 'تعديل' : 'Edit'} {getTypeDisplayName(selectedType)}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar' ? 'عدل بيانات العنصر' : 'Edit item data'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Form */}
            {selectedType === 'student' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم الطالب (عربي)' : 'Student Name (Arabic)'}
                  value={formData.StudentNameL1 || ''}
                  onChange={(e) => setFormData({...formData, StudentNameL1: e.target.value})}
                  className={formErrors.StudentNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.StudentNameL1 && <p className="text-red-500 text-sm">{formErrors.StudentNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم الطالب (إنجليزي)' : 'Student Name (English)'}
                  value={formData.StudentNameL2 || ''}
                  onChange={(e) => setFormData({...formData, StudentNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  value={formData.StudentPhone || ''}
                  onChange={(e) => setFormData({...formData, StudentPhone: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'العنوان' : 'Address'}
                  value={formData.StudentAddress || ''}
                  onChange={(e) => setFormData({...formData, StudentAddress: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  type="email"
                  value={formData.Email || ''}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                  className={formErrors.Email ? 'border-red-500' : ''}
                />
                {formErrors.Email && <p className="text-red-500 text-sm">{formErrors.Email}</p>}
              </>
            )}

            {/* Teacher Form */}
            {selectedType === 'teacher' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم المدرس (عربي)' : 'Teacher Name (Arabic)'}
                  value={formData.TeacherNameL1 || ''}
                  onChange={(e) => setFormData({...formData, TeacherNameL1: e.target.value})}
                  className={formErrors.TeacherNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.TeacherNameL1 && <p className="text-red-500 text-sm">{formErrors.TeacherNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم المدرس (إنجليزي)' : 'Teacher Name (English)'}
                  value={formData.TeacherNameL2 || ''}
                  onChange={(e) => setFormData({...formData, TeacherNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  value={formData.TeacherPhone || ''}
                  onChange={(e) => setFormData({...formData, TeacherPhone: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'العنوان' : 'Address'}
                  value={formData.TeacherAddress || ''}
                  onChange={(e) => setFormData({...formData, TeacherAddress: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  type="email"
                  value={formData.Email || ''}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                  className={formErrors.Email ? 'border-red-500' : ''}
                />
                {formErrors.Email && <p className="text-red-500 text-sm">{formErrors.Email}</p>}
              </>
            )}

            {/* Academy Form */}
            {selectedType === 'academy' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم الأكاديمية (عربي)' : 'Academy Name (Arabic)'}
                  value={formData.AcademyNameL1 || ''}
                  onChange={(e) => setFormData({...formData, AcademyNameL1: e.target.value})}
                  className={formErrors.AcademyNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.AcademyNameL1 && <p className="text-red-500 text-sm">{formErrors.AcademyNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم الأكاديمية (إنجليزي)' : 'Academy Name (English)'}
                  value={formData.AcademyNameL2 || ''}
                  onChange={(e) => setFormData({...formData, AcademyNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </>
            )}

            {/* Branch Form */}
            {selectedType === 'branch' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم الفرع (عربي)' : 'Branch Name (Arabic)'}
                  value={formData.BranchNameL1 || ''}
                  onChange={(e) => setFormData({...formData, BranchNameL1: e.target.value})}
                  className={formErrors.BranchNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.BranchNameL1 && <p className="text-red-500 text-sm">{formErrors.BranchNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم الفرع (إنجليزي)' : 'Branch Name (English)'}
                  value={formData.BranchNameL2 || ''}
                  onChange={(e) => setFormData({...formData, BranchNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </>
            )}

            {/* Course Form */}
            {selectedType === 'course' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم الدورة (عربي)' : 'Course Name (Arabic)'}
                  value={formData.CourseNameL1 || ''}
                  onChange={(e) => setFormData({...formData, CourseNameL1: e.target.value})}
                  className={formErrors.CourseNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.CourseNameL1 && <p className="text-red-500 text-sm">{formErrors.CourseNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم الدورة (إنجليزي)' : 'Course Name (English)'}
                  value={formData.CourseNameL2 || ''}
                  onChange={(e) => setFormData({...formData, CourseNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </>
            )}

            {/* Project Master Form */}
            {selectedType === 'projectMaster' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم المشروع (عربي)' : 'Project Name (Arabic)'}
                  value={formData.ProjectNameL1 || ''}
                  onChange={(e) => setFormData({...formData, ProjectNameL1: e.target.value})}
                  className={formErrors.ProjectNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.ProjectNameL1 && <p className="text-red-500 text-sm">{formErrors.ProjectNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم المشروع (إنجليزي)' : 'Project Name (English)'}
                  value={formData.ProjectNameL2 || ''}
                  onChange={(e) => setFormData({...formData, ProjectNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                  type="date"
                  value={formData.ProjectStart || ''}
                  onChange={(e) => setFormData({...formData, ProjectStart: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'تاريخ النهاية' : 'End Date'}
                  type="date"
                  value={formData.ProjectEnd || ''}
                  onChange={(e) => setFormData({...formData, ProjectEnd: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </>
            )}

            {/* Project Detail Form */}
            {selectedType === 'projectDetail' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم المشروع (عربي)' : 'Project Name (Arabic)'}
                  value={formData.ProjectNameL1 || ''}
                  onChange={(e) => setFormData({...formData, ProjectNameL1: e.target.value})}
                  className={formErrors.ProjectNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.ProjectNameL1 && <p className="text-red-500 text-sm">{formErrors.ProjectNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم المشروع (إنجليزي)' : 'Project Name (English)'}
                  value={formData.ProjectNameL2 || ''}
                  onChange={(e) => setFormData({...formData, ProjectNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </>
            )}

            {/* Program Master Form */}
            {selectedType === 'programMaster' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'اسم الجلسة (عربي)' : 'Session Name (Arabic)'}
                  value={formData.SessionNameL1 || ''}
                  onChange={(e) => setFormData({...formData, SessionNameL1: e.target.value})}
                  className={formErrors.SessionNameL1 ? 'border-red-500' : ''}
                />
                {formErrors.SessionNameL1 && <p className="text-red-500 text-sm">{formErrors.SessionNameL1}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'اسم الجلسة (إنجليزي)' : 'Session Name (English)'}
                  value={formData.SessionNameL2 || ''}
                  onChange={(e) => setFormData({...formData, SessionNameL2: e.target.value})}
                />
                
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                />
              </>
            )}

            {/* Program Detail Form */}
            {selectedType === 'programDetail' && (
              <>
                <Input
                  placeholder={lang === 'ar' ? 'الوصف' : 'Description'}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({...formData, Description: e.target.value})}
                  className={formErrors.Description ? 'border-red-500' : ''}
                />
                {formErrors.Description && <p className="text-red-500 text-sm">{formErrors.Description}</p>}
                
                <Input
                  placeholder={lang === 'ar' ? 'رابط الفيديو' : 'Video URL'}
                  value={formData.SessionVideo || ''}
                  onChange={(e) => setFormData({...formData, SessionVideo: e.target.value})}
                />
              </>
            )}
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit}>
              {lang === 'ar' ? 'تحديث' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors offset="140px" />
    </section>
  );
};

export default AdminPage; 


