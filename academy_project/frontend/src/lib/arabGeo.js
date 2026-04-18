// Fallback Arabic geo data for selects when API lists are empty
// Countries: full Arab League list; governorates/cities: representative samples per country

export const arabCountries = [
	{ nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
	{ nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة' },
	{ nameEn: 'Qatar', nameAr: 'قطر' },
	{ nameEn: 'Kuwait', nameAr: 'الكويت' },
	{ nameEn: 'Bahrain', nameAr: 'البحرين' },
	{ nameEn: 'Oman', nameAr: 'عُمان' },
	{ nameEn: 'Yemen', nameAr: 'اليمن' },
	{ nameEn: 'Jordan', nameAr: 'الأردن' },
	{ nameEn: 'Lebanon', nameAr: 'لبنان' },
	{ nameEn: 'Syria', nameAr: 'سوريا' },
	{ nameEn: 'Iraq', nameAr: 'العراق' },
	{ nameEn: 'Egypt', nameAr: 'مصر' },
	{ nameEn: 'Sudan', nameAr: 'السودان' },
	{ nameEn: 'Libya', nameAr: 'ليبيا' },
	{ nameEn: 'Tunisia', nameAr: 'تونس' },
	{ nameEn: 'Algeria', nameAr: 'الجزائر' },
	{ nameEn: 'Morocco', nameAr: 'المغرب' },
	{ nameEn: 'Mauritania', nameAr: 'موريتانيا' },
	{ nameEn: 'Somalia', nameAr: 'الصومال' },
	{ nameEn: 'Djibouti', nameAr: 'جيبوتي' },
	{ nameEn: 'Comoros', nameAr: 'جزر القمر' },
	{ nameEn: 'Palestine', nameAr: 'فلسطين' }
];

// Governorates by country (subset, representative)
export const arabGovernoratesByCountry = {
	'Egypt': [
		{ nameEn: 'Cairo', nameAr: 'القاهرة' },
		{ nameEn: 'Giza', nameAr: 'الجيزة' },
		{ nameEn: 'Alexandria', nameAr: 'الإسكندرية' },
		{ nameEn: 'Dakahlia', nameAr: 'الدقهلية' },
		{ nameEn: 'Sharqia', nameAr: 'الشرقية' }
	],
	'Saudi Arabia': [
		{ nameEn: 'Riyadh', nameAr: 'الرياض' },
		{ nameEn: 'Makkah', nameAr: 'مكة المكرمة' },
		{ nameEn: 'Madinah', nameAr: 'المدينة المنورة' },
		{ nameEn: 'Eastern Province', nameAr: 'المنطقة الشرقية' },
		{ nameEn: 'Asir', nameAr: 'عسير' }
	],
	'United Arab Emirates': [
		{ nameEn: 'Abu Dhabi', nameAr: 'أبوظبي' },
		{ nameEn: 'Dubai', nameAr: 'دبي' },
		{ nameEn: 'Sharjah', nameAr: 'الشارقة' },
		{ nameEn: 'Ajman', nameAr: 'عجمان' }
	],
	'Jordan': [
		{ nameEn: 'Amman', nameAr: 'عمّان' },
		{ nameEn: 'Irbid', nameAr: 'إربد' },
		{ nameEn: 'Zarqa', nameAr: 'الزرقاء' }
	],
	'Morocco': [
		{ nameEn: 'Rabat-Salé-Kénitra', nameAr: 'الرباط سلا القنيطرة' },
		{ nameEn: 'Casablanca-Settat', nameAr: 'الدار البيضاء سطات' },
		{ nameEn: 'Marrakesh-Safi', nameAr: 'مراكش آسفي' }
	],
	'Algeria': [
		{ nameEn: 'Algiers', nameAr: 'الجزائر' },
		{ nameEn: 'Oran', nameAr: 'وهران' },
		{ nameEn: 'Constantine', nameAr: 'قسنطينة' }
	],
	'Tunisia': [
		{ nameEn: 'Tunis', nameAr: 'تونس' },
		{ nameEn: 'Sfax', nameAr: 'صفاقس' },
		{ nameEn: 'Sousse', nameAr: 'سوسة' }
	],
	'Iraq': [
		{ nameEn: 'Baghdad', nameAr: 'بغداد' },
		{ nameEn: 'Basra', nameAr: 'البصرة' },
		{ nameEn: 'Nineveh', nameAr: 'نينوى' }
	],
	'Sudan': [
		{ nameEn: 'Khartoum', nameAr: 'الخرطوم' },
		{ nameEn: 'Al Jazirah', nameAr: 'الجزيرة' },
		{ nameEn: 'Red Sea', nameAr: 'البحر الأحمر' }
	],
	'Libya': [
		{ nameEn: 'Tripoli', nameAr: 'طرابلس' },
		{ nameEn: 'Benghazi', nameAr: 'بنغازي' },
		{ nameEn: 'Misrata', nameAr: 'مصراتة' }
	],
	'Yemen': [
		{ nameEn: 'Sana\'a', nameAr: 'صنعاء' },
		{ nameEn: 'Aden', nameAr: 'عدن' },
		{ nameEn: 'Taiz', nameAr: 'تعز' }
	],
	'Lebanon': [
		{ nameEn: 'Beirut', nameAr: 'بيروت' },
		{ nameEn: 'Mount Lebanon', nameAr: 'جبل لبنان' },
		{ nameEn: 'North', nameAr: 'الشمال' }
	],
	'Syria': [
		{ nameEn: 'Damascus', nameAr: 'دمشق' },
		{ nameEn: 'Aleppo', nameAr: 'حلب' },
		{ nameEn: 'Homs', nameAr: 'حمص' }
	],
	'Qatar': [
		{ nameEn: 'Doha', nameAr: 'الدوحة' },
		{ nameEn: 'Al Rayyan', nameAr: 'الريان' }
	],
	'Kuwait': [
		{ nameEn: 'Al Asimah', nameAr: 'العاصمة' },
		{ nameEn: 'Hawalli', nameAr: 'حولي' }
	],
	'Bahrain': [
		{ nameEn: 'Capital', nameAr: 'العاصمة' },
		{ nameEn: 'Muharraq', nameAr: 'المحرق' }
	],
	'Oman': [
		{ nameEn: 'Muscat', nameAr: 'مسقط' },
		{ nameEn: 'Dhofar', nameAr: 'ظفار' }
	],
	'Palestine': [
		{ nameEn: 'Gaza', nameAr: 'غزة' },
		{ nameEn: 'West Bank', nameAr: 'الضفة الغربية' }
	],
	'Mauritania': [
		{ nameEn: 'Nouakchott', nameAr: 'نواكشوط' },
		{ nameEn: 'Trarza', nameAr: 'ترارزة' }
	],
	'Somalia': [
		{ nameEn: 'Benadir', nameAr: 'بنادر' },
		{ nameEn: 'Puntland', nameAr: 'بونتلاند' }
	],
	'Djibouti': [
		{ nameEn: 'Djibouti', nameAr: 'جيبوتي' },
		{ nameEn: 'Arta', nameAr: 'أرتا' }
	],
	'Comoros': [
		{ nameEn: 'Grande Comore', nameAr: 'القمر الكبرى' },
		{ nameEn: 'Anjouan', nameAr: 'أنجوان' }
	]
};

// Cities by governorate (subset)
export const arabCitiesByGovernorate = {
	'Egypt|Cairo': [ { nameEn: 'Cairo', nameAr: 'القاهرة' }, { nameEn: 'Helwan', nameAr: 'حلوان' } ],
	'Egypt|Giza': [ { nameEn: 'Giza', nameAr: 'الجيزة' }, { nameEn: 'Sheikh Zayed', nameAr: 'الشيخ زايد' } ],
	'Egypt|Alexandria': [ { nameEn: 'Alexandria', nameAr: 'الإسكندرية' } ],
	'Saudi Arabia|Riyadh': [ { nameEn: 'Riyadh', nameAr: 'الرياض' }, { nameEn: 'Al Kharj', nameAr: 'الخرج' } ],
	'Saudi Arabia|Makkah': [ { nameEn: 'Makkah', nameAr: 'مكة' }, { nameEn: 'Jeddah', nameAr: 'جدة' } ],
	'Saudi Arabia|Eastern Province': [ { nameEn: 'Dammam', nameAr: 'الدمام' }, { nameEn: 'Khobar', nameAr: 'الخبر' } ],
	'United Arab Emirates|Abu Dhabi': [ { nameEn: 'Abu Dhabi', nameAr: 'أبوظبي' }, { nameEn: 'Al Ain', nameAr: 'العين' } ],
	'United Arab Emirates|Dubai': [ { nameEn: 'Dubai', nameAr: 'دبي' } ],
	'Jordan|Amman': [ { nameEn: 'Amman', nameAr: 'عمّان' } ],
	'Morocco|Rabat-Salé-Kénitra': [ { nameEn: 'Rabat', nameAr: 'الرباط' }, { nameEn: 'Salé', nameAr: 'سلا' } ],
	'Algeria|Algiers': [ { nameEn: 'Algiers', nameAr: 'الجزائر' } ],
	'Tunisia|Tunis': [ { nameEn: 'Tunis', nameAr: 'تونس' } ],
	'Iraq|Baghdad': [ { nameEn: 'Baghdad', nameAr: 'بغداد' } ],
	'Sudan|Khartoum': [ { nameEn: 'Khartoum', nameAr: 'الخرطوم' } ],
	'Libya|Tripoli': [ { nameEn: 'Tripoli', nameAr: 'طرابلس' } ],
	'Yemen|Sana\'a': [ { nameEn: 'Sana\'a', nameAr: 'صنعاء' } ],
	'Lebanon|Beirut': [ { nameEn: 'Beirut', nameAr: 'بيروت' } ],
	'Syria|Damascus': [ { nameEn: 'Damascus', nameAr: 'دمشق' } ],
	'Qatar|Doha': [ { nameEn: 'Doha', nameAr: 'الدوحة' } ],
	'Kuwait|Al Asimah': [ { nameEn: 'Kuwait City', nameAr: 'مدينة الكويت' } ],
	'Bahrain|Capital': [ { nameEn: 'Manama', nameAr: 'المنامة' } ],
	'Oman|Muscat': [ { nameEn: 'Muscat', nameAr: 'مسقط' } ],
	'Palestine|Gaza': [ { nameEn: 'Gaza', nameAr: 'غزة' } ],
	'Mauritania|Nouakchott': [ { nameEn: 'Nouakchott', nameAr: 'نواكشوط' } ],
	'Somalia|Benadir': [ { nameEn: 'Mogadishu', nameAr: 'مقديشو' } ],
	'Djibouti|Djibouti': [ { nameEn: 'Djibouti', nameAr: 'جيبوتي' } ],
	'Comoros|Grande Comore': [ { nameEn: 'Moroni', nameAr: 'موروني' } ]
}; 