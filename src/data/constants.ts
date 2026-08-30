import { PackageOffer, BranchInfo, LuckyPrize, ShadeOption, StoreSettings, ReviewItem } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Beauty Salon Aya Haboula',
  salonOwner: 'آية هبولة',
  whatsappNumber: '201286886296',
  whatsappDepositNumber: '01286886296',
  instapayUsername: '01286886296 / ayanailss',
  depositAmount: 150,
  hairWashPrice: 100,
  facebookUrl: 'https://www.facebook.com/profile.php?id=100076153371113',
  googleSheetUrl: '',
  metaPixelId: '',
  metaTestEventCode: '',
  adminPasswordPlainText: 'admin',
  currency: 'جنيه',
  daysRemainingText: 'العرض متبقي عليه 4 أيام فقط (الأربعاء، الخميس، الجمعة والسبت)'
};

export const PACKAGE_OFFERS: PackageOffer[] = [
  {
    id: 'offer-1',
    name: 'باقة الكافيار والصبغة الملكية',
    badge: 'الأكثر توفيراً 🎀',
    price: 500,
    originalPrice: 1200,
    discountPercent: 58,
    features: [
      'جلسة كافيار ترميم وتغذية مكثفة للشعر',
      'صبغة شعر احترافية لون واحد متناسق',
      'مجموعة العناية المنزلية (شامبو + بلسم علاجي) مجاناً',
      'سحب فوري على ساعة حظ هبولة لهدية مجانية'
    ],
    isPopular: false,
    videoUrl: '/media/vid1.mp4',
    posterUrl: '/poster-vid1.jpg',
    shortDescription: 'العرض رقم 1 الخارق: جلسة كافيار + صبغة لون واحد + هدية مجموعة الشامبو والبلسم!'
  },
  {
    id: 'offer-2',
    name: 'باقة ترتمنت الأرجان والصبغة الذهبية',
    badge: 'الأكثر طلباً ومبيعاً 🔥',
    price: 999,
    originalPrice: 2200,
    discountPercent: 55,
    features: [
      'جلسة ترتمنت الأرجان النقي لفرد وعلاج وتلميع الشعر',
      'صبغة شعر فاخرة لون واحد بدرجة مخصصة',
      'مجموعة العناية الفائقة (شامبو + بلسم الأرجان الأصلي) مجاناً',
      'أولوية حجز خاصة + لفة ساعة حظ هبولة المزدوجة'
    ],
    isPopular: true,
    videoUrl: '/media/vid2.mp4',
    posterUrl: '/poster-vid2.jpg',
    shortDescription: 'العرض رقم 2 الأقوى: ترتمنت الأرجان المعالج + صبغة فاخرة + مجموعة العناية المتكاملة!'
  }
];

export const SALON_BRANCHES: BranchInfo[] = [
  {
    id: 'ismailia',
    name: 'فرع الإسماعيلية',
    city: 'الإسماعيلية',
    address: 'الإسماعيلية - بجوار المعالم الرئيسية والميدان',
    phone: '01286886296',
    spotsLeft: 3
  },
  {
    id: 'heliopolis',
    name: 'فرع القاهرة - مصر الجديدة',
    city: 'القاهرة',
    address: 'القاهرة - مصر الجديدة (شارع الحجاز / الميرغني)',
    phone: '01286886296',
    spotsLeft: 2
  },
  {
    id: 'gesr_el_suez',
    name: 'فرع جسر السويس',
    city: 'القاهرة',
    address: 'القاهرة - جسر السويس (الشارع التجاري الرئيسي)',
    phone: '01286886296',
    spotsLeft: 4
  }
];

