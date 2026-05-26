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
  CLASS_GLOW_COLORS,
  getInitialResources,
  type Character,
  type GameResources,
  type Ally,
  type GameEvent,
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

function statCheck(statValue: number, threshold: number): boolean {
  const roll = rand(1, 6);
  return roll + statValue >= threshold;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getGlowClass(classAr: string): string {
  return CLASS_GLOW_COLORS[classAr] || 'shadow-purple-500/50 border-purple-500';
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
    startTime: Date.now(),
  };
}

// ============================================
// Main Component
// ============================================
export default function GamePage() {
  const [screen, setScreen] = useState<Screen>('login');
  const [playerName, setPlayerName] = useState('');
  const [save, setSave] = useState<PlayerSave | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [eventOutcome, setEventOutcome] = useState<string | null>(null);
  const [isBattle, setIsBattle] = useState(false);
  const [battleEnemyHp, setBattleEnemyHp] = useState(0);
  const [battlePlayerDmg, setBattlePlayerDmg] = useState(0);
  const [showAbility, setShowAbility] = useState(false);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [endingId, setEndingId] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<string | null>(null);
  const [confirmMain, setConfirmMain] = useState<string | null>(null);
  const [statPointMode, setStatPointMode] = useState(false);
  const [statPoints, setStatPoints] = useState(0);
  const [linaForesight, setLinaForesight] = useState(false);
  const [linaUsed, setLinaUsed] = useState(false);
  const [merchantItems, setMerchantItems] = useState<typeof MERCHANT_ITEMS>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('moghamara_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        queueMicrotask(() => {
          setSave(parsed);
          setPlayerName(parsed.name);
          setScreen('kingdom');
        });
      } catch {}
    }
    const savedFeed = localStorage.getItem('moghamara_feed');
    if (savedFeed) {
      try { queueMicrotask(() => setFeed(JSON.parse(savedFeed))); } catch {}
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
  const checkAchievements = useCallback((currentSave: PlayerSave) => {
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

  // Process event outcome
  const processOutcome = useCallback((option: any, currentSave: PlayerSave) => {
    let s = { ...currentSave };
    let res = { ...s.resources };
    const char = getCharacter(s.mainCharacterId || '');
    const statVal = option.statCheck && char ? char.stats[option.statCheck] : 10;
    const threshold = option.statThreshold || 0;
    const success = !option.statCheck || statCheck(statVal, threshold);

    // Ally bonuses for stat checks
    let bonusValue = 0;
    if (s.allies.some(a => a.characterId === 'ousama')) bonusValue += 1;

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

    // Doua bensabaha passive: +3 HP allies per event
    if (s.allies.some(a => a.characterId === 'doua_bensabaha')) {
      res.health = clamp(res.health + 3, 0, res.maxHealth);
    }

    // Basma passive: double item finds
    if (s.mainCharacterId === 'basma' && (outcome.goldChange || 0) > 0) {
      res.gold += Math.floor((outcome.goldChange || 0) * 0.5);
    }

    // Handle ally gain
    let newAllies = [...s.allies];
    if (outcome.allyGain) {
      const allyChar = getCharacter(outcome.allyGain);
      if (allyChar && newAllies.length < 3 && !newAllies.some(a => a.characterId === outcome.allyGain)) {
        // Check aya_bouhalassa and aya_boubaker conflict
        if (
          (outcome.allyGain === 'aya_bouhalassa' && newAllies.some(a => a.characterId === 'aya_boubaker')) ||
          (outcome.allyGain === 'aya_boubaker' && newAllies.some(a => a.characterId === 'aya_bouhalassa'))
        ) {
          // They fight - can't add
        } else {
          const passive = ALLY_PASSIVES[outcome.allyGain];
          newAllies.push({
            characterId: outcome.allyGain,
            name: allyChar.name,
            passiveAbility: passive?.passiveAbilityAr || '',
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

    // Check if current event is battle
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
      }
    }

    // Naska passive: full restore at end of region (check later)

    // Death check
    if (res.health <= 0) {
      // Aya bouhalassa: survive once
      if (s.mainCharacterId === 'aya_bouhalassa' && !s.achievements.includes('divine_protection_survived')) {
        res.health = 1;
        s = { ...s, achievements: [...s.achievements, 'divine_protection_survived'] };
      } else {
        // Dead - restart region with reduced resources
        res.health = Math.floor(res.maxHealth * 0.5);
        res.mana = Math.floor(res.maxMana * 0.5);
        res.gold = Math.max(0, res.gold - 10);
        s.eventIndex = 0;
        s = { ...s, resources: res, allies: newAllies, battlesFled, battlesNegotiated, puzzlesSolved, merchantBuys, karimDragonCount };
        setSave(s);
        setEventOutcome('💀 لقد ممت! تعود من بداية المنطقة بموارد أقل...');
        return;
      }
    }

    s = {
      ...s,
      resources: res,
      allies: newAllies,
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
  }, [checkAchievements]);

  // Determine ending
  const determineEnding = (s: PlayerSave) => {
    let ending = 'legendary_hero';
    const res = s.resources;

    // Secret ending first
    if (res.reputation >= 100 && res.knowledge >= 40 && s.allies.length >= 3) {
      ending = 'secret_ending';
    } else if (s.mainCharacterId === 'aya_boubaker') {
      ending = 'glorious_chaos';
    } else if (s.mainCharacterId === 'karim' && s.karimDragonCount >= 2) {
      ending = 'dragon_legend';
    } else if (s.battlesFled >= 5 && s.battlesNegotiated + s.battlesFled > s.totalEventsCompleted * 0.5) {
      ending = 'mysterious_survivor';
    } else if (res.knowledge >= 50) {
      ending = 'knowledge_guardian';
    } else if (s.allies.length >= 3) {
      ending = 'nation_leader';
    } else if (res.health > 70) {
      ending = 'legendary_hero';
    } else {
      ending = 'legendary_hero';
    }

    const score = res.health + res.gold + res.knowledge * 2 + res.reputation + s.allies.length * 50 + s.completions * 100;
    const updated = {
      ...s,
      completions: s.completions + 1,
      highestScore: Math.max(s.highestScore, score),
      endTime: Date.now(),
    };
    setSave(checkAchievements(updated));
    setEndingId(ending);
    setScreen('ending');
    addFeed(`${s.name} أكمل اللعبة! 🏆`, '🎉');
  };

  // Next event
  const nextEvent = useCallback(() => {
    if (!save) return;
    const s = { ...save };
    const region = REGIONS[s.regionIndex];
    if (!region) return;

    const events = REGION_EVENTS[region.id] || [];
    const nextIdx = s.eventIndex + 1;

    if (nextIdx >= events.length) {
      // Region complete
      const points = s.totalEventsCompleted > 0 && s.resources.health > 70 ? 2 : 1;
      setStatPoints(points);
      setStatPointMode(true);

      // Naska passive: full restore at end of region
      if (s.mainCharacterId === 'naska') {
        s.resources.health = s.resources.maxHealth;
        s.resources.mana = s.resources.maxMana;
      }

      addFeed(`${s.name} وصل إلى ${getRegionName(s.regionIndex + 1) || 'النهاية'}`, '🗺️');

      if (s.regionIndex >= 5) {
        // Game complete!
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
    setLinaUsed(false);
  }, [save, addFeed, checkAchievements, determineEnding]);

  // Use special ability
  const useAbility = () => {
    if (!save || save.abilityUsedThisRegion) return;
    const s = { ...save };
    const char = getCharacter(s.mainCharacterId || '');
    if (!char) return;

    let abilityText = '';

    switch (s.mainCharacterId) {
      case 'ibrahim': // Double Strike
        s.resources.mana -= 10;
        abilityText = '⚔️ الضربة المزدوجة! ضربت العدو مرتين! (-10 مانا)';
        break;
      case 'abdullah': // Shield of Faith
        abilityText = '🛡️ درع الإيمان! ستمتص الضربة التالية كاملاً!';
        break;
      case 'sufian': // Stealth Steal
        const stolenGold = rand(5, 20);
        s.resources.gold += stolenGold;
        abilityText = `🗡️ السرقة الخفية! سرقت ${stolenGold} ذهب!`;
        break;
      case 'boukhloua': // Chaos Spell
        if (rand(1, 2) === 1) {
          s.resources.health = clamp(s.resources.health - 15, 1, s.resources.maxHealth);
          abilityText = '🐸 تحولت لضفدعة لجولة! -15 صحة... لكن على الأقل أنت أخضر!';
        } else {
          s.resources.gold += 30;
          abilityText = '💥 تعويذة الفوضى! دمرت العدو وحصلت على 30 ذهب!';
        }
        break;
      case 'yacine': // Warrior Rage
        if (s.resources.health < 30) {
          abilityText = '💪 غضب المحارب! ضررك تضاعف لأن صحتك منخفضة!';
        } else {
          abilityText = '💪 غضب المحارب! لكن صحتك ليست منخفضة كفاية...';
        }
        break;
      case 'ousama': // Command Shout
        s.allies.forEach(a => { /* boost applied conceptually */ });
        abilityText = '👑 صرخة القيادة! كل حلفائك تعززوا بنقطة!';
        break;
      case 'karim': // Sleeping Dragon
        if (rand(1, 10) <= 1) {
          s.karimDragonCount++;
          s.resources.gold += 50;
          abilityText = '🐉 كريم تحول لتنين!!! دمر كل شيء! +50 ذهب!';
        } else {
          abilityText = '🐉 لم يتحول كريم هذه المرة... التنين نائم.';
        }
        break;
      case 'lina': // Foresight
        setLinaForesight(true);
        setLinaUsed(true);
        abilityText = '📖 البصيرة! يمكنك رؤية نتيجة الخيارات هذه المرة!';
        break;
      case 'nour': // Instant Heal
        s.resources.health = clamp(s.resources.health + 30, 0, s.resources.maxHealth);
        abilityText = '✨ الشفاء الفوري! +30 صحة!';
        break;
      case 'asma': // Negotiation
        abilityText = '💰 المفاوضة! ستحصل على خصم 50% عند أي تاجر!';
        break;
      case 'maram': // Enchanting Poem
        abilityText = '📜 قصيدة السحر! العدو مشلول لـ 3 جولات!';
        break;
      case 'aya1': // Prophecy
        abilityText = '🕊️ التنبؤ! ترى الحدث القادم قبل الوصول إليه!';
        break;
      case 'doua_bentemra': // Inferno
        s.resources.mana -= 25;
        abilityText = '🔥 الجحيم! كل الأعداء احترقوا! (-25 مانا)';
        break;
      case 'doua_bensabaha': // Healing Wave
        s.resources.health = clamp(s.resources.health + 20, 0, s.resources.maxHealth);
        abilityText = '🌊 موجة الشفاء! +20 صحة لك وكل حلفائك!';
        break;
      case 'doua_bensaidan': // Storm
        abilityText = '💨 العاصفة! يمكنك الهروب من أي معركة فوراً!';
        break;
      case 'rawan': // Nature Language
        abilityText = '🌿 لغة الطبيعة! حيوانات الغابة ستحارب معك!';
        break;
      case 'bouchra': // Royal Authority
        abilityText = '👸 السلطة الملكية! الشخصيات غير العدائية ستطيعك!';
        break;
      case 'feryal': // Investigation
        abilityText = '🔍 التحقيق! تكشف نوايا ونقاط ضعف كل شخصية!';
        break;
      case 'basma': // Farm Luck
        s.resources.gold += 15;
        s.resources.health = clamp(s.resources.health + 10, 0, s.resources.maxHealth);
        abilityText = '🌾 حظ المزرعة! وجدت طعام وأدوات! +15 ذهب +10 صحة!';
        break;
      case 'chaimaa': // Hidden Map
        abilityText = '🗺️ الخريطة المخفية! ترى مسارات سرية إضافية!';
        break;
      case 'khaira': // Disguise
        abilityText = '🥷 التنكّر! تتجنب أي مواجهة دون قتال!';
        break;
      case 'fatiha': // Wisdom of Ages
        s.puzzlesSolved++;
        s.resources.knowledge += 10;
        abilityText = '🧓 حكمة الزمن! أي لغز يُحل تلقائياً! +10 معرفة!';
        break;
      case 'aya_bouhalassa': // Divine Protection
        abilityText = '👼 الحماية الإلهية! لن تموت في المرة القادمة!';
        break;
      case 'aya_boubaker': // Funny Chaos
        s.resources.gold += rand(10, 30);
        s.resources.health = clamp(s.resources.health + rand(5, 20), 0, s.resources.maxHealth);
        abilityText = '😈 الفوضى المضحكة! شيء غير متوقع ويومض حدث! نتائج إيجابية!';
        break;
      case 'naska': // Meditation
        s.resources.health = s.resources.maxHealth;
        s.resources.mana = s.resources.maxMana;
        abilityText = '🧘 التأمل! استعادة كاملة للصحة والمانا!';
        break;
      case 'boudar': // Sniper
        abilityText = '🏹 القناص! تضرب أولاً في المعركة القادمة!';
        break;
      case 'benyamina': // Cavalry Charge
        abilityText = '🐴 هجوم الفرسان! ضرر مضاعف في الجولة الأولى!';
        break;
      default:
        abilityText = '✨ استخدمت قدرتك الخاصة!';
    }

    s.abilityUsedThisRegion = true;
    s.resources.mana = Math.max(0, s.resources.mana);
    setSave(checkAchievements(s));
    setEventOutcome(abilityText);
  };

  // Apply stat point
  const applyStatPoint = (stat: string) => {
    if (!save || statPoints <= 0) return;
    const s = { ...save };
    const char = getCharacter(s.mainCharacterId || '');
    if (!char) return;

    // We track bonus stats in resources (hack: use knowledge for stat tracking)
    switch (stat) {
      case 'strength': char.stats.strength++; break;
      case 'intelligence': char.stats.intelligence++; break;
      case 'luck': char.stats.luck++; break;
      case 'charisma': char.stats.charisma++; break;
      case 'mana': char.stats.mana++; s.resources.maxMana += 5; break;
      case 'defense': char.stats.defense++; break;
    }

    const newPoints = statPoints - 1;
    setStatPoints(newPoints);
    if (newPoints <= 0) {
      setStatPointMode(false);
    }
    setSave({ ...s });
  };

  // ============================================
  // SCREEN: Login
  // ============================================
  const renderLoginScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 50%, #1a0a2e 100%)' }}>
      <div className="text-center fade-in">
        <div className="text-6xl mb-4 float-animation">🏰</div>
        <h1 className="text-4xl md:text-5xl font-bold title-glow mb-2" style={{ color: '#d4a017' }}>
          مغامرة الأساتذة
        </h1>
        <p className="text-xl mb-1" style={{ color: '#a890c0' }}>مملكة نور الحكمة</p>
        <div className="flex justify-center gap-3 text-2xl mb-8">
          <span className="float-animation" style={{ animationDelay: '0.3s' }}>⚔️</span>
          <span className="float-animation" style={{ animationDelay: '0.6s' }}>✨</span>
          <span className="float-animation" style={{ animationDelay: '0.9s' }}>🐉</span>
          <span className="float-animation" style={{ animationDelay: '1.2s' }}>🔮</span>
        </div>

        <div className="scroll-container p-6 max-w-sm mx-auto">
          <label className="block text-lg mb-3 font-bold" style={{ color: '#d4a017' }}>
            أدخل اسمك الحقيقي
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 rounded-lg text-right text-lg"
            style={{ background: '#1a0a2e', border: '2px solid #6b3fa0', color: '#f0e6d3' }}
            placeholder="اسمك هنا..."
            maxLength={30}
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
          >
            🗡️ ابدأ المغامرة
          </button>
        </div>

        <p className="mt-6 text-sm" style={{ color: '#a890c0' }}>
          سُرق الكتاب الأعظم من قلعة الظلام... هل أنت البطل الذي سيستعيده؟
        </p>
      </div>
    </div>
  );

  // ============================================
  // SCREEN: Character Selection
  // ============================================
  const renderCharacterSelectScreen = () => (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%)' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold title-glow" style={{ color: '#d4a017' }}>
          ⚔️ اختر شخصيتك
        </h2>
        <p style={{ color: '#a890c0' }}>اختر شخصية رئيسية تمثلك وشخصيات جانبية أيضاً</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {CHARACTERS.map((char) => {
          const isMain = save?.mainCharacterId === char.id;
          const isSide = save?.sideCharacterIds.includes(char.id) || false;
          const glowClass = getGlowClass(char.classAr);

          return (
            <div
              key={char.id}
              className={`game-card slide-in ${isMain ? 'ring-2 ring-yellow-400 pulse-gold' : ''} ${isSide ? 'ring-1 ring-purple-400' : ''}`}
              style={{ animationDelay: `${CHARACTERS.indexOf(char) * 0.03}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{char.emoji}</span>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#d4a017' }}>{char.name}</h3>
                  <span className="text-sm px-2 py-0.5 rounded-full" style={{ background: '#3d2a5c', color: '#a890c0' }}>
                    {char.classAr}
                  </span>
                  {isMain && <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-yellow-600 text-yellow-100">⭐ رئيسية</span>}
                  {isSide && <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-purple-600 text-purple-100">📋 جانبية</span>}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-1 mb-3">
                {[
                  { label: 'القوة', value: char.stats.strength, color: '#ef4444' },
                  { label: 'الذكاء', value: char.stats.intelligence, color: '#6b3fa0' },
                  { label: 'الحظ', value: char.stats.luck, color: '#22c55e' },
                  { label: 'الكاريزما', value: char.stats.charisma, color: '#d4a017' },
                  { label: 'المانا', value: char.stats.mana, color: '#3b82f6' },
                  { label: 'الدفاع', value: char.stats.defense, color: '#f97316' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2 text-xs">
                    <span className="w-14" style={{ color: '#a890c0' }}>{stat.label}</span>
                    <div className="flex-1 stat-bar">
                      <div className="stat-bar-fill" style={{ width: `${(stat.value / 5) * 100}%`, background: stat.color }} />
                    </div>
                    <span style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Unique Ability */}
              <div className="mb-2 p-2 rounded-lg text-sm" style={{ background: 'rgba(107, 63, 160, 0.2)', borderRight: '3px solid #d4a017' }}>
                <span style={{ color: '#d4a017' }}>✨ {char.uniqueAbilityAr}</span>
              </div>

              {/* Signature */}
              <p className="text-xs italic mb-3" style={{ color: '#a890c0' }}>
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
                        s.playedCharacterIds.push(char.id);
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
                    const s = { ...save };
                    if (isSide) {
                      s.sideCharacterIds = s.sideCharacterIds.filter(id => id !== char.id);
                    } else {
                      s.sideCharacterIds.push(char.id);
                    }
                    setSave(s);
                  }}
                >
                  {isSide ? '❌ إزالة' : '📋 جانبية'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Main Dialog */}
      {confirmMain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="scroll-container p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#d4a017' }}>⚠️ تأكيد تغيير الشخصية الرئيسية</h3>
            <p className="mb-4" style={{ color: '#f0e6d3' }}>
              هل تريد تغيير شخصيتك الرئيسية إلى <strong>{getCharacter(confirmMain)?.name}</strong>؟ هذا القرار نادر التغيير.
            </p>
            <div className="flex gap-3">
              <button className="fantasy-btn flex-1" onClick={() => {
                if (!save) return;
                const s = { ...save, mainCharacterId: confirmMain };
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
      <div className="text-center mt-8 pb-8">
        <button
          className="fantasy-btn text-lg px-8 py-3"
          onClick={() => {
            if (save?.mainCharacterId) {
              setScreen('kingdom');
            }
          }}
          disabled={!save?.mainCharacterId}
        >
          🏰 دخول المملكة
        </button>
        {!save?.mainCharacterId && (
          <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>يجب اختيار شخصية رئيسية أولاً</p>
        )}
      </div>
    </div>
  );

  // ============================================
  // SCREEN: Kingdom Board
  // ============================================
  const renderKingdomScreen = () => {
    const char = getCharacter(save?.mainCharacterId || '');

    return (
      <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%)' }}>
        {/* Header */}
        <div className="p-4 text-center" style={{ background: 'linear-gradient(135deg, #2d1b4e, #1a0a2e)', borderBottom: '2px solid #d4a017' }}>
          <h1 className="text-2xl font-bold title-glow" style={{ color: '#d4a017' }}>
            🏰 لوحة مملكة نور الحكمة
          </h1>
          <p style={{ color: '#a890c0' }}>مرحباً {save?.name} {char?.emoji}</p>
        </div>

        {/* Player Status Card */}
        <div className="p-4">
          <div className="game-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{char?.emoji}</span>
              <div>
                <h3 className="font-bold text-lg" style={{ color: '#d4a017' }}>{save?.name}</h3>
                <p className="text-sm" style={{ color: '#a890c0' }}>{char?.classAr} - {char?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
                <div style={{ color: '#22c55e' }}>📍 المنطقة</div>
                <div className="font-bold" style={{ color: '#f0e6d3' }}>{getRegionName(save?.regionIndex || 0)}</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
                <div style={{ color: '#d4a017' }}>⭐ النقاط</div>
                <div className="font-bold" style={{ color: '#f0e6d3' }}>{save?.highestScore}</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
                <div style={{ color: '#6b3fa0' }}>🏅 الإنجازات</div>
                <div className="font-bold" style={{ color: '#f0e6d3' }}>{save?.achievements.length} / 20</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="px-4 mb-4">
          <h3 className="text-lg font-bold mb-2" style={{ color: '#d4a017' }}>🔔 آخر الأحداث</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {feed.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#a890c0' }}>لا توجد أحداث بعد</p>
            ) : (
              feed.slice(0, 10).map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg text-sm" style={{ background: '#2d1b4e' }}>
                  <span>{item.emoji}</span>
                  <span style={{ color: '#f0e6d3' }}>{item.text}</span>
                  <span className="mr-auto text-xs" style={{ color: '#a890c0' }}>
                    {Math.floor((Date.now() - item.time) / 60000)}د
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rankings (simulated) */}
        <div className="px-4 mb-4">
          <h3 className="text-lg font-bold mb-2" style={{ color: '#d4a017' }}>📊 ترتيب المغامرين</h3>
          <div className="space-y-2">
            {[
              { name: save?.name || '', region: save?.regionIndex || 0, score: save?.highestScore || 0, emoji: char?.emoji || '👤' },
              { name: 'أسامة', region: 5, score: 1200, emoji: '👑' },
              { name: 'إبراهيم', region: 3, score: 850, emoji: '⚔️' },
              { name: 'نور', region: 2, score: 620, emoji: '✨' },
            ].sort((a, b) => b.region - a.region || b.score - a.score).map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#2d1b4e' }}>
                <span className="text-xl font-bold" style={{ color: i === 0 ? '#d4a017' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#a890c0' }}>
                  {i + 1}
                </span>
                <span className="text-xl">{p.emoji}</span>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: '#f0e6d3' }}>{p.name}</div>
                  <div className="text-sm" style={{ color: '#a890c0' }}>{getRegionName(p.region)}</div>
                </div>
                <span className="font-bold" style={{ color: '#d4a017' }}>{p.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Online count */}
        <div className="px-4 mb-4 text-center">
          <span className="text-sm px-4 py-2 rounded-full" style={{ background: '#2d1b4e', color: '#22c55e' }}>
            👥 المتصلون الآن: {rand(3, 8)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center gap-3" style={{ background: 'linear-gradient(180deg, transparent, #1a0a2e)', borderTop: '1px solid #6b3fa0' }}>
          <button className="fantasy-btn flex-1" onClick={() => setScreen('gameplay')}>
            ⚔️ العب
          </button>
          <button className="fantasy-btn-secondary flex-1" onClick={() => setScreen('profile')}>
            👤 ملفي
          </button>
          <button className="fantasy-btn-secondary flex-1" onClick={() => setScreen('characterSelect')}>
            🔄 الشخصيات
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
      <div className="min-h-screen pb-24 p-4" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%)' }}>
        <h2 className="text-2xl font-bold text-center mb-4 title-glow" style={{ color: '#d4a017' }}>
          👤 الملف الشخصي
        </h2>

        {/* Main Character */}
        <div className="game-card p-5 mb-4 text-center">
          <span className="text-5xl block mb-2">{char?.emoji}</span>
          <h3 className="text-xl font-bold" style={{ color: '#d4a017' }}>{save?.name}</h3>
          <p style={{ color: '#a890c0' }}>{char?.name} - {char?.classAr}</p>

          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
              <span style={{ color: '#ef4444' }}>❤️ صحة</span>
              <div className="font-bold">{save?.resources.health}/{save?.resources.maxHealth}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
              <span style={{ color: '#3b82f6' }}>💎 مانا</span>
              <div className="font-bold">{save?.resources.mana}/{save?.resources.maxMana}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
              <span style={{ color: '#d4a017' }}>💰 ذهب</span>
              <div className="font-bold">{save?.resources.gold}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
              <span style={{ color: '#22c55e' }}>⭐ سمعة</span>
              <div className="font-bold">{save?.resources.reputation}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
              <span style={{ color: '#6b3fa0' }}>📚 معرفة</span>
              <div className="font-bold">{save?.resources.knowledge}</div>
            </div>
            <div className="p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
              <span style={{ color: '#f97316' }}>📍 منطقة</span>
              <div className="font-bold">{getRegionName(save?.regionIndex || 0)}</div>
            </div>
          </div>
        </div>

        {/* Allies */}
        <div className="game-card p-4 mb-4">
          <h3 className="font-bold mb-2" style={{ color: '#d4a017' }}>👥 الحلفاء ({save?.allies.length || 0}/3)</h3>
          {save?.allies.length === 0 ? (
            <p className="text-sm" style={{ color: '#a890c0' }}>لا يوجد حلفاء بعد</p>
          ) : (
            <div className="space-y-2">
              {save?.allies.map((ally) => {
                const allyChar = getCharacter(ally.characterId);
                return (
                  <div key={ally.characterId} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
                    <span className="text-2xl">{allyChar?.emoji}</span>
                    <div>
                      <div className="font-bold text-sm" style={{ color: '#f0e6d3' }}>{ally.name}</div>
                      <div className="text-xs" style={{ color: '#22c55e' }}>{ally.passiveAbilityAr}</div>
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
            <h3 className="font-bold mb-2" style={{ color: '#d4a017' }}>📋 الشخصيات الجانبية</h3>
            <div className="space-y-2">
              {sideChars.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#1a0a2e' }}>
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: '#f0e6d3' }}>{c.name} - {c.classAr}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="game-card p-4 mb-4">
          <h3 className="font-bold mb-2" style={{ color: '#d4a017' }}>🏅 الإنجازات ({save?.achievements.length || 0}/20)</h3>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = save?.achievements.includes(ach.id);
              return (
                <div key={ach.id} className={`p-2 rounded-lg text-center text-xs ${unlocked ? '' : 'opacity-40'}`} style={{ background: '#1a0a2e' }}>
                  <span className="text-xl">{ach.emoji}</span>
                  <div className="font-bold mt-1" style={{ color: unlocked ? '#d4a017' : '#666' }}>{ach.name}</div>
                  <div style={{ color: unlocked ? '#a890c0' : '#444' }}>{ach.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="game-card p-4 mb-4 text-sm">
          <h3 className="font-bold mb-2" style={{ color: '#d4a017' }}>📊 إحصائيات</h3>
          <div className="space-y-1" style={{ color: '#f0e6d3' }}>
            <div className="flex justify-between"><span>أعلى نقاط:</span><span style={{ color: '#d4a017' }}>{save?.highestScore}</span></div>
            <div className="flex justify-between"><span>مرات الإكمال:</span><span style={{ color: '#d4a017' }}>{save?.completions}</span></div>
            <div className="flex justify-between"><span>أحداث مكتملة:</span><span style={{ color: '#d4a017' }}>{save?.totalEventsCompleted}</span></div>
            <div className="flex justify-between"><span>معارك بالهروب:</span><span style={{ color: '#d4a017' }}>{save?.battlesFled}</span></div>
            <div className="flex justify-between"><span>معارك بالمفاوضة:</span><span style={{ color: '#d4a017' }}>{save?.battlesNegotiated}</span></div>
          </div>
        </div>

        {/* Back Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(180deg, transparent, #1a0a2e)' }}>
          <button className="fantasy-btn w-full" onClick={() => setScreen('kingdom')}>
            🏰 العودة للمملكة
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
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%)' }}>
          <div className="scroll-container p-6 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#d4a017' }}>🎉 منطقة مكتملة!</h2>
            <p className="mb-4" style={{ color: '#22c55e' }}>لقد أكملت {region?.name}!</p>
            <p className="mb-4" style={{ color: '#f0e6d3' }}>لديك {statPoints} نقطة إحصائية. اختر أين تضعها:</p>

            {char && [
              { key: 'strength', label: 'القوة', value: char.stats.strength, color: '#ef4444' },
              { key: 'intelligence', label: 'الذكاء', value: char.stats.intelligence, color: '#6b3fa0' },
              { key: 'luck', label: 'الحظ', value: char.stats.luck, color: '#22c55e' },
              { key: 'charisma', label: 'الكاريزما', value: char.stats.charisma, color: '#d4a017' },
              { key: 'mana', label: 'المانا', value: char.stats.mana, color: '#3b82f6' },
              { key: 'defense', label: 'الدفاع', value: char.stats.defense, color: '#f97316' },
            ].map(stat => (
              <button
                key={stat.key}
                className="w-full text-right p-3 rounded-lg mb-2 flex justify-between items-center"
                style={{ background: '#1a0a2e', border: `1px solid ${stat.color}`, color: '#f0e6d3' }}
                onClick={() => applyStatPoint(stat.key)}
              >
                <span>{stat.label} ({stat.value})</span>
                <span style={{ color: stat.color }}>+1 ➕</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Game Complete / No more events
    if (!currentEvent) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%)' }}>
          <div className="scroll-container p-6 max-w-md w-full text-center">
            <span className="text-5xl block mb-4">🏆</span>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#d4a017' }}>اكتملت المغامرة!</h2>
            <button className="fantasy-btn w-full" onClick={() => setScreen('kingdom')}>🏰 العودة للمملكة</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 100%)' }}>
        {/* Top Resource Bar */}
        <div className="p-3" style={{ background: '#2d1b4e', borderBottom: '2px solid #6b3fa0' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{char?.emoji}</span>
            <span className="font-bold" style={{ color: '#d4a017' }}>{char?.name}</span>
            <span className="text-xs px-2 rounded-full" style={{ background: '#3d2a5c', color: '#a890c0' }}>{char?.classAr}</span>
            <span className="mr-auto text-xs" style={{ color: '#a890c0' }}>{region?.emoji} {region?.name}</span>
          </div>

          {/* HP Bar */}
          <div className="resource-bar mb-1">
            <div className="h-full rounded-full transition-all" style={{
              width: `${(res.health / res.maxHealth) * 100}%`,
              background: 'linear-gradient(90deg, #dc2626, #ef4444)',
            }} />
            <div className="resource-bar-text">❤️ {res.health}/{res.maxHealth}</div>
          </div>

          {/* MP Bar */}
          <div className="resource-bar mb-2">
            <div className="h-full rounded-full transition-all" style={{
              width: `${(res.mana / res.maxMana) * 100}%`,
              background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
            }} />
            <div className="resource-bar-text">💎 {res.mana}/{res.maxMana}</div>
          </div>

          {/* Resources Row */}
          <div className="flex gap-3 text-xs">
            <span style={{ color: '#d4a017' }}>💰 {res.gold}</span>
            <span style={{ color: '#22c55e' }}>⭐ {res.reputation}</span>
            <span style={{ color: '#6b3fa0' }}>📚 {res.knowledge}</span>
            <span style={{ color: '#f97316' }}>👥 {save.allies.length}/3</span>
          </div>
        </div>

        {/* Event Progress */}
        <div className="px-3 py-1 text-center text-xs" style={{ background: '#1a0a2e', color: '#a890c0' }}>
          الحدث {save.eventIndex + 1} من {events.length} — {region?.name} {region?.emoji}
        </div>

        {/* Main Event Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {!eventOutcome ? (
            <div className="fade-in">
              {/* Event Card */}
              <div className="scroll-container p-5 mb-4">
                <div className="text-center mb-3">
                  <span className="text-4xl block mb-2">{currentEvent.emoji}</span>
                  <h3 className="text-xl font-bold" style={{ color: '#d4a017' }}>{currentEvent.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#3d2a5c', color: '#a890c0' }}>
                    {currentEvent.type === 'battle' ? '⚔️ معركة' :
                     currentEvent.type === 'puzzle' ? '🧩 لغز' :
                     currentEvent.type === 'merchant' ? '🏪 تاجر' :
                     currentEvent.type === 'encounter' ? '🤝 لقاء' :
                     currentEvent.type === 'comedy' ? '😂 حدث مضحك' :
                     currentEvent.type === 'crossroads' ? '🗺️ مفترق طرق' :
                     '🔮 حدث سري'}
                  </span>
                </div>
                <p className="text-lg leading-relaxed mb-4" style={{ color: '#f0e6d3' }}>
                  {currentEvent.description}
                </p>

                {/* Lina Foresight */}
                {linaForesight && currentEvent.options.map((opt, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg mb-1" style={{ background: 'rgba(107, 63, 160, 0.3)', color: '#d4a017' }}>
                    👁️ خيار {i + 1}: {opt.outcome.success.text.substring(0, 60)}...
                  </div>
                ))}

                {/* Battle Enemy Info */}
                {currentEvent.type === 'battle' && (() => {
                  const enemies = REGION_ENEMIES[region?.id] || [];
                  const enemy = enemies[save.eventIndex % enemies.length];
                  return enemy ? (
                    <div className="p-3 rounded-lg mb-4 text-center" style={{ background: 'rgba(220, 38, 38, 0.2)', border: '1px solid #dc2626' }}>
                      <span className="text-3xl block mb-1">{enemy.emoji}</span>
                      <div className="font-bold" style={{ color: '#ef4444' }}>{enemy.name}</div>
                      <div className="text-sm" style={{ color: '#f0e6d3' }}>❤️ {enemy.health} | ⚔️ ضرر: {enemy.damage} | 💰 جائزة: {enemy.goldReward}</div>
                    </div>
                  ) : null;
                })()}

                {/* Options */}
                <div className="space-y-3">
                  {currentEvent.options.map((option, i) => (
                    <button
                      key={i}
                      className="w-full text-right p-4 rounded-lg transition-all hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #3d2a5c, #2d1b4e)',
                        border: '2px solid #6b3fa0',
                        color: '#f0e6d3',
                        minHeight: '44px',
                      }}
                      onClick={() => processOutcome(option, save)}
                    >
                      <span className="text-lg">{option.text}</span>
                      {option.statCheck && (
                        <div className="text-xs mt-1" style={{ color: '#a890c0' }}>
                          يتطلب: {option.statCheck === 'strength' ? 'قوة' :
                            option.statCheck === 'intelligence' ? 'ذكاء' :
                            option.statCheck === 'luck' ? 'حظ' :
                            option.statCheck === 'charisma' ? 'كاريزما' :
                            option.statCheck === 'mana' ? 'مانا' : 'دفاع'} {option.statThreshold}+
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Ability Button */}
              {!save.abilityUsedThisRegion && (
                <button
                  className="w-full p-3 rounded-lg text-center font-bold mb-3"
                  style={{ background: 'linear-gradient(135deg, #6b3fa0, #4d1d8e)', border: '2px solid #d4a017', color: '#d4a017' }}
                  onClick={useAbility}
                >
                  ✨ استخدام القدرة الخاصة: {char?.uniqueAbilityAr?.split(' - ')[0]}
                </button>
              )}
            </div>
          ) : (
            /* Outcome Display */
            <div className="fade-in">
              <div className="scroll-container p-6 text-center">
                <span className="text-5xl block mb-4">{eventOutcome.includes('💀') ? '💀' : eventOutcome.includes('🏆') ? '🏆' : eventOutcome.includes('🔥') ? '🔥' : '✨'}</span>
                <p className="text-lg leading-relaxed mb-6" style={{ color: '#f0e6d3' }}>
                  {eventOutcome}
                </p>
                <button className="fantasy-btn w-full text-lg" onClick={nextEvent}>
                  {save.eventIndex >= (events.length - 1) ? '🗺️ المنطقة التالية' : '➡️ الحدث التالي'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-3 flex gap-2" style={{ background: '#2d1b4e', borderTop: '2px solid #6b3fa0' }}>
          <button className="fantasy-btn-secondary flex-1 text-sm py-2" onClick={() => setScreen('kingdom')}>
            🏰 المملكة
          </button>
          <button className="fantasy-btn-secondary flex-1 text-sm py-2" onClick={() => setScreen('profile')}>
            👤 ملفي
          </button>
          <button
            className="fantasy-btn-secondary flex-1 text-sm py-2"
            onClick={() => {
              if (confirm('هل تريد إعادة اللعبة من البداية؟')) {
                const newSave = createDefaultSave(save.name);
                newSave.mainCharacterId = save.mainCharacterId;
                newSave.sideCharacterIds = save.sideCharacterIds;
                newSave.achievements = save.achievements;
                newSave.highestScore = save.highestScore;
                newSave.completions = save.completions;
                newSave.firstLogin = save.firstLogin;
                newSave.playedCharacterIds = save.playedCharacterIds;
                setSave(newSave);
                setEventOutcome(null);
                addFeed(`${save.name} بدأ مغامرة جديدة!`, '🔄');
              }
            }}
          >
            🔄 جديد
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0520 50%, #1a0a2e 100%)' }}>
        <div className="scroll-container p-8 max-w-md w-full text-center fade-in">
          <span className="text-6xl block mb-4 float-animation">{ending?.emoji || '🏆'}</span>
          <h2 className="text-3xl font-bold mb-4 title-glow" style={{ color: '#d4a017' }}>
            {ending?.name || 'النهاية'}
          </h2>
          <p className="text-lg mb-2" style={{ color: '#f0e6d3' }}>{ending?.description}</p>

          {save && (
            <div className="mt-6 p-4 rounded-lg text-sm" style={{ background: '#1a0a2e' }}>
              <div className="space-y-1" style={{ color: '#f0e6d3' }}>
                <div>❤️ الصحة النهائية: {save.resources.health}</div>
                <div>📚 المعرفة: {save.resources.knowledge}</div>
                <div>⭐ السمعة: {save.resources.reputation}</div>
                <div>💰 الذهب: {save.resources.gold}</div>
                <div>👥 الحلفاء: {save.allies.length}</div>
                <div>🏅 الإنجازات: {save.achievements.length}/20</div>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button className="fantasy-btn w-full" onClick={() => {
              if (save) {
                const newSave = createDefaultSave(save.name);
                newSave.mainCharacterId = save.mainCharacterId;
                newSave.sideCharacterIds = save.sideCharacterIds;
                newSave.achievements = save.achievements;
                newSave.highestScore = save.highestScore;
                newSave.completions = save.completions;
                newSave.firstLogin = save.firstLogin;
                newSave.playedCharacterIds = save.playedCharacterIds;
                setSave(newSave);
                setEventOutcome(null);
                setEndingId(null);
                setScreen('gameplay');
                addFeed(`${save.name} بدأ مغامرة جديدة!`, '🔄');
              }
            }}>
              🔄 مغامرة جديدة
            </button>
            <button className="fantasy-btn-secondary w-full" onClick={() => {
              setEndingId(null);
              setScreen('kingdom');
            }}>
              🏰 العودة للمملكة
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
        background: 'linear-gradient(135deg, #d4a017, #b8860b)',
        color: '#1a0a2e',
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
