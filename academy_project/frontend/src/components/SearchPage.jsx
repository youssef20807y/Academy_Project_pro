import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Briefcase, Code, Users, MapPin, Clock, GraduationCap, ExternalLink, AlertCircle } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/button';
import api from '../services/api';

const SearchPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    courses: [],
    projectMasters: [],
    projectDetails: [],
    programDetails: []
  });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // استخراج استعلام البحث من URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query && query.trim()) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, []);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Starting search for query:', query);
      
      // البحث في جميع المصادر
      const [coursesRes, projectMastersRes, projectDetailsRes, programDetailsRes] = await Promise.all([
        api.getCourses().catch((error) => {
          console.warn('Failed to load courses:', error);
          return [];
        }),
        api.getProjects().catch((error) => {
          console.warn('Failed to load projects:', error);
          return [];
        }),
        api.getProjectsDetail().catch((error) => {
          console.warn('Failed to load project details:', error);
          return [];
        }),
        api.getProgramDetails().catch((error) => {
          console.warn('Failed to load program details:', error);
          return [];
        })
      ]);

      console.log('API responses:', {
        courses: coursesRes,
        projectMasters: projectMastersRes,
        projectDetails: projectDetailsRes,
        programDetails: programDetailsRes
      });

      // تصفية النتائج حسب البحث
      const filteredResults = {
        courses: filterResults(coursesRes, query, ['courseNameL1', 'courseNameL2', 'description']),
        projectMasters: filterResults(projectMastersRes, query, ['projectNameL1', 'projectNameL2', 'description']),
        projectDetails: filterResults(projectDetailsRes, query, ['projectNameL1', 'projectNameL2', 'description']),
        programDetails: filterResults(programDetailsRes, query, ['sessionNameL1', 'sessionNameL2', 'description'])
      };

      console.log('Filtered results:', filteredResults);
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setError(lang === 'ar' ? 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.' : 'An error occurred during search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterResults = (data, query, fields) => {
    if (!Array.isArray(data)) return [];
    
    const searchTerm = query.toLowerCase();
    const searchTermAr = query; // للبحث في النص العربي
    
    console.log('Filtering data:', { data, query, fields });
    
    const filtered = data.filter(item => {
      return fields.some(field => {
        const value = item[field];
        if (!value) return false;
        
        const valueStr = value.toString();
        // البحث في النص العربي والإنجليزي
        const matches = valueStr.toLowerCase().includes(searchTerm) || 
                       valueStr.includes(searchTermAr) ||
                       valueStr.toLowerCase().includes(searchTermAr.toLowerCase());
        
        if (matches) {
          console.log('Match found:', { field, value: valueStr, query });
        }
        
        return matches;
      });
    });
    
    console.log('Filtered results count:', filtered.length);
    return filtered;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const getTotalResults = () => {
    return Object.values(results).reduce((total, arr) => total + arr.length, 0);
  };

  const renderResultCard = (item, type) => {
    const getTitle = () => {
      switch (type) {
        case 'courses':
          return item.courseNameL1 || item.CourseNameL1 || item.name || 'N/A';
        case 'projectMasters':
          return item.projectNameL1 || item.ProjectNameL1 || item.name || 'N/A';
        case 'projectDetails':
          return item.projectNameL1 || item.ProjectNameL1 || item.name || 'N/A';
        case 'programDetails':
          return item.sessionNameL1 || item.SessionNameL1 || item.name || 'N/A';
        default:
          return item.name || 'N/A';
      }
    };

    const getDescription = () => {
      return item.description || item.Description || 'No description available';
    };

    const getIcon = () => {
      switch (type) {
        case 'courses':
          return <BookOpen className="w-5 h-5" />;
        case 'projectMasters':
        case 'projectDetails':
          return <Code className="w-5 h-5" />;
        case 'programDetails':
          return <Users className="w-5 h-5" />;
        default:
          return <Briefcase className="w-5 h-5" />;
      }
    };

    const getTypeLabel = () => {
      switch (type) {
        case 'courses':
          return lang === 'ar' ? 'دورة' : 'Course';
        case 'projectMasters':
          return lang === 'ar' ? 'مشروع رئيسي' : 'Project Master';
        case 'projectDetails':
          return lang === 'ar' ? 'تفاصيل المشروع' : 'Project Details';
        case 'programDetails':
          return lang === 'ar' ? 'تفاصيل البرنامج' : 'Program Details';
        default:
          return 'Item';
      }
    };

    return (
      <motion.div
        key={`${type}-${item.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
              {getIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                {getTypeLabel()}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {getTitle()}
            </h3>
            
            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {getDescription()}
            </p>
            
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {lang === 'ar' ? 'تم العثور عليه' : 'Found'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const tabs = [
    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All', count: getTotalResults() },
    { id: 'courses', label: lang === 'ar' ? 'الدورات' : 'Courses', count: results.courses.length },
    { id: 'projectMasters', label: lang === 'ar' ? 'المشاريع الرئيسية' : 'Project Masters', count: results.projectMasters.length },
    { id: 'projectDetails', label: lang === 'ar' ? 'تفاصيل المشاريع' : 'Project Details', count: results.projectDetails.length },
    { id: 'programDetails', label: lang === 'ar' ? 'تفاصيل البرامج' : 'Program Details', count: results.programDetails.length }
  ];

  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return [
        ...results.courses.map(item => ({ ...item, type: 'courses' })),
        ...results.projectMasters.map(item => ({ ...item, type: 'projectMasters' })),
        ...results.projectDetails.map(item => ({ ...item, type: 'projectDetails' })),
        ...results.programDetails.map(item => ({ ...item, type: 'programDetails' }))
      ];
    }
    return results[activeTab] || [];
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* العنوان الرئيسي */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {lang === 'ar' ? 'البحث' : 'Search'}
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {lang === 'ar' 
              ? 'ابحث في الدورات والمشاريع والبرامج'
              : 'Search through courses, projects, and programs'
            }
          </p>
        </motion.div>

        {/* شريط البحث */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder={lang === 'ar' ? 'ابحث في الدورات والمشاريع والبرامج...' : 'Search courses, projects, and programs...'}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary/30 text-lg"
            />
            <Button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full"
            >
              {loading ? (lang === 'ar' ? 'جاري البحث...' : 'Searching...') : (lang === 'ar' ? 'بحث' : 'Search')}
            </Button>
          </form>
        </motion.div>

        {/* رسالة الخطأ */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">
                  {lang === 'ar' ? 'خطأ' : 'Error'}
                </span>
              </div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* نتائج البحث */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* إحصائيات البحث */}
            <div className="text-center">
              <p className="text-white/70 text-lg">
                {lang === 'ar' 
                  ? `تم العثور على ${getTotalResults()} نتيجة لـ "${searchQuery}"`
                  : `Found ${getTotalResults()} results for "${searchQuery}"`
                }
              </p>
            </div>

            {/* تبويبات النتائج */}
            <div className="flex flex-wrap justify-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* عرض النتائج */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/70">{lang === 'ar' ? 'جاري البحث...' : 'Searching...'}</p>
              </div>
            ) : getTotalResults() > 0 ? (
              <div className="grid gap-6">
                {getFilteredResults().map((item) => 
                  renderResultCard(item, item.type || activeTab)
                )}
              </div>
            ) : searchQuery && !loading ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 text-lg">
                  {lang === 'ar' 
                    ? 'لم يتم العثور على نتائج. جرب كلمات بحث مختلفة.'
                    : 'No results found. Try different search terms.'
                  }
                </p>
                <p className="text-white/50 text-sm mt-2">
                  {lang === 'ar' 
                    ? 'تأكد من كتابة الكلمات بشكل صحيح أو جرب كلمات بحث أخرى'
                    : 'Make sure to spell the words correctly or try other search terms'
                  }
                </p>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* رسالة ترحيب عندما لا يكون هناك بحث */}
        {!searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 text-lg">
              {lang === 'ar' 
                ? 'ابدأ البحث عن الدورات والمشاريع والبرامج'
                : 'Start searching for courses, projects, and programs'
              }
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SearchPage; 