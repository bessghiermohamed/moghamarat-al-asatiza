'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CHARACTERS,
  REGIONS,
  REGION_EVENTS,
  REGION_ENEMIES,
  ALLY_PASSIVES,
  ACHIEVEMENTS,
  ENDINGS,
  MERCHANT_ITEMS,
  getInitialResources,
  type Character,
  type GameResources,
  type Ally,
  type GameEvent,
  type EventOption,
} from '@/lib/game-data';

// ============================================
// Types
// ============================================
type Screen = 'login' | 'characterSelect' | 'kingdom' | 'profile' | 'gameplay' | 'ending';

interface FeedItem {
  id: string;
  text: string;
  emoji: string;
  time: number;
}

interface PlayerSave {
  name: string;
  mainCharacterId: string | null;
  sideCharacterIds: string[];
  regionIndex: number;
  eventIndex: number;
  resources: GameResources;
  allies: Ally[];
  achievements: string[];
  highestScore: number;
  completions: number;
  firstLogin: number;
  lastLogin: number;
  abilityUsedThisRegion: boolean;
  battlesFled: number;
  battlesNegotiated: number;
  merchantBuys: number;
  puzzlesSolved: number;
  karimDragonCount: number;
  playedCharacterIds: string[];
  totalEventsCompleted: number;
  bonusStats: Record<string, number>;
  deathCount: number;
  endTime?: number;
  startTime?: number;
}

// ============================================
// Helpers
// ============================================
function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find(c => c.id === id);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollD20(statValue: number, difficulty: number): { roll: number; modifier: number; total: number; success: boolean; critical: boolean; criticalFail: boolean } {
  const roll = rand(1, 20);
  const modifier = Math.floor((statValue - 10) / 2);
  const total = roll + modifier;
  const critical = roll === 20;
  const criticalFail = roll === 1;
  const success = critical || (!criticalFail && total >= difficulty);
  return { roll, modifier, total, success, critical, criticalFail };
}

