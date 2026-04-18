import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../../../lib/i18n';
import api from '@/services/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { UploadCloud } from 'lucide-react';

const ContentUploadPage = () => {
	const { lang } = useI18n();
	const isRtl = lang === 'ar';

	const [masters, setMasters] = useState([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [form, setForm] = useState({
		ProgramsContentMasterId: '',
		SessionVideo: '',
		Description: '',
		SessionTasks: null,
		SessionProject: null,
		ScientificMaterial: null,
		SessionQuiz: null
	});

	useEffect(() => {
		const loadMasters = async () => {
			try {
				setLoading(true);
				const data = await api.getPrograms({ silent: true }).catch(() => []);
				setMasters(Array.isArray(data) ? data : []);
			} catch {
				setMasters([]);
			} finally {
				setLoading(false);
			}
		};
		loadMasters();
	}, [lang]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.ProgramsContentMasterId) { alert(lang==='ar'?'اختر البرنامج الرئيسي':'Select Program Master'); return; }
		setSaving(true);
		setError(null);
		try {
			await api.createProgramContentDetail(form);
			setForm({ ProgramsContentMasterId: '', SessionVideo: '', Description: '', SessionTasks: null, SessionProject: null, ScientificMaterial: null, SessionQuiz: null });
			alert(lang==='ar'?'تم الحفظ بنجاح':'Saved successfully');
		} catch (e) {
			setError(lang==='ar'?'فشل حفظ المحتوى':'Failed to save content');
		} finally {
			setSaving(false);
		}
	};

	return (
		<section className="relative isolate overflow-hidden min-h-screen">
			<div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
			<div className="absolute inset-0 z-0 bg-black/50" />
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
					<h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-8 flex items-center gap-2">
						<UploadCloud className="w-7 h-7" />
						{lang === 'ar' ? 'رفع محتوى الجلسات' : 'Upload Session Content'}
					</h1>

					{error && <p className="text-red-300 mb-4">{error}</p>}

					<form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-5">
						<div>
							<Label>{lang==='ar'?'البرنامج الرئيسي':'Program Master'} *</Label>
							<Select value={form.ProgramsContentMasterId} onValueChange={(v)=>setForm(prev=>({...prev, ProgramsContentMasterId: v}))}>
								<SelectTrigger className="bg-white/90 text-gray-800">
									<SelectValue placeholder={loading ? (lang==='ar'?'جاري التحميل...':'Loading...') : (lang==='ar'?'اختر البرنامج':'Select program')} />
								</SelectTrigger>
								<SelectContent>
									{masters.map(m => (
										<SelectItem key={(m.id||m.Id)} value={(m.id||m.Id)}>
											{m.SessionNameL1 || m.sessionNameL1 || m.SessionNameL2 || m.sessionNameL2 || m.Description || (m.id||m.Id)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>{lang==='ar'?'رابط الفيديو (اختياري)':'Video URL (optional)'}</Label>
							<Input type="url" value={form.SessionVideo} onChange={(e)=>setForm(prev=>({...prev, SessionVideo: e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." />
						</div>

						<div>
							<Label>{lang==='ar'?'الوصف':'Description'}</Label>
							<Input value={form.Description} onChange={(e)=>setForm(prev=>({...prev, Description: e.target.value}))} />
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<Label>{lang==='ar'?'مهام الجلسة (PDF)':'Session Tasks (PDF)'}</Label>
								<Input type="file" accept=".pdf,.doc,.docx" onChange={(e)=>setForm(prev=>({...prev, SessionTasks: e.target.files?.[0] || null}))} />
							</div>
							<div>
								<Label>{lang==='ar'?'مشروع الجلسة (PDF)':'Session Project (PDF)'}</Label>
								<Input type="file" accept=".pdf,.doc,.docx" onChange={(e)=>setForm(prev=>({...prev, SessionProject: e.target.files?.[0] || null}))} />
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<Label>{lang==='ar'?'المواد العلمية (PDF)':'Scientific Material (PDF)'}</Label>
								<Input type="file" accept=".pdf,.doc,.docx" onChange={(e)=>setForm(prev=>({...prev, ScientificMaterial: e.target.files?.[0] || null}))} />
							</div>
							<div>
								<Label>{lang==='ar'?'اختبار الجلسة (PDF)':'Session Quiz (PDF)'}</Label>
								<Input type="file" accept=".pdf,.doc,.docx" onChange={(e)=>setForm(prev=>({...prev, SessionQuiz: e.target.files?.[0] || null}))} />
							</div>
						</div>

						<div className="flex justify-end">
							<Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
								{saving ? (lang==='ar'?'جارٍ الحفظ...':'Saving...') : (lang==='ar'?'حفظ':'Save')}
							</Button>
						</div>
					</form>
				</motion.div>
			</div>
		</section>
	);
};

export default ContentUploadPage; 