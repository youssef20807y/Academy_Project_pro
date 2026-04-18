import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';
import api from '../services/api';

// بيانات افتراضية للمشاريع
const defaultProjects = [
  {
    id: 1,
    title: 'تطوير تطبيق الويب المتكامل',
    desc: 'تطوير تطبيق ويب متكامل باستخدام React و Node.js مع قاعدة بيانات MySQL',
    tag: 'تطوير الويب'
  },
  {
    id: 2,
    title: 'تطبيق الهاتف المحمول',
    desc: 'تطوير تطبيق iOS و Android باستخدام React Native مع واجهة مستخدم حديثة',
    tag: 'تطوير المحمول'
  },
  {
    id: 3,
    title: 'نظام إدارة قاعدة البيانات',
    desc: 'تصميم وتطوير نظام إدارة قاعدة بيانات متقدم باستخدام MySQL و MongoDB',
    tag: 'قواعد البيانات'
  },
  {
    id: 4,
    title: 'نظام الذكاء الاصطناعي',
    desc: 'تطوير نظام ذكاء اصطناعي للتعرف على الصور والنصوص باستخدام Python',
    tag: 'الذكاء الاصطناعي'
  },
  {
    id: 5,
    title: 'منصة الأمن السيبراني',
    desc: 'تطوير منصة شاملة لحماية البيانات والشبكات من التهديدات السيبرانية',
    tag: 'الأمن السيبراني'
  },
  {
    id: 6,
    title: 'نظام إدارة المشاريع',
    desc: 'تطوير نظام متكامل لإدارة المشاريع والمهام مع تتبع التقدم والإنتاجية',
    tag: 'إدارة المشاريع'
  }
];

const Projects = () => {
  const { t } = useI18n();
  const [projects, setProjects] = useState(defaultProjects);
  const [loading, setLoading] = useState(true);
  const [usingDefaultData, setUsingDefaultData] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await api.getProjects({ silent: true }).catch(() => null);
        
        if (projectsData && Array.isArray(projectsData) && projectsData.length > 0) {
          const apiProjects = projectsData.slice(0, 6).map((project, index) => ({
            id: project.id || project.Id || index + 1,
            title: project.title || project.Title || project.ProjectNameL1 || project.ProjectNameL2 || `مشروع ${index + 1}`,
            desc: project.description || project.Description || 'وصف المشروع غير متوفر',
            tag: project.category || project.Category || 'تطوير'
          }));
          setProjects(apiProjects);
          setUsingDefaultData(false);
        } else {
          // استخدام البيانات الافتراضية إذا لم توجد بيانات
          setProjects(defaultProjects);
          setUsingDefaultData(true);
        }
      } catch (error) {
        console.error('خطأ في جلب المشاريع:', error);
        // في حالة الخطأ، استخدم البيانات الافتراضية
        setProjects(defaultProjects);
        setUsingDefaultData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section id="projects" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('projects.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('projects.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="academy-card p-6 animate-pulse">
                <div className="h-4 bg-muted rounded mb-3"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t('projects.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('projects.subtitle')}</p>
        </div>

        {usingDefaultData && (
          <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg max-w-2xl mx-auto">
            <p className="text-yellow-800 text-sm text-center">
              ⚠️ عرض بيانات افتراضية - لا توجد بيانات متاحة من الخادم
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, idx) => (
            <div key={idx} className="academy-card p-6 group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{p.tag}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
              <div className="space-y-2">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                {t('common.actions.previewProject')}
                <ExternalLink className="mr-2 h-4 w-4" />
              </Button>
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs w-full"
                  onClick={() => {
                    // يمكن إضافة منطق بدء المحتوى هنا
                    alert('تم بدء المحتوى!');
                  }}
                >
                  ابدأ المحتوى
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects; 