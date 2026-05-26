// ============================================
// مغامرة الأساتذة - Game Data (إعادة بناء من الصفر)
// ============================================

// ========== أنواع البيانات ==========

export interface CharacterStats {
  strength: number;
  intelligence: number;
  luck: number;
  charisma: number;
  mana: number;
  defense: number;
}

export interface Character {
  id: string;
  name: string;
  classAr: string;
  stats: CharacterStats;
  uniqueAbilityAr: string;
  signature: string;
  emoji: string;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  eventCount: number;
  specialDanger?: string;
  emoji: string;
  backgroundImage?: string;
}

export interface GameResources {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  reputation: number;
  knowledge: number;
}

export interface Ally {
  characterId: string;
  name: string;
  passiveAbilityAr: string;
}

export interface EventOutcome {
  healthChange?: number;
  manaChange?: number;
  goldChange?: number;
  reputationChange?: number;
  knowledgeChange?: number;
  allyGain?: string;
  text: string;
}

export interface EventOption {
  text: string;
  statCheck?: keyof CharacterStats;
  statThreshold?: number;
  outcome: { success: EventOutcome; failure: EventOutcome };
}

export interface GameEvent {
  id: string;
  type: 'encounter' | 'battle' | 'puzzle' | 'merchant' | 'comedy' | 'crossroads' | 'secret';
  region: string;
  title: string;
  description: string;
  emoji: string;
  options: EventOption[];
}

