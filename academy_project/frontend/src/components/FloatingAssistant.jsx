import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  FileText, 
  AlertTriangle, 
  X, 
  Send,
  Bot,
  User,
  Paperclip,
  Download,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useI18n } from '../lib/i18n';
import api from '../services/api';
import geminiApiService from '../services/geminiApi';

const FloatingAssistant = () => {
  const { t, lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    description: '',
    typeId: '',
    academyId: '',
    branchId: '',
    studentId: '',
    files: []
  });
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [complaintStatuses, setComplaintStatuses] = useState([]);
  const [academies, setAcademies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [complaintError, setComplaintError] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState('');
  const chatEndRef = useRef(null);

  const isRtl = lang === 'ar';

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'chat') {
        await loadChatHistory();
      } else if (activeTab === 'complaints') {
        await loadComplaints();
        await loadComplaintTypes();
        await loadComplaintStatuses();
        await loadAcademies();
        await loadBranches();
        await loadStudents();
        await loadCurrentUser();
      } else if (activeTab === 'reports') {
        await loadReports();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await api.getChatHistory();
      if (response && Array.isArray(response)) {
        setChatMessages(response);
      } else {
        setChatMessages([
          {
            id: '1',
            text: lang === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك اليوم؟' : 'Hello! How can I help you today?',
            senderIsAgent: true,
            senderDisplayName: 'AI Assistant',
            timestamp: new Date().toISOString()
        }
        ]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatMessages([
        {
          id: '1',
          text: lang === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك اليوم؟' : 'Hello! How can I help you today?',
          senderIsAgent: true,
          senderDisplayName: 'AI Assistant',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const loadComplaints = async () => {
    try {
      const response = await api.getComplaints();
      if (response && Array.isArray(response)) {
        setComplaints(response);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
      setComplaints([
        {
          id: '1',
          complaintsNo: 1001,
          description: lang === 'ar' ? 'مشكلة في تسجيل الدخول' : 'Login issue',
          date: '2024-01-15',
          statusesNameL1: lang === 'ar' ? 'قيد المعالجة' : 'In Progress'
        }
      ]);
    }
  };

  const loadComplaintTypes = async () => {
    try {
      const response = await api.getComplaintTypes();
      if (response && Array.isArray(response)) {
        setComplaintTypes(response);
      }
    } catch (error) {
      console.error('Error loading complaint types:', error);
      setComplaintTypes([
        { id: '1', typeNameL1: lang === 'ar' ? 'مشكلة تقنية' : 'Technical Issue', typeNameL2: 'Technical Issue' },
        { id: '2', typeNameL1: lang === 'ar' ? 'مشكلة في المحتوى' : 'Content Issue', typeNameL2: 'Content Issue' }
      ]);
    }
  };

  const loadComplaintStatuses = async () => {
    try {
      const response = await api.getComplaintStatus();
      if (response && Array.isArray(response)) {
        setComplaintStatuses(response);
      }
    } catch (error) {
      console.error('Error loading complaint statuses:', error);
      setComplaintStatuses([
        { id: '1', statusesNameL1: lang === 'ar' ? 'مفتوح' : 'Open', statusesNameL2: 'Open' },
        { id: '2', statusesNameL1: lang === 'ar' ? 'قيد المعالجة' : 'In Progress', statusesNameL2: 'In Progress' },
        { id: '3', statusesNameL1: lang === 'ar' ? 'مغلق' : 'Closed', statusesNameL2: 'Closed' }
      ]);
    }
  };

  const loadAcademies = async () => {
    try {
      const response = await api.getAcademies();
      if (response && Array.isArray(response)) {
        setAcademies(response);
      }
    } catch (error) {
      console.error('Error loading academies:', error);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await api.getBranches();
      if (response && Array.isArray(response)) {
        setBranches(response);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.getStudents({ silent: true });
      if (response && Array.isArray(response)) {
        setStudents(response);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response) {
        setCurrentUser(response);
        return;
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
    try {
      const userDataStr = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      if (userDataStr) {
        const parsed = JSON.parse(userDataStr);
        setCurrentUser(parsed);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (activeTab !== 'complaints') return;
    if (!currentUser || !students || students.length === 0) return;

    const userId = currentUser.id || currentUser.userId || currentUser.guid;
    const userEmail = currentUser.email || currentUser.Email;

    const matchedStudent = students.find((s) => {
      const sid = s.id || s.guid;
      const semail = s.email || s.Email;
      return (sid && userId && sid === userId) || (semail && userEmail && semail.toLowerCase() === userEmail.toLowerCase());
    });

    const fromMatchedAcademy = matchedStudent?.academyDataId || matchedStudent?.AcademyDataId;
    const fromMatchedBranch = matchedStudent?.branchesDataId || matchedStudent?.BranchesDataId;
    const fromUserAcademy = currentUser.academyDataId || currentUser.AcademyDataId;
    const fromUserBranch = currentUser.branchesDataId || currentUser.BranchesDataId;

    const desiredAcademyId = fromMatchedAcademy || fromUserAcademy || '';
    const desiredBranchId = fromMatchedBranch || fromUserBranch || '';
    const desiredStudentId = matchedStudent ? (matchedStudent.id || matchedStudent.guid) : '';

    setNewComplaint((prev) => {
      const nextAcademyId = prev.academyId || desiredAcademyId;
      const nextBranchId = prev.branchId || desiredBranchId;
      const nextStudentId = prev.studentId || desiredStudentId;
      if (prev.academyId === nextAcademyId && prev.branchId === nextBranchId && prev.studentId === nextStudentId) return prev;
      return { ...prev, academyId: nextAcademyId, branchId: nextBranchId, studentId: nextStudentId };
    });
  }, [activeTab, currentUser, students]);

  const selectedStudentName = React.useMemo(() => {
    if (!currentUser) return '';
    const userId = currentUser.id || currentUser.userId || currentUser.guid;
    const userEmail = currentUser.email || currentUser.Email;
    const matchedStudent = students.find((s) => {
      const sid = s.id || s.guid;
      const semail = s.email || s.Email;
      return (sid && userId && sid === userId) || (semail && userEmail && semail.toLowerCase() === userEmail.toLowerCase());
    });
    if (matchedStudent) {
      const full = matchedStudent.fullName || `${matchedStudent.firstName || ''} ${matchedStudent.lastName || ''}`.trim();
      return full || matchedStudent.studentNameL1 || matchedStudent.studentNameL2 || matchedStudent.name || '';
    }
    const fallback = `${currentUser.firstName || currentUser.FirstName || ''} ${currentUser.lastName || currentUser.LastName || ''}`.trim();
    return fallback || currentUser.email || currentUser.Email || '';
  }, [currentUser, students]);

  const loadReports = async () => {
    try {
      setReports([
        {
          id: '1',
          title: lang === 'ar' ? 'تقرير الأداء الأسبوعي' : 'Weekly Performance Report',
          date: '2024-01-15',
        }
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const getComplaintStatusLabel = (complaint) => {
    if (!complaint) return '';
    let label = complaint.statusesNameL1 || complaint.statusNameL1 || complaint.statusesNameL2 || complaint.statusNameL2 || '';
    if (!label && complaint.complaintsStatusesId && Array.isArray(complaintStatuses) && complaintStatuses.length > 0) {
      const s = complaintStatuses.find(st => st.id === complaint.complaintsStatusesId);
      if (s) label = isRtl ? (s.statusesNameL1 || s.statusNameL1 || s.name) : (s.statusesNameL2 || s.statusNameL2 || s.name);
    }
    return label || '';
  };

  const getComplaintStatusClass = (complaint) => {
    const label = (getComplaintStatusLabel(complaint) || '').toLowerCase();
    if (label.includes('مفتوح') || label.includes('open') || label.includes('جديد') || label.includes('new')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (label.includes('مغلق') || label.includes('closed')) {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const generateAIReport = async (reportType) => {
    setLoading(true);
    try {
      const reportData = {
        type: reportType,
        period: 'Current Period',
        data: 'Available data from system'
      };

      const geminiResponse = await geminiApiService.generateReport(reportData);
      
      if (geminiResponse.success) {
        // إضافة التقرير إلى الرسائل
        const aiReport = {
          id: Date.now().toString(),
          text: geminiResponse.report,
          senderIsAgent: true,
          senderDisplayName: 'AI Report Generator',
          timestamp: new Date().toISOString(),
          isReport: true
        };
        setChatMessages(prev => [...prev, aiReport]);
        
        // إضافة التقرير إلى قائمة التقارير
        const newReport = {
          id: Date.now().toString(),
          title: lang === 'ar' ? `تقرير ${reportType} - ${new Date().toLocaleDateString()}` : `${reportType} Report - ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString().split('T')[0],
          type: reportType,
          content: geminiResponse.report
        };
        setReports(prev => [newReport, ...prev]);
      }
    } catch (error) {
      console.error('Error generating AI report:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      senderIsAgent: false,
      senderDisplayName: 'You',
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setLoading(true);

    // التحقق من إذا كان المستخدم يسأل عن الشكاوى
    const complaintKeywords = lang === 'ar' 
      ? ['شكوى', 'شكاوى', 'شكوي', 'شكاوي', 'مشكلة', 'مشاكل', 'بلاغ', 'بلاغات']
      : ['complaint', 'complaints', 'issue', 'issues', 'problem', 'problems', 'report', 'reports'];
    
    const hasComplaintKeyword = complaintKeywords.some(keyword => 
      chatInput.toLowerCase().includes(keyword.toLowerCase())
    );

    if (hasComplaintKeyword) {
      // إضافة رد سريع للشكاوى
      const complaintResponse = {
        id: (Date.now() + 1).toString(),
        text: lang === 'ar' 
          ? 'يمكنك إدارة الشكاوى من خلال تبويب "الشكاوى" أو الضغط على الزر أدناه للوصول إلى صفحة إدارة الشكاوى الكاملة.'
          : 'You can manage complaints through the "Complaints" tab or click the button below to access the full complaints management page.',
        senderIsAgent: true,
        senderDisplayName: 'AI Assistant',
        timestamp: new Date().toISOString(),
        hasComplaintButton: true
      };
      setChatMessages(prev => [...prev, complaintResponse]);
      setLoading(false);
      return;
    }

    try {
      // استخدام API جيميناي مباشرة للحصول على رد ذكي
      const geminiResponse = await geminiApiService.handleChatMessage(
        chatInput, 
        chatMessages.map(msg => ({ sender: msg.senderDisplayName, text: msg.text }))
      );

      if (geminiResponse.success) {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          text: geminiResponse.response,
          senderIsAgent: true,
          senderDisplayName: 'AI Assistant',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, aiResponse]);
      } else {
        // استخدام الرد الاحتياطي
        const fallbackResponse = {
          id: (Date.now() + 1).toString(),
          text: geminiResponse.fallbackResponse,
          senderIsAgent: true,
          senderDisplayName: 'AI Assistant',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, fallbackResponse]);
      }

      // محاولة إرسال الرسالة إلى API المحلي في الخلفية (اختياري)
      try {
        await api.sendChatMessage({
          text: userMessage.text,
          senderIsAgent: userMessage.senderIsAgent,
          messageType: 0,
          senderDisplayName: 'User',
          receiverDisplayName: 'AI Assistant',
          senderId: userMessage.id,
          receiverId: 'ai-assistant'
        });
      } catch (localApiError) {
        console.log('Local API not available, continuing with Gemini only');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // محاولة استخدام API جيميناي مباشرة في حالة فشل API المحلي
      try {
        const geminiResponse = await geminiApiService.handleChatMessage(
          chatInput, 
          chatMessages.map(msg => ({ sender: msg.senderDisplayName, text: msg.text }))
        );

        if (geminiResponse.success) {
          const aiResponse = {
            id: (Date.now() + 1).toString(),
            text: geminiResponse.response,
            senderIsAgent: true,
            senderDisplayName: 'AI Assistant',
            timestamp: new Date().toISOString()
          };
          setChatMessages(prev => [...prev, aiResponse]);
        } else {
          // استخدام الرد الاحتياطي
          const fallbackResponse = {
            id: (Date.now() + 1).toString(),
            text: geminiResponse.fallbackResponse,
            senderIsAgent: true,
            senderDisplayName: 'AI Assistant',
            timestamp: new Date().toISOString()
          };
          setChatMessages(prev => [...prev, fallbackResponse]);
        }
      } catch (geminiError) {
        console.error('Error with Gemini API:', geminiError);
        
        // رد احتياطي نهائي في حالة فشل جميع APIs
        const fallbackResponse = {
          id: (Date.now() + 1).toString(),
          text: lang === 'ar' 
            ? 'أعتذر، لدي مشكلة تقنية في الوقت الحالي. يمكنك المحاولة مرة أخرى لاحقاً.'
            : 'I apologize, I am experiencing technical difficulties at the moment. Please try again later.',
          senderIsAgent: true,
          senderDisplayName: 'AI Assistant',
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, fallbackResponse]);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async () => {
    setComplaintError('');
    setComplaintSuccess('');
    if (!currentUser) {
      const msg = lang === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first';
      setComplaintError(msg);
      const errorMessage = {
        id: Date.now().toString(),
        text: msg,
        senderIsAgent: true,
        senderDisplayName: 'System',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
      return;
    }

    const academyId = newComplaint.academyId || currentUser.academyDataId || currentUser.AcademyDataId || '';
    const branchId = newComplaint.branchId || currentUser.branchesDataId || currentUser.BranchesDataId || '';

    if (!newComplaint.description.trim() || newComplaint.description.trim().length < 10) {
      setComplaintError(lang === 'ar' ? 'يجب أن يحتوي وصف الشكوى على 10 أحرف على الأقل' : 'Complaint description must be at least 10 characters');
      return;
    }
    if (!academyId) {
      setComplaintError(lang === 'ar' ? 'يرجى اختيار الأكاديمية' : 'Please select an academy');
      return;
    }
    if (!branchId) {
      setComplaintError(lang === 'ar' ? 'يرجى اختيار الفرع' : 'Please select a branch');
      return;
    }
    if (!newComplaint.typeId) {
      setComplaintError(lang === 'ar' ? 'يرجى اختيار نوع الشكوى' : 'Please select a complaint type');
      return;
    }

    // حاول إيجاد الطالب من قاعدة الطلاب؛ وإن لم يوجد قم بإنشائه من بيانات الجلسة
    let resolvedStudentId = newComplaint.studentId;
    try {
      if (!resolvedStudentId) {
        const userId = currentUser.id || currentUser.userId || currentUser.guid;
        const userEmail = (currentUser.email || currentUser.Email || '').toLowerCase();
        let allStudents = Array.isArray(students) && students.length > 0 ? students : [];
        if (allStudents.length === 0) {
          const fresh = await api.getStudents({ silent: true }).catch(() => []);
          allStudents = Array.isArray(fresh) ? fresh : [];
        }
        const matchedStudent = allStudents.find((s) => {
          const sid = s.id || s.guid;
          const semail = (s.email || s.Email || '').toLowerCase();
          return (sid && userId && sid === userId) || (semail && userEmail && semail === userEmail);
        });
        resolvedStudentId = matchedStudent ? (matchedStudent.id || matchedStudent.guid) : '';

        // إذا لم يوجد سجل طالب مطابق، أنشئ واحداً من بيانات الجلسة
        if (!resolvedStudentId) {
          const firstName = currentUser.firstName || currentUser.FirstName || '';
          const lastName = currentUser.lastName || currentUser.LastName || '';
          const fullName = `${firstName} ${lastName}`.trim() || (currentUser.email || currentUser.Email || 'User');
          const phone = currentUser.phoneNumber || currentUser.PhoneNumber || 'N/A';
          const address = currentUser.address || currentUser.Address || 'N/A';
          try {
            const created = await api.createStudent({
              StudentNameL1: fullName,
              StudentNameL2: fullName,
              Email: currentUser.email || currentUser.Email || '',
              StudentPhone: phone,
              StudentAddress: address,
              AcademyDataId: academyId,
              BranchesDataId: branchId,
              Active: true,
            });
            const newId = created?.id || created?.Id || created?.guid;
            if (newId) {
              resolvedStudentId = newId;
              setNewComplaint(prev => ({ ...prev, studentId: newId }));
              // أضف الطالب الجديد محلياً حتى تظهر التسمية فوراً
              setStudents(prev => Array.isArray(prev) ? [...prev, { id: newId, fullName, email: currentUser.email || currentUser.Email || '', academyDataId: academyId, branchesDataId: branchId }] : prev);
            }
          } catch (e) {
            // فشل إنشاء الطالب
            const msg = lang === 'ar' ? 'تعذّر إنشاء سجل الطالب تلقائياً' : 'Failed to auto-create student record';
            setComplaintError(msg);
      return;
          }
        }
      }
    } catch (_) {
      // تجاهل أخطاء جلب الطلاب
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Description', newComplaint.description);
      formData.append('ComplaintsTypeId', newComplaint.typeId);
      formData.append('AcademyDataId', academyId);
      formData.append('BranchesDataId', branchId);
      if (resolvedStudentId) {
        formData.append('StudentsDataId', resolvedStudentId);
      }
      if (complaintStatuses.length > 0) {
        const defaultStatus = complaintStatuses.find(status => 
          status.statusesNameL1?.includes('جديد') || 
          status.statusesNameL2?.includes('New')
        );
        if (defaultStatus) {
          formData.append('ComplaintsStatusesId', defaultStatus.id);
        }
      }
      formData.append('Date', new Date().toISOString().slice(0, 10));
      
      if (newComplaint.files && newComplaint.files.length > 0) {
        for (let i = 0; i < newComplaint.files.length; i++) {
          formData.append('FilesAttach', newComplaint.files[i]);
        }
      }

      const response = await api.createComplaint(formData);
      
      if (response) {
        setComplaintSuccess(lang === 'ar' ? 'تم إرسال الشكوى بنجاح' : 'Complaint submitted successfully');
        setNewComplaint({ description: '', typeId: '', academyId, branchId, files: [], studentId: resolvedStudentId || '' });
        await loadComplaints();
      }
    } catch (error) {
      let message = lang === 'ar' ? 'فشل إرسال الشكوى' : 'Failed to submit complaint';
      try {
        if (error?.body) {
          const parsed = JSON.parse(error.body);
          message = parsed?.detail || parsed?.title || message;
        }
      } catch (_) {}
      setComplaintError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setNewComplaint(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const tabs = [
    { id: 'chat', icon: MessageCircle, label: lang === 'ar' ? 'الدردشة' : 'Chat' },
    { id: 'complaints', icon: AlertTriangle, label: lang === 'ar' ? 'الشكاوى' : 'Complaints' },
    { id: 'reports', icon: FileText, label: lang === 'ar' ? 'التقارير' : 'Reports' }
  ];

  return (
    <>
      {/* الدائرة الثابتة */}
      <motion.div
        className={`fixed bottom-6 z-50 ${isRtl ? 'left-6' : 'right-6'}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white/20 backdrop-blur-sm"
        >
          <Bot className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* النافذة المنبثقة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* خلفية معتمة */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* النافذة */}
            <motion.div
              className={`absolute ${isRtl ? 'left-4 md:left-6' : 'right-4 md:right-6'} bottom-24 w-[92vw] md:w-96 max-w-sm md:max-w-none max-h-[70vh] md:max-h-[600px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* الهيدر */}
              <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">
                      {lang === 'ar' ? 'المساعد الذكي' : 'AI Assistant'}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 p-1 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* التبويبات */}
              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border-b-2 border-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary/70'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* المحتوى */}
              <div className="p-4 max-h-[60vh] md:max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {/* تبويب الدردشة */}
                    {activeTab === 'chat' && (
                      <div className="space-y-4">
                        <div className="space-y-3 max-h-[40vh] md:max-h-64 overflow-y-auto">
                          {chatMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderIsAgent ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.senderIsAgent
                                    ? message.isAnalysis || message.isReport
                                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary-800'
                                      : 'bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 text-gray-800'
                                    : 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md'
                                }`}
                              >
                                <p className="text-sm">{message.text}</p>
                                {message.hasComplaintButton && (
                                  <Button
                                    onClick={() => {
                                      window.location.href = '/complaints';
                                      setIsOpen(false);
                                    }}
                                    className="mt-2 w-full academy-button bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white text-xs px-3 py-1 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                                  >
                                    {lang === 'ar' ? 'إدارة الشكاوى' : 'Manage Complaints'}
                                  </Button>
                                )}
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                            className="flex-1 border-primary/30 focus:border-primary focus:ring-primary/20 transition-all duration-300"
                          />
                          <Button
                            onClick={sendChatMessage}
                            disabled={loading}
                            className="academy-button bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* تبويب الشكاوى */}
                    {activeTab === 'complaints' && (
                      <div className="space-y-4">
                        {/* زر الوصول إلى صفحة الشكاوى الكاملة */}
                        <div className="mb-4">
                          <Button
                            onClick={() => {
                              window.location.href = '/complaints';
                              setIsOpen(false);
                            }}
                            className="w-full academy-button bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                          >
                            {lang === 'ar' ? 'إدارة الشكاوى الكاملة' : 'Full Complaints Management'}
                          </Button>
                        </div>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {complaints.map((complaint) => (
                            <Card key={complaint.id} className="border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-gray-50 to-white">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                                    #{complaint.complaintsNo}
                                  </Badge>
                                  <Badge 
                                    className={`text-xs ${
                                      getComplaintStatusClass(complaint)
                                    }`}
                                  >
                                    {getComplaintStatusLabel(complaint)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{complaint.description}</p>
                                <p className="text-xs text-gray-500">{complaint.date}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3 text-gray-700">
                            {lang === 'ar' ? 'إضافة شكوى جديدة' : 'Add New Complaint'}
                          </h4>
                          <div className="space-y-3">
                            <select
                              value={newComplaint.typeId}
                              onChange={(e) => setNewComplaint(prev => ({ ...prev, typeId: e.target.value }))}
                              className="w-full p-2 border border-primary/30 rounded-lg text-sm focus:border-primary focus:ring-primary/20 transition-all duration-300 bg-white"
                            >
                              <option value="">{lang === 'ar' ? 'اختر نوع الشكوى' : 'Select Complaint Type'}</option>
                              {complaintTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {isRtl ? type.typeNameL1 : type.typeNameL2}
                                </option>
                              ))}
                            </select>
                            
                            <select
                              value={newComplaint.academyId}
                              onChange={(e) => setNewComplaint(prev => ({ ...prev, academyId: e.target.value, branchId: '' }))}
                              className="w-full p-2 border border-primary/30 rounded-lg text-sm focus:border-primary focus:ring-primary/20 transition-all duration-300 bg-white"
                            >
                              <option value="">{lang === 'ar' ? 'اختر الأكاديمية' : 'Select Academy'}</option>
                              {academies.map((academy) => (
                                <option key={academy.id} value={academy.id}>
                                  {isRtl ? academy.academyNameL1 : academy.academyNameL2}
                                </option>
                              ))}
                            </select>
                            
                            <select
                              value={newComplaint.branchId}
                              onChange={(e) => setNewComplaint(prev => ({ ...prev, branchId: e.target.value }))}
                              className="w-full p-2 border border-primary/30 rounded-lg text-sm focus:border-primary focus:ring-primary/20 transition-all duration-300 bg-white"
                            >
                              <option value="">{lang === 'ar' ? 'اختر الفرع' : 'Select Branch'}</option>
                              {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                  {isRtl ? branch.branchNameL1 : branch.branchNameL2}
                                </option>
                              ))}
                            </select>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                {lang === 'ar' ? 'الطالب' : 'Student'}
                              </label>
                              <Input
                                value={selectedStudentName || (lang === 'ar' ? 'لم يتم التعرف على طالب للجلسة الحالية' : 'No student matched for current session')}
                                disabled
                                className="w-full"
                              />
                            </div>
                            
                            <div className="relative">
                              <Textarea
                                value={newComplaint.description}
                                onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                                placeholder={lang === 'ar' ? 'وصف الشكوى (10 أحرف على الأقل)...' : 'Complaint description (minimum 10 characters)...'}
                                className="min-h-[80px] text-sm border border-primary/30 focus:border-primary focus:ring-primary/20 transition-all duration-300 resize-none"
                              />
                              <div className={`absolute bottom-2 right-2 text-xs ${
                                newComplaint.description.length >= 10 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                {newComplaint.description.length}/10
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={submitComplaint}
                                disabled={loading || !newComplaint.description.trim() || newComplaint.description.trim().length < 10 || !newComplaint.academyId || !newComplaint.branchId}
                                className="academy-button bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white text-sm px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                              >
                                {lang === 'ar' ? 'إرسال الشكوى' : 'Submit Complaint'}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('file-upload').click()}
                                className="text-sm border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                              >
                                <Paperclip className="w-4 h-4 mr-1" />
                                {lang === 'ar' ? 'ملف' : 'File'}
                              </Button>
                              <input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                        {activeTab === 'complaints' && (
                          <div className="px-4 pb-2">
                            {complaintError ? (
                              <p className="text-sm text-red-600">{complaintError}</p>
                            ) : null}
                            {complaintSuccess ? (
                              <p className="text-sm text-green-600">{complaintSuccess}</p>
                            ) : null}
                          </div>
                        )}
                      </div>
                    )}

                    {/* تبويب التقارير */}
                    {activeTab === 'reports' && (
                      <div className="space-y-4">
                        {/* زر الوصول إلى صفحة الشكاوى */}
                        <div className="mb-4">
                          <Button
                            onClick={() => {
                              window.location.href = '/complaints';
                              setIsOpen(false);
                            }}
                            variant="outline"
                            className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                          >
                            {lang === 'ar' ? 'إدارة الشكاوى' : 'Manage Complaints'}
                          </Button>
                        </div>
                        
                        {/* أزرار إنشاء التقارير */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          <Button
                            onClick={() => generateAIReport('performance')}
                            disabled={loading}
                            className="academy-button bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                          >
                            {lang === 'ar' ? 'تقرير الأداء' : 'Performance Report'}
                          </Button>
                          <Button
                            onClick={() => generateAIReport('attendance')}
                            disabled={loading}
                            className="academy-button bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                          >
                            {lang === 'ar' ? 'تقرير الحضور' : 'Attendance Report'}
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {reports.map((report) => (
                            <Card key={report.id} className="border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-gray-50 to-white">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-gray-800">{report.title}</h4>
                                  <Badge 
                                    className={`text-xs ${
                                      report.type === 'performance' 
                                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                                        : 'bg-green-100 text-green-800 border-green-300'
                                    }`}
                                  >
                                    {report.type === 'performance' 
                                      ? (lang === 'ar' ? 'أداء' : 'Performance')
                                      : (lang === 'ar' ? 'حضور' : 'Attendance')
                                    }
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{report.date}</p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    {lang === 'ar' ? 'عرض' : 'View'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                                  >
                                    <Download className="w-3 h-3 mr-1" />
                                    {lang === 'ar' ? 'تحميل' : 'Download'}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAssistant; 