import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';
import api from '../services/api';

const pathToCategory = (path) => {
  if (path.includes('/trainers/soft-skills')) return 'softSkill';
  if (path.includes('/trainers/technical')) return 'technical';
  if (path.includes('/trainers/freelancer')) return 'freelancer';
  if (path.includes('/trainers/english')) return 'english';
  return null;
};

const categoryMeta = (lang) => ({
  softSkill: {
    name: lang === 'ar' ? 'Soft Skills' : 'Soft Skills',
    desc: lang === 'ar' ? 'Communication, leadership and management skills' : 'Communication, leadership and management skills',
  },
  technical: {
    name: lang === 'ar' ? 'Technical' : 'Technical',
    desc: lang === 'ar' ? 'Programming, development and technical design' : 'Programming, development and technical design',
  },
  freelancer: {
    name: lang === 'ar' ? 'Freelancer' : 'Freelancer',
    desc: lang === 'ar' ? 'Freelancing skills and project management' : 'Freelancing skills and project management',
  },
  english: {
    name: lang === 'ar' ? 'English' : 'English',
    desc: lang === 'ar' ? 'English language learning and communication' : 'English language learning and communication',
  }
});

const TrainersCategoryPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [trainers, setTrainers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const categoryId = pathToCategory(path);
  const meta = categoryMeta(lang)[categoryId] || { name: '', desc: '' };

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.getTrainers();
        const list = Array.isArray(res) ? res : [];
        const filtered = list.filter(trainer => (
          trainer.category === categoryId ||
          trainer.specialty === categoryId ||
          trainer.teacherType === categoryId ||
          (trainer.description && trainer.description.toLowerCase().includes(`category: ${categoryId}`))
        ));
        setTrainers(filtered.map(trainer => ({
          id: trainer.id,
          name: trainer.teacherNameL1 || trainer.teacherNameL2 || 'Unknown',
          description: trainer.description || (lang === 'ar' ? 'مدرب محترف في مجال التدريب والتطوير' : 'Professional trainer in training and development')
        })));
      } catch (_) {
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };
    if (categoryId) load();
  }, [categoryId, lang]);

  const handleTrainerClick = (id) => { window.location.href = `/trainer/${id}`; };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/55" />
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl hidden md:block" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-black/10 rounded-full blur-3xl hidden md:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 lg:py-28 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
          <Button variant="ghost" onClick={() => (window.location.href = '/trainers')} className="mb-4 text-white hover:bg-white/10">
            ← {lang === 'ar' ? 'العودة للمدربين' : 'Back to Trainers'}
          </Button>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{t('trainers.title')}</h1>
          <p className="text-white/90">{t('trainers.subtitle')}</p>
        </motion.div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{meta.name}</h2>
          <p className="text-white/80">{meta.desc}</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/90">{t('trainers.loading')}</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
              <Users className="w-12 h-12 text-white/60" />
            </div>
            <p className="text-white/90 text-lg">{t('trainers.noTrainers')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((tr) => (
              <motion.div key={tr.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group" onClick={() => handleTrainerClick(tr.id)}>
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{tr.name}</h3>
                  <p className="text-white/80 mb-4">{tr.description}</p>
                  <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/20">
                    {lang === 'ar' ? 'عرض الملف الشخصي' : 'View Profile'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrainersCategoryPage; 