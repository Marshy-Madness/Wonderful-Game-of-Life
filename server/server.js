
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2988;

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const MAX_LEVEL = 120;

function normalizeChoreSkillEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) return null;
  const subSkills = Array.isArray(raw.subSkills)
    ? raw.subSkills.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const out = { name, subSkills };
  if (Array.isArray(raw.visibleToPlayerNames) && raw.visibleToPlayerNames.length > 0) {
    out.visibleToPlayerNames = raw.visibleToPlayerNames.map((x) => String(x).trim()).filter(Boolean);
  }
  if (raw.subSkillVisibleToPlayerNames && typeof raw.subSkillVisibleToPlayerNames === 'object') {
    const m = {};
    Object.keys(raw.subSkillVisibleToPlayerNames).forEach((k) => {
      const v = raw.subSkillVisibleToPlayerNames[k];
      if (Array.isArray(v) && v.length > 0) {
        m[String(k).trim()] = v.map((x) => String(x).trim()).filter(Boolean);
      }
    });
    if (Object.keys(m).length > 0) out.subSkillVisibleToPlayerNames = m;
  }
  return out;
}

function skillVisibleToPlayer(skill, playerName) {
  if (!skill || !playerName || typeof playerName !== 'string') return true;
  const list = skill.visibleToPlayerNames;
  if (!Array.isArray(list) || list.length === 0) return true;
  return list.includes(playerName);
}

function subSkillVisibleToPlayer(skill, subName, playerName) {
  if (!skill || !playerName || typeof subName !== 'string') return true;
  const map = skill.subSkillVisibleToPlayerNames;
  if (map && typeof map === 'object' && Object.prototype.hasOwnProperty.call(map, subName)) {
    const subList = map[subName];
    if (!Array.isArray(subList) || subList.length === 0) return skillVisibleToPlayer(skill, playerName);
    return subList.includes(playerName);
  }
  return skillVisibleToPlayer(skill, playerName);
}

function playerMayUseSkillSubSkill(skillDef, playerName, subSkillName) {
  if (!skillDef || !playerName || typeof subSkillName !== 'string') return false;
  return subSkillVisibleToPlayer(skillDef, subSkillName, playerName);
}

const CHORE_XP_BY_EFFORT = { 1: 25, 2: 50, 3: 100, 4: 150, 5: 250 };

function choreXpFromEffortStars(effort) {
  const e = Math.min(5, Math.max(1, Number(effort) || 1));
  return CHORE_XP_BY_EFFORT[e] ?? 25;
}

/** Keep stored `xpReward` aligned with `effortStars` (XP is not user-editable). */
function normalizeChoreXpReward(c) {
  if (!c || typeof c !== 'object') return c;
  return { ...c, xpReward: choreXpFromEffortStars(c.effortStars) };
}

function migrateChoreSkillsFromLegacy(parsed) {
  const skillsArr = Array.isArray(parsed.skills) ? parsed.skills : [];
  const byName = new Map(skillsArr.map((s) => [s.name, s]));
  if (Array.isArray(parsed.choreSkills) && parsed.choreSkills.length > 0) {
    return parsed.choreSkills.map(normalizeChoreSkillEntry).filter(Boolean);
  }
  if (Array.isArray(parsed.choreSkills) && parsed.choreSkills.length === 0) {
    return [];
  }
  const legacyNames = Array.isArray(parsed.choreSkillNames)
    ? parsed.choreSkillNames.filter((x) => typeof x === 'string')
    : [];
  if (legacyNames.length === 0) return [];
  return legacyNames.map((n) => {
    const s = byName.get(n);
    return s
      ? { name: s.name, subSkills: Array.isArray(s.subSkills) ? [...s.subSkills] : [] }
      : { name: n, subSkills: [] };
  });
}

/** MUI + all react-icons sets used by the client — always the full list (no per-package toggles). */
const DEFAULT_ENABLED_ICON_PACKAGES = [
  'mui', 'ai', 'bs', 'bi', 'ci', 'cg', 'di', 'fi', 'fc', 'fa', 'fa6', 'gi', 'go', 'gr', 'hi', 'hi2', 'im', 'lia', 'io', 'io5', 'lu', 'md', 'pi', 'rx', 'ri', 'si', 'sl', 'tb', 'tfi', 'ti', 'vsc', 'wi',
];

