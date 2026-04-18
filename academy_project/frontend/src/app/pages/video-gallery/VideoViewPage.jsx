import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../../lib/i18n';
import api from '@/services/api';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const getEmbedUrl = (url) => {
	if (!url) return '';
	try {
		const u = new URL(url);
		// YouTube
		if (u.hostname.includes('youtube.com')) {
			const id = u.searchParams.get('v');
			return id ? `https://www.youtube.com/embed/${id}` : '';
		}
		if (u.hostname.includes('youtu.be')) {
			const id = u.pathname.replace('/', '');
			return id ? `https://www.youtube.com/embed/${id}` : '';
		}
		// Vimeo
		if (u.hostname.includes('vimeo.com')) {
			const id = u.pathname.split('/').filter(Boolean)[0];
			return id ? `https://player.vimeo.com/video/${id}` : '';
		}
		// Direct mp4 or others
		return url;
	} catch {
		return url;
	}
};

const VideoViewPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { lang } = useI18n();
	const isRtl = lang === 'ar';

	const [row, setRow] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await api.getProgramContentDetail(id);
				setRow(data);
			} catch (e) {
				setError(lang === 'ar' ? 'تعذر تحميل الفيديو' : 'Failed to load video');
			} finally {
				setLoading(false);
			}
		};
		if (id) load();
	}, [id, lang]);

	const title = row?.SessionNameL1 || row?.sessionNameL1 || row?.SessionNameL2 || row?.sessionNameL2 || row?.Description || 'Session';
	const description = row?.Description || row?.description || '';
	const videoUrl = row?.SessionVideo || row?.sessionVideo || '';
	const embedUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);

	if (loading) {
		return (
			<section className="relative isolate overflow-hidden min-h-screen">
				<div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
				<div className="absolute inset-0 z-0 bg-black/50" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
					<div className="text-center text-white">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
						<p className="text-xl">{lang === 'ar' ? 'جاري تحميل الفيديو...' : 'Loading video...'}</p>
					</div>
				</div>
			</section>
		);
	}

	if (error || !row) {
		return (
			<section className="relative isolate overflow-hidden min-h-screen">
				<div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
				<div className="absolute inset-0 z-0 bg-black/50" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
					<div className="text-center text-white">
						<div className="bg-red-900/50 p-8 rounded-lg border border-red-500/30 max-w-2xl">
							<h3 className="text-2xl font-semibold mb-4 text-red-300">{lang === 'ar' ? 'حدث خطأ' : 'Error'}</h3>
							<p className="text-red-200 mb-6">{error || (lang === 'ar' ? 'الفيديو غير موجود' : 'Video not found')}</p>
							<Button onClick={() => navigate(-1)}>{lang === 'ar' ? 'رجوع' : 'Back'}</Button>
						</div>
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
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
					<div>
						<Button onClick={() => navigate(-1)} variant="outline" className="mb-3 bg-white/20 text-white border-white/50 hover:bg-white/30 hover:border-white/70 backdrop-blur-sm">
							<ArrowLeft className="h-4 w-4 mr-2" />
							{lang === 'ar' ? 'رجوع' : 'Back'}
						</Button>
						<h1 className="text-3xl sm:text-4xl font-extrabold text-white">{title}</h1>
					</div>

					<div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
						{embedUrl && embedUrl.startsWith('http') && (embedUrl.includes('youtube.com') || embedUrl.includes('player.vimeo.com')) ? (
							<div className="aspect-video w-full">
								<iframe
									src={embedUrl}
									title="session video"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
									className="w-full h-full rounded-lg"
								/>
							</div>
						) : (
							<video controls className="w-full rounded-lg" src={embedUrl || videoUrl} />
						)}
					</div>

					{description ? (
						<div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
							<p className="text-gray-800 text-lg">{description}</p>
						</div>
					) : null}
				</motion.div>
			</div>
		</section>
	);
};

export default VideoViewPage; 