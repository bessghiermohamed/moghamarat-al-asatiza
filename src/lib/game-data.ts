// ============================================
// مغامرة الأساتذة - Game Data
// ============================================

export interface CharacterStats {
  strength: number; // القوة
  intelligence: number; // الذكاء
  luck: number; // الحظ
  charisma: number; // الكاريزما
  mana: number; // المانا
  defense: number; // الدفاع
}

export interface Character {
  id: string;
  name: string;
  class: string;
  classAr: string;
  stats: CharacterStats;
  uniqueAbility: string;
  uniqueAbilityAr: string;
  signature: string;
  emoji: string;
  glowColor: string; // Tailwind color for border glow
}

export interface Region {
  id: string;
  name: string;
  description: string;
  eventCount: number;
  specialDanger?: string;
  emoji: string;
}

export interface GameResources {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  reputation: number;
  knowledge: number;
  allies: Ally[];
}

export interface Ally {
  characterId: string;
  name: string;
  passiveAbility: string;
  passiveAbilityAr: string;
}

export interface EventOption {
  text: string;
  statCheck?: keyof CharacterStats;
  statThreshold?: number;
  reputationCheck?: number;
  knowledgeCheck?: number;
  outcome: EventOutcome;
}

export interface EventOutcome {
  success: {
    healthChange?: number;
    manaChange?: number;
    goldChange?: number;
    reputationChange?: number;
    knowledgeChange?: number;
    allyGain?: string;
    text: string;
  };
  failure: {
    healthChange?: number;
    manaChange?: number;
    goldChange?: number;
    reputationChange?: number;
    knowledgeChange?: number;
    text: string;
  };
}

export interface GameEvent {
  id: string;
  type: 'encounter' | 'battle' | 'puzzle' | 'merchant' | 'comedy' | 'crossroads' | 'secret';
  region: string;
  title: string;
  description: string;
  emoji: string;
  options: EventOption[];
  specialCondition?: string;
}

export interface Enemy {
  name: string;
  health: number;
  damage: number;
  goldReward: number;
  emoji: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: string;
}

export interface Ending {
  id: string;
  name: string;
  description: string;
  condition: string;
  emoji: string;
}

export interface MerchantItem {
  name: string;
  price: number;
  emoji: string;
  effect: string;
  effectAr: string;
}