export interface Enemy {
  name: string;
  health: number;
  damage: number;
  goldReward: number;
  emoji: string;
  image?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface Ending {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export interface MerchantItem {
  name: string;
  price: number;
  emoji: string;
  effectAr: string;
  healthChange?: number;
  manaChange?: number;
  goldChange?: number;
  knowledgeChange?: number;
}

export interface AllyPassive {
  passiveAbilityAr: string;
}

// ========== دوال مساعدة ==========

export function getInitialResources(): GameResources {
  return {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    gold: 20,
    reputation: 0,
    knowledge: 0,
  };
}

// ========== ألوان التوهج حسب الفئة ==========
export const CLASS_GLOW_COLORS: Record<string, string> = {
  'محارب': 'border-red-500 shadow-red-500/30',
  'حارس': 'border-red-400 shadow-red-400/30',
  'لص': 'border-gray-400 shadow-gray-400/30',
  'ساحر': 'border-purple-500 shadow-purple-500/30',
  'مقاتل': 'border-red-500 shadow-red-500/30',
  'قائد': 'border-yellow-500 shadow-yellow-500/30',
  'مجهول': 'border-gray-600 shadow-gray-600/30',
  'حكيمة': 'border-purple-400 shadow-purple-400/30',
  'مشفيّة': 'border-green-400 shadow-green-400/30',
  'تاجرة': 'border-yellow-400 shadow-yellow-400/30',
  'شاعرة': 'border-purple-400 shadow-purple-400/30',
  'كاهنة': 'border-sky-300 shadow-sky-300/30',
  'ساحرة النار': 'border-red-500 shadow-red-500/30',
  'ساحرة الماء': 'border-blue-400 shadow-blue-400/30',
  'ساحرة الريح': 'border-green-300 shadow-green-300/30',
  'غابية': 'border-green-500 shadow-green-500/30',
  'أميرة': 'border-yellow-400 shadow-yellow-400/30',
  'محققة': 'border-purple-400 shadow-purple-400/30',
  'فلاحة': 'border-green-400 shadow-green-400/30',
  'عرّافة': 'border-purple-500 shadow-purple-500/30',
  'جاسوسة': 'border-gray-500 shadow-gray-500/30',
  'حكيمة العجوز': 'border-purple-300 shadow-purple-300/30',
  'ملاك': 'border-sky-200 shadow-sky-200/30',
  'شيطانة طيبة': 'border-gray-600 shadow-gray-600/30',
  'راهبة': 'border-sky-200 shadow-sky-200/30',
  'صياد': 'border-green-500 shadow-green-500/30',
  'فارس': 'border-red-400 shadow-red-400/30',
};

// ==========================================
// 27 شخصية
// ==========================================
export const CHARACTERS: Character[] = [
  {
    id: 'ibrahim',
    name: 'إبراهيم',
    classAr: 'محارب',
    stats: { strength: 5, intelligence: 2, luck: 3, charisma: 2, mana: 2, defense: 4 },
    uniqueAbilityAr: 'الضربة المزدوجة - يضرب العدو ضربتين متتاليتين في جولة واحدة',
    signature: 'السيف لا يكذب',
    emoji: '⚔️',
  },
  {
    id: 'abdullah',
    name: 'عبد الله',
    classAr: 'حارس',
    stats: { strength: 4, intelligence: 3, luck: 2, charisma: 3, mana: 2, defense: 5 },
    uniqueAbilityAr: 'درع الإيمان - يمتص الضربة التالية كاملاً مرة واحدة',
    signature: 'لن يمر أحد',
    emoji: '🛡️',
  },
  {
    id: 'sufian',
    name: 'سفيان',
    classAr: 'لص',
    stats: { strength: 3, intelligence: 3, luck: 5, charisma: 3, mana: 2, defense: 2 },
    uniqueAbilityAr: 'السرقة الخفية - يسرق آيتماً عشوائياً من العدو أو التاجر',
    signature: 'ما لا تراه هو ما يقتلك',
    emoji: '🗡️',
  },
  {
    id: 'boukhloua',
    name: 'بوخلوة',
    classAr: 'ساحر',
    stats: { strength: 1, intelligence: 5, luck: 2, charisma: 3, mana: 5, defense: 2 },
    uniqueAbilityAr: 'تعويذة الفوضى - نتيجة عشوائية قد تدمر العدو أو تحولك لضفدعة لجولة',
    signature: 'السحر لا يُفهم بل يُشعر',
    emoji: '🔮',
  },
  {
    id: 'yacine',
    name: 'ياسين',
    classAr: 'مقاتل',
    stats: { strength: 4, intelligence: 3, luck: 3, charisma: 3, mana: 3, defense: 3 },
    uniqueAbilityAr: 'غضب المحارب - يتضاعف ضرره عندما تنخفض صحته لأقل من 30',
    signature: 'الألم يصنع المحارب',
    emoji: '💪',
  },
  {
    id: 'ousama',
    name: 'أسامة',
    classAr: 'قائد',
    stats: { strength: 3, intelligence: 4, luck: 2, charisma: 5, mana: 3, defense: 3 },
    uniqueAbilityAr: 'صرخة القيادة - تعزز إحصائيات كل الحلفاء بنقطة واحدة لبقية المنطقة',
    signature: 'القائد يسير في المقدمة',
    emoji: '👑',
  },
  {
    id: 'karim',
    name: 'كريم',
    classAr: 'مجهول',
    stats: { strength: 3, intelligence: 3, luck: 3, charisma: 3, mana: 3, defense: 3 },
    uniqueAbilityAr: 'التنين النائم - في 1 من 10 ينكشف كونه تنيناً ويدمر كل الأعداء',
    signature: 'أنا لستُ ما تظن',
    emoji: '🐉',
  },
  {
    id: 'lina',
    name: 'لينا',
    classAr: 'حكيمة',
    stats: { strength: 1, intelligence: 5, luck: 3, charisma: 4, mana: 4, defense: 2 },
    uniqueAbilityAr: 'البصيرة - ترى نتيجة كل خيار قبل اتخاذه مرة لكل منطقة',
    signature: 'المعرفة هي القوة الحقيقية',
    emoji: '📖',
  },
  {
    id: 'nour',
    name: 'نور',
    classAr: 'مشفيّة',
    stats: { strength: 2, intelligence: 4, luck: 3, charisma: 5, mana: 4, defense: 3 },
    uniqueAbilityAr: 'الشفاء الفوري - تستعيد 30 نقطة صحة مرة واحدة لكل منطقة',
    signature: 'النور يشفي كل جرح',
    emoji: '✨',
  },
  {
    id: 'asma',
    name: 'أسماء',
    classAr: 'تاجرة',
    stats: { strength: 2, intelligence: 4, luck: 4, charisma: 4, mana: 2, defense: 2 },
    uniqueAbilityAr: 'المفاوضة - تحصل دائماً على خصم 50% عند أي تاجر',
    signature: 'كل شيء قابل للتفاوض',
    emoji: '💰',
  },
  {
    id: 'maram',
    name: 'مرام',
    classAr: 'شاعرة',
    stats: { strength: 1, intelligence: 5, luck: 4, charisma: 5, mana: 4, defense: 1 },
    uniqueAbilityAr: 'قصيدة السحر - تُشلّ العدو بالكلمات لـ3 جولات بدون قتال',
    signature: 'الكلمة أقوى من السيف',
    emoji: '📜',
  },
  {
    id: 'aya1',
    name: 'آية (الأولى)',
    classAr: 'كاهنة',
    stats: { strength: 2, intelligence: 5, luck: 4, charisma: 3, mana: 5, defense: 2 },
    uniqueAbilityAr: 'التنبؤ - تعرف الحدث القادم في المنطقة قبل الوصول إليه',
    signature: 'الغيب لا يخفى على من يُصغي',
    emoji: '🕊️',
  },
  {
    id: 'doua_bentemra',
    name: 'دعاء بن تمرة',
    classAr: 'ساحرة النار',
    stats: { strength: 4, intelligence: 4, luck: 3, charisma: 3, mana: 4, defense: 2 },
    uniqueAbilityAr: 'الجحيم - تحرق كل الأعداء دفعة واحدة لكن تستهلك 25 مانا',
    signature: 'النار لا تسأل إذناً',
    emoji: '🔥',
  },
  {
    id: 'doua_bensabaha',
    name: 'دعاء بن صباحة',
    classAr: 'ساحرة الماء',
    stats: { strength: 2, intelligence: 5, luck: 3, charisma: 4, mana: 5, defense: 3 },
    uniqueAbilityAr: 'موجة الشفاء - تشفي اللاعب وكل الحلفاء 20 نقطة لكل واحد',
    signature: 'الماء يجد طريقه دائماً',
    emoji: '🌊',
  },
  {
    id: 'doua_bensaidan',
    name: 'دعاء بن سعيدان',
    classAr: 'ساحرة الريح',
    stats: { strength: 3, intelligence: 4, luck: 4, charisma: 3, mana: 4, defense: 2 },
    uniqueAbilityAr: 'العاصفة - تهرب من أي معركة فوراً دون خسارة صحة',
    signature: 'الريح لا تُقيَّد',
    emoji: '💨',
  },
  {
    id: 'rawan',
    name: 'روان',
    classAr: 'غابية',
    stats: { strength: 3, intelligence: 3, luck: 5, charisma: 4, mana: 3, defense: 3 },
    uniqueAbilityAr: 'لغة الطبيعة - تتحدث مع الحيوانات وتستخدمها حلفاء مؤقتين',
    signature: 'الغابة تحمي من تحترمها',
    emoji: '🌿',
  },
  {
    id: 'bouchra',
    name: 'بشرى',
    classAr: 'أميرة',
    stats: { strength: 2, intelligence: 4, luck: 3, charisma: 5, mana: 3, defense: 3 },
    uniqueAbilityAr: 'السلطة الملكية - تأمر أي شخصية غير عدائية بالطاعة والمساعدة',
    signature: 'الأميرة لا تطلب تُصدر الأوامر',
    emoji: '👸',
  },
  {
    id: 'feryal',
    name: 'فريال',
    classAr: 'محققة',
    stats: { strength: 2, intelligence: 5, luck: 3, charisma: 4, mana: 3, defense: 2 },
    uniqueAbilityAr: 'التحقيق - تكشف الهوية الحقيقية والنوايا لأي شخصية تلتقيها',
    signature: 'لا شيء يختفي إلى الأبد',
    emoji: '🔍',
  },
  {
    id: 'basma',
    name: 'بسمة',
    classAr: 'فلاحة',
    stats: { strength: 3, intelligence: 3, luck: 5, charisma: 4, mana: 2, defense: 3 },
    uniqueAbilityAr: 'حظ المزرعة - تجد أدوات وطعام مجاني بنسبة ضعف ما يجده غيرها',
    signature: 'الأرض تعطي من يعمل',
    emoji: '🌾',
  },
  {
    id: 'chaimaa',
    name: 'شيماء',
    classAr: 'عرّافة',
    stats: { strength: 1, intelligence: 5, luck: 5, charisma: 3, mana: 5, defense: 1 },
    uniqueAbilityAr: 'الخريطة المخفية - ترى مسارات سرية بين المناطق لا يراها غيرها',
    signature: 'الحقيقة خلف كل وهم',
    emoji: '🗺️',
  },
  {
    id: 'khaira',
    name: 'خيرة',
    classAr: 'جاسوسة',
    stats: { strength: 3, intelligence: 5, luck: 4, charisma: 3, mana: 3, defense: 3 },
    uniqueAbilityAr: 'التنكّر - تتجنب أي مواجهة مع عدو دون قتال ودون هروب',
    signature: 'الظل لا يُرى',
    emoji: '🥷',
  },
  {
    id: 'fatiha',
    name: 'فتيحة',
    classAr: 'حكيمة العجوز',
    stats: { strength: 1, intelligence: 5, luck: 4, charisma: 5, mana: 4, defense: 2 },
    uniqueAbilityAr: 'حكمة الزمن - تحل أي لغز تلقائياً دون خسارة',
    signature: 'من عاش كثيراً رأى كل شيء',
    emoji: '🧓',
  },
  {
    id: 'aya_bouhalassa',
    name: 'آية بوحلاسة',
    classAr: 'ملاك',
    stats: { strength: 3, intelligence: 4, luck: 4, charisma: 5, mana: 4, defense: 3 },
    uniqueAbilityAr: 'الحماية الإلهية - لا تموت في أول مرة تصل فيها الصحة للصفر',
    signature: 'أنا لستُ وحدك',
    emoji: '👼',
  },
  {
    id: 'aya_boubaker',
    name: 'آية بوبكر',
    classAr: 'شيطانة طيبة',
    stats: { strength: 4, intelligence: 3, luck: 5, charisma: 3, mana: 3, defense: 3 },
    uniqueAbilityAr: 'الفوضى المضحكة - نتيجة إضافية كوميدية غير متوقعة دائماً في صالحها',
    signature: 'الحياة مضحكة فلنضحك',
    emoji: '😈',
  },
  {
    id: 'naska',
    name: 'ناسكة',
    classAr: 'راهبة',
    stats: { strength: 1, intelligence: 5, luck: 4, charisma: 4, mana: 5, defense: 2 },
    uniqueAbilityAr: 'التأمل - تستعيد كامل مواردها الصحة والمانا في نهاية كل منطقة',
    signature: 'الصمت أعمق الكلام',
    emoji: '🧘',
  },
  {
    id: 'boudar',
    name: 'بودار',
    classAr: 'صياد',
    stats: { strength: 4, intelligence: 3, luck: 4, charisma: 3, mana: 2, defense: 4 },
    uniqueAbilityAr: 'القناص - تضرب أولاً في كل معركة قبل أي عدو',
    signature: 'السهم لا يخطئ هدفه',
    emoji: '🏹',
  },
  {
    id: 'benyamina',
    name: 'بن يمينة',
    classAr: 'فارس',
    stats: { strength: 5, intelligence: 2, luck: 3, charisma: 4, mana: 2, defense: 4 },
    uniqueAbilityAr: 'هجوم الفرسان - يضاعف الضرر في الجولة الأولى من كل معركة',
    signature: 'الشرف فوق كل شيء',
    emoji: '🐴',
  },
];

// ==========================================
// 6 مناطق
// ==========================================
export const REGIONS: Region[] = [
  {
    id: 'forest',
    name: 'غابة الأسرار',
    description: 'المنطقة البداية المليئة بالأشجار العملاقة والمخلوقات الغريبة',
    eventCount: 3,
    emoji: '🌲',
    backgroundImage: '/moghamarat-al-asatiza/game-assets/regions/forest.png',
  },
  {
    id: 'city',
    name: 'مدينة النور',
    description: 'المدينة الرئيسية حيث يعيش التجار والحرفيون وكثير من الشخصيات المعروفة',
    eventCount: 4,
    emoji: '🏙️',
    backgroundImage: '/moghamarat-al-asatiza/game-assets/regions/city.png',
  },
  {
    id: 'mountains',
    name: 'جبال الغموض',
    description: 'جبال شاهقة مليئة بالألغاز والكهوف',
    eventCount: 3,
    emoji: '⛰️',
    backgroundImage: '/moghamarat-al-asatiza/game-assets/regions/mountains.png',
  },
  {
    id: 'desert',
    name: 'صحراء النسيان',
    description: 'صحراء قاسية تؤثر على الذاكرة',
    eventCount: 4,
    specialDanger: 'فقدان معرفة عشوائية إذا لم تُحل لغز الصحراء',
    emoji: '🏜️',
    backgroundImage: '/moghamarat-al-asatiza/game-assets/regions/desert.png',
  },
  {
    id: 'ocean',
    name: 'أعماق البحر الفضي',
    description: 'منطقة تحت الماء غامضة فيها مخلوقات نادرة وكنوز',
    eventCount: 3,
    emoji: '🌊',
    backgroundImage: '/moghamarat-al-asatiza/game-assets/regions/ocean.png',
  },
  {
    id: 'castle',
    name: 'قلعة الظلام',
    description: 'مقر العدو النهائي - معركتان تمهيديتان ثم المعركة الأخيرة ضد حارس الكتاب',
    eventCount: 3,
    emoji: '🏰',
    backgroundImage: '/moghamarat-al-asatiza/game-assets/regions/castle.png',
  },
];

// ==========================================
// الأعداء حسب المنطقة
// ==========================================
const IMG = '/moghamarat-al-asatiza/game-assets/monsters';

export const REGION_ENEMIES: Record<string, Enemy[]> = {
  forest: [
    { name: 'ذئب الظلام', health: 30, damage: 10, goldReward: 8, emoji: '🐺', image: `${IMG}/forest_wolf.png` },
    { name: 'العنكبوت العملاق', health: 40, damage: 12, goldReward: 10, emoji: '🕷️', image: `${IMG}/forest_spider.png` },
    { name: 'شجرة ملعونة', health: 50, damage: 8, goldReward: 12, emoji: '🌳', image: `${IMG}/forest_tree.png` },
  ],
  city: [
    { name: 'لص الطريق', health: 35, damage: 15, goldReward: 15, emoji: '🦹' },
    { name: 'حارس فاسد', health: 50, damage: 12, goldReward: 18, emoji: '💂' },
    { name: 'تاجر الغش', health: 25, damage: 8, goldReward: 25, emoji: '🤥' },
    { name: 'قاطع طريق', health: 45, damage: 18, goldReward: 20, emoji: '⚔️' },
  ],
  mountains: [
    { name: 'العملاق الحجري', health: 70, damage: 20, goldReward: 25, emoji: '🗿', image: `${IMG}/mountain_giant.png` },
    { name: 'التنين الصغير', health: 60, damage: 25, goldReward: 30, emoji: '🐲' },
    { name: 'نسر الجبال', health: 40, damage: 15, goldReward: 15, emoji: '🦅' },
  ],
  desert: [
    { name: 'عقرب العملاق', health: 45, damage: 18, goldReward: 20, emoji: '🦂', image: `${IMG}/desert_scorpion.png` },
    { name: 'مومياء الغضب', health: 60, damage: 22, goldReward: 25, emoji: '🧟', image: `${IMG}/desert_mummy.png` },
    { name: 'رملة حية', health: 35, damage: 15, goldReward: 15, emoji: '🌀' },
    { name: 'جني الصحراء', health: 55, damage: 20, goldReward: 35, emoji: '🧞', image: `${IMG}/desert_genie.png` },
  ],
  ocean: [
    { name: 'أخطبوط العمق', health: 65, damage: 22, goldReward: 30, emoji: '🐙', image: `${IMG}/ocean_octopus.png` },
    { name: 'سمكة القرش السحرية', health: 55, damage: 25, goldReward: 25, emoji: '🦈' },
    { name: 'حورية الغدر', health: 40, damage: 18, goldReward: 35, emoji: '🧜‍♀️' },
  ],
  castle: [
    { name: 'حارس البوابات', health: 80, damage: 25, goldReward: 35, emoji: '👹', image: `${IMG}/castle_guardian.png` },
    { name: 'فارس الظلام', health: 90, damage: 30, goldReward: 40, emoji: '🖤', image: `${IMG}/castle_dark_knight.png` },
    { name: 'حارس الكتاب (الزعيم النهائي)', health: 150, damage: 35, goldReward: 100, emoji: '👿', image: `${IMG}/castle_final_boss.png` },
  ],
};

// ==========================================
// أحداث كل منطقة
// ==========================================
export const REGION_EVENTS: Record<string, GameEvent[]> = {
  forest: [
    {
      id: 'f1',
      type: 'encounter',
      region: 'forest',
      title: 'مسافر تائه',
      description: 'بين الأشجار العملاقة، تسمع صوت أنين خافت. تقترب لتجد مسافراً جريحاً يستند إلى شجرة، وسيفه مكسور بجانبه. يرفع رأسه ويقول: "ساعدني... وسأكون لك حليفاً مخلصاً".',
      emoji: '🤕',
      options: [
        {
          text: '🤝 مساعدته ومداواة جراحه',
          statCheck: 'charisma',
          statThreshold: 2,
          outcome: {
            success: { reputationChange: 5, allyGain: 'ibrahim', text: 'شكر إبراهيم بحرارة وأصبح حليفك المخلص! سيفه القوي سيحميك في رحلتك.' },
            failure: { reputationChange: 3, text: 'حاولت مساعدته لكن جراحه عميقة. شكرك وواصل طريقه وحده.' },
          },
        },
        {
          text: '🚶 تجاهله والمضي قدماً',
          outcome: {
            success: { text: 'تجاهلته وواصلت طريقك. لا شيء تغير، لكن صوت أنينه يطاردك.' },
            failure: { text: 'تجاهلته وواصلت طريقك. لا شيء تغير.' },
          },
        },
        {
          text: '📢 طلب انضمامه لفريقك',
          statCheck: 'charisma',
          statThreshold: 3,
          outcome: {
            success: { allyGain: 'ibrahim', text: 'وافق إبراهيم فوراً! قال: "محتاج واحد يحمي ظهري كمان!". أصبح حليفك!' },
            failure: { text: 'رفض إبراهيم بلطف: "بغيتو واحد أقوى مني". وواصل طريقه.' },
          },
        },
      ],
    },
    {
      id: 'f2',
      type: 'battle',
      region: 'forest',
      title: 'كمين في الغابة!',
      description: 'فجأة، تسمع صوت حشرات عملاقة تقترب! العنكبوت العملاق ينزل من شجرة ويحاصرك في شبكته!',
      emoji: '🕷️',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 3,
          outcome: {
            success: { goldChange: 10, healthChange: -10, text: 'قضيت على العنكبوت بسيفك! وجدت 10 ذهب في شبكته لكن أصبت ببعض الخدوش.' },
            failure: { healthChange: -25, text: 'العنكبوت أقوى مما توقعت! أصبت بجروح عميقة قبل أن تهرب.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 12, text: 'استخدمت قدرتك الخاصة وقضيت على العنكبوت بطريقة مذهلة!' },
            failure: { healthChange: -15, text: 'قدرتك لم تكن فعالة كفاية، لكنك نجوت بأضرار أقل.' },
          },
        },
        {
          text: '🏃 الهروب',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { text: 'هرولت بين الأشجار ونجوت! العنكبوت لم يستطع ملاحقتك.' },
            failure: { healthChange: -20, text: 'حاولت الهروب لكن شبكة العنكبوت أمسكتك! أصبت قبل أن تتحرر.' },
          },
        },
        {
          text: '🗣️ المفاوضة',
          statCheck: 'charisma',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 15, reputationChange: 2, text: 'بطريقة ما، أقنعت العنكبوت بالانسحاب! ووجدت كنزاً مخفياً في جحره.' },
            failure: { healthChange: -15, text: 'العنكبوت لا يفهم الكلام! هاجمك وأصابك.' },
          },
        },
      ],
    },
    {
      id: 'f3',
      type: 'puzzle',
      region: 'forest',
      title: 'لغز الشجرة الحكيمة',
      description: 'تجد شجرة عملاقة بنقوش متوهجة على جذعها. صوت عجوز يأتي من داخلها: "أجب عن لغزي لتحصل على المعرفة والذهب. ما الشيء الذي كلما أخذت منه كبر؟"',
      emoji: '🧩',
      options: [
        {
          text: '🧠 الحفرة (الإجابة الصحيحة)',
          outcome: {
            success: { knowledgeChange: 10, goldChange: 15, text: 'أحسنت! الحفرة كلما أخذت منها تراب كبرت! الشجرة منحتك المعرفة وذهباً.' },
            failure: { knowledgeChange: 10, goldChange: 15, text: 'أحسنت! الشجرة منحتك المعرفة وذهباً.' },
          },
        },
        {
          text: '🎲 التخمين العشوائي',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 5, goldChange: 8, text: 'خمنت بشكل صحيح! الشجرة منحتك مكافأة صغيرة.' },
            failure: { healthChange: -10, text: 'إجابة خاطئة! الشجرة أطلقت أشواكاً أصابتك. الإجابة: الحفرة.' },
          },
        },
      ],
    },
  ],

  city: [
    {
      id: 'c1',
      type: 'merchant',
      region: 'city',
      title: 'تاجر الأسرار',
      description: 'في زقاق مضاء بالشموع، يقف تاجر غامض خلف طاولة مليئة بالآيتمات السحرية. يقول: "عندي ما تحتاجه يا مسافر... بثمن مناسب طبعاً!"',
      emoji: '🏪',
      options: [
        {
          text: '🧴 جرعة الشفاء (15 ذهب) - تستعيد 30 صحة',
          outcome: {
            success: { goldChange: -15, healthChange: 30, text: 'شربت الجرعة وشعرت بالدفء يسري في جسدك. صحتك تعافت!' },
            failure: { goldChange: -15, healthChange: 30, text: 'شربت الجرعة وشعرت بالدفء يسري في جسدك!' },
          },
        },
        {
          text: '💎 بلورة المانا (20 ذهب) - تزيد المانا 25',
          outcome: {
            success: { goldChange: -20, manaChange: 25, text: 'البلورة توهجت في يدك وشعرت بطاقة سحرية هائلة!' },
            failure: { goldChange: -20, manaChange: 25, text: 'البلورة توهجت في يدك وشعرت بطاقة سحرية هائلة!' },
          },
        },
        {
          text: '🛡️ تعويذة الدفاع (25 ذهب) - تزيد الدفاع',
          outcome: {
            success: { goldChange: -25, text: 'التعويذة ذابت في جلدك! تشعر بصلابة غير عادية. دفاعك زاد!' },
            failure: { goldChange: -25, text: 'التعويذة ذابت في جلدك! تشعر بصلابة غير عادية.' },
          },
        },
      ],
    },
    {
      id: 'c2',
      type: 'encounter',
      region: 'city',
      title: 'نور في السوق',
      description: 'في سوق المدينة الصاخب، تلمح نور تجلس في زاوية هادئة تعالج جرحى الفقراء مجاناً. ترفع رأسها وتبتسم: "أهلاً بك يا مسافر. هل تبحث عن شفاء أم عن رفيق؟"',
      emoji: '✨',
      options: [
        {
          text: '🤝 مساعدتها في علاج الجرحى',
          statCheck: 'charisma',
          statThreshold: 2,
          outcome: {
            success: { reputationChange: 5, allyGain: 'nour', text: 'ساعدت نور في علاج الجرحى. شكرتك وأصبحت حليفتك! نور ستشفي 5 صحة كل حدث.' },
            failure: { reputationChange: 2, text: 'حاولت المساعدة لكنك أخطأت في استخدام الأعشاب. نور شكرتك على نيتك.' },
          },
        },
        {
          text: '🚶 تجاهلها',
          outcome: {
            success: { text: 'واصلت طريقك في السوق. لا شيء تغير.' },
            failure: { text: 'واصلت طريقك في السوق. لا شيء تغير.' },
          },
        },
        {
          text: '📢 طلب انضمامها',
          statCheck: 'charisma',
          statThreshold: 3,
          outcome: {
            success: { allyGain: 'nour', text: 'نور وافقت بسعادة! قالت: "حيث يكون النور، يكون الأمل". أصبحت حليفتك!' },
            failure: { text: 'نور اعتذرت بلطف: "عملي هنا أهم حالياً". لكنها تمنحتك جرعة شفاء.' },
          },
        },
      ],
    },
    {
      id: 'c3',
      type: 'battle',
      region: 'city',
      title: 'لصوص الطريق!',
      description: 'في زقاق مظلم، يظهر ثلاثة لصوص يحيطون بك! قائدهم يتقدم بسكين: "أعطنا ذهبك أو نأخذه بالقوة!"',
      emoji: '🦹',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 3,
          outcome: {
            success: { goldChange: 20, healthChange: -15, reputationChange: 3, text: 'هزمت اللصوش بشجاعة! وجدت 20 ذهب وأصبحت بطلاً في المدينة!' },
            failure: { goldChange: -10, healthChange: -25, text: 'اللصوص أقوى مما توقعت! سرقوا بعض ذهبك وأصابوك.' },
          },
        },
        {
          text: '🏃 الهروب',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { text: 'ركضت في الأزقة الضيقة ونجوت! اللصوص ضاعوا في المتاهة.' },
            failure: { goldChange: -15, healthChange: -10, text: 'حاولت الهروب لكنهم أمسكوك! أخذوا ذهبك وأصابوك.' },
          },
        },
        {
          text: '🗣️ المفاوضة',
          statCheck: 'charisma',
          statThreshold: 3,
          outcome: {
            success: { reputationChange: 5, text: 'أقنعتهم بأنك لست فريسة سهلة! انسحبوا باحترام وكسبت سمعة.' },
            failure: { goldChange: -10, text: 'لم يستمعوا لك! أخذوا بعض ذهبك وتركوك.' },
          },
        },
      ],
    },
    {
      id: 'c4',
      type: 'comedy',
      region: 'city',
      title: 'حادث مضحك في السوق',
      description: 'بينما تمشي في السوق، تعثرت ببرميل عجة طائر! البرميل ينقلب وتطير العجة في الهواء وتسقط على رأس تاجر متجهم! التاجر ينظر إليك بغضب... وعجته على رأسه تبدو كقبعة مضحكة!',
      emoji: '😂',
      options: [
        {
          text: '😄 الاعتذار بابتسامة وعرض تعويضه',
          statCheck: 'charisma',
          statThreshold: 2,
          outcome: {
            success: { reputationChange: 3, goldChange: -5, text: 'التاجر انفجر ضاحكاً! قال: "هذه أفضل قبعة شفتها!". أصبحتم أصدقاء.' },
            failure: { reputationChange: -2, goldChange: -10, text: 'التاجر لم يضحك. أخذ تعويضاً ومضى وهو يزمجر.' },
          },
        },
        {
          text: '🏃 الهرب بسرعة!',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { text: 'هربت بسرعة البرق! لا أحد عرف من أنت. العجة بقيت ذكرى مضحكة.' },
            failure: { reputationChange: -3, text: 'حاولت الهرب لكنك تعثرت مرة أخرى! الآن الجميع يضحك عليك.' },
          },
        },
      ],
    },
  ],

  mountains: [
    {
      id: 'm1',
      type: 'crossroads',
      region: 'mountains',
      title: 'مفترق الجبال',
      description: 'تصل إلى مفترق طرق في قلب الجبال. الطريق الأيسر يؤدي إلى كهف مظلم تسمع منه أصوات غريبة. الطريق الأيمن يمر فوق جسر حجري قديم فوق هوة سحيقة.',
      emoji: '⛰️',
      options: [
        {
          text: '🕳️ دخول الكهف المظلم',
          statCheck: 'intelligence',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 15, goldChange: 20, text: 'الكهف يحتوي على مكتبة قديمة! وجدت معرفة وذهباً مخفياً.' },
            failure: { healthChange: -20, text: 'الظلام كان خانقاً! سقطت في حفرة وأصبت. لم تجد شيئاً مفيداً.' },
          },
        },
        {
          text: '🌉 عبور الجسر الحجري',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { goldChange: 15, text: 'الجسر كان آمناً! وجدت كنزاً مخفياً تحت أحد الأحجار.' },
            failure: { healthChange: -25, text: 'الجسر انهار جزئياً! كدت تسقط في الهوة وأصبت بجروح.' },
          },
        },
        {
          text: '🗺️ البحث عن مسار سري',
          statCheck: 'intelligence',
          statThreshold: 4,
          outcome: {
            success: { knowledgeChange: 20, goldChange: 30, text: 'وجدت ممراً سرياً خلف الشلال! كان مليئاً بالكنوز والنقوش القديمة!' },
            failure: { healthChange: -10, text: 'لم تجد مساراً سرياً، لكن المنظر من الأعلى كان رائعاً.' },
          },
        },
      ],
    },
    {
      id: 'm2',
      type: 'battle',
      region: 'mountains',
      title: 'العملاق الحجري!',
      description: 'الأرض ترتجف تحت قدميك! من خلف الصخور يظهر عملاق حجري ضخم بعيون متوهجة! يزمجر: "لا أحد يعبر جبالي!"',
      emoji: '🗿',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 25, healthChange: -20, text: 'بقوة خارقة، حطمت العملاق الحجري! تناثرت صخوره ووجدت ذهباً بداخله!' },
            failure: { healthChange: -35, text: 'العملاق أقوى بكثير! ضربة واحدة أرسلتك تطير. نجوت بأعجوبة.' },
          },
        },
        {
          text: '🏃 الهروب',
          statCheck: 'luck',
          statThreshold: 4,
          outcome: {
            success: { text: 'تسللت بين الصخور ونجوت! العملاق لم يلاحظك.' },
            failure: { healthChange: -20, text: 'العملاق رماك بصخرة! أصبت لكنك نجوت.' },
          },
        },
        {
          text: '🗣️ إقناعه بالمرور',
          statCheck: 'charisma',
          statThreshold: 4,
          outcome: {
            success: { reputationChange: 5, text: 'أقنعت العملاق بأنك مسافر سلمي! سمح لك بالمرور.' },
            failure: { healthChange: -15, text: 'العملاق لا يقنع بالكلام! هاجمك.' },
          },
        },
      ],
    },
    {
      id: 'm3',
      type: 'puzzle',
      region: 'mountains',
      title: 'لغز الكهف القديم',
      description: 'على جدار الكهف نقوش قديمة: "أنا بلا أرجل وأتسلل، بلا فم وأهمس، بلا يدين وألمس. ما أنا؟"',
      emoji: '🧩',
      options: [
        {
          text: '🌬️ الريح (الإجابة الصحيحة)',
          outcome: {
            success: { knowledgeChange: 15, goldChange: 20, text: 'صحيح! الريح! الجدار ينفتح ويكشف عن غرفة كنز!' },
            failure: { knowledgeChange: 15, goldChange: 20, text: 'صحيح! الريح! الجدار ينفتح ويكشف عن غرفة كنز!' },
          },
        },
        {
          text: '🎲 التخمين',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 5, goldChange: 10, text: 'خمت بشكل صحيح! الإجابة: الريح. حصلت على مكافأة.' },
            failure: { healthChange: -15, text: 'خطأ! الأرض اهتزت وأصبت بصخرة. الإجابة كانت: الريح.' },
          },
        },
      ],
    },
  ],

  desert: [
    {
      id: 'd1',
      type: 'crossroads',
      region: 'desert',
      title: 'واحة أم سراب؟',
      description: 'في قلب الصحراء الحارقة، ترى واحة في الأفق. لكنك سمعت أن الصحراء تخدع العيون. الطريقان أمامك: نحو الواحة أو نحو صخور مظللة واضحة.',
      emoji: '🏜️',
      options: [
        {
          text: '🏝️ التوجه نحو الواحة',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { healthChange: 20, manaChange: 15, text: 'الواحة حقيقية! شربت الماء واسترحت. صحتك ومانا تعافتا!' },
            failure: { healthChange: -20, text: 'سراب! الواحة اختفت وضاعت طاقتك في المشي تحت الشمس.' },
          },
        },
        {
          text: '🪨 التوجه نحو الصخور المظللة',
          outcome: {
            success: { healthChange: 5, knowledgeChange: 10, text: 'الصخور كانت آمنة. وجدت نقوشاً قديمة على جدرانها تعطيك معرفة.' },
            failure: { healthChange: 5, knowledgeChange: 10, text: 'الصخور كانت آمنة. وجدت نقوشاً قديمة تعطيك معرفة.' },
          },
        },
      ],
    },
    {
      id: 'd2',
      type: 'battle',
      region: 'desert',
      title: 'مومياء الغضب!',
      description: 'من تحت الرمال تظهر مومياء بعيون حمراء متوهجة! تزمجر بلغة قديمة: "الذي يدخل أرضي يدفع الثمن!"',
      emoji: '🧟',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 3,
          outcome: {
            success: { goldChange: 25, healthChange: -20, text: 'هزمت المومياء! تطايرت أشرطتها ووجدت ذهباً فرعونياً!' },
            failure: { healthChange: -30, knowledgeChange: -5, text: 'المومياء ألعت عليك لعنة! أصبت وفقدت بعض المعرفة.' },
          },
        },
        {
          text: '🏃 الهروب عبر الرمال',
          statCheck: 'luck',
          statThreshold: 4,
          outcome: {
            success: { text: 'ركضت عبر العاصفة الرملية ونجوت!' },
            failure: { healthChange: -20, text: 'العاصفة الرملية أصابتك! المومياء كادت تمسكك.' },
          },
        },
        {
          text: '🗣️ ترديد تعويذة قديمة',
          statCheck: 'intelligence',
          statThreshold: 4,
          outcome: {
            success: { knowledgeChange: 15, goldChange: 30, text: 'ذكرت تعويذة من النقوش القديمة! المومياء خضعت لك وأعطتك كنزها!' },
            failure: { healthChange: -25, text: 'التعويذة كانت خاطئة! المومياء غضبت أكثر.' },
          },
        },
      ],
    },
    {
      id: 'd3',
      type: 'puzzle',
      region: 'desert',
      title: 'لغز صحراء النسيان',
      description: '⚠️ لغز رئيسي! عمود حجري عليه رموز: "أنا مدينة بلا شوارع، بلا بيوت، بلا أشجار. لكني مليئة بالسكان. ما أنا؟" إذا أخطأت ستفقد معرفة!',
      emoji: '🧩',
      options: [
        {
          text: '🗺️ الخريطة (الإجابة الصحيحة)',
          outcome: {
            success: { knowledgeChange: 20, goldChange: 25, text: 'صحيح! الخريطة! الرمال تتفتح وتكشف عن صندوق كنز قديم! حصلت على معرفة وذهب!' },
            failure: { knowledgeChange: 20, goldChange: 25, text: 'صحيح! الخريطة! حصلت على معرفة وذهب!' },
          },
        },
        {
          text: '🎲 التخمين',
          statCheck: 'luck',
          statThreshold: 4,
          outcome: {
            success: { knowledgeChange: 10, goldChange: 15, text: 'خمنت بشكل صحيح! الإجابة: الخريطة.' },
            failure: { knowledgeChange: -10, healthChange: -15, text: 'خطأ! الصحراء سحبت معرفة من ذاكرتك! الإجابة: الخريطة.' },
          },
        },
      ],
    },
    {
      id: 'd4',
      type: 'comedy',
      region: 'desert',
      title: 'جمل ثرثار',
      description: 'بينما تمشي في الصحراء، يقف جمل في طريقك ويرفض التحرك. ثم يفتح فمه ويقول بصوت بشري: "ما شاء الله عليك، تعبان! قوللي نكتة وأعبرك!"',
      emoji: '🐪',
      options: [
        {
          text: '😄 قول نكتة',
          statCheck: 'charisma',
          statThreshold: 2,
          outcome: {
            success: { goldChange: 20, reputationChange: 2, text: 'الجمل انفجر ضاحكاً وقال: "إنت أول واحد يضحكني من 300 سنة!" أعطاك 20 ذهب وترك الطريق.' },
            failure: { text: 'الجمل لم يضحك. قال: "يا خسارة" وترك الطريق مكتئباً.' },
          },
        },
        {
          text: '🚶 تجاوزه بهدوء',
          outcome: {
            success: { text: 'تجاوزت الجمل بهدوء. قال بصوت خافت: "ما عندك حس humor..."' },
            failure: { text: 'تجاوزت الجمل بهدوء. بدا محبطاً.' },
          },
        },
      ],
    },
  ],

  ocean: [
    {
      id: 'o1',
      type: 'encounter',
      region: 'ocean',
      title: 'حكيم الأعماق',
      description: 'في قاع البحر الفضي، تجد كائناً عجوزاً يجلس على صخرة مرجانية يحيطه ضوء أزرق. يفتح عينيه ببطء: "يا مسافر فوق الماء... أنا أعرف ما تبحث عنه. لكن كل معرفة لها ثمن."',
      emoji: '🧜',
      options: [
        {
          text: '📚 طلب المعرفة عن الكتاب الأعظم',
          statCheck: 'intelligence',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 20, text: 'حكيم الأعماق كشف لك أسراراً عن الكتاب! حصلت على معرفة قيّمة ستساعدك في المعركة النهائية.' },
            failure: { manaChange: -15, text: 'الحكيم حاول نقل المعرفة لكن عقلك لم يستوعبها. فقدت بعض المانا في المحاولة.' },
          },
        },
        {
          text: '🤝 عرض التحالف',
          statCheck: 'charisma',
          statThreshold: 4,
          outcome: {
            success: { allyGain: 'nour', reputationChange: 3, text: 'أرسل الحكيم نور لمساعدتك! قالت: "الحكيم يرى فيك بطلاً حقيقياً". أصبحت حليفتك!' },
            failure: { text: 'الحكيم رفض بلطف: "ليس الوقت مناسباً". لكنه بارك رحلتك.' },
          },
        },
        {
          text: '🚶 شكره والمضي قدماً',
          outcome: {
            success: { knowledgeChange: 5, text: 'شكرت الحكيم وواصلت طريقك. منحك بركة بسيطة زادت معرفتك قليلاً.' },
            failure: { knowledgeChange: 5, text: 'شكرت الحكيم وواصلت طريقك.' },
          },
        },
      ],
    },
    {
      id: 'o2',
      type: 'battle',
      region: 'ocean',
      title: 'أخطبوط العمق!',
      description: 'من الظلام العميق، تظهر أذرع ضخمة! أخطبوط عملاق بأعين حمراء يحاصرك! كل ذراع أقوى من السيف!',
      emoji: '🐙',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 30, healthChange: -20, text: 'بقوة خارقة قطعت أذرع الأخطبوط! وجدت لؤلؤاً نادراً يساوي 30 ذهب!' },
            failure: { healthChange: -35, text: 'الأخطبوط أمسكك بأذرعه! كدت تختنق قبل أن تتحرر بصعوبة.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 25, text: 'قدرتك أذهلت الأخطبوط! تراجع وترك لك لؤلؤاً ثميناً!' },
            failure: { healthChange: -20, text: 'قدرتك أثرت قليلاً لكن الأخطبوط لا يزال خطيراً.' },
          },
        },
        {
          text: '🗣️ غناء أغنية البحر',
          statCheck: 'charisma',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 35, knowledgeChange: 10, text: 'بصوتك الجميل، أغمض الأخطبوط عينيه واستسلم للنوم! وجدت كنزاً تحته!' },
            failure: { healthChange: -25, text: 'الأخطبوط لم يتأثر بغنائك! هاجمك بغضب.' },
          },
        },
      ],
    },
    {
      id: 'o3',
      type: 'puzzle',
      region: 'ocean',
      title: 'لغز المحارة السحرية',
      description: 'محارة عملاقة تطفو أمامك. تفتح ببطء وتقول بصوت صدى: "أنا أملك لؤلؤة الحكمة. أجب عن لغزي: ما الشيء الذي يملك فماً لكنه لا يتكلم، وسريراً لكنه لا ينام؟"',
      emoji: '🐚',
      options: [
        {
          text: '🌊 النهر (الإجابة الصحيحة)',
          outcome: {
            success: { knowledgeChange: 15, goldChange: 20, manaChange: 15, text: 'صحيح! النهر يملك فماً وسريراً! المحارة منحتك لؤلؤة الحكمة!' },
            failure: { knowledgeChange: 15, goldChange: 20, manaChange: 15, text: 'صحيح! المحارة منحتك لؤلؤة الحكمة!' },
          },
        },
        {
          text: '🎲 التخمين',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 8, goldChange: 10, text: 'خمت بشكل صحيح! الإجابة: النهر.' },
            failure: { healthChange: -15, manaChange: -10, text: 'خطأ! المحارة أغلقت عليك! فقدت بعض الصحة والمانا قبل أن تتحرر. الإجابة: النهر.' },
          },
        },
      ],
    },
  ],

  castle: [
    {
      id: 'k1',
      type: 'battle',
      region: 'castle',
      title: 'حارس البوابات!',
      description: 'تقف أمام بوابات قلعة الظلام الضخمة. من الظلام يظهر حارس بوابات عملاق بعيون ملتهبة! يزمجر: "لا يدخل هذه القلعة أحد... حياً!"',
      emoji: '👹',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 35, healthChange: -25, reputationChange: 5, text: 'بشجاعة نادرة، هزمت حارس البوابات! البوابة تفتح لك. وجدت ذهباً وأصبحت أسطورة!' },
            failure: { healthChange: -40, text: 'حارس البوابات أقوى بكثير! ضربته أرسلتك تطير. لكنك لم تستسلم.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 30, healthChange: -15, text: 'قدرتك أضعفت الحارس بشكل كبير! سقط وترك لك الطريق مفتوحاً وذهباً!' },
            failure: { healthChange: -30, text: 'قدرتك لم تكن كافية. الحارس أصابك بضربة قوية.' },
          },
        },
        {
          text: '🗣️ إقناعه بأنك صديق',
          statCheck: 'charisma',
          statThreshold: 5,
          outcome: {
            success: { reputationChange: 10, text: 'بكلماتك القوية، أقنعت الحارس بأنك لست عدواً! سمح لك بالمرور باحترام.' },
            failure: { healthChange: -25, text: 'الحارس لا يقنع بالكلام! هاجمك بضراوة.' },
          },
        },
      ],
    },
    {
      id: 'k2',
      type: 'battle',
      region: 'castle',
      title: 'فارس الظلام!',
      description: 'في صالة القلعة المظلمة، يظهر فارس يرتدي درعاً سوداء كالليل! سيفه يشع بضوء أسود. يقول بصوت خافت: "هذا آخر ما ترى..."',
      emoji: '🖤',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 5,
          outcome: {
            success: { goldChange: 40, healthChange: -30, reputationChange: 5, text: 'في معركة ملحمية، حطمت درع فارس الظلام! سقط درعه وكشف عن كنز!' },
            failure: { healthChange: -45, text: 'فارس الظلام أقوى من أي عدو واجهته! كاد أن يقتلك.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 35, healthChange: -20, text: 'قدرتك أحدثت صدعاً في درعه! تراجع وأنت كسبت ذهباً!' },
            failure: { healthChange: -35, text: 'قدرتك لم تؤثر كثيراً على درعه الأسود. أصبت بجروح بالغة.' },
          },
        },
        {
          text: '🛡️ الدفاع والصبر',
          statCheck: 'defense',
          statThreshold: 4,
          outcome: {
            success: { healthChange: -10, goldChange: 25, text: 'صمدت أمام هجماته! فارس الظلام تعب وأنت استغلت الفرصة وأصبته! وجدت ذهباً.' },
            failure: { healthChange: -35, text: 'دفاعك لم يصمد أمام قوة فارس الظلام! أصبت بجروح خطيرة.' },
          },
        },
      ],
    },
    {
      id: 'k3',
      type: 'battle',
      region: 'castle',
      title: 'المعركة النهائية - حارس الكتاب!',
      description: 'أخيراً... تقف أمام حارس الكتاب الأعظم! مخلوق ضخم من ظلام محض بعيون حمراء كالجمر. خلفه يتوهج الكتاب الأعظم بضوء ذهبي. يزمجر: "لن تأخذ الكتاب... ما دمت حياً!"',
      emoji: '👿',
      options: [
        {
          text: '⚔️ الهجوم النهائي!',
          statCheck: 'strength',
          statThreshold: 5,
          outcome: {
            success: { goldChange: 100, reputationChange: 20, text: 'بضربة بطولية أخيرة، حطمت حارس الكتاب! الكتاب الأعظم بين يديك الآن! المملكة ستُنقذ!' },
            failure: { healthChange: -50, text: 'حارس الكتاب أقوى مما تخيلت! ضربته كادت تسحقك. لكنك لم تستسلم!' },
          },
        },
        {
          text: '✨ استخدام كل قوتك',
          outcome: {
            success: { goldChange: 80, reputationChange: 15, healthChange: -20, text: 'بكل ما تملك من قوة وقدرات، هزمت حارس الكتاب! النور عاد للمملكة!' },
            failure: { healthChange: -40, text: 'قواك لم تكفِ تماماً! لكنك ما زلت صامداً.' },
          },
        },
        {
          text: '🗣️ نداء الحلفاء والأمل',
          statCheck: 'charisma',
          statThreshold: 4,
          outcome: {
            success: { reputationChange: 30, text: 'نداءك وصل لكل حلفائك! معاً حطمتم حارس الكتاب! الوحدة هي القوة الحقيقية! الكتاب الأعظم عاد!' },
            failure: { healthChange: -35, text: 'حاولت النداء لكن الصوت لم يصل. حارس الكتاب هاجمك.' },
          },
        },
        {
          text: '🧠 حيلة ذكية',
          statCheck: 'intelligence',
          statThreshold: 5,
          outcome: {
            success: { knowledgeChange: 20, reputationChange: 20, text: 'استخدمت ذكاءك وخدعت حارس الكتاب! سقط في فخك والكتاب الأعظم أصبح في يديك! المعرفة هي القوة الحقيقية!' },
            failure: { healthChange: -45, text: 'الحارس لم يُخدع! هاجمك بضراوة. لكنك لم تستسلم.' },
          },
        },
      ],
    },
  ],
};