function loadInitialState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          players: Array.isArray(parsed.players) ? parsed.players : [],
          xpByPlayer: parsed.xpByPlayer && typeof parsed.xpByPlayer === 'object'
            ? parsed.xpByPlayer
            : {},
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          skillIconConfig: parsed.skillIconConfig && typeof parsed.skillIconConfig === 'object'
            ? parsed.skillIconConfig
            : { skills: {}, subSkills: {} },
          skillDocConfig: parsed.skillDocConfig && typeof parsed.skillDocConfig === 'object'
            ? parsed.skillDocConfig
            : { skills: {}, subSkills: {} },
          enabledIconPackages: DEFAULT_ENABLED_ICON_PACKAGES,
          lifeMasterPin: typeof parsed.lifeMasterPin === 'string' ? parsed.lifeMasterPin : '1111',
          xpGrantLog: Array.isArray(parsed.xpGrantLog) ? parsed.xpGrantLog : [],
          skillPointsByPlayer: parsed.skillPointsByPlayer && typeof parsed.skillPointsByPlayer === 'object'
            ? parsed.skillPointsByPlayer
            : {},
          skillTreeConfig: parsed.skillTreeConfig && typeof parsed.skillTreeConfig === 'object'
            ? parsed.skillTreeConfig
            : {},
          imageLibrary: Array.isArray(parsed.imageLibrary) ? parsed.imageLibrary : [],
          starsByPlayer: parsed.starsByPlayer && typeof parsed.starsByPlayer === 'object' ? parsed.starsByPlayer : {},
          starRewards: Array.isArray(parsed.starRewards) ? parsed.starRewards : [],
          chores: Array.isArray(parsed.chores) ? parsed.chores.map(normalizeChoreXpReward) : [],
          choreActivity: Array.isArray(parsed.choreActivity) ? parsed.choreActivity : [],
          effortCoinsByStar: parsed.effortCoinsByStar && typeof parsed.effortCoinsByStar === 'object'
            ? parsed.effortCoinsByStar
            : { 1: 1, 2: 2, 3: 4, 4: 7, 5: 10 },
          coinsByPlayer: parsed.coinsByPlayer && typeof parsed.coinsByPlayer === 'object' ? parsed.coinsByPlayer : {},
          rewardsStore: Array.isArray(parsed.rewardsStore) ? parsed.rewardsStore : [],
          rewardRequests: Array.isArray(parsed.rewardRequests) ? parsed.rewardRequests : [],
          rewardRedemptionLog: Array.isArray(parsed.rewardRedemptionLog) ? parsed.rewardRedemptionLog : [],
          screenTimeByPlayer:
            parsed.screenTimeByPlayer && typeof parsed.screenTimeByPlayer === 'object' ? parsed.screenTimeByPlayer : {},
          starRewardRequests: Array.isArray(parsed.starRewardRequests) ? parsed.starRewardRequests : [],
          choreGoalsByPlayer: parsed.choreGoalsByPlayer && typeof parsed.choreGoalsByPlayer === 'object' ? parsed.choreGoalsByPlayer : {},
          questsByDate: parsed.questsByDate && typeof parsed.questsByDate === 'object' ? parsed.questsByDate : {},
          achievementDefinitions: Array.isArray(parsed.achievementDefinitions) ? parsed.achievementDefinitions : [],
          showcaseByPlayer: parsed.showcaseByPlayer && typeof parsed.showcaseByPlayer === 'object' ? parsed.showcaseByPlayer : {},
          choreSkills: migrateChoreSkillsFromLegacy(parsed),
          rulesPage:
            parsed.rulesPage && typeof parsed.rulesPage === 'object'
              ? parsed.rulesPage
              : { containers: [] },
        };
      }
    }
  } catch (err) {
    console.error('Failed to load state from disk:', err);
  }

  return {
    skills: [],
    players: [],
    xpByPlayer: {},
    tasks: [],
    skillIconConfig: { skills: {}, subSkills: {} },
    skillDocConfig: { skills: {}, subSkills: {} },
    enabledIconPackages: DEFAULT_ENABLED_ICON_PACKAGES,
    lifeMasterPin: '1111',
    xpGrantLog: [],
    skillPointsByPlayer: {},
    skillTreeConfig: {},
    imageLibrary: [],
    starsByPlayer: {},
    starRewards: [],
    chores: [],
    choreActivity: [],
    effortCoinsByStar: { 1: 1, 2: 2, 3: 4, 4: 7, 5: 10 },
    coinsByPlayer: {},
    rewardsStore: [],
    rewardRequests: [],
    rewardRedemptionLog: [],
    screenTimeByPlayer: {},
    starRewardRequests: [],
    choreGoalsByPlayer: {},
    questsByDate: {},
    achievementDefinitions: [],
    showcaseByPlayer: {},
    choreSkills: [],
    rulesPage: { containers: [] },
  };
}

let { skills, players, xpByPlayer, tasks, skillIconConfig, skillDocConfig, enabledIconPackages, lifeMasterPin, xpGrantLog, skillPointsByPlayer, skillTreeConfig, imageLibrary, starsByPlayer, starRewards, chores, choreActivity, effortCoinsByStar, coinsByPlayer, rewardsStore, rewardRequests, rewardRedemptionLog, screenTimeByPlayer, starRewardRequests, choreGoalsByPlayer, questsByDate, achievementDefinitions, showcaseByPlayer, choreSkills, rulesPage } = loadInitialState();

function buildLevelXpThresholds() {
  const thresholds = { 1: 0 };
  let points = 0;
  for (let lvl = 1; lvl < MAX_LEVEL; lvl += 1) {
    points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
    thresholds[lvl + 1] = Math.floor(points / 4);
  }
  return thresholds;
}
const levelXpThresholds = buildLevelXpThresholds();

