import React from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import api from '@/services/api';
import { useI18n } from '../lib/i18n';

const BranchCard = ({ branch, t, lang }) => {
  const isAr = lang === 'ar';
  return (
    <div className="academy-card p-5 rounded-2xl bg-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{branch.branchNameL1 || branch.branchNameL2}</h3>
          <p className="text-sm text-muted-foreground">{branch.branchAddress}</p>
        </div>
        <div className="text-sm text-muted-foreground text-right">
          {branch.branchMobile && <div>{t('branches.card.mobile')}: {branch.branchMobile}</div>}
          {branch.branchPhone && <div>{t('branches.card.phone')}: {branch.branchPhone}</div>}
          {branch.branchWhatsapp && <div>{t('branches.card.whatsapp')}: {branch.branchWhatsapp}</div>}
          {branch.branchEmail && <div>{t('branches.card.email')}: {branch.branchEmail}</div>}
        </div>
      </div>
    </div>
  );
};

const BranchesPage = () => {
  const { t, lang } = useI18n();
  const isRtl = lang === 'ar';
  const [loading, setLoading] = React.useState(true);
  const [branches, setBranches] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const [academyId, setAcademyId] = React.useState('');
  const [governorateId, setGovernorateId] = React.useState('');
  const [cityId, setCityId] = React.useState('');
  const [governorates, setGovernorates] = React.useState([]);
  const [cities, setCities] = React.useState([]);

  const fetchBranches = React.useCallback(async () => {
    setLoading(true);
    try {
      let data = [];
              if (academyId) data = await api.getBranchesByAcademy(academyId, { silent: true }).catch(() => []);
        else if (governorateId) data = await api.getBranchesByGovernorate(governorateId, { silent: true }).catch(() => []);
        else if (cityId) data = await api.getBranchesByCity(cityId, { silent: true }).catch(() => []);
        else data = await api.getBranches({ silent: true }).catch(() => []);
      setBranches(Array.isArray(data) ? data : []);
    } catch (_) {
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, [academyId, governorateId, cityId]);

  React.useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  React.useEffect(() => {
    const loadLocations = async () => {
      try {
        const govs = await api.getGovernorates({ silent: true }).catch(() => []);
        setGovernorates(Array.isArray(govs) ? govs : []);
      } catch (_) {}
    };
    loadLocations();
  }, []);

  React.useEffect(() => {
    const loadCities = async () => {
      if (!governorateId) { setCities([]); return; }
      try {
        const list = await api.getCities({ silent: true }).catch(() => []);
        setCities(Array.isArray(list) ? list.filter(c => c.governorateCodeId === governorateId) : []);
      } catch (_) {}
    };
    loadCities();
  }, [governorateId]);

  const filtered = React.useMemo(() => {
    if (!query) return branches;
    const q = query.toLowerCase();
    return branches.filter(b =>
      (b.branchNameL1 || '').toLowerCase().includes(q) ||
      (b.branchNameL2 || '').toLowerCase().includes(q) ||
      (b.branchAddress || '').toLowerCase().includes(q) ||
      (b.branchMobile || '').toLowerCase().includes(q)
    );
  }, [branches, query]);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
      <div className="absolute inset-0 z-0 bg-black/45" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t('branches.title')}</h1>
          <p className="text-white/90 mb-6">{t('branches.subtitle')}</p>

          <div className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border border-border rounded-2xl p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('branches.searchLabel')}</label>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('branches.searchPlaceholder')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('branches.governorateLabel')}</label>
                <Select value={governorateId} onValueChange={(v) => { setGovernorateId(v); setCityId(''); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('branches.governoratePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {governorates.map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.governorateNameL1 || g.governorateNameL2}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">{t('branches.cityLabel')}</label>
                <Select value={cityId} onValueChange={setCityId} disabled={!governorateId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('branches.cityPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {cities.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.cityNameL1 || c.cityNameL2}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchBranches} className="flex-1">{t('branches.refreshBtn')}</Button>
                <Button variant="ghost" onClick={() => { setQuery(''); setAcademyId(''); setGovernorateId(''); setCityId(''); }} className="flex-1">{t('branches.resetBtn')}</Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-14">{t('branches.loading')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((b) => (
                <BranchCard key={b.id} branch={b} t={t} lang={lang} />
              ))}
              {!filtered.length && (
                <div className="text-center text-muted-foreground col-span-full py-10">{t('branches.empty')}</div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default BranchesPage; 