// ============================================
// 27 شخصية
// ============================================
export const CHARACTERS: Character[] = [
  {
    id: 'ibrahim',
    name: 'إبراهيم',
    class: 'Warrior',
    classAr: 'محارب',
    stats: { strength: 5, intelligence: 2, luck: 3, charisma: 2, mana: 2, defense: 4 },
    uniqueAbility: 'Double Strike',
    uniqueAbilityAr: 'الضربة المزدوجة - يضرب العدو ضربتين متتاليتين في جولة واحدة',
    signature: 'السيف لا يكذب',
    emoji: '⚔️',
    glowColor: 'red',
  },
  {
    id: 'abdullah',
    name: 'عبد الله',
    class: 'Guardian',
    classAr: 'حارس',
    stats: { strength: 4, intelligence: 3, luck: 2, charisma: 3, mana: 2, defense: 5 },
    uniqueAbility: 'Shield of Faith',
    uniqueAbilityAr: 'درع الإيمان - يمتص الضربة التالية كاملاً مرة واحدة',
    signature: 'لن يمر أحد',
    emoji: '🛡️',
    glowColor: 'red',
  },
  {
    id: 'sufian',
    name: 'سفيان',
    class: 'Thief',
    classAr: 'لص',
    stats: { strength: 3, intelligence: 3, luck: 5, charisma: 3, mana: 2, defense: 2 },
    uniqueAbility: 'Stealth Steal',
    uniqueAbilityAr: 'السرقة الخفية - يسرق آيتماً عشوائياً من العدو أو التاجر دون ذهب',
    signature: 'ما لا تراه هو ما يقتلك',
    emoji: '🗡️',
    glowColor: 'gray',
  },
  {
    id: 'boukhloua',
    name: 'بوخلوة',
    class: 'Sorcerer',
    classAr: 'ساحر',
    stats: { strength: 1, intelligence: 5, luck: 2, charisma: 3, mana: 5, defense: 2 },
    uniqueAbility: 'Chaos Spell',
    uniqueAbilityAr: 'تعويذة الفوضى - نتيجة عشوائية تماماً قد تدمر العدو أو تحولك لضفدعة لجولة واحدة',
    signature: 'السحر لا يُفهم بل يُشعر',
    emoji: '🔮',
    glowColor: 'purple',
  },
  {
    id: 'yacine',
    name: 'ياسين',
    class: 'Fighter',
    classAr: 'مقاتل',
    stats: { strength: 4, intelligence: 3, luck: 3, charisma: 3, mana: 3, defense: 3 },
    uniqueAbility: 'Warrior Rage',
    uniqueAbilityAr: 'غضب المحارب - يتضاعف ضرره عندما تنخفض صحته لأقل من 30',
    signature: 'الألم يصنع المحارب',
    emoji: '💪',
    glowColor: 'red',
  },
  {
    id: 'ousama',
    name: 'أسامة',
    class: 'Commander',
    classAr: 'قائد',
    stats: { strength: 3, intelligence: 4, luck: 2, charisma: 5, mana: 3, defense: 3 },
    uniqueAbility: 'Command Shout',
    uniqueAbilityAr: 'صرخة القيادة - تعزز إحصائيات كل الحلفاء بنقطة واحدة لبقية المنطقة',
    signature: 'القائد يسير في المقدمة',
    emoji: '👑',
    glowColor: 'yellow',
  },
  {
    id: 'karim',
    name: 'كريم',
    class: 'Unknown',
    classAr: 'مجهول',
    stats: { strength: 3, intelligence: 3, luck: 3, charisma: 3, mana: 3, defense: 3 },
    uniqueAbility: 'Sleeping Dragon',
    uniqueAbilityAr: 'التنين النائم - في حدث عشوائي واحد من كل عشرة ينكشف كونه تنيناً ويدمر كل الأعداء',
    signature: 'أنا لستُ ما تظن',
    emoji: '🐉',
    glowColor: 'black',
  },
  {
    id: 'lina',
    name: 'لينا',
    class: 'Sage',
    classAr: 'حكيمة',
    stats: { strength: 1, intelligence: 5, luck: 3, charisma: 4, mana: 4, defense: 2 },
    uniqueAbility: 'Foresight',
    uniqueAbilityAr: 'البصيرة - ترى نتيجة كل خيار قبل اتخاذه في حدث واحد لكل منطقة',
    signature: 'المعرفة هي القوة الحقيقية',
    emoji: '📖',
    glowColor: 'purple',
  },
  {
    id: 'nour',
    name: 'نور',
    class: 'Healer',
    classAr: 'مشفيّة',
    stats: { strength: 2, intelligence: 4, luck: 3, charisma: 5, mana: 4, defense: 3 },
    uniqueAbility: 'Instant Heal',
    uniqueAbilityAr: 'الشفاء الفوري - تستعيد 30 نقطة صحة مرة واحدة لكل منططقة',
    signature: 'النور يشفي كل جرح',
    emoji: '✨',
    glowColor: 'green',
  },
  {
    id: 'asma',
    name: 'أسماء',
    class: 'Merchant',
    classAr: 'تاجرة',
    stats: { strength: 2, intelligence: 4, luck: 4, charisma: 4, mana: 2, defense: 2 },
    uniqueAbility: 'Negotiation',
    uniqueAbilityAr: 'المفاوضة - تحصل دائماً على خصم 50% عند أي تاجر',
    signature: 'كل شيء قابل للتفاوض',
    emoji: '💰',
    glowColor: 'yellow',
  },
  {
    id: 'maram',
    name: 'مرام',
    class: 'Poet',
    classAr: 'شاعرة',
    stats: { strength: 1, intelligence: 5, luck: 4, charisma: 5, mana: 4, defense: 1 },
    uniqueAbility: 'Enchanting Poem',
    uniqueAbilityAr: 'قصيدة السحر - تُشلّ العدو بالكلمات لـ 3 جولات بدون قتال',
    signature: 'الكلمة أقوى من السيف',
    emoji: '📜',
    glowColor: 'purple',
  },
  {
    id: 'aya1',
    name: 'آية (الأولى)',
    class: 'Priestess',
    classAr: 'كاهنة',
    stats: { strength: 2, intelligence: 5, luck: 4, charisma: 3, mana: 5, defense: 2 },
    uniqueAbility: 'Prophecy',
    uniqueAbilityAr: 'التنبؤ - تعرف الحدث القادم في المنطقة قبل الوصول إليه',
    signature: 'الغيب لا يخفى على من يُصغي',
    emoji: '🕊️',
    glowColor: 'white',
  },
  {
    id: 'doua_bentemra',
    name: 'دعاء بن تمرة',
    class: 'Fire Sorceress',
    classAr: 'ساحرة النار',
    stats: { strength: 4, intelligence: 4, luck: 3, charisma: 3, mana: 4, defense: 2 },
    uniqueAbility: 'Inferno',
    uniqueAbilityAr: 'الجحيم - تحرق كل الأعداء في المنطقة دفعة واحدة لكن تستهلك 25 مانا',
    signature: 'النار لا تسأل إذناً',
    emoji: '🔥',
    glowColor: 'red',
  },
  {
    id: 'doua_bensabaha',
    name: 'دعاء بن صباحة',
    class: 'Water Sorceress',
    classAr: 'ساحرة الماء',
    stats: { strength: 2, intelligence: 5, luck: 3, charisma: 4, mana: 5, defense: 3 },
    uniqueAbility: 'Healing Wave',
    uniqueAbilityAr: 'موجة الشفاء - تشفي اللاعب وكل الحلفاء 20 نقطة لكل واحد',
    signature: 'الماء يجد طريقه دائماً',
    emoji: '🌊',
    glowColor: 'blue',
  },
  {
    id: 'doua_bensaidan',
    name: 'دعاء بن سعيدان',
    class: 'Wind Sorceress',
    classAr: 'ساحرة الريح',
    stats: { strength: 3, intelligence: 4, luck: 4, charisma: 3, mana: 4, defense: 2 },
    uniqueAbility: 'Storm',
    uniqueAbilityAr: 'العاصفة - تهرب من أي معركة فوراً دون خسارة صحة',
    signature: 'الريح لا تُقيَّد',
    emoji: '💨',
    glowColor: 'green',
  },
  {
    id: 'rawan',
    name: 'روان',
    class: 'Forest Ranger',
    classAr: 'غابية',
    stats: { strength: 3, intelligence: 3, luck: 5, charisma: 4, mana: 3, defense: 3 },
    uniqueAbility: 'Nature Language',
    uniqueAbilityAr: 'لغة الطبيعة - تتحدث مع الحيوانات وتستخدمها حلفاء مؤقتين في معركة',
    signature: 'الغابة تحمي من تحترمها',
    emoji: '🌿',
    glowColor: 'green',
  },
  {
    id: 'bouchra',
    name: 'بشرى',
    class: 'Princess',
    classAr: 'أميرة',
    stats: { strength: 2, intelligence: 4, luck: 3, charisma: 5, mana: 3, defense: 3 },
    uniqueAbility: 'Royal Authority',
    uniqueAbilityAr: 'السلطة الملكية - تأمر أي شخصية غير عدائية بالطاعة والمساعدة دون ذهب',
    signature: 'الأميرة لا تطلب تُصدر الأوامر',
    emoji: '👸',
    glowColor: 'yellow',
  },
  {
    id: 'feryal',
    name: 'فريال',
    class: 'Investigator',
    classAr: 'محققة',
    stats: { strength: 2, intelligence: 5, luck: 3, charisma: 4, mana: 3, defense: 2 },
    uniqueAbility: 'Investigation',
    uniqueAbilityAr: 'التحقيق - تكشف الهوية الحقيقية والنوايا لأي شخصية تلتقيها',
    signature: 'لا شيء يختفي إلى الأبد',
    emoji: '🔍',
    glowColor: 'purple',
  },
  {
    id: 'basma',
    name: 'بسمة',
    class: 'Farmer',
    classAr: 'فلاحة',
    stats: { strength: 3, intelligence: 3, luck: 5, charisma: 4, mana: 2, defense: 3 },
    uniqueAbility: 'Farm Luck',
    uniqueAbilityAr: 'حظ المزرعة - تجد أدوات وطعام مجاني بنسبة ضعف ما يجده غيرها',
    signature: 'الأرض تعطي من يعمل',
    emoji: '🌾',
    glowColor: 'green',
  },
  {
    id: 'chaimaa',
    name: 'شيماء',
    class: 'Seer',
    classAr: 'عرّافة',
    stats: { strength: 1, intelligence: 5, luck: 5, charisma: 3, mana: 5, defense: 1 },
    uniqueAbility: 'Hidden Map',
    uniqueAbilityAr: 'الخريطة المخفية - ترى مسارات سرية بين المناطق لا يراها غيرها',
    signature: 'الحقيقة خلف كل وهم',
    emoji: '🗺️',
    glowColor: 'purple',
  },
  {
    id: 'khaira',
    name: 'خيرة',
    class: 'Spy',
    classAr: 'جاسوسة',
    stats: { strength: 3, intelligence: 5, luck: 4, charisma: 3, mana: 3, defense: 3 },
    uniqueAbility: 'Disguise',
    uniqueAbilityAr: 'التنكّر - تتجنب أي مواجهة مع عدو دون قتال ودون هروب',
    signature: 'الظل لا يُرى',
    emoji: '🥷',
    glowColor: 'gray',
  },
  {
    id: 'fatiha',
    name: 'فتيحة',
    class: 'Elder Sage',
    classAr: 'حكيمة العجوز',
    stats: { strength: 1, intelligence: 5, luck: 4, charisma: 5, mana: 4, defense: 2 },
    uniqueAbility: 'Wisdom of Ages',
    uniqueAbilityAr: 'حكمة الزمن - تحل أي لغز تلقائياً دون خسارة',
    signature: 'من عاش كثيراً رأى كل شيء',
    emoji: '🧓',
    glowColor: 'purple',
  },
  {
    id: 'aya_bouhalassa',
    name: 'آية بوحلاسة',
    class: 'Angel',
    classAr: 'ملاك',
    stats: { strength: 3, intelligence: 4, luck: 4, charisma: 5, mana: 4, defense: 3 },
    uniqueAbility: 'Divine Protection',
    uniqueAbilityAr: 'الحماية الإلهية - لا تموت في أول مرة تصل فيها الصحة للصفر بل تبقى بنقطة واحدة',
    signature: 'أنا لستُ وحدك',
    emoji: '👼',
    glowColor: 'white',
  },
  {
    id: 'aya_boubaker',
    name: 'آية بوبكر',
    class: 'Good Demon',
    classAr: 'شيطانة طيبة',
    stats: { strength: 4, intelligence: 3, luck: 5, charisma: 3, mana: 3, defense: 3 },
    uniqueAbility: 'Funny Chaos',
    uniqueAbilityAr: 'الفوضى المضحكة - كل حدث يحتمل نتيجة إضافية كوميدية غير متوقعة دائماً في صالحها',
    signature: 'الحياة مضحكة فلنضحك',
    emoji: '😈',
    glowColor: 'black',
  },
  {
    id: 'naska',
    name: 'ناسكة',
    class: 'Nun',
    classAr: 'راهبة',
    stats: { strength: 1, intelligence: 5, luck: 4, charisma: 4, mana: 5, defense: 2 },
    uniqueAbility: 'Meditation',
    uniqueAbilityAr: 'التأمل - تستعيد كامل مواردها الصحة والمانا في نهاية كل منطقة',
    signature: 'الصمت أعمق الكلام',
    emoji: '🧘',
    glowColor: 'white',
  },
  {
    id: 'boudar',
    name: 'بودار',
    class: 'Hunter',
    classAr: 'صياد',
    stats: { strength: 4, intelligence: 3, luck: 4, charisma: 3, mana: 2, defense: 4 },
    uniqueAbility: 'Sniper',
    uniqueAbilityAr: 'القناص - تضرب أولاً في كل معركة قبل أي عدو',
    signature: 'السهم لا يخطئ هدفه',
    emoji: '🏹',
    glowColor: 'green',
  },
  {
    id: 'benyamina',
    name: 'بن يمينة',
    class: 'Knight',
    classAr: 'فارس',
    stats: { strength: 5, intelligence: 2, luck: 3, charisma: 4, mana: 2, defense: 4 },
    uniqueAbility: 'Cavalry Charge',
    uniqueAbilityAr: 'هجوم الفرسان - يضاعف الضرر في الجولة الأولى من كل معركة فقط',
    signature: 'الشرف فوق كل شيء',
    emoji: '🐴',
    glowColor: 'red',
  },
];