function xpToLevel(xpValue) {
  const xp = Number(xpValue) || 0;
  if (xp <= 0) return 1;
  let level = 1;
  for (let lvl = 2; lvl <= MAX_LEVEL; lvl += 1) {
    if (xp < levelXpThresholds[lvl]) break;
    level = lvl;
  }
  return level;
}

function getXpDeltaForLevel(level) {
  const l = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(level) || 1)));
  const low = levelXpThresholds[l] || 0;
  const high = levelXpThresholds[l + 1] || low + 1;
  return Math.max(1, high - low);
}

function saveState() {
  const payload = { skills, players, xpByPlayer, tasks, skillIconConfig, skillDocConfig, enabledIconPackages, lifeMasterPin, xpGrantLog, skillPointsByPlayer, skillTreeConfig, imageLibrary, starsByPlayer, starRewards, chores, choreActivity, effortCoinsByStar, coinsByPlayer, rewardsStore, rewardRequests, rewardRedemptionLog, screenTimeByPlayer, starRewardRequests, choreGoalsByPlayer, questsByDate, achievementDefinitions, showcaseByPlayer, choreSkills, rulesPage };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('Error preparing data directory:', err);
  }
}

/** JSON for GET/POST /state responses — never include lifeMasterPin. */
function publicStatePayload() {
  return {
    skills,
    players,
    xpByPlayer,
    tasks,
    skillIconConfig,
    skillDocConfig,
    enabledIconPackages,
    xpGrantLog,
    skillPointsByPlayer,
    skillTreeConfig,
    imageLibrary,
    starsByPlayer,
    starRewards,
    chores,
    choreActivity,
    effortCoinsByStar,
    coinsByPlayer,
    rewardsStore,
    rewardRequests,
    rewardRedemptionLog,
    screenTimeByPlayer,
    starRewardRequests,
    choreGoalsByPlayer,
    questsByDate,
    achievementDefinitions,
    showcaseByPlayer,
    choreSkills,
    rulesPage,
  };
}

app.use(cors());
// Allow large payloads for state that includes base64 player icons
app.use(express.json({ limit: '10mb' }));
// Support form-style POST parameters (e.g. NFC Tools Android)
app.use(express.urlencoded({ extended: false }));

function extractPinFromRequest(req) {
  const directPin = req.get('x-life-master-pin');
  if (directPin) return String(directPin).trim();
  const authHeader = req.get('authorization') || '';
  const bearerPrefix = 'Bearer ';
  if (authHeader.startsWith(bearerPrefix)) {
    return authHeader.slice(bearerPrefix.length).trim();
  }
  // Headerless auth support (useful for simple mobile/NFC tools)
  const queryPin = req.query && req.query.pin;
  if (queryPin !== undefined && queryPin !== null && String(queryPin).trim()) {
    return String(queryPin).trim();
  }
  const bodyPin = req.body && req.body.pin;
  if (bodyPin !== undefined && bodyPin !== null && String(bodyPin).trim()) {
    return String(bodyPin).trim();
  }
  return '';
}

const POST_AUTH_WHITELIST = new Set(['/auth/verify-life-master', '/api/auth/verify-life-master']);

function requirePostAuth(req, res, next) {
  if (req.method !== 'POST') return next();
  if (POST_AUTH_WHITELIST.has(req.path)) return next();
  const providedPin = extractPinFromRequest(req);
  if (!providedPin || providedPin !== String(lifeMasterPin)) {
    return res.status(401).json({ error: 'Unauthorized POST request' });
  }
  next();
}

// Handle aborted/invalid body (e.g. client navigates away during POST) without crashing
app.use((err, req, res, next) => {
  const isAborted = err.message && String(err.message).toLowerCase().includes('aborted');
  const isParseFailed = err.status === 400 || err.type === 'entity.parse.failed';
  if (isAborted || (isParseFailed && err.expose !== false)) {
    res.status(400).json({ error: 'Request body invalid or aborted' });
    return;
  }
  next(err);
});

app.use(requirePostAuth);

// Shared handlers (used at both / and /api for reverse-proxy compatibility)
function handleGetSkills(req, res) {
  res.json(skills);
}

function handlePostSkills(req, res) {
  const { name, subSkill } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const trimmedName = name.trim();
  let existing = skills.find((s) => s.name === trimmedName);

  if (subSkill !== undefined && subSkill !== null && String(subSkill).trim() !== '') {
    const trimmedSub = String(subSkill).trim();
    if (!existing) {
      existing = { name: trimmedName, subSkills: [trimmedSub] };
      skills.push(existing);
    } else {
      if (!Array.isArray(existing.subSkills)) {
        existing.subSkills = [];
      }
      if (!existing.subSkills.includes(trimmedSub)) {
        existing.subSkills.push(trimmedSub);
      }
    }
  } else {
    // Create or ensure skill exists with no sub-skills
    if (!existing) {
      existing = { name: trimmedName, subSkills: [] };
      skills.push(existing);
    }
  }

  saveState();
  res.json(skills);
}

function handleGetState(req, res) {
  res.json(publicStatePayload());
}