// ==========================================
// 20 إنجاز
// ==========================================
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'dragon_reveal', name: 'كشفت السر', description: 'لعبت بكريم وتحول لتنين', emoji: '🐉' },
  { id: 'divine_protection', name: 'محمي إلهياً', description: 'أكملت اللعبة كآية بوحلاسة دون موت', emoji: '👼' },
  { id: 'word_master', name: 'سيد الكلام', description: 'أنهيت 5 معارك بالمفاوضة فقط', emoji: '🗣️' },
  { id: 'rich', name: 'الثري', description: 'جمعت 200 ذهب', emoji: '💰' },
  { id: 'legendary_team', name: 'الفريق الأسطوري', description: 'جندت 3 حلفاء في رحلة واحدة', emoji: '👥' },
  { id: 'puzzle_master', name: 'حلّال الألغاز', description: 'حللت 5 ألغاز', emoji: '🧩' },
  { id: 'merchant_friend', name: 'صديق التجار', description: 'اشتريت من 5 تجار', emoji: '🏪' },
  { id: 'knowledge_seeker', name: 'باحث المعرفة', description: 'وصلت معرفتك لـ 50', emoji: '📚' },
  { id: 'reputation_hero', name: 'بطل السمعة', description: 'وصلت سمعتك لـ 80', emoji: '⭐' },
  { id: 'explorer', name: 'المستكشف', description: 'وصلت للمنطقة الرابعة', emoji: '🗺️' },
  { id: 'first_steps', name: 'الخطوات الأولى', description: 'أكملت 3 أحداث', emoji: '👣' },
  { id: 'ally_ibrahim', name: 'صديق إبراهيم', description: 'جندت إبراهيم كحليف', emoji: '⚔️' },
  { id: 'ally_nour', name: 'رفيق نور', description: 'جندت نور كحليفة', emoji: '✨' },
  { id: 'all_regions', name: 'عابر الممالك', description: 'زرت كل المناطق الست', emoji: '🌍' },
  { id: 'game_complete', name: 'أكملت المغامرة', description: 'أنهيت اللعبة كاملة', emoji: '🏆' },
  { id: 'chaos_glory', name: 'الفوضى المجيدة', description: 'أكملت اللعبة كآية بوبكر', emoji: '😈' },
  { id: 'heroic_death', name: 'الموت البطولي', description: 'متَّ أثناء حماية حليف', emoji: '💀' },
  { id: 'peaceful', name: 'المسالم', description: 'أنهيت اللعبة دون قتال عدو مباشرة', emoji: '☮️' },
  { id: 'survivor', name: 'الناجي', description: 'نجوت من الموت 3 مرات', emoji: '🩹' },
  { id: 'speed_runner', name: 'العدّاء', description: 'أكملت اللعبة في أقل من 30 دقيقة', emoji: '⚡' },
];