// ============================================
// 6 مناطق
// ============================================
export const REGIONS: Region[] = [
  {
    id: 'forest',
    name: 'غابة الأسرار',
    description: 'المنطقة البداية المليئة بالأشجار العملاقة والمخلوقات الغريبة',
    eventCount: 3,
    emoji: '🌲',
  },
  {
    id: 'city',
    name: 'مدينة النور',
    description: 'المدينة الرئيسية حيث يعيش التجار والحرفيون وكثير من الشخصيات المعروفة',
    eventCount: 4,
    emoji: '🏙️',
  },
  {
    id: 'mountains',
    name: 'جبال الغموض',
    description: 'جبال شاهقة مليئة بالألغاز والكهوف',
    eventCount: 3,
    emoji: '⛰️',
  },
  {
    id: 'desert',
    name: 'صحراء النسيان',
    description: 'صحراء قاسية تؤثر على الذاكرة - خطر خاص: فقدان معرفة عشوائية إذا لم تحل لغزها الرئيسي',
    eventCount: 4,
    specialDanger: 'فقدان معرفة عشوائية إذا لم تُحل لغز الصحراء',
    emoji: '🏜️',
  },
  {
    id: 'ocean',
    name: 'أعماق البحر الفضي',
    description: 'منطقة تحت الماء غامضة فيها مخلوقات نادرة وكنوز',
    eventCount: 3,
    emoji: '🌊',
  },
  {
    id: 'castle',
    name: 'قلعة الظلام',
    description: 'مقر العدو النهائي - معركتان تمهيديتان ثم المعركة الأخيرة ضد حارس الكتاب',
    eventCount: 3,
    emoji: '🏰',
  },
];

// ============================================
// الأعداء حسب المنطقة
// ============================================
export const REGION_ENEMIES: Record<string, Enemy[]> = {
  forest: [
    { name: 'ذئب الظلام', health: 30, damage: 10, goldReward: 8, emoji: '🐺' },
    { name: 'العنكبوت العملاق', health: 40, damage: 12, goldReward: 10, emoji: '🕷️' },
    { name: 'شجرة ملعونة', health: 50, damage: 8, goldReward: 12, emoji: '🌳' },
  ],
  city: [
    { name: 'لص الطريق', health: 35, damage: 15, goldReward: 15, emoji: '🦹' },
    { name: 'حارس فاسد', health: 50, damage: 12, goldReward: 18, emoji: '💂' },
    { name: 'تاجر الغش', health: 25, damage: 8, goldReward: 25, emoji: '🤥' },
    { name: 'قاطع طريق', health: 45, damage: 18, goldReward: 20, emoji: '⚔️' },
  ],
  mountains: [
    { name: 'العملاق الحجري', health: 70, damage: 20, goldReward: 25, emoji: '🗿' },
    { name: 'التنين الصغير', health: 60, damage: 25, goldReward: 30, emoji: '🐲' },
    { name: 'نسر الجبال', health: 40, damage: 15, goldReward: 15, emoji: '🦅' },
  ],
  desert: [
    { name: 'عقرب العملاق', health: 45, damage: 18, goldReward: 20, emoji: '🦂' },
    { name: 'مومياء الغضب', health: 60, damage: 22, goldReward: 25, emoji: '🧟' },
    { name: 'رملة حية', health: 35, damage: 15, goldReward: 15, emoji: '🌀' },
    { name: 'جني الصحراء', health: 55, damage: 20, goldReward: 35, emoji: '🧞' },
  ],
  ocean: [
    { name: 'أخطبوط العمق', health: 65, damage: 22, goldReward: 30, emoji: '🐙' },
    { name: 'سمكة القرش السحرية', health: 55, damage: 25, goldReward: 25, emoji: '🦈' },
    { name: 'حورية الغدر', health: 40, damage: 18, goldReward: 35, emoji: '🧜‍♀️' },
  ],
  castle: [
    { name: 'حارس البوابات', health: 80, damage: 25, goldReward: 35, emoji: '👹' },
    { name: 'فارس الظلام', health: 90, damage: 30, goldReward: 40, emoji: '🖤' },
    { name: 'حارس الكتاب (الزعيم النهائي)', health: 150, damage: 35, goldReward: 100, emoji: '👿' },
  ],
};