function handlePostState(req, res) {
  const body = req.body || {};

  if (Array.isArray(body.skills)) {
    skills = body.skills;
  }

  if (Array.isArray(body.players)) {
    players = body.players;
  }

  if (body.xpByPlayer && typeof body.xpByPlayer === 'object') {
    xpByPlayer = body.xpByPlayer;
  }

  if (Array.isArray(body.tasks)) {
    tasks = body.tasks;
  }

  if (body.skillIconConfig && typeof body.skillIconConfig === 'object') {
    skillIconConfig = body.skillIconConfig;
  }

  if (body.skillDocConfig && typeof body.skillDocConfig === 'object') {
    skillDocConfig = body.skillDocConfig;
  }

  enabledIconPackages = DEFAULT_ENABLED_ICON_PACKAGES;

  if (typeof body.lifeMasterPin === 'string') {
    lifeMasterPin = body.lifeMasterPin;
  }

  if (Array.isArray(body.xpGrantLog)) {
    xpGrantLog = body.xpGrantLog;
  }

  if (body.skillPointsByPlayer && typeof body.skillPointsByPlayer === 'object') {
    skillPointsByPlayer = body.skillPointsByPlayer;
  }

  if (body.skillTreeConfig && typeof body.skillTreeConfig === 'object') {
    skillTreeConfig = body.skillTreeConfig;
  }

  if (Array.isArray(body.imageLibrary)) {
    imageLibrary = body.imageLibrary;
  }

  if (body.starsByPlayer && typeof body.starsByPlayer === 'object') {
    starsByPlayer = body.starsByPlayer;
  }

  if (Array.isArray(body.starRewards)) {
    starRewards = body.starRewards;
  }

  if (Array.isArray(body.chores)) {
    chores = body.chores.map(normalizeChoreXpReward);
  }

  if (Array.isArray(body.choreActivity)) {
    choreActivity = body.choreActivity;
  }

  if (body.effortCoinsByStar && typeof body.effortCoinsByStar === 'object') {
    effortCoinsByStar = body.effortCoinsByStar;
  }

  if (body.coinsByPlayer && typeof body.coinsByPlayer === 'object') {
    coinsByPlayer = body.coinsByPlayer;
  }

  if (Array.isArray(body.rewardsStore)) {
    rewardsStore = body.rewardsStore;
  }

  if (Array.isArray(body.rewardRequests)) {
    rewardRequests = body.rewardRequests;
  }

  if (Array.isArray(body.rewardRedemptionLog)) {
    rewardRedemptionLog = body.rewardRedemptionLog;
  }

  if (body.screenTimeByPlayer && typeof body.screenTimeByPlayer === 'object') {
    screenTimeByPlayer = body.screenTimeByPlayer;
  }

  if (Array.isArray(body.starRewardRequests)) {
    starRewardRequests = body.starRewardRequests;
  }

  if (body.choreGoalsByPlayer && typeof body.choreGoalsByPlayer === 'object') {
    choreGoalsByPlayer = body.choreGoalsByPlayer;
  }

  if (body.questsByDate && typeof body.questsByDate === 'object') {
    questsByDate = body.questsByDate;
  }

  if (Array.isArray(body.achievementDefinitions)) {
    achievementDefinitions = body.achievementDefinitions;
  }

  if (body.showcaseByPlayer && typeof body.showcaseByPlayer === 'object') {
    showcaseByPlayer = body.showcaseByPlayer;
  }

  if (Array.isArray(body.choreSkills)) {
    choreSkills = body.choreSkills.map(normalizeChoreSkillEntry).filter(Boolean);
  }

  if (body.rulesPage && typeof body.rulesPage === 'object') {
    rulesPage = body.rulesPage;
  }

  saveState();
  res.json(publicStatePayload());
}

/** Lets the SPA log in as Life Master without exposing the PIN on GET /state. Whitelisted in requirePostAuth. */
function handlePostVerifyLifeMaster(req, res) {
  const body = req.body || {};
  const raw = body.pin !== undefined && body.pin !== null ? String(body.pin) : '';
  const trimmed = raw.trim();
  if (!trimmed) {
    return res.status(400).json({ error: 'pin is required' });
  }
  if (trimmed !== String(lifeMasterPin)) {
    return res.status(401).json({ error: 'Incorrect PIN' });
  }
  return res.json({ ok: true });
}

function getPlayerByName(playerName) {
  return players.find((p) => p && p.name === playerName);
}

function getSkillDefinition(skillName) {
  return skills.find((s) => s && s.name === skillName);
}

function resolveSkillForChoreXp(skillName) {
  return choreSkills.find((s) => s && s.name === skillName) || getSkillDefinition(skillName);
}

function ensureXpEntry(playerName, skillName, subSkillName) {
  if (!subSkillName || typeof subSkillName !== 'string') {
    return null;
  }
  if (!xpByPlayer[playerName]) xpByPlayer[playerName] = {};
  if (!xpByPlayer[playerName][skillName]) xpByPlayer[playerName][skillName] = {};

  const current = xpByPlayer[playerName][skillName][subSkillName];
  if (typeof current === 'number') {
    xpByPlayer[playerName][skillName][subSkillName] = { actual: current, pending: 0 };
  } else if (!current || typeof current !== 'object') {
    xpByPlayer[playerName][skillName][subSkillName] = { actual: 0, pending: 0 };
  } else {
    xpByPlayer[playerName][skillName][subSkillName] = {
      actual: typeof current.actual === 'number' ? current.actual : 0,
      pending: typeof current.pending === 'number' ? current.pending : 0,
    };
  }
  return xpByPlayer[playerName][skillName][subSkillName];
}