export const LUCKY_PRIZES: LuckyPrize[] = [
  {
    id: 'lashes-1by1',
    name: 'تركيب رموش One by One',
    iconName: 'Sparkles',
    color: '#ff6600',
    badge: 'هدية مميزة',
    description: 'جلسة تركيب رموش ون باي ون إطلالة طبيعية ساحرة'
  },
  {
    id: 'shein-nails',
    name: 'ضوافر Shein عصرية',
    iconName: 'Heart',
    color: '#ea580c',
    badge: 'تريند',
    description: 'تركيب وتنسيق أحدث أشكال أظافر شي إن'
  },
  {
    id: 'face-brows',
    name: 'وش وحواجب VIP',
    iconName: 'Smile',
    color: '#c2410c',
    badge: 'جلسة كاملة',
    description: 'تنظيف وتحديد ورسم الحواجب والوجه بالكامل'
  },
  {
    id: 'blowdry',
    name: 'سيشوار بروفيشنال',
    iconName: 'Wind',
    color: '#f97316',
    badge: 'سريعة ومبهرة',
    description: 'سيشوار احترافي هوليوودي لتألق شعرك'
  },
  {
    id: 'hair-straight',
    name: 'ليس حريري ناعم',
    iconName: 'Flame',
    color: '#fb923c',
    badge: 'نعومة فائقة',
    description: 'جلسة تمليس حراري ليس لنتيجة كالحرير'
  },
  {
    id: 'wavy-hair',
    name: 'ستايلينج ويفي كيرلي',
    iconName: 'Activity',
    color: '#ea580c',
    badge: 'لوك المشاهير',
    description: 'تمويج وتسريح ويفي جذاب يدوم طويلاً'
  },
  {
    id: 'hair-cut',
    name: 'قص أطراف وتسوية ستايل',
    iconName: 'Scissors',
    color: '#f97316',
    badge: 'انتعاش',
    description: 'قص وتجديد حيوية الشعر مع خبراء الصالون'
  },
  {
    id: 'pedicure',
    name: 'جلسة بدكير واسترخاء',
    iconName: 'Footprints',
    color: '#ff6600',
    badge: 'دلع ملكي',
    description: 'بدكير وإزالة الجلد الميت وترطيب القدمين'
  },
  {
    id: 'skin-care',
    name: 'تنضيف وتنعيم بشرة',
    iconName: 'Sun',
    color: '#c2410c',
    badge: 'نضارة فورية',
    description: 'تنظيف عميق للبشرة بالأقنعة الطبيعية والترطيب'
  },
  {
    id: 'nails-care',
    name: 'مظهر أظافر كلاسيكي + لون',
    iconName: 'Layers',
    color: '#fb923c',
    badge: 'شياكة',
    description: 'برد وتلميع وتلوين أظافر اليد بأجمل الألوان'
  },
  {
    id: 'sweet-session',
    name: 'جلسة سويت لطيفة',
    iconName: 'Feather',
    color: '#f97316',
    badge: 'نعومة كاملة',
    description: 'جلسة سويت للمناطق المحددة بنعومة تدوم'
  }
];

export const SHADE_OPTIONS: ShadeOption[] = [
  { id: 'chocolate-brown', name: 'بني شوكولاتة ملكي', category: 'الصبغات الغامقة', colorHex: '#4a2c11' },
  { id: 'caramel-hazel', name: 'كراميل وبندق دافئ', category: 'الصبغات العصرية', colorHex: '#a0522d' },
  { id: 'burgundy-wine', name: 'نبيتي بوردو جذاب', category: 'الصبغات الجريئة', colorHex: '#800020' },
  { id: 'golden-honey', name: 'عسلي ذهبي مشرق', category: 'الصبغات الفاتحة', colorHex: '#d4af37' },
  { id: 'ash-blonde', name: 'أشقر رمادي زيتوني', category: 'الألوان الرمادية', colorHex: '#8b8589' },
  { id: 'custom-expert', name: 'اختيار الدرجة مع الخبيرة بالفرع', category: 'استشارة مجانية', colorHex: '#ff6600' }
];