// ============================================
// الأحداث حسب المنطقة
// ============================================
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
            failure: { text: 'تجاهلته وواصلت طريقك. لا شيء تغير، لكن صوت أنينه يطاردك.' },
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
            success: { goldChange: 12, text: 'استخدمت قدرتك الخاصة وقضيت على العنكبوت بطريقة مذهلة! وجدت كنزاً صغيراً!' },
            failure: { healthChange: -15, text: 'قدرتك لم تكن فعالة كفاية، لكنك نجوت بأضرار أقل.' },
          },
        },
        {
          text: '🏃 الهروب',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { text: 'هرولت بين الأشجار ونجوت! العنكبوت لم يستطع ملاحقتك في الأغصان الكثيفة.' },
            failure: { healthChange: -20, text: 'حاولت الهروب لكن شبكة العنكبوت أمسكتك! أصبت قبل أن تتحرر.' },
          },
        },
        {
          text: '🗣️ المفاوضة',
          statCheck: 'charisma',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 15, reputationChange: 2, text: 'بطريقة ما، أقنعت العنكبوت بالانسحاب! ووجدت كنزاً مخفياً في جحره.' },
            failure: { healthChange: -15, text: 'العنكبوت لا يفهم الكلام! هاجمك وأصابك قبل أن تتراجع.' },
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
            failure: { knowledgeChange: 10, goldChange: 15, text: 'أحسنت! الحفرة كلما أخذت منها تراب كبرت! الشجرة منحتك المعرفة وذهباً.' },
          },
        },
        {
          text: '🎲 التخمين العشوائي',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 5, goldChange: 8, text: 'خمنت بشكل صحيح! الشجرة منحتك مكافأة صغيرة.' },
            failure: { healthChange: -10, text: 'إجابة خاطئة! الشجرة أطلقت أشواكاً أصابتك. الغز حله: الحفرة.' },
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
            failure: { goldChange: -15, healthChange: 30, text: 'شربت الجرعة وشعرت بالدفء يسري في جسدك. صحتك تعافت!' },
          },
        },
        {
          text: '💎 بلورة المانا (20 ذهب) - تزيد المانا 25',
          outcome: {
            success: { goldChange: -20, manaChange: 25, text: 'البلورة توهجت في يدك وشعرت بطاقة سحرية هائلة تتدفق!' },
            failure: { goldChange: -20, manaChange: 25, text: 'البلورة توهجت في يدك وشعرت بطاقة سحرية هائلة تتدفق!' },
          },
        },
        {
          text: '🛡️ تعويذة الدفاع (25 ذهب) - تزيد الدفاع نقطة واحدة',
          outcome: {
            success: { goldChange: -25, text: 'التعويذة ذابت في جلدك! تشعر بصلابة غير عادية. دفاعك زاد!' },
            failure: { goldChange: -25, text: 'التعويذة ذابت في جلدك! تشعر بصلابة غير عادية. دفاعك زاد!' },
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
      description: 'في زقاق مظلم، يظهر ثلاثة لصوص يحيطون بك! قائدهم يتقدم بسكين واضح: "أعطنا ذهبك أو نأخذه بالقوة!"',
      emoji: '🦹',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 3,
          outcome: {
            success: { goldChange: 20, healthChange: -15, reputationChange: 3, text: 'هزمت اللصوص بشجاعة! وجدت 20 ذهب في جيوبهم وأصبحت بطلاً في المدينة!' },
            failure: { goldChange: -10, healthChange: -25, text: 'اللصوص أقوى مما توقعت! سرقوا بعض ذهبك وأصابوك.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 15, text: 'استخدمت قدرتك وأصابت اللصوص بالرعب! فروا تاركين ذهبهم!' },
            failure: { goldChange: -5, healthChange: -15, text: 'قدرتك أثرت قليلاً لكن اللصوص لا يزالون خطيرين. فقدت بعض الذهب.' },
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
            success: { reputationChange: 5, text: 'أقنعتهم بأنك لست فريسة سهلة! انسحبوا باحترام وأنت كسبت سمعة.' },
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
      description: 'بينما تمشي في السوق، تعثرت ببرميل عجة طائر! البرميل ينقلب وتطير العجة في الهواء وتسقط على رأس تاجر متجهم! التاجر ينظر إليك بغضب... وعجته على رأسه تبدو كقبعات مضحكة!',
      emoji: '😂',
      options: [
        {
          text: '😄 الاعتذار بابتسامة وعرض تعويضه',
          statCheck: 'charisma',
          statThreshold: 2,
          outcome: {
            success: { reputationChange: 3, goldChange: -5, text: 'التاجر انفجر ضاحكاً رغم غضبه! قال: "هذه أفضل قبعة شفتها!". أصبحتم أصدقاء.' },
            failure: { reputationChange: -2, goldChange: -10, text: 'التاجر لم يضحك. أخذ تعويضاً ومضى وهو يزمجر.' },
          },
        },
        {
          text: '🏃 الهرب بسرعة!',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { text: 'هربت بسرعة البرق! لا أحد عرف من أنت. العجة بقيت ذكرى مضحكة في السوق.' },
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
      description: 'تصل إلى مفترق طرق في قلب الجبال. الطريق الأيسر يؤدي إلى كهف مظلم تسمع منه أصوات غريبة. الطريق الأيمن يمر فوق جسر حجراني قديم فوق هوة سحيقة.',
      emoji: '⛰️',
      options: [
        {
          text: '🕳️ دخول الكهف المظلم',
          statCheck: 'intelligence',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 15, goldChange: 20, text: 'الكهف يحتوي على مكتبة قديمة! وجدت معرفة وذهباً مخفياً. المخاطر كانت تستحق العناء!' },
            failure: { healthChange: -20, text: 'الظلام كان خانقاً! سقطت في حفرة وأصبت. لم تجد شيئاً مفيداً.' },
          },
        },
        {
          text: '🌉 عبور الجسر الحجري',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { goldChange: 15, text: 'الجسر كان آمناً! وجدت كنزاً مخفياً تحت أحد الأحجار في المنتصف.' },
            failure: { healthChange: -25, text: 'الجسر انهار جزئياً! كدت تسقط في الهوة وأصبت بجروح.' },
          },
        },
        {
          text: '🗺️ البحث عن مسار سري (شيماء فقط)',
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
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 20, text: 'قدرتك الخاصة أذهلت العملاق! تراجع وترك لك طريقاً وذهباً!' },
            failure: { healthChange: -25, text: 'العملاق لم يتأثر بقدرتك كثيراً. أصبت قبل أن يتراجع.' },
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
            success: { reputationChange: 5, text: 'أقنعت العملاق بأنك مسافر سلمي! سمح لك بالمرور وأصبحت صديقه.' },
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
            success: { knowledgeChange: 15, goldChange: 20, text: 'صحيح! الريح! الجدار ينفتح ويكشف عن غرفة كنز! حصلت على معرفة وذهب!' },
            failure: { knowledgeChange: 15, goldChange: 20, text: 'صحيح! الريح! الجدار ينفتح ويكشف عن غرفة كنز!' },
          },
        },
        {
          text: '🎲 التخمين',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 5, goldChange: 10, text: 'خمنت بشكل صحيح! الإجابة: الريح. حصلت على مكافأة صغيرة.' },
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
            failure: { healthChange: -20, text: 'سراب! الواحة اختفت وضاعت طاقتك في المشي تحت الشمس الحارقة.' },
          },
        },
        {
          text: '🪨 التوجه نحو الصخور المظللة',
          outcome: {
            success: { healthChange: 5, knowledgeChange: 10, text: 'الصخور كانت آمنة. وجدت نقوشاً قديمة على جدرانها تعطيك معرفة.' },
            failure: { healthChange: 5, knowledgeChange: 10, text: 'الصخور كانت آمنة. وجدت نقوشاً قديمة على جدرانها تعطيك معرفة.' },
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
            failure: { healthChange: -30, knowledgeChange: -5, text: 'المومياء ألعت عليك لعنة! أصبت جسدياً وفقدت بعض المعرفة.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 20, text: 'قدرتك أبطلت لعنة المومياء! تراجعت خائفة وتركت كنزها.' },
            failure: { healthChange: -20, knowledgeChange: -5, text: 'المومياء قاومت قدرتك! أصبت وفقدت بعض المعرفة.' },
          },
        },
        {
          text: '🏃 الهروب عبر الرمال',
          statCheck: 'luck',
          statThreshold: 4,
          outcome: {
            success: { text: 'ركضت عبر العاصفة الرملية ونجوت! المومياء لا تستطيع اللحاق بك.' },
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
      description: '⚠️ لغز رئيسي! عمود حجري في وسط الصحراء يحمل لغزاً: "ما الشيء الذي لا يمكنك رؤيته لكنه يراك دائماً؟" إذا أخطأت، ستفقد معرفة عشوائية!',
      emoji: '⚠️',
      options: [
        {
          text: '👁️ المستقبل (الإجابة الصحيحة)',
          outcome: {
            success: { knowledgeChange: 20, goldChange: 25, text: 'أحسنت! المستقبل لا تراه لكنه يرى طريقك! نجوت من لعنة النسيان وحصلت على معرفة عظيمة!' },
            failure: { knowledgeChange: 20, goldChange: 25, text: 'أحسنت! المستقبل! حصلت على مكافأة عظيمة!' },
          },
        },
        {
          text: '🎲 التخمين',
          statCheck: 'luck',
          statThreshold: 4,
          outcome: {
            success: { knowledgeChange: 5, goldChange: 10, text: 'خمنت بشكل صحيح! الإجابة: المستقبل. نجوت بصعوبة.' },
            failure: { knowledgeChange: -10, healthChange: -15, text: 'خطأ! لعنة النسيان أصابتك! فقدت معرفة وأصبت. الإجابة: المستقبل.' },
          },
        },
      ],
    },
    {
      id: 'd4',
      type: 'encounter',
      region: 'desert',
      title: 'جني الصحراء',
      description: 'من قلب إعصار رملي يظهر جني بملابس براقة! يقول: "أنا جني الصحراء! لي ثلاث أمنيات... لكن واحدة فقط لك! اختر بحكمة."',
      emoji: '🧞',
      options: [
        {
          text: '💰 أمنية الغنى - 50 ذهب',
          outcome: {
            success: { goldChange: 50, text: 'الجني نقر أصابعه وظهر كيس ذهب! 50 قطعة ذهب أمامك!' },
            failure: { goldChange: 50, text: 'الجني نقر أصابعه وظهر كيس ذهب! 50 قطعة ذهب أمامك!' },
          },
        },
        {
          text: '❤️ أمنية الصحة - استعادة كاملة',
          outcome: {
            success: { healthChange: 100, text: 'الجني لمس جبينك وتحسنت حالتك بالكامل! صحة كاملة!' },
            failure: { healthChange: 100, text: 'الجني لمس جبينك وتحسنت حالتك بالكامل!' },
          },
        },
        {
          text: '📚 أمنية المعرفة - 20 معرفة',
          outcome: {
            success: { knowledgeChange: 20, text: 'الجني نفخ في وجهك知识和! غمرتك رؤى من العصور القديمة!' },
            failure: { knowledgeChange: 20, text: 'الجني نفخ في وجهك! غمرتك رؤى من العصور القديمة!' },
          },
        },
      ],
    },
  ],
  ocean: [
    {
      id: 'o1',
      type: 'battle',
      region: 'ocean',
      title: 'أخطبوط العمق!',
      description: 'في الأعماق الفضية، يظهر أخطبوط عملاق بأذرعه الثمانية! يحيط بك ويزمجر: "هذه مياهي!"',
      emoji: '🐙',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 30, healthChange: -20, text: 'قطعت أذرع الأخطبوط واحداً تلو الآخر! وجدت لآلئاً ثمينة!' },
            failure: { healthChange: -30, text: 'الأخطبوط خنقك بأذرعه! كدت تغرق قبل أن تتحرر.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 25, text: 'قدرتك أذهلت الأخطبوط! فرّ تاركاً لآلئه!' },
            failure: { healthChange: -20, text: 'قدرتك لم تؤثر كثيراً تحت الماء. أصبت.' },
          },
        },
        {
          text: '🏃 الهروب عبر التيارات',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { text: 'استغللت تياراً مائياً سريعاً ونجوت! الأخطبوط لم يستطع اللحاق.' },
            failure: { healthChange: -20, text: 'الأذرع أمسكتك! أصبت قبل أن تتحرر.' },
          },
        },
      ],
    },
    {
      id: 'o2',
      type: 'puzzle',
      region: 'ocean',
      title: 'لغز حورية البحر',
      description: 'حورية جميلة تسبح نحوك وتقول: "أجب عن لغزي لتعبر: ما الشيء الذي يمتلئ وهو فارغ؟"',
      emoji: '🧜‍♀️',
      options: [
        {
          text: '🌙 القمر (الإجابة الصحيحة)',
          outcome: {
            success: { knowledgeChange: 15, goldChange: 25, text: 'أحسنت! القمر يمتلئ وهو فارغ! الحورية منحتك لؤلؤة سحرية!' },
            failure: { knowledgeChange: 15, goldChange: 25, text: 'أحسنت! القمر يمتلئ وهو فارغ!' },
          },
        },
        {
          text: '🎲 التخمين',
          statCheck: 'luck',
          statThreshold: 3,
          outcome: {
            success: { knowledgeChange: 5, goldChange: 10, text: 'خمنت بشكل صحيح! الإجابة: القمر.' },
            failure: { healthChange: -15, text: 'خطأ! الحورية دفعتك للتيار. الإجابة: القمر.' },
          },
        },
      ],
    },
    {
      id: 'o3',
      type: 'encounter',
      region: 'ocean',
      title: 'حورية الغدر',
      description: 'حورية جميلة تنادي من الصخور: "تعال يا مسافر، عندي كنوز لا تُصدق!" لكن شيئاً في عيونها يبدو مريباً...',
      emoji: '🧜‍♀️',
      options: [
        {
          text: '🤝 الاقتراب بحذر',
          statCheck: 'intelligence',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 35, text: 'كنت حذراً واكتشفت فخها! حصلت على كنزها الحقيقي ونجوت.' },
            failure: { healthChange: -25, goldChange: -10, text: 'كان فخاً! الحورية هاجمتك وأخذت بعض ذهبك.' },
          },
        },
        {
          text: '🚶 تجاهلها',
          outcome: {
            success: { text: 'تجاهلتها بحكمة. صوتها تلاشى خلفك... ومضيت بأمان.' },
            failure: { text: 'تجاهلتها بحكمة. صوتها تلاشى خلفك.' },
          },
        },
        {
          text: '🔍 التحقيق (فريال فقط)',
          outcome: {
            success: { goldChange: 40, text: 'كشفت هويتها الحقيقية! كانت أميرة بحر مختبئة. منحتك كنزاً!' },
            failure: { healthChange: -10, text: 'لم تكتشف شيئاً إضافياً لكنك نجوت.' },
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
      title: '⚔️ المعركة التمهيدية الأولى',
      description: 'بوابات قلعة الظلام تفتح ببطء! من الظلام يظهر حارس البوابات - وحش ضخم بسلاح مزدوج! يزمجر: "لا أحد يدخل!"',
      emoji: '👹',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 35, healthChange: -25, text: 'بشجاعة أسطورية، هزمت حارس البوابات! البوابات مفتوحة الآن!' },
            failure: { healthChange: -40, text: 'حارس البوابات أقوى من أي عدو واجهته! أصبت إصابة بالغة.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 30, text: 'قدرتك الخاصة أوقعت الحارس! عبرت البوابات!' },
            failure: { healthChange: -30, text: 'الحارس قاوم قدرتك! أصبت لكنه تراجع.' },
          },
        },
        {
          text: '🗣️ استغلال ضعفه',
          statCheck: 'intelligence',
          statThreshold: 4,
          outcome: {
            success: { healthChange: -10, goldChange: 25, text: 'لاحظت أن الحارس أعمى من عينه اليسرى! هاجمت من تلك الناحية ونجحت!' },
            failure: { healthChange: -30, text: 'لم تجد نقطة ضعف واضحة. أصبت.' },
          },
        },
      ],
    },
    {
      id: 'k2',
      type: 'battle',
      region: 'castle',
      title: '⚔️ المعركة التمهيدية الثانية',
      description: 'في قلب القلعة، يظهر فارس الظلام بدرع سوداء كاملة! سيفه يشع بطاقة مظلمة! يقول: "أنت آخر من يصل... ولن تخرج."',
      emoji: '🖤',
      options: [
        {
          text: '⚔️ القتال المباشر',
          statCheck: 'strength',
          statThreshold: 5,
          outcome: {
            success: { goldChange: 40, healthChange: -30, text: 'بمعجزة، حطمت درع فارس الظلام! هو يتراجع والطريق للزعيم النهائي مفتوح!' },
            failure: { healthChange: -45, text: 'فارس الظلام لا يُقهر! أصبت إصابة خطيرة.' },
          },
        },
        {
          text: '✨ استخدام القدرة الخاصة',
          outcome: {
            success: { goldChange: 35, text: 'قدرتك اخترقت درع الظلام! فارس الظلام سقط!' },
            failure: { healthChange: -35, text: 'الدرع المظلمة امتصت قدرتك! أصبت بشدة.' },
          },
        },
        {
          text: '🛡️ الدفاع والانتظار',
          statCheck: 'defense',
          statThreshold: 4,
          outcome: {
            success: { healthChange: -15, goldChange: 20, text: 'صمدت أمام هجماته حتى أنهك! وجدت فرصة لضربه!' },
            failure: { healthChange: -30, text: 'دفاعك لم يصمد أمام سيف الظلام! أصبت.' },
          },
        },
      ],
    },
    {
      id: 'k3',
      type: 'battle',
      region: 'castle',
      title: '👑 المعركة الأخيرة - حارس الكتاب!',
      description: 'في قاعة العرش، يجلس حارس الكتاب على عرش من ظلام محض! الكتاب الأعظم يطفو خلفه في كرة طاقة مظلمة. ينهض ببطء: "جئتَ من أجل الكتاب... لكنك لن تأخذه!" هذه المعركة الحاسمة!',
      emoji: '👿',
      options: [
        {
          text: '⚔️ الهجوم بكل قوتك!',
          statCheck: 'strength',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 100, text: '🏆 بهجمة أخيرة بطولية، أوقعت حارس الكتاب! الكتاب الأعظم عاد لمملكة نور الحكمة! أنت بطل أسطوري!' },
            failure: { healthChange: -50, text: 'حارس الكتاب أقوى مما تخيلت! أصبت إصابة حرجة لكنك ما زلت واقفاً.' },
          },
        },
        {
          text: '✨ استخدام كل قدراتك',
          outcome: {
            success: { goldChange: 100, text: '🏆 بكل ما تملك من قوة وسحر، هزمت حارس الكتاب! الكتاب الأعظم عاد! أنت البطل!' },
            failure: { healthChange: -45, text: 'قدراتك لم تكفِ! لكنك ما زلت تصارع.' },
          },
        },
        {
          text: '🗣️ نداء لكل حلفائك',
          statCheck: 'charisma',
          statThreshold: 4,
          outcome: {
            success: { goldChange: 100, text: '🏆 حلفاؤك تجمعوا حولك وقاتلوا معك! معاً هزمتم حارس الكتاب! النصر للفريق!' },
            failure: { healthChange: -40, text: 'حلفاؤك حاولوا لكنهم أصيبوا! يجب أن تكافح وحدك.' },
          },
        },
      ],
    },
  ],
};