function getXpActual(playerName, skillName, subSkillName) {
  const skillData = xpByPlayer[playerName] && xpByPlayer[playerName][skillName];
  if (!skillData || typeof skillData !== 'object') return 0;
  if (!subSkillName) return 0;
  const raw = skillData[subSkillName];
  if (typeof raw === 'number') return raw;
  if (!raw || typeof raw !== 'object') return 0;
  return typeof raw.actual === 'number' ? raw.actual : 0;
}

function appendXpLog(entry) {
  xpGrantLog = [
    {
      at: new Date().toISOString(),
      ...entry,
    },
    ...xpGrantLog.slice(0, 499),
  ];
}

function addPendingStars(playerName, starAmount) {
  const stars = Number(starAmount) || 0;
  if (stars <= 0) return;
  if (!starsByPlayer[playerName]) {
    starsByPlayer[playerName] = { pending: 0, current: 0, totalEarned: 0 };
  }
  starsByPlayer[playerName] = {
    ...starsByPlayer[playerName],
    pending: (starsByPlayer[playerName].pending || 0) + stars,
  };
}

function handlePostGrantXpSubSkill(req, res) {
  const { playerName, skillName, subSkillName, amount, whatHappened } = req.body || {};
  const inc = Number(amount);
  if (!playerName || typeof playerName !== 'string') {
    return res.status(400).json({ error: 'playerName is required' });
  }
  if (!skillName || typeof skillName !== 'string') {
    return res.status(400).json({ error: 'skillName is required' });
  }
  if (!subSkillName || typeof subSkillName !== 'string') {
    return res.status(400).json({ error: 'subSkillName is required' });
  }
  if (!Number.isFinite(inc) || inc <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (!getPlayerByName(playerName)) {
    return res.status(404).json({ error: 'player not found' });
  }
  const skill = resolveSkillForChoreXp(skillName);
  if (!skill) {
    return res.status(404).json({ error: 'skill not found' });
  }
  if (!Array.isArray(skill.subSkills) || !skill.subSkills.includes(subSkillName)) {
    return res.status(400).json({ error: 'subSkillName is not part of the skill' });
  }
  if (!playerMayUseSkillSubSkill(skill, playerName, subSkillName)) {
    return res.status(403).json({ error: 'player does not have access to this skill/sub-skill' });
  }

  const entry = ensureXpEntry(playerName, skillName, subSkillName);
  entry.pending = (entry.pending || 0) + inc;
  appendXpLog({
    playerName,
    skillName,
    subSkillName,
    amount: inc,
    taskId: null,
    taskTitle: null,
    whatHappened: whatHappened || null,
    starReward: null,
  });
  saveState();
  return res.json({ ok: true, playerName, skillName, subSkillName, amount: inc, entry });
}

function handlePostCompleteTask(req, res) {
  const { playerName, taskId, whatHappened } = req.body || {};
  if (!playerName || typeof playerName !== 'string') {
    return res.status(400).json({ error: 'playerName is required' });
  }
  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'taskId is required' });
  }
  if (!getPlayerByName(playerName)) {
    return res.status(404).json({ error: 'player not found' });
  }
  const task = tasks.find((t) => t && t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'task not found' });
  }
  const xpAmount = Number(task.xpReward);
  if (!Number.isFinite(xpAmount) || xpAmount <= 0) {
    return res.status(400).json({ error: 'task has invalid xpReward' });
  }
  const skill = resolveSkillForChoreXp(task.skillName);
  if (!skill) {
    return res.status(400).json({ error: 'task skill not found' });
  }

  const subs = Array.isArray(skill.subSkills)
    ? skill.subSkills.map((s) => String(s).trim()).filter(Boolean)
    : [];
  if (subs.length === 0) {
    return res.status(400).json({ error: 'Skill must have at least one sub-skill' });
  }
  const subSkillName = task.subSkillName || null;
  if (!subSkillName || !subs.includes(subSkillName)) {
    return res.status(400).json({ error: 'task requires a valid sub-skill' });
  }
  if (!playerMayUseSkillSubSkill(skill, playerName, subSkillName)) {
    return res.status(403).json({ error: 'player does not have access to this skill/sub-skill' });
  }

  let grantAmount = xpAmount;
  if (task.scaleXpWithLevel) {
    const currentXp = getXpActual(playerName, task.skillName, subSkillName);
    const currentLevel = xpToLevel(currentXp);
    const minLevel = Math.max(1, Number(task.requiredLevel) || 1);
    grantAmount = Math.max(1, Math.round(xpAmount * getXpDeltaForLevel(currentLevel) / getXpDeltaForLevel(minLevel)));
  }

  const entry = ensureXpEntry(playerName, task.skillName, subSkillName);
  if (!entry) {
    return res.status(500).json({ error: 'could not allocate XP entry' });
  }
  entry.pending = (entry.pending || 0) + grantAmount;

  const stars = Number(task.starReward) || 0;
  addPendingStars(playerName, stars);
  appendXpLog({
    playerName,
    skillName: task.skillName,
    subSkillName,
    amount: grantAmount,
    taskId: task.id,
    taskTitle: task.title || null,
    whatHappened: whatHappened || null,
    starReward: stars > 0 ? stars : null,
  });

  saveState();
  return res.json({
    ok: true,
    playerName,
    taskId: task.id,
    taskTitle: task.title || null,
    skillName: task.skillName,
    subSkillName,
    amount: grantAmount,
    starReward: stars > 0 ? stars : 0,
    entry,
  });
}

