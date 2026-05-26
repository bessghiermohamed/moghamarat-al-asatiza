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

// D20 roll system - inspired by Life in Adventure / D&D
function rollD20(statValue: number, difficulty: number): { roll: number; modifier: number; total: number; success: boolean; critical: boolean; criticalFail: boolean } {
  const roll = rand(1, 20);
  const modifier = Math.floor((statValue - 10) / 2); // +0 at 10, +4 at 18, -4 at 3
  const total = roll + modifier;
  const critical = roll === 20;
  const criticalFail = roll === 1;
  const success = critical || (!criticalFail && total >= difficulty);
  return { roll, modifier, total, success, critical, criticalFail };
}

function statCheck(statValue: number, threshold: number): boolean {
  // Convert old-style stat check to D20: stat 1-5 mapped to D20 stat 3-18
  const d20Stat = 3 + (statValue - 1) * 3; // 1->3, 2->6, 3->9, 4->12, 5->15
  const difficulty = 8 + threshold * 3; // threshold 2->14, 3->17, 4->20
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

const STAT_NAMES: Record<string, string> = {
  strength: 'القوة',
  intelligence: 'الذكاء',
  luck: 'الحظ',
  charisma: 'الكاريزما',
  mana: 'المانا',
  defense: 'الدفاع',
};

const STAT_COLORS: Record<string, string> = {
  strength: '#b05050',
  intelligence: '#8b5cf6',
  luck: '#5a9a5a',
  charisma: '#8b7355',
  mana: '#3b82f6',
  defense: '#f97316',
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
  const [prevRegionIndex, setPrevRegionIndex] = useState(-1);

  // Battle effects
  const triggerBattleEffect = useCallback((type: 'shake' | 'damage' | 'heal', dmgValue?: number) => {
    setBattleEffect(type);
    if (dmgValue !== undefined) {
      const id = Date.now();
      setDamageNumbers(prev => [...prev, { id, value: dmgValue, x: 30 + Math.random() * 40, y: 30 + Math.random() * 20, color: type === 'heal' ? '#5a9a5a' : '#b05050' }]);
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
      } catch {
        // corrupted save, ignore
      }
    }
    const savedFeed = localStorage.getItem('moghamara_feed');
    if (savedFeed) {
      try {
        queueMicrotask(() => setFeed(JSON.parse(savedFeed)));
      } catch {
        // corrupted feed, ignore
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (save) {
      localStorage.setItem('moghamara_save', JSON.stringify(save));
    }
  }, [save]);

  useEffect(() => {
    localStorage.setItem('moghamara_feed', JSON.stringify(feed));
  }, [feed]);

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

    if (res.reputation >= 100 && res.knowledge >= 40 && s.allies.length >= 3) {
      ending = 'secret_ending';
    } else if (s.mainCharacterId === 'aya_boubaker') {
      ending = 'glorious_chaos';
    } else if (s.mainCharacterId === 'karim' && s.karimDragonCount >= 2) {
      ending = 'dragon_legend';
    } else if (s.battlesFled >= 5 && (s.battlesNegotiated + s.battlesFled) > s.totalEventsCompleted * 0.5) {
      ending = 'mysterious_survivor';
    } else if (res.knowledge >= 50) {
      ending = 'knowledge_guardian';
    } else if (s.allies.length >= 3) {
      ending = 'nation_leader';
    } else if (res.health <= 0 || s.deathCount >= 2) {
      ending = 'martyr';
    }

    const score = res.health + res.gold + res.knowledge * 2 + res.reputation + s.allies.length * 50 + s.completions * 100;
    const updated: PlayerSave = {
      ...s,
      completions: s.completions + 1,
      highestScore: Math.max(s.highestScore, score),
      endTime: Date.now(),
    };
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

    // Asma discount
    if (s.mainCharacterId === 'asma' && (outcome.goldChange || 0) < 0) {
      const refund = Math.abs(outcome.goldChange || 0) * 0.5;
      res.gold = Math.max(0, res.gold + Math.floor(refund));
    }

    // Nour passive: +5 HP per event
    if (s.allies.some(a => a.characterId === 'nour')) {
      res.health = clamp(res.health + 5, 0, res.maxHealth);
    }

    // Doua bensabaha passive: +3 HP per event
    if (s.allies.some(a => a.characterId === 'doua_bensabaha')) {
      res.health = clamp(res.health + 3, 0, res.maxHealth);
    }

    // Basma passive: double item finds
    if (s.mainCharacterId === 'basma' && (outcome.goldChange || 0) > 0) {
      res.gold += Math.floor((outcome.goldChange || 0) * 0.5);
    }

    // Aya boubaker passive: funny positive bonus
    if (s.mainCharacterId === 'aya_boubaker' && rand(1, 3) === 1) {
      const bonus = rand(1, 5);
      res.gold += bonus;
    }

    // Handle ally gain
    if (outcome.allyGain) {
      const allyChar = getCharacter(outcome.allyGain);
      if (allyChar && s.allies.length < 3 && !s.allies.some(a => a.characterId === outcome.allyGain)) {
        const hasBouhalassa = s.allies.some(a => a.characterId === 'aya_bouhalassa') || outcome.allyGain === 'aya_bouhalassa';
        const hasBoubaker = s.allies.some(a => a.characterId === 'aya_boubaker') || outcome.allyGain === 'aya_boubaker';
        if (hasBouhalassa && hasBoubaker) {
          // They fight - can't add
          outcome.text += ' لكن آية بوبكر وآية بوحلاسة تشاجرتا ورفضتا العمل معاً!';
        } else {
          const passive = ALLY_PASSIVES[outcome.allyGain];
          s.allies.push({
            characterId: outcome.allyGain,
            name: allyChar.name,
            passiveAbilityAr: passive?.passiveAbilityAr || '',
          });
        }
      }
    }

    // Track stats
    let battlesFled = s.battlesFled;
    let battlesNegotiated = s.battlesNegotiated;
    let puzzlesSolved = s.puzzlesSolved;
    let merchantBuys = s.merchantBuys;
    let karimDragonCount = s.karimDragonCount;

    const currentEvents = REGION_EVENTS[REGIONS[s.regionIndex]?.id] || [];
    const currentEvent = currentEvents[s.eventIndex];
    if (currentEvent?.type === 'battle') {
      if (option.text.includes('الهروب') || option.text.includes('هرب')) battlesFled++;
      if (option.text.includes('المفاوضة') || option.text.includes('إقناع')) battlesNegotiated++;
    }
    if (currentEvent?.type === 'puzzle' && success) puzzlesSolved++;
    if (currentEvent?.type === 'merchant') merchantBuys++;

    // Karim dragon check
    if (s.mainCharacterId === 'karim' && currentEvent?.type === 'battle') {
      if (rand(1, 10) === 1) {
        karimDragonCount++;
        res.health = clamp(res.health + 50, 0, res.maxHealth);
        res.gold += 30;
        outcome.text += ' 🐉 كريم تحول لتنين وأحرق العدو! +50 صحة +30 ذهب!';
      }
    }

    // Death check
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

    s = {
      ...s,
      resources: res,
      battlesFled,
      battlesNegotiated,
      puzzlesSolved,
      merchantBuys,
      karimDragonCount,
      totalEventsCompleted: s.totalEventsCompleted + 1,
    };

    s = checkAchievements(s);
    setSave(s);
    setEventOutcome(outcome.text);

    // Trigger visual effects
    if (currentEvent?.type === 'battle') {
      if (outcome.healthChange && outcome.healthChange < 0) {
        triggerBattleEffect('shake', Math.abs(outcome.healthChange));
      }
      if (outcome.healthChange && outcome.healthChange > 0) {
        triggerBattleEffect('heal', outcome.healthChange);
      }
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
      // Region complete
      const points = s.resources.health > 70 ? 2 : 1;
      setStatPoints(points);
      setStatPointMode(true);

      // Naska passive: full restore at end of region
      if (s.mainCharacterId === 'naska') {
        s.resources.health = s.resources.maxHealth;
        s.resources.mana = s.resources.maxMana;
      }

      addFeed(`${s.name} أكمل ${getRegionName(s.regionIndex)}`, '✅');

      if (s.regionIndex >= 5) {
        determineEnding(s);
        return;
      }

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
      case 'ibrahim':
        s.resources.mana -= 10;
        abilityText = '⚔️ الضربة المزدوجة! ضربت العدو مرتين! (-10 مانا)';
        break;
      case 'abdullah':
        abilityText = '🛡️ درع الإيمان! ستمتص الضربة التالية كاملاً!';
        break;
      case 'sufian': {
        const stolenGold = rand(5, 20);
        s.resources.gold += stolenGold;
        abilityText = `🗡️ السرقة الخفية! سرقت ${stolenGold} ذهب!`;
        break;
      }
      case 'boukhloua':
        if (rand(1, 2) === 1) {
          s.resources.health = clamp(s.resources.health - 15, 1, s.resources.maxHealth);
          abilityText = '🐸 تحولت لضفدعة لجولة! -15 صحة... لكن على الأقل أنت أخضر!';
        } else {
          s.resources.gold += 30;
          abilityText = '💥 تعويذة الفوضى! دمرت العدو وحصلت على 30 ذهب!';
        }
        break;
      case 'yacine':
        if (s.resources.health < 30) {
          abilityText = '💪 غضب المحارب! ضررك تضاعف لأن صحتك منخفضة!';
        } else {
          abilityText = '💪 غضب المحارب! لكن صحتك ليست منخفضة كفاية...';
        }
        break;
      case 'ousama':
        abilityText = '👑 صرخة القيادة! كل حلفائك تعززوا بنقطة!';
        break;
      case 'karim':
        if (rand(1, 10) <= 1) {
          s.karimDragonCount++;
          s.resources.gold += 50;
          abilityText = '🐉 كريم تحول لتنين!!! دمر كل شيء! +50 ذهب!';
        } else {
          abilityText = '🐉 لم يتحول كريم هذه المرة... التنين نائم.';
        }
        break;
      case 'lina':
        setLinaForesight(true);
        abilityText = '📖 البصيرة! يمكنك رؤية نتيجة الخيارات هذه المرة!';
        break;
      case 'nour':
        s.resources.health = clamp(s.resources.health + 30, 0, s.resources.maxHealth);
        abilityText = '✨ الشفاء الفوري! +30 صحة!';
        break;
      case 'asma':
        abilityText = '💰 المفاوضة! ستحصل على خصم 50% عند أي تاجر!';
        break;
      case 'maram':
        abilityText = '📜 قصيدة السحر! العدو مشلول لـ 3 جولات!';
        break;
      case 'aya1':
        abilityText = '🕊️ التنبؤ! ترى الحدث القادم قبل الوصول إليه!';
        break;
      case 'doua_bentemra':
        s.resources.mana -= 25;
        abilityText = '🔥 الجحيم! كل الأعداء احترقوا! (-25 مانا)';
        break;
      case 'doua_bensabaha':
        s.resources.health = clamp(s.resources.health + 20, 0, s.resources.maxHealth);
        abilityText = '🌊 موجة الشفاء! +20 صحة لك وكل حلفائك!';
        break;
      case 'doua_bensaidan':
        abilityText = '💨 العاصفة! يمكنك الهروب من أي معركة فوراً!';
        break;
      case 'rawan':
        abilityText = '🌿 لغة الطبيعة! حيوانات الغابة ستحارب معك!';
        break;
      case 'bouchra':
        abilityText = '👸 السلطة الملكية! الشخصيات غير العدائية ستطيعك!';
        break;
      case 'feryal':
        abilityText = '🔍 التحقيق! تكشف نوايا ونقاط ضعف كل شخصية!';
        break;
      case 'basma':
        s.resources.gold += 15;
        s.resources.health = clamp(s.resources.health + 10, 0, s.resources.maxHealth);
        abilityText = '🌾 حظ المزرعة! وجدت طعام وأدوات! +15 ذهب +10 صحة!';
        break;
      case 'chaimaa':
        abilityText = '🗺️ الخريطة المخفية! ترى مسارات سرية إضافية!';
        break;
      case 'khaira':
        abilityText = '🥷 التنكّر! تتجنب أي مواجهة دون قتال!';
        break;
      case 'fatiha':
        s.puzzlesSolved++;
        s.resources.knowledge += 10;
        abilityText = '🧓 حكمة الزمن! أي لغز يُحل تلقائياً! +10 معرفة!';
        break;
      case 'aya_bouhalassa':
        abilityText = '👼 الحماية الإلهية! لن تموت في المرة القادمة!';
        break;
      case 'aya_boubaker':
        s.resources.gold += rand(10, 30);
        s.resources.health = clamp(s.resources.health + rand(5, 20), 0, s.resources.maxHealth);
        abilityText = '😈 الفوضى المضحكة! شيء غير متوقع ويومض حدث! نتائج إيجابية!';
        break;
      case 'naska':
        s.resources.health = s.resources.maxHealth;
        s.resources.mana = s.resources.maxMana;
        abilityText = '🧘 التأمل! استعادة كاملة للصحة والمانا!';
        break;
      case 'boudar':
        abilityText = '🏹 القناص! تضرب أولاً في المعركة القادمة!';
        break;
      case 'benyamina':
        abilityText = '🐴 هجوم الفرسان! ضرر مضاعف في الجولة الأولى!';
        break;
      default:
        abilityText = '✨ استخدمت قدرتك الخاصة!';
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

    if (stat === 'mana') {
      s.resources = { ...s.resources, maxMana: s.resources.maxMana + 5 };
    }

    const newPoints = statPoints - 1;
    setStatPoints(newPoints);
    if (newPoints <= 0) {
      setStatPointMode(false);
    }
    setSave(s);
  }, [save, statPoints]);

  // Resource Bar Component
  const ResourceBar = ({ value, max, color, label, emoji }: { value: number; max: number; color: string; label: string; emoji: string }) => (
    <div className="mb-1">
      <div className="flex justify-between text-xs mb-0.5">
        <span style={{ color }}>{emoji} {label}</span>
        <span style={{ color: '#c8c8d0' }}>{value}/{max}</span>
      </div>
      <div className="resource-bar">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(2, (value / max) * 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
        <div className="resource-bar-text">{emoji} {value}/{max}</div>
      </div>
    </div>
  );

  // ============================================
  // SCREEN: Login
  // ============================================
  const renderLoginScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #070709 50%, #0a0a0f 100%)' }}>
      <div className="text-center fade-in max-w-md w-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 font-serif-heading" style={{ color: '#8b7355', letterSpacing: '0.05em' }}>
          مغامرة الأساتذة
        </h1>
        <p className="text-lg mb-8" style={{ color: '#7a7a8a' }}>مملكة نور الحكمة</p>

        <div className="scroll-container p-6 mx-auto">
          <label className="block text-lg mb-3 font-bold" style={{ color: '#8b7355' }}>
            أدخل اسمك الحقيقي
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 rounded-lg text-right text-lg outline-none focus:ring-2 focus:ring-[#8b7355]"
            style={{ background: '#12121a', border: '2px solid #4a3a6b', color: '#c8c8d0' }}
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
            className="fantasy-btn w-full mt-4 text-lg"
            onClick={() => {
              if (playerName.trim()) {
                const newSave = createDefaultSave(playerName.trim());
                setSave(newSave);
                addFeed(`${playerName.trim()} انضم إلى مملكة نور الحكمة!`, '🆕');
                setScreen('characterSelect');
              }
            }}
            disabled={!playerName.trim()}
            style={{ opacity: playerName.trim() ? 1 : 0.5 }}
          >
            ابدأ المغامرة
          </button>
        </div>

        <div className="mt-8 p-4 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(18, 18, 26, 0.7)', border: '1px solid #4a3a6b' }}>
          <p style={{ color: '#7a7a8a' }}>
            📜 سُرق <strong style={{ color: '#8b7355' }}>الكتاب الأعظم</strong> من قلعة الظلام على يد حارس خائن.
            أنت المغامر الوحيد القادر على عبور المناطق الست واستعادته.
            اختر شخصيتك بعناية، وجمع الحلفاء، وواجه الأخطار...
          </p>
        </div>
      </div>
    </div>
  );

  // ============================================
  // SCREEN: Character Selection
  // ============================================
  const renderCharacterSelectScreen = () => (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #070709 100%)' }}>
      <div className="text-center p-4 mb-2" style={{ background: 'linear-gradient(135deg, #1a1a28, #12121a)', borderBottom: '1px solid #2a2a3e' }}>
        <h2 className="text-2xl font-bold font-serif-heading" style={{ color: '#8b7355' }}>
          اختر شخصيتك
        </h2>
        <p className="text-sm" style={{ color: '#7a7a8a' }}>اختر شخصية رئيسية تمثلك وشخصيات جانبية أيضاً</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl mx-auto">
        {CHARACTERS.map((char, idx) => {
          const isMain = save?.mainCharacterId === char.id;
          const isSide = save?.sideCharacterIds.includes(char.id) || false;

          return (
            <div
              key={char.id}
              className={`game-card slide-in ${isMain ? 'game-card-selected' : ''} ${isSide ? 'game-card-selected' : ''}`}
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{char.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg" style={{ color: '#8b7355' }}>{char.name}</h3>
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#2a2a3e', color: '#7a7a8a' }}>
                      {char.classAr}
                    </span>
                    {isMain && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-600 text-yellow-100">⭐ رئيسية</span>}
                    {isSide && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-600 text-purple-100">جانبية</span>}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-1 mb-3">
                {[
                  { label: 'القوة', value: char.stats.strength, color: '#b05050' },
                  { label: 'الذكاء', value: char.stats.intelligence, color: '#8b5cf6' },
                  { label: 'الحظ', value: char.stats.luck, color: '#5a9a5a' },
                  { label: 'الكاريزما', value: char.stats.charisma, color: '#8b7355' },
                  { label: 'المانا', value: char.stats.mana, color: '#3b82f6' },
                  { label: 'الدفاع', value: char.stats.defense, color: '#f97316' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 text-xs">
                    <span className="w-14" style={{ color: '#7a7a8a' }}>{stat.label}</span>
                    <div className="flex-1 stat-bar">
                      <div className="stat-bar-fill" style={{ width: `${(stat.value / 6) * 100}%`, background: stat.color }} />
                    </div>
                    <span className="w-4 text-center" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Unique Ability */}
              <div className="mb-2 p-2 rounded-lg text-xs" style={{ background: 'rgba(107, 63, 160, 0.2)', borderRight: '3px solid #8b7355' }}>
                <span style={{ color: '#8b7355' }}>✨ {char.uniqueAbilityAr}</span>
              </div>

              {/* Signature */}
              <p className="text-xs italic mb-3" style={{ color: '#7a7a8a' }}>
                &ldquo;{char.signature}&rdquo;
              </p>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  className="fantasy-btn flex-1 text-sm py-2"
                  onClick={() => {
                    if (!save) return;
                    if (save.mainCharacterId && save.mainCharacterId !== char.id) {
                      setConfirmMain(char.id);
                    } else {
                      const s = { ...save, mainCharacterId: char.id };
                      if (!s.playedCharacterIds.includes(char.id)) {
                        s.playedCharacterIds = [...s.playedCharacterIds, char.id];
                      }
                      setSave(s);
                      addFeed(`${save.name} اختار ${char.name} كشخصية رئيسية`, char.emoji);
                    }
                  }}
                >
                  ⭐ رئيسية
                </button>
                <button
                  className="fantasy-btn-secondary flex-1 text-sm py-2"
                  onClick={() => {
                    if (!save) return;
                    const s = { ...save, sideCharacterIds: [...save.sideCharacterIds] };
                    if (isSide) {
                      s.sideCharacterIds = s.sideCharacterIds.filter(id => id !== char.id);
                    } else {
                      s.sideCharacterIds.push(char.id);
                    }
                    setSave(s);
                  }}
                >
                  {isSide ? 'إزالة' : 'جانبية'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Main Dialog */}
      {confirmMain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="scroll-container p-6 max-w-sm w-full text-center fade-in">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#8b7355' }}>⚠️ تأكيد تغيير الشخصية الرئيسية</h3>
            <p className="mb-4" style={{ color: '#c8c8d0' }}>
              هل تريد تغيير شخصيتك الرئيسية إلى <strong style={{ color: '#8b7355' }}>{getCharacter(confirmMain)?.name}</strong>؟ هذا القرار نادر التغيير.
            </p>
            <div className="flex gap-3">
              <button className="fantasy-btn flex-1" onClick={() => {
                if (!save) return;
                const s = { ...save, mainCharacterId: confirmMain, playedCharacterIds: [...save.playedCharacterIds] };
                if (!s.playedCharacterIds.includes(confirmMain)) s.playedCharacterIds.push(confirmMain);
                setSave(s);
                addFeed(`${save.name} غيّر شخصيته الرئيسية إلى ${getCharacter(confirmMain)?.name}`, '🔄');
                setConfirmMain(null);
              }}>✅ نعم</button>
              <button className="fantasy-btn-secondary flex-1" onClick={() => setConfirmMain(null)}>❌ لا</button>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center" style={{ background: 'linear-gradient(180deg, transparent, #0a0a0f 30%)', zIndex: 40 }}>
        <button
          className="fantasy-btn text-lg px-8 py-3"
          onClick={() => {
            if (save?.mainCharacterId) {
              setScreen('kingdom');
              addFeed(`${save.name} دخل مملكة نور الحكمة`, '🏰');
            }
          }}
          disabled={!save?.mainCharacterId}
          style={{ opacity: save?.mainCharacterId ? 1 : 0.5 }}
        >
          دخول المملكة
        </button>
        {!save?.mainCharacterId && (
          <p className="mt-2 text-sm" style={{ color: '#b05050' }}>يجب اختيار شخصية رئيسية أولاً</p>
        )}
      </div>
    </div>
  );

  // ============================================
  // SCREEN: Kingdom Board
  // ============================================
  const renderKingdomScreen = () => {
    const char = getCharacter(save?.mainCharacterId || '');
    const currentRegion = REGIONS[save?.regionIndex || 0];

    return (
      <div className="min-h-screen pb-24 relative">
        {/* Region Background */}
        {currentRegion?.backgroundImage && (
          <div className="region-bg" style={{ backgroundImage: `url(${currentRegion.backgroundImage})` }} />
        )}
        {/* Header */}
        <div className="p-4 text-center relative z-10" style={{ background: 'rgba(18, 18, 26, 0.95)', borderBottom: '1px solid #2a2a3e', boxShadow: '0 4px 15px rgba(212, 160, 23, 0.3)', backdropFilter: 'blur(10px)' }}>
          <h1 className="text-2xl font-bold font-serif-heading" style={{ color: '#8b7355' }}>
            لوحة مملكة نور الحكمة
          </h1>
          <p style={{ color: '#7a7a8a' }}>مرحباً {save?.name} {char?.emoji}</p>
        </div>

        {/* Player Status Card */}
        <div className="p-4 relative z-10">
          <div className="game-card p-4" style={{ backdropFilter: 'blur(10px)', background: 'rgba(18, 18, 26, 0.92)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{char?.emoji}</span>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#8b7355' }}>{save?.name}</h3>
                <p className="text-sm" style={{ color: '#7a7a8a' }}>{char?.classAr} - {char?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 rounded-lg" style={{ background: '#12121a' }}>
                <div style={{ color: '#5a9a5a' }}>📍 المنطقة</div>
                <div className="font-bold" style={{ color: '#c8c8d0' }}>{getRegionName(save?.regionIndex || 0)}</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: '#12121a' }}>
                <div style={{ color: '#8b7355' }}>⭐ النقاط</div>
                <div className="font-bold" style={{ color: '#c8c8d0' }}>{save?.highestScore}</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: '#12121a' }}>
                <div style={{ color: '#4a3a6b' }}>🏅 الإنجازات</div>
                <div className="font-bold" style={{ color: '#c8c8d0' }}>{save?.achievements.length}/20</div>
              </div>
            </div>

            {/* Mini resource bars */}
            {save && (
              <div className="mt-3 space-y-1">
                <ResourceBar value={save.resources.health} max={save.resources.maxHealth} color="#b05050" label="الصحة" emoji="❤️" />
                <ResourceBar value={save.resources.mana} max={save.resources.maxMana} color="#3b82f6" label="المانا" emoji="💎" />
              </div>
            )}
          </div>
        </div>

        {/* Feed */}
        <div className="px-4 mb-4 relative z-10">
          <h3 className="text-lg font-bold mb-2" style={{ color: '#8b7355' }}>🔔 آخر الأحداث</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {feed.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#7a7a8a' }}>لا توجد أحداث بعد</p>
            ) : (
              feed.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg text-sm" style={{ background: '#1a1a28' }}>
                  <span>{item.emoji}</span>
                  <span className="flex-1" style={{ color: '#c8c8d0' }}>{item.text}</span>
                  <span className="text-xs whitespace-nowrap" style={{ color: '#7a7a8a' }}>
                    {Math.floor((Date.now() - item.time) / 60000)}د
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rankings */}
        <div className="px-4 mb-4 relative z-10">
          <h3 className="text-lg font-bold mb-2" style={{ color: '#8b7355' }}>📊 ترتيب المغامرين</h3>
          <div className="space-y-2">
            {[
              { name: save?.name || '', region: save?.regionIndex || 0, score: save?.highestScore || 0, emoji: char?.emoji || '👤' },
              { name: 'أسامة', region: 5, score: 1200, emoji: '👑' },
              { name: 'إبراهيم', region: 3, score: 850, emoji: '⚔️' },
              { name: 'نور', region: 2, score: 620, emoji: '✨' },
              { name: 'بوخلوة', region: 1, score: 380, emoji: '🔮' },
            ].sort((a, b) => b.region - a.region || b.score - a.score).map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#1a1a28' }}>
                <span className="text-xl font-bold" style={{ color: i === 0 ? '#8b7355' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#7a7a8a' }}>
                  {i + 1}
                </span>
                <span className="text-xl">{p.emoji}</span>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: '#c8c8d0' }}>{p.name}</div>
                  <div className="text-sm" style={{ color: '#7a7a8a' }}>{getRegionName(p.region)}</div>
                </div>
                <span className="font-bold" style={{ color: '#8b7355' }}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Online count */}
        <div className="px-4 mb-4 text-center relative z-10">
          <span className="text-sm px-4 py-2 rounded-full" style={{ background: '#1a1a28', color: '#5a9a5a' }}>
            👥 المتصلون الآن: {onlineCount}
          </span>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 p-3 flex justify-center gap-3 relative z-10" style={{ background: 'rgba(18, 18, 26, 0.95)', borderTop: '1px solid #2a2a3e', backdropFilter: 'blur(10px)' }}>
          <button className="fantasy-btn flex-1" onClick={() => setScreen('gameplay')}>
            العب
          </button>
          <button className="fantasy-btn-secondary flex-1" onClick={() => setScreen('profile')}>
            ملفي
          </button>
          <button className="fantasy-btn-secondary flex-1" onClick={() => setScreen('characterSelect')}>
            الشخصيات
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // SCREEN: Profile
  // ============================================
  const renderProfileScreen = () => {
    const char = getCharacter(save?.mainCharacterId || '');
    const sideChars = (save?.sideCharacterIds || []).map(id => getCharacter(id)).filter(Boolean) as Character[];

    return (
      <div className="min-h-screen pb-24 p-4" style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #070709 100%)' }}>
        <h2 className="text-2xl font-bold text-center mb-4 font-serif-heading" style={{ color: '#8b7355' }}>
          الملف الشخصي
        </h2>

        {/* Main Character */}
        <div className="game-card p-5 mb-4 text-center">
          <span className="text-5xl block mb-2">{char?.emoji}</span>
          <h3 className="text-xl font-bold" style={{ color: '#8b7355' }}>{save?.name}</h3>
          <p style={{ color: '#7a7a8a' }}>{char?.name} - {char?.classAr}</p>

          {/* Resource Bars */}
          {save && (
            <div className="mt-4 space-y-2">
              <ResourceBar value={save.resources.health} max={save.resources.maxHealth} color="#b05050" label="الصحة" emoji="❤️" />
              <ResourceBar value={save.resources.mana} max={save.resources.maxMana} color="#3b82f6" label="المانا" emoji="💎" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
            <div className="p-2 rounded-lg" style={{ background: '#12121a' }}>
              <span style={{ color: '#8b7355' }}>💰 ذهب</span>
              <div className="font-bold" style={{ color: '#c8c8d0' }}>{save?.resources.gold}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: '#12121a' }}>
              <span style={{ color: '#5a9a5a' }}>⭐ سمعة</span>
              <div className="font-bold" style={{ color: '#c8c8d0' }}>{save?.resources.reputation}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: '#12121a' }}>
              <span style={{ color: '#8b5cf6' }}>📚 معرفة</span>
              <div className="font-bold" style={{ color: '#c8c8d0' }}>{save?.resources.knowledge}</div>
            </div>
          </div>

          {/* Character Stats */}
          {char && (
            <div className="mt-4 space-y-1">
              {[
                { label: 'القوة', key: 'strength', value: getEffectiveStat(char, 'strength', save?.bonusStats || {}), color: '#b05050' },
                { label: 'الذكاء', key: 'intelligence', value: getEffectiveStat(char, 'intelligence', save?.bonusStats || {}), color: '#8b5cf6' },
                { label: 'الحظ', key: 'luck', value: getEffectiveStat(char, 'luck', save?.bonusStats || {}), color: '#5a9a5a' },
                { label: 'الكاريزما', key: 'charisma', value: getEffectiveStat(char, 'charisma', save?.bonusStats || {}), color: '#8b7355' },
                { label: 'المانا', key: 'mana', value: getEffectiveStat(char, 'mana', save?.bonusStats || {}), color: '#3b82f6' },
                { label: 'الدفاع', key: 'defense', value: getEffectiveStat(char, 'defense', save?.bonusStats || {}), color: '#f97316' },
              ].map((stat) => (
                <div key={stat.key} className="flex items-center gap-2 text-sm">
                  <span className="w-14 text-right" style={{ color: '#7a7a8a' }}>{stat.label}</span>
                  <div className="flex-1 stat-bar">
                    <div className="stat-bar-fill" style={{ width: `${(stat.value / 8) * 100}%`, background: stat.color }} />
                  </div>
                  <span className="w-5 text-center font-bold" style={{ color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allies */}
        <div className="game-card p-4 mb-4">
          <h3 className="font-bold mb-2" style={{ color: '#8b7355' }}>👥 الحلفاء ({save?.allies.length || 0}/3)</h3>
          {save?.allies.length === 0 ? (
            <p className="text-sm" style={{ color: '#7a7a8a' }}>لا يوجد حلفاء بعد - ستجدهم في رحلتك!</p>
          ) : (
            <div className="space-y-2">
              {save?.allies.map((ally) => {
                const allyChar = getCharacter(ally.characterId);
                return (
                  <div key={ally.characterId} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#12121a' }}>
                    <span className="text-2xl">{allyChar?.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: '#c8c8d0' }}>{ally.name}</div>
                      <div className="text-xs" style={{ color: '#5a9a5a' }}>{ally.passiveAbilityAr}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Characters */}
        {sideChars.length > 0 && (
          <div className="game-card p-4 mb-4">
            <h3 className="font-bold mb-2" style={{ color: '#8b7355' }}>📋 الشخصيات الجانبية</h3>
            <div className="flex gap-2 flex-wrap">
              {sideChars.map(c => (
                <div key={c.id} className="flex items-center gap-1 p-2 rounded-lg text-sm" style={{ background: '#12121a' }}>
                  <span>{c.emoji}</span>
                  <span style={{ color: '#c8c8d0' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="game-card p-4 mb-4">
          <h3 className="font-bold mb-3" style={{ color: '#8b7355' }}>🏅 الإنجازات ({save?.achievements.length || 0}/20)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = save?.achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-2 rounded-lg text-center text-xs transition-all ${unlocked ? '' : 'opacity-30 grayscale'}`}
                  style={{ background: '#12121a', border: unlocked ? '1px solid #8b7355' : '1px solid #333' }}
                >
                  <span className="text-xl block">{ach.emoji}</span>
                  <div className="font-bold mt-1" style={{ color: unlocked ? '#8b7355' : '#555' }}>{ach.name}</div>
                  <div style={{ color: unlocked ? '#7a7a8a' : '#333' }}>{ach.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Stats */}
        <div className="game-card p-4 mb-4 text-sm">
          <h3 className="font-bold mb-3" style={{ color: '#8b7355' }}>📊 إحصائيات اللعبة</h3>
          <div className="space-y-2" style={{ color: '#c8c8d0' }}>
            <div className="flex justify-between"><span>أعلى نقاط:</span><span style={{ color: '#8b7355' }}>{save?.highestScore}</span></div>
            <div className="flex justify-between"><span>مرات الإكمال:</span><span style={{ color: '#8b7355' }}>{save?.completions}</span></div>
            <div className="flex justify-between"><span>أحداث مكتملة:</span><span style={{ color: '#8b7355' }}>{save?.totalEventsCompleted}</span></div>
            <div className="flex justify-between"><span>معارك بالهروب:</span><span style={{ color: '#8b7355' }}>{save?.battlesFled}</span></div>
            <div className="flex justify-between"><span>معارك بالمفاوضة:</span><span style={{ color: '#8b7355' }}>{save?.battlesNegotiated}</span></div>
            <div className="flex justify-between"><span>ألغاز محلولة:</span><span style={{ color: '#8b7355' }}>{save?.puzzlesSolved}</span></div>
            <div className="flex justify-between"><span>مرات الموت:</span><span style={{ color: '#b05050' }}>{save?.deathCount}</span></div>
            <div className="flex justify-between">
              <span>وقت اللعب:</span>
              <span style={{ color: '#8b7355' }}>
                {save?.startTime ? formatTime(Date.now() - save.startTime) : '0د'}
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="fixed bottom-0 left-0 right-0 p-3" style={{ background: 'linear-gradient(180deg, transparent, #12121a 30%)', zIndex: 40 }}>
          <button className="fantasy-btn w-full" onClick={() => setScreen('kingdom')}>
            العودة للمملكة
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // SCREEN: Gameplay
  // ============================================
  const renderGameplayScreen = () => {
    if (!save) return null;
    const char = getCharacter(save.mainCharacterId || '');
    const region = REGIONS[save.regionIndex];
    const events = region ? (REGION_EVENTS[region.id] || []) : [];
    const currentEvent = events[save.eventIndex];
    const res = save.resources;

    // Stat Point Mode
    if (statPointMode) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
          {region?.backgroundImage && (
            <div className="region-bg" style={{ backgroundImage: `url(${region.backgroundImage})` }} />
          )}
          <div className="event-card-visual p-6 max-w-md w-full text-center fade-in relative z-10">
            <span className="text-4xl block mb-4 fade-in">■</span>
            <h2 className="text-2xl font-bold mb-2 font-serif-heading" style={{ color: '#8b7355' }}>منطقة مكتملة</h2>
            <p className="mb-2" style={{ color: '#5a9a5a' }}>لقد أكملت {region?.name} {region?.emoji}</p>
            <p className="mb-4" style={{ color: '#c8c8d0' }}>لديك {statPoints} نقطة إحصائية. اختر أين تضعها:</p>

            {char && [
              { key: 'strength', label: 'القوة', value: getEffectiveStat(char, 'strength', save.bonusStats), color: '#b05050' },
              { key: 'intelligence', label: 'الذكاء', value: getEffectiveStat(char, 'intelligence', save.bonusStats), color: '#8b5cf6' },
              { key: 'luck', label: 'الحظ', value: getEffectiveStat(char, 'luck', save.bonusStats), color: '#5a9a5a' },
              { key: 'charisma', label: 'الكاريزما', value: getEffectiveStat(char, 'charisma', save.bonusStats), color: '#8b7355' },
              { key: 'mana', label: 'المانا', value: getEffectiveStat(char, 'mana', save.bonusStats), color: '#3b82f6' },
              { key: 'defense', label: 'الدفاع', value: getEffectiveStat(char, 'defense', save.bonusStats), color: '#f97316' },
            ].map(stat => (
              <button
                key={stat.key}
                className="w-full text-right p-3 rounded-lg mb-2 flex justify-between items-center transition-all hover:scale-[1.02]"
                style={{ background: '#12121a', border: `2px solid ${stat.color}`, color: '#c8c8d0' }}
                onClick={() => applyStatPoint(stat.key)}
              >
                <span>{stat.label} ({stat.value})</span>
                <span style={{ color: stat.color }}>+1 ➕</span>
              </button>
            ))}

            {statPoints <= 0 && (
              <button className="fantasy-btn w-full mt-4" onClick={() => setStatPointMode(false)}>
                المتابعة
              </button>
            )}
          </div>
        </div>
      );
    }

    // Game Complete / No more events
    if (!currentEvent) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
          {region?.backgroundImage && (
            <div className="region-bg" style={{ backgroundImage: `url(${region.backgroundImage})` }} />
          )}
          <div className="event-card-visual p-6 max-w-md w-full text-center fade-in relative z-10">
            <span className="text-5xl block mb-4">🏆</span>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#8b7355' }}>اكتملت المغامرة!</h2>
            <p className="mb-4" style={{ color: '#7a7a8a' }}>استكشفت كل المناطق المتاحة</p>
            <button className="fantasy-btn w-full" onClick={() => setScreen('kingdom')}>العودة للمملكة</button>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen flex flex-col relative ${battleEffect === 'shake' ? 'screen-shake' : ''} ${battleEffect === 'damage' ? 'damage-flash' : ''} ${battleEffect === 'heal' ? 'heal-flash' : ''}`}>
        {/* Region Background Image */}
        {region?.backgroundImage && (
          <div className="region-bg" style={{ backgroundImage: `url(${region.backgroundImage})` }} />
        )}

        {/* Damage Numbers */}
        {damageNumbers.map(d => (
          <div key={d.id} className="damage-number" style={{ left: `${d.x}%`, top: `${d.y}%`, color: d.color }}>
            {d.color === '#5a9a5a' ? '+' : '-'}{d.value}
          </div>
        ))}

        {/* Top Resource Bar */}
        <div className="p-3 relative z-10" style={{ background: 'rgba(18, 18, 26, 0.95)', borderBottom: '1px solid #2a2a3e', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{char?.emoji}</span>
            <span className="font-bold" style={{ color: '#8b7355' }}>{char?.name}</span>
            <span className="text-xs px-2 rounded-full" style={{ background: '#2a2a3e', color: '#7a7a8a' }}>{char?.classAr}</span>
            <span className="mr-auto text-xs" style={{ color: '#7a7a8a' }}>{region?.emoji} {region?.name}</span>
          </div>

          <ResourceBar value={res.health} max={res.maxHealth} color="#b05050" label="الصحة" emoji="❤️" />
          <ResourceBar value={res.mana} max={res.maxMana} color="#3b82f6" label="المانا" emoji="💎" />

          <div className="flex gap-3 text-xs mt-2">
            <span style={{ color: '#8b7355' }}>💰 {res.gold}</span>
            <span style={{ color: '#5a9a5a' }}>⭐ {res.reputation}</span>
            <span style={{ color: '#8b5cf6' }}>📚 {res.knowledge}</span>
            <span style={{ color: '#f97316' }}>👥 {save.allies.length}/3</span>
          </div>
        </div>

        {/* Event Progress */}
        <div className="px-3 py-1 text-center text-xs relative z-10" style={{ background: 'rgba(26, 10, 46, 0.9)', color: '#7a7a8a' }}>
          الحدث {save.eventIndex + 1} من {events.length} — {region?.name} {region?.emoji}
        </div>

        {/* Ally Indicators */}
        {save.allies.length > 0 && (
          <div className="flex gap-1 px-3 py-1 relative z-10" style={{ background: 'rgba(18, 18, 26, 0.7)' }}>
            {save.allies.map(ally => {
              const allyChar = getCharacter(ally.characterId);
              return (
                <span key={ally.characterId} className="text-lg" title={ally.name}>
                  {allyChar?.emoji || '👤'}
                </span>
              );
            })}
          </div>
        )}

        {/* Main Event Area */}
        <div className="flex-1 p-4 overflow-y-auto relative z-10">
          {!eventOutcome ? (
            <div className="fade-in">
              {/* Event Card with Visual */}
              <div className="event-card-visual p-5 mb-4">
                {/* Monster Image for Battle Events */}
                {currentEvent.type === 'battle' && (() => {
                  const enemies = REGION_ENEMIES[region?.id] || [];
                  const enemy = enemies[save.eventIndex % enemies.length];
                  return enemy ? (
                    <div className="monster-appear mb-4">
                      <div className="monster-image-container battle-overlay rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)', minHeight: '180px' }}>
                        {enemy.image ? (
                          <img src={enemy.image} alt={enemy.name} className="monster-appear" style={{ maxHeight: '200px' }} />
                        ) : (
                          <span className="text-7xl block py-8">{enemy.emoji}</span>
                        )}
                      </div>
                      {/* Enemy Info Bar */}
                      <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.4)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg" style={{ color: '#b05050' }}>{enemy.emoji} {enemy.name}</span>
                          <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(220, 38, 38, 0.3)', color: '#b05050' }}>⚔️ معركة</span>
                        </div>
                        <div className="monster-hp-bar mb-2">
                          <div className="monster-hp-fill" style={{ width: '100%' }} />
                        </div>
                        <div className="flex gap-4 text-sm justify-center">
                          <span style={{ color: '#b05050' }}>❤️ {enemy.health}</span>
                          <span style={{ color: '#f97316' }}>⚔️ ضرر: {enemy.damage}</span>
                          <span style={{ color: '#8b7355' }}>💰 جائزة: {enemy.goldReward}</span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Non-battle event header */}
                {currentEvent.type !== 'battle' && (
                  <div className="text-center mb-3">
                    <span className="text-4xl block mb-2">{currentEvent.emoji}</span>
                    <h3 className="text-xl font-bold" style={{ color: '#8b7355' }}>{currentEvent.title}</h3>
                    <span className="text-xs px-3 py-1 rounded-full inline-block mt-1" style={{ background: '#2a2a3e', color: '#7a7a8a' }}>
                      {currentEvent.type === 'puzzle' ? '🧩 لغز' :
                       currentEvent.type === 'merchant' ? '🏪 تاجر' :
                       currentEvent.type === 'encounter' ? '🤝 لقاء' :
                       currentEvent.type === 'comedy' ? '😂 حدث مضحك' :
                       currentEvent.type === 'crossroads' ? '🗺️ مفترق طرق' :
                       '🔮 حدث سري'}
                    </span>
                  </div>
                )}

                {/* Battle event title (shown below image) */}
                {currentEvent.type === 'battle' && (
                  <div className="text-center mb-3">
                    <h3 className="text-xl font-bold" style={{ color: '#8b7355' }}>{currentEvent.title}</h3>
                  </div>
                )}

                <p className="text-base leading-relaxed mb-4" style={{ color: '#c8c8d0' }}>
                  {currentEvent.description}
                </p>

                {/* Lina Foresight */}
                {linaForesight && (
                  <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(212, 160, 23, 0.15)', border: '1px solid #8b7355' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#8b7355' }}>👁️ بصيرة لينا - نتيجة الخيارات:</p>
                    {currentEvent.options.map((opt, i) => (
                      <div key={i} className="text-xs p-1.5 rounded mb-1" style={{ background: 'rgba(107, 63, 160, 0.3)', color: '#8b7355' }}>
                        خيار {i + 1}: {opt.outcome.success.text.substring(0, 50)}...
                      </div>
                    ))}
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {currentEvent.options.map((option, i) => (
                    <button
                      key={i}
                      className="battle-option"
                      onClick={() => processOutcome(option, save)}
                    >
                      <span className="text-base">{option.text}</span>
                      {option.statCheck && (
                        <div className="text-xs mt-1" style={{ color: '#7a7a8a' }}>
                          يتطلب: {STAT_NAMES[option.statCheck] || option.statCheck} {option.statThreshold}+
                          {char && (
                            <span style={{ color: '#5a9a5a' }}>
                              {' '}(لديك: {getEffectiveStat(char, option.statCheck, save.bonusStats)})
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Ability Button */}
              {!save.abilityUsedThisRegion && (
                <button
                  className="w-full p-3 rounded-lg text-center font-bold mb-3 transition-all hover:bg-[#3a3a4e]"
                  style={{ background: '#2a2a3e', border: '1px solid #8b7355', color: '#8b7355' }}
                  onClick={useAbility}
                >
                  ✨ القدرة الخاصة: {char?.uniqueAbilityAr?.split(' - ')[0] || 'قدرة'}
                </button>
              )}
            </div>
          ) : (
            /* Outcome Display */
            <div className="fade-in">
              <div className="event-card-visual p-6 text-center">
                <span className="text-4xl block mb-4 fade-in">
                  {eventOutcome.includes('💀') ? '💀' :
                   eventOutcome.includes('🏆') ? '🏆' :
                   eventOutcome.includes('🔥') ? '🔥' :
                   eventOutcome.includes('🐉') ? '🐉' :
                   eventOutcome.includes('🐸') ? '🐸' :
                   eventOutcome.includes('👼') ? '👼' : '✨'}
                </span>
                <p className="text-lg leading-relaxed mb-6" style={{ color: '#c8c8d0' }}>
                  {eventOutcome}
                </p>
                <button className="fantasy-btn w-full text-lg" onClick={nextEvent}>
                  {save.eventIndex >= (events.length - 1) ? 'المنطقة التالية' : 'المتابعة'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-3 flex gap-2 relative z-10" style={{ background: 'rgba(18, 18, 26, 0.95)', borderTop: '1px solid #2a2a3e', backdropFilter: 'blur(10px)' }}>
          <button className="fantasy-btn-secondary flex-1 text-sm py-2" onClick={() => setScreen('kingdom')}>
            المملكة
          </button>
          <button className="fantasy-btn-secondary flex-1 text-sm py-2" onClick={() => setScreen('profile')}>
            ملفي
          </button>
          <button
            className="fantasy-btn-secondary flex-1 text-sm py-2"
            onClick={() => {
              if (confirm('هل تريد إعادة اللعبة من البداية؟')) {
                const newSave = createDefaultSave(save.name);
                newSave.mainCharacterId = save.mainCharacterId;
                newSave.sideCharacterIds = [...save.sideCharacterIds];
                newSave.achievements = [...save.achievements];
                newSave.highestScore = save.highestScore;
                newSave.completions = save.completions;
                newSave.firstLogin = save.firstLogin;
                newSave.playedCharacterIds = [...save.playedCharacterIds];
                setSave(newSave);
                setEventOutcome(null);
                setStatPointMode(false);
                addFeed(`${save.name} بدأ مغامرة جديدة!`, '🔄');
              }
            }}
          >
            جديد
          </button>
        </div>
      </div>
    );
  };

  // ============================================
  // SCREEN: Ending
  // ============================================
  const renderEndingScreen = () => {
    const ending = ENDINGS.find(e => e.id === endingId);
    const castleBg = REGIONS[5]?.backgroundImage;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        {castleBg && (
          <div className="region-bg" style={{ backgroundImage: `url(${castleBg})` }} />
        )}
        <div className="event-card-visual p-8 max-w-md w-full text-center fade-in relative z-10">
          <span className="text-5xl block mb-6">{ending?.emoji || '◆'}</span>
          <h2 className="text-3xl font-bold mb-4 font-serif-heading" style={{ color: '#8b7355' }}>
            {ending?.name || 'النهاية'}
          </h2>
          <p className="text-lg mb-2" style={{ color: '#c8c8d0' }}>{ending?.description}</p>

          {save && (
            <div className="mt-6 p-4 rounded-lg text-sm" style={{ background: '#12121a' }}>
              <h4 className="font-bold mb-2" style={{ color: '#8b7355' }}>📊 ملخص المغامرة</h4>
              <div className="space-y-1" style={{ color: '#c8c8d0' }}>
                <div className="flex justify-between"><span>❤️ الصحة النهائية:</span><span style={{ color: '#b05050' }}>{save.resources.health}</span></div>
                <div className="flex justify-between"><span>📚 المعرفة:</span><span style={{ color: '#8b5cf6' }}>{save.resources.knowledge}</span></div>
                <div className="flex justify-between"><span>⭐ السمعة:</span><span style={{ color: '#5a9a5a' }}>{save.resources.reputation}</span></div>
                <div className="flex justify-between"><span>💰 الذهب:</span><span style={{ color: '#8b7355' }}>{save.resources.gold}</span></div>
                <div className="flex justify-between"><span>👥 الحلفاء:</span><span style={{ color: '#8b7355' }}>{save.allies.length}</span></div>
                <div className="flex justify-between"><span>🏅 الإنجازات:</span><span style={{ color: '#8b7355' }}>{save.achievements.length}/20</span></div>
                <div className="flex justify-between"><span>⭐ النتيجة:</span><span style={{ color: '#8b7355', fontWeight: 'bold', fontSize: '1.1rem' }}>{save.highestScore}</span></div>
                {save.startTime && (
                  <div className="flex justify-between"><span>⏱️ وقت اللعب:</span><span style={{ color: '#8b7355' }}>{formatTime(Date.now() - save.startTime)}</span></div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button className="fantasy-btn w-full text-lg" onClick={() => {
              if (save) {
                const newSave = createDefaultSave(save.name);
                newSave.mainCharacterId = save.mainCharacterId;
                newSave.sideCharacterIds = [...save.sideCharacterIds];
                newSave.achievements = [...save.achievements];
                newSave.highestScore = save.highestScore;
                newSave.completions = save.completions;
                newSave.firstLogin = save.firstLogin;
                newSave.playedCharacterIds = [...save.playedCharacterIds];
                setSave(newSave);
                setEventOutcome(null);
                setEndingId(null);
                setStatPointMode(false);
                setScreen('gameplay');
                addFeed(`${save.name} بدأ مغامرة جديدة!`, '🔄');
              }
            }}>
              ابدأ من جديد
            </button>
            <button className="fantasy-btn-secondary w-full" onClick={() => {
              setEndingId(null);
              setScreen('kingdom');
            }}>
              العودة للمملكة
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // Achievement Popup
  // ============================================
  const renderAchievementPopup = () => {
    if (!showAchievement) return null;
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 slide-in" style={{
        background: 'linear-gradient(135deg, #8b7355, #b8860b)',
        color: '#12121a',
        padding: '12px 24px',
        borderRadius: '12px',
        fontWeight: 'bold',
        boxShadow: '0 0 30px rgba(212, 160, 23, 0.5)',
      }}>
        🏅 إنجاز جديد: {showAchievement}
      </div>
    );
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif" }}>
      {renderAchievementPopup()}
      {screen === 'login' && renderLoginScreen()}
      {screen === 'characterSelect' && renderCharacterSelectScreen()}
      {screen === 'kingdom' && renderKingdomScreen()}
      {screen === 'profile' && renderProfileScreen()}
      {screen === 'gameplay' && renderGameplayScreen()}
      {screen === 'ending' && renderEndingScreen()}
    </div>
  );
}