// ============================================
// سلبيات الحلفاء
// ============================================
export const ALLY_PASSIVES: Record<string, { passiveAbilityAr: string; effectDescription: string }> = {
  ibrahim: { passiveAbilityAr: 'يضيف 5 نقاط ضرر إضافية', effectDescription: '+5 damage' },
  abdullah: { passiveAbilityAr: 'يمتص 10 نقاط ضرر كل جولة', effectDescription: '-10 enemy damage' },
  sufian: { passiveAbilityAr: 'يحصل على ذهب إضافي من كل معركة', effectDescription: '+5 gold per battle' },
  boukhloua: { passiveAbilityAr: '10% احتمال تحول عدو عشوائي لضفدع', effectDescription: '10% frog chance' },
  yacine: { passiveAbilityAr: 'يضاعف ضرره عند صحة منخفضة', effectDescription: '2x damage at low HP' },
  ousama: { passiveAbilityAr: 'يعزز كل الحلفاء +1 إحصائية', effectDescription: '+1 all ally stats' },
  karim: { passiveAbilityAr: '10% تحول تنين، 5% يحرقك', effectDescription: 'Dragon or burn' },
  lina: { passiveAbilityAr: 'ترى نتيجة خيار واحد قبل الاختيار', effectDescription: 'Foresight once' },
  nour: { passiveAbilityAr: 'تشفي 5 صحة كل حدث', effectDescription: '+5 HP per event' },
  asma: { passiveAbilityAr: 'خصم 50% عند التجار', effectDescription: '50% merchant discount' },
  maram: { passiveAbilityAr: 'قد تشل عدواً بالكلمات', effectDescription: 'Stun enemy' },
  aya1: { passiveAbilityAr: 'ترى الحدث القادم مسبقاً', effectDescription: 'See next event' },
  doua_bentemra: { passiveAbilityAr: '5 ضرر نار إضافي كل جولة', effectDescription: '+5 fire damage' },
  doua_bensabaha: { passiveAbilityAr: 'تشفي 3 صحة لكل حليف كل حدث', effectDescription: '+3 HP allies' },
  doua_bensaidan: { passiveAbilityAr: '10% هروب تلقائي من المعارك', effectDescription: '10% auto-flee' },
  rawan: { passiveAbilityAr: 'قد تستدعي حليفاً حيوانياً', effectDescription: 'Animal ally chance' },
  bouchra: { passiveAbilityAr: 'تحصل على مساعدة مجانية من NPCs', effectDescription: 'Free NPC help' },
  feryal: { passiveAbilityAr: 'تكشف نوايا الأعداء', effectDescription: 'Reveal enemy intent' },
  basma: { passiveAbilityAr: 'تجد أدوات وطعام بضعف المعدل', effectDescription: '2x item finds' },
  chaimaa: { passiveAbilityAr: 'ترى مسارات سرية', effectDescription: 'Hidden paths' },
  khaira: { passiveAbilityAr: 'تتجنب مواجهة دون قتال', effectDescription: 'Avoid combat' },
  fatiha: { passiveAbilityAr: 'تحل أي لغز تلقائياً', effectDescription: 'Auto-solve puzzles' },
  aya_bouhalassa: { passiveAbilityAr: 'لا تموت في أول مرة (تبقى بـ 1 صحة)', effectDescription: 'Survive once at 1 HP' },
  aya_boubaker: { passiveAbilityAr: 'نتيجة كوميدية إضافية دائماً في صالحها', effectDescription: 'Funny bonus' },
  naska: { passiveAbilityAr: 'تستعيد كامل الصحة والمانا نهاية كل منطقة', effectDescription: 'Full restore per region' },
  boudar: { passiveAbilityAr: 'تضرب أولاً في كل معركة', effectDescription: 'First strike' },
  benyamina: { passiveAbilityAr: 'يضاعف ضرر الجولة الأولى', effectDescription: '2x first round damage' },
};