function handleGetTasksList(req, res) {
  const list = (Array.isArray(tasks) ? tasks : [])
    .filter((t) => t && t.id)
    .map((t) => {
      const id = String(t.id);
      const title = typeof t.title === 'string' ? t.title.trim() : '';
      const skillName = typeof t.skillName === 'string' ? t.skillName.trim() : '';
      const subRaw = t.subSkillName != null ? String(t.subSkillName).trim() : '';
      return {
        id,
        name: title || id,
        skillName,
        subSkillName: subRaw || null,
      };
    });
  res.json({ tasks: list });
}

function handleGetChoresSummary(req, res) {
  const list = (Array.isArray(chores) ? chores : [])
    .filter((c) => c && c.id)
    .map((c) => ({
      choreId: String(c.id),
      name: typeof c.title === 'string' && c.title.trim() ? c.title.trim() : String(c.id),
      room: typeof c.room === 'string' ? c.room.trim() : '',
    }));
  res.json({ chores: list });
}

// --- Chores & daily quests (same auth as other POSTs: Life Master PIN) ---
function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getChorePeriodKey(schedule, date = new Date()) {
  if (schedule === 'monthly') return getMonthKey(date);
  if (schedule === 'weekly') return getWeekKey(date);
  return getTodayKey(date);
}

function getChoreById(choreId) {
  return chores.find((c) => c && c.id === choreId);
}

function getCompletionsForChoreInPeriod(choreId, schedule) {
  const pk = getChorePeriodKey(schedule);
  return choreActivity.filter((a) => a && a.choreId === choreId && a.periodKey === pk);
}

function getQuestChoreIdsForPlayerToday(playerName) {
  const key = getTodayKey();
  const byDate = questsByDate[key] || {};
  return byDate[playerName] || [];
}

function canPlayerCompleteChore(playerName, chore) {
  if (!playerName || !chore) return false;
  if (chore.room === 'Bedroom' && chore.bedroomOwner && chore.bedroomOwner !== playerName) return false;
  if (getCompletionsForChoreInPeriod(chore.id, chore.schedule).length > 0) return false;
  const todayQuests = getQuestChoreIdsForPlayerToday(playerName);
  if (chore.assignedQuestTo && chore.assignedQuestTo !== playerName) return false;
  if (chore.questOnly && !todayQuests.includes(chore.id)) return false;
  return true;
}

function applyChoreSkillXpPending(playerName, chore) {
  const skillName = chore.skillName;
  const xpVal = choreXpFromEffortStars(chore.effortStars);
  if (xpVal <= 0 || !skillName) return;
  const skillDef = resolveSkillForChoreXp(skillName);
  if (!skillDef) return;
  const subsAll = Array.isArray(skillDef.subSkills) ? skillDef.subSkills.map((s) => String(s).trim()).filter(Boolean) : [];

  if (!xpByPlayer[playerName]) xpByPlayer[playerName] = {};
  if (!xpByPlayer[playerName][skillName]) xpByPlayer[playerName][skillName] = {};

  function addSubPending(subName, amt) {
    if (amt <= 0) return;
    ensureXpEntry(playerName, skillName, subName);
    const raw = xpByPlayer[playerName][skillName][subName];
    const e =
      typeof raw === 'object' && raw
        ? { actual: Number(raw.actual) || 0, pending: Number(raw.pending) || 0 }
        : { actual: typeof raw === 'number' ? raw : 0, pending: 0 };
    e.pending += amt;
    xpByPlayer[playerName][skillName][subName] = e;
  }

  if (subsAll.length === 0) {
    return;
  }

  const picked = typeof chore.subSkillName === 'string' ? chore.subSkillName.trim() : '';
  if (picked && subsAll.includes(picked)) {
    if (!playerMayUseSkillSubSkill(skillDef, playerName, picked)) return;
    addSubPending(picked, xpVal);
    return;
  }

  const subs = subsAll.filter((subName) => playerMayUseSkillSubSkill(skillDef, playerName, subName));
  if (subs.length === 0) {
    return;
  }

  const n = subs.length;
  const per = Math.floor(xpVal / n);
  const rem = xpVal % n;
  subs.forEach((subName, i) => {
    addSubPending(subName, per + (i < rem ? 1 : 0));
  });
}

function handleGetChores(req, res) {
  res.json(chores);
}

