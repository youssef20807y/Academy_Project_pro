import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../../../lib/i18n';
import { useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Play, Video, Calendar as CalendarIcon, Edit as EditIcon, Trash2, Plus } from 'lucide-react';

const VideoGalleryPage = () => {
	const { lang } = useI18n();
	const isRtl = lang === 'ar';
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	
	// قراءة معاملات URL للأكاديمية والفرع
	const academyId = searchParams.get('academy');
	const branchId = searchParams.get('branch');
	
	console.log('🔍 URL Parameters - Academy:', academyId, 'Branch:', branchId);
	
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [editing, setEditing] = useState(null);
	const [editForm, setEditForm] = useState({ SessionVideo: '', Description: '', ProgramsContentMasterId: '' });
	const [saving, setSaving] = useState(false);
	const [masters, setMasters] = useState([]);

	useEffect(() => {
		try {
			const user = JSON.parse(localStorage.getItem('userData') || '{}');
			const userEmail = localStorage.getItem('userEmail') || '';
			const role = user.role || user.Role || '';
			const admin = role === 'SupportAgent' || role === 'Admin' || role === 'admin' || userEmail === 'yjmt469999@gmail.com';
			setIsAdmin(admin);
		} catch (_) { setIsAdmin(false); }
	}, []);

	const load = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await api.getProgramsContentDetail().catch(() => []);
			const list = Array.isArray(data) ? data : [];
			
			console.log('ℹ️ Showing all videos without filtering');
			
			const withVideos = list
				.map(r => ({
					id: r.id || r.Id,
					raw: r,
					title: r.SessionNameL1 || r.sessionNameL1 || r.SessionNameL2 || r.sessionNameL2 || r.Description || 'Session',
					description: r.Description || r.description || '',
					video: r.SessionVideo || r.sessionVideo || '',
					date: r.sessionDate || r.date || r.createdAt || r.updatedAt || null,
				}))
				.filter(r => r.video && String(r.video).trim() !== '');
			setItems(withVideos);
		} catch (e) {
			setError(lang === 'ar' ? 'تعذر تحميل الفيديوهات' : 'Failed to load videos');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, [lang]);

	useEffect(() => {
		// Load programs content masters for selector
		api.getProgramsContentMaster()
			.then((res) => {
				const raw = res?.data ?? res;
				const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.items) ? raw.items : []);
				setMasters(list);
			})
			.catch(() => setMasters([]));
	}, []);

	const openEdit = (item) => {
		const detectedMaster = item.raw?.ProgramsContentMasterId || item.raw?.programsContentMasterId || item.raw?.ProgramsContentMaster?.Id || item.raw?.programsContentMaster?.id || '';
		setEditing(item);
		setEditForm({ SessionVideo: item.video || '', Description: item.description || '', ProgramsContentMasterId: detectedMaster || (masters[0]?.id || masters[0]?.Id || '') });
	};

	const saveEdit = async () => {
		if (!editing) return;
		setSaving(true);
		try {
			// resolve selected vs original master id
			const originalMaster = editing.raw?.ProgramsContentMasterId || editing.raw?.programsContentMasterId || editing.raw?.ProgramsContentMaster?.Id || editing.raw?.programsContentMaster?.id || '';
			const selectedMaster = editForm.ProgramsContentMasterId || originalMaster;
			if (!selectedMaster) {
				alert(lang==='ar'?'يرجى اختيار البرنامج الرئيسي':'Please select a Program Master');
				setSaving(false);
				return;
			}

			// Validate that the chosen master exists on backend
			let masterToUse = selectedMaster;
			const validateMaster = async (id) => {
				try {
					if (!id) return false;
					await api.getProgramContentMaster(id);
					return true;
				} catch (e) {
					return false;
				}
			};

			let masterIsValid = await validateMaster(masterToUse);
			if (!masterIsValid) {
				// try to fallback to first available master from list
				const fallbackId = masters[0]?.id || masters[0]?.Id || '';
				if (fallbackId && await validateMaster(fallbackId)) {
					masterToUse = fallbackId;
					// update form control so user sees new selection
					setEditForm(prev => ({ ...prev, ProgramsContentMasterId: masterToUse }));
				} else {
					alert(lang==='ar'?'المعرف المختار للبرنامج غير موجود. يرجى اختيار برنامج صالح من القائمة.':'Selected Program Master ID does not exist. Please choose a valid program from the list.');
					setSaving(false);
					return;
				}
			}

			// build payload we'll create with
			const newDetailPayload = {
				ProgramsContentMasterId: masterToUse,
				SessionVideo: editForm.SessionVideo,
				Description: editForm.Description,
			};

			// Always use create-then-delete to avoid EF key modification errors
			await api.createProgramContentDetail(newDetailPayload);

			try {
				await api.deleteProgramContentDetail(editing.id);
			} catch (delErr) {
				const delBody = delErr && delErr.body ? String(delErr.body) : '';
				const isDeleteFileFailed = delErr && delErr.status === 400 && delBody.includes('Delete.FileFailed');
				if (isDeleteFileFailed) {
					const originalMasterId = originalMaster || masterToUse;
					try { await api.updateProgramContentDetail(editing.id, { 
						SessionQuiz: new Blob([]),
						SessionTasks: new Blob([]),
						SessionProject: new Blob([]),
						ScientificMaterial: new Blob([]),
					}); } catch (_) {}
					try { await api.deleteProgramContentDetail(editing.id); } catch (_) {}
				} else {
					throw delErr;
				}
			}

			setEditing(null);
			await load();
		} catch (e) {
			alert(
				lang==='ar'
					? 'تعذر حفظ التعديلات. تحقق من وجود البرنامج الرئيسي المرتبط.'
					: 'Failed to save changes. Please ensure the linked program master exists.'
			);
		} finally {
			setSaving(false);
		}
	};

	const deleteItem = async (item) => {
		if (!confirm(lang==='ar'?'تأكيد حذف هذا المحتوى؟':'Confirm delete this content?')) return;
		try {
			await api.deleteProgramContentDetail(item.id);
			await load();
		} catch (e) {
			const body = e && e.body ? String(e.body) : '';
			const isDeleteFileFailed = e && e.status === 400 && body.includes('Delete.FileFailed');
			if (isDeleteFileFailed) {
				const originalMasterId = item.raw?.ProgramsContentMasterId || item.raw?.programsContentMasterId || item.raw?.ProgramsContentMaster?.Id || item.raw?.programsContentMaster?.id || '';
				try {
					await api.updateProgramContentDetail(item.id, {
						SessionQuiz: new Blob([]),
						SessionTasks: new Blob([]),
						SessionProject: new Blob([]),
						ScientificMaterial: new Blob([]),
					});
				} catch (_) {}
				try {
					await api.deleteProgramContentDetail(item.id);
					await load();
					return;
				} catch (_) {}
			}
			alert(lang==='ar'?'تعذر الحذف':'Failed to delete');
		}
	};

	if (loading) {
		return (
			<section className="relative isolate overflow-hidden min-h-screen">
				<div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
				<div className="absolute inset-0 z-0 bg-black/50" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
					<div className="text-center text-white">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
						<p className="text-xl">{lang === 'ar' ? 'جاري تحميل الفيديوهات...' : 'Loading videos...'}</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="relative isolate overflow-hidden min-h-screen">
			<div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
			<div className="absolute inset-0 z-0 bg-black/50" />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10" dir={isRtl ? 'rtl' : 'ltr'}>
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
					<div className="flex items-center justify-between mb-8">
						<h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
							<Video className="w-7 h-7" />
							{lang === 'ar' ? 'معرض الفيديوهات' : 'Video Gallery'}
						</h1>
						{isAdmin && (
							<Button onClick={() => navigate('/content-upload')} className="bg-emerald-600 hover:bg-emerald-700 rounded-full">
								<Plus className="w-4 h-4 mr-2" />
								{lang==='ar'?'إضافة محتوى':'Add Content'}
							</Button>
						)}
					</div>

					{error && (
						<p className="text-red-300 mb-6">{error}</p>
					)}

					{items.length === 0 ? (
						<div className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center text-white">
							<p className="text-lg">{lang === 'ar' ? 'لا توجد فيديوهات متاحة حالياً' : 'No videos available yet'}</p>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{items.map(item => (
								<motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex flex-col">
									<div className="flex items-start justify-between gap-3 mb-3">
										<h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.title}</h3>
										<span className="text-xs text-gray-500 inline-flex items-center gap-1">
											<CalendarIcon className="w-3.5 h-3.5" />
											{item.date ? new Date(item.date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : (lang === 'ar' ? 'غير محدد' : 'Not specified')}
										</span>
									</div>
									<p className="text-sm text-gray-700 line-clamp-3 mb-4">{item.description}</p>
									<div className="mt-auto flex items-center justify-between gap-2">
										<Link to={`/videos/${item.id}`}>
											<Button className="bg-primary hover:bg-primary/90">
												<Play className="w-4 h-4 mr-2" />
												{lang === 'ar' ? 'تشغيل' : 'Watch'}
											</Button>
										</Link>
										{isAdmin && (
											<div className="flex items-center gap-2">
												<Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => openEdit(item)}>
													<EditIcon className="w-4 h-4 mr-1" />
													{lang==='ar'?'تعديل':'Edit'}
												</Button>
												<Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50" onClick={() => deleteItem(item)}>
													<Trash2 className="w-4 h-4 mr-1" />
													{lang==='ar'?'حذف':'Delete'}
												</Button>
											</div>
										)}
									</div>
								</motion.div>
							))}
						</div>
					)}

					{/* Edit Dialog (simple inline) */}
					{isAdmin && editing && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
							<div className="bg-white rounded-2xl p-6 w-full max-w-lg">
								<h3 className="text-xl font-semibold mb-4">{lang==='ar'?'تعديل محتوى الجلسة':'Edit Session Content'}</h3>
								<div className="space-y-3">
									<label className="block text-sm font-medium">{lang==='ar'?'رابط الفيديو':'Video URL'}</label>
									<input className="w-full border rounded px-3 py-2" value={editForm.SessionVideo} onChange={(e)=>setEditForm(prev=>({...prev, SessionVideo: e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." />
									<label className="block text-sm font-medium">{lang==='ar'?'الوصف':'Description'}</label>
									<input className="w-full border rounded px-3 py-2" value={editForm.Description} onChange={(e)=>setEditForm(prev=>({...prev, Description: e.target.value}))} />
									<label className="block text-sm font-medium">{lang==='ar'?'البرنامج الرئيسي':'Program Master'}</label>
									<select className="w-full border rounded px-3 py-2" value={editForm.ProgramsContentMasterId} onChange={(e)=>setEditForm(prev=>({...prev, ProgramsContentMasterId: e.target.value}))}>
										<option value="">{lang==='ar'?'اختر برنامجاً':'Select a program'}</option>
										{masters.map(m => (
											<option key={(m.id||m.Id)} value={(m.id||m.Id)}>{m.SessionNameL1 || m.sessionNameL1 || m.SessionNameL2 || m.sessionNameL2 || m.Description || (m.id||m.Id)}</option>
										))}
									</select>
								</div>
								<div className="mt-5 flex justify-end gap-2">
									<Button variant="outline" onClick={()=>setEditing(null)}>{lang==='ar'?'إلغاء':'Cancel'}</Button>
									<Button onClick={saveEdit} disabled={saving} className="bg-primary hover:bg-primary/90">{saving ? (lang==='ar'?'جارٍ الحفظ...':'Saving...') : (lang==='ar'?'حفظ':'Save')}</Button>
								</div>
							</div>
						</div>
					)}
				</motion.div>
			</div>
		</section>
	);
};

export default VideoGalleryPage; 