// ============================================
// 20 إنجاز
// ============================================
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'dragon_reveal', name: 'كشفت السر', description: 'العب بكريم وتحول لتنين', emoji: '🐉', condition: 'كريم يتحول لتنين' },
  { id: 'divine_protection', name: 'محمي إلهياً', description: 'أكمل اللعبة كآية بوحلاسة دون موت', emoji: '👼', condition: 'آية بوحلاسة تنهي بدون موت' },
  { id: 'word_master', name: 'سيد الكلام', description: 'أنهِ 5 معارك بالمفاوضة فقط', emoji: '🗣️', condition: '5 معارك بالمفاوضة' },
  { id: 'rich', name: 'الثري', description: 'اجمع 200 ذهب', emoji: '💰', condition: '200+ ذهب' },
  { id: 'legendary_team', name: 'الفريق الأسطوري', description: 'جند 3 حلفاء في رحلة واحدة', emoji: '👥', condition: '3 حلفاء' },
  { id: 'heroic_death', name: 'الموت البطولي', description: 'مُت أثناء حماية حليف', emoji: '💀', condition: 'موت بحماية حليف' },
  { id: 'pacifist', name: 'المسالم', description: 'أنهِ اللعبة دون قتال أي عدو مباشرة', emoji: '☮️', condition: 'لا قتال مباشر' },
  { id: 'chaos_glory', name: 'الفوضى المجيدة', description: 'أكمل اللعبة كآية بوبكر', emoji: '😈', condition: 'آية بوبكر تنهي اللعبة' },
  { id: 'first_steps', name: 'الخطوات الأولى', description: 'أكمل منطقة واحدة', emoji: '👣', condition: 'أكمل منطقة' },
  { id: 'explorer', name: 'المستكشف', description: 'وصل إلى 4 مناطق مختلفة', emoji: '🗺️', condition: '4 مناطق' },
  { id: 'puzzle_master', name: 'حلال الألغاز', description: 'حل 5 ألغاز بنجاح', emoji: '🧩', condition: '5 ألغاز' },
  { id: 'merchant_friend', name: 'صديق التجار', description: 'اشترِ 5 مرات من التجار', emoji: '🏪', condition: '5 مشتريات' },
  { id: 'survivor', name: 'الناجي', description: 'بقَ على قيد الحياة بصحة أقل من 10', emoji: '❤️‍🩹', condition: 'HP < 10 وبقاء' },
  { id: 'knowledge_seeker', name: 'باحث المعرفة', description: 'اجمع 50 معرفة', emoji: '📚', condition: '50+ معرفة' },
  { id: 'reputation_hero', name: 'بطل السمعة', description: 'وصل لسمعة 80', emoji: '⭐', condition: '80+ سمعة' },
  { id: 'speed_runner', name: 'سريع البرق', description: 'أكمل اللعبة في أقل من 30 دقيقة', emoji: '⚡', condition: '< 30 دقيقة' },
  { id: 'ally_ibrahim', name: 'صديق المحارب', description: 'اجعل إبراهيم حليفك', emoji: '⚔️', condition: 'إبراهيم حليف' },
  { id: 'ally_nour', name: 'في نور الطريق', description: 'اجعل نور حليفتك', emoji: '✨', condition: 'نور حليفة' },
  { id: 'all_regions', name: 'فاتح العالم', description: 'زر كل المناطق الست', emoji: '🌍', condition: 'كل المناطق' },
  { id: 'game_complete', name: 'البطل الخارق', description: 'أكمل اللعبة كاملة', emoji: '🏆', condition: 'إكمال اللعبة' },
];