export const REVIEWS_LIST: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'ميادة السعيد',
    branch: 'فرع الإسماعيلية',
    service: 'عرض ترتمنت الأرجان + صبغة',
    rating: 5,
    comment: 'بجد تسلم إيد مدام آية وفريق العمل، شعري كان متبهدل جداً وبعد جلسة الأرجان والصبغة بقى حرير وبيلمع واللون طلع تحفة زي ما تمنيت بالظبط! وكمان كسبت رموش في ساعة الحظ 😍',
    imageUrl: 'https://ayahaboula.mohamedgooda.com/media/rate1.jpg',
    dateStr: 'السبت، 22 أغسطس 2026'
  },
  {
    id: 'rev-2',
    name: 'نورهان عبد الرحمن',
    branch: 'فرع القاهرة مصر الجديدة',
    service: 'عرض الكافيار 500 ج',
    rating: 5,
    comment: 'عرض الـ 500 جنيه ده اختراع! الكافيار رجع لشعري الحيوية ومجموعة الشامبو والبلسم الهدية ريحتها وهمية وجودتها ممتازة جداً. مبسوطة إني حجزت في أول 10 بنات.',
    imageUrl: 'https://ayahaboula.mohamedgooda.com/media/rate2.jpg',
    dateStr: 'الجمعة، 21 أغسطس 2026'
  },
  {
    id: 'rev-3',
    name: 'سارة طارق',
    branch: 'فرع جسر السويس',
    service: 'ترتمنت وصبغة + هدية ساعة الحظ',
    rating: 5,
    comment: 'أحسن تجربة بيوتي سنتر في القاهرة، المعاملة راقية جداً والالتزام بالمواعيد ممتاز. دفعت العربون 150 ج على إنستاباي واستقبلوني أحسن استقبال.',
    imageUrl: 'https://ayahaboula.mohamedgooda.com/media/rate3.jpg',
    dateStr: 'الخميس، 20 أغسطس 2026'
  },
  {
    id: 'rev-4',
    name: 'هدير مصطفى',
    branch: 'فرع مصر الجديدة',
    service: 'كافيار + صبغة + تنظيف بشرة',
    rating: 5,
    comment: 'الصبغة متجانسة وثابتة جداً وما نشفتش شعري خالص، والهدية اللي كسبتها في العجلة نفذوهالي بكل حب. شكراً آية هبولة ودايماً متميزة!',
    imageUrl: 'https://ayahaboula.mohamedgooda.com/media/rate4.jpg',
    dateStr: 'الأربعاء، 19 أغسطس 2026'
  }
];

export const EGYPT_GOVERNORATES = [
  'الإسماعيلية',
  'القاهرة',
  'الجيزة',
  'القليوبية',
  'الشرقية',
  'بورسعيد',
  'السويس',
  'الإسكندرية',
  'الدقهلية',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'كفر الشيخ',
  'دمياط',
  'بني سويف',
  'الفيوم',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'مطروح',
  'الوادي الجديد',
  'شمال سيناء',
  'جنوب سيناء'
];

export const LIVE_ACTIVITY_MESSAGES = [
  { name: 'هند م.', branch: 'فرع مصر الجديدة', text: 'حجزت باقة ترتمنت الأرجان وكسبت رموش One by One!' },
  { name: 'ريهام ف.', branch: 'فرع الإسماعيلية', text: 'حجزت عرض الـ 500 ج وحولت العربون على إنستاباي' },
  { name: 'مروة ك.', branch: 'فرع جسر السويس', text: 'حجزت العرض وكسبت جلسة سويت في ساعة الحظ 🎁' },
  { name: 'دينا س.', branch: 'فرع مصر الجديدة', text: 'تم تأكيد حجزها واستلام إشعار الواتساب بنجاح' },
  { name: 'ياسمين أ.', branch: 'فرع الإسماعيلية', text: 'حجزت آخر مكان متبقي لعرض الصبغة والكافيار' }
];
