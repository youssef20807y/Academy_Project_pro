import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Users,
  Award,
  Settings,
  ChevronDown
} from 'lucide-react';
import academyLogo from '../assets/academy_logo.png';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useI18n } from '../lib/i18n';

const Footer = () => {
  const { t, lang } = useI18n();
  const currentYear = new Date().getFullYear();
  const isRtl = lang === 'ar';
  const [openMobileSections, setOpenMobileSections] = React.useState({});
  const contactIconMargin = isRtl ? 'ml-2' : 'mr-2';

  const footerSections = [
    {
      title: t('common.nav.coursesPrograms'),
      links: [
        { name: t('courses.categories.tech'), href: '/catalog?q=التكنولوجيا' },
        { name: t('courses.categories.business'), href: '/catalog?q=الأعمال' },
        { name: t('courses.categories.design'), href: '/catalog?q=التصميم' },
        { name: t('courses.categories.language'), href: '/catalog?q=اللغات' },
        { name: t('courses.categories.skills'), href: '/catalog?q=تطوير الذات' }
      ]
    },
    {
      title: t('common.nav.services'),
      links: [
        { name: t('pages.certificates.title'), href: '/certificates' },
        { name: t('pages.corporate.title'), href: '/corporate-training' },
        { name: t('pages.consulting.title'), href: '/edu-consulting' },
        { name: t('pages.scholarships.title'), href: '/scholarships' },
        { name: t('pages.support.title'), href: '/support' }
      ]
    },
    {
      title: t('common.nav.trainers'),
      links: [
        { name: t('trainers.categories.softSkill'), href: '/trainers/soft-skills' },
        { name: t('trainers.categories.technical'), href: '/trainers/technical' },
        { name: t('trainers.categories.freelancer'), href: '/trainers/freelancer' },
        { name: t('trainers.categories.english'), href: '/trainers/english' }
      ]
    },
    {
      title: t('common.nav.about'),
      links: [
        { name: t('about.initiative.title'), href: '/about#initiative' },
        { name: t('about.academy.title'), href: '/about#academy' },
        { name: lang === 'ar' ? 'رؤيتنا' : 'Our Vision', href: '/about#vision' },
        { name: lang === 'ar' ? 'رسالتنا' : 'Our Mission', href: '/about#mission' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/ebda3academy', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com/ebda3academy', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/ebda3academy', label: 'LinkedIn' }
  ];

  const contactInfo = [
    { icon: Phone, text: '‪+201234567890‬', href: 'tel:+201234567890' },
    { icon: Mail, text: 'info@ebda3academy.com', href: 'mailto:info@ebda3academy.com' },
  ];

  const stats = [
    { icon: Users, value: '50,000+', label: t('stats.students') },
    { icon: BookOpen, value: '300+', label: t('stats.courses') },
    { icon: Award, value: '1,000+', label: t('stats.certificates') }
  ];

  const toggleMobileSection = (index) => {
    setOpenMobileSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <footer className="relative bg-card border-t border-border">
      

      {/* القسم الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
          {/* معلومات الأكاديمية */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src={academyLogo} 
                alt="أكاديمية الإبداع" 
                className="h-10 md:h-12 w-auto"
              />
            </div>
            
            <p className="text-muted-foreground mb-5 md:mb-6 leading-relaxed text-sm md:text-base">
              {t('footer.description')}
            </p>

            {/* الإحصائيات */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-1.5 md:mb-1">
                    <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="text-base md:text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-[11px] md:text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* معلومات الاتصال */}
            <div className="space-y-2.5 md:space-y-3">
              {contactInfo.map((contact, index) => (
                <a
                  key={index}
                  href={contact.href}
                  className="flex items-center text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  <contact.icon className={`h-5 w-5 md:h-4 md:w-4 ${contactIconMargin} flex-shrink-0`} />
                  <span className="text-sm md:text-base">{contact.text}</span>
                </a>
              ))}
            </div>
          </div>

          {/* أقسام الروابط */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {footerSections.map((section, index) => {
                const isOpen = !!openMobileSections[index];
                return (
                  <div key={index} className="border-t md:border-0 pt-3 md:pt-0">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between md:cursor-default"
                      onClick={() => toggleMobileSection(index)}
                    >
                      <h3 className="text-base md:text-lg font-semibold text-foreground">{section.title}</h3>
                      <span className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    <div className="h-0.5 w-10 bg-primary rounded-full mt-2 mb-3 md:mb-4" />

                    <div className={`md:block grid overflow-hidden transition-all ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} md:opacity-100`}>
                      <div className="min-h-0">
                        <ul className="space-y-2.5 md:space-y-3">
                          {section.links.map((link, linkIndex) => (
                            <li key={linkIndex}>
                              <a
                                href={link.href}
                                className="text-muted-foreground hover:text-primary transition-colors duration-200 text-sm md:text-base"
                              >
                                {link.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* القسم السفلي */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
            {/* حقوق النشر */}
            <div className="text-xs md:text-sm text-muted-foreground text-center">
              {t('footer.rights')}
            </div>

            {/* روابط التواصل الاجتماعي والإعدادات */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
              {/* زر الإعدادات */}
              <a
                href="/settings"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Settings className="h-4 w-4" />
                </span>
              </a>
              <span className="text-sm text-muted-foreground px-2">{t('common.ui.followUs')}</span>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground transition-colors">
                    <social.icon className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