// ============================================
// 8 نهايات
// ============================================
export const ENDINGS: Ending[] = [
  { id: 'legendary_hero', name: 'البطل الأسطوري', description: 'أكمل كل المراحل بصحة فوق 70', condition: 'HP > 70 at end', emoji: '🏆' },
  { id: 'knowledge_guardian', name: 'حارس المعرفة', description: 'أكمل اللعبة بمعرفة 50 أو أكثر', condition: 'Knowledge >= 50', emoji: '📚' },
  { id: 'nation_leader', name: 'قائد الأمة', description: 'أكمل اللعبة مع 3 حلفاء', condition: '3 allies at end', emoji: '👑' },
  { id: 'martyr', name: 'الشهيد', description: 'مُت أثناء حماية حليف في المنطقة الأخيرة', condition: 'Die protecting ally in castle', emoji: '💫' },
  { id: 'mysterious_survivor', name: 'الناجي الغامض', description: 'أكمل اللعبة بالهروب من كل المعارك', condition: 'All battles fled', emoji: '🏃' },
  { id: 'glorious_chaos', name: 'الفوضى المجيدة', description: 'مخصص لآية بوبكر - أكمل اللعبة بها', condition: 'Complete as Aya Boubaker', emoji: '😈' },
  { id: 'dragon_legend', name: 'التنين الأسطوري', description: 'مخصص لكريم - أكمل بعد تحول تنين مرتين+', condition: 'Complete as Karim after 2+ dragon transforms', emoji: '🐉' },
  { id: 'secret_ending', name: 'النهاية السرية', description: '???', condition: 'Rep 100 + Knowledge 40 + 3 allies simultaneously', emoji: '🔮' },
];