function statCheck(statValue: number, threshold: number): boolean {
  const d20Stat = 3 + (statValue - 1) * 3;
  const difficulty = 8 + threshold * 3;
  return rollD20(d20Stat, difficulty).success;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getRegionName(index: number): string {
  return REGIONS[index]?.name || 'مجهول';
}

function createDefaultSave(name: string): PlayerSave {
  return {
    name,
    mainCharacterId: null,
    sideCharacterIds: [],
    regionIndex: 0,
    eventIndex: 0,
    resources: getInitialResources(),
    allies: [],
    achievements: [],
    highestScore: 0,
    completions: 0,
    firstLogin: Date.now(),
    lastLogin: Date.now(),
    abilityUsedThisRegion: false,
    battlesFled: 0,
    battlesNegotiated: 0,
    merchantBuys: 0,
    puzzlesSolved: 0,
    karimDragonCount: 0,
    playedCharacterIds: [],
    totalEventsCompleted: 0,
    bonusStats: {},
    deathCount: 0,
    startTime: Date.now(),
  };
}

function getEffectiveStat(char: Character | undefined, statName: string, bonusStats: Record<string, number>): number {
  if (!char) return 0;
  const base = char.stats[statName as keyof typeof char.stats] || 0;
  const bonus = bonusStats[`${char.id}_${statName}`] || 0;
  return base + bonus;
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}س ${minutes % 60}د`;
  return `${minutes}د`;
}

// Image with fallback component
function ImgWithFallback({ src, alt, fallbackEmoji, className, style }: { src: string; alt: string; fallbackEmoji: string; className?: string; style?: React.CSSProperties }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80px', ...style }}>
        <span style={{ fontSize: '3rem' }}>{fallbackEmoji}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setError(true)} loading="lazy" />;
}

const STAT_NAMES: Record<string, string> = {
  strength: 'القوة',
  intelligence: 'الذكاء',
  luck: 'الحظ',
  charisma: 'الكاريزما',
  mana: 'المانا',
  defense: 'الدفاع',
};

const STAT_COLORS: Record<string, string> = {
  strength: '#c45a5a',
  intelligence: '#9b7dc4',
  luck: '#6b9a5a',
  charisma: '#c9a84c',
  mana: '#6a8fc4',
  defense: '#c48a4c',
};

const STAT_ICONS: Record<string, string> = {
  strength: '⚔️',
  intelligence: '🧠',
  luck: '🍀',
  charisma: '👑',
  mana: '💎',
  defense: '🛡️',
};

// ============================================
// Main Component
// ============================================
export default function GamePage() {
  const [screen, setScreen] = useState<Screen>('login');
  const [playerName, setPlayerName] = useState('');
  const [save, setSave] = useState<PlayerSave | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [eventOutcome, setEventOutcome] = useState<string | null>(null);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [confirmMain, setConfirmMain] = useState<string | null>(null);
  const [statPointMode, setStatPointMode] = useState(false);
  const [statPoints, setStatPoints] = useState(0);
  const [linaForesight, setLinaForesight] = useState(false);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [onlineCount] = useState(1);
  const [battleEffect, setBattleEffect] = useState<'shake' | 'damage' | 'heal' | null>(null);
  const [damageNumbers, setDamageNumbers] = useState<{id: number; value: number; x: number; y: number; color: string}[]>([]);
  const [showRegionTransition, setShowRegionTransition] = useState(false);

  // Battle effects
  const triggerBattleEffect = useCallback((type: 'shake' | 'damage' | 'heal', dmgValue?: number) => {
    setBattleEffect(type);
    if (dmgValue !== undefined) {
      const id = Date.now();
      setDamageNumbers(prev => [...prev, { id, value: dmgValue, x: 30 + Math.random() * 40, y: 30 + Math.random() * 20, color: type === 'heal' ? '#5a8a47' : '#a03030' }]);
      setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
    }
    setTimeout(() => setBattleEffect(null), 500);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moghamara_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as PlayerSave;
        if (!parsed.bonusStats) parsed.bonusStats = {};
        if (parsed.deathCount === undefined) parsed.deathCount = 0;
        queueMicrotask(() => {
          setSave(parsed);
          setPlayerName(parsed.name);
          if (parsed.mainCharacterId) {
            setScreen('kingdom');
          } else {
            setScreen('characterSelect');
          }
        });
      } catch { /* corrupted save */ }
    }
    const savedFeed = localStorage.getItem('moghamara_feed');
    if (savedFeed) {
      try { queueMicrotask(() => setFeed(JSON.parse(savedFeed))); } catch { /* ignore */ }
    }
  }, []);

  // Save to localStorage
  useEffect(() => { if (save) localStorage.setItem('moghamara_save', JSON.stringify(save)); }, [save]);
  useEffect(() => { localStorage.setItem('moghamara_feed', JSON.stringify(feed)); }, [feed]);

  // Add feed item
  const addFeed = useCallback((text: string, emoji: string) => {
    const item: FeedItem = { id: Date.now().toString() + Math.random(), text, emoji, time: Date.now() };
    setFeed(prev => [item, ...prev].slice(0, 20));
  }, []);

  // Check achievements
  const checkAchievements = useCallback((currentSave: PlayerSave): PlayerSave => {
    const newAchievements: string[] = [];
    const s = currentSave;
    const res = s.resources;

    if (!s.achievements.includes('dragon_reveal') && s.karimDragonCount > 0) newAchievements.push('dragon_reveal');
    if (!s.achievements.includes('word_master') && s.battlesNegotiated >= 5) newAchievements.push('word_master');
    if (!s.achievements.includes('rich') && res.gold >= 200) newAchievements.push('rich');
    if (!s.achievements.includes('legendary_team') && s.allies.length >= 3) newAchievements.push('legendary_team');
    if (!s.achievements.includes('puzzle_master') && s.puzzlesSolved >= 5) newAchievements.push('puzzle_master');
    if (!s.achievements.includes('merchant_friend') && s.merchantBuys >= 5) newAchievements.push('merchant_friend');
    if (!s.achievements.includes('knowledge_seeker') && res.knowledge >= 50) newAchievements.push('knowledge_seeker');
    if (!s.achievements.includes('reputation_hero') && res.reputation >= 80) newAchievements.push('reputation_hero');
    if (!s.achievements.includes('explorer') && s.regionIndex >= 3) newAchievements.push('explorer');
    if (!s.achievements.includes('first_steps') && s.totalEventsCompleted >= 3) newAchievements.push('first_steps');
    if (!s.achievements.includes('ally_ibrahim') && s.allies.some(a => a.characterId === 'ibrahim')) newAchievements.push('ally_ibrahim');
    if (!s.achievements.includes('ally_nour') && s.allies.some(a => a.characterId === 'nour')) newAchievements.push('ally_nour');
    if (!s.achievements.includes('all_regions') && s.regionIndex >= 5) newAchievements.push('all_regions');
    if (!s.achievements.includes('game_complete') && s.completions > 0) newAchievements.push('game_complete');
    if (!s.achievements.includes('chaos_glory') && s.mainCharacterId === 'aya_boubaker' && s.completions > 0) newAchievements.push('chaos_glory');
    if (!s.achievements.includes('survivor') && s.deathCount >= 3) newAchievements.push('survivor');

    if (newAchievements.length > 0) {
      const updated = { ...s, achievements: [...s.achievements, ...newAchievements] };
      const achName = ACHIEVEMENTS.find(a => a.id === newAchievements[0])?.name || '';
      setShowAchievement(achName);
      setTimeout(() => setShowAchievement(null), 3000);
      addFeed(`${s.name} حقق إنجاز: ${achName}`, '🏅');
      return updated;
    }
    return s;
  }, [addFeed]);

  // Determine ending
  const determineEnding = useCallback((s: PlayerSave) => {
    let ending = 'legendary_hero';
    const res = s.resources;

    if (res.reputation >= 100 && res.knowledge >= 40 && s.allies.length >= 3) ending = 'secret_ending';
    else if (s.mainCharacterId === 'aya_boubaker') ending = 'glorious_chaos';
    else if (s.mainCharacterId === 'karim' && s.karimDragonCount >= 2) ending = 'dragon_legend';
    else if (s.battlesFled >= 5 && (s.battlesNegotiated + s.battlesFled) > s.totalEventsCompleted * 0.5) ending = 'mysterious_survivor';
    else if (res.knowledge >= 50) ending = 'knowledge_guardian';
    else if (s.allies.length >= 3) ending = 'nation_leader';
    else if (res.health <= 0 || s.deathCount >= 2) ending = 'martyr';

    const score = res.health + res.gold + res.knowledge * 2 + res.reputation + s.allies.length * 50 + s.completions * 100;
    const updated: PlayerSave = { ...s, completions: s.completions + 1, highestScore: Math.max(s.highestScore, score), endTime: Date.now() };
    const withAchievements = checkAchievements(updated);
    setSave(withAchievements);
    setEndingId(ending);
    setScreen('ending');
    addFeed(`${s.name} أكمل اللعبة! 🏆`, '🎉');
  }, [checkAchievements, addFeed]);

  // Process event outcome
  const processOutcome = useCallback((option: EventOption, currentSave: PlayerSave) => {
    let s = { ...currentSave, resources: { ...currentSave.resources }, allies: [...currentSave.allies] };
    const res = s.resources;
    const char = getCharacter(s.mainCharacterId || '');
    const statVal = option.statCheck && char ? getEffectiveStat(char, option.statCheck, s.bonusStats) : 10;
    const threshold = option.statThreshold || 0;

    let bonusValue = 0;
    if (s.allies.some(a => a.characterId === 'ousama')) bonusValue += 1;
    const success = !option.statCheck || statCheck(statVal + bonusValue, threshold);
    const outcome = success ? option.outcome.success : option.outcome.failure;

    res.health = clamp(res.health + (outcome.healthChange || 0), 0, res.maxHealth);
    res.mana = clamp(res.mana + (outcome.manaChange || 0), 0, res.maxMana);
    res.gold = Math.max(0, res.gold + (outcome.goldChange || 0));
    res.reputation = clamp(res.reputation + (outcome.reputationChange || 0), 0, 100);
    res.knowledge = Math.max(0, res.knowledge + (outcome.knowledgeChange || 0));

    if (s.mainCharacterId === 'asma' && (outcome.goldChange || 0) < 0) {
      const refund = Math.abs(outcome.goldChange || 0) * 0.5;
      res.gold = Math.max(0, res.gold + Math.floor(refund));
    }
    if (s.allies.some(a => a.characterId === 'nour')) res.health = clamp(res.health + 5, 0, res.maxHealth);
    if (s.allies.some(a => a.characterId === 'doua_bensabaha')) res.health = clamp(res.health + 3, 0, res.maxHealth);
    if (s.mainCharacterId === 'basma' && (outcome.goldChange || 0) > 0) res.gold += Math.floor((outcome.goldChange || 0) * 0.5);
    if (s.mainCharacterId === 'aya_boubaker' && rand(1, 3) === 1) res.gold += rand(1, 5);

    if (outcome.allyGain) {
      const allyChar = getCharacter(outcome.allyGain);
      if (allyChar && s.allies.length < 3 && !s.allies.some(a => a.characterId === outcome.allyGain)) {
        const hasBouhalassa = s.allies.some(a => a.characterId === 'aya_bouhalassa') || outcome.allyGain === 'aya_bouhalassa';
        const hasBoubaker = s.allies.some(a => a.characterId === 'aya_boubaker') || outcome.allyGain === 'aya_boubaker';
        if (hasBouhalassa && hasBoubaker) {
          outcome.text += ' لكن آية بوبكر وآية بوحلاسة تشاجرتا ورفضتا العمل معاً!';
        } else {
          const passive = ALLY_PASSIVES[outcome.allyGain];
          s.allies.push({ characterId: outcome.allyGain, name: allyChar.name, passiveAbilityAr: passive?.passiveAbilityAr || '' });
        }
      }
    }

    let battlesFled = s.battlesFled, battlesNegotiated = s.battlesNegotiated, puzzlesSolved = s.puzzlesSolved, merchantBuys = s.merchantBuys, karimDragonCount = s.karimDragonCount;
    const currentEvents = REGION_EVENTS[REGIONS[s.regionIndex]?.id] || [];
    const currentEvent = currentEvents[s.eventIndex];
    if (currentEvent?.type === 'battle') {
      if (option.text.includes('الهروب') || option.text.includes('هرب')) battlesFled++;
      if (option.text.includes('المفاوضة') || option.text.includes('إقناع')) battlesNegotiated++;
    }
    if (currentEvent?.type === 'puzzle' && success) puzzlesSolved++;
    if (currentEvent?.type === 'merchant') merchantBuys++;

    if (s.mainCharacterId === 'karim' && currentEvent?.type === 'battle' && rand(1, 10) === 1) {
      karimDragonCount++;
      res.health = clamp(res.health + 50, 0, res.maxHealth);
      res.gold += 30;
      outcome.text += ' 🐉 كريم تحول لتنين وأحرق العدو! +50 صحة +30 ذهب!';
    }

    if (res.health <= 0) {
      if (s.mainCharacterId === 'aya_bouhalassa' && !s.achievements.includes('divine_protection_survived')) {
        res.health = 1;
        s.achievements = [...s.achievements, 'divine_protection_survived'];
        s.deathCount++;
        outcome.text = '👼 الحماية الإلهية أنقذتك! بقيت بنقطة صحة واحدة! ' + outcome.text;
      } else {
        s.deathCount++;
        res.health = Math.floor(res.maxHealth * 0.5);
        res.mana = Math.floor(res.maxMana * 0.5);
        res.gold = Math.max(0, res.gold - 10);
        s.eventIndex = 0;
        s = { ...s, resources: res, allies: s.allies, battlesFled, battlesNegotiated, puzzlesSolved, merchantBuys, karimDragonCount };
        setSave(checkAchievements(s));
        setEventOutcome('💀 لقد ممت! تعود من بداية المنطقة بموارد أقل...');
        return;
      }
    }

    s = { ...s, resources: res, battlesFled, battlesNegotiated, puzzlesSolved, merchantBuys, karimDragonCount, totalEventsCompleted: s.totalEventsCompleted + 1 };
    s = checkAchievements(s);
    setSave(s);
    setEventOutcome(outcome.text);

    if (currentEvent?.type === 'battle') {
      if (outcome.healthChange && outcome.healthChange < 0) triggerBattleEffect('shake', Math.abs(outcome.healthChange));
      if (outcome.healthChange && outcome.healthChange > 0) triggerBattleEffect('heal', outcome.healthChange);
    }
  }, [checkAchievements, triggerBattleEffect]);

  // Next event
  const nextEvent = useCallback(() => {
    if (!save) return;
    const s = { ...save, resources: { ...save.resources } };
    const region = REGIONS[s.regionIndex];
    if (!region) return;

    const events = REGION_EVENTS[region.id] || [];
    const nextIdx = s.eventIndex + 1;

    if (nextIdx >= events.length) {
      const points = s.resources.health > 70 ? 2 : 1;
      setStatPoints(points);
      setStatPointMode(true);
      if (s.mainCharacterId === 'naska') { s.resources.health = s.resources.maxHealth; s.resources.mana = s.resources.maxMana; }
      addFeed(`${s.name} أكمل ${getRegionName(s.regionIndex)}`, '✅');
      if (s.regionIndex >= 5) { determineEnding(s); return; }
      s.regionIndex++;
      s.eventIndex = 0;
      s.abilityUsedThisRegion = false;
      s.resources.mana = clamp(s.resources.mana + 10, 0, s.resources.maxMana);
      setSave(s);
    } else {
      s.eventIndex = nextIdx;
      setSave(s);
    }
    setEventOutcome(null);
    setLinaForesight(false);
  }, [save, addFeed, determineEnding]);

  // Use special ability
  const useAbility = useCallback(() => {
    if (!save || save.abilityUsedThisRegion) return;
    const s = { ...save, resources: { ...save.resources } };
    const char = getCharacter(s.mainCharacterId || '');
    if (!char) return;
    let abilityText = '';

    switch (s.mainCharacterId) {
      case 'ibrahim': s.resources.mana -= 10; abilityText = '⚔️ الضربة المزدوجة! ضربت العدو مرتين! (-10 مانا)'; break;
      case 'abdullah': abilityText = '🛡️ درع الإيمان! ستمتص الضربة التالية كاملاً!'; break;
      case 'sufian': { const stolenGold = rand(5, 20); s.resources.gold += stolenGold; abilityText = `🗡️ السرقة الخفية! سرقت ${stolenGold} ذهب!`; break; }
      case 'boukhloua':
        if (rand(1, 2) === 1) { s.resources.health = clamp(s.resources.health - 15, 1, s.resources.maxHealth); abilityText = '🐸 تحولت لضفدعة لجولة! -15 صحة...'; }
        else { s.resources.gold += 30; abilityText = '💥 تعويذة الفوضى! دمرت العدو وحصلت على 30 ذهب!'; }
        break;
      case 'yacine': abilityText = s.resources.health < 30 ? '💪 غضب المحارب! ضررك تضاعف!' : '💪 غضب المحارب! لكن صحتك ليست منخفضة كفاية...'; break;
      case 'ousama': abilityText = '👑 صرخة القيادة! كل حلفائك تعززوا بنقطة!'; break;
      case 'karim':
        if (rand(1, 10) <= 1) { s.karimDragonCount++; s.resources.gold += 50; abilityText = '🐉 كريم تحول لتنين!!! +50 ذهب!'; }
        else abilityText = '🐉 لم يتحول كريم هذه المرة...';
        break;
      case 'lina': setLinaForesight(true); abilityText = '📖 البصيرة! يمكنك رؤية نتيجة الخيارات هذه المرة!'; break;
      case 'nour': s.resources.health = clamp(s.resources.health + 30, 0, s.resources.maxHealth); abilityText = '✨ الشفاء الفوري! +30 صحة!'; break;
      case 'asma': abilityText = '💰 المفاوضة! خصم 50% عند أي تاجر!'; break;
      case 'maram': abilityText = '📜 قصيدة السحر! العدو مشلول لـ 3 جولات!'; break;
      case 'aya1': abilityText = '🕊️ التنبؤ! ترى الحدث القادم!'; break;
      case 'doua_bentemra': s.resources.mana -= 25; abilityText = '🔥 الجحيم! كل الأعداء احترقوا! (-25 مانا)'; break;
      case 'doua_bensabaha': s.resources.health = clamp(s.resources.health + 20, 0, s.resources.maxHealth); abilityText = '🌊 موجة الشفاء! +20 صحة!'; break;
      case 'doua_bensaidan': abilityText = '💨 العاصفة! يمكنك الهروب من أي معركة!'; break;
      case 'rawan': abilityText = '🌿 لغة الطبيعة! حيوانات الغابة ستحارب معك!'; break;
      case 'bouchra': abilityText = '👸 السلطة الملكية! الشخصيات غير العدائية ستطيعك!'; break;
      case 'feryal': abilityText = '🔍 التحقيق! تكشف نوايا ونقاط ضعف كل شخصية!'; break;
      case 'basma': s.resources.gold += 15; s.resources.health = clamp(s.resources.health + 10, 0, s.resources.maxHealth); abilityText = '🌾 حظ المزرعة! +15 ذهب +10 صحة!'; break;
      case 'chaimaa': abilityText = '🗺️ الخريطة المخفية! ترى مسارات سرية!'; break;
      case 'khaira': abilityText = '🥷 التنكّر! تتجنب أي مواجهة دون قتال!'; break;
      case 'fatiha': s.puzzlesSolved++; s.resources.knowledge += 10; abilityText = '🧓 حكمة الزمن! أي لغز يُحل تلقائياً! +10 معرفة!'; break;
      case 'aya_bouhalassa': abilityText = '👼 الحماية الإلهية! لن تموت في المرة القادمة!'; break;
      case 'aya_boubaker': s.resources.gold += rand(10, 30); s.resources.health = clamp(s.resources.health + rand(5, 20), 0, s.resources.maxHealth); abilityText = '😈 الفوضى المضحكة! نتائج إيجابية!'; break;
      case 'naska': s.resources.health = s.resources.maxHealth; s.resources.mana = s.resources.maxMana; abilityText = '🧘 التأمل! استعادة كاملة!'; break;
      case 'boudar': abilityText = '🏹 القناص! تضرب أولاً في المعركة القادمة!'; break;
      case 'benyamina': abilityText = '🐴 هجوم الفرسان! ضرر مضاعف في الجولة الأولى!'; break;
      default: abilityText = '✨ استخدمت قدرتك الخاصة!';
    }

    s.abilityUsedThisRegion = true;
    s.resources.mana = Math.max(0, s.resources.mana);
    setSave(checkAchievements(s));
    setEventOutcome(abilityText);
  }, [save, checkAchievements]);

  // Apply stat point
  const applyStatPoint = useCallback((stat: string) => {
    if (!save || statPoints <= 0) return;
    const s = { ...save, bonusStats: { ...save.bonusStats } };
    const char = getCharacter(s.mainCharacterId || '');
    if (!char) return;
    const key = `${char.id}_${stat}`;
    s.bonusStats[key] = (s.bonusStats[key] || 0) + 1;
    if (stat === 'mana') s.resources = { ...s.resources, maxMana: s.resources.maxMana + 5 };
    const newPoints = statPoints - 1;
    setStatPoints(newPoints);
    if (newPoints <= 0) setStatPointMode(false);
    setSave(s);
  }, [save, statPoints]);

  // ============================================
  // SCREEN: Login
  // ============================================
  const renderLoginScreen = () => (
    <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #1a1510 0%, #15110c 50%, #1a1510 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center fade-in max-w-md w-full">
          {/* Ornamental top */}
          <div className="ornament mb-2">⚜ ✦ ⚜</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-1 font-serif-heading golden-text" style={{ letterSpacing: '0.05em' }}>
            مغامرة الأساتذة
          </h1>
          <p className="text-sm mb-6" style={{ color: '#9a8b72' }}>مملكة نور الحكمة</p>
          <div className="ornament mb-4">◆ ◇ ◆</div>

          <div className="narrative-box p-5 mx-auto">
            <label className="block text-base mb-2 font-bold golden-text text-right">
              أدخل اسمك الحقيقي
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 rounded-lg text-right text-lg outline-none focus:ring-2 focus:ring-[#c9a84c]"
              style={{ background: '#1a1510', border: '1px solid rgba(201, 168, 76, 0.3)', color: '#e8dcc8' }}
              placeholder="اسمك هنا..."
              maxLength={30}
              dir="rtl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && playerName.trim()) {
                  const newSave = createDefaultSave(playerName.trim());
                  setSave(newSave);
                  addFeed(`${playerName.trim()} انضم إلى مملكة نور الحكمة!`, '🆕');
                  setScreen('characterSelect');
                }
              }}
            />
            <button
              className="glow-btn glow-btn-gold w-full mt-4 text-lg"
              style={{ minHeight: '48px' }}
              onClick={() => {
                if (playerName.trim()) {
                  const newSave = createDefaultSave(playerName.trim());
                  setSave(newSave);
                  addFeed(`${playerName.trim()} انضم إلى مملكة نور الحكمة!`, '🆕');
                  setScreen('characterSelect');
                }
              }}
              disabled={!playerName.trim()}
            >
              ⚔️ ابدأ المغامرة
            </button>
          </div>

          <div className="mt-6 narrative-box p-4 text-sm leading-relaxed text-right">
            <p style={{ color: '#b8a88a' }}>
              📜 سُرق <strong className="golden-text">الكتاب الأعظم</strong> من قلعة الظلام على يد حارس خائن.
              أنت المغامر الوحيد القادر على عبور المناطق الست واستعادته.
              اختر شخصيتك بعناية، وجمع الحلفاء، وواجه الأخطار...
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================
  // SCREEN: Character Selection
  // ============================================
  const renderCharacterCard = (char: Character, isMain: boolean, isSide: boolean, idx?: number) => (
    <div
      key={char.id}
      className={`game-card parchment-appear ${isMain ? 'game-card-selected' : ''} ${isSide ? 'game-card-selected' : ''}`}
      style={idx !== undefined ? { animationDelay: `${idx * 0.02}s` } : undefined}
    >
      <div className="flex items-center gap-2 mb-2">
        {char.portrait ? (
          <div className="scene-frame" style={{ width: '52px', height: '52px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
            <ImgWithFallback src={char.portrait} alt={char.name} fallbackEmoji={char.emoji} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
        ) : (
          <span className="text-3xl">{char.emoji}</span>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm golden-text truncate">{char.name}</h3>
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(201, 168, 76, 0.1)', color: '#9a8b72', fontSize: '0.65rem' }}>
              {char.classAr}
            </span>
            {isMain && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(201, 168, 76, 0.2)', color: '#c9a84c', fontSize: '0.65rem' }}>⭐</span>}
            {isSide && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(155, 125, 196, 0.15)', color: '#9b7dc4', fontSize: '0.65rem' }}>جانبية</span>}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-1 mb-2">
        {[
          { label: 'قوة', value: char.stats.strength, color: '#c45a5a' },
          { label: 'ذكاء', value: char.stats.intelligence, color: '#9b7dc4' },
          { label: 'حظ', value: char.stats.luck, color: '#6b9a5a' },
          { label: 'كاريزما', value: char.stats.charisma, color: '#c9a84c' },
          { label: 'مانا', value: char.stats.mana, color: '#6a8fc4' },
          { label: 'دفاع', value: char.stats.defense, color: '#c48a4c' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-1 text-xs p-1 rounded" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <span style={{ color: '#9a8b72', fontSize: '0.6rem' }}>{stat.label}</span>
            <div className="flex-1 stat-bar">
              <div className="stat-bar-fill" style={{ width: `${(stat.value / 6) * 100}%`, background: stat.color }} />
            </div>
            <span className="font-bold" style={{ color: stat.color, fontSize: '0.6rem' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Ability */}
      <div className="mb-2 p-1.5 rounded-lg text-xs text-right" style={{ background: 'rgba(201, 168, 76, 0.06)', borderRight: '2px solid rgba(201, 168, 76, 0.35)' }}>
        <span style={{ color: '#c9a84c' }}>✨ {char.uniqueAbilityAr}</span>
      </div>

      {idx !== undefined && (
        <p className="text-xs italic mb-2 text-right" style={{ color: '#9a8b72' }}>&ldquo;{char.signature}&rdquo;</p>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button className="glow-btn glow-btn-gold flex-1 text-xs py-1.5 px-2" style={{ minHeight: '44px' }}
          onClick={() => {
            if (!save) return;
            if (save.mainCharacterId && save.mainCharacterId !== char.id) setConfirmMain(char.id);
            else {
              const s = { ...save, mainCharacterId: char.id };
              if (!s.playedCharacterIds.includes(char.id)) s.playedCharacterIds = [...s.playedCharacterIds, char.id];
              setSave(s);
              addFeed(`${save.name} اختار ${char.name} كشخصية رئيسية`, char.emoji);
            }
          }}>
          ⭐ رئيسية
        </button>
        <button className="fantasy-btn-secondary flex-1 text-xs py-1.5 px-2" style={{ minHeight: '44px' }}
          onClick={() => {
            if (!save) return;
            const s = { ...save, sideCharacterIds: [...save.sideCharacterIds] };
            if (isSide) s.sideCharacterIds = s.sideCharacterIds.filter(id => id !== char.id);
            else s.sideCharacterIds.push(char.id);
            setSave(s);
          }}>
          {isSide ? 'إزالة' : 'جانبية'}
        </button>
      </div>
    </div>
  );

  const renderCharacterSelectScreen = () => (
    <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #1a1510 0%, #15110c 100%)' }}>
      <div className="top-bar py-3 px-4 text-center">
        <h2 className="text-lg font-bold font-serif-heading golden-text">اختر شخصيتك</h2>
        <p className="text-xs" style={{ color: '#9a8b72' }}>اسحب لليسار لمزيد من الشخصيات</p>
      </div>

      <div className="content-area p-2 pb-20">
        {/* Mobile: Horizontal scroll */}
        <div className="horiz-scroll sm:hidden" style={{ padding: '8px 4px' }}>
          {CHARACTERS.map((char) => renderCharacterCard(char, save?.mainCharacterId === char.id, save?.sideCharacterIds.includes(char.id) || false))}
        </div>

        {/* Desktop: Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
          {CHARACTERS.map((char, idx) => renderCharacterCard(char, save?.mainCharacterId === char.id, save?.sideCharacterIds.includes(char.id) || false, idx))}
        </div>
      </div>

      {/* Start button */}
      {save?.mainCharacterId && (
        <div className="fixed bottom-0 left-0 right-0 p-3 z-30" style={{ background: 'linear-gradient(0deg, #1a1510 60%, transparent)' }}>
          <button className="glow-btn glow-btn-gold w-full text-lg py-3" onClick={() => setScreen('gameplay')}>
            ⚔️ ابدأ المغامرة بـ {getCharacter(save.mainCharacterId)?.name}
          </button>
        </div>
      )}

      {/* Confirm Main Dialog */}
      {confirmMain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="narrative-box p-6 max-w-sm w-full text-center fade-in">
            <h3 className="text-xl font-bold mb-4 golden-text">⚠️ تأكيد تغيير الشخصية</h3>
            <p className="mb-4" style={{ color: '#e8dcc8' }}>هل تريد تغيير شخصيتك الرئيسية إلى {getCharacter(confirmMain)?.name}؟</p>
            <div className="flex gap-3">
              <button className="glow-btn glow-btn-gold flex-1" onClick={() => {
                if (!save) return;
                const s = { ...save, mainCharacterId: confirmMain };
                if (!s.playedCharacterIds.includes(confirmMain)) s.playedCharacterIds = [...s.playedCharacterIds, confirmMain];
                setSave(s);
                setConfirmMain(null);
              }}>نعم</button>
              <button className="fantasy-btn-secondary flex-1" onClick={() => setConfirmMain(null)}>لا</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // SCREEN: Kingdom Board
  // ============================================
  const renderKingdomScreen = () => {
    if (!save) return null;
    const char = getCharacter(save.mainCharacterId || '');
    const region = REGIONS[save.regionIndex];

    return (
      <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #1a1510 0%, #15110c 100%)' }}>
        <div className="top-bar py-2 px-4 flex items-center justify-between">
          <span className="text-sm golden-text font-bold font-serif-heading">🏰 مملكة نور الحكمة</span>
          <span className="text-xs" style={{ color: '#9a8b72' }}>👤 {onlineCount} متصل</span>
        </div>

        <div className="content-area p-3 pb-16">
          {/* Current Status */}
          <div className="narrative-box p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              {char?.portrait ? (
                <div className="scene-frame" style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', overflow: 'hidden' }}>
                  <ImgWithFallback src={char.portrait} alt={char.name} fallbackEmoji={char.emoji} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
              ) : (
                <span className="text-2xl">{char?.emoji}</span>
              )}
              <div>
                <h3 className="font-bold golden-text text-sm">{save.name}</h3>
                <p className="text-xs" style={{ color: '#9a8b72' }}>{char?.classAr} • {char?.name}</p>
              </div>
            </div>
            <div className="gold-divider my-2" />
            <div className="flex gap-3 justify-center flex-wrap">
              <span className="resource-icon" style={{ color: '#5a8a47' }}>❤️ {save.resources.health}/{save.resources.maxHealth}</span>
              <span className="resource-icon" style={{ color: '#c9a84c' }}>💰 {save.resources.gold}</span>
              <span className="resource-icon" style={{ color: '#6a8fc4' }}>💎 {save.resources.mana}/{save.resources.maxMana}</span>
              <span className="resource-icon" style={{ color: '#9b7dc4' }}>📖 {save.resources.knowledge}</span>
              <span className="resource-icon" style={{ color: '#c9a84c' }}>⭐ {save.resources.reputation}</span>
            </div>
          </div>

          {/* Current Region */}
          {region && (
            <div className="narrative-box p-3 mb-3">
              <h3 className="font-bold golden-text text-sm mb-1">📍 المنطقة الحالية: {region.emoji} {region.name}</h3>
              <p className="text-xs text-right" style={{ color: '#b8a88a' }}>{region.description}</p>
            </div>
          )}

          {/* Allies */}
          {save.allies.length > 0 && (
            <div className="narrative-box p-3 mb-3">
              <h3 className="font-bold golden-text text-sm mb-2">🤝 الحلفاء</h3>
              <div className="flex flex-wrap gap-2">
                {save.allies.map((ally) => {
                  const allyChar = getCharacter(ally.characterId);
                  return (
                    <div key={ally.characterId} className="flex items-center gap-1 p-1.5 rounded" style={{ background: 'rgba(201, 168, 76, 0.06)', border: '1px solid rgba(201, 168, 76, 0.12)' }}>
                      <span>{allyChar?.emoji}</span>
                      <span className="text-xs" style={{ color: '#e8dcc8' }}>{ally.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Region Progress */}
          <div className="narrative-box p-3 mb-3">
            <h3 className="font-bold golden-text text-sm mb-2">🗺️ تقدم الرحلة</h3>
            <div className="flex gap-1 justify-center">
              {REGIONS.map((r, i) => (
                <div key={r.id} className="flex flex-col items-center" style={{ opacity: i <= save.regionIndex ? 1 : 0.3 }}>
                  <span className="text-lg">{r.emoji}</span>
                  <span className="text-xs" style={{ color: i <= save.regionIndex ? '#c9a84c' : '#9a8b72' }}>{i < save.regionIndex ? '✅' : i === save.regionIndex ? '📍' : '🔒'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed */}
          {feed.length > 0 && (
            <div className="narrative-box p-3 mb-3">
              <h3 className="font-bold golden-text text-sm mb-2">📰 أخبار المملكة</h3>
              <div className="space-y-1">
                {feed.slice(0, 5).map((f) => (
                  <div key={f.id} className="text-xs text-right" style={{ color: '#b8a88a' }}>
                    {f.emoji} {f.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav">
          <div className="flex justify-around items-center py-1.5 px-1">
            <button className="nav-btn" onClick={() => setScreen('gameplay')}><span className="nav-btn-icon">📖</span><span>القصة</span></button>
            <button className="nav-btn" onClick={() => setScreen('kingdom')}><span className="nav-btn-icon">🏰</span><span>المملكة</span></button>
            <button className="nav-btn" onClick={() => setScreen('profile')}><span className="nav-btn-icon">👤</span><span>ملفي</span></button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // SCREEN: Player Profile
  // ============================================
  const renderProfileScreen = () => {
    if (!save) return null;
    const char = getCharacter(save.mainCharacterId || '');

    return (
      <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #1a1510 0%, #15110c 100%)' }}>
        <div className="top-bar py-2 px-4 flex items-center justify-between">
          <span className="text-sm golden-text font-bold font-serif-heading">👤 ملف اللاعب</span>
          <button className="text-xs" style={{ color: '#9a8b72' }} onClick={() => setScreen('kingdom')}>→ المملكة</button>
        </div>

        <div className="content-area p-3 pb-16">
          {/* Character Info */}
          <div className="narrative-box p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{char?.emoji}</span>
              <div>
                <h3 className="font-bold golden-text text-lg">{save.name}</h3>
                <p className="text-sm" style={{ color: '#b8a88a' }}>{char?.classAr} • {char?.name}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              {Object.entries(char?.stats || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs w-14 text-right" style={{ color: '#9a8b72' }}>{STAT_NAMES[key]}</span>
                  <div className="flex-1 stat-bar" style={{ height: '4px' }}>
                    <div className="stat-bar-fill" style={{ width: `${((value + (save.bonusStats[`${char?.id}_${key}`] || 0)) / 8) * 100}%`, background: STAT_COLORS[key] }} />
                  </div>
                  <span className="text-xs font-bold w-6 text-center" style={{ color: STAT_COLORS[key] }}>{value + (save.bonusStats[`${char?.id}_${key}`] || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="narrative-box p-3 mb-3">
            <h3 className="font-bold golden-text text-sm mb-2">📦 الموارد</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-lg">❤️</div>
                <div className="text-xs font-bold" style={{ color: '#5a8a47' }}>{save.resources.health}/{save.resources.maxHealth}</div>
              </div>
              <div className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-lg">💰</div>
                <div className="text-xs font-bold" style={{ color: '#c9a84c' }}>{save.resources.gold}</div>
              </div>
              <div className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-lg">💎</div>
                <div className="text-xs font-bold" style={{ color: '#6a8fc4' }}>{save.resources.mana}/{save.resources.maxMana}</div>
              </div>
              <div className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-lg">📖</div>
                <div className="text-xs font-bold" style={{ color: '#9b7dc4' }}>{save.resources.knowledge}</div>
              </div>
              <div className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-lg">⭐</div>
                <div className="text-xs font-bold" style={{ color: '#c9a84c' }}>{save.resources.reputation}</div>
              </div>
              <div className="text-center p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                <div className="text-lg">💀</div>
                <div className="text-xs font-bold" style={{ color: '#a03030' }}>{save.deathCount}</div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="narrative-box p-3 mb-3">
            <h3 className="font-bold golden-text text-sm mb-2">🏆 الإنجازات ({save.achievements.length}/{ACHIEVEMENTS.length})</h3>
            <div className="space-y-1">
              {ACHIEVEMENTS.map(ach => {
                const unlocked = save.achievements.includes(ach.id);
                return (
                  <div key={ach.id} className="flex items-center gap-2 p-1.5 rounded text-right" style={{ opacity: unlocked ? 1 : 0.35, background: unlocked ? 'rgba(201, 168, 76, 0.06)' : 'transparent' }}>
                    <span>{ach.emoji}</span>
                    <div className="flex-1">
                      <span className="text-xs font-bold" style={{ color: unlocked ? '#c9a84c' : '#9a8b72' }}>{ach.name}</span>
                      <p className="text-xs" style={{ color: '#9a8b72' }}>{ach.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bottom-nav">
          <div className="flex justify-around items-center py-1.5 px-1">
            <button className="nav-btn" onClick={() => setScreen('gameplay')}><span className="nav-btn-icon">📖</span><span>القصة</span></button>
            <button className="nav-btn" onClick={() => setScreen('kingdom')}><span className="nav-btn-icon">🏰</span><span>المملكة</span></button>
            <button className="nav-btn nav-btn-active" onClick={() => setScreen('profile')}><span className="nav-btn-icon">👤</span><span>ملفي</span></button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // SCREEN: Gameplay (Life in Adventure Layout)
  // ============================================
  const renderGameplayScreen = () => {
    if (!save) return null;
    const char = getCharacter(save.mainCharacterId || '');
    const region = REGIONS[save.regionIndex];
    const events = region ? REGION_EVENTS[region.id] || [] : [];
    const currentEvent = events[save.eventIndex];
    const enemies = region ? REGION_ENEMIES[region.id] || [] : [];
    const currentEnemy = currentEvent?.type === 'battle' ? enemies[rand(0, enemies.length - 1)] : null;

    // Determine scene image
    const sceneImage = currentEvent?.image || currentEnemy?.image || region?.backgroundImage;
    const isBattle = currentEvent?.type === 'battle';

    return (
      <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #1a1510 0%, #15110c 100%)' }}>
        {/* Region Background */}
        {region?.backgroundImage && (
          <div className="region-bg region-transition" style={{ backgroundImage: `url(${region.backgroundImage})` }} />
        )}

        {/* Top Resource Bar - Very Compact */}
        <div className="top-bar py-1.5 px-3" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-lg">{region?.emoji}</span>
              <span className="text-xs font-bold truncate" style={{ color: '#c9a84c' }}>{region?.name}</span>
              <span className="text-xs" style={{ color: '#9a8b72' }}>({save.eventIndex + 1}/{events.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="resource-icon" style={{ color: '#5a8a47' }}>❤️{save.resources.health}</span>
              <span className="resource-icon" style={{ color: '#c9a84c' }}>💰{save.resources.gold}</span>
              <span className="resource-icon" style={{ color: '#6a8fc4' }}>💎{save.resources.mana}</span>
              <span className="text-lg">{char?.emoji}</span>
            </div>
          </div>
          {/* Health bar */}
          <div className="health-mini-bar mt-1">
            <div className="health-mini-fill" style={{
              width: `${(save.resources.health / save.resources.maxHealth) * 100}%`,
              background: save.resources.health > 50 ? '#5a8a47' : save.resources.health > 25 ? '#c9a84c' : '#a03030'
            }} />
          </div>
        </div>

        {/* Main Gameplay Area - No Scroll, Fits Viewport */}
        <div className={`gameplay-layout ${battleEffect === 'shake' ? 'screen-shake' : ''}`} style={{ position: 'relative', zIndex: 1 }}>

          {/* Scene Image - 30% of viewport */}
          {sceneImage && !eventOutcome && (
            <div className="gameplay-scene" style={{ padding: '6px 10px' }}>
              <div className={`scene-frame ${isBattle ? 'scene-frame-danger' : 'scene-frame-gold'}`}>
                <ImgWithFallback
                  src={sceneImage}
                  alt={currentEvent?.title || region?.name || ''}
                  fallbackEmoji={currentEvent?.emoji || region?.emoji || '🌲'}
                  style={{ width: '100%', maxHeight: '28vh', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Narrative Box - scrollable if needed */}
          <div className="gameplay-narrative">
            {currentEvent && !eventOutcome && (
              <div className="narrative-box mt-2 fade-in">
                {/* Event type badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="compact-badge" style={{ background: 'rgba(201, 168, 76, 0.1)', border: '1px solid rgba(201, 168, 76, 0.2)', color: '#c9a84c' }}>
                    {currentEvent.emoji} {currentEvent.type === 'battle' ? '⚔️ مواجهة' : currentEvent.type === 'puzzle' ? '🧩 لغز' : currentEvent.type === 'merchant' ? '🏪 تاجر' : currentEvent.type === 'comedy' ? '😂 حدث' : currentEvent.type === 'crossroads' ? '⚖️ مفترق' : currentEvent.type === 'encounter' ? '🤝 لقاء' : '🔮 سر'}
                  </span>
                </div>
                <h3 className="font-bold golden-text text-base mb-1 font-serif-heading">{currentEvent.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#e8dcc8' }}>{currentEvent.description}</p>

                {/* Lina Foresight */}
                {linaForesight && (
                  <div className="mt-2 p-2 rounded" style={{ background: 'rgba(155, 125, 196, 0.1)', border: '1px solid rgba(155, 125, 196, 0.2)' }}>
                    <p className="text-xs" style={{ color: '#9b7dc4' }}>📖 البصيرة: يمكنك رؤية نتائج الخيارات!</p>
                  </div>
                )}

                {/* Monster info in battle */}
                {isBattle && currentEnemy && (
                  <div className="mt-2 p-2 rounded" style={{ background: 'rgba(139, 58, 58, 0.08)', border: '1px solid rgba(139, 58, 58, 0.2)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color: '#a03030' }}>{currentEnemy.emoji} {currentEnemy.name}</span>
                      <span className="text-xs" style={{ color: '#9a8b72' }}>⚔️ ضرر: {currentEnemy.damage} | 💰 جائزة: {currentEnemy.goldReward}</span>
                    </div>
                    <div className="monster-hp-bar">
                      <div className="monster-hp-fill" style={{ width: '100%' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Event Outcome */}
            {eventOutcome && (
              <div className="narrative-box mt-2 fade-in">
                <div className="ornament mb-2">⚜ ⚜ ⚜</div>
                <p className="text-sm leading-relaxed font-serif-heading" style={{ color: '#e8dcc8' }}>{eventOutcome}</p>
              </div>
            )}
          </div>

          {/* Choices / Actions Area */}
          <div className="gameplay-choices">
            {!eventOutcome && currentEvent && (
              <div className="space-y-2">
                {currentEvent.options.map((option, idx) => {
                  const isDanger = option.text.includes('هرب') || option.text.includes('هروب') || option.text.includes('قتال');
                  return (
                    <button
                      key={idx}
                      className={`event-option ${isDanger ? 'event-option-danger' : ''}`}
                      onClick={() => processOutcome(option, save)}
                    >
                      <span className="flex-1 text-right">{option.text}</span>
                      {option.statCheck && (
                        <span className="stat-badge">
                          {STAT_ICONS[option.statCheck]} {STAT_NAMES[option.statCheck]} {option.statThreshold}+
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Ability Button */}
                {char && !save.abilityUsedThisRegion && (
                  <button className="event-option" style={{ borderColor: 'rgba(201, 168, 76, 0.4)', background: 'linear-gradient(135deg, #3a3020, #4a3d28)' }}
                    onClick={useAbility}>
                    <span className="flex-1 text-right golden-text">⚡ {char.uniqueAbilityAr.split(' - ')[0]}</span>
                    <span className="stat-badge" style={{ background: 'rgba(201, 168, 76, 0.15)' }}>قدرة</span>
                  </button>
                )}

                {/* Ally indicators */}
                {save.allies.length > 0 && (
                  <div className="flex gap-1 justify-center mt-1">
                    {save.allies.map(ally => (
                      <span key={ally.characterId} className="text-lg" title={ally.name}>{getCharacter(ally.characterId)?.emoji}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Outcome Continue Button */}
            {eventOutcome && (
              <div className="space-y-2">
                {/* Stat point mode */}
                {statPointMode && (
                  <div className="narrative-box p-3 mb-2">
                    <h3 className="font-bold golden-text text-sm mb-2 text-center">📈 نقاط إحصائية! ({statPoints} متبقي)</h3>
                    <div className="grid grid-cols-3 gap-1">
                      {Object.entries(char?.stats || {}).map(([key]) => (
                        <button key={key} className="glow-btn text-xs py-1.5" style={{ minHeight: '36px' }}
                          onClick={() => applyStatPoint(key)}>
                          {STAT_ICONS[key]} {STAT_NAMES[key]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button className="glow-btn glow-btn-gold w-full text-base py-3" onClick={nextEvent}>
                  {statPointMode ? '⚔️ متابعة المغامرة' : '▶️ متابعة'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Damage Numbers */}
        {damageNumbers.map(d => (
          <div key={d.id} className="damage-number" style={{ left: `${d.x}%`, top: `${d.y}%`, color: d.color }}>
            {d.value}
          </div>
        ))}

        {/* Achievement Toast */}
        {showAchievement && (
          <div className="fixed top-16 left-4 right-4 z-50 fade-in">
            <div className="narrative-box p-3 text-center event-card-gold">
              <span className="golden-text font-bold">🏆 إنجاز جديد: {showAchievement}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // SCREEN: Ending
  // ============================================
  const renderEndingScreen = () => {
    if (!save) return null;
    const ending = ENDINGS.find(e => e.id === endingId) || ENDINGS[0];
    const char = getCharacter(save.mainCharacterId || '');

    return (
      <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #1a1510 0%, #0d0a07 50%, #1a1510 100%)' }}>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center fade-in max-w-md w-full">
            <div className="ornament mb-4">⚜ ✦ ⚜ ✦ ⚜</div>
            <span className="text-6xl mb-4 block">{ending.emoji}</span>
            <h2 className="text-3xl font-bold mb-2 golden-text font-serif-heading">{ending.name}</h2>
            <p className="text-base mb-4 leading-relaxed" style={{ color: '#e8dcc8' }}>{ending.description}</p>
            <div className="ornament mb-4">◆ ◇ ◆</div>

            {/* Final Stats */}
            <div className="narrative-box p-4 mb-4">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center"><span className="text-lg">{char?.emoji}</span><br/><span className="text-xs" style={{ color: '#9a8b72' }}>{char?.name}</span></div>
                <div className="text-center"><span className="text-lg">💰</span><br/><span className="text-xs font-bold" style={{ color: '#c9a84c' }}>{save.resources.gold}</span></div>
                <div className="text-center"><span className="text-lg">📖</span><br/><span className="text-xs font-bold" style={{ color: '#9b7dc4' }}>{save.resources.knowledge}</span></div>
              </div>
              <div className="gold-divider my-2" />
              <p className="text-xs" style={{ color: '#9a8b72' }}>
                ⭐ السمعة: {save.resources.reputation} | 🤝 الحلفاء: {save.allies.length} | 💀 الوفيات: {save.deathCount}
              </p>
            </div>

            <button className="glow-btn glow-btn-gold w-full text-lg py-3" onClick={() => {
              const newSave = createDefaultSave(save.name);
              newSave.mainCharacterId = save.mainCharacterId;
              newSave.playedCharacterIds = save.playedCharacterIds;
              newSave.highestScore = save.highestScore;
              newSave.completions = save.completions;
              setSave(newSave);
              setEndingId(null);
              setScreen('kingdom');
            }}>
              ⚔️ مغامرة جديدة
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // Render Current Screen
  // ============================================
  switch (screen) {
    case 'login': return renderLoginScreen();
    case 'characterSelect': return renderCharacterSelectScreen();
    case 'kingdom': return renderKingdomScreen();
    case 'profile': return renderProfileScreen();
    case 'gameplay': return renderGameplayScreen();
    case 'ending': return renderEndingScreen();
    default: return renderLoginScreen();
  }
}