function handlePostChores(req, res) {
  const body = req.body || {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const room = typeof body.room === 'string' ? body.room.trim() : '';
  const schedule = typeof body.schedule === 'string' ? body.schedule.trim() : '';
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (!room) {
    return res.status(400).json({ error: 'room is required' });
  }
  if (!['daily', 'weekly', 'monthly'].includes(schedule)) {
    return res.status(400).json({ error: 'schedule must be daily, weekly, or monthly' });
  }
  const id = typeof body.id === 'string' && body.id.trim()
    ? body.id.trim()
    : `chore_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  if (getChoreById(id)) {
    return res.status(409).json({ error: 'chore id already exists' });
  }
  const effortStars = Math.min(5, Math.max(1, Number(body.effortStars) || 1));
  const skillName = body.skillName && String(body.skillName).trim() ? String(body.skillName).trim() : null;
  const subSkillName =
    body.subSkillName && String(body.subSkillName).trim() ? String(body.subSkillName).trim() : undefined;
  const xpReward = choreXpFromEffortStars(effortStars);
  const starReward = Math.max(0, Number(body.starReward) || 0);
  const assignedQuestTo = body.assignedQuestTo && String(body.assignedQuestTo).trim()
    ? String(body.assignedQuestTo).trim()
    : undefined;
  const questOnly = !!body.questOnly;
  const bedroomOwner =
    typeof body.bedroomOwner === 'string' && body.bedroomOwner.trim()
      ? String(body.bedroomOwner).trim()
      : undefined;
  if (room === 'Bedroom' && !bedroomOwner) {
    return res.status(400).json({ error: 'bedroomOwner is required when room is Bedroom' });
  }
  const chore = {
    id,
    title,
    room,
    schedule,
    effortStars,
    skillName,
    xpReward,
    ...(subSkillName ? { subSkillName } : {}),
    ...(starReward > 0 ? { starReward } : {}),
    ...(assignedQuestTo ? { assignedQuestTo } : {}),
    ...(questOnly ? { questOnly: true } : {}),
    ...(room === 'Bedroom' && bedroomOwner ? { bedroomOwner } : {}),
  };
  chores.push(chore);
  saveState();
  res.json(chores);
}

function handlePostChoreDelete(req, res) {
  const choreId = req.body && req.body.choreId !== undefined && req.body.choreId !== null
    ? String(req.body.choreId).trim()
    : '';
  if (!choreId) {
    return res.status(400).json({ error: 'choreId is required' });
  }
  const idx = chores.findIndex((c) => c && c.id === choreId);
  if (idx === -1) {
    return res.status(404).json({ error: 'chore not found' });
  }
  chores.splice(idx, 1);
  saveState();
  res.json(chores);
}

function handlePostChoreComplete(req, res) {
  const body = req.body || {};
  const playerName = typeof body.playerName === 'string' ? body.playerName.trim() : '';
  const choreId = body.choreId !== undefined && body.choreId !== null ? String(body.choreId).trim() : '';
  if (!playerName) {
    return res.status(400).json({ error: 'playerName is required' });
  }
  if (!choreId) {
    return res.status(400).json({ error: 'choreId is required' });
  }
  if (!getPlayerByName(playerName)) {
    return res.status(404).json({ error: 'player not found' });
  }
  const chore = getChoreById(choreId);
  if (!chore) {
    return res.status(404).json({ error: 'chore not found' });
  }
  if (!canPlayerCompleteChore(playerName, chore)) {
    return res.status(400).json({ error: 'chore cannot be completed (already done for this period, quest rules, or assignment)' });
  }

  const now = new Date();
  const periodKey = getChorePeriodKey(chore.schedule, now);
  const effort = Math.min(5, Math.max(1, Number(chore.effortStars) || 1));
  const earnedCoins = Number(effortCoinsByStar[effort]) || 0;
  const starGain = Math.max(0, Number(chore.starReward) || 0);

  const activity = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    at: now.toISOString(),
    dateKey: getTodayKey(now),
    periodKey,
    playerName,
    choreId: chore.id,
    choreTitle: chore.title,
    room: chore.room,
    schedule: chore.schedule,
    effortStars: effort,
    coins: earnedCoins,
  };
  choreActivity = [activity, ...choreActivity];

  if (!coinsByPlayer[playerName]) {
    coinsByPlayer[playerName] = { pending: 0, coins: 0, pendingSpent: 0 };
  }
  const curCoins = coinsByPlayer[playerName];
  coinsByPlayer[playerName] = {
    ...curCoins,
    pending: (Number(curCoins.pending) || 0) + earnedCoins,
  };

  if (starGain > 0) {
    addPendingStars(playerName, starGain);
  }

  if (chore.skillName && choreXpFromEffortStars(chore.effortStars) > 0) {
    const skillDef = resolveSkillForChoreXp(chore.skillName);
    if (!skillDef) {
      return res.status(400).json({ error: 'chore skill not found for XP' });
    }
    const subsAll = Array.isArray(skillDef.subSkills) ? skillDef.subSkills.map((s) => String(s).trim()).filter(Boolean) : [];
    const picked = typeof chore.subSkillName === 'string' ? chore.subSkillName.trim() : '';
    if (subsAll.length > 0) {
      if (picked && subsAll.includes(picked)) {
        if (!playerMayUseSkillSubSkill(skillDef, playerName, picked)) {
          return res.status(403).json({ error: 'player does not have access to this chore skill for XP' });
        }
      } else {
        const eligible = subsAll.filter((s) => playerMayUseSkillSubSkill(skillDef, playerName, s));
        if (eligible.length === 0) {
          return res.status(403).json({ error: 'player does not have access to this chore skill for XP' });
        }
      }
    }
    applyChoreSkillXpPending(playerName, chore);
  }

  saveState();
  return res.json({
    ok: true,
    playerName,
    choreId: chore.id,
    choreTitle: chore.title,
    coins: earnedCoins,
    starReward: starGain,
    activity,
  });
}

/** Set or extend today's quest chore list for a player (matches in-app "Assign quest" behavior for add). */
function handlePostQuestsToday(req, res) {
  const body = req.body || {};
  const playerName = typeof body.playerName === 'string' ? body.playerName.trim() : '';
  if (!playerName || !getPlayerByName(playerName)) {
    return res.status(400).json({ error: 'valid playerName is required' });
  }
  const day = getTodayKey();
  if (!questsByDate[day]) questsByDate[day] = {};

  if (Array.isArray(body.choreIds)) {
    const ids = body.choreIds.map((x) => String(x).trim()).filter(Boolean);
    for (let i = 0; i < ids.length; i += 1) {
      if (!getChoreById(ids[i])) {
        return res.status(400).json({ error: `chore not found: ${ids[i]}` });
      }
    }
    questsByDate[day] = { ...questsByDate[day], [playerName]: ids };
    saveState();
    return res.json({ ok: true, day, playerName, choreIds: ids });
  }

  const addChoreId = body.addChoreId !== undefined && body.addChoreId !== null
    ? String(body.addChoreId).trim()
    : '';
  if (addChoreId) {
    if (!getChoreById(addChoreId)) {
      return res.status(404).json({ error: 'chore not found' });
    }
    const dayMap = { ...questsByDate[day] };
    const list = new Set(dayMap[playerName] || []);
    list.add(addChoreId);
    dayMap[playerName] = [...list];
    questsByDate[day] = dayMap;
    const ci = chores.findIndex((c) => c && c.id === addChoreId);
    if (ci !== -1) {
      chores[ci] = { ...chores[ci], assignedQuestTo: playerName, questOnly: true };
    }
    saveState();
    return res.json({ ok: true, day, playerName, choreIds: dayMap[playerName] });
  }

  return res.status(400).json({ error: 'Provide choreIds (array) or addChoreId' });
}

/** True if the player has at least one star not yet moved to the jar (pending > 0). */
function handleGetPlayerPendingStars(req, res) {
  const raw = req.params.playerName != null ? String(req.params.playerName) : '';
  let playerName = raw.trim();
  try {
    playerName = decodeURIComponent(playerName);
  } catch {
    return res.status(400).json({ error: 'invalid player name' });
  }
  if (!playerName || !getPlayerByName(playerName)) {
    return res.status(404).json({ error: 'player not found' });
  }
  const s = starsByPlayer[playerName];
  const pending = Number(s && s.pending) > 0;
  return res.json({ pending });
}

// Routes at root (direct access, e.g. localhost:2988)
app.post('/auth/verify-life-master', handlePostVerifyLifeMaster);
app.post('/api/auth/verify-life-master', handlePostVerifyLifeMaster);
app.get('/skills', handleGetSkills);
app.post('/skills', handlePostSkills);
app.get('/state', handleGetState);
app.post('/state', handlePostState);
app.post('/xp/sub-skill', handlePostGrantXpSubSkill);
app.post('/tasks/complete', handlePostCompleteTask);
app.get('/chores/summary', handleGetChoresSummary);
app.get('/chores', handleGetChores);
app.get('/tasks', handleGetTasksList);
app.post('/chores', handlePostChores);
app.post('/chores/complete', handlePostChoreComplete);
app.post('/chores/delete', handlePostChoreDelete);
app.post('/quests/today', handlePostQuestsToday);
app.get('/players/:playerName/pending-stars', handleGetPlayerPendingStars);

// Same routes under /api (for reverse proxy that forwards /api/* without stripping)
app.get('/api/skills', handleGetSkills);
app.post('/api/skills', handlePostSkills);
app.get('/api/state', handleGetState);
app.post('/api/state', handlePostState);
app.post('/api/xp/sub-skill', handlePostGrantXpSubSkill);
app.post('/api/tasks/complete', handlePostCompleteTask);
app.get('/api/chores/summary', handleGetChoresSummary);
app.get('/api/chores', handleGetChores);
app.get('/api/tasks', handleGetTasksList);
app.post('/api/chores', handlePostChores);
app.post('/api/chores/complete', handlePostChoreComplete);
app.post('/api/chores/delete', handlePostChoreDelete);
app.post('/api/quests/today', handlePostQuestsToday);
app.get('/api/players/:playerName/pending-stars', handleGetPlayerPendingStars);

// Optional: serve React build from one server (no proxy /api needed)
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(STATIC_DIR)) {
  app.use(express.static(STATIC_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