// ============================================
// بيانات التاجر
// ============================================
export const MERCHANT_ITEMS: MerchantItem[] = [
  { name: 'جرعة الشفاء الكبرى', price: 20, emoji: '🧴', effect: 'Restores 50 HP', effectAr: 'تستعيد 50 صحة' },
  { name: 'بلورة المانا العظيمة', price: 25, emoji: '💎', effect: 'Restores 30 MP', effectAr: 'تستعيد 30 مانا' },
  { name: 'تعويذة القوة', price: 30, emoji: '💪', effect: '+1 Strength for the journey', effectAr: 'تزيد القوة نقطة واحدة' },
  { name: 'خاتم الحكمة', price: 30, emoji: '💍', effect: '+1 Intelligence for the journey', effectAr: 'تزيد الذكاء نقطة واحدة' },
  { name: 'حذاء الحظ', price: 25, emoji: '👟', effect: '+1 Luck for the journey', effectAr: 'تزيد الحظ نقطة واحدة' },
  { name: 'ترس الدفاع', price: 30, emoji: '🛡️', effect: '+1 Defense for the journey', effectAr: 'تزيد الدفاع نقطة واحدة' },
  { name: 'إكسير الكاريزما', price: 25, emoji: '🎭', effect: '+1 Charisma for the journey', effectAr: 'تزيد الكاريزما نقطة واحدة' },
  { name: 'خريطة الكنز', price: 35, emoji: '🗺️', effect: 'Reveals next event details', effectAr: 'تكشف تفاصيل الحدث القادم' },
];

// ============================================
// ألوان التوهج حسب الفئة
// ============================================
export const CLASS_GLOW_COLORS: Record<string, string> = {
  'محارب': 'shadow-red-500/50 border-red-500',
  'حارس': 'shadow-red-400/50 border-red-400',
  'لص': 'shadow-gray-400/50 border-gray-400',
  'ساحر': 'shadow-purple-500/50 border-purple-500',
  'مقاتل': 'shadow-red-500/50 border-red-500',
  'قائد': 'shadow-yellow-500/50 border-yellow-500',
  'مجهول': 'shadow-gray-600/50 border-gray-600',
  'حكيمة': 'shadow-purple-400/50 border-purple-400',
  'مشفيّة': 'shadow-green-400/50 border-green-400',
  'تاجرة': 'shadow-yellow-400/50 border-yellow-400',
  'شاعرة': 'shadow-purple-400/50 border-purple-400',
  'كاهنة': 'shadow-white/50 border-white',
  'ساحرة النار': 'shadow-red-500/50 border-red-500',
  'ساحرة الماء': 'shadow-blue-400/50 border-blue-400',
  'ساحرة الريح': 'shadow-green-400/50 border-green-400',
  'غابية': 'shadow-green-500/50 border-green-500',
  'أميرة': 'shadow-yellow-500/50 border-yellow-500',
  'محققة': 'shadow-purple-400/50 border-purple-400',
  'فلاحة': 'shadow-green-400/50 border-green-400',
  'عرّافة': 'shadow-purple-500/50 border-purple-500',
  'جاسوسة': 'shadow-gray-500/50 border-gray-500',
  'حكيمة العجوز': 'shadow-purple-400/50 border-purple-400',
  'ملاك': 'shadow-white/50 border-white',
  'شيطانة طيبة': 'shadow-gray-700/50 border-gray-700',
  'راهبة': 'shadow-white/50 border-white',
  'صياد': 'shadow-green-400/50 border-green-400',
  'فارس': 'shadow-red-400/50 border-red-400',
};

// ============================================
// Helper: Get initial resources
// ============================================
export function getInitialResources(): GameResources {
  return {
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    gold: 20,
    reputation: 0,
    knowledge: 0,
    allies: [],
  };
}
