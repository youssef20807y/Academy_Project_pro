import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useI18n } from '../../../lib/i18n';
import { 
  MessageSquare, Search, Edit, Trash2, Eye, 
  Filter, Calendar, User, FileText, AlertTriangle,
  CheckCircle, Clock, XCircle, Download, Upload,
  BarChart3, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { toast, Toaster } from 'sonner';
import api from '../../../services/api';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';

const ComplaintsPage = () => {
  const { lang } = useI18n();
  const isRtl = lang === 'ar';
  
  // State management
  const [complaints, setComplaints] = React.useState([]);
  const [complaintTypes, setComplaintTypes] = React.useState([]);
  const [complaintStatuses, setComplaintStatuses] = React.useState([]);
  const [students, setStudents] = React.useState([]);
  const [academies, setAcademies] = React.useState([]);
  const [branches, setBranches] = React.useState([]);
  
  // Loading states
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  const [selectedType, setSelectedType] = React.useState('all');
  const [dateRange, setDateRange] = React.useState({ from: '', to: '' });
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedComplaint, setSelectedComplaint] = React.useState(null);
  
  // Form states
  const [formData, setFormData] = React.useState({
    Description: '',
    StudentsDataId: '',
    ComplaintsTypeId: '',
    ComplaintsStatusesId: '',
    AcademyDataId: '',
    BranchesDataId: '',
    Date: new Date().toISOString().split('T')[0],
    Files: null
  });
  const [formErrors, setFormErrors] = React.useState({});

  // Prepare update data for API
  const prepareUpdateData = () => {
    return {
      Description: formData.Description.trim(),
      StudentsDataId: formData.StudentsDataId,
      ComplaintsTypeId: formData.ComplaintsTypeId,
      ComplaintsStatusesId: formData.ComplaintsStatusesId,
      AcademyDataId: formData.AcademyDataId || null,
      BranchesDataId: formData.BranchesDataId || null,
      Date: formData.Date,
      // Keep existing fields that shouldn't change
      complaintsNo: selectedComplaint.complaintsNo,
      id: selectedComplaint.id
    };
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (editDialogOpen && !submitting) {
          handleSubmit();
        }
      }
      
      // Escape to close dialog
      if (e.key === 'Escape') {
        if (editDialogOpen) {
          setEditDialogOpen(false);
        } else if (viewDialogOpen) {
          setViewDialogOpen(false);
        } else if (deleteDialogOpen) {
          setDeleteDialogOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editDialogOpen, viewDialogOpen, deleteDialogOpen, submitting]);

  // Handle form field focus
  const handleFieldFocus = (field) => {
    // Clear error for this field when user focuses on it
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges() && !window.confirm(lang === 'ar' ? 'هل تريد إلغاء التعديلات؟' : 'Do you want to cancel the changes?')) {
      return false; // Don't close if user cancels
    }
    
    resetForm();
    setSelectedComplaint(null);
    return true; // Allow closing
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.Description || formData.Description.trim().length < 10) {
      errors.Description = lang === 'ar' ? 'الوصف مطلوب ويجب أن يكون 10 أحرف على الأقل' : 'Description is required and must be at least 10 characters';
    }
    if (!formData.StudentsDataId) {
      errors.StudentsDataId = lang === 'ar' ? 'اختيار الطالب مطلوب' : 'Student selection is required';
    }
    if (!formData.ComplaintsTypeId) {
      errors.ComplaintsTypeId = lang === 'ar' ? 'نوع الشكوى مطلوب' : 'Complaint type is required';
    }
    if (!formData.ComplaintsStatusesId) {
      errors.ComplaintsStatusesId = lang === 'ar' ? 'حالة الشكوى مطلوبة' : 'Complaint status is required';
    }
    
    return errors;
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    if (!selectedComplaint) return false;
    
    return (
      formData.Description !== (selectedComplaint.description || '') ||
      formData.StudentsDataId !== (selectedComplaint.studentsDataId || '') ||
      formData.ComplaintsTypeId !== (selectedComplaint.complaintsTypeId || '') ||
      formData.ComplaintsStatusesId !== (selectedComplaint.complaintsStatusesId || '') ||
      formData.AcademyDataId !== (selectedComplaint.academyDataId || '') ||
      formData.BranchesDataId !== (selectedComplaint.branchesDataId || '') ||
      formData.Date !== (selectedComplaint.date || new Date().toISOString().split('T')[0])
    );
  };

  // Handle file upload changes
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, Files: e.target.files }));
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedComplaint) return;
    
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
      
      // Prepare data for API
      const updateData = prepareUpdateData();

      // Call API to update complaint
      const response = await api.updateComplaint(selectedComplaint.id, updateData);
      
      // Log response for debugging
      console.log('Update response:', response);
      
      // Handle successful update
      handleUpdateSuccess(response);
      
    } catch (error) {
      console.error('Error updating complaint:', error);
      
      // Show more specific error message
      let errorMessage = lang === 'ar' ? 'خطأ في تحديث الشكوى' : 'Error updating complaint';
      if (error.response?.status === 400) {
        errorMessage = lang === 'ar' ? 'بيانات غير صحيحة' : 'Invalid data';
      } else if (error.response?.status === 404) {
        errorMessage = lang === 'ar' ? 'الشكوى غير موجودة' : 'Complaint not found';
      } else if (error.response?.status === 500) {
        errorMessage = lang === 'ar' ? 'خطأ في الخادم' : 'Server error';
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update errors
  const handleUpdateError = (error) => {
    console.error('Error updating complaint:', error);
    
    // Show more specific error message
    let errorMessage = lang === 'ar' ? 'خطأ في تحديث الشكوى' : 'Error updating complaint';
    if (error.response?.status === 400) {
      errorMessage = lang === 'ar' ? 'بيانات غير صحيحة' : 'Invalid data';
    } else if (error.response?.status === 404) {
      errorMessage = lang === 'ar' ? 'الشكوى غير موجودة' : 'Complaint not found';
    } else if (error.response?.status === 500) {
      errorMessage = lang === 'ar' ? 'خطأ في الخادم' : 'Server error';
    }
    
    toast.error(errorMessage);
  };

  // Handle successful update
  const handleUpdateSuccess = (response) => {
    // Update local state with the response data if available
    let updatedComplaint;
    if (response && response.data) {
      // Use response data if available
      updatedComplaint = { ...selectedComplaint, ...response.data };
    } else {
      // Fallback to form data
      updatedComplaint = { ...selectedComplaint, ...prepareUpdateData() };
    }
    setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? updatedComplaint : c));
    
    // Show success message
    toast.success(lang === 'ar' ? 'تم تحديث الشكوى بنجاح' : 'Complaint updated successfully');
    
    // Close dialog and reset
    setEditDialogOpen(false);
    setSelectedComplaint(null);
    
    // Refresh the data to ensure consistency
    setTimeout(() => {
      loadAllData();
    }, 1000);
  };

  // Handle delete operation
  const handleDelete = async () => {
    if (!selectedComplaint) return;
    
    try {
      setSubmitting(true);
      
      // Call API to delete complaint
      await api.deleteComplaint(selectedComplaint.id);
      
      // Update local state
      setComplaints(prev => prev.filter(c => c.id !== selectedComplaint.id));
      toast.success(lang === 'ar' ? 'تم حذف الشكوى بنجاح' : 'Complaint deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error(lang === 'ar' ? 'خطأ في حذف الشكوى' : 'Error deleting complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      Description: '',
      StudentsDataId: '',
      ComplaintsTypeId: '',
      ComplaintsStatusesId: '',
      AcademyDataId: '',
      BranchesDataId: '',
      Date: new Date().toISOString().split('T')[0],
      Files: null
    });
    setFormErrors({});
  };

  // Load data on component mount
  React.useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        complaintsData, 
        typesData, 
        statusesData, 
        studentsData, 
        academiesData, 
        branchesData
      ] = await Promise.all([
        api.getComplaints().catch(() => []),
        api.getComplaintTypes().catch(() => []),
        api.getComplaintStatus().catch(() => []),
        api.getStudents().catch(() => []),
        api.getAcademies().catch(() => []),
        api.getBranches().catch(() => [])
      ]);

      // Set data with fallback to mock data
      setComplaints(Array.isArray(complaintsData) && complaintsData.length > 0 ? complaintsData : getMockComplaints());
      setComplaintTypes(Array.isArray(typesData) && typesData.length > 0 ? typesData : getMockComplaintTypes());
      setComplaintStatuses(Array.isArray(statusesData) && statusesData.length > 0 ? statusesData : getMockComplaintStatuses());
      setStudents(Array.isArray(studentsData) && studentsData.length > 0 ? studentsData : getMockStudents());
      setAcademies(Array.isArray(academiesData) && academiesData.length > 0 ? academiesData : []);
      setBranches(Array.isArray(branchesData) && branchesData.length > 0 ? branchesData : []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data');
      
      // Load mock data as fallback
      setComplaints(getMockComplaints());
      setComplaintTypes(getMockComplaintTypes());
      setComplaintStatuses(getMockComplaintStatuses());
      setStudents(getMockStudents());
    } finally {
      setLoading(false);
    }
  };

  // Mock data functions
  const getMockComplaintTypes = () => [
    { id: '1', typeNameL1: 'شكوى أكاديمية', typeNameL2: 'Academic Complaint', Description: 'شكاوى متعلقة بالعملية التعليمية' },
    { id: '2', typeNameL1: 'شكوى إدارية', typeNameL2: 'Administrative Complaint', Description: 'شكاوى متعلقة بالإدارة' },
    { id: '3', typeNameL1: 'شكوى تقنية', typeNameL2: 'Technical Complaint', Description: 'شكاوى متعلقة بالتقنية' },
    { id: '4', typeNameL1: 'شكوى مالية', typeNameL2: 'Financial Complaint', Description: 'شكاوى متعلقة بالمسائل المالية' }
  ];

  const getMockComplaintStatuses = () => [
    { id: '1', statusNameL1: 'جديد', statusNameL2: 'New', Description: 'شكوى جديدة' },
    { id: '2', statusNameL1: 'قيد المعالجة', statusNameL2: 'In Progress', Description: 'قيد المعالجة' },
    { id: '3', statusNameL1: 'محلول', statusNameL2: 'Resolved', Description: 'تم الحل' },
    { id: '4', statusNameL1: 'مرفوض', statusNameL2: 'Rejected', Description: 'مرفوض' },
    { id: '5', statusNameL1: 'معلق', statusNameL2: 'Pending', Description: 'معلق' }
  ];

  const getMockStudents = () => [
    { id: '1', studentNameL1: 'أحمد محمد', studentNameL2: 'Ahmed Mohamed', email: 'ahmed@example.com' },
    { id: '2', studentNameL1: 'فاطمة علي', studentNameL2: 'Fatima Ali', email: 'fatima@example.com' },
    { id: '3', studentNameL1: 'محمد حسن', studentNameL2: 'Mohamed Hassan', email: 'mohamed@example.com' },
    { id: '4', studentNameL1: 'سارة أحمد', studentNameL2: 'Sara Ahmed', email: 'sara@example.com' }
  ];

  const getMockComplaints = () => [
    { 
      id: '1', 
      complaintsNo: '001', 
      description: 'مشكلة في تسجيل الدخول للمنصة التعليمية - لا يمكن الوصول للمحتوى الدراسي', 
      date: '2024-01-15',
      complaintsTypeId: '3',
      complaintsStatusesId: '2',
      studentsDataId: '1',
      academyDataId: '1',
      branchesDataId: '1'
    },
    { 
      id: '2', 
      complaintsNo: '002', 
      description: 'طلب تعديل في الجدول الدراسي للفصل الثاني', 
      date: '2024-01-16',
      complaintsTypeId: '1',
      complaintsStatusesId: '1',
      studentsDataId: '2',
      academyDataId: '1',
      branchesDataId: '1'
    },
    { 
      id: '3', 
      complaintsNo: '003', 
      description: 'مشكلة في دفع الرسوم الدراسية عبر البطاقة الائتمانية', 
      date: '2024-01-17',
      complaintsTypeId: '4',
      complaintsStatusesId: '3',
      studentsDataId: '3',
      academyDataId: '1',
      branchesDataId: '1'
    },
    { 
      id: '4', 
      complaintsNo: '004', 
      description: 'طلب إعادة اختبار في مادة الرياضيات', 
      date: '2024-01-18',
      complaintsTypeId: '1',
      complaintsStatusesId: '5',
      studentsDataId: '4',
      academyDataId: '1',
      branchesDataId: '1'
    }
  ];

  // Filter complaints based on search and filters
  const filteredComplaints = React.useMemo(() => {
    return complaints.filter(complaint => {
      const matchesSearch = searchQuery === '' || 
        complaint.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        complaint.complaintsNo?.includes(searchQuery);
      
      const matchesStatus = selectedStatus === 'all' || complaint.complaintsStatusesId === selectedStatus;
      const matchesType = selectedType === 'all' || complaint.complaintsTypeId === selectedType;
      
      const matchesDateRange = !dateRange.from || !dateRange.to || 
        (complaint.date >= dateRange.from && complaint.date <= dateRange.to);
      
      return matchesSearch && matchesStatus && matchesType && matchesDateRange;
    });
  }, [complaints, searchQuery, selectedStatus, selectedType, dateRange]);

  // Get complaint statistics
  const getComplaintStats = () => {
    const total = complaints.length;
    const byStatus = complaintStatuses.map(status => ({
      ...status,
      count: complaints.filter(c => c.complaintsStatusesId === status.id).length
    }));
    const byType = complaintTypes.map(type => ({
      ...type,
      count: complaints.filter(c => c.complaintsTypeId === type.id).length
    }));
    
    return { total, byStatus, byType };
  };

  // Get display name for related data
  const getDisplayName = (id, dataArray, nameField) => {
    const item = dataArray.find(item => item.id === id);
    if (!item) return '-';
    const l1 = item[nameField] || item.statusNameL1 || item.statusesNameL1 || item.name;
    const l2 = item.statusNameL2 || item.statusesNameL2 || item.name;
    return isRtl ? (l1 || l2 || item.id) : (l2 || l1 || item.id);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (statusId) => {
    const status = complaintStatuses.find(s => s.id === statusId);
    if (!status) return 'secondary';
    const nameL1 = status.statusNameL1 || status.statusesNameL1 || status.name || '';
    const nameL2 = status.statusNameL2 || status.statusesNameL2 || status.name || '';
    const statusName = (isRtl ? nameL1 : nameL2) || nameL1 || nameL2 || '';
    const lower = statusName.toLowerCase();
    if (lower.includes('محلول') || lower.includes('resolved')) return 'default';
    if (lower.includes('مرفوض') || lower.includes('rejected')) return 'destructive';
    if (lower.includes('قيد المعالجة') || lower.includes('in progress')) return 'secondary';
    if (lower.includes('معلق') || lower.includes('pending')) return 'outline';
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            {lang === 'ar' ? 'جاري تحميل الشكاوى...' : 'Loading complaints...'}
          </p>
        </div>
      </div>
    );
  }

  const stats = getComplaintStats();
  
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                {lang === 'ar' ? 'إدارة الشكاوى' : 'Complaints Management'}
              </h1>
              <p className="text-white/90">
                {lang === 'ar' ? 'إدارة وتتبع شكاوى الطلاب' : 'Manage and track student complaints'}
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {lang === 'ar' ? 'إجمالي الشكاوى' : 'Total Complaints'}
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            {stats.byStatus.slice(0, 3).map((status) => (
              <Card key={status.id} className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {isRtl ? (status.statusNameL1 || status.statusesNameL1 || status.name) : (status.statusNameL2 || status.statusesNameL2 || status.name)}
                      </p>
                      <p className="text-2xl font-bold">{status.count}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(status.id)}>
                      {status.count}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters and Search */}
          <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={lang === 'ar' ? 'البحث في الشكاوى...' : 'Search complaints...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={lang === 'ar' ? 'حالة الشكوى' : 'Complaint Status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                    {complaintStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {isRtl ? (status.statusNameL1 || status.statusesNameL1 || status.name) : (status.statusNameL2 || status.statusesNameL2 || status.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder={lang === 'ar' ? 'نوع الشكوى' : 'Complaint Type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{lang === 'ar' ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                    {complaintTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.typeNameL1 || type.typeNameL2}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Range */}
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  placeholder={lang === 'ar' ? 'من تاريخ' : 'From Date'}
                />

                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  placeholder={lang === 'ar' ? 'إلى تاريخ' : 'To Date'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Complaints Table */}
          <Card className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {lang === 'ar' ? 'الشكاوى' : 'Complaints'}
                  </CardTitle>
                  <CardDescription>
                    {lang === 'ar' ? `عرض ${filteredComplaints.length} من ${complaints.length} شكوى` : `Showing ${filteredComplaints.length} of ${complaints.length} complaints`}
                  </CardDescription>
                </div>
                <Button onClick={loadAllData} variant="outline" size="sm" className="rounded-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {lang === 'ar' ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    {lang === 'ar' ? 'لا توجد شكاوى' : 'No complaints found'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar' ? 'جرب تغيير معايير البحث' : 'Try changing search criteria'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                          {lang === 'ar' ? 'رقم الشكوى' : 'Complaint No'}
                        </th>
                        <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                          {lang === 'ar' ? 'الطالب' : 'Student'}
                        </th>
                        <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                          {lang === 'ar' ? 'الوصف' : 'Description'}
                        </th>
                        <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                          {lang === 'ar' ? 'النوع' : 'Type'}
                        </th>
                        <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                          {lang === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                        <th className="border border-border px-4 py-2 text-left text-sm font-medium">
                          {lang === 'ar' ? 'التاريخ' : 'Date'}
                        </th>
                        <th className="border border-border px-4 py-2 text-center text-sm font-medium">
                          {lang === 'ar' ? 'الإجراءات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-muted/30">
                          <td className="border border-border px-4 py-2 text-sm font-medium">
                            {complaint.complaintsNo}
                          </td>
                          <td className="border border-border px-4 py-2 text-sm">
                            {getDisplayName(complaint.studentsDataId, students, 'studentNameL1')}
                          </td>
                          <td className="border border-border px-4 py-2 text-sm">
                            <div className="max-w-xs">
                              {complaint.description?.length > 50 
                                ? `${complaint.description.substring(0, 50)}...` 
                                : complaint.description}
                            </div>
                          </td>
                          <td className="border border-border px-4 py-2 text-sm">
                            {getDisplayName(complaint.complaintsTypeId, complaintTypes, 'typeNameL1')}
                          </td>
                          <td className="border border-border px-4 py-2 text-sm">
                            <Badge variant={getStatusBadgeVariant(complaint.complaintsStatusesId)}>
                              {getDisplayName(complaint.complaintsStatusesId, complaintStatuses, 'statusNameL1')}
                            </Badge>
                          </td>
                          <td className="border border-border px-4 py-2 text-sm">
                            {complaint.date ? new Date(complaint.date).toLocaleDateString() : '-'}
                          </td>
                          <td className="border border-border px-4 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setViewDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                                title={lang === 'ar' ? 'عرض الشكوى' : 'View Complaint'}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setFormData({
                                    Description: complaint.description || '',
                                    StudentsDataId: complaint.studentsDataId || '',
                                    ComplaintsTypeId: complaint.complaintsTypeId || '',
                                    ComplaintsStatusesId: complaint.complaintsStatusesId || '',
                                    AcademyDataId: complaint.academyDataId || '',
                                    BranchesDataId: complaint.branchesDataId || '',
                                    Date: complaint.date || new Date().toISOString().split('T')[0],
                                    Files: null
                                  });
                                  setFormErrors({}); // Clear previous errors
                                  setEditDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
                                title={lang === 'ar' ? 'تعديل الشكوى' : 'Edit Complaint'}
                                disabled={submitting}
                              >
                                {submitting && selectedComplaint?.id === complaint.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                                ) : (
                                  <Edit className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setDeleteDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                title={lang === 'ar' ? 'حذف الشكوى' : 'Delete Complaint'}
                                disabled={submitting}
                              >
                                {submitting && selectedComplaint?.id === complaint.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add/Edit Complaint Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleDialogClose();
        }
        setEditDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {lang === 'ar' ? 'تعديل الشكوى' : 'Edit Complaint'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar' ? 'أدخل تفاصيل الشكوى' : 'Enter complaint details'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'الطالب *' : 'Student *'}
              </label>
              <Select
                value={formData.StudentsDataId}
                onValueChange={(value) => handleFormChange('StudentsDataId', value)}
                onOpenChange={(open) => !open && handleFieldFocus('StudentsDataId')}
              >
                <SelectTrigger className={formErrors.StudentsDataId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={lang === 'ar' ? 'اختر الطالب' : 'Select Student'} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.studentNameL1 || student.studentNameL2 || student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.StudentsDataId && (
                <p className="text-sm text-destructive mt-1">{formErrors.StudentsDataId}</p>
              )}
            </div>

            {/* Complaint Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'نوع الشكوى *' : 'Complaint Type *'}
              </label>
              <Select
                value={formData.ComplaintsTypeId}
                onValueChange={(value) => handleFormChange('ComplaintsTypeId', value)}
                onOpenChange={(open) => !open && handleFieldFocus('ComplaintsTypeId')}
              >
                <SelectTrigger className={formErrors.ComplaintsTypeId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={lang === 'ar' ? 'اختر نوع الشكوى' : 'Select Complaint Type'} />
                </SelectTrigger>
                <SelectContent>
                  {complaintTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.typeNameL1 || type.typeNameL2 || type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.ComplaintsTypeId && (
                <p className="text-sm text-destructive mt-1">{formErrors.ComplaintsTypeId}</p>
              )}
            </div>

            {/* Complaint Status */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'حالة الشكوى *' : 'Complaint Status *'}
              </label>
              <Select
                value={formData.ComplaintsStatusesId}
                onValueChange={(value) => handleFormChange('ComplaintsStatusesId', value)}
                onOpenChange={(open) => !open && handleFieldFocus('ComplaintsStatusesId')}
              >
                <SelectTrigger className={formErrors.ComplaintsStatusesId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={lang === 'ar' ? 'اختر حالة الشكوى' : 'Select Complaint Status'} />
                </SelectTrigger>
                <SelectContent>
                  {complaintStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.statusNameL1 || status.statusNameL2 || status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.ComplaintsStatusesId && (
                <p className="text-sm text-destructive mt-1">{formErrors.ComplaintsStatusesId}</p>
              )}
            </div>

            {/* Academy and Branch */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {lang === 'ar' ? 'الأكاديمية' : 'Academy'}
                </label>
                <Select
                  value={formData.AcademyDataId}
                  onValueChange={(value) => handleFormChange('AcademyDataId', value)}
                  onOpenChange={(open) => !open && handleFieldFocus('AcademyDataId')}
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
                  onOpenChange={(open) => !open && handleFieldFocus('BranchesDataId')}
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

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'التاريخ' : 'Date'}
              </label>
              <Input
                type="date"
                value={formData.Date}
                onChange={(e) => handleFormChange('Date', e.target.value)}
                onFocus={() => handleFieldFocus('Date')}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'وصف الشكوى *' : 'Complaint Description *'}
              </label>
              <Textarea
                placeholder={lang === 'ar' ? 'أدخل تفاصيل الشكوى (10 أحرف على الأقل)' : 'Enter complaint details (minimum 10 characters)'}
                value={formData.Description}
                onChange={(e) => handleFormChange('Description', e.target.value)}
                onFocus={() => handleFieldFocus('Description')}
                rows={4}
                className={formErrors.Description ? 'border-destructive' : ''}
              />
              {formErrors.Description && (
                <p className="text-sm text-destructive mt-1">{formErrors.Description}</p>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {lang === 'ar' ? 'الملفات المرفقة' : 'Attached Files'}
              </label>
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false);
              resetForm();
              setSelectedComplaint(null);
            }}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {editDialogOpen 
                ? (submitting ? (lang === 'ar' ? 'جاري التحديث...' : 'Updating...') : (lang === 'ar' ? 'تحديث' : 'Update'))
                : (lang === 'ar' ? 'إضافة' : 'Add')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Complaint Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedComplaint(null);
        }
        setViewDialogOpen(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {lang === 'ar' ? 'تفاصيل الشكوى' : 'Complaint Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    {lang === 'ar' ? 'رقم الشكوى' : 'Complaint No'}
                  </label>
                  <p className="text-sm font-medium">{selectedComplaint.complaintsNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    {lang === 'ar' ? 'التاريخ' : 'Date'}
                  </label>
                  <p className="text-sm">{selectedComplaint.date ? new Date(selectedComplaint.date).toLocaleDateString() : '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {lang === 'ar' ? 'الطالب' : 'Student'}
                </label>
                <p className="text-sm">{getDisplayName(selectedComplaint.studentsDataId, students, 'studentNameL1')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {lang === 'ar' ? 'نوع الشكوى' : 'Complaint Type'}
                </label>
                <p className="text-sm">{getDisplayName(selectedComplaint.complaintsTypeId, complaintTypes, 'typeNameL1')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {lang === 'ar' ? 'حالة الشكوى' : 'Complaint Status'}
                </label>
                <Badge variant={getStatusBadgeVariant(selectedComplaint.complaintsStatusesId)}>
                  {getDisplayName(selectedComplaint.complaintsStatusesId, complaintStatuses, 'statusNameL1')}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  {lang === 'ar' ? 'الوصف' : 'Description'}
                </label>
                <p className="text-sm whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.academyDataId && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    {lang === 'ar' ? 'الأكاديمية' : 'Academy'}
                  </label>
                  <p className="text-sm">{getDisplayName(selectedComplaint.academyDataId, academies, 'academyNameL1')}</p>
                </div>
              )}

              {selectedComplaint.branchesDataId && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">
                    {lang === 'ar' ? 'الفرع' : 'Branch'}
                  </label>
                  <p className="text-sm">{getDisplayName(selectedComplaint.branchesDataId, branches, 'branchNameL1')}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedComplaint(null);
        }
        setDeleteDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'ar' 
                ? 'هل أنت متأكد من حذف هذه الشكوى؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this complaint? This action cannot be undone.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (lang === 'ar' ? 'جاري الحذف...' : 'Deleting...') : (lang === 'ar' ? 'حذف' : 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors offset="140px" />
    </section>
  );
};

export default ComplaintsPage; 