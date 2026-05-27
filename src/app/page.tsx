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

const STAT_NAMES: Record<string, string> = {
  strength: 'القوة',
  intelligence: 'الذكاء',
  luck: 'الحظ',
  charisma: 'الكاريزما',
  mana: 'المانا',
  defense: 'الدفاع',
};

const STAT_COLORS: Record<string, string> = {
  strength: '#ff4444',
  intelligence: '#a78bfa',
  luck: '#44ff88',
  charisma: '#d4a017',
  mana: '#4488ff',
  defense: '#ff8844',
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

  // Dice roll state (pentagonal D20 before battles)
  const [dicePhase, setDicePhase] = useState<'idle' | 'ready' | 'rolling' | 'result' | 'confirmed'>('idle');
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [diceModifier, setDiceModifier] = useState(0);
  const [diceRollingNumber, setDiceRollingNumber] = useState(0);

  // Roll dice for battle enhancement/weakening (0-20)
  const rollBattleDice = useCallback(() => {
    setDicePhase('rolling');
    let cycleCount = 0;
    const cycleInterval = setInterval(() => {
      setDiceRollingNumber(rand(0, 20));
      cycleCount++;
      if (cycleCount > 25) clearInterval(cycleInterval);
    }, 70);

    const value = rand(0, 20);
    setTimeout(() => {
      clearInterval(cycleInterval);
      setDiceValue(value);
      setDicePhase('result');
      if (value === 20) setDiceModifier(10);
      else if (value === 0) setDiceModifier(-10);
      else if (value > 10) setDiceModifier(value - 10);
      else if (value < 10) setDiceModifier(value - 10);
      else setDiceModifier(0);
    }, 2000);
  }, []);

  const chooseNeutralDice = useCallback(() => {
    setDiceValue(10);
    setDiceModifier(0);
    setDicePhase('result');
  }, []);

  const confirmDice = useCallback(() => {
    setDicePhase('confirmed');
  }, []);

  // Battle effects
  const triggerBattleEffect = useCallback((type: 'shake' | 'damage' | 'heal', dmgValue?: number) => {
    setBattleEffect(type);
    if (dmgValue !== undefined) {
      const id = Date.now();
      setDamageNumbers(prev => [...prev, { id, value: dmgValue, x: 30 + Math.random() * 40, y: 30 + Math.random() * 20, color: type === 'heal' ? '#44ff88' : '#ff4444' }]);
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

    // Apply dice modifier for battle events
    const currentEvents = REGION_EVENTS[REGIONS[s.regionIndex]?.id] || [];
    const currentEvent = currentEvents[s.eventIndex];
    if (currentEvent?.type === 'battle' && diceModifier !== 0) {
      if (diceModifier > 0) {
        const healBonus = Math.min(diceModifier * 2, 20);
        const goldBonus = diceModifier * 2;
        res.health = clamp(res.health + healBonus, 0, res.maxHealth);
        res.gold += goldBonus;
        outcome.text += ` 🎲 تعزيز النرد (+${healBonus} صحة، +${goldBonus} ذهب)`;
      } else {
        const extraDmg = Math.min(Math.abs(diceModifier) * 2, 25);
        const goldLoss = Math.abs(diceModifier);
        res.health = clamp(res.health - extraDmg, 0, res.maxHealth);
        res.gold = Math.max(0, res.gold - goldLoss);
        outcome.text += ` 🎲 تضعيف النرد (-${extraDmg} صحة، -${goldLoss} ذهب)`;
      }
    }

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

    // Use already-defined currentEvent from above
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
      const points = s.resources.health > 70 ? 2 : 1;
      setStatPoints(points);
      setStatPointMode(true);

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
    setDicePhase('idle');
    setDiceValue(null);
    setDiceModifier(0);
    setDiceRollingNumber(0);
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

  // Compact resource icon component
  const ResourceIcon = ({ emoji, value, color }: { emoji: string; value: number; color: string }) => (
    <span className="resource-icon" style={{ color }}>
      {emoji} {value}
    </span>
  );

  // Bottom Navigation Bar
  const BottomNav = ({ activeTab }: { activeTab: string }) => (
    <div className="bottom-nav">
      <div className="flex justify-around items-center py-1.5 px-1">
        <button className={`nav-btn ${activeTab === 'story' ? 'nav-btn-active' : ''}`} onClick={() => setScreen('gameplay')}>
          <span className="nav-btn-icon">📖</span>
          <span>القصة</span>
        </button>
        <button className={`nav-btn ${activeTab === 'shop' ? 'nav-btn-active' : ''}`} onClick={() => setScreen('gameplay')}>
          <span className="nav-btn-icon">💰</span>
          <span>التاجر</span>
        </button>
        <button className={`nav-btn ${activeTab === 'achievements' ? 'nav-btn-active' : ''}`} onClick={() => setScreen('profile')}>
          <span className="nav-btn-icon">🏆</span>
          <span>الإنجازات</span>
        </button>
        <button className={`nav-btn ${activeTab === 'profile' ? 'nav-btn-active' : ''}`} onClick={() => setScreen('profile')}>
          <span className="nav-btn-icon">👤</span>
          <span>ملفي</span>
        </button>
        <button className={`nav-btn ${activeTab === 'settings' ? 'nav-btn-active' : ''}`} onClick={() => setScreen('kingdom')}>
          <span className="nav-btn-icon">⚙️</span>
          <span>المملكة</span>
        </button>
      </div>
    </div>
  );

  // ============================================
  // SCREEN: Login
  // ============================================
  const renderLoginScreen = () => (
    <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 50%, #0d0d15 100%)' }}>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center fade-in max-w-md w-full">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-serif-heading golden-text" style={{ letterSpacing: '0.05em' }}>
            مغامرة الأساتذة
          </h1>
          <p className="text-base mb-6" style={{ color: '#7a7a8a' }}>مملكة نور الحكمة</p>

          <div className="scroll-container p-5 mx-auto">
            <label className="block text-base mb-2 font-bold golden-text">
              أدخل اسمك الحقيقي
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 rounded-lg text-right text-lg outline-none focus:ring-2 focus:ring-[#d4a017]"
              style={{ background: '#0d0d15', border: '1px solid rgba(212, 160, 23, 0.3)', color: '#c8c8d0' }}
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
              className="glow-btn w-full mt-4 text-lg"
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
              ابدأ المغامرة
            </button>
          </div>

          <div className="mt-6 p-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(212, 160, 23, 0.15)' }}>
            <p style={{ color: '#7a7a8a' }}>
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
  const renderCharacterSelectScreen = () => (
    <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 100%)' }}>
      {/* Header */}
      <div className="top-bar py-3 px-4 text-center">
        <h2 className="text-xl font-bold font-serif-heading golden-text">
          اختر شخصيتك
        </h2>
        <p className="text-xs" style={{ color: '#7a7a8a' }}>اختر شخصية رئيسية تمثلك وشخصيات جانبية أيضاً</p>
      </div>

      {/* Content - scrollable */}
      <div className="content-area p-3 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-6xl mx-auto">
          {CHARACTERS.map((char, idx) => {
            const isMain = save?.mainCharacterId === char.id;
            const isSide = save?.sideCharacterIds.includes(char.id) || false;

            return (
              <div
                key={char.id}
                className={`game-card slide-in ${isMain ? 'game-card-selected' : ''} ${isSide ? 'game-card-selected' : ''}`}
                style={{ animationDelay: `${idx * 0.02}s` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{char.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm golden-text truncate">{char.name}</h3>
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(212, 160, 23, 0.1)', color: '#7a7a8a', fontSize: '0.65rem' }}>
                        {char.classAr}
                      </span>
                      {isMain && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(212, 160, 23, 0.2)', color: '#d4a017', fontSize: '0.65rem' }}>⭐ رئيسية</span>}
                      {isSide && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(74, 58, 107, 0.3)', color: '#a78bfa', fontSize: '0.65rem' }}>جانبية</span>}
                    </div>
                  </div>
                </div>

                {/* Stats - compact */}
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {[
                    { label: 'قوة', value: char.stats.strength, color: '#ff4444' },
                    { label: 'ذكاء', value: char.stats.intelligence, color: '#a78bfa' },
                    { label: 'حظ', value: char.stats.luck, color: '#44ff88' },
                    { label: 'كاريزما', value: char.stats.charisma, color: '#d4a017' },
                    { label: 'مانا', value: char.stats.mana, color: '#4488ff' },
                    { label: 'دفاع', value: char.stats.defense, color: '#ff8844' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-1 text-xs p-1 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span style={{ color: '#7a7a8a', fontSize: '0.6rem' }}>{stat.label}</span>
                      <div className="flex-1 stat-bar">
                        <div className="stat-bar-fill" style={{ width: `${(stat.value / 6) * 100}%`, background: stat.color }} />
                      </div>
                      <span className="font-bold" style={{ color: stat.color, fontSize: '0.6rem' }}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Unique Ability */}
                <div className="mb-2 p-1.5 rounded-lg text-xs" style={{ background: 'rgba(212, 160, 23, 0.08)', borderRight: '2px solid rgba(212, 160, 23, 0.4)' }}>
                  <span style={{ color: '#d4a017' }}>✨ {char.uniqueAbilityAr}</span>
                </div>

                {/* Signature */}
                <p className="text-xs italic mb-2" style={{ color: '#7a7a8a' }}>
                  &ldquo;{char.signature}&rdquo;
                </p>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    className="glow-btn flex-1 text-xs py-1.5 px-2"
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
                    className="fantasy-btn-secondary flex-1 text-xs py-1.5 px-2"
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
      </div>

      {/* Confirm Main Dialog */}
      {confirmMain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="scroll-container p-6 max-w-sm w-full text-center fade-in">
            <h3 className="text-xl font-bold mb-4 golden-text">⚠️ تأكيد تغيير الشخصية الرئيسية</h3>
            <p className="mb-4" style={{ color: '#c8c8d0' }}>
              هل تريد تغيير شخصيتك الرئيسية إلى <strong className="golden-text">{getCharacter(confirmMain)?.name}</strong>؟ هذا القرار نادر التغيير.
            </p>
            <div className="flex gap-3">
              <button className="glow-btn flex-1" onClick={() => {
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

      {/* Fixed Bottom Continue Button */}
      <div className="bottom-nav">
        <div className="p-3 text-center">
          <button
            className="glow-btn text-base px-6 py-2.5 w-full max-w-xs"
            onClick={() => {
              if (save?.mainCharacterId) {
                setScreen('kingdom');
                addFeed(`${save.name} دخل مملكة نور الحكمة`, '🏰');
              }
            }}
            disabled={!save?.mainCharacterId}
          >
            دخول المملكة
          </button>
          {!save?.mainCharacterId && (
            <p className="mt-1 text-xs" style={{ color: '#ff4444' }}>يجب اختيار شخصية رئيسية أولاً</p>
          )}
        </div>
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
      <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 100%)' }}>
        {/* Region Background */}
        {currentRegion?.backgroundImage && (
          <div className="region-bg" style={{ backgroundImage: `url(${currentRegion.backgroundImage})` }} />
        )}

        {/* Top Bar */}
        <div className="top-bar py-2.5 px-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{char?.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm golden-text">{save?.name}</span>
              <span className="text-xs" style={{ color: '#7a7a8a' }}> {char?.classAr}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              <ResourceIcon emoji="❤️" value={save?.resources.health || 0} color="#ff4444" />
              <ResourceIcon emoji="💎" value={save?.resources.mana || 0} color="#4488ff" />
              <ResourceIcon emoji="💰" value={save?.resources.gold || 0} color="#ffcc00" />
            </div>
          </div>
        </div>

        {/* Content - scrollable */}
        <div className="content-area p-3 relative z-10">
          {/* Player Status Card */}
          <div className="event-card p-3 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{char?.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold golden-text">{save?.name}</h3>
                <p className="text-xs" style={{ color: '#7a7a8a' }}>{char?.classAr} - {char?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ color: '#44ff88' }}>📍 المنطقة</div>
                <div className="font-bold" style={{ color: '#c8c8d0' }}>{getRegionName(save?.regionIndex || 0)}</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ color: '#d4a017' }}>⭐ النقاط</div>
                <div className="font-bold" style={{ color: '#c8c8d0' }}>{save?.highestScore}</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ color: '#a78bfa' }}>🏅 الإنجازات</div>
                <div className="font-bold" style={{ color: '#c8c8d0' }}>{save?.achievements.length}/20</div>
              </div>
            </div>

            {/* Compact resource icons row */}
            {save && (
              <div className="flex gap-2 mt-2 justify-center flex-wrap">
                <ResourceIcon emoji="❤️" value={save.resources.health} color="#ff4444" />
                <ResourceIcon emoji="💎" value={save.resources.mana} color="#4488ff" />
                <ResourceIcon emoji="💰" value={save.resources.gold} color="#ffcc00" />
                <ResourceIcon emoji="⭐" value={save.resources.reputation} color="#44ff88" />
                <ResourceIcon emoji="📚" value={save.resources.knowledge} color="#a78bfa" />
              </div>
            )}
          </div>

          {/* Feed */}
          <div className="mb-3">
            <h3 className="text-sm font-bold mb-1.5 golden-text">🔔 آخر الأحداث</h3>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {feed.length === 0 ? (
                <p className="text-xs text-center py-3" style={{ color: '#7a7a8a' }}>لا توجد أحداث بعد</p>
              ) : (
                feed.slice(0, 8).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,0.3)' }}>
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
          <div className="mb-3">
            <h3 className="text-sm font-bold mb-1.5 golden-text">📊 ترتيب المغامرين</h3>
            <div className="space-y-1.5">
              {[
                { name: save?.name || '', region: save?.regionIndex || 0, score: save?.highestScore || 0, emoji: char?.emoji || '👤' },
                { name: 'أسامة', region: 5, score: 1200, emoji: '👑' },
                { name: 'إبراهيم', region: 3, score: 850, emoji: '⚔️' },
                { name: 'نور', region: 2, score: 620, emoji: '✨' },
                { name: 'بوخلوة', region: 1, score: 380, emoji: '🔮' },
              ].sort((a, b) => b.region - a.region || b.score - a.score).map((p, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg text-sm" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <span className="text-base font-bold" style={{ color: i === 0 ? '#d4a017' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#7a7a8a' }}>
                    {i + 1}
                  </span>
                  <span className="text-base">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs truncate" style={{ color: '#c8c8d0' }}>{p.name}</div>
                    <div className="text-xs" style={{ color: '#7a7a8a' }}>{getRegionName(p.region)}</div>
                  </div>
                  <span className="font-bold text-xs" style={{ color: '#d4a017' }}>{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Online count */}
          <div className="text-center mb-3">
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.3)', color: '#44ff88' }}>
              👥 المتصلون الآن: {onlineCount}
            </span>
          </div>
        </div>

        {/* Bottom Nav */}
        <BottomNav activeTab="settings" />
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
      <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 100%)' }}>
        {/* Top Bar */}
        <div className="top-bar py-2.5 px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{char?.emoji}</span>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm golden-text">{save?.name}</span>
              <span className="text-xs" style={{ color: '#7a7a8a' }}> {char?.classAr}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              <ResourceIcon emoji="❤️" value={save?.resources.health || 0} color="#ff4444" />
              <ResourceIcon emoji="💎" value={save?.resources.mana || 0} color="#4488ff" />
              <ResourceIcon emoji="💰" value={save?.resources.gold || 0} color="#ffcc00" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-area p-3">
          {/* Main Character Card */}
          <div className="event-card p-4 mb-3 text-center">
            <span className="text-4xl block mb-2">{char?.emoji}</span>
            <h3 className="text-lg font-bold golden-text">{save?.name}</h3>
            <p className="text-xs mb-2" style={{ color: '#7a7a8a' }}>{char?.name} - {char?.classAr}</p>

            {/* Resource Icons Row */}
            {save && (
              <div className="flex gap-2 justify-center flex-wrap mb-3">
                <ResourceIcon emoji="❤️" value={save.resources.health} color="#ff4444" />
                <ResourceIcon emoji="💎" value={save.resources.mana} color="#4488ff" />
                <ResourceIcon emoji="💰" value={save.resources.gold} color="#ffcc00" />
                <ResourceIcon emoji="⭐" value={save.resources.reputation} color="#44ff88" />
                <ResourceIcon emoji="📚" value={save.resources.knowledge} color="#a78bfa" />
              </div>
            )}

            {/* Health/Mana mini bars */}
            {save && (
              <div className="space-y-1.5 mb-3">
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{ color: '#ff4444' }}>❤️ صحة</span>
                    <span style={{ color: '#c8c8d0' }}>{save.resources.health}/{save.resources.maxHealth}</span>
                  </div>
                  <div className="health-mini-bar">
                    <div className="health-mini-fill" style={{ width: `${(save.resources.health / save.resources.maxHealth) * 100}%`, background: 'linear-gradient(90deg, #ff4444, #ff6666)' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{ color: '#4488ff' }}>💎 مانا</span>
                    <span style={{ color: '#c8c8d0' }}>{save.resources.mana}/{save.resources.maxMana}</span>
                  </div>
                  <div className="health-mini-bar">
                    <div className="health-mini-fill" style={{ width: `${(save.resources.mana / save.resources.maxMana) * 100}%`, background: 'linear-gradient(90deg, #4488ff, #66aaff)' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Character Stats */}
            {char && (
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'القوة', key: 'strength', value: getEffectiveStat(char, 'strength', save?.bonusStats || {}), color: '#ff4444' },
                  { label: 'الذكاء', key: 'intelligence', value: getEffectiveStat(char, 'intelligence', save?.bonusStats || {}), color: '#a78bfa' },
                  { label: 'الحظ', key: 'luck', value: getEffectiveStat(char, 'luck', save?.bonusStats || {}), color: '#44ff88' },
                  { label: 'الكاريزما', key: 'charisma', value: getEffectiveStat(char, 'charisma', save?.bonusStats || {}), color: '#d4a017' },
                  { label: 'المانا', key: 'mana', value: getEffectiveStat(char, 'mana', save?.bonusStats || {}), color: '#4488ff' },
                  { label: 'الدفاع', key: 'defense', value: getEffectiveStat(char, 'defense', save?.bonusStats || {}), color: '#ff8844' },
                ].map((stat) => (
                  <div key={stat.key} className="p-1.5 rounded text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="text-xs" style={{ color: '#7a7a8a' }}>{stat.label}</div>
                    <div className="font-bold text-sm" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allies */}
          <div className="event-card p-3 mb-3">
            <h3 className="font-bold mb-2 text-sm golden-text">👥 الحلفاء ({save?.allies.length || 0}/3)</h3>
            {save?.allies.length === 0 ? (
              <p className="text-xs" style={{ color: '#7a7a8a' }}>لا يوجد حلفاء بعد - ستجدهم في رحلتك!</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {save?.allies.map((ally) => {
                  const allyChar = getCharacter(ally.characterId);
                  return (
                    <div key={ally.characterId} className="flex items-center gap-1 p-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <span className="text-lg">{allyChar?.emoji}</span>
                      <div>
                        <div className="font-bold text-xs" style={{ color: '#c8c8d0' }}>{ally.name}</div>
                        <div className="text-xs" style={{ color: '#44ff88', fontSize: '0.6rem' }}>{ally.passiveAbilityAr}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Side Characters */}
          {sideChars.length > 0 && (
            <div className="event-card p-3 mb-3">
              <h3 className="font-bold mb-2 text-sm golden-text">📋 الشخصيات الجانبية</h3>
              <div className="flex gap-1.5 flex-wrap">
                {sideChars.map(c => (
                  <div key={c.id} className="flex items-center gap-1 p-1.5 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <span>{c.emoji}</span>
                    <span style={{ color: '#c8c8d0' }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          <div className="event-card p-3 mb-3">
            <h3 className="font-bold mb-2 text-sm golden-text">🏅 الإنجازات ({save?.achievements.length || 0}/20)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {ACHIEVEMENTS.map(ach => {
                const unlocked = save?.achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`p-1.5 rounded-lg text-center text-xs transition-all ${unlocked ? '' : 'opacity-25 grayscale'}`}
                    style={{ background: 'rgba(0,0,0,0.3)', border: unlocked ? '1px solid rgba(212, 160, 23, 0.4)' : '1px solid transparent' }}
                  >
                    <span className="text-lg block">{ach.emoji}</span>
                    <div className="font-bold mt-0.5" style={{ color: unlocked ? '#d4a017' : '#555', fontSize: '0.6rem' }}>{ach.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Game Stats */}
          <div className="event-card p-3 mb-3 text-xs">
            <h3 className="font-bold mb-2 text-sm golden-text">📊 إحصائيات اللعبة</h3>
            <div className="space-y-1" style={{ color: '#c8c8d0' }}>
              <div className="flex justify-between"><span>أعلى نقاط:</span><span style={{ color: '#d4a017' }}>{save?.highestScore}</span></div>
              <div className="flex justify-between"><span>مرات الإكمال:</span><span style={{ color: '#d4a017' }}>{save?.completions}</span></div>
              <div className="flex justify-between"><span>أحداث مكتملة:</span><span style={{ color: '#d4a017' }}>{save?.totalEventsCompleted}</span></div>
              <div className="flex justify-between"><span>معارك بالهروب:</span><span style={{ color: '#d4a017' }}>{save?.battlesFled}</span></div>
              <div className="flex justify-between"><span>معارك بالمفاوضة:</span><span style={{ color: '#d4a017' }}>{save?.battlesNegotiated}</span></div>
              <div className="flex justify-between"><span>ألغاز محلولة:</span><span style={{ color: '#d4a017' }}>{save?.puzzlesSolved}</span></div>
              <div className="flex justify-between"><span>مرات الموت:</span><span style={{ color: '#ff4444' }}>{save?.deathCount}</span></div>
              <div className="flex justify-between">
                <span>وقت اللعب:</span>
                <span style={{ color: '#d4a017' }}>
                  {save?.startTime ? formatTime(Date.now() - save.startTime) : '0د'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <BottomNav activeTab="profile" />
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
        <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 100%)' }}>
          {region?.backgroundImage && (
            <div className="region-bg" style={{ backgroundImage: `url(${region.backgroundImage})` }} />
          )}
          {/* Top Bar */}
          <div className="top-bar py-2 px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{char?.emoji}</span>
              <span className="font-bold text-sm golden-text">{char?.name}</span>
              <span className="mr-auto text-xs" style={{ color: '#7a7a8a' }}>{region?.emoji} {region?.name}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
            <div className="event-card p-5 max-w-sm w-full text-center fade-in">
              <span className="text-3xl block mb-3">■</span>
              <h2 className="text-xl font-bold mb-1 font-serif-heading golden-text">منطقة مكتملة</h2>
              <p className="mb-1 text-sm" style={{ color: '#44ff88' }}>لقد أكملت {region?.name} {region?.emoji}</p>
              <p className="mb-3 text-xs" style={{ color: '#c8c8d0' }}>لديك {statPoints} نقطة إحصائية. اختر أين تضعها:</p>

              <div className="grid grid-cols-2 gap-2">
                {char && [
                  { key: 'strength', label: 'القوة', value: getEffectiveStat(char, 'strength', save.bonusStats), color: '#ff4444' },
                  { key: 'intelligence', label: 'الذكاء', value: getEffectiveStat(char, 'intelligence', save.bonusStats), color: '#a78bfa' },
                  { key: 'luck', label: 'الحظ', value: getEffectiveStat(char, 'luck', save.bonusStats), color: '#44ff88' },
                  { key: 'charisma', label: 'الكاريزما', value: getEffectiveStat(char, 'charisma', save.bonusStats), color: '#d4a017' },
                  { key: 'mana', label: 'المانا', value: getEffectiveStat(char, 'mana', save.bonusStats), color: '#4488ff' },
                  { key: 'defense', label: 'الدفاع', value: getEffectiveStat(char, 'defense', save.bonusStats), color: '#ff8844' },
                ].map(stat => (
                  <button
                    key={stat.key}
                    className="text-right p-2 rounded-lg flex justify-between items-center transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${stat.color}40`, color: '#c8c8d0', fontSize: '0.8rem' }}
                    onClick={() => applyStatPoint(stat.key)}
                  >
                    <span>{stat.label} ({stat.value})</span>
                    <span style={{ color: stat.color }}>+1</span>
                  </button>
                ))}
              </div>

              {statPoints <= 0 && (
                <button className="glow-btn w-full mt-3" onClick={() => setStatPointMode(false)}>
                  المتابعة
                </button>
              )}
            </div>
          </div>
          <BottomNav activeTab="story" />
        </div>
      );
    }

    // Game Complete / No more events
    if (!currentEvent) {
      return (
        <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 100%)' }}>
          {region?.backgroundImage && (
            <div className="region-bg" style={{ backgroundImage: `url(${region.backgroundImage})` }} />
          )}
          <div className="top-bar py-2 px-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{char?.emoji}</span>
              <span className="font-bold text-sm golden-text">{char?.name}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
            <div className="event-card p-5 max-w-sm w-full text-center fade-in">
              <span className="text-4xl block mb-3">🏆</span>
              <h2 className="text-xl font-bold mb-2 font-serif-heading golden-text">اكتملت المغامرة!</h2>
              <p className="mb-3 text-sm" style={{ color: '#7a7a8a' }}>استكشفت كل المناطق المتاحة</p>
              <button className="glow-btn w-full" onClick={() => setScreen('kingdom')}>العودة للمملكة</button>
            </div>
          </div>
          <BottomNav activeTab="story" />
        </div>
      );
    }

    // Main Gameplay - Single Screen
    const isBattle = currentEvent?.type === 'battle';
    const showBattleChoices = !isBattle || dicePhase === 'confirmed' || !!eventOutcome;

    return (
      <div className={`game-viewport ${battleEffect === 'shake' ? 'screen-shake' : ''}`} style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 100%)' }}>
        {/* Region Background Image */}
        {region?.backgroundImage && (
          <div className="region-bg" style={{ backgroundImage: `url(${region.backgroundImage})` }} />
        )}

        {/* ====== DICE ROLL OVERLAY ====== */}
        {isBattle && !eventOutcome && dicePhase === 'idle' && (
          <div className="dice-overlay fade-in">
            <div className="text-center max-w-sm w-full">
              {/* Monster Preview */}
              {(() => {
                const enemies = REGION_ENEMIES[region?.id] || [];
                const enemy = enemies[save.eventIndex % enemies.length];
                if (!enemy) return null;
                return (
                  <div className="mb-3 monster-appear">
                    <div className="scene-frame mx-auto" style={{ width: '110px', height: '110px', overflow: 'hidden', borderColor: 'rgba(255, 68, 68, 0.4)' }}>
                      {enemy.image ? (
                        <img src={enemy.image} alt={enemy.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="flex items-center justify-center h-full"><span className="text-5xl">{enemy.emoji}</span></div>
                      )}
                    </div>
                    <p className="mt-2 text-base font-bold" style={{ color: '#ff4444' }}>{enemy.emoji} {enemy.name}</p>
                    <p className="text-xs" style={{ color: '#7a7a8a' }}>⚔️ ضرر: {enemy.damage} | 💰 جائزة: {enemy.goldReward}</p>
                  </div>
                );
              })()}

              <div className="text-2xl mb-2" style={{ letterSpacing: '8px', color: 'rgba(212, 160, 23, 0.4)' }}>⚜ ✦ ⚜</div>
              <h2 className="text-xl font-bold golden-text font-serif-heading mb-1">⚔️ مواجهة وحش!</h2>
              <p className="text-sm mb-4" style={{ color: '#7a7a8a' }}>ارمِ النرد الخماسي لتحديد مصيرك قبل القتال</p>

              {/* 3D Dice Preview */}
              <div className="dice-container">
                <div className="dice-3d">
                  <div className="dice-face face-front"><span className="face-number">D20</span><div className="face-shape" /></div>
                  <div className="dice-face face-back"><span className="face-number">0</span><div className="face-shape" /></div>
                  <div className="dice-face face-right"><span className="face-number">10</span><div className="face-shape" /></div>
                  <div className="dice-face face-left"><span className="face-number">20</span><div className="face-shape" /></div>
                  <div className="dice-face face-top"><span className="face-number">5</span><div className="face-shape" /></div>
                  <div className="dice-face face-bottom"><span className="face-number">15</span><div className="face-shape" /></div>
                </div>
              </div>

              <div className="space-y-2 mt-3">
                <button className="glow-btn glow-btn-gold w-full text-lg py-3" onClick={() => setDicePhase('ready')}>
                  🎲 ارمِ النرد
                </button>
                <button className="fantasy-btn-secondary w-full text-sm py-2.5" onClick={chooseNeutralDice}>
                  ✋ اختار 10 — بدون تعزيز أو تضعيف
                </button>
              </div>

              <div className="mt-4 p-3 rounded-lg text-xs text-right" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 160, 23, 0.15)', color: '#7a7a8a' }}>
                <p className="font-bold mb-1 golden-text">📜 قواعد النرد:</p>
                <p>• النرد من <strong>0</strong> إلى <strong>20</strong></p>
                <p>• فوق 10 = <span style={{ color: '#44ff88' }}>تعزيز</span> (أقل ضرر، أكثر ذهب)</p>
                <p>• تحت 10 = <span style={{ color: '#ff4444' }}>تضعيف</span> (أكثر ضرر، أقل ذهب)</p>
                <p>• 10 = <span style={{ color: '#d4a017' }}>محايد</span> (بدون تأثير)</p>
                <p>• 20 = <span style={{ color: '#ffd700' }}>تعزيز حرج!</span> | 0 = <span style={{ color: '#ff1a1a' }}>تضعيف حرج!</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Dice Rolling Animation */}
        {(dicePhase === 'ready' || dicePhase === 'rolling') && (
          <div className="dice-overlay">
            <div className="text-center">
              <div className="text-2xl mb-3" style={{ letterSpacing: '8px', color: 'rgba(212, 160, 23, 0.4)' }}>⚜ ✦ ⚜</div>
              <h2 className="text-xl font-bold golden-text font-serif-heading mb-2">🎲 جاري الرمي...</h2>

              <div className="dice-container">
                <div className={`dice-3d ${dicePhase === 'rolling' ? 'rolling' : ''}`}>
                  <div className="dice-face face-front"><span className="face-number">{dicePhase === 'rolling' ? diceRollingNumber : '?'}</span><div className="face-shape" /></div>
                  <div className="dice-face face-back"><span className="face-number">{dicePhase === 'rolling' ? diceRollingNumber : '?'}</span><div className="face-shape" /></div>
                  <div className="dice-face face-right"><span className="face-number">{dicePhase === 'rolling' ? diceRollingNumber : '?'}</span><div className="face-shape" /></div>
                  <div className="dice-face face-left"><span className="face-number">{dicePhase === 'rolling' ? diceRollingNumber : '?'}</span><div className="face-shape" /></div>
                  <div className="dice-face face-top"><span className="face-number">{dicePhase === 'rolling' ? diceRollingNumber : '?'}</span><div className="face-shape" /></div>
                  <div className="dice-face face-bottom"><span className="face-number">{dicePhase === 'rolling' ? diceRollingNumber : '?'}</span><div className="face-shape" /></div>
                </div>
              </div>

              {dicePhase === 'ready' && (
                <button className="glow-btn glow-btn-gold mt-4 text-lg px-8 py-3" onClick={rollBattleDice}>
                  🎲 ارمِ الآن!
                </button>
              )}
              {dicePhase === 'rolling' && (
                <p className="mt-4 text-sm" style={{ color: '#7a7a8a' }}>النرد يدور...</p>
              )}
            </div>
          </div>
        )}

        {/* Dice Result */}
        {dicePhase === 'result' && diceValue !== null && (
          <div className="dice-overlay">
            <div className="text-center max-w-sm w-full fade-in">
              <div className="text-2xl mb-2" style={{ letterSpacing: '8px', color: 'rgba(212, 160, 23, 0.4)' }}>⚜ ⚜ ⚜</div>

              {/* Big Result Number */}
              <div className={`dice-result-number ${
                diceValue === 20 ? 'dice-result-critical-good' :
                diceValue === 0 ? 'dice-result-critical-bad' :
                diceModifier > 0 ? 'dice-result-enhance' :
                diceModifier < 0 ? 'dice-result-weaken' :
                'dice-result-neutral'
              }`}>
                {diceValue}
              </div>

              {/* Modifier Label */}
              <div className="mt-3 mb-2">
                {diceValue === 20 && (
                  <p className="text-lg font-bold" style={{ color: '#ffd700' }}>✨ تعزيز حرج! (+10)</p>
                )}
                {diceValue === 0 && (
                  <p className="text-lg font-bold" style={{ color: '#ff1a1a' }}>💀 تضعيف حرج! (-10)</p>
                )}
                {diceValue !== 20 && diceValue !== 0 && diceModifier > 0 && (
                  <p className="text-base font-bold" style={{ color: '#44ff88' }}>⚜️ تعزيز (+{diceModifier})</p>
                )}
                {diceValue !== 20 && diceValue !== 0 && diceModifier < 0 && (
                  <p className="text-base font-bold" style={{ color: '#ff4444' }}>💀 تضعيف ({diceModifier})</p>
                )}
                {diceModifier === 0 && (
                  <p className="text-base font-bold" style={{ color: '#d4a017' }}>⚖️ محايد (بدون تأثير)</p>
                )}
              </div>

              {/* Modifier Bar Visualization */}
              <div className="dice-modifier-bar">
                <div className="dice-modifier-marker" />
                <div
                  className="dice-modifier-fill"
                  style={{
                    width: `${Math.abs(diceModifier) / 10 * 50}%`,
                    background: diceModifier > 0 ? '#44ff88' : diceModifier < 0 ? '#ff4444' : '#d4a017',
                    marginLeft: diceModifier >= 0 ? '50%' : `${50 - Math.abs(diceModifier) / 10 * 50}%`,
                  }}
                />
              </div>

              {/* Effect Preview */}
              <div className="p-3 mt-3 rounded-lg text-xs text-right" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 160, 23, 0.15)' }}>
                {diceModifier > 0 && (
                  <p style={{ color: '#44ff88' }}>💚 ستستعيد {Math.min(diceModifier * 2, 20)} صحة إضافية وتكسب {diceModifier * 2} ذهب إضافي</p>
                )}
                {diceModifier < 0 && (
                  <p style={{ color: '#ff4444' }}>💔 ستخسر {Math.min(Math.abs(diceModifier) * 2, 25)} صحة إضافية وتخسر {Math.abs(diceModifier)} ذهب</p>
                )}
                {diceModifier === 0 && (
                  <p style={{ color: '#d4a017' }}>⚖️ القتال سيكون عادلاً بدون أي تعديل</p>
                )}
              </div>

              <button className="glow-btn glow-btn-gold w-full mt-4 text-lg py-3" onClick={confirmDice}>
                ⚔️ ابدأ القتال
              </button>
            </div>
          </div>
        )}

        {/* Damage Numbers */}
        {damageNumbers.map(d => (
          <div key={d.id} className="damage-number" style={{ left: `${d.x}%`, top: `${d.y}%`, color: d.color }}>
            {d.color === '#44ff88' ? '+' : '-'}{d.value}
          </div>
        ))}

        {/* Top Bar - Compact Resources */}
        <div className="top-bar py-1.5 px-3 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{char?.emoji}</span>
            <div className="flex-shrink-0">
              <span className="font-bold text-xs golden-text">{char?.name}</span>
              <span className="text-xs" style={{ color: '#7a7a8a' }}> {char?.classAr}</span>
            </div>
            <div className="mr-auto flex gap-1 flex-wrap justify-end items-center">
              <ResourceIcon emoji="❤️" value={res.health} color="#ff4444" />
              <ResourceIcon emoji="💎" value={res.mana} color="#4488ff" />
              <ResourceIcon emoji="💰" value={res.gold} color="#ffcc00" />
              <ResourceIcon emoji="⭐" value={res.reputation} color="#44ff88" />
              <ResourceIcon emoji="📚" value={res.knowledge} color="#a78bfa" />
            </div>
          </div>
          {/* Health/Mana mini bars */}
          <div className="flex gap-2 mt-1">
            <div className="flex-1">
              <div className="health-mini-bar">
                <div className="health-mini-fill" style={{ width: `${(res.health / res.maxHealth) * 100}%`, background: 'linear-gradient(90deg, #ff4444, #ff6666)' }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="health-mini-bar">
                <div className="health-mini-fill" style={{ width: `${(res.mana / res.maxMana) * 100}%`, background: 'linear-gradient(90deg, #4488ff, #66aaff)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Event Progress */}
        <div className="px-3 py-1 text-center text-xs relative z-10" style={{ background: 'rgba(10, 10, 15, 0.8)', color: '#7a7a8a' }}>
          الحدث {save.eventIndex + 1} من {events.length} — {region?.emoji} {region?.name}
          {save.allies.length > 0 && (
            <span className="mr-2">
              {' '}| {save.allies.map(ally => {
                const allyChar = getCharacter(ally.characterId);
                return allyChar?.emoji || '👤';
              }).join(' ')}
            </span>
          )}
        </div>

        {/* Main Event Area - Takes remaining space */}
        <div className="flex-1 p-2.5 overflow-y-auto relative z-10" style={{ minHeight: 0 }}>
          {!eventOutcome ? (
            <div className="fade-in">
              {/* Event Image - Central Visual */}
              {currentEvent.type === 'battle' && (() => {
                const enemies = REGION_ENEMIES[region?.id] || [];
                const enemy = enemies[save.eventIndex % enemies.length];
                return enemy ? (
                  <div className="mb-2">
                    <div className="scene-frame monster-appear" style={{ background: 'rgba(0,0,0,0.3)' }}>
                      {enemy.image ? (
                        <img src={enemy.image} alt={enemy.name} className="monster-appear w-full" style={{ maxHeight: '160px', objectFit: 'cover' }} />
                      ) : (
                        <div className="flex items-center justify-center py-6">
                          <span className="text-5xl">{enemy.emoji}</span>
                        </div>
                      )}
                    </div>
                    {/* Enemy Info */}
                    <div className="mt-1.5 p-2 rounded-lg" style={{ background: 'rgba(255, 68, 68, 0.08)', border: '1px solid rgba(255, 68, 68, 0.25)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm" style={{ color: '#ff4444' }}>{enemy.emoji} {enemy.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255, 68, 68, 0.15)', color: '#ff4444' }}>⚔️ معركة</span>
                      </div>
                      <div className="monster-hp-bar mb-1">
                        <div className="monster-hp-fill" style={{ width: '100%' }} />
                      </div>
                      <div className="flex gap-3 text-xs justify-center">
                        <span style={{ color: '#ff4444' }}>❤️ {enemy.health}</span>
                        <span style={{ color: '#ff8844' }}>⚔️ {enemy.damage}</span>
                        <span style={{ color: '#ffcc00' }}>💰 {enemy.goldReward}</span>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Non-battle event image */}
              {currentEvent.type !== 'battle' && (
                <div className="mb-2 text-center">
                  {currentEvent.image ? (
                    <div className="scene-frame mb-1.5">
                      <img
                        src={currentEvent.image}
                        alt={currentEvent.title}
                        className="w-full"
                        style={{ maxHeight: '150px', objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    </div>
                  ) : (
                    <span className="text-4xl block mb-1">{currentEvent.emoji}</span>
                  )}
                </div>
              )}

              {/* Event Title - Golden Gradient */}
              <h3 className="text-lg font-bold text-center mb-1 font-serif-heading golden-text">{currentEvent.title}</h3>

              {/* Event Type Badge */}
              <div className="text-center mb-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(212, 160, 23, 0.1)', border: '1px solid rgba(212, 160, 23, 0.2)', color: '#d4a017' }}>
                  {currentEvent.type === 'puzzle' ? '🧩 لغز' :
                   currentEvent.type === 'merchant' ? '🏪 تاجر' :
                   currentEvent.type === 'encounter' ? '🤝 لقاء' :
                   currentEvent.type === 'comedy' ? '😂 حدث مضحك' :
                   currentEvent.type === 'crossroads' ? '🗺️ مفترق طرق' :
                   '🔮 حدث سري'}
                </span>
              </div>

              {/* Event Description */}
              <p className="text-sm leading-relaxed mb-2" style={{ color: '#c8c8d0' }}>
                {currentEvent.description}
              </p>

              {/* Lina Foresight */}
              {linaForesight && (
                <div className="mb-2 p-2 rounded-lg" style={{ background: 'rgba(212, 160, 23, 0.08)', border: '1px solid rgba(212, 160, 23, 0.2)' }}>
                  <p className="text-xs font-bold mb-1 golden-text">👁️ بصيرة لينا - نتيجة الخيارات:</p>
                  {currentEvent.options.map((opt, i) => (
                    <div key={i} className="text-xs p-1 rounded mb-0.5" style={{ background: 'rgba(212, 160, 23, 0.05)', color: '#d4a017' }}>
                      خيار {i + 1}: {opt.outcome.success.text.substring(0, 40)}...
                    </div>
                  ))}
                </div>
              )}

              {/* Options - Compact Buttons */}
              {showBattleChoices && (
              <div className="space-y-1.5">
                {currentEvent.options.map((option, i) => (
                  <button
                    key={i}
                    className="event-option"
                    onClick={() => processOutcome(option, save)}
                  >
                    <span className="text-sm">{option.text}</span>
                    {option.statCheck && (
                      <div className="text-xs mt-0.5" style={{ color: '#7a7a8a' }}>
                        يتطلب: {STAT_NAMES[option.statCheck] || option.statCheck} {option.statThreshold}+
                        {char && (
                          <span style={{ color: '#44ff88' }}>
                            {' '}(لديك: {getEffectiveStat(char, option.statCheck, save.bonusStats)})
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}

                {/* Special Ability Button - Small */}
                {!save.abilityUsedThisRegion && (
                <button
                  className="w-full p-2 rounded-lg text-center font-bold text-sm mt-2 transition-all hover:bg-[rgba(212,160,23,0.08)]"
                  style={{ background: 'rgba(212, 160, 23, 0.05)', border: '1px solid rgba(212, 160, 23, 0.25)', color: '#d4a017' }}
                  onClick={useAbility}
                >
                  ✨ {char?.uniqueAbilityAr?.split(' - ')[0] || 'قدرة'}
                </button>
              )}
              </div>
              )} {/* end showBattleChoices */}
            </div>
          ) : (
            /* Outcome Display - Overlay Style */
            <div className="fade-in flex flex-col items-center justify-center h-full">
              <div className="event-card p-5 text-center max-w-sm w-full">
                <span className="text-3xl block mb-3 fade-in">
                  {eventOutcome.includes('💀') ? '💀' :
                   eventOutcome.includes('🏆') ? '🏆' :
                   eventOutcome.includes('🔥') ? '🔥' :
                   eventOutcome.includes('🐉') ? '🐉' :
                   eventOutcome.includes('🐸') ? '🐸' :
                   eventOutcome.includes('👼') ? '👼' : '✨'}
                </span>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#c8c8d0' }}>
                  {eventOutcome}
                </p>
                <button className="glow-btn w-full" onClick={nextEvent}>
                  {save.eventIndex >= (events.length - 1) ? 'المنطقة التالية ➡️' : 'المتابعة ➡️'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab="story" />
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
      <div className="game-viewport" style={{ background: 'linear-gradient(180deg, #0d0d15 0%, #070709 100%)' }}>
        {castleBg && (
          <div className="region-bg" style={{ backgroundImage: `url(${castleBg})` }} />
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
          <div className="event-card p-6 max-w-sm w-full text-center fade-in">
            <span className="text-5xl block mb-4">{ending?.emoji || '◆'}</span>
            <h2 className="text-2xl font-bold mb-3 font-serif-heading golden-text">
              {ending?.name || 'النهاية'}
            </h2>
            <p className="text-base mb-2" style={{ color: '#c8c8d0' }}>{ending?.description}</p>

            {save && (
              <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 160, 23, 0.15)' }}>
                <h4 className="font-bold mb-2 text-sm golden-text">📊 ملخص المغامرة</h4>
                <div className="space-y-1" style={{ color: '#c8c8d0' }}>
                  <div className="flex justify-between"><span>❤️ الصحة النهائية:</span><span style={{ color: '#ff4444' }}>{save.resources.health}</span></div>
                  <div className="flex justify-between"><span>📚 المعرفة:</span><span style={{ color: '#a78bfa' }}>{save.resources.knowledge}</span></div>
                  <div className="flex justify-between"><span>⭐ السمعة:</span><span style={{ color: '#44ff88' }}>{save.resources.reputation}</span></div>
                  <div className="flex justify-between"><span>💰 الذهب:</span><span style={{ color: '#ffcc00' }}>{save.resources.gold}</span></div>
                  <div className="flex justify-between"><span>👥 الحلفاء:</span><span style={{ color: '#d4a017' }}>{save.allies.length}</span></div>
                  <div className="flex justify-between"><span>🏅 الإنجازات:</span><span style={{ color: '#d4a017' }}>{save.achievements.length}/20</span></div>
                  <div className="flex justify-between"><span>⭐ النتيجة:</span><span className="golden-text" style={{ fontWeight: 'bold', fontSize: '1rem' }}>{save.highestScore}</span></div>
                  {save.startTime && (
                    <div className="flex justify-between"><span>⏱️ وقت اللعب:</span><span style={{ color: '#d4a017' }}>{formatTime(Date.now() - save.startTime)}</span></div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button className="glow-btn w-full" onClick={() => {
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
        background: 'linear-gradient(135deg, #d4a017, #8b7355)',
        color: '#0d0d15',
        padding: '10px 20px',
        borderRadius: '10px',
        fontWeight: 'bold',
        fontSize: '0.85rem',
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
