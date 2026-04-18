import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../../../lib/i18n';
import api from '@/services/api';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, FileText, ListOrdered } from 'lucide-react';

const ProgramDetailsViewPage = () => {
	const { programId } = useParams();
	const navigate = useNavigate();
	const { lang } = useI18n();
	const isRtl = lang === 'ar';
	
	const [program, setProgram] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const loadProgramData = async () => {
			try {
				setLoading(true);
				setError(null);
				const data = await api.getProgram(programId);
				setProgram(data);
			} catch (err) {
				console.error('Error loading program data:', err);
				setError(lang === 'ar' ? 'فشل في تحميل بيانات البرنامج' : 'Failed to load program data');
			} finally {
				setLoading(false);
			}
		};
		if (programId) loadProgramData();
	}, [programId, lang]);

	const handleBackToList = () => {
		navigate('/programs-details');
	};

	if (loading) {
		return (
			<section className="relative isolate overflow-hidden min-h-screen">
				<div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
				<div className="absolute inset-0 z-0 bg-black/50" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
					<div className="text-center text-white">
						<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
						<p className="text-xl">{lang === 'ar' ? 'جاري تحميل بيانات البرنامج...' : 'Loading program data...'}</p>
					</div>
				</div>
			</section>
		);
	}

	if (error || !program) {
		return (
			<section className="relative isolate overflow-hidden min-h-screen">
				<div className="absolute inset-0 -z-10 animated-gradient opacity-90" />
				<div className="absolute inset-0 z-0 bg-black/50" />
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10 flex items-center justify-center">
					<div className="text-center text-white">
						<div className="bg-red-900/50 p-8 rounded-lg border border-red-500/30 max-w-2xl">
							<h3 className="text-2xl font-semibold mb-4 text-red-300">
								{lang === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error Loading Data'}
							</h3>
							<p className="text-red-200 mb-6">{error || (lang === 'ar' ? 'البرنامج غير موجود' : 'Program not found')}</p>
							<div className="space-y-3">
								<Button onClick={handleBackToList} className="mr-3">
									{lang === 'ar' ? 'العودة إلى القائمة' : 'Back to List'}
								</Button>
								<Button onClick={() => window.location.reload()} variant="outline">
									{lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
								</Button>
							</div>
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
				<motion.div 
					initial={{ opacity: 0, y: 20 }} 
					animate={{ opacity: 1, y: 0 }} 
					transition={{ duration: 0.6 }}
					className="space-y-8"
				>
					<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
						<div className="flex-1">
							<Button 
								onClick={handleBackToList}
								variant="outline" 
								className="mb-4 bg-white/20 text-white border-white/50 hover:bg-white/30 hover:border-white/70 backdrop-blur-sm"
							>
								<ArrowLeft className="h-4 w-4 mr-2" />
								{lang === 'ar' ? 'العودة إلى القائمة' : 'Back to List'}
							</Button>
							
							<h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
								{program.sessionNameL1 || program.SessionNameL1 || program.id}
							</h1>
							
							{program.sessionNameL2 || program.SessionNameL2 ? (
								<p className="text-xl text-gray-300 mb-2">
									{program.sessionNameL2 || program.SessionNameL2}
								</p>
							) : null}
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2 space-y-6">
							<motion.div 
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 }}
								className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
							>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
										<FileText className="h-5 w-5 text-white" />
									</div>
									<h2 className="text-2xl font-bold text-gray-800">
										{lang === 'ar' ? 'وصف البرنامج' : 'Program Description'}
									</h2>
								</div>
								<p className="text-gray-700 leading-relaxed text-lg">
									{program.description || program.Description || 
										(lang === 'ar' ? 'لا يوجد وصف متاح لهذا البرنامج.' : 'No description available for this program.')}
								</p>
							</motion.div>
						</div>
						<div className="space-y-6">
							<motion.div 
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.4 }}
								className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
							>
								<div className="flex items-center gap-3 mb-4">
									<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
										<ListOrdered className="h-5 w-5 text-white" />
									</div>
									<h3 className="text-xl font-bold text-gray-800">
										{lang === 'ar' ? 'معلومات البرنامج' : 'Program Info'}
									</h3>
								</div>
								<div className="space-y-3">
									<div>
										<p className="text-sm text-gray-600">{lang === 'ar' ? 'رقم الجلسة' : 'Session No'}</p>
										<p className="font-semibold text-gray-800">{program.sessionNo || program.SessionNo || (lang === 'ar' ? 'غير محدد' : 'Not specified')}</p>
									</div>
								</div>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default ProgramDetailsViewPage; 