// ==========================================
// 8 نهايات
// ==========================================
export const ENDINGS: Ending[] = [
  { id: 'legendary_hero', name: 'البطل الأسطوري', description: 'أكملت كل المراحل بصحة فوق 70', emoji: '🏆' },
  { id: 'knowledge_guardian', name: 'حارس المعرفة', description: 'أكملت اللعبة بمعرفة 50 أو أكثر', emoji: '📚' },
  { id: 'nation_leader', name: 'قائد الأمة', description: 'أكملت اللعبة مع 3 حلفاء', emoji: '👑' },
  { id: 'martyr', name: 'الشهيد', description: 'متَّ أثناء حماية حليف في المنطقة الأخيرة', emoji: '💀' },
  { id: 'mysterious_survivor', name: 'الناجي الغامض', description: 'أكملت اللعبة بالهروب من كل المعارك', emoji: '🥷' },
  { id: 'glorious_chaos', name: 'الفوضى المجيدة', description: 'مخصصة لآية بوبكر', emoji: '😈' },
  { id: 'dragon_legend', name: 'التنين الأسطوري', description: 'مخصصة لكريم بعد تحوله لتنين مرتين', emoji: '🐉' },
  { id: 'secret_ending', name: '???', description: '???', emoji: '🔮' },
];

