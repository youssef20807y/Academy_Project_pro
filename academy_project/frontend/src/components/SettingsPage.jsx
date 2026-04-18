import React from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../lib/i18n';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { HelpCircle, User } from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';

const LS_KEYS = {
  reduceMotion: 'pref_reduce_motion',
  compactLayout: 'pref_compact_layout',
};

const SettingsPage = () => {
  const { t, lang, setLang } = useI18n();
  const isRtl = lang === 'ar';
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');
      const email = user.email || user.Email || '';
      const role = user.role || user.Role || '';
      const admin = role === 'SupportAgent' || role === 'Admin' || role === 'admin' || email === 'yjmt469999@gmail.com';
      setIsAdmin(admin);
    } catch (_) {
      setIsAdmin(false);
    }
  }, []);

  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [compactLayout, setCompactLayout] = React.useState(false);

  React.useEffect(() => {
    try {
      setReduceMotion(localStorage.getItem(LS_KEYS.reduceMotion) === '1');
      setCompactLayout(localStorage.getItem(LS_KEYS.compactLayout) === '1');
    } catch (_) {}
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem(LS_KEYS.reduceMotion, reduceMotion ? '1' : '0'); } catch (_) {}
  }, [reduceMotion]);
  React.useEffect(() => {
    try { localStorage.setItem(LS_KEYS.compactLayout, compactLayout ? '1' : '0'); } catch (_) {}
  }, [compactLayout]);

  const reset = () => {
    setLang('en');
    setReduceMotion(false);
    setCompactLayout(false);
    try {
      localStorage.removeItem(LS_KEYS.reduceMotion);
      localStorage.removeItem(LS_KEYS.compactLayout);
    } catch (_) {}
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/50" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t('settings.title')}</h1>
          <p className="text-white/90 mb-6">{t('settings.subtitle')}</p>

          <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Language */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t('settings.language.title')}</h2>
              <p className="text-sm text-muted-foreground mb-3">{t('settings.language.description')}</p>
              <div className="max-w-xs">
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.language.selectLabel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="en">{t('settings.language.en')}</SelectItem>
                      <SelectItem value="ar">{t('settings.language.ar')}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Site preferences */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">{t('settings.site.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings.site.subtitle')}</p>

              <div className="flex items-start justify-between gap-4 py-2">
                <div>
                  <div className="text-foreground font-medium">{t('settings.site.reduceMotionLabel')}</div>
                  <div className="text-sm text-muted-foreground">{t('settings.site.reduceMotionDesc')}</div>
                </div>
                <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
              </div>

              <div className="flex items-start justify-between gap-4 py-2">
                <div>
                  <div className="text-foreground font-medium">{t('settings.site.compactLayoutLabel')}</div>
                  <div className="text-sm text-muted-foreground">{t('settings.site.compactLayoutDesc')}</div>
                </div>
                <Switch checked={compactLayout} onCheckedChange={setCompactLayout} />
              </div>
            </div>

            <Separator />

            {/* Admin Panel link - visible to admins only */}
            {isAdmin && (
              <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="text-foreground font-medium">{lang === 'ar' ? 'إدارة النظام' : 'Admin Panel'}</div>
                </div>
                <a href="/admin" className="text-primary hover:underline text-sm">{t('common.actions.open', 'Open')}</a>
              </div>
            )}

            <Separator />

            {/* Account link inside settings */}
            <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="text-foreground font-medium">{t('pages.account.title', 'My account')}</div>
              </div>
              <a href="/account" className="text-primary hover:underline text-sm">{t('common.actions.open', 'Open')}</a>
            </div>

            <Separator />

            {/* Help link inside settings */}
            <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <div className="text-foreground font-medium">{t('pages.help.title')}</div>
              </div>
              <a href="/help" className="text-primary hover:underline text-sm">{t('common.actions.open', 'Open')}</a>
            </div>

            <Separator />

            <div>
              <button onClick={reset} className="px-4 py-2 rounded-md border border-border hover:bg-muted text-sm">
                {t('settings.reset')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SettingsPage; 