// ==========================================
// عناصر التاجر
// ==========================================
export const MERCHANT_ITEMS: MerchantItem[] = [
  { name: 'جرعة الشفاء', price: 15, emoji: '🧴', effectAr: 'تستعيد 30 صحة', healthChange: 30 },
  { name: 'بلورة المانا', price: 20, emoji: '💎', effectAr: 'تزيد المانا 25', manaChange: 25 },
  { name: 'تعويذة الدفاع', price: 25, emoji: '🛡️', effectAr: 'تزيد الدفاع مؤقتاً' },
  { name: 'خريطة قديمة', price: 10, emoji: '🗺️', effectAr: 'تزيد المعرفة 10', knowledgeChange: 10 },
  { name: 'خاتم الحظ', price: 30, emoji: '💍', effectAr: 'يمنح حظاً إضافياً' },
  { name: 'جرعة القوة', price: 18, emoji: '💪', effectAr: 'تزيد القوة مؤقتاً', healthChange: 10 },
];

// ==========================================
// قدرات الحلفاء السلبية
// ==========================================
export const ALLY_PASSIVES: Record<string, AllyPassive> = {
  ibrahim: { passiveAbilityAr: '+5 ضرر إضافي في كل معركة' },
  abdullah: { passiveAbilityAr: 'يمتص 10 ضرر كل جولة' },
  sufian: { passiveAbilityAr: 'يجد ذهباً إضافياً عشوائياً' },
  boukhloua: { passiveAbilityAr: '10% احتمال تحويل عدو لضفدع' },
  yacine: { passiveAbilityAr: 'ضرر مضاعف عند صحة منخفضة' },
  ousama: { passiveAbilityAr: '+1 لكل إحصائية للحلفاء' },
  karim: { passiveAbilityAr: '10% احتمال تحول لتنين يفوز بالمعركة تلقائياً (5% يحرقك)' },
  lina: { passiveAbilityAr: 'ترى نتيجة خيار واحد قبل الاختيار' },
  nour: { passiveAbilityAr: '+5 صحة كل حدث' },
  asma: { passiveAbilityAr: 'خصم 50% عند التجار' },
  maram: { passiveAbilityAr: 'العدو مشلول جولة إضافية' },
  aya1: { passiveAbilityAr: 'ترى الحدث القادم مقدماً' },
  doua_bentemra: { passiveAbilityAr: '+5 ضرر ناري إضافي' },
  doua_bensabaha: { passiveAbilityAr: '+3 صحة لك وكل حلفاء كل حدث' },
  doua_bensaidan: { passiveAbilityAr: 'هروب مضمون من أول معركة في المنطقة' },
  rawan: { passiveAbilityAr: 'حيوانات الغابة تحارب معك' },
  bouchra: { passiveAbilityAr: 'شخصيات غير عدائية تطيعك مجاناً' },
  feryal: { passiveAbilityAr: 'تكشف نوايا الشخصيات تلقائياً' },
  basma: { passiveAbilityAr: 'تجد ذهباً إضافياً بنسبة مضاعفة' },
  chaimaa: { passiveAbilityAr: 'ترى مسارات سرية إضافية' },
  khaira: { passiveAbilityAr: 'تتجنب أول مواجهة في كل منطقة' },
  fatiha: { passiveAbilityAr: 'تحل أي لغز تلقائياً' },
  aya_bouhalassa: { passiveAbilityAr: 'تبقى بنقطة صحة واحدة بدل الموت مرة واحدة' },
  aya_boubaker: { passiveAbilityAr: 'نتيجة إضافية كوميدية إيجابية في كل حدث' },
  naska: { passiveAbilityAr: 'استعادة كاملة للصحة والمانا في نهاية كل منطقة' },
  boudar: { passiveAbilityAr: 'تضرب أولاً في كل معركة' },
  benyamina: { passiveAbilityAr: 'ضرر مضاعف في الجولة الأولى' },
};
