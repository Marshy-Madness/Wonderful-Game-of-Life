
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  ListItemIcon,
  Popover,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  FormGroup,
  Checkbox,
  Paper,
  Collapse,
  ListSubheader,
  Badge,
  Stack,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import ImageIcon from '@mui/icons-material/Image';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ViewListIcon from '@mui/icons-material/ViewList';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ApiIcon from '@mui/icons-material/Api';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import * as MuiIcons from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import GridLayout, { getCompactor } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AssignIconSection from './AssignIconSection';
import VisualSkillTree from './VisualSkillTree';
import RulesPage, { normalizeRulesPage } from './RulesPage';

const MUI_ICONS_FORCED = { Settings: SettingsIcon, Home: HomeIcon, Star: StarIcon, Search: SearchIcon, Person: PersonIcon };

const WONDERFUL_GAME_LM_PIN_KEY = 'wonderful-game-life-master-pin';

function readStoredLifeMasterPin() {
  try {
    const s = localStorage.getItem(WONDERFUL_GAME_LM_PIN_KEY);
    if (typeof s === 'string' && s.trim()) return s.trim();
  } catch (_) {
    /* ignore */
  }
  return '1111';
}

function persistLifeMasterPinToStorage(pin) {
  try {
    if (pin != null && String(pin).trim() !== '') {
      localStorage.setItem(WONDERFUL_GAME_LM_PIN_KEY, String(pin).trim());
    }
  } catch (_) {
    /* ignore */
  }
}

const WONDERFUL_GAME_SESSION_KEY = 'wonderful-game-session';

function readStoredSessionRole() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(WONDERFUL_GAME_SESSION_KEY);
    if (!raw) return null;
    const sess = JSON.parse(raw);
    if (!sess?.role) return null;
    if (sess.role === 'Player') return null;
    if (sess.role === 'Life Master' || sess.role === 'Overview' || sess.role === 'Weekly Review') {
      return sess.role;
    }
    return null;
  } catch (_) {
    return null;
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(WONDERFUL_GAME_SESSION_KEY);
  } catch (_) {
    /* ignore */
  }
}

function normalizeChoreSkillDef(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) return null;
  const subSkills = Array.isArray(raw.subSkills)
    ? raw.subSkills.map((s) => String(s).trim()).filter(Boolean)
    : [];
  return { name, subSkills };
}

/** Showcase: no gravity compaction; allowOverlap false; push tiles on collision (preventCollision false). */
const SHOWCASE_GRID_COMPACTOR = getCompactor(null, false, false);

// Use same-origin /api when served from a real host (e.g. life.marshymadness.com).
// Use REACT_APP_API_URL in dev (e.g. http://localhost:2988) when needed.
function getApiBase() {
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost')) {
    return '';
  }
  if (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }
  return '';
}
const apiUrl = (path) => {
  const base = getApiBase();
  return base ? `${base}${path}` : `/api${path}`;
};

function getMuiIconNames() {
  const fromNamespace = Object.keys(MuiIcons).filter((k) => {
    if (k === 'default') return false;
    const v = MuiIcons[k];
    return v != null && (typeof v === 'function' || (typeof v === 'object' && !Array.isArray(v)));
  });
  const fromForced = Object.keys(MUI_ICONS_FORCED);
  const combined = [...new Set([...fromForced, ...fromNamespace])].sort();
  return combined;
}

const MUI_PACKAGE = {
  id: 'mui',
  label: 'Material UI',
  getIconNames: getMuiIconNames,
  getIcon: (name) => MuiIcons[name] || MUI_ICONS_FORCED[name] || null,
};

const REACT_ICONS_SETS = [
  { id: 'ai', label: 'Ant Design Icons' },
  { id: 'bs', label: 'Bootstrap Icons' },
  { id: 'bi', label: 'BoxIcons' },
  { id: 'ci', label: 'Circum Icons' },
  { id: 'cg', label: 'css.gg' },
  { id: 'di', label: 'Devicons' },
  { id: 'fi', label: 'Feather' },
  { id: 'fc', label: 'Flat Color Icons' },
  { id: 'fa', label: 'Font Awesome 5' },
  { id: 'fa6', label: 'Font Awesome 6' },
  { id: 'gi', label: 'Game Icons' },
  { id: 'go', label: 'Github Octicons' },
  { id: 'gr', label: 'Grommet-Icons' },
  { id: 'hi', label: 'Heroicons' },
  { id: 'hi2', label: 'Heroicons 2' },
  { id: 'im', label: 'IcoMoon Free' },
  { id: 'lia', label: 'Icons8 Line Awesome' },
  { id: 'io', label: 'Ionicons 4' },
  { id: 'io5', label: 'Ionicons 5' },
  { id: 'lu', label: 'Lucide' },
  { id: 'md', label: 'Material Design' },
  { id: 'pi', label: 'Phosphor Icons' },
  { id: 'rx', label: 'Radix Icons' },
  { id: 'ri', label: 'Remix Icon' },
  { id: 'si', label: 'Simple Icons' },
  { id: 'sl', label: 'Simple Line Icons' },
  { id: 'tb', label: 'Tabler Icons' },
  { id: 'tfi', label: 'Themify Icons' },
  { id: 'ti', label: 'Typicons' },
  { id: 'vsc', label: 'VS Code Icons' },
  { id: 'wi', label: 'Weather Icons' },
];

/** MUI + every react-icons set — always enabled (no per-package toggles in Settings). */
const ALL_ENABLED_ICON_PACKAGES = Object.freeze(['mui', ...REACT_ICONS_SETS.map((s) => s.id)]);

const REACT_ICONS_STATIC = {};
[
  'fa', 'fa6', 'fi', 'hi', 'hi2', 'md', 'bs', 'bi', 'ai', 'cg', 'ci', 'di', 'fc', 'gi', 'go', 'gr',
  'im', 'io', 'io5', 'lia', 'lu', 'pi', 'rx', 'ri', 'si', 'sl', 'tb', 'tfi', 'ti', 'vsc', 'wi',
].forEach((id) => {
  try {
    switch (id) {
      case 'fa': REACT_ICONS_STATIC.fa = require('react-icons/fa'); break;
      case 'fa6': REACT_ICONS_STATIC.fa6 = require('react-icons/fa6'); break;
      case 'fi': REACT_ICONS_STATIC.fi = require('react-icons/fi'); break;
      case 'hi': REACT_ICONS_STATIC.hi = require('react-icons/hi'); break;
      case 'hi2': REACT_ICONS_STATIC.hi2 = require('react-icons/hi2'); break;
      case 'md': REACT_ICONS_STATIC.md = require('react-icons/md'); break;
      case 'bs': REACT_ICONS_STATIC.bs = require('react-icons/bs'); break;
      case 'bi': REACT_ICONS_STATIC.bi = require('react-icons/bi'); break;
      case 'ai': REACT_ICONS_STATIC.ai = require('react-icons/ai'); break;
      case 'cg': REACT_ICONS_STATIC.cg = require('react-icons/cg'); break;
      case 'ci': REACT_ICONS_STATIC.ci = require('react-icons/ci'); break;
      case 'di': REACT_ICONS_STATIC.di = require('react-icons/di'); break;
      case 'fc': REACT_ICONS_STATIC.fc = require('react-icons/fc'); break;
      case 'gi': REACT_ICONS_STATIC.gi = require('react-icons/gi'); break;
      case 'go': REACT_ICONS_STATIC.go = require('react-icons/go'); break;
      case 'gr': REACT_ICONS_STATIC.gr = require('react-icons/gr'); break;
      case 'im': REACT_ICONS_STATIC.im = require('react-icons/im'); break;
      case 'io': REACT_ICONS_STATIC.io = require('react-icons/io'); break;
      case 'io5': REACT_ICONS_STATIC.io5 = require('react-icons/io5'); break;
      case 'lia': REACT_ICONS_STATIC.lia = require('react-icons/lia'); break;
      case 'lu': REACT_ICONS_STATIC.lu = require('react-icons/lu'); break;
      case 'pi': REACT_ICONS_STATIC.pi = require('react-icons/pi'); break;
      case 'rx': REACT_ICONS_STATIC.rx = require('react-icons/rx'); break;
      case 'ri': REACT_ICONS_STATIC.ri = require('react-icons/ri'); break;
      case 'si': REACT_ICONS_STATIC.si = require('react-icons/si'); break;
      case 'sl': REACT_ICONS_STATIC.sl = require('react-icons/sl'); break;
      case 'tb': REACT_ICONS_STATIC.tb = require('react-icons/tb'); break;
      case 'tfi': REACT_ICONS_STATIC.tfi = require('react-icons/tfi'); break;
      case 'ti': REACT_ICONS_STATIC.ti = require('react-icons/ti'); break;
      case 'vsc': REACT_ICONS_STATIC.vsc = require('react-icons/vsc'); break;
      case 'wi': REACT_ICONS_STATIC.wi = require('react-icons/wi'); break;
      default: break;
    }
  } catch (_) {}
});

/** Coin art for chore/overview jars — place the file at `client/public/coin.png`. */
const COIN_PNG_SRC = `${process.env.PUBLIC_URL || ''}/coin.png`;

/** Level-up fireworks SFX — place at `client/public/fireworks.mp3`. Confetti runs for the track length. */
const FIREWORKS_MP3_SRC = `${process.env.PUBLIC_URL || ''}/fireworks.mp3`;

/** XP redeem SFX — place at `client/public/confetti.mp3`. Confetti runs for the track length. */
const CONFETTI_MP3_SRC = `${process.env.PUBLIC_URL || ''}/confetti.mp3`;

/** Screen time countdown finished — place at `client/public/alarm-clock.mp3` (plays full clip). */
const ALARM_CLOCK_MP3_SRC = `${process.env.PUBLIC_URL || ''}/alarm-clock.mp3`;

function playAlarmClockSound() {
  try {
    const audio = new Audio(ALARM_CLOCK_MP3_SRC);
    audio.play().catch(() => {});
  } catch (_) {
    /* ignore */
  }
}

/** Skills / Chores Activity — cartoon parchment scroll cards (paper + rolled ends). */
const ACTIVITY_SCROLL_ITEM_SX = {
  position: 'relative',
  py: 2,
  px: 2.5,
  width: '100%',
  boxSizing: 'border-box',
  background:
    'linear-gradient(180deg, #e8dcc8 0%, #f5ecd8 10%, #fff8e7 45%, #faf3e4 78%, #efe4d4 100%)',
  borderRadius: 1,
  border: '1px solid rgba(120, 82, 42, 0.5)',
  boxShadow:
    '0 4px 16px rgba(40, 22, 12, 0.2), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(0,0,0,0.05)',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 10,
    right: 10,
    top: -9,
    height: 18,
    borderRadius: '10px 10px 5px 5px',
    background: 'linear-gradient(180deg, #e0c9a8 0%, #c4a06a 42%, #8b6914 100%)',
    boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.35), 0 3px 6px rgba(0,0,0,0.35)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: -9,
    height: 18,
    borderRadius: '5px 5px 10px 10px',
    background: 'linear-gradient(0deg, #e0c9a8 0%, #c4a06a 42%, #8b6914 100%)',
    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.12), 0 -3px 6px rgba(0,0,0,0.25)',
    pointerEvents: 'none',
  },
};

const ACTIVITY_SCROLL_TEXT_PRIMARY_SX = { color: '#3e2723', fontWeight: 600 };
const ACTIVITY_SCROLL_TEXT_SECONDARY_SX = { color: '#5d4037', mt: 0.5 };

/** Skills tab — Star rewards block: deep purple night sky with scattered starfield. */
const STAR_REWARDS_GALAXY_SX = {
  mt: 3,
  mb: 2,
  p: 1.5,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  borderRadius: 2,
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(186, 104, 255, 0.45)',
  background: 'linear-gradient(165deg, #060214 0%, #12082a 22%, #1e1048 48%, #0d0630 78%, #050210 100%)',
  boxShadow:
    'inset 0 0 120px rgba(75, 0, 130, 0.35), inset 0 -40px 80px rgba(0, 0, 0, 0.45), 0 8px 40px rgba(48, 25, 92, 0.55)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    opacity: 0.92,
    pointerEvents: 'none',
    backgroundImage: `radial-gradient(1.5px 1.5px at 6% 10%, rgba(255,255,255,0.95), transparent),
      radial-gradient(1px 1px at 14% 24%, rgba(220,230,255,0.9), transparent),
      radial-gradient(1px 1px at 91% 7%, rgba(255,255,255,0.88), transparent),
      radial-gradient(2px 2px at 52% 5%, rgba(255,248,220,0.85), transparent),
      radial-gradient(1px 1px at 33% 42%, rgba(255,255,255,0.78), transparent),
      radial-gradient(1px 1px at 71% 36%, rgba(210,200,255,0.85), transparent),
      radial-gradient(1px 1px at 9% 58%, rgba(255,255,255,0.72), transparent),
      radial-gradient(1px 1px at 87% 52%, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 44% 16%, rgba(255,255,255,0.65), transparent),
      radial-gradient(1px 1px at 68% 68%, rgba(255,255,255,0.82), transparent),
      radial-gradient(1px 1px at 24% 86%, rgba(190,220,255,0.75), transparent),
      radial-gradient(1px 1px at 79% 20%, rgba(255,255,255,0.68), transparent),
      radial-gradient(1.5px 1.5px at 56% 58%, rgba(255,255,255,0.92), transparent),
      radial-gradient(1px 1px at 3% 40%, rgba(255,255,255,0.6), transparent),
      radial-gradient(1px 1px at 96% 34%, rgba(230,210,255,0.78), transparent),
      radial-gradient(1px 1px at 38% 94%, rgba(255,255,255,0.76), transparent),
      radial-gradient(1px 1px at 63% 11%, rgba(255,255,255,0.7), transparent),
      radial-gradient(1px 1px at 19% 50%, rgba(255,255,255,0.62), transparent),
      radial-gradient(1px 1px at 84% 76%, rgba(255,255,255,0.8), transparent),
      radial-gradient(1px 1px at 47% 35%, rgba(255,255,255,0.58), transparent),
      radial-gradient(1px 1px at 72% 88%, rgba(200,180,255,0.7), transparent),
      radial-gradient(1px 1px at 11% 78%, rgba(255,255,255,0.66), transparent)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'radial-gradient(ellipse 90% 55% at 50% 115%, rgba(138, 43, 226, 0.22), transparent 52%), radial-gradient(ellipse 60% 40% at 20% 30%, rgba(103, 58, 183, 0.12), transparent 50%), radial-gradient(ellipse 50% 35% at 80% 25%, rgba(147, 51, 234, 0.1), transparent 45%)',
  },
};

/** Star jar interior (Overview + Skills Home) — same night sky + starfield as Skills rewards panels. */
const STAR_JAR_GALAXY_INNER_SX = {
  borderColor: 'rgba(186, 104, 255, 0.45)',
  bgcolor: 'transparent',
  background: 'linear-gradient(165deg, #060214 0%, #12082a 22%, #1e1048 48%, #0d0630 78%, #050210 100%)',
  boxShadow:
    'inset 0 0 80px rgba(75, 0, 130, 0.35), inset 0 -40px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
  '&::before': STAR_REWARDS_GALAXY_SX['&::before'],
  '&::after': STAR_REWARDS_GALAXY_SX['&::after'],
};

/** Chores tab — coin rewards store: rich gold panel (layout mirrors Skills STAR_REWARDS_GALAXY_SX). */
const CHORE_REWARDS_GOLD_SX = {
  mt: 3,
  mb: 2,
  p: 1.5,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  borderRadius: 2,
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(180, 130, 0, 0.5)',
  background: 'linear-gradient(155deg, #fffdf5 0%, #fff3c4 14%, #ffe082 38%, #ffc107 68%, #e6a000 100%)',
  boxShadow:
    'inset 0 0 100px rgba(212, 168, 40, 0.28), inset 0 -36px 72px rgba(153, 98, 0, 0.2), 0 8px 36px rgba(166, 115, 0, 0.32)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    opacity: 0.55,
    pointerEvents: 'none',
    backgroundImage: `radial-gradient(1.5px 1.5px at 8% 10%, rgba(255,255,255,0.95), transparent),
      radial-gradient(1px 1px at 18% 26%, rgba(255,255,255,0.55), transparent),
      radial-gradient(1px 1px at 88% 12%, rgba(255,248,220,0.7), transparent),
      radial-gradient(2px 2px at 52% 6%, rgba(255,255,255,0.5), transparent),
      radial-gradient(1px 1px at 36% 48%, rgba(255,255,255,0.4), transparent),
      radial-gradient(1px 1px at 72% 38%, rgba(255,235,180,0.55), transparent),
      radial-gradient(1px 1px at 12% 62%, rgba(255,255,255,0.38), transparent),
      radial-gradient(1px 1px at 64% 78%, rgba(255,255,255,0.45), transparent),
      radial-gradient(1px 1px at 92% 58%, rgba(255,255,255,0.42), transparent),
      radial-gradient(1px 1px at 44% 88%, rgba(255,255,255,0.35), transparent)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'radial-gradient(ellipse 88% 52% at 50% 118%, rgba(200, 140, 0, 0.28), transparent 54%), radial-gradient(ellipse 58% 42% at 18% 28%, rgba(255, 255, 255, 0.22), transparent 48%), radial-gradient(ellipse 48% 36% at 82% 22%, rgba(255, 220, 120, 0.15), transparent 45%)',
  },
};

const PENDING_CHORE_REWARD_EMPTY_GOLD_SX = {
  border: '1px solid rgba(153, 98, 0, 0.45)',
  borderRadius: 1.5,
  bgcolor: 'rgba(255, 255, 255, 0.42)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 12px rgba(166,115,0,0.12)',
  justifyContent: 'center',
  alignItems: 'center',
  alignContent: 'center',
  minHeight: 100,
  py: 1.5,
  display: 'flex',
};

const CHORE_REWARD_REDEEM_BUTTON_SX = {
  textTransform: 'none',
  fontWeight: 600,
  color: '#1a1200 !important',
  background: 'linear-gradient(180deg, rgba(255, 228, 130, 0.98) 0%, rgba(218, 165, 32, 0.95) 100%)',
  border: '1px solid rgba(120, 80, 0, 0.42)',
  '&:hover': {
    background: 'linear-gradient(180deg, rgba(255, 240, 180, 1) 0%, rgba(235, 185, 50, 0.98) 100%)',
  },
  '&.Mui-disabled': {
    color: 'rgba(0,0,0,0.38) !important',
  },
};

/** Showcase grid: stars + skill achievements — same night-sky treatment as Skills leaderboard. */
const SHOWCASE_GALAXY_PANEL_SX = {
  ...STAR_REWARDS_GALAXY_SX,
  mt: 0,
  mb: 0,
  p: 2,
  width: '100%',
  height: '100%',
  minHeight: 0,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  color: '#ede7ff',
  '& .MuiTypography-root': { color: 'rgba(255,255,255,0.92) !important' },
  '& .MuiTypography-root.MuiTypography-caption': { color: 'rgba(255,255,255,0.65) !important' },
};

/** Skills tab category cards (Agility, Cleaning, …): galaxy panel + optional favourite-color left rail in render. */
const SKILL_CATEGORY_GALAXY_CARD_SX = {
  marginTop: 1,
  borderRadius: 2,
  overflow: 'hidden',
  border: '1px solid rgba(186, 104, 255, 0.42)',
  background: 'linear-gradient(165deg, #040210 0%, #0c0820 32%, #140f3a 62%, #080618 100%)',
  boxShadow:
    'inset 0 0 96px rgba(75, 0, 130, 0.32), 0 8px 32px rgba(48, 25, 92, 0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    opacity: 0.55,
    pointerEvents: 'none',
    backgroundImage: `radial-gradient(1.5px 1.5px at 8% 12%, rgba(255,255,255,0.85), transparent),
      radial-gradient(1px 1px at 22% 28%, rgba(220,230,255,0.75), transparent),
      radial-gradient(1px 1px at 78% 18%, rgba(255,255,255,0.65), transparent),
      radial-gradient(1px 1px at 55% 8%, rgba(255,248,220,0.55), transparent),
      radial-gradient(1px 1px at 40% 72%, rgba(200,180,255,0.5), transparent),
      radial-gradient(1px 1px at 88% 55%, rgba(255,255,255,0.55), transparent),
      radial-gradient(1px 1px at 12% 65%, rgba(255,255,255,0.45), transparent),
      radial-gradient(1px 1px at 50% 88%, rgba(190,220,255,0.45), transparent)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background:
      'radial-gradient(ellipse 90% 55% at 50% 115%, rgba(138, 43, 226, 0.18), transparent 52%), radial-gradient(ellipse 60% 40% at 20% 30%, rgba(103, 58, 183, 0.12), transparent 50%)',
  },
};

const SKILLS_PURPLE_CTA_BUTTON_SX = {
  textTransform: 'none',
  fontWeight: 600,
  color: '#fff !important',
  background: 'linear-gradient(180deg, rgba(186, 104, 255, 0.95) 0%, rgba(103, 58, 183, 0.92) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.22)',
  '&:hover': {
    background: 'linear-gradient(180deg, rgba(206, 124, 255, 0.98) 0%, rgba(123, 78, 203, 0.95) 100%)',
  },
};

// Shared XP progress bar styling so Overview and Players sections look the same
const XP_PROGRESS_BAR_SX = { flex: 1, minWidth: 80, maxWidth: 280, height: 6, borderRadius: 1 };
const XP_PROGRESS_CONTAINER_SX = { display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: '1 1 140px', maxWidth: 220 };
const deepEqualJson = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch (_) {
    return false;
  }
};

/** Readable #000 / #fff for text on a 6-digit hex background (Weekly Review XP cards, etc.). */
function contrastingTextOnHex6(hex) {
  const m = typeof hex === 'string' && /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#fff';
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const y = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return y > 0.62 ? '#111' : '#fff';
}

function countTaskCompletionsForPlayer(xpGrantLog, playerName, taskId) {
  if (!playerName || !taskId) return 0;
  return xpGrantLog.filter((e) => e && e.playerName === playerName && e.taskId === taskId).length;
}

function countChoreCompletionsForPlayer(choreActivity, playerName, choreId) {
  if (!playerName || !choreId) return 0;
  return choreActivity.filter((e) => e && e.playerName === playerName && e.choreId === choreId).length;
}

function isSkillAchievementDef(def) {
  return def && def.kind !== 'chore';
}

function isChoreAchievementDef(def) {
  return def && def.kind === 'chore';
}

const SHOWCASE_BLOCK_IDS = ['skillAchievements', 'choreAchievements', 'skillsShowcase', 'streak', 'coins', 'stars'];
/** Horizontal grid resolution — tiles can be placed and resized to any width from 1..SHOWCASE_GRID_COLS. */
const SHOWCASE_GRID_COLS = 24;
/** Minimum width in grid units (1 = one column; narrowest resize stop). */
const SHOWCASE_MIN_TILE_W = 1;
/** Must match ShowcaseGridLayout gridConfig (used to convert measured px → rows). */
const SHOWCASE_ROW_HEIGHT = 26;
const SHOWCASE_MARGIN_Y = 10;
const SHOWCASE_LAYOUT_VERSION = 2;

/** Fallback min rows when layout has no measured minH yet (matches typical content). */
function showcaseMinHBaseline(blockId, raw) {
  const r = raw || {};
  switch (blockId) {
    case 'stars':
    case 'coins':
      return 6;
    case 'streak':
      return 4;
    case 'skillsShowcase': {
      const n = Math.max(0, (r.showcaseSkillNames || []).length);
      return Math.max(4, 4 + Math.ceil(n * 1.5));
    }
    case 'skillAchievements': {
      const n = (r.skillAchievementIds || []).length;
      return n === 0 ? 4 : Math.max(4, 4 + Math.ceil(n * 2.2));
    }
    case 'choreAchievements': {
      const n = (r.choreAchievementIds || []).length;
      return n === 0 ? 4 : Math.max(4, 4 + Math.ceil(n * 2.2));
    }
    default:
      return 4;
  }
}

function showcasePxToGridRows(heightPx) {
  const pitch = SHOWCASE_ROW_HEIGHT + SHOWCASE_MARGIN_Y;
  return Math.max(1, Math.ceil((heightPx + SHOWCASE_MARGIN_Y) / pitch));
}

function migrateLayoutFrom12To24(layout, raw = null) {
  return layout.map((l) => ({
    ...l,
    x: (l.x || 0) * 2,
    w: (l.w || 1) * 2,
    minW: SHOWCASE_MIN_TILE_W,
    minH: Math.max(
      1,
      typeof l.minH === 'number' && l.minH > 1 ? l.minH : showcaseMinHBaseline(l.i, raw)
    ),
    ...(l.maxW != null ? { maxW: l.maxW * 2 } : {}),
  }));
}

/** True if coordinates cannot be expressed on a 12-col grid (already 24-col or wider). */
function layoutUsesWideGridCoordinates(layout) {
  return layout.some((l) => (l.x || 0) >= 12 || (l.w || 0) > 12 || (l.x || 0) + (l.w || 0) > 12);
}

function defaultShowcaseLayout() {
  const empty = {};
  return [
    { i: 'stars', x: 0, y: 0, w: 8, h: 6, minW: SHOWCASE_MIN_TILE_W, minH: showcaseMinHBaseline('stars', empty) },
    { i: 'streak', x: 8, y: 0, w: 8, h: 6, minW: SHOWCASE_MIN_TILE_W, minH: showcaseMinHBaseline('streak', empty) },
    { i: 'coins', x: 16, y: 0, w: 8, h: 6, minW: SHOWCASE_MIN_TILE_W, minH: showcaseMinHBaseline('coins', empty) },
    { i: 'skillAchievements', x: 0, y: 6, w: 12, h: 5, minW: SHOWCASE_MIN_TILE_W, minH: showcaseMinHBaseline('skillAchievements', empty) },
    { i: 'choreAchievements', x: 12, y: 6, w: 12, h: 5, minW: SHOWCASE_MIN_TILE_W, minH: showcaseMinHBaseline('choreAchievements', empty) },
    { i: 'skillsShowcase', x: 0, y: 11, w: 24, h: 4, minW: SHOWCASE_MIN_TILE_W, minH: showcaseMinHBaseline('skillsShowcase', empty) },
  ];
}

function migrateOrderToLayout(order) {
  const heights = { skillAchievements: 4, choreAchievements: 4, skillsShowcase: 4, streak: 4, coins: 6, stars: 6 };
  let y = 0;
  return order.filter((id) => SHOWCASE_BLOCK_IDS.includes(id)).map((id) => {
    const h = heights[id] || 4;
    const row = { i: id, x: 0, y, w: SHOWCASE_GRID_COLS, h, minW: SHOWCASE_MIN_TILE_W, minH: showcaseMinHBaseline(id, {}) };
    y += h;
    return row;
  });
}

function mergeLayoutMissing(layout, fullWidthCols = SHOWCASE_GRID_COLS, raw = null) {
  const seen = new Set((layout || []).map((l) => l.i));
  const merged = (layout || []).map((l) => {
    const baseline = showcaseMinHBaseline(l.i, raw);
    const explicit = typeof l.minH === 'number' && l.minH > 1 ? l.minH : null;
    return {
      ...l,
      minW: SHOWCASE_MIN_TILE_W,
      minH: Math.max(1, explicit != null ? explicit : baseline),
    };
  });
  let maxY = merged.reduce((m, l) => Math.max(m, (l.y || 0) + (l.h || 0)), 0);
  SHOWCASE_BLOCK_IDS.forEach((id) => {
    if (!seen.has(id)) {
      merged.push({
        i: id,
        x: 0,
        y: maxY,
        w: fullWidthCols,
        h: 4,
        minW: SHOWCASE_MIN_TILE_W,
        minH: showcaseMinHBaseline(id, raw),
      });
      maxY += 4;
    }
  });
  return merged;
}

function normalizeShowcaseConfig(raw) {
  let layout;
  if (Array.isArray(raw?.layout) && raw.layout.length > 0) {
    const explicitNew = raw.gridCols === SHOWCASE_GRID_COLS || raw.layoutVersion === SHOWCASE_LAYOUT_VERSION;
    const wideCoords = layoutUsesWideGridCoordinates(raw.layout);
    const useLegacy12 = !explicitNew && !wideCoords;
    layout = mergeLayoutMissing(raw.layout, useLegacy12 ? 12 : SHOWCASE_GRID_COLS, raw);
    if (useLegacy12) {
      layout = migrateLayoutFrom12To24(layout, raw);
    }
  } else if (Array.isArray(raw?.order) && raw.order.length > 0) {
    layout = mergeLayoutMissing(migrateOrderToLayout(raw.order), SHOWCASE_GRID_COLS, raw);
  } else {
    layout = defaultShowcaseLayout();
  }
  return {
    layout,
    gridCols: SHOWCASE_GRID_COLS,
    layoutVersion: SHOWCASE_LAYOUT_VERSION,
    skillAchievementIds: Array.isArray(raw?.skillAchievementIds) ? raw.skillAchievementIds.slice(0, 5) : [],
    choreAchievementIds: Array.isArray(raw?.choreAchievementIds) ? raw.choreAchievementIds.slice(0, 5) : [],
    showcaseSkillNames: Array.isArray(raw?.showcaseSkillNames) ? raw.showcaseSkillNames.slice(0, 3) : [],
    showcaseUpdatedAt: typeof raw?.showcaseUpdatedAt === 'number' ? raw.showcaseUpdatedAt : 0,
  };
}

function ShowcaseMeasuredTile({ itemId, layoutRef, onLayoutChangeRef, renderBlock }) {
  const handleRef = useRef(null);
  const contentRef = useRef(null);

  const measureAndReport = useCallback(() => {
    const hEl = handleRef.current?.offsetHeight ?? 0;
    const cEl = contentRef.current;
    if (!cEl) return;
    const BORDER_V = 2;
    const totalPx = hEl + cEl.scrollHeight + BORDER_V;
    const rows = showcasePxToGridRows(totalPx);
    const layout = layoutRef.current;
    const cur = layout.find((l) => l.i === itemId);
    if (!cur) return;
    const nextH = Math.max(cur.h, rows);
    if (cur.minH === rows && cur.h >= rows) return;
    onLayoutChangeRef.current(
      layout.map((l) => (l.i === itemId ? { ...l, minH: rows, h: nextH } : l))
    );
  }, [itemId]);

  useLayoutEffect(() => {
    const cEl = contentRef.current;
    const hEl = handleRef.current;
    if (!cEl) return undefined;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(measureAndReport);
    });
    ro.observe(cEl);
    if (hEl) ro.observe(hEl);
    requestAnimationFrame(measureAndReport);
    return () => ro.disconnect();
  }, [measureAndReport]);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        ref={handleRef}
        className="showcase-drag-handle"
        sx={{
          cursor: 'grab',
          flexShrink: 0,
          px: 1,
          py: 0.4,
          bgcolor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      />
      <Box ref={contentRef} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {renderBlock(itemId)}
      </Box>
    </Box>
  );
}

function ShowcaseGridLayout({ layout, gridCols, onLayoutChange, renderBlock }) {
  const ref = useRef(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const onLayoutChangeRef = useRef(onLayoutChange);
  onLayoutChangeRef.current = onLayoutChange;
  const [width, setWidth] = useState(1024);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(w);
    };
    measure();
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cols = gridCols ?? SHOWCASE_GRID_COLS;
  return (
    <Box ref={ref} sx={{ width: '100%' }}>
      <GridLayout
        width={width}
        gridConfig={{
          cols,
          rowHeight: SHOWCASE_ROW_HEIGHT,
          margin: [10, SHOWCASE_MARGIN_Y],
          containerPadding: [0, 0],
          maxRows: Infinity,
        }}
        dragConfig={{
          enabled: true,
          handle: '.showcase-drag-handle',
          threshold: 0,
        }}
        resizeConfig={{
          enabled: true,
          handles: ['se', 'w', 'nw', 'sw'],
        }}
        compactor={SHOWCASE_GRID_COMPACTOR}
        layout={layout}
        onLayoutChange={onLayoutChange}
      >
        {layout.map((item) => (
          <div key={item.i}>
            <ShowcaseMeasuredTile
              itemId={item.i}
              layoutRef={layoutRef}
              onLayoutChangeRef={onLayoutChangeRef}
              renderBlock={renderBlock}
            />
          </div>
        ))}
      </GridLayout>
    </Box>
  );
}

const CHORE_ROOMS = ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Laundry'];

const STORAGE_TAB_TOP = 'wonderful-game-tab-top';
const STORAGE_TAB_SKILLS_LEFT = 'wonderful-game-tab-skills-left';
const STORAGE_TAB_CHORE_LEFT = 'wonderful-game-tab-chore-left';
const STORAGE_TAB_CHORE_ROOM = 'wonderful-game-tab-chore-room';

const VALID_TOP_TABS = ['showcase', 'rules', 'skills', 'chores'];
const VALID_SKILLS_LEFT_TABS = ['home', 'skills', 'tasks', 'board', 'activity', 'achievements', 'rewards', 'redeemedRewards', 'rewardRequests'];
const VALID_CHORE_LEFT_TABS = ['chores', 'skills', 'board', 'activity', 'achievements', 'rewards', 'redeemedRewards', 'rewardRequests'];
const REDEEMED_REWARDS_PAGE_SIZE = 10;

function readStoredTab(key, validSet, fallback) {
  try {
    if (typeof window === 'undefined') return fallback;
    const v = localStorage.getItem(key);
    if (v && validSet.includes(v)) return v;
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Star/coin store rewards may set visibleToPlayerNames (string[]). Missing or empty = everyone can see it. */
function rewardIsVisibleToPlayer(reward, playerName) {
  if (!reward || typeof playerName !== 'string' || !playerName.trim()) return false;
  const list = reward.visibleToPlayerNames;
  if (!Array.isArray(list) || list.length === 0) return true;
  return list.includes(playerName);
}

/** If absent or empty, all players may use the skill. */
function skillVisibleToPlayer(skill, playerName) {
  if (!skill || !playerName || typeof playerName !== 'string') return true;
  const list = skill.visibleToPlayerNames;
  if (!Array.isArray(list) || list.length === 0) return true;
  return list.includes(playerName);
}

/** Per sub-skill; missing key inherits skill-level visibility. */
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

function filterSkillForPlayer(skill, playerName) {
  if (!skill) return null;
  if (!playerName) return skill;
  if (!skillVisibleToPlayer(skill, playerName)) return null;
  const subs = Array.isArray(skill.subSkills) ? skill.subSkills : [];
  const filteredSubs = subs.filter((sub) => subSkillVisibleToPlayer(skill, sub, playerName));
  return { ...skill, subSkills: filteredSubs };
}

/** Drops skills with no visible sub-skills after filtering. */
function filterMergedSkillsForPlayer(mergedSkills, playerName) {
  if (!playerName) return mergedSkills;
  return mergedSkills
    .map((s) => filterSkillForPlayer(s, playerName))
    .filter((s) => s && (s.subSkills || []).filter(Boolean).length > 0);
}

const BEDROOM_ROOM = 'Bedroom';

/** Bedroom chores are per-player; other rooms are shared. Legacy Bedroom chores without bedroomOwner are visible to everyone. */
function isChoreVisibleForPlayer(chore, viewerPlayerName) {
  if (!chore || !viewerPlayerName) return chore?.room !== BEDROOM_ROOM;
  if (chore.room !== BEDROOM_ROOM) return true;
  if (!chore.bedroomOwner) return true;
  return chore.bedroomOwner === viewerPlayerName;
}

function canPlayerActOnBedroomChore(playerName, chore) {
  if (!chore || chore.room !== BEDROOM_ROOM) return true;
  if (!chore.bedroomOwner) return true;
  return chore.bedroomOwner === playerName;
}

function formatChoreRoomLabel(chore) {
  if (!chore) return '';
  if (chore.room === BEDROOM_ROOM && chore.bedroomOwner) {
    return `Bedroom (${chore.bedroomOwner})`;
  }
  return chore.room;
}

const CHORE_STAR_REWARD_BANNER_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.25,
  px: 0.85,
  py: 0.35,
  borderRadius: 1,
  fontSize: '0.72rem',
  fontWeight: 800,
  letterSpacing: '0.02em',
  color: '#4e342e',
  background: 'linear-gradient(180deg, #fffef9 0%, #ffe082 42%, #ffc107 100%)',
  border: '1px solid rgba(191, 124, 0, 0.95)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.08)',
  lineHeight: 1.2,
};

/** Max minutes that can be used in one screen-time session (mechanical timer scale). */
const SCREEN_TIME_MAX_MINUTES_PER_TURN = 60;

/** Screen time block on Rewards tab — matches Rewards Store gold. */
const SCREEN_TIME_REWARDS_GOLD_SX = {
  mb: 2.5,
  p: 2,
  borderRadius: 2,
  border: '2px solid rgba(191, 124, 0, 0.75)',
  background: 'linear-gradient(165deg, #fffdf6 0%, #fff0b0 35%, #ffd54f 72%, #ffb300 100%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -12px 28px rgba(180, 120, 0, 0.18), 0 4px 18px rgba(166, 115, 0, 0.28)',
  position: 'relative',
  overflow: 'hidden',
};

function ChoreStarRewardBanner({ chore }) {
  const n = Math.max(0, Number(chore?.starReward) || 0);
  if (n <= 0) return null;
  return (
    <Box component="span" sx={CHORE_STAR_REWARD_BANNER_SX} title="Pending stars when completed">
      <StarIcon sx={{ fontSize: 15, color: '#f9a825', filter: 'drop-shadow(0 0 1px rgba(180,100,0,0.35))' }} />
      {n}
    </Box>
  );
}

function ChoreCoinRewardBanner({ chore, effortCoinsByStar }) {
  const effort = Math.min(5, Math.max(1, Number(chore?.effortStars) || 1));
  const n = Math.max(0, Number(effortCoinsByStar?.[effort]) || 0);
  if (n <= 0) return null;
  return (
    <Box component="span" sx={CHORE_STAR_REWARD_BANNER_SX} title="Coins earned when completed">
      <Box
        component="img"
        src={COIN_PNG_SRC}
        alt=""
        sx={{ width: 16, height: 16, display: 'block', objectFit: 'contain', flexShrink: 0 }}
      />
      {n}
    </Box>
  );
}

const CHORE_PERIODS = ['daily', 'weekly', 'monthly'];
const CHORE_XP_BY_EFFORT = { 1: 25, 2: 50, 3: 100, 4: 150, 5: 250 };

function choreXpFromEffortStars(effort) {
  const e = Math.min(5, Math.max(1, Number(effort) || 1));
  return CHORE_XP_BY_EFFORT[e] ?? 25;
}

function normalizeChoreXpReward(c) {
  if (!c || typeof c !== 'object') return c;
  return { ...c, xpReward: choreXpFromEffortStars(c.effortStars) };
}

const svgBackground = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

const UNICORN_MAGIC_TILE = svgBackground(
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <g fill="#7b1fa2" opacity="0.07">
      <path d="M60 10 L63 22 L75 22 L65 30 L69 42 L60 35 L51 42 L55 30 L45 22 L57 22 Z"/>
      <circle cx="24" cy="88" r="2"/><circle cx="98" cy="72" r="1.8"/><circle cx="78" cy="28" r="1.5"/>
    </g>
  </svg>`
);

const CAT_PAW_TILE = svgBackground(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <g fill="#a67c52" opacity="0.16" transform="rotate(90 40 40)">
      <ellipse cx="40" cy="54" rx="12" ry="10" transform="rotate(-8 40 54)"/>
      <circle cx="28" cy="36" r="3"/><circle cx="40" cy="30" r="3"/><circle cx="52" cy="36" r="3"/><circle cx="40" cy="42" r="2.5"/>
    </g>
  </svg>`
);

const TRUCK_ROAD_TILE = svgBackground(
  `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <g stroke="#c62828" stroke-width="1.2" opacity="0.1" stroke-dasharray="6 10">
      <line x1="0" y1="35" x2="100" y2="35"/><line x1="0" y1="65" x2="100" y2="65"/>
    </g>
  </svg>`
);

/** Inline art for Tasks Left Today — theme-specific. */
function ChoreTasksLeftDecoration({ themeId }) {
  if (themeId === 'unicorns') {
    return (
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          right: 4,
          bottom: 6,
          width: 92,
          height: 92,
          opacity: 0.94,
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="choreUniHorn" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffe082" />
              <stop offset="100%" stopColor="#ffb300" />
            </linearGradient>
            <linearGradient id="choreUniBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8bbd0" />
              <stop offset="100%" stopColor="#ec407a" />
            </linearGradient>
          </defs>
          <path d="M50 8 L54 26 L46 24 Z" fill="url(#choreUniHorn)" />
          <ellipse cx="50" cy="54" rx="28" ry="22" fill="url(#choreUniBody)" />
          <ellipse cx="50" cy="38" rx="17" ry="15" fill="#fce4ec" />
          <ellipse cx="50" cy="36" rx="13" ry="11" fill="#fff" />
          <circle cx="43" cy="34" r="3.2" fill="#4a148c" />
          <circle cx="57" cy="34" r="3.2" fill="#4a148c" />
          <path d="M46 41 Q50 44 54 41" stroke="#ad1457" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <ellipse cx="36" cy="64" rx="6" ry="4" fill="#f48fb1" />
          <ellipse cx="64" cy="64" rx="6" ry="4" fill="#f48fb1" />
          <path d="M42 72 Q50 80 58 72" stroke="#c2185b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </Box>
    );
  }
  if (themeId === 'trucks') {
    return (
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          right: 8,
          bottom: 12,
          width: 80,
          height: 52,
          opacity: 0.92,
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 100 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(100 0) scale(-1 1)">
            <rect x="6" y="26" width="72" height="26" rx="4" fill="#c62828" />
            <rect x="44" y="12" width="40" height="18" rx="3" fill="#ef5350" />
            <rect x="52" y="16" width="12" height="10" fill="#b3e5fc" opacity="0.9" />
            <circle cx="28" cy="54" r="9" fill="#37474f" />
            <circle cx="28" cy="54" r="4.5" fill="#90a4ae" />
            <circle cx="74" cy="54" r="9" fill="#37474f" />
            <circle cx="74" cy="54" r="4.5" fill="#90a4ae" />
            <rect x="10" y="34" width="22" height="10" rx="1" fill="#ffcdd2" />
          </g>
        </svg>
      </Box>
    );
  }
  return null;
}

/** Decorative separator between stats row and coins — theme-specific (stars, trucks, mushrooms, waving paws). */
function ChoreThemeSectionSeparator({ themeId, accent }) {
  const borderCol = accent || 'rgba(0,0,0,0.12)';
  const n = 16;
  const waveDy = (i) => Math.sin(i * 0.55) * 9;


  const miniPaw = (i) => (
    <Box
      aria-hidden
      sx={{
        width: 26,
        height: 26,
        flexShrink: 0,
        transform: `translateY(${waveDy(i)}px)`,
        opacity: 0.88,
      }}
    >
      <svg viewBox="0 0 32 32" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(90 16 16)">
          <ellipse cx="16" cy="22" rx="7" ry="5.5" fill="#a67c52" transform="rotate(-6 16 22)" />
          <circle cx="11" cy="12" r="2.4" fill="#a67c52" />
          <circle cx="16" cy="9" r="2.4" fill="#a67c52" />
          <circle cx="21" cy="12" r="2.4" fill="#a67c52" />
          <circle cx="16" cy="15" r="2" fill="#a67c52" />
        </g>
      </svg>
    </Box>
  );

  const spreadSlotSx = {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  let content = null;
  if (themeId === 'unicorns') {
    content = (
      <>
        {[...Array(n)].map((_, i) => (
          <Box key={i} sx={spreadSlotSx}>
            <StarIcon
              sx={{
                fontSize: i % 2 === 0 ? 22 : 18,
                color: i % 3 === 0 ? '#ffc107' : '#9b59b6',
                opacity: 0.75 + (i % 4) * 0.05,
                flexShrink: 0,
                transform: `translateY(${Math.sin(i * 0.5) * 5}px)`,
                filter: 'drop-shadow(0 1px 2px rgba(123, 31, 162, 0.35))',
              }}
            />
          </Box>
        ))}
      </>
    );
  } else if (themeId === 'trucks') {
    const truckFacingRight = (i) => {
      const y = Math.sin(i * 0.45) * 5;
      const v = i % 4;
      return (
        <Box key={`t-${i}`} sx={{ ...spreadSlotSx, transform: `translateY(${y}px)` }}>
          <Box aria-hidden sx={{ width: 36, height: 24, flexShrink: 0, opacity: 0.92 }}>
            <svg viewBox="0 0 100 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(100 0) scale(-1 1)">
                {v === 0 && (
                  <>
                    <rect x="6" y="26" width="72" height="26" rx="4" fill="#c62828" />
                    <rect x="44" y="12" width="40" height="18" rx="3" fill="#ef5350" />
                    <rect x="52" y="16" width="12" height="10" fill="#b3e5fc" opacity="0.9" />
                    <circle cx="28" cy="54" r="9" fill="#37474f" />
                    <circle cx="28" cy="54" r="4.5" fill="#90a4ae" />
                    <circle cx="74" cy="54" r="9" fill="#37474f" />
                    <circle cx="74" cy="54" r="4.5" fill="#90a4ae" />
                    <rect x="10" y="34" width="22" height="10" rx="1" fill="#ffcdd2" />
                  </>
                )}
                {v === 1 && (
                  <>
                    <rect x="8" y="30" width="78" height="22" rx="3" fill="#1565c0" />
                    <rect x="8" y="18" width="52" height="16" rx="2" fill="#42a5f5" />
                    <rect x="14" y="22" width="14" height="9" fill="#e3f2fd" opacity="0.95" />
                    <circle cx="26" cy="54" r="8" fill="#37474f" />
                    <circle cx="26" cy="54" r="4" fill="#90a4ae" />
                    <circle cx="78" cy="54" r="8" fill="#37474f" />
                    <circle cx="78" cy="54" r="4" fill="#90a4ae" />
                  </>
                )}
                {v === 2 && (
                  <>
                    <rect x="4" y="32" width="88" height="18" rx="2" fill="#2e7d32" />
                    <rect x="6" y="28" width="78" height="6" fill="#66bb6a" />
                    <rect x="52" y="14" width="38" height="20" rx="3" fill="#388e3c" />
                    <rect x="58" y="18" width="12" height="8" fill="#c8e6c9" opacity="0.95" />
                    <circle cx="24" cy="52" r="8" fill="#37474f" />
                    <circle cx="24" cy="52" r="4" fill="#90a4ae" />
                    <circle cx="76" cy="52" r="8" fill="#37474f" />
                    <circle cx="76" cy="52" r="4" fill="#90a4ae" />
                  </>
                )}
                {v === 3 && (
                  <>
                    <rect x="6" y="24" width="34" height="30" rx="4" fill="#e65100" />
                    <rect x="38" y="20" width="52" height="34" rx="3" fill="#fb8c00" />
                    <rect x="44" y="26" width="16" height="12" fill="#ffe0b2" opacity="0.9" />
                    <circle cx="22" cy="56" r="9" fill="#37474f" />
                    <circle cx="22" cy="56" r="4.5" fill="#90a4ae" />
                    <circle cx="78" cy="56" r="9" fill="#37474f" />
                    <circle cx="78" cy="56" r="4.5" fill="#90a4ae" />
                  </>
                )}
              </g>
            </svg>
          </Box>
        </Box>
      );
    };
    content = <>{[...Array(11)].map((_, i) => truckFacingRight(i))}</>;
  } else if (themeId === 'mushrooms') {
    const mushroomGlyph = (i) => {
      const glyphs = ['🍄', '🍄\u200d🟫', '🍄', '🌿', '🍄\u200d🟫', '🍄', '🍂', '🍄\u200d🟫'];
      return glyphs[i % glyphs.length];
    };
    content = (
      <>
        {[...Array(14)].map((_, i) => (
          <Box key={i} sx={spreadSlotSx}>
            <Typography
              component="span"
              sx={{
                fontSize: '1.45rem',
                lineHeight: 1,
                flexShrink: 0,
                userSelect: 'none',
                transform: `translateY(${Math.sin(i * 0.48) * 4}px)`,
              }}
              aria-hidden
            >
              {mushroomGlyph(i)}
            </Typography>
          </Box>
        ))}
      </>
    );
  } else if (themeId === 'cats') {
    content = (
      <>
        {[...Array(18)].map((_, i) => (
          <Box key={`p-${i}`} sx={spreadSlotSx}>
            {miniPaw(i)}
          </Box>
        ))}
      </>
    );
  } else {
    content = (
      <Box sx={{ flex: '1 1 auto', width: '100%', height: 2, bgcolor: borderCol, borderRadius: 1, opacity: 0.5 }} />
    );
  }

  return (
    <Box
      aria-hidden
      sx={{
        width: 'calc(100% + 32px)',
        maxWidth: 'none',
        alignSelf: 'stretch',
        mx: -2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        rowGap: 1,
        columnGap: 0,
        py: 1.25,
        px: 1,
        my: 1.5,
        borderTop: `2px solid ${borderCol}`,
        borderBottom: `2px solid ${borderCol}`,
        borderRadius: 1,
        bgcolor: 'rgba(255,255,255,0.42)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
      }}
    >
      {content}
    </Box>
  );
}

const CHORE_THEMES = [
  {
    id: 'unicorns',
    label: 'Unicorns & Flowers',
    emoji: '🦄🌸',
    background: `linear-gradient(165deg, #e8e0ff 0%, #ddd0ff 38%, #d0c0f8 72%, #c4b0f0 100%), ${UNICORN_MAGIC_TILE}`,
    panelBackgroundSize: 'auto, 120px 120px',
    panelBackgroundRepeat: 'no-repeat, repeat',
    accent: '#8e24aa',
    questBorder: '#8e24aa',
    questBg: 'rgba(255,255,255,0.94)',
    textColor: '#311b45',
    mutedTextColor: '#5e3d72',
    tasksLeftCardSx: {
      background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245, 235, 255, 0.98) 40%, rgba(230, 210, 255, 0.96) 100%)',
      border: '2px solid #9b59b6',
      boxShadow: '0 8px 24px rgba(123, 31, 162, 0.28), inset 0 1px 0 rgba(255,255,255,0.95)',
      '& .MuiTypography-root': { color: '#4a148c !important' },
    },
  },
  {
    id: 'trucks',
    label: 'Trucks',
    emoji: '🚚🛻',
    background: `linear-gradient(145deg, #fff5f5 0%, #ffe8e8 45%, #ffd9d9 100%), ${TRUCK_ROAD_TILE}`,
    panelBackgroundSize: 'auto, 100px 100px',
    panelBackgroundRepeat: 'no-repeat, repeat',
    accent: '#c62828',
    questBorder: '#e57373',
    questBg: 'rgba(255,255,255,0.9)',
    textColor: '#4a1515',
    mutedTextColor: '#6d3333',
    tasksLeftCardSx: {
      background: 'linear-gradient(155deg, #fffbfb 0%, #ffecec 50%, #ffd6d6 100%)',
      border: '2px solid #ef5350',
      boxShadow: '0 6px 20px rgba(198, 40, 40, 0.22), inset 0 1px 0 rgba(255,255,255,0.9)',
      '& .MuiTypography-root': { color: '#b71c1c !important' },
    },
  },
  {
    id: 'mushrooms',
    label: 'Mushrooms',
    emoji: '🍄🌿',
    background: 'linear-gradient(135deg, #f0ffe8 0%, #dff5d0 55%, #d0edc4 100%)',
    accent: '#558b2f',
    questBorder: '#6a994e',
    questBg: 'rgba(255,255,255,0.88)',
    textColor: '#263d1a',
    mutedTextColor: '#3d5c28',
    tasksLeftCardSx: {
      background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(235, 255, 225, 0.95) 100%)',
      border: '2px solid #7cb342',
      boxShadow: '0 6px 18px rgba(85, 139, 47, 0.2), inset 0 1px 0 rgba(255,255,255,0.85)',
      '& .MuiTypography-root': { color: '#33691e !important' },
    },
  },
  {
    id: 'cats',
    label: 'Cats',
    emoji: '🐱🐾',
    background: `linear-gradient(135deg, #fffaf6 0%, #fff3e8 50%, #ffeada 100%), ${CAT_PAW_TILE}`,
    panelBackgroundSize: 'auto, 80px 80px',
    panelBackgroundRepeat: 'no-repeat, repeat',
    accent: '#bf6c2e',
    questBorder: '#d7a574',
    questBg: 'rgba(255,255,255,0.9)',
    textColor: '#3d2818',
    mutedTextColor: '#5c4030',
    tasksLeftCardSx: {
      background: `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255, 248, 240, 0.96) 100%), ${CAT_PAW_TILE}`,
      backgroundSize: 'auto, 56px 56px',
      backgroundRepeat: 'no-repeat, repeat',
      border: '2px solid #d7a574',
      boxShadow: '0 6px 18px rgba(191, 108, 46, 0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
      '& .MuiTypography-root': { color: '#5d4037 !important' },
    },
  },
];

const getTodayKey = (date = new Date()) => date.toISOString().slice(0, 10);
const getWeekKey = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};
const getMonthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const getQuarterKey = (date = new Date()) => `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;

const getPeriodKey = (schedule, date = new Date()) => {
  if (schedule === 'monthly') return getMonthKey(date);
  if (schedule === 'weekly') return getWeekKey(date);
  return getTodayKey(date);
};

function reorderAchievementIds(ids, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= ids.length ||
    toIndex >= ids.length
  ) {
    return ids;
  }
  const next = [...ids];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

const SKILL_ACH_DRAG = 'application/x-showcase-skill-ach';
const CHORE_ACH_DRAG = 'application/x-showcase-chore-ach';

function ShowcaseSkillAchievementsPanel({ ids, onIdsChange, defs, playerName, xpGrantLog, tasks, variant = 'default' }) {
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const open = Boolean(pickerAnchor);
  const isGalaxy = variant === 'galaxy';

  const handleToggle = (id) => {
    if (ids.includes(id)) {
      onIdsChange(ids.filter((x) => x !== id));
    } else if (ids.length < 5) {
      onIdsChange([...ids, id]);
    }
  };

  const ordered = ids.map((id) => defs.find((d) => d.id === id)).filter(Boolean);

  const onDragStart = (e, index) => {
    e.dataTransfer.setData(SKILL_ACH_DRAG, String(index));
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData(SKILL_ACH_DRAG));
    if (Number.isNaN(from) || from === dropIndex) return;
    onIdsChange(reorderAchievementIds(ids, from, dropIndex));
  };

  return (
    <Box sx={isGalaxy ? SHOWCASE_GALAXY_PANEL_SX : { p: 2, pt: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1">Skill Achievements</Typography>
        <IconButton
          size="small"
          onClick={(e) => setPickerAnchor(e.currentTarget)}
          aria-label="Choose Skill Achievements"
          sx={isGalaxy ? { color: 'rgba(255,255,255,0.92)' } : undefined}
        >
          <Settings fontSize="small" />
        </IconButton>
      </Box>
      <Popover
        open={open}
        anchorEl={pickerAnchor}
        onClose={() => setPickerAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, maxWidth: 380, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Choose up to five achievements (unlocked or in progress). Drag the cards in the showcase to reorder them.
          </Typography>
          <FormGroup>
            {defs.map((def) => (
              <FormControlLabel
                key={def.id}
                control={
                  <Checkbox
                    size="small"
                    checked={ids.includes(def.id)}
                    onChange={() => handleToggle(def.id)}
                    disabled={!ids.includes(def.id) && ids.length >= 5}
                  />
                }
                label={def.name}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>
      {ordered.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={isGalaxy ? { color: 'rgba(255,255,255,0.65) !important' } : undefined}>
          Use the gear to choose achievements.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', overflowX: 'auto', py: 0.5, alignItems: 'stretch' }}>
          {ordered.map((def, index) => {
            const count = countTaskCompletionsForPlayer(xpGrantLog, playerName, def.taskId);
            const thr = Math.max(1, Number(def.threshold) || 1);
            const unlocked = count >= thr;
            const task = tasks.find((t) => t.id === def.taskId);
            const taskLabel = task ? task.title : (def.taskId ? 'Unknown task' : '—');
            return (
              <Paper
                key={def.id}
                elevation={0}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
                sx={{
                  flex: '0 0 auto',
                  width: 220,
                  minHeight: 120,
                  p: 1.25,
                  cursor: 'grab',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  ...(isGalaxy && {
                    bgcolor: 'rgba(16, 8, 40, 0.55)',
                    borderColor: 'rgba(186, 104, 255, 0.38)',
                    '& .MuiTypography-root': { color: 'rgba(255,255,255,0.9) !important' },
                  }),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                  <DragIndicatorIcon sx={{ fontSize: 18, color: isGalaxy ? 'rgba(255,255,255,0.35)' : 'text.disabled' }} />
                  {unlocked ? <EmojiEventsIcon sx={{ color: isGalaxy ? '#ffca28' : 'warning.main', fontSize: 22 }} /> : <LockOutlinedIcon color="disabled" sx={{ fontSize: 22, ...(isGalaxy && { color: 'rgba(255,255,255,0.35) !important' }) }} />}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>{def.name}</Typography>
                {def.unlockMessage ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{def.unlockMessage}</Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 'auto' }}>
                  Task: {taskLabel} · {unlocked ? 'Unlocked' : `${count} / ${thr}`}
                </Typography>
                <Chip size="small" label={unlocked ? 'Unlocked' : `${count}/${thr}`} color={unlocked ? 'success' : 'default'} variant={unlocked ? 'filled' : 'outlined'} sx={{ alignSelf: 'flex-start' }} />
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function ShowcaseChoreAchievementsPanel({ ids, onIdsChange, defs, playerName, choreActivity, chores, variant = 'default' }) {
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const open = Boolean(pickerAnchor);
  const isGold = variant === 'gold';

  const handleToggle = (id) => {
    if (ids.includes(id)) {
      onIdsChange(ids.filter((x) => x !== id));
    } else if (ids.length < 5) {
      onIdsChange([...ids, id]);
    }
  };

  const ordered = ids.map((id) => defs.find((d) => d.id === id)).filter(Boolean);

  const onDragStart = (e, index) => {
    e.dataTransfer.setData(CHORE_ACH_DRAG, String(index));
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData(CHORE_ACH_DRAG));
    if (Number.isNaN(from) || from === dropIndex) return;
    onIdsChange(reorderAchievementIds(ids, from, dropIndex));
  };

  return (
    <Box sx={isGold ? SHOWCASE_GOLD_PANEL_SX : { p: 2, pt: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
        <Typography variant="subtitle1">Chore Achievements</Typography>
        <IconButton
          size="small"
          onClick={(e) => setPickerAnchor(e.currentTarget)}
          aria-label="Choose Chore Achievements"
          sx={isGold ? { color: 'rgba(0,0,0,0.75)' } : undefined}
        >
          <Settings fontSize="small" />
        </IconButton>
      </Box>
      <Popover
        open={open}
        anchorEl={pickerAnchor}
        onClose={() => setPickerAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, maxWidth: 380, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Choose up to five achievements. Drag the cards in the showcase to reorder them.
          </Typography>
          <FormGroup>
            {defs.map((def) => (
              <FormControlLabel
                key={def.id}
                control={
                  <Checkbox
                    size="small"
                    checked={ids.includes(def.id)}
                    onChange={() => handleToggle(def.id)}
                    disabled={!ids.includes(def.id) && ids.length >= 5}
                  />
                }
                label={def.name}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>
      {ordered.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={isGold ? { color: 'rgba(0,0,0,0.65) !important' } : undefined}>
          Use the gear to choose achievements.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', overflowX: 'auto', py: 0.5, alignItems: 'stretch' }}>
          {ordered.map((def, index) => {
            const count = countChoreCompletionsForPlayer(choreActivity, playerName, def.choreId);
            const thr = Math.max(1, Number(def.threshold) || 1);
            const unlocked = count >= thr;
            const chore = chores.find((c) => c.id === def.choreId);
            const choreLabel = chore ? `${formatChoreRoomLabel(chore)}: ${chore.title}` : (def.choreId ? 'Unknown Chore' : '—');
            return (
              <Paper
                key={def.id}
                elevation={0}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, index)}
                sx={{
                  flex: '0 0 auto',
                  width: 220,
                  minHeight: 120,
                  p: 1.25,
                  cursor: 'grab',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                  ...(isGold && {
                    bgcolor: 'rgba(255,255,255,0.78)',
                    borderColor: 'rgba(153, 98, 0, 0.45)',
                  }),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                  <DragIndicatorIcon sx={{ fontSize: 18, color: isGold ? 'rgba(0,0,0,0.35)' : 'text.disabled' }} />
                  {unlocked ? <EmojiEventsIcon sx={{ color: isGold ? '#b8860b' : 'secondary.main', fontSize: 22 }} /> : <LockOutlinedIcon color="disabled" sx={{ fontSize: 22 }} />}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>{def.name}</Typography>
                {def.unlockMessage ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{def.unlockMessage}</Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 'auto' }}>
                  Chore: {choreLabel} · {unlocked ? 'Unlocked' : `${count} / ${thr}`}
                </Typography>
                <Chip size="small" label={unlocked ? 'Unlocked' : `${count}/${thr}`} color={unlocked ? 'success' : 'default'} variant={unlocked ? 'filled' : 'outlined'} sx={{ alignSelf: 'flex-start' }} />
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/** Display total: stars already counted into jar history (totalEarned) plus pending (earned, not yet banked). */
const totalStarsEarnedIncludingPending = (s) =>
  (Number(s?.totalEarned) || 0) + (Number(s?.pending) || 0);

const OVERVIEW_GOLDEN_JAR_PANEL_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  p: 1.5,
  mt: 1,
  width: '100%',
  border: '1px solid',
  borderColor: '#c49000',
  borderRadius: 2,
  background:
    'linear-gradient(145deg, rgba(255,246,186,0.95) 0%, rgba(255,214,74,0.85) 45%, rgba(224,165,20,0.9) 100%)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -8px 18px rgba(153,98,0,0.22), 0 6px 16px rgba(166,115,0,0.18)',
  position: 'relative',
  overflow: 'hidden',
  color: '#000',
  '& .MuiTypography-root': { color: '#000 !important' },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-20%',
    width: '55%',
    height: '100%',
    background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.52) 45%, rgba(255,255,255,0) 100%)',
    transform: 'skewX(-14deg)',
    pointerEvents: 'none',
  },
};

/** Showcase grid: coins + chore achievements — golden jar panel styling. */
const SHOWCASE_GOLD_PANEL_SX = {
  ...OVERVIEW_GOLDEN_JAR_PANEL_SX,
  mt: 0,
  p: 2,
  width: '100%',
  height: '100%',
  minHeight: 0,
  flex: 1,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
};

/** Pending coins (chores / overview) — matches golden panel, distinct from jar glass. */
const PENDING_COINS_ZONE_GOLD_SX = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 0.75,
  alignItems: 'flex-end',
  alignContent: 'flex-end',
  justifyContent: 'flex-start',
  minHeight: 140,
  p: 2,
  border: '1px solid rgba(153, 98, 0, 0.5)',
  borderRadius: 1.5,
  bgcolor: 'rgba(255, 255, 255, 0.58)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -2px 12px rgba(166,115,0,0.14)',
  width: '100%',
  boxSizing: 'border-box',
};

const JAR_LIP_SX = {
  height: 36,
  width: '100%',
  border: '2px solid',
  borderColor: '#263238',
  borderBottom: 'none',
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  bgcolor: '#37474f',
  boxSizing: 'border-box',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)',
};

const JAR_BODY_GLASS_SHELL_SX = {
  height: 150,
  width: '100%',
  border: '2px solid',
  borderColor: 'grey.600',
  borderTop: 'none',
  borderBottomLeftRadius: 36,
  borderBottomRightRadius: 36,
  bgcolor: 'rgba(245, 248, 252, 0.96)',
  boxSizing: 'border-box',
  p: 1.5,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -3px 12px rgba(0,0,0,0.06)',
};

/** Coin / non-star contents in overview jar — flex wrap. */
const JAR_BODY_GLASS_SX = {
  ...JAR_BODY_GLASS_SHELL_SX,
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-end',
  justifyContent: 'center',
  gap: 0.5,
};

/** Star jars: exactly 10 stars per row (wide layouts). */
const STAR_JAR_COLUMNS = 10;
const JAR_BODY_GLASS_STARS_SX = {
  ...JAR_BODY_GLASS_SHELL_SX,
  ...STAR_JAR_GALAXY_INNER_SX,
  display: 'grid',
  gridTemplateColumns: `repeat(${STAR_JAR_COLUMNS}, minmax(0, 1fr))`,
  gap: '4px',
  alignContent: 'end',
  justifyItems: 'center',
};

/** Overview Stars tab: same jar width as coins (160px) — 5 columns so stars fit. */
const OVERVIEW_STAR_JAR_WIDTH_PX = 160;
const OVERVIEW_STAR_JAR_COLUMNS = 5;
const OVERVIEW_STAR_JAR_BODY_SX = {
  ...JAR_BODY_GLASS_SHELL_SX,
  ...STAR_JAR_GALAXY_INNER_SX,
  display: 'grid',
  gridTemplateColumns: `repeat(${OVERVIEW_STAR_JAR_COLUMNS}, minmax(0, 1fr))`,
  gap: '4px',
  alignContent: 'end',
  justifyItems: 'center',
};

/** Full galaxy block for Overview star section (matches STAR_REWARDS_GALAXY_SX, light text). */
const OVERVIEW_STARS_SECTION_GALAXY_SX = {
  ...STAR_REWARDS_GALAXY_SX,
  mt: 0,
  mb: 0,
  p: 1.5,
  width: '100%',
  boxSizing: 'border-box',
  color: '#ede7ff',
  '& .MuiTypography-root': { color: 'rgba(255,255,255,0.92) !important' },
  '& .MuiTypography-root.MuiTypography-caption': { color: 'rgba(255,255,255,0.65) !important' },
};

/** Overview Stars tab: galaxy only (no gold frame) — same radius/padding as coin panel beneath for aligned columns. */
const OVERVIEW_STARS_GALAXY_ONLY_SX = {
  ...OVERVIEW_STARS_SECTION_GALAXY_SX,
  border: 'none',
  borderRadius: 2,
  boxShadow:
    'inset 0 0 120px rgba(75, 0, 130, 0.35), inset 0 -40px 80px rgba(0, 0, 0, 0.45), 0 4px 24px rgba(48, 25, 92, 0.45)',
};

/**
 * Chores Coins + Skills Star rewards: one jar size (larger than compact Overview jars).
 */
const CHORES_COINS_JAR_WIDTH_PX = 200;
/** Wider shell so 10 stars per row fit comfortably (see CHORES_STAR_JAR_BODY_SX). */
const CHORES_STAR_JAR_WIDTH_PX = 320;
const CHORES_COINS_JAR_LIP_SX = {
  height: 40,
  width: '100%',
  border: '2px solid',
  borderColor: '#263238',
  borderBottom: 'none',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  bgcolor: '#37474f',
  boxSizing: 'border-box',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.35)',
};
const CHORES_COINS_JAR_BODY_SHELL_SX = {
  height: 190,
  width: '100%',
  border: '2px solid',
  borderColor: 'grey.600',
  borderTop: 'none',
  borderBottomLeftRadius: 44,
  borderBottomRightRadius: 44,
  bgcolor: 'rgba(245, 248, 252, 0.96)',
  boxSizing: 'border-box',
  p: 1.5,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -3px 12px rgba(0,0,0,0.06)',
};

/** Coins in chores / overview large jar. */
const CHORES_COINS_JAR_BODY_SX = {
  ...CHORES_COINS_JAR_BODY_SHELL_SX,
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-end',
  justifyContent: 'center',
  gap: 0.5,
};

/** Stars in Skills Home / galaxy jar — 10 per row. */
const CHORES_STAR_JAR_BODY_SX = {
  ...CHORES_COINS_JAR_BODY_SHELL_SX,
  ...STAR_JAR_GALAXY_INNER_SX,
  display: 'grid',
  gridTemplateColumns: `repeat(${STAR_JAR_COLUMNS}, minmax(0, 1fr))`,
  gap: '4px',
  alignContent: 'end',
  justifyItems: 'center',
};

/** Shared inner layout — Chores Coins + Skills Star rewards (same HTML structure / spacing). */
const SHARED_REWARD_PANEL_STACK_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
};

const SHARED_REWARD_PANEL_ROW_SX = {
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'stretch', md: 'flex-start' },
  justifyContent: 'space-between',
  gap: { xs: 2, md: 3 },
  width: '100%',
};

const SHARED_REWARD_PANEL_JAR_COLUMN_SX = {
  flex: '0 1 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  alignSelf: { md: 'stretch' },
  ml: { md: 'auto' },
  width: { xs: '100%', md: 'auto' },
};

/** Pending stars — same box model as coins pending strip (140px min height, same radius feel). */
const PENDING_STARS_ZONE_GALAXY_SX = {
  ...PENDING_COINS_ZONE_GOLD_SX,
  border: '1px solid rgba(186, 104, 255, 0.35)',
  bgcolor: 'rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(6px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
  minHeight: 140,
  p: 2,
  alignItems: 'flex-end',
  alignContent: 'flex-end',
};

/**
 * Stars (top) + chores-style coin jar (bottom) for Overview — golden frame; full galaxy star section above separator.
 */
function OverviewStarAndCoinJarsPanel({ playerName, starData, playerCoins, onRedeemCoin, onRedeemStar }) {
  const sd = starData || { pending: 0, current: 0, totalEarned: 0 };
  const coins = playerCoins || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
  const redeem = () => onRedeemCoin && onRedeemCoin(playerName);
  const redeemStar = () => onRedeemStar && onRedeemStar(playerName);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={OVERVIEW_STARS_GALAXY_ONLY_SX}>
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, opacity: 0.85 }}>
            Stars
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.25 }}>
            Current: {sd.current ?? 0}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
            Total Earned: {sd.totalEarned ?? 0}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mb: 0.25 }}>
          Pending (not in jar): {sd.pending ?? 0}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: { xs: 3, md: 4 },
            width: '100%',
          }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: { md: 420 } }}>
            <Box
              sx={{
                ...PENDING_STARS_ZONE_GALAXY_SX,
                justifyContent: sd.pending === 0 ? 'center' : 'flex-start',
                alignContent: sd.pending === 0 ? 'center' : 'flex-end',
                alignItems: sd.pending === 0 ? 'center' : 'flex-end',
              }}
            >
              {[...Array(Math.min(sd.pending || 0, 30))].map((_, i) => (
                <Box
                  key={i}
                  draggable={!!onRedeemStar}
                  onClick={redeemStar}
                  onDragStart={(e) => {
                    if (!onRedeemStar) return;
                    if (e.dataTransfer) {
                      e.dataTransfer.setData('text/plain', 'star');
                      e.dataTransfer.effectAllowed = 'move';
                    }
                  }}
                  sx={{
                    cursor: onRedeemStar ? 'grab' : 'default',
                    color: '#ffca28',
                    userSelect: 'none',
                    '&:active': { cursor: onRedeemStar ? 'grabbing' : 'default' },
                  }}
                  title={onRedeemStar ? 'Drag to jar to redeem' : undefined}
                >
                  <StarIcon sx={{ fontSize: 40, filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.55))' }} />
                </Box>
              ))}
              {sd.pending > 30 && (
                <Typography variant="body2" sx={{ alignSelf: 'flex-end', pl: 0.5, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                  +{sd.pending - 30} more
                </Typography>
              )}
              {sd.pending === 0 && (
                <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center', width: '100%', py: 0.5, color: 'rgba(255,255,255,0.82)' }}>
                  No pending stars
                </Typography>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              flex: '0 1 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignSelf: { md: 'stretch' },
              ml: { md: 'auto' },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <Box sx={{ width: OVERVIEW_STAR_JAR_WIDTH_PX, maxWidth: '100%', position: 'relative' }}>
              <Box
                component="div"
                onDragOver={(e) => {
                  if (!onRedeemStar) return;
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(e) => {
                  if (!onRedeemStar) return;
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  if (!onRedeemStar) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const data = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
                  if (data === 'star') redeemStar();
                }}
                sx={{
                  ...JAR_LIP_SX,
                  ...(onRedeemStar
                    ? {
                        cursor: 'copy',
                        '&:hover': { borderColor: '#546e7a', bgcolor: '#455a64' },
                      }
                    : {}),
                }}
                title={onRedeemStar ? 'Drop stars here (on the lip) to redeem' : undefined}
              />
              <Box sx={OVERVIEW_STAR_JAR_BODY_SX}>
                {[...Array(Math.min(sd.current || 0, 30))].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16, color: '#ffc107', position: 'relative', zIndex: 1 }} />
                ))}
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
              {sd.current || 0} stars in jar
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ ...OVERVIEW_GOLDEN_JAR_PANEL_SX, mt: 0, width: '100%' }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, opacity: 0.85, mb: 0.25 }}>
            Coins
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.25 }}>
            Current: {coins.coins ?? 0}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.25 }}>
            Total Earned: {coins.totalEarned ?? 0}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mb: 0.25 }}>
          Pending (not in jar): {coins.pending ?? 0}
          {Number(coins.pendingSpent) > 0 ? ` · Awaiting approval: ${coins.pendingSpent}` : ''}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: { xs: 3, md: 4 },
            width: '100%',
          }}
        >
          <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: { md: 420 } }}>
            <Box
              sx={{
                ...PENDING_COINS_ZONE_GOLD_SX,
                justifyContent: (coins.pending || 0) === 0 ? 'center' : 'flex-start',
                alignContent: (coins.pending || 0) === 0 ? 'center' : 'flex-end',
                alignItems: (coins.pending || 0) === 0 ? 'center' : 'flex-end',
              }}
            >
              {[...Array(Math.min(coins.pending || 0, 40))].map((_, i) => (
                <Box
                  key={i}
                  draggable
                  onClick={redeem}
                  onDragStart={(e) => {
                    if (e.dataTransfer) {
                      e.dataTransfer.setData('text/plain', 'coin');
                      e.dataTransfer.effectAllowed = 'move';
                    }
                  }}
                  sx={{ cursor: 'grab', userSelect: 'none', '&:active': { cursor: 'grabbing' } }}
                >
                  <Box
                    component="img"
                    src={COIN_PNG_SRC}
                    alt=""
                    sx={{ width: 28, height: 28, display: 'block', objectFit: 'contain', pointerEvents: 'none' }}
                  />
                </Box>
              ))}
              {(coins.pending || 0) > 40 && (
                <Typography variant="caption" sx={{ alignSelf: 'flex-end', pl: 0.5 }}>
                  +{(coins.pending || 0) - 40} more
                </Typography>
              )}
              {(coins.pending || 0) === 0 && (
                <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center', width: '100%', py: 0.5 }}>
                  No pending coins
                </Typography>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              flex: '0 1 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignSelf: { md: 'stretch' },
              ml: { md: 'auto' },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <Box sx={{ width: 160, position: 'relative' }}>
              <Box
                component="div"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const data = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
                  if (data === 'coin') redeem();
                }}
                sx={{
                  ...JAR_LIP_SX,
                  cursor: 'copy',
                  '&:hover': { borderColor: '#546e7a', bgcolor: '#455a64' },
                }}
              />
              <Box sx={JAR_BODY_GLASS_SX}>
                {[...Array(Math.min(coins.coins || 0, 30))].map((_, i) => (
                  <Box
                    key={i}
                    component="img"
                    src={COIN_PNG_SRC}
                    alt=""
                    sx={{
                      width: 18,
                      height: 18,
                      display: 'block',
                      objectFit: 'contain',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
              {coins.coins || 0} coins in jar
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function getReactIconsPackage(setId) {
  if (REACT_ICONS_STATIC[setId]) return REACT_ICONS_STATIC[setId];
  return null;
}

function formatScreenCountdown(totalSec) {
  const t = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseHexColorForScreenTimer(raw) {
  const s = raw && String(raw).trim();
  if (!s || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return '#6200ee';
  return s;
}

/** Oversized kitchen-timer style dial: colored ring uses remaining / maxDialSec (60 min scale) so e.g. 30 min session fills half the ring at start. */
function MechanicalScreenTimerDial({ sizePx, remainingSec, maxDialSec, favouriteColor }) {
  const cx = 100;
  const cy = 100;
  const rOuter = 90;
  const rTrack = 74;
  const rTicks = 81;
  const progress = maxDialSec > 0 ? Math.min(1, Math.max(0, remainingSec / maxDialSec)) : 0;
  const circumference = 2 * Math.PI * rTrack;
  const dashOffset = circumference * (1 - progress);
  const fillCol = parseHexColorForScreenTimer(favouriteColor);

  const ticks = useMemo(() => {
    const out = [];
    for (let i = 0; i < 60; i += 1) {
      const deg = -90 + (i / 60) * 360;
      const rad = (deg * Math.PI) / 180;
      const len = i % 5 === 0 ? 10 : 5;
      const x1 = cx + Math.cos(rad) * rTicks;
      const y1 = cy + Math.sin(rad) * rTicks;
      const x2 = cx + Math.cos(rad) * (rTicks - len);
      const y2 = cy + Math.sin(rad) * (rTicks - len);
      out.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#1a1a1a"
          strokeWidth={i % 5 === 0 ? 2.2 : 1}
          opacity={i % 5 === 0 ? 0.95 : 0.55}
        />,
      );
    }
    return out;
  }, []);

  /** Minute scale 0, 5, … 55 — on the light face between the thick ring (~82) and tick tips (81), not on the rim/yellow edge. */
  const minuteLabels = useMemo(() => {
    const trackOuter = rTrack + 8;
    const rLabel = (rTicks + trackOuter) / 2 + 1.5;
    const labels = [];
    for (let m = 0; m < 60; m += 5) {
      const deg = -90 + (m / 60) * 360;
      const rad = (deg * Math.PI) / 180;
      const x = cx + Math.cos(rad) * rLabel;
      const y = cy + Math.sin(rad) * rLabel;
      labels.push(
        <text
          key={`minlabel-${m}`}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#1a1a1a"
          fontSize="11"
          fontWeight={700}
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth={2.5}
          paintOrder="stroke fill"
          style={{ fontVariantNumeric: 'tabular-nums', userSelect: 'none' }}
        >
          {m}
        </text>,
      );
    }
    return labels;
  }, []);

  return (
    <Box
      sx={{
        width: sizePx,
        height: sizePx,
        flexShrink: 0,
        position: 'relative',
        mx: 'auto',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 200 200"
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.22))',
        }}
      >
        <defs>
          <linearGradient id="mechanicalTimerFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#f5f5f5" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
          <linearGradient id="mechanicalTimerRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fafafa" />
            <stop offset="100%" stopColor="#d0d0d0" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={rOuter + 4} fill="rgba(0,0,0,0.06)" />
        <circle cx={cx} cy={cy} r={rOuter} fill="url(#mechanicalTimerFace)" stroke="url(#mechanicalTimerRim)" strokeWidth={4} />
        <circle cx={cx} cy={cy} r={rOuter - 2} fill="none" stroke="#222" strokeWidth={2} opacity={0.85} />
        {ticks}
        <circle cx={cx} cy={cy} r={rTrack} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={16} />
        <circle
          cx={cx}
          cy={cy}
          r={rTrack}
          fill="none"
          stroke={fillCol}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.4s linear' }}
        />
        {minuteLabels}
        <circle cx={cx} cy={cy} r={44} fill="rgba(255,255,255,0.92)" stroke="rgba(0,0,0,0.12)" strokeWidth={2} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#1a1200',
            letterSpacing: 1.5,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 1px 0 rgba(255,255,255,0.85)',
            fontSize: { xs: '1.35rem', sm: '1.5rem' },
          }}
        >
          {formatScreenCountdown(remainingSec)}
        </Typography>
      </Box>
    </Box>
  );
}

/** Gold panel: lifetime screen minutes + bank + countdown (Rewards tab). `screenTimeTick` forces re-render each second while the app is open. */
function ScreenTimeRewardsPanel({ playerName, favouriteColor, screenTimeByPlayer, screenTimeTick, onStart, onPause, onResume }) {
  const [minutesStr, setMinutesStr] = useState('');
  const st = playerName ? screenTimeByPlayer[playerName] : null;
  const balance = Math.max(0, Number(st?.balanceMinutes) || 0);
  const life = Math.max(0, Number(st?.lifetimeMinutesRedeemed) || 0);
  const activeUntil = st?.activeUntil || null;
  const pausedRem =
    st?.pausedRemainingSec != null ? Math.max(0, Math.floor(Number(st.pausedRemainingSec))) : null;
  const remainingFromWallClock = activeUntil
    ? Math.max(0, Math.floor((new Date(activeUntil).getTime() - Date.now()) / 1000))
    : 0;
  const remainingSec = pausedRem != null ? pausedRem : remainingFromWallClock;
  const isPaused = pausedRem != null && pausedRem > 0;
  const running = Boolean((activeUntil && remainingFromWallClock > 0) || isPaused);
  const maxDialSec = SCREEN_TIME_MAX_MINUTES_PER_TURN * 60;

  const maxSelectable = Math.min(balance, SCREEN_TIME_MAX_MINUTES_PER_TURN);

  useEffect(() => {
    if (!running && balance > 0) {
      setMinutesStr((prev) => {
        const max = Math.min(balance, SCREEN_TIME_MAX_MINUTES_PER_TURN);
        const n = parseInt(prev, 10);
        if (prev === '' || !Number.isFinite(n) || n < 1) return String(max);
        if (n > max) return String(max);
        return prev;
      });
    }
    if (!running && balance <= 0) setMinutesStr('');
  }, [balance, running, playerName]);

  const parsedDraft = parseInt(minutesStr, 10);
  const previewMin =
    !running && balance > 0
      ? Math.min(maxSelectable, Math.max(1, Number.isFinite(parsedDraft) && parsedDraft >= 1 ? parsedDraft : maxSelectable))
      : 0;
  const previewSec = previewMin * 60;

  const handleStartClick = () => {
    const n = parseInt(minutesStr, 10);
    if (!Number.isFinite(n) || n < 1) {
      onStart(Math.min(maxSelectable, Math.max(1, maxSelectable)));
      return;
    }
    onStart(Math.min(maxSelectable, Math.max(1, n)));
  };

  if (!playerName) return null;

  return (
    <Box sx={SCREEN_TIME_REWARDS_GOLD_SX} data-screen-tick={screenTimeTick}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
          <TimerOutlinedIcon sx={{ color: '#a67c00', filter: 'drop-shadow(0 0 4px rgba(255,180,0,0.5))' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1200' }}>
            Screen time
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.78)', fontWeight: 600, flex: '1 1 220px', minWidth: 0 }}>
            Total redeemed minutes (from rewards): <strong>{life}</strong>
          </Typography>
          {!running && (
            <Box sx={{ flex: '0 1 auto', textAlign: { xs: 'left', sm: 'right' }, maxWidth: '100%' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1200' }}>
                Minutes in your bank: <strong>{balance}</strong>
              </Typography>
              {balance > 0 ? (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'rgba(0,0,0,0.65)', maxWidth: 320, ml: { xs: 0, sm: 'auto' } }}>
                  Use at most {SCREEN_TIME_MAX_MINUTES_PER_TURN} minutes per turn. Choose how many to spend, then start.
                </Typography>
              ) : null}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'flex-start' },
            gap: 2,
          }}
        >
          <MechanicalScreenTimerDial
            sizePx={220}
            remainingSec={running ? remainingSec : previewSec}
            maxDialSec={maxDialSec}
            favouriteColor={favouriteColor}
          />
          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            {running ? (
              <Box>
                <Typography variant="caption" sx={{ display: 'block', color: 'rgba(0,0,0,0.62)', mb: 0.75, fontWeight: 600 }}>
                  Session time left — ring uses a {SCREEN_TIME_MAX_MINUTES_PER_TURN}-minute scale (e.g. 30 min left fills half the ring)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {isPaused ? (
                    <Button variant="contained" size="small" onClick={() => onResume?.()} sx={CHORE_REWARD_REDEEM_BUTTON_SX}>
                      Resume
                    </Button>
                  ) : (
                    <Button variant="outlined" size="small" onClick={() => onPause?.()} sx={{ borderColor: '#a67c00', color: '#1a1200' }}>
                      Pause
                    </Button>
                  )}
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(0,0,0,0.58)' }}>
                  When the timer reaches zero, this session ends and the alarm plays.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 1.5 }}>
                  <TextField
                    label="Minutes this turn"
                    type="number"
                    size="small"
                    disabled={balance <= 0}
                    value={minutesStr}
                    onChange={(e) => setMinutesStr(e.target.value)}
                    inputProps={{
                      min: 1,
                      max: maxSelectable,
                      step: 1,
                      'aria-label': 'Minutes to use for this screen time session',
                    }}
                    sx={{
                      width: 160,
                      '& .MuiInputLabel-root': {
                        color: 'rgba(26,18,0,0.82)',
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1a1200',
                      },
                      '& .MuiInputLabel-root.Mui-disabled': {
                        color: 'rgba(26,18,0,0.45)',
                      },
                      '& .MuiOutlinedInput-root': {
                        color: '#1a1200',
                        '& fieldset': {
                          borderColor: 'rgba(0,0,0,0.38)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(0,0,0,0.55)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#5d4037',
                        },
                        '&.Mui-disabled': {
                          color: 'rgba(26,18,0,0.45)',
                        },
                      },
                      '& .MuiOutlinedInput-input::placeholder': {
                        color: 'rgba(26,18,0,0.75)',
                        opacity: 1,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    size="medium"
                    disabled={balance <= 0 || maxSelectable < 1}
                    onClick={handleStartClick}
                    sx={CHORE_REWARD_REDEEM_BUTTON_SX}
                  >
                    Start timer
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  const [role, setRole] = useState(readStoredSessionRole);
  const [selectedRole, setSelectedRole] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [players, setPlayers] = useState([
    { name: 'Player 1', iconUrl: '' },
  ]);
  const [pendingPlayerIndex, setPendingPlayerIndex] = useState(null);
  const [activePlayerIndex, setActivePlayerIndex] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerIconUrl, setNewPlayerIconUrl] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState('');
  const [newSkillSubSkills, setNewSkillSubSkills] = useState(['']);
  const [xpByPlayer, setXpByPlayer] = useState({});
  const [newSubSkillDraftMain, setNewSubSkillDraftMain] = useState({});
  const [newSubSkillDraftChore, setNewSubSkillDraftChore] = useState({});
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('wonderful-game-darkMode') === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('wonderful-game-darkMode', String(darkMode));
    } catch (_) {}
  }, [darkMode]);
  const [stateLoaded, setStateLoaded] = useState(false);
  const playerSessionRestoredRef = useRef(false);
  const [xpTargetPlayerIndex, setXpTargetPlayerIndex] = useState(0);
  const [xpSkillName, setXpSkillName] = useState('');
  const [xpSubSkillName, setXpSubSkillName] = useState('');
  const [xpTaskId, setXpTaskId] = useState('');
  const [xpWhatHappened, setXpWhatHappened] = useState('');
  const [recentTaskIdsBySkillKey, setRecentTaskIdsBySkillKey] = useState({});
  const [tasks, setTasks] = useState([]);
  const [changeIconAnchorEl, setChangeIconAnchorEl] = useState(null);
  const [changeIconTarget, setChangeIconTarget] = useState(''); // 'skill:Name' or 'subSkill:SkillName:SubName'
  const [taskSkillName, setTaskSkillName] = useState('');
  const [taskSubSkillName, setTaskSubSkillName] = useState('');
  const [taskGrantStars, setTaskGrantStars] = useState(false);
  const [taskStarAmount, setTaskStarAmount] = useState('1');
  const [taskScaleXpWithLevel, setTaskScaleXpWithLevel] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null); // task id when editing existing
  const [taskTitle, setTaskTitle] = useState('');
  const [taskRequiredLevel, setTaskRequiredLevel] = useState('');
  const [taskXpReward, setTaskXpReward] = useState('');
  const [skillIconConfig, setSkillIconConfig] = useState({ skills: {}, subSkills: {} });
  const [skillDocConfig, setSkillDocConfig] = useState({ skills: {}, subSkills: {} });
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docTarget, setDocTarget] = useState(''); // 'skill:Name' or 'subSkill:SkillName:SubName'
  const [docViewMode, setDocViewMode] = useState('view'); // 'view' | 'edit'
  const [docContentInput, setDocContentInput] = useState(''); // markdown in editor
  const docEditorRef = useRef(null);
  const [xpLogDialogOpen, setXpLogDialogOpen] = useState(false);
  const [xpLogFilter, setXpLogFilter] = useState(null); // { playerName, skillName, subSkillName } or null = show all
  const [xpGrantLog, setXpGrantLog] = useState([]);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [tasksModalContext, setTasksModalContext] = useState(null); // { playerName, skillName, subSkillName }
  const [apiCallsModalOpen, setApiCallsModalOpen] = useState(false);
  const [apiCallsContext, setApiCallsContext] = useState(null); // { playerName, skillName, subSkillName }
  const [skillPointsByPlayer, setSkillPointsByPlayer] = useState({});
  const [skillTreeConfig, setSkillTreeConfig] = useState({}); // { [skillName]: { unlocks: [ { id, icon?, requiredPoints, prerequisiteId? } ] } }
  const [skillTreeModalOpen, setSkillTreeModalOpen] = useState(false);
  const [skillTreeModalContext, setSkillTreeModalContext] = useState(null); // { playerName, skillName }
  const [skillTreeEditorOpen, setSkillTreeEditorOpen] = useState(false);
  const [skillTreeEditorSkill, setSkillTreeEditorSkill] = useState(''); // skill name being edited
  const [skillTreeSelectedUnlockId, setSkillTreeSelectedUnlockId] = useState(null);
  const [imageLibrary, setImageLibrary] = useState([]); // [{ id, dataUrl }]
  const [imageLibraryDialogOpen, setImageLibraryDialogOpen] = useState(false);
  const imageLibraryApplyRef = useRef(null); // (dataUrl) => void when user picks from library
  const [starsByPlayer, setStarsByPlayer] = useState({}); // { [playerName]: { pending, current, totalEarned } }
  const [starRewards, setStarRewards] = useState([]); // [{ id, name, description?, cost, visibleToPlayerNames? }]
  const [overviewTabIndex, setOverviewTabIndex] = useState(0); // 0 = Stars, 1+ = player index
  const [weeklyReviewTabIndex, setWeeklyReviewTabIndex] = useState(0); // 0 = All, 1+ = player index
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [activityLogPlayerName, setActivityLogPlayerName] = useState('');
  const [activityLogFilterKey, setActivityLogFilterKey] = useState('__all__'); // __all__ | skill:Name | sub:Name:Sub
  const [resetSectionPin, setResetSectionPin] = useState('');
  const [resetSectionConfirm, setResetSectionConfirm] = useState('');
  const [resetSectionPlayerIndex, setResetSectionPlayerIndex] = useState(0);
  const [resetSectionMessage, setResetSectionMessage] = useState('');
  const [starRewardMgmtDialogOpen, setStarRewardMgmtDialogOpen] = useState(false);
  /** null = list in dialog; object = add/edit form (id null = new reward) */
  const [starRewardMgmtDraft, setStarRewardMgmtDraft] = useState(null);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [imageUploadFile, setImageUploadFile] = useState(null);
  const [imageUploadName, setImageUploadName] = useState('');
  const [imageUploadPreviewUrl, setImageUploadPreviewUrl] = useState('');
  const imageFileInputRef = useRef(null);
  const [enabledIconPackages, setEnabledIconPackages] = useState(() => [...ALL_ENABLED_ICON_PACKAGES]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState('account');
  /** Settings → Skills: which inner tab (add / sub-skills / chore / remove). */
  const [settingsSkillsSubTab, setSettingsSkillsSubTab] = useState('skillSubs');
  const [settingsTarget, setSettingsTarget] = useState('');
  const [settingsIconPkg, setSettingsIconPkg] = useState('__all__');
  const [settingsIconName, setSettingsIconName] = useState('');
  /** Settings → Manage Players: expanded rows keyed by player name (collapsed by default). */
  const [managePlayersExpanded, setManagePlayersExpanded] = useState({});
  const [lifeMasterPin, setLifeMasterPin] = useState(readStoredLifeMasterPin);
  const [accountCurrentPin, setAccountCurrentPin] = useState('');
  const [accountNewPin, setAccountNewPin] = useState('');
  const [accountConfirmPin, setAccountConfirmPin] = useState('');
  const [accountPinMessage, setAccountPinMessage] = useState('');
  const [topTab, setTopTab] = useState(() => readStoredTab(STORAGE_TAB_TOP, VALID_TOP_TABS, 'skills')); // showcase | skills | chores
  const [chores, setChores] = useState([]);
  const [choreActivity, setChoreActivity] = useState([]);
  const [choreLeftTab, setChoreLeftTab] = useState(() => readStoredTab(STORAGE_TAB_CHORE_LEFT, VALID_CHORE_LEFT_TABS, 'chores')); // chores | skills | board | activity | achievements | rewards
  /** Skills top area: home | skills | tasks | board | activity | achievements | rewards */
  const [skillsLeftTab, setSkillsLeftTab] = useState(() => readStoredTab(STORAGE_TAB_SKILLS_LEFT, VALID_SKILLS_LEFT_TABS, 'home'));
  const [skillsBoardPeriod, setSkillsBoardPeriod] = useState('week');
  const [skillsActivityPage, setSkillsActivityPage] = useState(0);
  const [skillsActivityFilterAnchorEl, setSkillsActivityFilterAnchorEl] = useState(null);
  const [skillsActivitySkillFilter, setSkillsActivitySkillFilter] = useState('__all__');
  const [skillsActivitySubFilter, setSkillsActivitySubFilter] = useState('__all__');
  const [skillsActivityDateFrom, setSkillsActivityDateFrom] = useState('');
  const [skillsActivityDateTo, setSkillsActivityDateTo] = useState('');
  /** Skills → Activity: "all" or a player name to filter the XP log. */
  /** Skills area (Life Master): 'all' or player index string — filters Home, Activity, etc. */
  const [skillsPlayerFilter, setSkillsPlayerFilter] = useState('all');
  /** Skills tab: Skill Achievements list starts expanded. */
  const [skillAchievementsExpanded, setSkillAchievementsExpanded] = useState(true);
  /** Skills → Achievements: show unlocked-only vs locked-only cards. */
  const [skillAchievementsListTab, setSkillAchievementsListTab] = useState('unlocked');
  /** Skills tab: main Skills tree (category cards) starts expanded. */
  const [skillsSectionExpanded, setSkillsSectionExpanded] = useState(true);
  /** Chores tab → Skills: cards for chore-only skill definitions; starts expanded (separate from Skills tab accordion). */
  const [choreSkillsSectionExpanded, setChoreSkillsSectionExpanded] = useState(true);
  /** Chore-specific skill definitions (name + sub-skills). Separate from the Skills tab list. */
  const [choreSkills, setChoreSkills] = useState([]);
  const [newChoreSkillNameInput, setNewChoreSkillNameInput] = useState('');
  const [newChoreSkillSubSkillsInput, setNewChoreSkillSubSkillsInput] = useState('');
  /** Manage Chores dialog: inline edit for a chore skill definition (name + sub-skills). */
  const [manageChoreSkillEditIdx, setManageChoreSkillEditIdx] = useState(null);
  const [manageChoreSkillEditName, setManageChoreSkillEditName] = useState('');
  const [manageChoreSkillEditSubs, setManageChoreSkillEditSubs] = useState('');
  const [choreRoomTab, setChoreRoomTab] = useState(() => readStoredTab(STORAGE_TAB_CHORE_ROOM, CHORE_ROOMS, CHORE_ROOMS[0]));
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TAB_TOP, topTab);
      localStorage.setItem(STORAGE_TAB_SKILLS_LEFT, skillsLeftTab);
      localStorage.setItem(STORAGE_TAB_CHORE_LEFT, choreLeftTab);
      localStorage.setItem(STORAGE_TAB_CHORE_ROOM, choreRoomTab);
    } catch {
      /* ignore */
    }
  }, [topTab, skillsLeftTab, choreLeftTab, choreRoomTab]);

  const showRewardRequestsTab =
    role === 'Life Master' ||
    (role === 'Player' && activePlayerIndex != null && players[activePlayerIndex]?.userType === 'Adult');
  /** Coin + star reward requests: Life Master or any Adult player profile. */
  const canApproveRewardRequests =
    role === 'Life Master' ||
    (role === 'Player' && activePlayerIndex != null && players[activePlayerIndex]?.userType === 'Adult');
  useEffect(() => {
    if (!showRewardRequestsTab) {
      setSkillsLeftTab((t) => (t === 'rewardRequests' ? 'rewards' : t));
      setChoreLeftTab((t) => (t === 'rewardRequests' ? 'rewards' : t));
    }
  }, [showRewardRequestsTab]);

  useEffect(() => {
    if (role !== 'Life Master' && skillsLeftTab === 'tasks') {
      setSkillsLeftTab('home');
    }
  }, [role, skillsLeftTab]);

  useEffect(() => {
    if (skillsLeftTab !== 'rewards' && skillsPlayerFilter === 'manage') {
      setSkillsPlayerFilter('all');
    }
  }, [skillsLeftTab, skillsPlayerFilter]);

  const [boardPeriod, setBoardPeriod] = useState('week');
  const [activityPage, setActivityPage] = useState(0);
  /** Chores → Activity: `__all__` or a room from `CHORE_ROOMS`. */
  const [activityRoomFilter, setActivityRoomFilter] = useState('__all__');
  const activityPageSizeChores = 50;
  useEffect(() => {
    const filtered =
      activityRoomFilter === '__all__'
        ? choreActivity
        : choreActivity.filter((a) => a && a.room === activityRoomFilter);
    const pages = Math.max(1, Math.ceil(filtered.length / activityPageSizeChores));
    setActivityPage((p) => Math.min(p, pages - 1));
  }, [choreActivity, activityRoomFilter]);
  const [coinsByPlayer, setCoinsByPlayer] = useState({});
  const [effortCoinsByStar, setEffortCoinsByStar] = useState({ 1: 1, 2: 2, 3: 4, 4: 7, 5: 10 });
  const [rewardsStore, setRewardsStore] = useState([]);
  const [rewardRequests, setRewardRequests] = useState([]);
  const [screenTimeByPlayer, setScreenTimeByPlayer] = useState({});
  const [screenTimeTick, setScreenTimeTick] = useState(0);
  const [rewardRedemptionLog, setRewardRedemptionLog] = useState([]);
  const rewardLogMigratedRef = useRef(false);
  const [redeemedRewardsPage, setRedeemedRewardsPage] = useState(0);
  const [starRewardRequests, setStarRewardRequests] = useState([]);
  const [choreGoalsByPlayer, setChoreGoalsByPlayer] = useState({});
  const [questsByDate, setQuestsByDate] = useState({});
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreSchedule, setNewChoreSchedule] = useState('daily');
  const [newChoreEffortStars, setNewChoreEffortStars] = useState('1');
  const [newChoreSkill, setNewChoreSkill] = useState('');
  const [newChoreScaleXpWithLevel, setNewChoreScaleXpWithLevel] = useState(false);
  const [newChoreRequiredLevel, setNewChoreRequiredLevel] = useState('1');
  const [newChoreBedroomOwner, setNewChoreBedroomOwner] = useState('');
  /** When the chore skill has sub-skills, XP is awarded to this sub-skill (required in that case). */
  const [newChoreSubSkill, setNewChoreSubSkill] = useState('');
  /** Room for new/edited chore in Manage Chores (independent of Chores tab until dialog sync). */
  const [newChoreRoom, setNewChoreRoom] = useState(CHORE_ROOMS[0]);
  const [editingChoreId, setEditingChoreId] = useState(null);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardCost, setNewRewardCost] = useState('1');
  const [newRewardScreenTime, setNewRewardScreenTime] = useState('');
  const [newRewardVisibleTo, setNewRewardVisibleTo] = useState([]);
  const [manageChoresDialogOpen, setManageChoresDialogOpen] = useState(false);
  const [manageRewardsDialogOpen, setManageRewardsDialogOpen] = useState(false);
  /** After POST /state returns 401, skip further saves until lifeMasterPin changes (avoids console spam). */
  const persistStateAuthFailRef = useRef(false);
  const [achievementDefinitions, setAchievementDefinitions] = useState([]);
  const [newSkillAchievementName, setNewSkillAchievementName] = useState('');
  const [newSkillAchievementTaskId, setNewSkillAchievementTaskId] = useState('');
  const [newSkillAchievementThreshold, setNewSkillAchievementThreshold] = useState('1');
  const [newSkillAchievementUnlock, setNewSkillAchievementUnlock] = useState('');
  const [newChoreAchievementName, setNewChoreAchievementName] = useState('');
  const [newChoreAchievementChoreId, setNewChoreAchievementChoreId] = useState('');
  const [newChoreAchievementThreshold, setNewChoreAchievementThreshold] = useState('1');
  const [newChoreAchievementUnlock, setNewChoreAchievementUnlock] = useState('');
  /** Settings → Achievements: skill vs chore editor */
  const [settingsAchievementsTab, setSettingsAchievementsTab] = useState('skill');
  const [showcaseByPlayer, setShowcaseByPlayer] = useState({});
  const [rulesPage, setRulesPage] = useState(() => normalizeRulesPage({}));
  const authHeaders = React.useMemo(
    () => ({ 'x-life-master-pin': lifeMasterPin || '' }),
    [lifeMasterPin]
  );

  const choreSkillDropdownNames = useMemo(
    () =>
      choreSkills
        .filter((s) => s?.name && (s.subSkills || []).filter(Boolean).length > 0)
        .map((s) => s.name),
    [choreSkills]
  );

  /** For chores and chore XP: prefer the Chore Skills definition when the name exists there. */
  const resolveSkillDefForChore = useCallback(
    (skillName) =>
      choreSkills.find((s) => s.name === skillName) || skills.find((s) => s.name === skillName) || null,
    [skills, choreSkills],
  );

  const newChoreSkillDefForForm = useMemo(() => {
    const n = newChoreSkill;
    if (!n) return null;
    return resolveSkillDefForChore(n);
  }, [newChoreSkill, resolveSkillDefForChore]);

  const newChoreSubSkillOptions = newChoreSkillDefForForm?.subSkills?.filter(Boolean) || [];

  /** Chore skill definitions win over main Skills when names match (same bucket name, different sub-lists). */
  const mergedSkillDefsForXp = useMemo(() => {
    const mainNames = new Set(skills.map((s) => s.name));
    const choreByName = new Map(
      (choreSkills || []).filter((cs) => cs?.name).map((cs) => [cs.name, cs]),
    );
    const mergedFromMain = skills.map((s) => {
      const chore = choreByName.get(s.name);
      if (chore) {
        return { ...s, subSkills: [...(chore.subSkills || [])] };
      }
      return s;
    });
    const choreOnly = choreSkills.filter((cs) => cs?.name && !mainNames.has(cs.name));
    return [...mergedFromMain, ...choreOnly];
  }, [skills, choreSkills]);

  const getSkillDefMerged = useCallback(
    (skillNameKey) => mergedSkillDefsForXp.find((s) => s.name === skillNameKey) || null,
    [mergedSkillDefsForXp],
  );

  const skillsGrantTargetPlayerName = useMemo(() => {
    if (role === 'Player' && activePlayerIndex != null) return players[activePlayerIndex]?.name || '';
    if (role === 'Life Master' && players.length > 0) {
      const idx =
        skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage'
          ? xpTargetPlayerIndex
          : Math.min(Math.max(0, Number(skillsPlayerFilter) || 0), players.length - 1);
      return players[idx]?.name || '';
    }
    return '';
  }, [role, players, activePlayerIndex, skillsPlayerFilter, xpTargetPlayerIndex]);

  const mergedSkillDefsForGrantTarget = useMemo(
    () => filterMergedSkillsForPlayer(mergedSkillDefsForXp, skillsGrantTargetPlayerName),
    [mergedSkillDefsForXp, skillsGrantTargetPlayerName],
  );

  const getSkillDefMergedForGrantTarget = useCallback(
    (skillNameKey) => mergedSkillDefsForGrantTarget.find((s) => s.name === skillNameKey) || null,
    [mergedSkillDefsForGrantTarget],
  );

  useEffect(() => {
    if (!skillsGrantTargetPlayerName) return;
    const names = new Set(mergedSkillDefsForGrantTarget.map((s) => s.name));
    if (xpSkillName && !names.has(xpSkillName)) {
      setXpSkillName('');
      setXpSubSkillName('');
    }
  }, [mergedSkillDefsForGrantTarget, skillsGrantTargetPlayerName, xpSkillName]);

  useEffect(() => {
    if (!xpSkillName || !skillsGrantTargetPlayerName) return;
    const def = mergedSkillDefsForGrantTarget.find((s) => s.name === xpSkillName);
    const subs = def?.subSkills || [];
    if (xpSubSkillName && !subs.includes(xpSubSkillName)) {
      setXpSubSkillName('');
    }
  }, [mergedSkillDefsForGrantTarget, xpSkillName, xpSubSkillName, skillsGrantTargetPlayerName]);

  useEffect(() => {
    if (!manageChoresDialogOpen || choreSkillDropdownNames.length === 0) return;
    setNewChoreSkill((prev) =>
      prev && choreSkillDropdownNames.includes(prev) ? prev : choreSkillDropdownNames[0]
    );
  }, [manageChoresDialogOpen, choreSkillDropdownNames]);

  /** When opening Manage Chores for a new chore, default room to the Chores tab room. */
  useEffect(() => {
    if (manageChoresDialogOpen && !editingChoreId) {
      setNewChoreRoom(choreRoomTab);
    }
  }, [manageChoresDialogOpen, choreRoomTab, editingChoreId]);

  useEffect(() => {
    const def = resolveSkillDefForChore(newChoreSkill);
    const subs = def?.subSkills?.filter(Boolean) || [];
    if (subs.length === 0) {
      setNewChoreSubSkill('');
    } else {
      setNewChoreSubSkill((prev) => (prev && subs.includes(prev) ? prev : subs[0]));
    }
  }, [newChoreSkill, resolveSkillDefForChore]);

  useEffect(() => {
    persistLifeMasterPinToStorage(lifeMasterPin);
  }, [lifeMasterPin]);

  useEffect(() => {
    setSkillsActivitySubFilter('__all__');
  }, [skillsActivitySkillFilter]);

  useEffect(() => {
    const sorted = [...xpGrantLog].sort((a, b) => new Date(b.at) - new Date(a.at));
    const name =
      skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage'
        ? null
        : players[Number(skillsPlayerFilter)]?.name;
    const filtered = sorted.filter((e) => {
      if (
        !(
          skillsPlayerFilter === 'all' ||
          skillsPlayerFilter === 'manage' ||
          (name && e.playerName === name)
        )
      ) {
        return false;
      }
      if (skillsActivitySkillFilter !== '__all__' && e.skillName !== skillsActivitySkillFilter) {
        return false;
      }
      if (skillsActivitySubFilter !== '__all__' && (e.subSkillName || '') !== skillsActivitySubFilter) {
        return false;
      }
      const t = new Date(e.at).getTime();
      if (skillsActivityDateFrom) {
        const from = new Date(`${skillsActivityDateFrom}T00:00:00`);
        if (t < from.getTime()) return false;
      }
      if (skillsActivityDateTo) {
        const to = new Date(`${skillsActivityDateTo}T23:59:59.999`);
        if (t > to.getTime()) return false;
      }
      return true;
    });
    const pages = Math.max(1, Math.ceil(filtered.length / 10));
    setSkillsActivityPage((p) => Math.min(p, pages - 1));
  }, [
    xpGrantLog,
    skillsPlayerFilter,
    players,
    skillsActivitySkillFilter,
    skillsActivitySubFilter,
    skillsActivityDateFrom,
    skillsActivityDateTo,
  ]);

  useEffect(() => {
    persistStateAuthFailRef.current = false;
  }, [lifeMasterPin]);

  useEffect(() => {
    axios
      .get(apiUrl('/state'))
      .then((res) => {
        const data = res.data || {};
        if (Array.isArray(data.skills)) {
          setSkills(data.skills);
        }
        if (Array.isArray(data.players) && data.players.length > 0) {
          setPlayers(data.players);
        }
        if (data.xpByPlayer && typeof data.xpByPlayer === 'object') {
          setXpByPlayer(data.xpByPlayer);
        }
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
        if (data.skillIconConfig && typeof data.skillIconConfig === 'object') {
          setSkillIconConfig(data.skillIconConfig);
        }
        if (data.skillDocConfig && typeof data.skillDocConfig === 'object') {
          setSkillDocConfig(data.skillDocConfig);
        }
        setEnabledIconPackages([...ALL_ENABLED_ICON_PACKAGES]);
        if (Array.isArray(data.xpGrantLog)) {
          setXpGrantLog(data.xpGrantLog);
        }
        if (data.skillPointsByPlayer && typeof data.skillPointsByPlayer === 'object') {
          setSkillPointsByPlayer(data.skillPointsByPlayer);
        }
        if (data.skillTreeConfig && typeof data.skillTreeConfig === 'object') {
          setSkillTreeConfig(data.skillTreeConfig);
        }
        if (Array.isArray(data.imageLibrary)) {
          setImageLibrary(data.imageLibrary);
        }
        if (data.starsByPlayer && typeof data.starsByPlayer === 'object') {
          setStarsByPlayer(data.starsByPlayer);
        }
        if (Array.isArray(data.starRewards)) {
          setStarRewards(data.starRewards);
        }
        if (Array.isArray(data.chores)) {
          setChores(data.chores.map(normalizeChoreXpReward));
        }
        if (Array.isArray(data.choreActivity)) {
          setChoreActivity(data.choreActivity);
        }
        if (data.effortCoinsByStar && typeof data.effortCoinsByStar === 'object') {
          setEffortCoinsByStar(data.effortCoinsByStar);
        }
        if (data.coinsByPlayer && typeof data.coinsByPlayer === 'object') {
          setCoinsByPlayer(data.coinsByPlayer);
        }
        if (Array.isArray(data.rewardsStore)) {
          setRewardsStore(data.rewardsStore);
        }
        if (Array.isArray(data.rewardRequests)) {
          setRewardRequests(data.rewardRequests);
        }
        if (Array.isArray(data.rewardRedemptionLog)) {
          setRewardRedemptionLog(data.rewardRedemptionLog);
        }
        if (data.screenTimeByPlayer && typeof data.screenTimeByPlayer === 'object') {
          setScreenTimeByPlayer(data.screenTimeByPlayer);
        }
        if (Array.isArray(data.starRewardRequests)) {
          setStarRewardRequests(data.starRewardRequests);
        }
        if (data.choreGoalsByPlayer && typeof data.choreGoalsByPlayer === 'object') {
          setChoreGoalsByPlayer(data.choreGoalsByPlayer);
        }
        if (data.questsByDate && typeof data.questsByDate === 'object') {
          setQuestsByDate(data.questsByDate);
        }
        if (Array.isArray(data.achievementDefinitions)) {
          setAchievementDefinitions(data.achievementDefinitions);
        }
        if (data.showcaseByPlayer && typeof data.showcaseByPlayer === 'object') {
          const nextShowcase = {};
          Object.keys(data.showcaseByPlayer).forEach((k) => {
            nextShowcase[k] = normalizeShowcaseConfig(data.showcaseByPlayer[k]);
          });
          setShowcaseByPlayer(nextShowcase);
        }
        if (data.rulesPage && typeof data.rulesPage === 'object') {
          setRulesPage(normalizeRulesPage(data.rulesPage));
        }
        if (Array.isArray(data.choreSkills)) {
          const next = data.choreSkills.map(normalizeChoreSkillDef).filter(Boolean);
          setChoreSkills(next);
        } else if (Array.isArray(data.choreSkillNames) && data.choreSkillNames.length && Array.isArray(data.skills)) {
          const byName = new Map(data.skills.map((s) => [s.name, s]));
          setChoreSkills(
            data.choreSkillNames.map((n) => {
              const s = byName.get(n);
              return s
                ? { name: s.name, subSkills: Array.isArray(s.subSkills) ? [...s.subSkills] : [] }
                : { name: n, subSkills: [] };
            }),
          );
        }
      })
      .catch(() => {
        // Fallback to skills-only endpoint if /state is not available
        axios
          .get(apiUrl('/skills'))
          .then((res) => setSkills(res.data))
          .catch(() => {});
      })
      .finally(() => {
        setStateLoaded(true);
      });
  }, []);

  // Restore Player role after server state loads (session stores player name, not index).
  useEffect(() => {
    if (!stateLoaded || playerSessionRestoredRef.current) return;
    if (!players.length) return;
    let sess;
    try {
      const raw = localStorage.getItem(WONDERFUL_GAME_SESSION_KEY);
      if (!raw) {
        playerSessionRestoredRef.current = true;
        return;
      }
      sess = JSON.parse(raw);
    } catch (_) {
      playerSessionRestoredRef.current = true;
      return;
    }
    if (!sess || sess.role !== 'Player' || !sess.playerName) {
      playerSessionRestoredRef.current = true;
      return;
    }
    const idx = players.findIndex((p) => p.name === sess.playerName);
    if (idx < 0) return;
    playerSessionRestoredRef.current = true;
    setRole('Player');
    setActivePlayerIndex(idx);
  }, [stateLoaded, players]);

  // Persist current role so refresh keeps the same session (cleared on logout / Back to main).
  useEffect(() => {
    if (!role) return;
    const payload = { role };
    if (role === 'Player' && activePlayerIndex != null && players[activePlayerIndex]) {
      payload.playerName = players[activePlayerIndex].name;
    }
    try {
      localStorage.setItem(WONDERFUL_GAME_SESSION_KEY, JSON.stringify(payload));
    } catch (_) {
      /* ignore */
    }
  }, [role, activePlayerIndex, players]);

  // Ensure XP exists only on sub-skills; migrate legacy __skillXp into the first sub-skill
  useEffect(() => {
    setXpByPlayer((prev) => {
      const updated = { ...prev };
      players.forEach((player) => {
        const playerName = player.name;
        if (!updated[playerName]) {
          updated[playerName] = {};
        }
        mergedSkillDefsForXp.forEach((skill) => {
          const skillNameKey = skill.name;
          const subSkills = (skill.subSkills || []).filter(Boolean);
          if (!updated[playerName][skillNameKey]) {
            updated[playerName][skillNameKey] = {};
          }
          const block = updated[playerName][skillNameKey];
          const legacy = block.__skillXp;
          if (legacy !== undefined && subSkills.length > 0) {
            const first = subSkills[0];
            const leg =
              typeof legacy === 'number'
                ? { actual: legacy, pending: 0 }
                : {
                    actual: typeof legacy?.actual === 'number' ? legacy.actual : 0,
                    pending: typeof legacy?.pending === 'number' ? legacy.pending : 0,
                  };
            const curRaw = block[first];
            const cur =
              typeof curRaw === 'number'
                ? { actual: curRaw, pending: 0 }
                : !curRaw || typeof curRaw !== 'object'
                  ? { actual: 0, pending: 0 }
                  : {
                      actual: typeof curRaw.actual === 'number' ? curRaw.actual : 0,
                      pending: typeof curRaw.pending === 'number' ? curRaw.pending : 0,
                    };
            block[first] = {
              actual: cur.actual + leg.actual,
              pending: cur.pending + leg.pending,
            };
            delete block.__skillXp;
          }
          subSkills.forEach((s) => {
            const cur = updated[playerName][skillNameKey][s];
            if (typeof cur === 'number') {
              updated[playerName][skillNameKey][s] = {
                actual: cur,
                pending: 0,
              };
            } else if (!cur || typeof cur !== 'object') {
              updated[playerName][skillNameKey][s] = {
                actual: 0,
                pending: 0,
              };
            } else {
              updated[playerName][skillNameKey][s] = {
                actual:
                  typeof cur.actual === 'number' ? cur.actual : 0,
                pending:
                  typeof cur.pending === 'number' ? cur.pending : 0,
              };
            }
          });
        });
      });
      return updated;
    });
  }, [players, mergedSkillDefsForXp]);

  // Backfill skill points from current levels (for levels gained before this feature)
  useEffect(() => {
    if (!stateLoaded || !players.length || !mergedSkillDefsForXp.length) return;
    setSkillPointsByPlayer((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      players.forEach((player) => {
        const name = player.name;
        if (!next[name]) next[name] = {};
        mergedSkillDefsForXp.forEach((skill) => {
          const skillName = skill.name;
          if (next[name][skillName] !== undefined && next[name][skillName] !== null) return;
          const subSkills = skill.subSkills || [];
          let points = 0;
          if (subSkills.length === 0) {
            const entries = getEntriesForSkill(name, skillName);
            const level = xpToLevel(entries.actual);
            points = Math.max(0, level - 1);
          } else {
            subSkills.forEach((s) => {
              const entries = getEntriesForSubSkill(name, skillName, s);
              const level = xpToLevel(entries.actual);
              points += Math.max(0, level - 1);
            });
          }
          next[name][skillName] = points;
        });
      });
      return next;
    });
  }, [stateLoaded, players, mergedSkillDefsForXp, xpByPlayer]);

  // Persist full state (skills, players, XP) whenever it changes
  useEffect(() => {
    if (!stateLoaded || persistStateAuthFailRef.current) return;
    axios
      .post(apiUrl('/state'), {
        skills,
        players,
        xpByPlayer,
        tasks,
        skillIconConfig,
        skillDocConfig,
        enabledIconPackages,
        lifeMasterPin,
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
      }, { headers: authHeaders })
      .catch((err) => {
        if (err.response?.status === 401) {
          persistStateAuthFailRef.current = true;
        }
      });
  }, [stateLoaded, skills, players, xpByPlayer, tasks, skillIconConfig, skillDocConfig, enabledIconPackages, lifeMasterPin, xpGrantLog, skillPointsByPlayer, skillTreeConfig, imageLibrary, starsByPlayer, starRewards, chores, choreActivity, effortCoinsByStar, coinsByPlayer, rewardsStore, rewardRequests, rewardRedemptionLog, screenTimeByPlayer, starRewardRequests, choreGoalsByPlayer, questsByDate, achievementDefinitions, showcaseByPlayer, choreSkills, rulesPage, authHeaders]);

  useEffect(() => {
    const id = setInterval(() => {
      setScreenTimeTick((t) => t + 1);
      setScreenTimeByPlayer((prev) => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach((name) => {
          const st = next[name];
          if (!st?.activeUntil) return;
          const endMs = new Date(st.activeUntil).getTime();
          if (endMs <= Date.now()) {
            playAlarmClockSound();
            next[name] = { ...st, activeUntil: null, sessionDurationSec: undefined, pausedRemainingSec: undefined };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // One-time: backfill coin redemption history from approved requests when log was empty (older saves).
  useEffect(() => {
    if (!stateLoaded) return;
    setRewardRedemptionLog((prev) => {
      if (prev.length > 0) {
        rewardLogMigratedRef.current = true;
        return prev;
      }
      if (rewardLogMigratedRef.current) return prev;
      const migrated = rewardRequests
        .filter((r) => r && r.status === 'approved')
        .map((r) => {
          const rewardDef = rewardsStore.find((x) => x.id === r.rewardId);
          const screenM = Math.max(
            0,
            Math.floor(Number(r.screenTimeMinutes) || Number(rewardDef?.screenTimeMinutes) || 0),
          );
          return {
            id: `mig_${r.id}`,
            playerName: r.playerName,
            rewardId: r.rewardId,
            rewardName: r.rewardName,
            cost: Number(r.cost) || 0,
            at: r.at || new Date().toISOString(),
            ...(screenM > 0 ? { screenTimeMinutes: screenM } : {}),
          };
        });
      if (migrated.length === 0) return prev;
      rewardLogMigratedRef.current = true;
      return [...migrated].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 500);
    });
  }, [stateLoaded, rewardRequests, rewardsStore]);

  // Backfill image library from existing imageDataUrls (so old uploads are pickable)
  useEffect(() => {
    if (!stateLoaded || imageLibrary.length > 0) return;
    const seen = new Set();
    const list = [];
    const add = (dataUrl) => {
      if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:') && !seen.has(dataUrl)) {
        seen.add(dataUrl);
        list.push({ id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, dataUrl });
      }
    };
    Object.values(skillIconConfig.skills || {}).forEach((s) => add(s?.imageDataUrl));
    Object.values(skillIconConfig.subSkills || {}).forEach((bySub) => Object.values(bySub || {}).forEach((s) => add(s?.imageDataUrl)));
    Object.values(skillTreeConfig || {}).forEach((tree) => (tree?.unlocks || []).forEach((u) => add(u?.imageDataUrl)));
    if (list.length > 0) setImageLibrary(list);
  }, [stateLoaded, imageLibrary.length, skillIconConfig, skillTreeConfig]);

  // Ensure starsByPlayer has entry for each player
  useEffect(() => {
    setStarsByPlayer((prev) => {
      const next = { ...prev };
      players.forEach((p) => {
        const name = p.name;
        if (!next[name]) next[name] = { pending: 0, current: 0, totalEarned: 0 };
        const s = next[name];
        next[name] = {
          pending: typeof s.pending === 'number' ? s.pending : 0,
          current: typeof s.current === 'number' ? s.current : 0,
          totalEarned: typeof s.totalEarned === 'number' ? s.totalEarned : 0,
        };
      });
      return next;
    });
  }, [players]);

  useEffect(() => {
    setCoinsByPlayer((prev) => {
      const next = { ...prev };
      players.forEach((p) => {
        const name = p.name;
        const current = next[name] || {};
        next[name] = {
          pending: Number(current.pending) || 0,
          coins: Number(current.coins) || 0,
          pendingSpent: Number(current.pendingSpent) || 0,
          totalEarned: Number(current.totalEarned) || 0,
        };
      });
      return next;
    });
  }, [players]);

  useEffect(() => {
    setShowcaseByPlayer((prev) => {
      let changed = false;
      const next = { ...prev };
      players.forEach((p) => {
        if (!next[p.name]) {
          next[p.name] = normalizeShowcaseConfig({});
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [players]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
        components: {
          MuiSelect: {
            defaultProps: {
              MenuProps: {
                MenuListProps: { dense: true },
                PaperProps: {
                  sx: {
                    maxHeight: 'min(50vh, 360px)',
                    maxWidth: 'min(100%, calc(100vw - 16px))',
                  },
                },
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const isChoreNavDesktop = useMediaQuery(theme.breakpoints.up('md'));
  /** Chores left nav: vertical on normal screens; horizontal only if narrow, short, or mobile-sized viewport. */
  const isChoreNavVertical = useMediaQuery('(min-width: 900px) and (min-height: 500px)');

  const MAX_LEVEL = 1000;

  const levelXpThresholds = React.useMemo(() => {
    const thresholds = [0]; // thresholds[1] = 0 XP
    let points = 0;
    for (let lvl = 1; lvl < MAX_LEVEL; lvl += 1) {
      points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
      thresholds[lvl + 1] = Math.floor(points / 4);
    }
    return thresholds;
  }, []);

  const xpToLevel = (xpValue) => {
    const xp = Number(xpValue) || 0;
    if (xp <= 0) return 1;
    let level = 1;
    for (let lvl = 2; lvl <= MAX_LEVEL; lvl += 1) {
      if (xp < levelXpThresholds[lvl]) {
        break;
      }
      level = lvl;
    }
    return level;
  };

  const getLevelInfo = (xpValue) => {
    const xp = Number(xpValue) || 0;
    const level = xpToLevel(xp);
    if (level >= MAX_LEVEL) {
      return { level, xpToNextLevel: 0, progress: 1 };
    }
    const xpAtCurrent = levelXpThresholds[level];
    const xpForNext = levelXpThresholds[level + 1];
    const segment = xpForNext - xpAtCurrent;
    const progress = segment > 0 ? (xp - xpAtCurrent) / segment : 0;
    return {
      level,
      xpToNextLevel: xpForNext - xp,
      progress: Math.min(1, Math.max(0, progress)),
    };
  };

  // XP delta for a level (XP needed to go from this level to next); used for scaling task XP
  const getXpDeltaForLevel = (level) => {
    const l = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(level) || 1)));
    const low = levelXpThresholds[l] ?? 0;
    const high = levelXpThresholds[l + 1] ?? low + 1;
    return Math.max(1, high - low);
  };

  const getEntriesForSubSkill = (playerName, skillNameKey, subSkillName) => {
    const raw =
      xpByPlayer[playerName]?.[skillNameKey]?.[subSkillName];
    if (typeof raw === 'number') {
      return { actual: raw, pending: 0 };
    }
    if (!raw || typeof raw !== 'object') {
      return { actual: 0, pending: 0 };
    }
    return {
      actual: typeof raw.actual === 'number' ? raw.actual : 0,
      pending: typeof raw.pending === 'number' ? raw.pending : 0,
    };
  };

  /** Sum of all sub-skill XP for a skill (no root pool). */
  const getEntriesForSkill = (playerName, skillNameKey) => {
    const skill = mergedSkillDefsForXp.find((s) => s.name === skillNameKey);
    const subs = skill && Array.isArray(skill.subSkills) ? skill.subSkills.filter(Boolean) : [];
    if (subs.length === 0) {
      return { actual: 0, pending: 0 };
    }
    let actual = 0;
    let pending = 0;
    subs.forEach((s) => {
      const e = getEntriesForSubSkill(playerName, skillNameKey, s);
      actual += e.actual;
      pending += e.pending;
    });
    return { actual, pending };
  };

  const getXpForSubSkill = (playerName, skillNameKey, subSkillName) =>
    getEntriesForSubSkill(playerName, skillNameKey, subSkillName).actual;

  const getXpForSkill = (playerName, skillNameKey) =>
    getEntriesForSkill(playerName, skillNameKey).actual;

  // Skill tree: which unlock IDs are unlocked for a given skill and point count (respects prerequisites)
  const getUnlockedIds = (skillName, points) => {
    const tree = skillTreeConfig[skillName];
    if (!tree || !Array.isArray(tree.unlocks) || tree.unlocks.length === 0) {
      return new Set();
    }
    const unlocked = new Set();
    const pts = Number(points) || 0;
    let changed = true;
    while (changed) {
      changed = false;
      for (const u of tree.unlocks) {
        if (unlocked.has(u.id)) continue;
        const req = typeof u.requiredPoints === 'number' ? u.requiredPoints : 0;
        const prereqOk = !u.prerequisiteId || unlocked.has(u.prerequisiteId);
        if (pts >= req && prereqOk) {
          unlocked.add(u.id);
          changed = true;
        }
      }
    }
    return unlocked;
  };

  const handleGrantXp = (skillNameKey, subSkillName, amount = 1, opts = {}) => {
    if (!players.length) return;
    if (!subSkillName || typeof subSkillName !== 'string' || !subSkillName.trim()) return;
    const pi =
      typeof opts.playerIndex === 'number' && opts.playerIndex >= 0 && opts.playerIndex < players.length
        ? opts.playerIndex
        : xpTargetPlayerIndex;
    const player = players[pi];
    if (!player || !player.name) return;
    const playerName = player.name;
    const inc = Number(amount);
    if (!Number.isFinite(inc) || inc <= 0) return;
    const { taskId, taskTitle, whatHappened, starReward } = opts;
    const starsToAdd = typeof starReward === 'number' && starReward > 0 ? starReward : 0;

    setXpGrantLog((prev) => [
      {
        at: new Date().toISOString(),
        playerName,
        skillName: skillNameKey,
        subSkillName: subSkillName.trim(),
        amount: inc,
        taskId: taskId || null,
        taskTitle: taskTitle || null,
        whatHappened: whatHappened || null,
        starReward: starsToAdd || null,
      },
      ...prev.slice(0, 499),
    ]);

    if (starsToAdd > 0) {
      setStarsByPlayer((prev) => {
        const next = { ...prev };
        if (!next[playerName]) next[playerName] = { pending: 0, current: 0, totalEarned: 0 };
        next[playerName] = {
          ...next[playerName],
          pending: (next[playerName].pending || 0) + starsToAdd,
        };
        return next;
      });
    }

    setXpByPlayer((prev) => {
      const updated = { ...prev };
      if (!updated[playerName]) {
        updated[playerName] = {};
      }
      if (!updated[playerName][skillNameKey]) {
        updated[playerName][skillNameKey] = {};
      }

      const sub = subSkillName.trim();
      const current = getEntriesForSubSkill(playerName, skillNameKey, sub);
      updated[playerName][skillNameKey][sub] = {
        actual: current.actual,
        pending: current.pending + inc,
      };

      return updated;
    });
  };

  /** Play audio and loop canvas-confetti bursts until the track ends (or fallback if load fails). */
  const confettiWithSoundTrack = (audioSrc, colors, fallbackDurationMs = 8000) => {
    const audio = new Audio(audioSrc);
    let started = false;

    const runFrames = (durationMs) => {
      const end = Date.now() + durationMs;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.85 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.85 },
          colors,
        });
        confetti({
          particleCount: 4,
          spread: 80,
          origin: { x: 0.5, y: 0.9 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    };

    const startWithDuration = (ms, playSound) => {
      if (started) return;
      started = true;
      const durationMs = Number.isFinite(ms) && ms > 0 ? ms : fallbackDurationMs;
      runFrames(durationMs);
      if (playSound) {
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      }
    };

    audio.addEventListener(
      'loadedmetadata',
      () => {
        const ms =
          Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration * 1000 : fallbackDurationMs;
        startWithDuration(ms, true);
      },
      { once: true },
    );
    audio.addEventListener(
      'error',
      () => {
        if (!started) startWithDuration(fallbackDurationMs, false);
      },
      { once: true },
    );
    audio.load();
  };

  const fireworkShow = (playerFavouriteColor) => {
    const colors = playerFavouriteColor && /^#[0-9A-Fa-f]{6}$/.test(playerFavouriteColor)
      ? [playerFavouriteColor]
      : ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'];
    confettiWithSoundTrack(FIREWORKS_MP3_SRC, colors, 8000);
  };

  const XP_REDEEM_CONFETTI_COLORS = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'];

  const handleRedeemXp = (playerName, skillNameKey, subSkillName) => {
    if (!subSkillName || typeof subSkillName !== 'string' || !subSkillName.trim()) return;
    const current = getEntriesForSubSkill(playerName, skillNameKey, subSkillName.trim());
    const levelBefore = xpToLevel(current.actual);
    const levelAfter = xpToLevel(current.actual + current.pending);
    const isLevelUp = levelAfter > levelBefore;

    setXpByPlayer((prev) => {
      const updated = { ...prev };
      if (!updated[playerName] || !updated[playerName][skillNameKey]) {
        return prev;
      }

      const sub = subSkillName.trim();
      updated[playerName][skillNameKey][sub] = {
        actual: current.actual + current.pending,
        pending: 0,
      };

      return updated;
    });

    confettiWithSoundTrack(CONFETTI_MP3_SRC, XP_REDEEM_CONFETTI_COLORS, 6000);
    if (isLevelUp) {
      setSkillPointsByPlayer((prev) => {
        const next = { ...prev };
        if (!next[playerName]) next[playerName] = {};
        next[playerName][skillNameKey] = (next[playerName][skillNameKey] ?? 0) + 1;
        return next;
      });
      const player = players.find((p) => p.name === playerName);
      setTimeout(() => fireworkShow(player?.favouriteColor), 2800);
    }
  };

  const addSkill = () => {
    const name = skillName.trim();
    const subSkills = newSkillSubSkills
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!name) return;

    if (subSkills.length === 0) {
      return;
    }

    Promise.all(
      subSkills.map((sub) =>
        axios.post(apiUrl('/skills'), {
          name,
          subSkill: sub,
        }, { headers: authHeaders })
      )
    ).then((responses) => {
      const last = responses[responses.length - 1];
      setSkills(last.data);
      setSkillName('');
      setNewSkillSubSkills(['']);
    });
  };

  const handleNewSkillSubSkillChange = (index, value) => {
    setNewSkillSubSkills((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddNewSkillSubSkillField = () => {
    setNewSkillSubSkills((prev) => [...prev, '']);
  };

  const handleCloseTaskDialog = () => {
    setEditingTaskId(null);
    setTaskSkillName('');
    setTaskSubSkillName('');
    setTaskTitle('');
    setTaskRequiredLevel('');
    setTaskXpReward('');
    setTaskGrantStars(false);
    setTaskStarAmount('1');
    setTaskScaleXpWithLevel(false);
  };

  useEffect(() => {
    if (skillsLeftTab !== 'tasks') {
      handleCloseTaskDialog();
    }
  }, [skillsLeftTab]);

  const getChoreThemeConfig = (player) => {
    const themeId = player?.choreTheme || 'unicorns';
    const base = CHORE_THEMES.find((t) => t.id === themeId) || CHORE_THEMES[0];
    return {
      ...base,
      questBorder: player?.questBoxBorderColor || base.questBorder,
      questBg: player?.questBoxBgColor || base.questBg,
      questTitle: player?.questBoxTitle || "Today's Quests",
    };
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskSkillName(task.skillName || '');
    setTaskSubSkillName(task.subSkillName || '');
    setTaskTitle(task.title || '');
    setTaskRequiredLevel(String(task.requiredLevel ?? 1));
    setTaskXpReward(String(task.xpReward ?? 0));
    setTaskGrantStars(!!(task.starReward && task.starReward > 0));
    setTaskStarAmount(String(task.starReward && task.starReward > 0 ? task.starReward : '1'));
    setTaskScaleXpWithLevel(!!task.scaleXpWithLevel);
  };

  const handleUpdateTask = () => {
    if (!editingTaskId) return;
    const skill = taskSkillName.trim();
    const title = taskTitle.trim();
    const lvl = Number(taskRequiredLevel) || 1;
    const xp = Number(taskXpReward) || 0;
    if (!skill || !title || xp <= 0) return;
    const skillDef = getSkillDefMerged(skill);
    const subs = skillDef && Array.isArray(skillDef.subSkills) ? skillDef.subSkills.filter(Boolean) : [];
    if (subs.length === 0) return;
    const subName = (taskSubSkillName || '').trim();
    if (!subName || !subs.includes(subName)) return;
    const starAmt = taskGrantStars ? (Number(taskStarAmount) || 0) : 0;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              skillName: skill,
              subSkillName: subName,
              title,
              requiredLevel: lvl,
              xpReward: xp,
              starReward: starAmt > 0 ? starAmt : undefined,
              scaleXpWithLevel: taskScaleXpWithLevel || undefined,
            }
          : t
      )
    );
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskRequiredLevel('');
    setTaskXpReward('');
    setTaskGrantStars(false);
    setTaskStarAmount('1');
    setTaskScaleXpWithLevel(false);
  };

  const handleAddTask = () => {
    const skill = taskSkillName.trim();
    const title = taskTitle.trim();
    const lvl = Number(taskRequiredLevel) || 1;
    const xp = Number(taskXpReward) || 0;

    if (!skill || !title || xp <= 0) return;

    const skillDef = getSkillDefMerged(skill);
    const subs = skillDef && Array.isArray(skillDef.subSkills) ? skillDef.subSkills.filter(Boolean) : [];
    if (subs.length === 0) return;
    const subName = (taskSubSkillName || '').trim();
    if (!subName || !subs.includes(subName)) return;

    const starAmt = taskGrantStars ? (Number(taskStarAmount) || 0) : 0;
    const newTask = {
      id: Date.now().toString(),
      skillName: skill,
      subSkillName: subName,
      title,
      requiredLevel: lvl,
      xpReward: xp,
      starReward: starAmt > 0 ? starAmt : undefined,
      scaleXpWithLevel: taskScaleXpWithLevel || undefined,
    };

    setTasks((prev) => [...prev, newTask]);
    setTaskTitle('');
    setTaskRequiredLevel('');
    setTaskXpReward('');
    setTaskGrantStars(false);
    setTaskStarAmount('1');
    setTaskScaleXpWithLevel(false);
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskRequiredLevel('');
    setTaskXpReward('');
    setTaskGrantStars(false);
    setTaskStarAmount('1');
    setTaskScaleXpWithLevel(false);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    if (role === 'Player') {
      setSettingsSection('playerAppearance');
    }
  };
  const handleLogout = () => {
    clearStoredSession();
    setRole(null);
    setSelectedRole(null);
  };

  const getCurrentPlayerName = () => {
    if (role === 'Life Master') return players[xpTargetPlayerIndex]?.name || '';
    if (role === 'Player' && activePlayerIndex != null) return players[activePlayerIndex]?.name || '';
    return '';
  };

  const getQuestsForPlayerToday = (playerName) => {
    const key = getTodayKey();
    const byDate = questsByDate[key] || {};
    return byDate[playerName] || [];
  };

  /** Add/remove a chore from today's quest list for a player (Life Master hearts, or same pattern for Player). */
  const toggleQuestChoreForPlayerToday = (playerName, choreId) => {
    if (!playerName || !choreId) return;
    const day = getTodayKey();
    setQuestsByDate((prev) => {
      const dayMap = { ...(prev[day] || {}) };
      const cur = [...(dayMap[playerName] || [])];
      const idx = cur.indexOf(choreId);
      const adding = idx < 0;
      if (adding) {
        Object.keys(dayMap).forEach((pn) => {
          if (pn === playerName) return;
          const ids = [...(dayMap[pn] || [])];
          const j = ids.indexOf(choreId);
          if (j >= 0) ids.splice(j, 1);
          dayMap[pn] = ids;
        });
        cur.push(choreId);
      } else {
        cur.splice(idx, 1);
      }
      dayMap[playerName] = cur;
      const nextQuests = { ...prev, [day]: dayMap };
      const stillNeeded = Object.values(dayMap).some((ids) => (ids || []).includes(choreId));
      setChores((prevChores) =>
        prevChores.map((c) => {
          if (c.id !== choreId) return c;
          if (adding) {
            return { ...c, assignedQuestTo: playerName, questOnly: true };
          }
          if (!stillNeeded) {
            return { ...c, questOnly: false, assignedQuestTo: undefined };
          }
          const assignee = Object.keys(dayMap).find((pn) => (dayMap[pn] || []).includes(choreId));
          return { ...c, questOnly: true, assignedQuestTo: assignee || c.assignedQuestTo };
        }),
      );
      return nextQuests;
    });
  };

  const getCompletionsForChore = (choreId, schedule) => {
    return choreActivity.filter((a) => a.choreId === choreId && a.periodKey === getPeriodKey(schedule));
  };

  const canPlayerCompleteChore = (playerName, chore) => {
    if (!playerName || !chore) return false;
    if (!canPlayerActOnBedroomChore(playerName, chore)) return false;
    const completions = getCompletionsForChore(chore.id, chore.schedule);
    if (completions.length > 0) return false;
    const todayQuests = getQuestsForPlayerToday(playerName);
    if (chore.assignedQuestTo && chore.assignedQuestTo !== playerName) return false;
    if (chore.questOnly && !todayQuests.includes(chore.id)) return false;
    return true;
  };

  const handleAddChoreSkillDefinition = () => {
    const name = newChoreSkillNameInput.trim();
    if (!name) return;
    if (skills.some((s) => s.name === name) || choreSkills.some((s) => s.name === name)) return;
    const subSkills = newChoreSkillSubSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (subSkills.length === 0) return;
    setChoreSkills((prev) => [...prev, { name, subSkills }]);
    setNewChoreSkillNameInput('');
    setNewChoreSkillSubSkillsInput('');
  };

  const handleSaveManageChoreSkillEdit = () => {
    if (manageChoreSkillEditIdx == null) return;
    const idx = manageChoreSkillEditIdx;
    const old = choreSkills[idx];
    if (!old) return;
    const newName = manageChoreSkillEditName.trim();
    const subs = manageChoreSkillEditSubs.split(',').map((s) => s.trim()).filter(Boolean);
    if (!newName || subs.length === 0) return;
    if (newName !== old.name) {
      if (skills.some((s) => s.name === newName)) return;
      if (choreSkills.some((s, i) => s.name === newName && i !== idx)) return;
      setChores((prev) =>
        prev.map((c) => (c.skillName === old.name ? { ...c, skillName: newName } : c)),
      );
      setXpByPlayer((prev) => {
        const next = JSON.parse(JSON.stringify(prev || {}));
        Object.keys(next).forEach((pn) => {
          if (next[pn]?.[old.name]) {
            next[pn][newName] = next[pn][old.name];
            delete next[pn][old.name];
          }
        });
        return next;
      });
      setXpGrantLog((prev) =>
        prev.map((e) => (e.skillName === old.name ? { ...e, skillName: newName } : e)),
      );
    }
    setChoreSkills((prev) => {
      const next = [...prev];
      next[idx] = { name: newName, subSkills: subs };
      return next;
    });
    setManageChoreSkillEditIdx(null);
    setManageChoreSkillEditName('');
    setManageChoreSkillEditSubs('');
  };

  const handleCompleteChore = (chore) => {
    const playerName = getCurrentPlayerName();
    if (!canPlayerCompleteChore(playerName, chore)) return;
    const now = new Date();
    const periodKey = getPeriodKey(chore.schedule, now);
    const effort = Math.min(5, Math.max(1, Number(chore.effortStars) || 1));
    const earnedCoins = Number(effortCoinsByStar[effort]) || 0;
    const starGain = Math.max(0, Number(chore.starReward) || 0);

    setChoreActivity((prev) => [
      {
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
      },
      ...prev,
    ]);

    setCoinsByPlayer((prev) => {
      const next = { ...prev };
      const cur = next[playerName] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
      next[playerName] = {
        ...cur,
        pending: (Number(cur.pending) || 0) + earnedCoins,
        totalEarned: (Number(cur.totalEarned) || 0) + earnedCoins,
      };
      return next;
    });

    if (starGain > 0) {
      setStarsByPlayer((prev) => {
        const next = { ...prev };
        const cur = next[playerName] || { pending: 0, current: 0, totalEarned: 0 };
        next[playerName] = { ...cur, pending: (Number(cur.pending) || 0) + starGain };
        return next;
      });
    }

    if (chore.skillName && choreXpFromEffortStars(chore.effortStars) > 0) {
      const baseXp = choreXpFromEffortStars(chore.effortStars);
      if (baseXp > 0) {
        const skillDef = resolveSkillDefForChore(chore.skillName);
        const subs = skillDef && Array.isArray(skillDef.subSkills) ? skillDef.subSkills.filter(Boolean) : [];
        const minLevel = Math.max(1, Number(chore.requiredLevel) || 1);
        const pickedSub = typeof chore.subSkillName === 'string' ? chore.subSkillName.trim() : '';
        if (skillDef && subs.length > 0 && pickedSub && subs.includes(pickedSub)) {
          let xp = baseXp;
          if (chore.scaleXpWithLevel) {
            const currentXp = getXpForSubSkill(playerName, chore.skillName, pickedSub);
            const currentLevel = xpToLevel(currentXp);
            xp = Math.max(
              1,
              Math.round(
                (baseXp * getXpDeltaForLevel(currentLevel)) / getXpDeltaForLevel(minLevel),
              ),
            );
          }
          setXpByPlayer((prev) => {
            const next = JSON.parse(JSON.stringify(prev || {}));
            if (!next[playerName]) next[playerName] = {};
            if (!next[playerName][chore.skillName]) next[playerName][chore.skillName] = {};
            const raw = next[playerName][chore.skillName][pickedSub];
            const current =
              typeof raw === 'number'
                ? { actual: raw, pending: 0 }
                : !raw || typeof raw !== 'object'
                  ? { actual: 0, pending: 0 }
                  : {
                      actual: typeof raw.actual === 'number' ? raw.actual : 0,
                      pending: typeof raw.pending === 'number' ? raw.pending : 0,
                    };
            next[playerName][chore.skillName][pickedSub] = {
              actual: current.actual,
              pending: current.pending + xp,
            };
            return next;
          });
          setXpGrantLog((prev) => [
            {
              at: now.toISOString(),
              playerName,
              skillName: chore.skillName,
              subSkillName: pickedSub,
              amount: xp,
              taskId: chore.id || null,
              taskTitle: chore.title || null,
              whatHappened: 'Chore completed',
              starReward: null,
            },
            ...prev.slice(0, 499),
          ]);
        } else if (skillDef && subs.length > 0) {
          const n = subs.length;
          const per = Math.floor(baseXp / n);
          const rem = baseXp % n;
          setXpByPlayer((prev) => {
            const next = JSON.parse(JSON.stringify(prev || {}));
            if (!next[playerName]) next[playerName] = {};
            if (!next[playerName][chore.skillName]) next[playerName][chore.skillName] = {};
            subs.forEach((subName, i) => {
              let inc = per + (i < rem ? 1 : 0);
              if (inc <= 0) return;
              if (chore.scaleXpWithLevel) {
                const curXpVal = getXpForSubSkill(playerName, chore.skillName, subName);
                const currentLevel = xpToLevel(curXpVal);
                inc = Math.max(
                  1,
                  Math.round(
                    (inc * getXpDeltaForLevel(currentLevel)) / getXpDeltaForLevel(minLevel),
                  ),
                );
              }
              const raw = next[playerName][chore.skillName][subName];
              const current =
                typeof raw === 'number'
                  ? { actual: raw, pending: 0 }
                  : !raw || typeof raw !== 'object'
                    ? { actual: 0, pending: 0 }
                    : {
                        actual: typeof raw.actual === 'number' ? raw.actual : 0,
                        pending: typeof raw.pending === 'number' ? raw.pending : 0,
                      };
              next[playerName][chore.skillName][subName] = {
                actual: current.actual,
                pending: current.pending + inc,
              };
            });
            return next;
          });
          setXpGrantLog((prev) => {
            const entries = subs
              .map((subName, i) => {
                let amount = per + (i < rem ? 1 : 0);
                if (amount <= 0) return null;
                if (chore.scaleXpWithLevel) {
                  const curXpVal = getXpForSubSkill(playerName, chore.skillName, subName);
                  const currentLevel = xpToLevel(curXpVal);
                  amount = Math.max(
                    1,
                    Math.round(
                      (amount * getXpDeltaForLevel(currentLevel)) / getXpDeltaForLevel(minLevel),
                    ),
                  );
                }
                return {
                  at: now.toISOString(),
                  playerName,
                  skillName: chore.skillName,
                  subSkillName: subName,
                  amount,
                  taskId: chore.id || null,
                  taskTitle: chore.title || null,
                  whatHappened: 'Chore completed',
                  starReward: null,
                };
              })
              .filter(Boolean);
            return [...entries, ...prev].slice(0, 500);
          });
        }
      }
    }
  };

  const getStreakDays = (playerName) => {
    const countsByDate = {};
    choreActivity.forEach((a) => {
      if (a.playerName !== playerName) return;
      countsByDate[a.dateKey] = (countsByDate[a.dateKey] || 0) + 1;
    });
    let streak = 0;
    let cursor = new Date();
    while (true) {
      const key = getTodayKey(cursor);
      if ((countsByDate[key] || 0) >= 3) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getTodayDoneCount = (playerName) =>
    choreActivity.filter((a) => a.playerName === playerName && a.dateKey === getTodayKey()).length;

  const addScreenTimeMinutesForPlayer = (playerName, minutes) => {
    const m = Math.max(0, Math.floor(Number(minutes) || 0));
    if (m <= 0 || !playerName) return;
    setScreenTimeByPlayer((prev) => {
      const cur = prev[playerName] || { balanceMinutes: 0, activeUntil: null, lifetimeMinutesRedeemed: 0 };
      return {
        ...prev,
        [playerName]: {
          balanceMinutes: (Number(cur.balanceMinutes) || 0) + m,
          activeUntil: cur.activeUntil || null,
          lifetimeMinutesRedeemed: (Number(cur.lifetimeMinutesRedeemed) || 0) + m,
        },
      };
    });
  };

  const handlePauseScreenTime = (playerName) => {
    if (!playerName) return;
    setScreenTimeByPlayer((prev) => {
      const cur = prev[playerName];
      if (!cur?.activeUntil) return prev;
      const endMs = new Date(cur.activeUntil).getTime();
      const rem = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      if (rem <= 0) return prev;
      return {
        ...prev,
        [playerName]: {
          ...cur,
          activeUntil: null,
          pausedRemainingSec: rem,
        },
      };
    });
  };

  const handleResumeScreenTime = (playerName) => {
    if (!playerName) return;
    setScreenTimeByPlayer((prev) => {
      const cur = prev[playerName];
      const pr = cur?.pausedRemainingSec;
      if (pr == null || pr <= 0) return prev;
      return {
        ...prev,
        [playerName]: {
          ...cur,
          activeUntil: new Date(Date.now() + pr * 1000).toISOString(),
          pausedRemainingSec: undefined,
        },
      };
    });
  };

  const handleRefundScreenTimeRedemption = (entryId) => {
    const entry = rewardRedemptionLog.find((e) => e && e.id === entryId);
    if (!entry || entry.refunded) return;
    const m = Math.max(0, Math.floor(Number(entry.screenTimeMinutes) || 0));
    if (m <= 0) return;
    const playerName = entry.playerName;
    const deductSec = m * 60;

    setRewardRedemptionLog((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, refunded: true } : e)),
    );

    setScreenTimeByPlayer((prev) => {
      const cur = prev[playerName] || { balanceMinutes: 0, activeUntil: null, lifetimeMinutesRedeemed: 0 };
      const newBal = Math.max(0, (Number(cur.balanceMinutes) || 0) - m);
      const newLife = Math.max(0, (Number(cur.lifetimeMinutesRedeemed) || 0) - m);

      let activeUntil = cur.activeUntil;
      let pausedRemainingSec = cur.pausedRemainingSec;
      let sessionDurationSec = cur.sessionDurationSec;

      const remFromPaused = pausedRemainingSec != null ? Math.max(0, Math.floor(Number(pausedRemainingSec))) : null;
      const remFromActive = activeUntil
        ? Math.max(0, Math.floor((new Date(activeUntil).getTime() - Date.now()) / 1000))
        : 0;
      const rem = remFromPaused != null ? remFromPaused : remFromActive;

      if (rem > 0 || activeUntil || pausedRemainingSec != null) {
        const newRem = Math.max(0, rem - deductSec);
        const curSess = Math.max(0, Math.floor(Number(sessionDurationSec) || 0));
        const newSess = Math.max(0, curSess - deductSec);

        if (newRem <= 0) {
          activeUntil = null;
          pausedRemainingSec = undefined;
          sessionDurationSec = undefined;
        } else {
          sessionDurationSec = newSess > 0 ? newSess : newRem;
          if (pausedRemainingSec != null) {
            pausedRemainingSec = newRem;
          } else if (activeUntil) {
            activeUntil = new Date(Date.now() + newRem * 1000).toISOString();
          }
        }
      }

      return {
        ...prev,
        [playerName]: {
          ...cur,
          balanceMinutes: newBal,
          lifetimeMinutesRedeemed: newLife,
          activeUntil,
          pausedRemainingSec,
          sessionDurationSec,
        },
      };
    });
  };

  const handleStartScreenTime = (playerName, minutes) => {
    if (!playerName) return;
    const requested = Math.floor(Number(minutes) || 0);
    setScreenTimeByPlayer((prev) => {
      const cur = prev[playerName] || { balanceMinutes: 0, activeUntil: null, lifetimeMinutesRedeemed: 0 };
      const bal = Math.max(0, Number(cur.balanceMinutes) || 0);
      if (bal <= 0 || cur.activeUntil || cur.pausedRemainingSec != null) return prev;
      const useMin = Math.min(
        SCREEN_TIME_MAX_MINUTES_PER_TURN,
        bal,
        Math.max(1, requested),
      );
      const durationSec = useMin * 60;
      const end = Date.now() + durationSec * 1000;
      return {
        ...prev,
        [playerName]: {
          ...cur,
          balanceMinutes: bal - useMin,
          activeUntil: new Date(end).toISOString(),
          sessionDurationSec: durationSec,
        },
      };
    });
  };

  const handleRedeemCoinToJar = (playerName) => {
    if (!playerName) return;
    setCoinsByPlayer((prev) => {
      const next = { ...prev };
      const cur = next[playerName] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
      const pending = Number(cur.pending) || 0;
      if (pending <= 0) return prev;
      next[playerName] = {
        ...cur,
        pending: pending - 1,
        coins: (Number(cur.coins) || 0) + 1,
      };
      return next;
    });
  };

  const handleRequestReward = (rewardId) => {
    const playerName = getCurrentPlayerName();
    const player = players.find((p) => p.name === playerName);
    const reward = rewardsStore.find((r) => r.id === rewardId);
    if (!playerName || !reward || !rewardIsVisibleToPlayer(reward, playerName)) return;
    const cost = Math.max(0, Number(reward.cost) || 0);
    const wallet = coinsByPlayer[playerName] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
    if ((wallet.coins || 0) < cost) return;

    setCoinsByPlayer((prev) => {
      const next = { ...prev };
      const cur = next[playerName] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
      next[playerName] = {
        ...cur,
        coins: (Number(cur.coins) || 0) - cost,
        pendingSpent: (Number(cur.pendingSpent) || 0) + cost,
      };
      return next;
    });

    const screenM = Math.max(0, Math.floor(Number(reward.screenTimeMinutes) || 0));
    if (player?.userType !== 'Adult') {
      setRewardRequests((prev) => [
        {
          id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          playerName,
          rewardId,
          rewardName: reward.name,
          cost,
          screenTimeMinutes: screenM,
          status: 'pending',
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      const at = new Date().toISOString();
      setRewardRedemptionLog((prev) =>
        [
          {
            id: `rd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            playerName,
            rewardId,
            rewardName: reward.name,
            cost,
            at,
            ...(screenM > 0 ? { screenTimeMinutes: screenM } : {}),
          },
          ...prev,
        ].slice(0, 500),
      );
      addScreenTimeMinutesForPlayer(playerName, screenM);
    }
  };

  const handleResolveRewardRequest = (requestId, approved) => {
    const req = rewardRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'pending') return;
    setRewardRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: approved ? 'approved' : 'denied' } : r)));
    if (approved) {
      const at = new Date().toISOString();
      const rewardDef = rewardsStore.find((r) => r.id === req.rewardId);
      const screenM = Math.max(
        0,
        Math.floor(Number(req.screenTimeMinutes) || Number(rewardDef?.screenTimeMinutes) || 0),
      );
      setRewardRedemptionLog((prev) =>
        [
          {
            id: `rd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            playerName: req.playerName,
            rewardId: req.rewardId,
            rewardName: req.rewardName,
            cost: Number(req.cost) || 0,
            at,
            ...(screenM > 0 ? { screenTimeMinutes: screenM } : {}),
          },
          ...prev,
        ].slice(0, 500),
      );
      addScreenTimeMinutesForPlayer(req.playerName, screenM);
    }
    setCoinsByPlayer((prev) => {
      const next = { ...prev };
      const cur = next[req.playerName] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
      const pendingSpent = Math.max(0, (Number(cur.pendingSpent) || 0) - (Number(req.cost) || 0));
      const coins = approved ? (Number(cur.coins) || 0) : ((Number(cur.coins) || 0) + (Number(req.cost) || 0));
      next[req.playerName] = { ...cur, coins, pendingSpent };
      return next;
    });
  };

  const handleRequestStarReward = (rewardId) => {
    const playerName = getCurrentPlayerName();
    const player = players.find((p) => p.name === playerName);
    const reward = starRewards.find((r) => r.id === rewardId);
    if (!playerName || !reward || !rewardIsVisibleToPlayer(reward, playerName)) return;
    const cost = Math.max(0, Number(reward.cost) || 0);
    if (cost <= 0) return;
    const star = starsByPlayer[playerName] || { pending: 0, current: 0, totalEarned: 0 };
    if ((star.current || 0) < cost) return;

    setStarsByPlayer((prev) => {
      const s = prev[playerName] || { pending: 0, current: 0, totalEarned: 0 };
      return {
        ...prev,
        [playerName]: { ...s, current: Math.max(0, (s.current || 0) - cost) },
      };
    });

    // Kids (non-Adult): stars are held until a parent approves; deny refunds the cost back into the jar.
    if (player?.userType !== 'Adult') {
      setStarRewardRequests((prev) => [
        {
          id: `sreq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          playerName,
          rewardId,
          rewardName: reward.name,
          cost,
          status: 'pending',
          at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const handleResolveStarRewardRequest = (requestId, approved) => {
    const req = starRewardRequests.find((r) => r.id === requestId);
    if (!req || req.status !== 'pending') return;
    setStarRewardRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: approved ? 'approved' : 'denied' } : r)));
    if (!approved) {
      const cost = Number(req.cost) || 0;
      if (cost <= 0) return;
      setStarsByPlayer((prev) => {
        const s = prev[req.playerName] || { pending: 0, current: 0, totalEarned: 0 };
        return {
          ...prev,
          [req.playerName]: { ...s, current: (s.current || 0) + cost },
        };
      });
    }
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    setSettingsSection('account');
    setSettingsTarget('');
    setSettingsIconName('');
    setResetSectionPin('');
    setResetSectionConfirm('');
    setResetSectionMessage('');
    setSettingsAchievementsTab('skill');
  };

  const handleChangeLifeMasterPin = () => {
    setAccountPinMessage('');
    const current = accountCurrentPin.trim();
    const newPin = accountNewPin.trim();
    const confirm = accountConfirmPin.trim();
    if (current !== lifeMasterPin) {
      setAccountPinMessage('Current PIN is incorrect.');
      return;
    }
    if (!newPin) {
      setAccountPinMessage('Enter a new PIN.');
      return;
    }
    if (newPin !== confirm) {
      setAccountPinMessage('New PIN and confirmation do not match.');
      return;
    }
    setLifeMasterPin(newPin);
    setAccountCurrentPin('');
    setAccountNewPin('');
    setAccountConfirmPin('');
    setAccountPinMessage('Life Master PIN updated.');
    // Persist the new PIN immediately so it survives refresh and is written to disk
    axios
      .post(apiUrl('/state'), {
        skills,
        players,
        xpByPlayer,
        tasks,
        skillIconConfig,
        enabledIconPackages,
        lifeMasterPin: newPin,
      }, { headers: { 'x-life-master-pin': accountCurrentPin.trim() || lifeMasterPin } })
      .catch(() => {
        setAccountPinMessage('PIN updated locally but save to server failed.');
      });
  };

  const enabledPackagesList = React.useMemo(() => {
    const list = [];
    enabledIconPackages.forEach((id) => {
      if (id === 'mui') {
        list.push(MUI_PACKAGE);
        return;
      }
      const setInfo = REACT_ICONS_SETS.find((s) => s.id === id);
      const label = setInfo?.label || id;
      const lib = getReactIconsPackage(id);
      list.push({
        id,
        label,
        getIconNames: lib
          ? () => Object.keys(lib).filter((k) => typeof lib[k] === 'function').sort()
          : () => [],
        getIcon: lib ? (name) => lib[name] || null : () => null,
      });
    });
    const combinedNames = list.flatMap((p) => {
      try {
        return p.getIconNames().map((n) => `${p.id}:${n}`);
      } catch (_) {
        return [];
      }
    }).sort();
    const combinedEntry = {
      id: '__all__',
      label: 'All (combined)',
      getIconNames: () => combinedNames,
      getIcon: (combinedName) => {
        const i = combinedName.indexOf(':');
        if (i < 0) return null;
        const pkgId = combinedName.slice(0, i);
        const iconName = combinedName.slice(i + 1);
        const p = list.find((x) => x.id === pkgId);
        return p ? p.getIcon(iconName) : null;
      },
    };
    return [combinedEntry, ...list];
  }, [enabledIconPackages]);

  const getSkillIconConfig = (skillName, subSkillName) => {
    if (subSkillName != null && subSkillName !== '') {
      const sub = skillIconConfig.subSkills?.[skillName]?.[subSkillName];
      if (sub?.imageDataUrl) {
        const src = sub.imageDataUrl;
        return function SkillImageIcon(props) { return <Box component="img" src={src} alt="" {...props} sx={{ width: 24, height: 24, objectFit: 'contain', ...props.sx }} />; };
      }
      if (sub?.package && sub?.icon) {
        const pkg = enabledPackagesList.find((p) => p.id === sub.package);
        return pkg?.getIcon(sub.icon) || null;
      }
      return null;
    }
    const sk = skillIconConfig.skills?.[skillName];
    if (sk?.imageDataUrl) {
      const src = sk.imageDataUrl;
      return function SkillImageIcon(props) { return <Box component="img" src={src} alt="" {...props} sx={{ width: 24, height: 24, objectFit: 'contain', ...props.sx }} />; };
    }
    if (sk?.package && sk?.icon) {
      const pkg = enabledPackagesList.find((p) => p.id === sk.package);
      return pkg?.getIcon(sk.icon) || null;
    }
    return null;
  };

  const getDocContent = (skillName, subSkillName) => {
    if (subSkillName != null && subSkillName !== '') {
      return skillDocConfig.subSkills?.[skillName]?.[subSkillName] ?? null;
    }
    return skillDocConfig.skills?.[skillName] ?? null;
  };

  const getDocContentByTarget = (target) => {
    if (!target) return null;
    const parts = target.split(':');
    const type = parts[0];
    const skillName = parts[1];
    const subSkillName = type === 'subSkill' ? parts[2] : null;
    return getDocContent(skillName, subSkillName);
  };

  const handleDocClick = (e, skillName, subSkillName) => {
    const target = subSkillName != null ? `subSkill:${skillName}:${subSkillName}` : `skill:${skillName}`;
    const content = getDocContent(skillName, subSkillName);
    setDocTarget(target);
    if (content && typeof content === 'string' && content.startsWith('http')) {
      window.open(content, '_blank', 'noopener,noreferrer');
      return;
    }
    setDocDialogOpen(true);
    if (content && typeof content === 'string') {
      setDocContentInput(content);
      setDocViewMode('view');
    } else {
      setDocContentInput('');
      setDocViewMode(role === 'Life Master' ? 'edit' : 'view');
    }
  };

  const handleDocEdit = () => {
    setDocContentInput(getDocContentByTarget(docTarget) || '');
    setDocViewMode('edit');
  };

  const handleSaveDocContent = () => {
    if (!docTarget) return;
    const parts = docTarget.split(':');
    const type = parts[0];
    const skillName = parts[1];
    const subSkillName = type === 'subSkill' ? parts[2] : null;
    const content = docContentInput.trim();
    setSkillDocConfig(prev => {
      const next = { ...prev };
      if (type === 'skill') {
        if (content) next.skills = { ...prev.skills, [skillName]: content };
        else { next.skills = { ...prev.skills }; delete next.skills[skillName]; }
      } else if (type === 'subSkill' && subSkillName) {
        next.subSkills = { ...prev.subSkills, [skillName]: { ...(prev.subSkills?.[skillName] || {}) } };
        if (content) next.subSkills[skillName][subSkillName] = content;
        else delete next.subSkills[skillName][subSkillName];
      }
      return next;
    });
    setDocDialogOpen(false);
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (imageUploadPreviewUrl) URL.revokeObjectURL(imageUploadPreviewUrl);
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-') || 'image';
    setImageUploadFile(file);
    setImageUploadName(base);
    setImageUploadPreviewUrl(URL.createObjectURL(file));
    setImageUploadOpen(true);
    e.target.value = '';
  };

  const handleInsertImage = () => {
    if (!imageUploadFile || !imageUploadName.trim()) return;
    const urlToRevoke = imageUploadPreviewUrl;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const markdown = `![${imageUploadName.trim()}](${dataUrl})`;
      const ta = docEditorRef.current;
      const start = ta?.selectionStart ?? docContentInput.length;
      const end = ta?.selectionEnd ?? docContentInput.length;
      const before = docContentInput.slice(0, start);
      const after = docContentInput.slice(end);
      setDocContentInput(before + markdown + after);
      setImageUploadOpen(false);
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      setImageUploadPreviewUrl('');
      setImageUploadFile(null);
      setImageUploadName('');
      setTimeout(() => {
        const pos = start + markdown.length;
        if (ta) {
          ta.focus();
          ta.setSelectionRange(pos, pos);
        }
      }, 0);
    };
    reader.readAsDataURL(imageUploadFile);
  };

  const handleCloseImageUpload = () => {
    if (imageUploadPreviewUrl) URL.revokeObjectURL(imageUploadPreviewUrl);
    setImageUploadPreviewUrl('');
    setImageUploadOpen(false);
    setImageUploadFile(null);
  };

  const handleApplySettingsIcon = () => {
    if (!settingsTarget) return;
    const parts = settingsTarget.split(':');
    const type = parts[0];
    const skillName = parts[1];
    const subSkillName = type === 'subSkill' ? parts[2] : null;
    const pkg = enabledPackagesList.find((p) => p.id === settingsIconPkg);
    if (!pkg || !settingsIconName) return;
    if (type === 'skill') {
      setSkillIconConfig(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skillName]: { package: settingsIconPkg, icon: settingsIconName },
        },
      }));
    } else if (type === 'subSkill' && subSkillName) {
      setSkillIconConfig(prev => ({
        ...prev,
        subSkills: {
          ...prev.subSkills,
          [skillName]: {
            ...(prev.subSkills?.[skillName] || {}),
            [subSkillName]: { package: settingsIconPkg, icon: settingsIconName },
          },
        },
      }));
    }
    handleCloseSettings();
  };

  const handleApplyChangeIconSkill = (applyToSubSkills) => {
    if (!changeIconTarget || !settingsIconPkg || !settingsIconName) return;
    const parts = changeIconTarget.split(':');
    const type = parts[0];
    const skillName = parts[1];
    const subSkillName = type === 'subSkill' ? parts[2] : null;
    if (type === 'skillTree') {
      const unlockId = parts[2];
      if (!unlockId) return;
      setSkillTreeConfig((prev) => {
        const tree = prev[skillName] || { unlocks: [] };
        const unlocks = (tree.unlocks || []).map((u) =>
          u.id === unlockId ? { ...u, icon: { package: settingsIconPkg, icon: settingsIconName }, imageDataUrl: null } : u
        );
        return { ...prev, [skillName]: { ...tree, unlocks } };
      });
      setChangeIconAnchorEl(null);
      return;
    }
    setSkillIconConfig(prev => {
      const next = { ...prev };
      if (type === 'skill') {
        next.skills = { ...prev.skills, [skillName]: { package: settingsIconPkg, icon: settingsIconName } };
        if (applyToSubSkills) {
          const skill = skills.find((s) => s.name === skillName);
          const subList = skill?.subSkills || [];
          next.subSkills = { ...prev.subSkills, [skillName]: { ...(prev.subSkills?.[skillName] || {}) } };
          subList.forEach((s) => {
            next.subSkills[skillName][s] = { package: settingsIconPkg, icon: settingsIconName };
          });
        }
      } else if (type === 'subSkill' && subSkillName) {
        next.subSkills = {
          ...prev.subSkills,
          [skillName]: {
            ...(prev.subSkills?.[skillName] || {}),
            [subSkillName]: { package: settingsIconPkg, icon: settingsIconName },
          },
        };
      }
      return next;
    });
    setChangeIconAnchorEl(null);
  };

  const addImageToLibrary = (dataUrl) => {
    if (!dataUrl || typeof dataUrl !== 'string') return;
    setImageLibrary((prev) => {
      const exists = prev.some((e) => e.dataUrl === dataUrl);
      if (exists) return prev;
      return [...prev, { id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, dataUrl }];
    });
  };

  const handleApplyImageToSkill = (dataUrl) => {
    if (!changeIconTarget || !dataUrl) return;
    const parts = changeIconTarget.split(':');
    const type = parts[0];
    const skillName = parts[1];
    const subSkillName = type === 'subSkill' ? parts[2] : null;
    setSkillIconConfig((prev) => {
      const next = { ...prev };
      if (type === 'skill') {
        next.skills = { ...prev.skills, [skillName]: { ...(prev.skills?.[skillName] || {}), imageDataUrl: dataUrl, package: undefined, icon: undefined } };
      } else if (type === 'subSkill' && subSkillName) {
        next.subSkills = { ...prev.subSkills, [skillName]: { ...(prev.subSkills?.[skillName] || {}), [subSkillName]: { ...(prev.subSkills?.[skillName]?.[subSkillName] || {}), imageDataUrl: dataUrl, package: undefined, icon: undefined } } };
      }
      return next;
    });
    setChangeIconAnchorEl(null);
    setImageLibraryDialogOpen(false);
  };

  const handleSkillImageUpload = (file) => {
    if (!changeIconTarget || !file?.type?.startsWith('image/')) return;
    const parts = changeIconTarget.split(':');
    const type = parts[0];
    const skillName = parts[1];
    const subSkillName = type === 'subSkill' ? parts[2] : null;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) return;
      addImageToLibrary(dataUrl);
      setSkillIconConfig((prev) => {
        const next = { ...prev };
        if (type === 'skill') {
          next.skills = { ...prev.skills, [skillName]: { ...(prev.skills?.[skillName] || {}), imageDataUrl: dataUrl, package: undefined, icon: undefined } };
        } else if (type === 'subSkill' && subSkillName) {
          next.subSkills = { ...prev.subSkills, [skillName]: { ...(prev.subSkills?.[skillName] || {}), [subSkillName]: { ...(prev.subSkills?.[skillName]?.[subSkillName] || {}), imageDataUrl: dataUrl, package: undefined, icon: undefined } } };
        }
        return next;
      });
      setChangeIconAnchorEl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRedeemStarToJar = (playerName) => {
    setStarsByPlayer((prev) => {
      const s = prev[playerName];
      if (!s || (s.pending || 0) < 1) return prev;
      const next = { ...prev };
      next[playerName] = {
        ...s,
        pending: (s.pending || 0) - 1,
        current: (s.current || 0) + 1,
        totalEarned: (s.totalEarned || 0) + 1,
      };
      return next;
    });
  };

  const handleRemoveStarsForTask = (playerName, task, note) => {
    const starsToRemove = Number(task?.starReward) || 0;
    if (!playerName || !task || starsToRemove <= 0) return;
    setStarsByPlayer((prev) => {
      const s = prev[playerName] || { pending: 0, current: 0, totalEarned: 0 };
      const removable = Math.min(starsToRemove, (s.pending || 0) + (s.current || 0));
      if (removable <= 0) return prev;
      const removePending = Math.min(s.pending || 0, removable);
      const removeCurrent = removable - removePending;
      return {
        ...prev,
        [playerName]: {
          ...s,
          pending: Math.max(0, (s.pending || 0) - removePending),
          current: Math.max(0, (s.current || 0) - removeCurrent),
          totalEarned: Math.max(0, (s.totalEarned || 0) - removable),
        },
      };
    });
    setXpGrantLog((prev) => [
      {
        at: new Date().toISOString(),
        playerName,
        skillName: task.skillName || null,
        subSkillName: task.subSkillName || null,
        amount: 0,
        taskId: task.id || null,
        taskTitle: task.title || null,
        whatHappened: note || 'Star correction',
        starReward: -starsToRemove,
      },
      ...prev.slice(0, 499),
    ]);
  };

  const handleRemoveXpLogEntry = (entryToRemove) => {
    if (!entryToRemove || !entryToRemove.playerName) return;
    const playerName = entryToRemove.playerName;
    const skillNameKey = entryToRemove.skillName;
    const subSkillName = entryToRemove.subSkillName || null;
    const xpAmount = Number(entryToRemove.amount) || 0;
    const starDelta = Number(entryToRemove.starReward) || 0;

    // Revert XP change from this log entry, then remove the entry from the log.
    setXpByPlayer((prev) => {
      const next = { ...prev };
      if (!next[playerName] || !next[playerName][skillNameKey]) {
        return prev;
      }
      const skillBucket = { ...next[playerName][skillNameKey] };
      next[playerName] = { ...next[playerName], [skillNameKey]: skillBucket };

      if (subSkillName) {
        const currentRaw = skillBucket[subSkillName];
        const current = typeof currentRaw === 'number'
          ? { actual: currentRaw, pending: 0 }
          : {
              actual: typeof currentRaw?.actual === 'number' ? currentRaw.actual : 0,
              pending: typeof currentRaw?.pending === 'number' ? currentRaw.pending : 0,
            };
        if (xpAmount > 0) {
          const removePending = Math.min(current.pending, xpAmount);
          const removeActual = Math.min(current.actual, xpAmount - removePending);
          skillBucket[subSkillName] = {
            actual: Math.max(0, current.actual - removeActual),
            pending: Math.max(0, current.pending - removePending),
          };
        } else if (xpAmount < 0) {
          skillBucket[subSkillName] = {
            actual: current.actual,
            pending: current.pending + Math.abs(xpAmount),
          };
        }
      } else {
        const currentRaw = skillBucket.__skillXp;
        const current = typeof currentRaw === 'number'
          ? { actual: currentRaw, pending: 0 }
          : {
              actual: typeof currentRaw?.actual === 'number' ? currentRaw.actual : 0,
              pending: typeof currentRaw?.pending === 'number' ? currentRaw.pending : 0,
            };
        if (xpAmount > 0) {
          const removePending = Math.min(current.pending, xpAmount);
          const removeActual = Math.min(current.actual, xpAmount - removePending);
          skillBucket.__skillXp = {
            actual: Math.max(0, current.actual - removeActual),
            pending: Math.max(0, current.pending - removePending),
          };
        } else if (xpAmount < 0) {
          skillBucket.__skillXp = {
            actual: current.actual,
            pending: current.pending + Math.abs(xpAmount),
          };
        }
      }
      return next;
    });

    // Revert stars that came from this log entry.
    if (starDelta !== 0) {
      setStarsByPlayer((prev) => {
        const s = prev[playerName] || { pending: 0, current: 0, totalEarned: 0 };
        if (starDelta > 0) {
          const removePending = Math.min(s.pending || 0, starDelta);
          const removeCurrent = Math.min(s.current || 0, starDelta - removePending);
          return {
            ...prev,
            [playerName]: {
              ...s,
              pending: Math.max(0, (s.pending || 0) - removePending),
              current: Math.max(0, (s.current || 0) - removeCurrent),
              totalEarned: Math.max(0, (s.totalEarned || 0) - removeCurrent),
            },
          };
        }
        return {
          ...prev,
          [playerName]: {
            ...s,
            pending: (s.pending || 0) + Math.abs(starDelta),
          },
        };
      });
    }

    setXpGrantLog((prev) => {
      const idx = prev.indexOf(entryToRemove);
      if (idx < 0) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const handleRoleClick = (chosenRole) => {
    setSelectedRole(chosenRole);
    setPendingPlayerIndex(null);
    setPin('');
    setPinError('');
  };

  const handlePlayerClick = (index) => {
    setSelectedRole('Player');
    setPendingPlayerIndex(index);
    setPin('');
    setPinError('');
  };

  const finishPinSuccess = () => {
    setRole(selectedRole);
    if (selectedRole === 'Player' && pendingPlayerIndex !== null) {
      setActivePlayerIndex(pendingPlayerIndex);
    } else {
      setActivePlayerIndex(null);
    }
    setSelectedRole(null);
    setPendingPlayerIndex(null);
    setPin('');
    setPinError('');
  };

  const handleVerifyPin = () => {
    if (selectedRole === 'Life Master') {
      axios
        .post(apiUrl('/auth/verify-life-master'), { pin })
        .then(() => {
          setLifeMasterPin(pin);
          finishPinSuccess();
        })
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            setPinError('Incorrect PIN. Please try again.');
            return;
          }
          if (pin === lifeMasterPin) {
            finishPinSuccess();
          } else {
            setPinError('Incorrect PIN. Please try again.');
          }
        });
      return;
    }

    const correctPin = players[pendingPlayerIndex]?.pin ?? '2222';
    if (pin === correctPin) {
      finishPinSuccess();
    } else {
      setPinError('Incorrect PIN. Please try again.');
    }
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    setPlayers([
      ...players,
      { name: newPlayerName.trim(), iconUrl: newPlayerIconUrl.trim(), pin: '', favouriteColor: '', choreTheme: 'unicorns' },
    ]);
    setNewPlayerName('');
    setNewPlayerIconUrl('');
  };

  const handleUpdatePlayerName = (index, name) => {
    const updated = [...players];
    updated[index] = { ...updated[index], name };
    setPlayers(updated);
  };

  const handleUpdatePlayerIcon = (index, iconUrl) => {
    const updated = [...players];
    updated[index] = { ...updated[index], iconUrl };
    setPlayers(updated);
  };

  const handleUpdatePlayerPin = (index, pin) => {
    const updated = [...players];
    updated[index] = { ...updated[index], pin: pin || '' };
    setPlayers(updated);
  };

  const handleUpdatePlayerFavouriteColor = (index, favouriteColor) => {
    const updated = [...players];
    updated[index] = { ...updated[index], favouriteColor: favouriteColor || '' };
    setPlayers(updated);
  };

  const remapIndexForSwap = (idx, a, b) => {
    if (idx == null) return idx;
    if (idx === a) return b;
    if (idx === b) return a;
    return idx;
  };

  const handleMovePlayer = (index, direction) => {
    const to = direction === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= players.length) return;
    setPlayers((prev) => {
      const next = [...prev];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });
    setXpTargetPlayerIndex((prev) => remapIndexForSwap(prev, index, to));
    setActivePlayerIndex((prev) => remapIndexForSwap(prev, index, to));
    setPendingPlayerIndex((prev) => remapIndexForSwap(prev, index, to));
  };

  const buildEmptyXpForPlayerFromSkills = (skillList) => {
    const o = {};
    skillList.forEach((skill) => {
      o[skill.name] = {};
      const subs = (skill.subSkills || []).filter(Boolean);
      subs.forEach((s) => {
        o[skill.name][s] = { actual: 0, pending: 0 };
      });
    });
    return o;
  };

  const openActivityLogForPlayer = (playerName) => {
    setActivityLogPlayerName(playerName);
    setActivityLogFilterKey('__all__');
    setActivityLogOpen(true);
  };

  const handleConfirmResetPlayerProgress = () => {
    setResetSectionMessage('');
    if (resetSectionPin.trim() !== String(lifeMasterPin)) {
      setResetSectionMessage('Incorrect Life Master PIN.');
      return;
    }
    if (resetSectionConfirm.trim() !== 'CONFIRM') {
      setResetSectionMessage('Type CONFIRM (all caps) to proceed.');
      return;
    }
    const player = players[resetSectionPlayerIndex];
    if (!player?.name) {
      setResetSectionMessage('Select a player.');
      return;
    }
    const name = player.name;
    setXpByPlayer((prev) => ({
      ...prev,
      [name]: buildEmptyXpForPlayerFromSkills(mergedSkillDefsForXp),
    }));
    setStarsByPlayer((prev) => ({
      ...prev,
      [name]: { pending: 0, current: 0, totalEarned: 0 },
    }));
    setSkillPointsByPlayer((prev) => {
      const pts = {};
      mergedSkillDefsForXp.forEach((s) => {
        pts[s.name] = 0;
      });
      return { ...prev, [name]: pts };
    });
    setXpGrantLog((prev) => prev.filter((e) => e.playerName !== name));
    setResetSectionPin('');
    setResetSectionConfirm('');
    setResetSectionMessage(`Progress reset for ${name}. Skills, sub-skills, and tasks were not removed.`);
  };

  const handleNewPlayerIconFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPlayerIconUrl(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsDataURL(file);
  };

  const handlePlayerIconFileChange = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...players];
      updated[index] = {
        ...updated[index],
        iconUrl: typeof reader.result === 'string' ? reader.result : '',
      };
      setPlayers(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubSkill = (skillNameKey) => {
    const value = (newSubSkillDraftMain[skillNameKey] || '').trim();
    if (!value) return;
    axios
      .post(apiUrl('/skills'), {
        name: skillNameKey,
        subSkill: value,
      }, { headers: authHeaders })
      .then((res) => {
        setSkills(res.data);
        setNewSubSkillDraftMain((prev) => ({ ...prev, [skillNameKey]: '' }));
      });
  };

  /** Sub-skills for chore-only definitions — updates client state (not POST /skills). */
  const handleAddChoreSubSkill = (skillNameKey) => {
    const value = (newSubSkillDraftChore[skillNameKey] || '').trim();
    if (!value) return;
    setChoreSkills((prev) => {
      const idx = prev.findIndex((s) => s.name === skillNameKey);
      if (idx === -1) return prev;
      const s = prev[idx];
      const subs = Array.isArray(s.subSkills) ? [...s.subSkills] : [];
      if (subs.includes(value)) return prev;
      const next = [...prev];
      next[idx] = { ...s, subSkills: [...subs, value] };
      return next;
    });
    setNewSubSkillDraftChore((prev) => ({ ...prev, [skillNameKey]: '' }));
  };

  const sumSkillBlockXp = (block) => {
    if (!block || typeof block !== 'object') return { actual: 0, pending: 0 };
    let actual = 0;
    let pending = 0;
    Object.keys(block).forEach((k) => {
      if (k === '__skillXp' || k.startsWith('__')) return;
      const o = block[k];
      if (o && typeof o === 'object') {
        actual += Number(o.actual) || 0;
        pending += Number(o.pending) || 0;
      }
    });
    return { actual, pending };
  };

  const handleRemoveSkillDefinition = (skillNameKey) => {
    if (
      !window.confirm(
        `Remove skill "${skillNameKey}" entirely? This deletes its XP, tasks, skill tree, icons, and log entries for that skill. Chores that awarded XP to this skill will have that XP cleared. This cannot be undone.`,
      )
    ) {
      return;
    }
    const removedTaskIds = new Set(
      tasks.filter((t) => t.skillName === skillNameKey).map((t) => String(t.id)).filter(Boolean),
    );
    setSkills((prev) => prev.filter((s) => s.name !== skillNameKey));
    setXpByPlayer((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      Object.keys(next).forEach((pn) => {
        if (next[pn]?.[skillNameKey]) delete next[pn][skillNameKey];
      });
      return next;
    });
    setSkillPointsByPlayer((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      Object.keys(next).forEach((pn) => {
        if (next[pn]?.[skillNameKey] !== undefined) {
          const { [skillNameKey]: _, ...rest } = next[pn];
          next[pn] = rest;
        }
      });
      return next;
    });
    setTasks((prev) => prev.filter((t) => t.skillName !== skillNameKey));
    setSkillIconConfig((prev) => {
      const next = { skills: { ...(prev.skills || {}) }, subSkills: { ...(prev.subSkills || {}) } };
      delete next.skills[skillNameKey];
      delete next.subSkills[skillNameKey];
      return next;
    });
    setSkillDocConfig((prev) => {
      const next = { skills: { ...(prev.skills || {}) }, subSkills: { ...(prev.subSkills || {}) } };
      delete next.skills[skillNameKey];
      delete next.subSkills[skillNameKey];
      return next;
    });
    setSkillTreeConfig((prev) => {
      const next = { ...prev };
      delete next[skillNameKey];
      return next;
    });
    setXpGrantLog((prev) => prev.filter((e) => e.skillName !== skillNameKey));
    setAchievementDefinitions((prev) =>
      prev.filter((def) => !def.taskId || !removedTaskIds.has(String(def.taskId))),
    );
    setChores((prev) =>
      prev.map((c) =>
        c.skillName === skillNameKey
          ? { ...c, skillName: '', xpReward: choreXpFromEffortStars(c.effortStars), starReward: 0 }
          : c,
      ),
    );
    setShowcaseByPlayer((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      Object.keys(next).forEach((pn) => {
        const sc = next[pn];
        if (!sc || !Array.isArray(sc.showcaseSkillNames)) return;
        sc.showcaseSkillNames = sc.showcaseSkillNames.filter((n) => n !== skillNameKey);
      });
      return next;
    });
    setNewSubSkillDraftMain((prev) => {
      const o = { ...prev };
      delete o[skillNameKey];
      return o;
    });
    setSkillTreeModalContext((ctx) => (ctx?.skillName === skillNameKey ? null : ctx));
    setTasksModalContext((ctx) => (ctx?.skillName === skillNameKey ? null : ctx));
    setApiCallsContext((ctx) => (ctx?.skillName === skillNameKey ? null : ctx));
  };

  const handleRemoveSubSkillDefinition = (skillNameKey, subName) => {
    const skill = skills.find((s) => s.name === skillNameKey);
    if (!skill) return;
    const subs = skill.subSkills || [];
    if (!subs.includes(subName)) return;
    if (subs.length <= 1) {
      window.alert('Add another sub-skill before removing the last one. XP only exists on sub-skills.');
      return;
    }
    const remaining = subs.filter((s) => s !== subName);
    if (
      !window.confirm(
        `Remove sub-skill "${subName}" under "${skillNameKey}"? XP and tasks for that line will be deleted.`,
      )
    ) {
      return;
    }
    const removedTaskIds = new Set(
      tasks
        .filter((t) => t.skillName === skillNameKey && t.subSkillName === subName)
        .map((t) => String(t.id))
        .filter(Boolean),
    );

    setSkills((prev) =>
      prev.map((s) => (s.name === skillNameKey ? { ...s, subSkills: remaining } : s)),
    );

    setXpByPlayer((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      players.forEach((p) => {
        const pn = p.name;
        const block = next[pn]?.[skillNameKey];
        if (!block) return;
        delete block[subName];
        Object.keys(block).forEach((k) => {
          if (k === '__skillXp' || k.startsWith('__')) return;
          if (!remaining.includes(k)) delete block[k];
        });
      });
      return next;
    });

    setSkillPointsByPlayer((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      Object.keys(next).forEach((pn) => {
        if (next[pn]?.[skillNameKey] !== undefined) {
          const { [skillNameKey]: _, ...rest } = next[pn];
          next[pn] = rest;
        }
      });
      return next;
    });

    setTasks((prev) => prev.filter((t) => !(t.skillName === skillNameKey && t.subSkillName === subName)));

    setSkillIconConfig((prev) => {
      const next = { skills: { ...(prev.skills || {}) }, subSkills: { ...(prev.subSkills || {}) } };
      const bySub = next.subSkills[skillNameKey];
      if (bySub && bySub[subName]) {
        next.subSkills = { ...next.subSkills, [skillNameKey]: { ...bySub } };
        delete next.subSkills[skillNameKey][subName];
      }
      return next;
    });
    setSkillDocConfig((prev) => {
      const next = { skills: { ...(prev.skills || {}) }, subSkills: { ...(prev.subSkills || {}) } };
      const bySub = next.subSkills[skillNameKey];
      if (bySub && bySub[subName]) {
        next.subSkills = { ...next.subSkills, [skillNameKey]: { ...bySub } };
        delete next.subSkills[skillNameKey][subName];
      }
      return next;
    });

    setXpGrantLog((prev) =>
      prev.filter((e) => !(e.skillName === skillNameKey && e.subSkillName === subName)),
    );
    setAchievementDefinitions((prev) =>
      prev.filter((def) => !def.taskId || !removedTaskIds.has(String(def.taskId))),
    );
    setTasksModalContext((ctx) =>
      ctx?.skillName === skillNameKey && ctx?.subSkillName === subName ? null : ctx,
    );
    setApiCallsContext((ctx) =>
      ctx?.skillName === skillNameKey && ctx?.subSkillName === subName ? null : ctx,
    );
  };

  const selectedLabel =
    selectedRole === 'Player' && pendingPlayerIndex !== null
      ? players[pendingPlayerIndex]?.name || 'Player'
      : selectedRole;

  const handlePinKeyDown = (e) => {
    if (e.key === 'Enter' && pin.trim()) {
      e.preventDefault();
      handleVerifyPin();
    }
  };
  useEffect(() => {
    if (!role && selectedRole) {
      window.addEventListener('keydown', handlePinKeyDown);
      return () => window.removeEventListener('keydown', handlePinKeyDown);
    }
  }, [role, selectedRole, pin]);

  if (!role && !selectedRole) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container sx={{ marginTop: 4 }}>
          <Typography variant="h4" gutterBottom>
            Select User
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            onClick={() => setDarkMode((prev) => !prev)}
            sx={{ mb: 2 }}
            aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {darkMode ? 'Light theme' : 'Dark theme'}
          </Button>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <Card
              sx={{
                cursor: 'pointer',
                minWidth: 200,
                flex: '1 1 200px',
                maxWidth: 280,
                bgcolor: '#9B111E',
                color: '#fff',
              }}
              onClick={() => handleRoleClick('Life Master')}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, px: 3 }}>
                <Typography variant="h6" color="inherit">Life Master</Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                cursor: 'pointer',
                minWidth: 200,
                flex: '1 1 200px',
                maxWidth: 280,
                bgcolor: 'success.main',
                color: 'success.contrastText',
              }}
              onClick={() => setRole('Overview')}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, px: 3 }}>
                <Typography variant="h6" color="inherit">Overview</Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                cursor: 'pointer',
                minWidth: 200,
                flex: '1 1 200px',
                maxWidth: 280,
                bgcolor: 'info.main',
                color: 'info.contrastText',
              }}
              onClick={() => setRole('Weekly Review')}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, px: 3 }}>
                <Typography variant="h6" color="inherit">Weekly Review</Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Choose Player
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {players.map((player, index) => (
                <Card
                  key={index}
                  sx={{
                    cursor: 'pointer',
                    minWidth: 200,
                    flex: '1 1 200px',
                    maxWidth: 280,
                    ...(player.favouriteColor && {
                      bgcolor: player.favouriteColor,
                      color: '#fff',
                      '& .MuiTypography-root': { color: 'inherit' },
                    }),
                  }}
                  onClick={() => handlePlayerClick(index)}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, px: 3 }}>
                    <Avatar
                      src={player.iconUrl || undefined}
                      alt={player.name}
                      sx={{ width: 96, height: 96, mb: 1.5, bgcolor: player.favouriteColor ? 'rgba(255,255,255,0.3)' : undefined }}
                    >
                      <Typography sx={{ fontSize: 40 }}>
                        {player.name.charAt(0).toUpperCase()}
                      </Typography>
                    </Avatar>
                    <Typography variant="h6">{player.name}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (!role && selectedRole) {
    const keypadBtnSx = {
      height: '100%',
      minHeight: { xs: 52, sm: 56 },
      width: '100%',
      minWidth: 0,
      fontSize: { xs: 'clamp(1.35rem, 5.5vmin, 2.75rem)', sm: 'clamp(1.5rem, 4.5vmin, 2.5rem)' },
      fontWeight: 700,
      py: 0,
    };
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            width: '100%',
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            boxSizing: 'border-box',
            px: { xs: 1.5, sm: 2, md: 3 },
            py: { xs: 1.5, sm: 2 },
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ flexShrink: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1, sm: 2 }, mb: 1.5 }}>
            <Typography variant="h4" sx={{ m: 0, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              Enter PIN
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              onClick={() => setDarkMode((prev) => !prev)}
              aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {darkMode ? 'Light theme' : 'Dark theme'}
            </Button>
          </Box>
          <Typography variant="subtitle1" sx={{ flexShrink: 0, mb: 1 }}>
            Selected: {selectedLabel}
          </Typography>
          <Card
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              width: '100%',
              mt: 0,
            }}
          >
            <CardContent
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1.5, sm: 2 },
                minHeight: 0,
                py: { xs: 2, sm: 3 },
                px: { xs: 2, sm: 3 },
                '&:last-child': { pb: { xs: 2, sm: 3 } },
              }}
            >
              <TextField
                label="PIN"
                type="password"
                fullWidth
                margin="dense"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputProps={{ maxLength: 20 }}
                sx={{
                  flexShrink: 0,
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '1.15rem', sm: '1.25rem' },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', flexShrink: 0 }}>
                Or use the keypad below · Press Enter to confirm
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
                  gap: { xs: 1, sm: 1.5, md: 2 },
                  width: '100%',
                  minHeight: { xs: 'min(52vh, 520px)', sm: 'min(56vh, 640px)' },
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                  <Button
                    key={d}
                    variant="outlined"
                    onClick={() => setPin((prev) => (prev.length < 20 ? prev + String(d) : prev))}
                    sx={keypadBtnSx}
                  >
                    {d}
                  </Button>
                ))}
                <Box sx={{ minHeight: 0 }} />
                <Button
                  variant="outlined"
                  onClick={() => setPin((prev) => (prev.length < 20 ? prev + '0' : prev))}
                  sx={keypadBtnSx}
                >
                  0
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setPin((prev) => prev.slice(0, -1))}
                  sx={{ ...keypadBtnSx, fontSize: { xs: 'clamp(1.25rem, 5vmin, 2.25rem)' } }}
                  aria-label="Backspace"
                >
                  ⌫
                </Button>
              </Box>
              {pinError && (
                <Typography color="error" variant="body2" sx={{ flexShrink: 0 }}>
                  {pinError}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, flexShrink: 0, pt: 0.5 }}>
                <Button variant="contained" size="large" onClick={handleVerifyPin} disabled={!pin} sx={{ flex: { xs: '1 1 140px', sm: '0 0 auto' }, minHeight: 48 }}>
                  Confirm PIN
                </Button>
                <Button
                  variant="text"
                  size="large"
                  onClick={() => {
                    setSelectedRole(null);
                    setPendingPlayerIndex(null);
                    setPin('');
                    setPinError('');
                  }}
                  sx={{ minHeight: 48 }}
                >
                  Back
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    );
  }

  const renderSkillsCards = (skillsList = null) => {
    const isChoreSkillsList = skillsList === choreSkills;
    const list = isChoreSkillsList
      ? filterMergedSkillsForPlayer(choreSkills, skillsGrantTargetPlayerName)
      : mergedSkillDefsForGrantTarget;
    const lmPlayerIdxForSkills =
      skillsList === choreSkills
        ? xpTargetPlayerIndex
        : skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage'
          ? xpTargetPlayerIndex
          : Number(skillsPlayerFilter);
    const skillsCardAccent =
      role === 'Life Master'
        ? players[lmPlayerIdxForSkills]?.favouriteColor
        : role === 'Player' && activePlayerIndex != null
          ? players[activePlayerIndex]?.favouriteColor
          : null;
    const choreThemeForSkillCards = isChoreSkillsList
      ? getChoreThemeConfig(
          role === 'Life Master'
            ? players[xpTargetPlayerIndex]
            : role === 'Player' && activePlayerIndex != null
              ? players[activePlayerIndex]
              : null,
        )
      : null;
    const ctaButtonSx =
      isChoreSkillsList && choreThemeForSkillCards
        ? {
            textTransform: 'none',
            fontWeight: 600,
            color: `${choreThemeForSkillCards.textColor} !important`,
            background: 'linear-gradient(180deg, #fffef7 0%, #fff3c4 50%, #ffe69a 100%)',
            border: `2px solid ${choreThemeForSkillCards.accent}`,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            '&:hover': {
              background: 'linear-gradient(180deg, #fff8e1 0%, #ffecb3 55%, #fff176 100%)',
            },
          }
        : SKILLS_PURPLE_CTA_BUTTON_SX;
    const arrowIconSx =
      isChoreSkillsList && choreThemeForSkillCards
        ? { color: choreThemeForSkillCards.textColor }
        : { color: 'white' };
    return list.map((skill, index) => (
              <Card
                key={index}
                sx={{
                  ...(isChoreSkillsList && choreThemeForSkillCards
                    ? {
                        ...choreThemeForSkillCards.tasksLeftCardSx,
                        mt: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                      }
                    : SKILL_CATEGORY_GALAXY_CARD_SX),
                  ...(skillsCardAccent && {
                    borderLeft: `4px solid ${skillsCardAccent}`,
                    ...(isChoreSkillsList
                      ? {
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.85), 0 6px 18px rgba(0,0,0,0.08), 0 0 0 1px ${skillsCardAccent}33`,
                        }
                      : {
                          boxShadow: `inset 0 0 72px rgba(75, 0, 130, 0.28), 0 6px 28px rgba(48, 25, 92, 0.4), 0 0 0 1px ${skillsCardAccent}33`,
                        }),
                  }),
                }}
              >
                <CardContent
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    ...(isChoreSkillsList && choreThemeForSkillCards
                      ? {
                          '& .MuiTypography-root': { color: `${choreThemeForSkillCards.textColor} !important` },
                          '& .MuiIconButton-root': { color: `${choreThemeForSkillCards.textColor} !important` },
                          '& .MuiSvgIcon-root': { color: 'inherit' },
                        }
                      : { '& .MuiTypography-root': { color: 'rgba(255,255,255,0.92)' } }),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', width: '100%' }}>
                    {(() => {
                      const SkillIcon = getSkillIconConfig(skill.name, null);
                      return SkillIcon ? <SkillIcon fontSize="small" /> : null;
                    })()}
                    <Typography variant="subtitle1">{skill.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, ml: 'auto' }}>
                      {isChoreSkillsList && role === 'Life Master' && (
                        <Tooltip title="Remove this chore skill definition">
                          <IconButton
                            size="small"
                            aria-label={`Remove chore skill ${skill.name}`}
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `Remove chore skill "${skill.name}" from definitions? Update or remove chores that use this skill if needed.`,
                                )
                              ) {
                                return;
                              }
                              setChoreSkills((prev) => prev.filter((x) => x.name !== skill.name));
                              setNewSubSkillDraftChore((prev) => {
                                const o = { ...prev };
                                delete o[skill.name];
                                return o;
                              });
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={getDocContent(skill.name, null) ? 'Open documentation' : (role === 'Life Master' ? 'Edit documentation' : 'Documentation')}>
                        <IconButton
                          size="small"
                          aria-label="Documentation"
                          onClick={(e) => handleDocClick(e, skill.name, null)}
                        >
                          <MenuBookIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(skill.subSkills || []).length === 0 ? (
                        <>
                          <Tooltip title="XP grant log for this skill">
                            <IconButton
                              size="small"
                              aria-label="XP log"
                              onClick={() => {
                                const p = role === 'Life Master' ? players[lmPlayerIdxForSkills]?.name : players[activePlayerIndex]?.name;
                                if (p) {
                                  setXpLogFilter({ playerName: p, skillName: skill.name, subSkillName: null });
                                  setXpLogDialogOpen(true);
                                }
                              }}
                            >
                              <ViewListIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Available tasks for this skill">
                            <IconButton
                              size="small"
                              aria-label="Tasks"
                              onClick={() => {
                                const p = role === 'Life Master' ? players[lmPlayerIdxForSkills]?.name : players[activePlayerIndex]?.name;
                                if (p) {
                                  setTasksModalContext({ playerName: p, skillName: skill.name, subSkillName: null });
                                  setTasksModalOpen(true);
                                }
                              }}
                            >
                              <TaskAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : null}
                      <Tooltip title="Skill Tree">
                        <IconButton
                          size="small"
                          aria-label="Skill Tree"
                          onClick={() => {
                            const p = role === 'Life Master' ? players[lmPlayerIdxForSkills]?.name : players[activePlayerIndex]?.name;
                            if (p) {
                              setSkillTreeModalContext({ playerName: p, skillName: skill.name });
                              setSkillTreeModalOpen(true);
                            }
                          }}
                        >
                          <ArrowUpwardIcon fontSize="small" sx={arrowIconSx} />
                        </IconButton>
                      </Tooltip>
                      {role === 'Life Master' && (
                        <Tooltip title="Change icon for this skill and its sub-skills">
                          <IconButton
                            size="small"
                            aria-label="Change icon"
                            onClick={(e) => {
                              setChangeIconTarget(`skill:${skill.name}`);
                              setSettingsTarget(`skill:${skill.name}`);
                              const current = skillIconConfig.skills?.[skill.name];
                              setSettingsIconPkg(current?.package || '__all__');
                              setSettingsIconName(current?.icon || '');
                              setChangeIconAnchorEl(e.currentTarget);
                            }}
                          >
                            <ImageIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  {(() => {
                const subSkills = skill.subSkills || [];
                const hasSubSkills = subSkills.length > 0;
                const isPlayer =
                  role === 'Player' && activePlayerIndex !== null;
                const currentPlayerName = isPlayer
                  ? players[activePlayerIndex]?.name
                  : null;

                if (role === 'Life Master') {
                  const targetPlayer = players[lmPlayerIdxForSkills];
                  const targetName = targetPlayer?.name;

                  if (hasSubSkills) {
                    return subSkills.map((s, idx) => {
                      const xpValue =
                        targetName &&
                        getXpForSubSkill(targetName, skill.name, s);
                      const recentKey = `${skill.name}:${s}`;
                      const recentIds = recentTaskIdsBySkillKey[recentKey] || [];
                      const recentTasks = recentIds
                        .map((id) => tasks.find((t) => t.id === id))
                        .filter(Boolean)
                        .reverse();
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 0.5,
                            flexWrap: 'wrap',
                            width: '100%',
                          }}
                        >
                          {(() => {
                            const SubIcon = getSkillIconConfig(skill.name, s);
                            return SubIcon ? <SubIcon fontSize="small" /> : null;
                          })()}
                          <Typography variant="body2">
                            {s}
                            {typeof xpValue === 'number' &&
                              ` - ${targetName} XP: ${xpValue}`}
                          </Typography>
                          {recentTasks.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {recentTasks.slice(0, 3).map((t) => `${t.title}${t.xpReward != null ? ` (+${t.xpReward})` : ''}`).join(' · ')}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, ml: 'auto' }}>
                            <Tooltip title={getDocContent(skill.name, s) ? 'Open documentation' : (role === 'Life Master' ? 'Edit documentation' : 'Documentation')}>
                              <IconButton
                                size="small"
                                aria-label="Documentation"
                                onClick={(e) => handleDocClick(e, skill.name, s)}
                              >
                                <MenuBookIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="XP grant log for this skill">
                              <IconButton
                                size="small"
                                aria-label="XP log"
                                onClick={() => {
                                  const p = role === 'Life Master' ? players[lmPlayerIdxForSkills]?.name : players[activePlayerIndex]?.name;
                                  if (p) {
                                    setXpLogFilter({ playerName: p, skillName: skill.name, subSkillName: s });
                                    setXpLogDialogOpen(true);
                                  }
                                }}
                              >
                                <ViewListIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Available tasks for this skill">
                              <IconButton
                                size="small"
                                aria-label="Tasks"
                                onClick={() => {
                                  const p = role === 'Life Master' ? players[lmPlayerIdxForSkills]?.name : players[activePlayerIndex]?.name;
                                  if (p) {
                                    setTasksModalContext({ playerName: p, skillName: skill.name, subSkillName: s });
                                    setTasksModalOpen(true);
                                  }
                                }}
                              >
                                <TaskAltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Skill Tree">
                              <IconButton
                                size="small"
                                aria-label="Skill Tree"
                                onClick={() => {
                                  const p = role === 'Life Master' ? players[lmPlayerIdxForSkills]?.name : players[activePlayerIndex]?.name;
                                  if (p) {
                                    setSkillTreeModalContext({ playerName: p, skillName: skill.name });
                                    setSkillTreeModalOpen(true);
                                  }
                                }}
                              >
                                <ArrowUpwardIcon fontSize="small" sx={arrowIconSx} />
                              </IconButton>
                            </Tooltip>
                            {role === 'Life Master' && (
                              <Tooltip title="API calls for this sub-skill">
                                <IconButton
                                  size="small"
                                  aria-label="API calls"
                                  onClick={() => {
                                    const p = players[lmPlayerIdxForSkills]?.name;
                                    if (p) {
                                      setApiCallsContext({ playerName: p, skillName: skill.name, subSkillName: s });
                                      setApiCallsModalOpen(true);
                                    }
                                  }}
                                >
                                  <ApiIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {role === 'Life Master' && (
                              <Tooltip title="Change icon for this sub-skill">
                                <IconButton
                                  size="small"
                                  aria-label="Change icon"
                                  onClick={(e) => {
                                    setChangeIconTarget(`subSkill:${skill.name}:${s}`);
                                    setSettingsTarget(`subSkill:${skill.name}:${s}`);
                                    const current = skillIconConfig.subSkills?.[skill.name]?.[s];
                                    setSettingsIconPkg(current?.package || '__all__');
                                    setSettingsIconName(current?.icon || '');
                                    setChangeIconAnchorEl(e.currentTarget);
                                  }}
                                >
                                  <ImageIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      );
                    });
                  }

                  return (
                    <Typography variant="body2">
                      No sub-skills yet — add at least one sub-skill in Settings.
                    </Typography>
                  );
                }

                if (hasSubSkills) {
                  return subSkills.map((s, idx) => {
                    const entries =
                      isPlayer && currentPlayerName
                        ? getEntriesForSubSkill(
                            currentPlayerName,
                            skill.name,
                            s
                          )
                        : { actual: null, pending: null };
                    const xpValue = entries.actual;
                    const pendingXp = entries.pending;
                    const levelInfo =
                      xpValue !== null && xpValue !== undefined
                        ? getLevelInfo(xpValue)
                        : null;
                    return (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 0.5,
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          {(() => {
                            const SubIcon = getSkillIconConfig(skill.name, s);
                            return SubIcon ? <SubIcon fontSize="small" /> : null;
                          })()}
                          <Typography variant="body2">{s}</Typography>
                          {levelInfo !== null && (
                            <Box sx={XP_PROGRESS_CONTAINER_SX}>
                              <Typography variant="body2">Lvl {levelInfo.level}</Typography>
                              <LinearProgress variant="determinate" value={levelInfo.progress * 100} sx={XP_PROGRESS_BAR_SX} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {levelInfo.xpToNextLevel > 0 ? `${levelInfo.xpToNextLevel} XP to next` : 'Max'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          {xpValue !== null && (
                            <Typography variant="body2">
                              XP: {xpValue}
                            </Typography>
                          )}
                          {pendingXp !== null &&
                            pendingXp > 0 &&
                            currentPlayerName && (
                              <Button
                                size="small"
                                variant="contained"
                                disableElevation
                                sx={ctaButtonSx}
                                onClick={() =>
                                  handleRedeemXp(
                                    currentPlayerName,
                                    skill.name,
                                    s
                                  )
                                }
                              >
                                Redeem {pendingXp} XP
                              </Button>
                            )}
                          <Tooltip title={getDocContent(skill.name, s) ? 'Open documentation' : 'Documentation'}>
                            <IconButton
                              size="small"
                              aria-label="Documentation"
                              onClick={(e) => handleDocClick(e, skill.name, s)}
                            >
                              <MenuBookIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="XP grant log for this skill">
                            <IconButton
                              size="small"
                              aria-label="XP log"
                              onClick={() => {
                                if (currentPlayerName) {
                                  setXpLogFilter({ playerName: currentPlayerName, skillName: skill.name, subSkillName: s });
                                  setXpLogDialogOpen(true);
                                }
                              }}
                            >
                              <ViewListIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Available tasks for this skill">
                            <IconButton
                              size="small"
                              aria-label="Tasks"
                              onClick={() => {
                                if (currentPlayerName) {
                                  setTasksModalContext({ playerName: currentPlayerName, skillName: skill.name, subSkillName: s });
                                  setTasksModalOpen(true);
                                }
                              }}
                            >
                              <TaskAltIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Skill Tree">
                            <IconButton
                              size="small"
                              aria-label="Skill Tree"
                              onClick={() => {
                                if (currentPlayerName) {
                                  setSkillTreeModalContext({ playerName: currentPlayerName, skillName: skill.name });
                                  setSkillTreeModalOpen(true);
                                }
                              }}
                            >
                              <ArrowUpwardIcon fontSize="small" sx={arrowIconSx} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    );
                  });
                }

                if (!hasSubSkills && isPlayer && currentPlayerName) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      No sub-skills yet — ask a Life Master to add them in Settings.
                    </Typography>
                  );
                }

                if (role === 'Life Master') {
                  return (
                    <Typography variant="body2">
                      No sub-skills yet.
                    </Typography>
                  );
                }

                return null;
              })()}
                </CardContent>
              </Card>
            ));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ marginTop: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 } }}>
        <Box
          sx={{
            ...(role !== 'Overview' && role !== 'Weekly Review'
              ? {
                  position: 'sticky',
                  top: 0,
                  zIndex: (t) => t.zIndex.appBar,
                  bgcolor: 'background.default',
                }
              : {}),
            borderBottom: role === 'Overview' || role === 'Weekly Review' ? 0 : 1,
            borderColor: 'divider',
            mb: role === 'Overview' || role === 'Weekly Review' ? 0 : 2,
            pt: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: { xs: 1.5, md: 2 },
              flexWrap: 'wrap',
              pb: 1.5,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                minWidth: 0,
                flex: { md: '0 1 auto' },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 0,
                  fontSize: { xs: '1.35rem', sm: '2.125rem' },
                  lineHeight: 1.25,
                  wordBreak: 'break-word',
                  minWidth: 0,
                }}
              >
                Wonderful Game of Living
              </Typography>
              {(role === 'Player' || role === 'Life Master' || role === 'Overview' || role === 'Weekly Review') && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                  onClick={() => setDarkMode((prev) => !prev)}
                  aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                  sx={{ flexShrink: 0 }}
                >
                  {darkMode ? 'Light theme' : 'Dark theme'}
                </Button>
              )}
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                flexShrink: 0,
                width: { xs: '100%', md: 'auto' },
                ml: { md: 'auto' },
                alignSelf: { xs: 'flex-end', md: 'auto' },
              }}
            >
              {(role === 'Life Master' || role === 'Player') && (
                <Tabs
                  value={topTab}
                  onChange={(_, value) => setTopTab(value)}
                  sx={{ minHeight: 36, width: { xs: '100%', sm: 'auto' } }}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  <Tab value="showcase" label="Showcase" sx={{ minHeight: 36 }} />
                  <Tab value="rules" label="Rules" sx={{ minHeight: 36 }} />
                  <Tab value="skills" label="Skills" sx={{ minHeight: 36 }} />
                  <Tab value="chores" label="Chores" sx={{ minHeight: 36 }} />
                </Tabs>
              )}
              {role === 'Life Master' && (
                <>
                  <IconButton onClick={handleOpenSettings} aria-label="Settings" size="medium">
                    <Settings />
                  </IconButton>
                  <Button variant="outlined" startIcon={<Logout />} onClick={handleLogout} size="medium">
                    Log out
                  </Button>
                </>
              )}
              {role === 'Player' && (
                <>
                  <IconButton onClick={handleOpenSettings} aria-label="Settings" size="medium">
                    <Settings />
                  </IconButton>
                  <Button variant="outlined" startIcon={<Logout />} onClick={handleLogout} size="medium">
                    Log out
                  </Button>
                </>
              )}
              {(role === 'Player' || role === 'Life Master' || role === 'Overview' || role === 'Weekly Review') && (
                <Button variant="outlined" onClick={() => window.location.reload()} size="medium">
                  Refresh page
                </Button>
              )}
              {(role === 'Overview' || role === 'Weekly Review') && (
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => {
                    clearStoredSession();
                    setRole(null);
                  }}
                >
                  Back to Main Page
                </Button>
              )}
            </Box>
          </Box>
          {role === 'Weekly Review' && (
            <Box sx={{ pb: 1 }}>
              <Typography variant="h5" sx={{ mt: 0 }}>
                Weekly Review
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Last 7 days
              </Typography>
            </Box>
          )}
        </Box>
        {role === 'Overview' && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: (t) => t.zIndex.appBar,
              bgcolor: 'background.default',
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Tabs
              value={Math.min(overviewTabIndex, players.length)}
              onChange={(e, v) => setOverviewTabIndex(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                borderBottom: 0,
                mt: 0,
                px: 0,
                pt: 0,
                pb: 1,
                minHeight: 48,
                bgcolor: 'background.default',
              }}
            >
              <Tab label="Stars" id="overview-tab-0" />
              {players.map((player, idx) => (
                <Tab key={player.name} label={player.name} id={`overview-tab-${idx + 1}`} />
              ))}
            </Tabs>
          </Box>
        )}
        {role === 'Weekly Review' && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: (t) => t.zIndex.appBar,
              bgcolor: 'background.default',
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Tabs
              value={Math.min(weeklyReviewTabIndex, players.length)}
              onChange={(e, v) => setWeeklyReviewTabIndex(v)}
              variant={isChoreNavDesktop ? 'standard' : 'scrollable'}
              scrollButtons={isChoreNavDesktop ? false : 'auto'}
              allowScrollButtonsMobile
              sx={{
                borderBottom: 0,
                mt: 0,
                px: 0,
                pt: 0,
                pb: 1,
                minHeight: 48,
                bgcolor: 'background.default',
                width: { xs: '100%', md: 'auto' },
              }}
            >
              <Tab label="All" />
              {players.map((player) => (
                <Tab key={player.name} label={player.name} />
              ))}
            </Tabs>
          </Box>
        )}

        {docDialogOpen && docTarget && (
          <Dialog
            open
            onClose={() => setDocDialogOpen(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{ sx: { minHeight: '70vh' } }}
          >
            <DialogTitle>
              {docTarget.startsWith('subSkill:')
                ? `Documentation: ${docTarget.split(':')[1]} › ${docTarget.split(':')[2]}`
                : `Documentation: ${docTarget.split(':')[1]}`}
            </DialogTitle>
            <DialogContent dividers>
              {docViewMode === 'view' ? (
                <Box
                  sx={{
                    '& h1': { fontSize: '1.5rem', mt: 1, mb: 0.5 },
                    '& h2': { fontSize: '1.25rem', mt: 1, mb: 0.5 },
                    '& h3': { fontSize: '1.1rem', mt: 0.75, mb: 0.25 },
                    '& p': { mb: 1 },
                    '& ul, & ol': { pl: 2, mb: 1 },
                    '& pre': { bgcolor: 'action.hover', p: 1, borderRadius: 1, overflow: 'auto' },
                    '& code': { fontFamily: 'monospace', fontSize: '0.9em' },
                    '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                  }}
                >
                  {getDocContentByTarget(docTarget) ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {getDocContentByTarget(docTarget)}
                    </ReactMarkdown>
                  ) : (
                    <Typography color="text.secondary">No content yet.</Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, height: '60vh', minHeight: 320 }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <input
                        type="file"
                        ref={imageFileInputRef}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageFileSelect}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ImageIcon />}
                        onClick={() => imageFileInputRef.current?.click()}
                      >
                        Insert image
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        Upload then name the image; it will be embedded in the doc.
                      </Typography>
                    </Box>
                    <TextField
                      inputRef={docEditorRef}
                      multiline
                      fullWidth
                      minRows={20}
                      maxRows={40}
                      placeholder="Write documentation in **Markdown**..."
                      value={docContentInput}
                      onChange={(e) => setDocContentInput(e.target.value)}
                      sx={{
                        flex: 1,
                        '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' },
                        '& textarea': { fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.5 },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      overflow: 'auto',
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      '& h1': { fontSize: '1.5rem', mt: 1, mb: 0.5 },
                      '& h2': { fontSize: '1.25rem', mt: 1, mb: 0.5 },
                      '& h3': { fontSize: '1.1rem', mt: 0.75, mb: 0.25 },
                      '& p': { mb: 1 },
                      '& ul, & ol': { pl: 2, mb: 1 },
                      '& pre': { bgcolor: 'background.paper', p: 1, borderRadius: 1, overflow: 'auto' },
                      '& code': { fontFamily: 'monospace', fontSize: '0.9em' },
                      '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Preview</Typography>
                    {docContentInput ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{docContentInput}</ReactMarkdown>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Nothing to preview yet.</Typography>
                    )}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              {docViewMode === 'view' ? (
                <>
                  <Button onClick={() => setDocDialogOpen(false)}>Close</Button>
                  {role === 'Life Master' && (
                    <Button variant="contained" onClick={handleDocEdit}>Edit</Button>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={() => setDocDialogOpen(false)}>Cancel</Button>
                  <Button variant="contained" onClick={handleSaveDocContent}>Save</Button>
                </>
              )}
            </DialogActions>
          </Dialog>
        )}

        {imageUploadOpen && (
          <Dialog open onClose={handleCloseImageUpload} maxWidth="xs" fullWidth>
            <DialogTitle>Add Image</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                size="small"
                label="Image name (alt text)"
                value={imageUploadName}
                onChange={(e) => setImageUploadName(e.target.value)}
                placeholder="e.g. agility-pose"
                sx={{ mt: 1, mb: 2 }}
              />
              {imageUploadPreviewUrl && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component="img"
                    src={imageUploadPreviewUrl}
                    alt="Preview"
                    sx={{ maxWidth: 120, maxHeight: 120, objectFit: 'contain', border: 1, borderColor: 'divider', borderRadius: 1 }}
                  />
                  {imageUploadFile && (
                    <Typography variant="caption" color="text.secondary">
                      {imageUploadFile.name}
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseImageUpload}>Cancel</Button>
              <Button variant="contained" onClick={handleInsertImage} disabled={!imageUploadName.trim()}>
                Insert
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <Dialog open={xpLogDialogOpen} onClose={() => { setXpLogDialogOpen(false); setXpLogFilter(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>
            {xpLogFilter
              ? `XP log: ${xpLogFilter.playerName} — ${xpLogFilter.subSkillName ? `${xpLogFilter.skillName} › ${xpLogFilter.subSkillName}` : xpLogFilter.skillName}`
              : 'XP grant log'}
          </DialogTitle>
          <DialogContent dividers>
            {(xpLogFilter
                  ? xpGrantLog.filter(
                      (e) =>
                        e.playerName === xpLogFilter.playerName &&
                        e.skillName === xpLogFilter.skillName &&
                        (e.subSkillName || null) === (xpLogFilter.subSkillName || null)
                    )
                  : xpGrantLog
                ).length === 0 ? (
              <Typography color="text.secondary">
                {xpGrantLog.length === 0 ? 'No XP grants recorded yet.' : 'No grants for this skill yet.'}
              </Typography>
            ) : (
              <List dense>
                {(xpLogFilter
                  ? xpGrantLog.filter(
                      (e) =>
                        e.playerName === xpLogFilter.playerName &&
                        e.skillName === xpLogFilter.skillName &&
                        (e.subSkillName || null) === (xpLogFilter.subSkillName || null)
                    )
                  : xpGrantLog
                ).map((entry, idx) => {
                  const d = entry.at ? new Date(entry.at) : null;
                  const dateStr = d ? d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';
                  const skillLabel = entry.subSkillName ? `${entry.skillName} › ${entry.subSkillName}` : entry.skillName;
                  return (
                    <ListItem key={idx} sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 0.25 }}>
                      <Typography variant="body2">
                        {dateStr} — {entry.playerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {skillLabel}: +{entry.amount} XP
                        {entry.taskTitle ? ` (${entry.taskTitle})` : ''}
                      </Typography>
                      {entry.whatHappened && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          What happened: {entry.whatHappened}
                        </Typography>
                      )}
                      {role === 'Life Master' && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.25 }}>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon fontSize="small" />}
                            onClick={() => handleRemoveXpLogEntry(entry)}
                          >
                            Remove & Undo
                          </Button>
                        </Box>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setXpLogDialogOpen(false); setXpLogFilter(null); }}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={activityLogOpen}
          onClose={() => { setActivityLogOpen(false); setActivityLogPlayerName(''); setActivityLogFilterKey('__all__'); }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Activity log{activityLogPlayerName ? `: ${activityLogPlayerName}` : ''}
          </DialogTitle>
          <DialogContent dividers>
            {activityLogPlayerName && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="activity-log-filter-label">Filter</InputLabel>
                <Select
                  labelId="activity-log-filter-label"
                  label="Filter"
                  value={activityLogFilterKey}
                  onChange={(e) => setActivityLogFilterKey(e.target.value)}
                >
                  <MenuItem value="__all__">All Activity</MenuItem>
                  {filterMergedSkillsForPlayer(mergedSkillDefsForXp, activityLogPlayerName).map((sk) => (
                    <React.Fragment key={sk.name}>
                      <MenuItem value={`skill:${sk.name}`}>
                        {sk.name} (entire skill)
                      </MenuItem>
                      {(sk.subSkills || []).map((sub) => (
                        <MenuItem key={`${sk.name}:${sub}`} value={`sub:${sk.name}:${sub}`}>
                          {sk.name} › {sub}
                        </MenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                </Select>
              </FormControl>
            )}
            {(() => {
              if (!activityLogPlayerName) {
                return <Typography color="text.secondary">No player selected.</Typography>;
              }
              const matchesFilter = (e) => {
                if (activityLogFilterKey === '__all__') return true;
                if (activityLogFilterKey.startsWith('skill:')) {
                  const sn = activityLogFilterKey.slice(7);
                  return e.skillName === sn;
                }
                if (activityLogFilterKey.startsWith('sub:')) {
                  const rest = activityLogFilterKey.slice(4);
                  const i = rest.indexOf(':');
                  if (i < 0) return false;
                  const sn = rest.slice(0, i);
                  const sub = rest.slice(i + 1);
                  return e.skillName === sn && (e.subSkillName || '') === sub;
                }
                return true;
              };
              const filtered = xpGrantLog
                .filter((e) => e.playerName === activityLogPlayerName)
                .filter(matchesFilter)
                .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
              if (filtered.length === 0) {
                return <Typography color="text.secondary">No activity recorded for this filter yet.</Typography>;
              }
              return (
                <List dense>
                  {filtered.map((entry, idx) => {
                    const d = entry.at ? new Date(entry.at) : null;
                    const dateStr = d ? d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';
                    const skillLine = entry.subSkillName
                      ? `${entry.skillName} › ${entry.subSkillName}`
                      : entry.skillName;
                    const xpPart = Number(entry.amount) !== 0
                      ? `${Number(entry.amount) > 0 ? '+' : ''}${entry.amount} XP`
                      : null;
                    const starN = Number(entry.starReward) || 0;
                    const starPart = starN !== 0
                      ? `${starN > 0 ? '+' : ''}${starN} ★`
                      : null;
                    const parts = [xpPart, starPart].filter(Boolean).join(' · ');
                    return (
                      <ListItem key={`${entry.at}-${idx}`} sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 0.25, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="body2">{dateStr}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {skillLine}
                          {parts ? ` — ${parts}` : ''}
                          {entry.taskTitle ? ` — ${entry.taskTitle}` : ''}
                        </Typography>
                        {entry.whatHappened && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {entry.whatHappened}
                          </Typography>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setActivityLogOpen(false); setActivityLogPlayerName(''); setActivityLogFilterKey('__all__'); }}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={tasksModalOpen} onClose={() => { setTasksModalOpen(false); setTasksModalContext(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>
            {tasksModalContext
              ? `Tasks: ${tasksModalContext.playerName} — ${tasksModalContext.subSkillName ? `${tasksModalContext.skillName} › ${tasksModalContext.subSkillName}` : tasksModalContext.skillName}`
              : 'Available tasks'}
          </DialogTitle>
          <DialogContent dividers>
            {!tasksModalContext ? (
              <Typography color="text.secondary">Select a skill row to view its tasks.</Typography>
            ) : (() => {
              const { playerName, skillName, subSkillName } = tasksModalContext;
              if (!subSkillName) {
                return (
                  <Typography color="text.secondary">
                    Open tasks from a sub-skill row (XP is tracked per sub-skill only).
                  </Typography>
                );
              }
              const currentXp = getEntriesForSubSkill(playerName, skillName, subSkillName).actual;
              const currentLevel = xpToLevel(currentXp);
              const applicable = tasks.filter((t) => {
                if (t.skillName !== skillName) return false;
                const taskSub = t.subSkillName || null;
                if ((subSkillName || null) !== taskSub) return false;
                return typeof t.requiredLevel === 'number' ? t.requiredLevel <= currentLevel : true;
              });
              if (applicable.length === 0) {
                return <Typography color="text.secondary">No tasks available for your current level yet.</Typography>;
              }
              const byLevel = {};
              applicable.forEach((t) => {
                const lvl = typeof t.requiredLevel === 'number' ? t.requiredLevel : 0;
                if (!byLevel[lvl]) byLevel[lvl] = [];
                byLevel[lvl].push(t);
              });
              const levels = Object.keys(byLevel).map(Number).sort((a, b) => a - b);
              return (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Your level: {currentLevel}. Showing tasks for level{levels.length === 1 ? ` ${levels[0]}` : `s ${levels[0]}–${currentLevel}`}.
                  </Typography>
                  {levels.map((lvl) => (
                    <Box key={lvl} sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" color="text.secondary">Level {lvl}</Typography>
                      <List dense disablePadding>
                        {byLevel[lvl].map((t) => (
                          <ListItem key={t.id} dense disablePadding>
                            <ListItemText
                              primary={t.title}
                              secondary={t.xpReward != null ? `+${t.xpReward} XP${t.scaleXpWithLevel ? ' (scales)' : ''}` : null}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ))}
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setTasksModalOpen(false); setTasksModalContext(null); }}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={skillTreeModalOpen} onClose={() => { setSkillTreeModalOpen(false); setSkillTreeModalContext(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>
            {skillTreeModalContext
              ? `Skill Tree: ${skillTreeModalContext.skillName}${skillTreeModalContext.playerName ? ` — ${skillTreeModalContext.playerName}` : ''}`
              : 'Skill Tree'}
          </DialogTitle>
          <DialogContent dividers>
            {!skillTreeModalContext ? (
              <Typography color="text.secondary">Select a skill to view its tree.</Typography>
            ) : (() => {
              const { playerName, skillName } = skillTreeModalContext;
              const points = playerName ? (skillPointsByPlayer[playerName]?.[skillName] ?? 0) : 0;
              const tree = skillTreeConfig[skillName];
              const unlocks = (tree?.unlocks && Array.isArray(tree.unlocks)) ? tree.unlocks : [];
              const unlockedSet = getUnlockedIds(skillName, points);
              const getUnlockIconComponent = (node) => {
                if (!node?.icon?.package || !node?.icon?.icon) return null;
                const pkg = enabledPackagesList.find((p) => p.id === node.icon.package);
                return pkg?.getIcon(node.icon.icon) || null;
              };
              return (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Skill points: {points}{playerName ? ` (${playerName})` : ''}
                  </Typography>
                  {role === 'Life Master' && (
                    <Button size="small" variant="outlined" sx={{ mb: 1 }} onClick={() => { setSkillTreeEditorSkill(skillName); setSkillTreeEditorOpen(true); setSkillTreeModalOpen(false); }}>
                      Edit Skill Tree
                    </Button>
                  )}
                  {unlocks.length === 0 ? (
                    <Typography color="text.secondary">No unlocks defined. {role === 'Life Master' ? 'Use "Edit Skill Tree" to add them.' : ''}</Typography>
                  ) : (
                    <VisualSkillTree
                      unlocks={unlocks}
                      getIconComponent={getUnlockIconComponent}
                      readOnly
                      unlockedSet={unlockedSet}
                    />
                  )}
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setSkillTreeModalOpen(false); setSkillTreeModalContext(null); }}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={skillTreeEditorOpen} onClose={() => { setSkillTreeEditorOpen(false); setSkillTreeEditorSkill(''); setSkillTreeSelectedUnlockId(null); }} maxWidth="md" fullWidth>
          <DialogTitle>Edit Skill Tree: {skillTreeEditorSkill || '—'}</DialogTitle>
          <DialogContent dividers>
            {!skillTreeEditorSkill ? (
              <Typography color="text.secondary">Select a skill from the tree modal to edit.</Typography>
            ) : (() => {
              const skillName = skillTreeEditorSkill;
              const tree = skillTreeConfig[skillName] || { unlocks: [] };
              const unlocks = Array.isArray(tree.unlocks) ? [...tree.unlocks] : [];
              const selectedUnlock = unlocks.find((u) => u.id === skillTreeSelectedUnlockId);
              const updateTree = (newUnlocks) => {
                setSkillTreeConfig((prev) => ({
                  ...prev,
                  [skillName]: { unlocks: newUnlocks },
                }));
              };
              const addUnlock = () => {
                const id = `unlock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                updateTree([...unlocks, { id, requiredPoints: 0, prerequisiteId: null }]);
              };
              const removeUnlock = (id) => {
                updateTree(unlocks.filter((u) => u.id !== id));
                if (id === skillTreeSelectedUnlockId) setSkillTreeSelectedUnlockId(null);
              };
              const setUnlock = (id, patch) => {
                updateTree(unlocks.map((u) => (u.id === id ? { ...u, ...patch } : u)));
              };
              const getUnlockIconComponent = (node) => {
                if (!node?.icon?.package || !node?.icon?.icon) return null;
                const pkg = enabledPackagesList.find((p) => p.id === node.icon.package);
                return pkg?.getIcon(node.icon.icon) || null;
              };
              const handleUnlockImageUpload = (id, file) => {
                if (!file || !file.type.startsWith('image/')) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                  const dataUrl = e.target?.result;
                  if (dataUrl) {
                    addImageToLibrary(dataUrl);
                    setUnlock(id, { imageDataUrl: dataUrl });
                  }
                };
                reader.readAsDataURL(file);
              };
              return (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Button size="small" variant="outlined" onClick={addUnlock}>Add Node</Button>
                      <Typography variant="caption" color="text.secondary">Click a node to edit</Typography>
                    </Box>
                    <VisualSkillTree
                      unlocks={unlocks}
                      getIconComponent={getUnlockIconComponent}
                      selectedId={skillTreeSelectedUnlockId}
                      onSelectNode={setSkillTreeSelectedUnlockId}
                      readOnly={false}
                    />
                  </Box>
                  {selectedUnlock && (
                    <Box sx={{ flex: '0 0 260px', border: 1, borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.paper' }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Edit Node</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Button size="small" variant="outlined" startIcon={<ImageIcon />} onClick={(e) => { setChangeIconTarget(`skillTree:${skillName}:${selectedUnlock.id}`); setChangeIconAnchorEl(e.currentTarget); }}>
                            Icon
                          </Button>
                          <Button size="small" variant="outlined" component="label">
                            Upload new
                            <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUnlockImageUpload(selectedUnlock.id, f); e.target.value = ''; }} />
                          </Button>
                          <Button size="small" variant="outlined" onClick={() => { imageLibraryApplyRef.current = (dataUrl) => { setUnlock(selectedUnlock.id, { imageDataUrl: dataUrl }); setImageLibraryDialogOpen(false); }; setImageLibraryDialogOpen(true); }}>
                            Pick from existing
                          </Button>
                          {selectedUnlock.imageDataUrl && (
                            <IconButton size="small" aria-label="Clear image" onClick={() => setUnlock(selectedUnlock.id, { imageDataUrl: null })}><DeleteIcon fontSize="small" /></IconButton>
                          )}
                        </Box>
                        {selectedUnlock.imageDataUrl && (
                          <Box component="img" src={selectedUnlock.imageDataUrl} alt="" sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', border: 1, borderColor: 'divider' }} />
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">Color</Typography>
                          <input type="color" value={selectedUnlock.color || '#5c6bc0'} onChange={(e) => setUnlock(selectedUnlock.id, { color: e.target.value })} style={{ width: 36, height: 28, padding: 0, border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }} />
                        </Box>
                        <TextField type="number" size="small" label="Points required" value={typeof selectedUnlock.requiredPoints === 'number' ? selectedUnlock.requiredPoints : 0} onChange={(e) => setUnlock(selectedUnlock.id, { requiredPoints: Math.max(0, parseInt(e.target.value, 10) || 0) })} inputProps={{ min: 0 }} fullWidth />
                        <FormControl size="small" fullWidth>
                          <InputLabel>Prerequisite</InputLabel>
                          <Select value={selectedUnlock.prerequisiteId || ''} label="Prerequisite" onChange={(e) => setUnlock(selectedUnlock.id, { prerequisiteId: e.target.value || null })}>
                            <MenuItem value="">None (root)</MenuItem>
                            {unlocks.filter((o) => o.id !== selectedUnlock.id).map((o) => (
                              <MenuItem key={o.id} value={o.id}>{o.id.slice(0, 12)}…</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button size="small" color="error" variant="outlined" startIcon={<DeleteIcon />} onClick={() => removeUnlock(selectedUnlock.id)}>Remove Node</Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setSkillTreeEditorOpen(false); setSkillTreeEditorSkill(''); setSkillTreeSelectedUnlockId(null); }}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={imageLibraryDialogOpen} onClose={() => setImageLibraryDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Pick From Existing Images</DialogTitle>
          <DialogContent dividers>
            {imageLibrary.length === 0 ? (
              <Typography color="text.secondary">No images in library yet. Upload an image for a skill or a skill tree node to add it here.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {imageLibrary.map((item) => (
                  <Box
                    key={item.id}
                    component="button"
                    type="button"
                    onClick={() => {
                      if (imageLibraryApplyRef.current) imageLibraryApplyRef.current(item.dataUrl);
                    }}
                    sx={{
                      width: 72,
                      height: 72,
                      p: 0,
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      bgcolor: 'background.paper',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box component="img" src={item.dataUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageLibraryDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {role === 'Life Master' && changeIconAnchorEl && changeIconTarget && (
          <Popover
            open
            anchorEl={changeIconAnchorEl}
            onClose={() => setChangeIconAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { minWidth: 360, maxWidth: 480, p: 2 } }}
          >
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {changeIconTarget.startsWith('subSkill:')
                ? `Change icon: ${changeIconTarget.split(':')[1]} › ${changeIconTarget.split(':')[2]}`
                : changeIconTarget.startsWith('skillTree:')
                  ? `Node icon: ${changeIconTarget.split(':')[1]}`
                  : `Change icon: ${changeIconTarget.split(':')[1]}`}
            </Typography>
            {(changeIconTarget.startsWith('skill:') || changeIconTarget.startsWith('subSkill:')) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Button size="small" variant="outlined" component="label">
                  Upload new
                  <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSkillImageUpload(f); e.target.value = ''; }} />
                </Button>
                <Button size="small" variant="outlined" onClick={() => { imageLibraryApplyRef.current = handleApplyImageToSkill; setImageLibraryDialogOpen(true); }}>
                  Pick from existing
                </Button>
              </Box>
            )}
            <AssignIconSection
              skills={[]}
              settingsTarget={changeIconTarget}
              setSettingsTarget={() => {}}
              settingsIconPkg={settingsIconPkg}
              setSettingsIconPkg={setSettingsIconPkg}
              settingsIconName={settingsIconName}
              setSettingsIconName={setSettingsIconName}
              enabledPackagesList={enabledPackagesList}
              onApply={handleApplyChangeIconSkill}
              fixedTarget={changeIconTarget}
              showApplyToSubSkills={changeIconTarget.startsWith('skill:') && (skills.find((s) => s.name === changeIconTarget.split(':')[1])?.subSkills?.length || 0) > 0}
            />
          </Popover>
        )}

        {role !== 'Overview' && role !== 'Weekly Review' && topTab === 'chores' && (() => {
          const displayedPlayer = role === 'Life Master'
            ? players[xpTargetPlayerIndex]
            : role === 'Player' && activePlayerIndex != null
              ? players[activePlayerIndex]
              : null;
          const playerName = displayedPlayer?.name || '';
          const choreTheme = getChoreThemeConfig(displayedPlayer);
          const playerCoins = coinsByPlayer[playerName] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
          const rewardsForPlayer = displayedPlayer
            ? rewardsStore.filter((r) => rewardIsVisibleToPlayer(r, displayedPlayer.name))
            : [];
          const playerStreak = playerName ? getStreakDays(playerName) : 0;
          const doneToday = playerName ? getTodayDoneCount(playerName) : 0;
          const questsToday = playerName ? getQuestsForPlayerToday(playerName) : [];
          const choresInRoom = chores.filter((c) => c.room === choreRoomTab && isChoreVisibleForPlayer(c, playerName));
          /** Incomplete quests for this player today (featured in Today's Quest box). */
          const activeQuestTodayIds = questsToday.filter((qid) => {
            const c = chores.find((x) => x.id === qid);
            if (!c) return false;
            return getCompletionsForChore(c.id, c.schedule).length === 0;
          });
          /** Room list: hide completed-for-period, hide other players' quest-only chores, hide chores featured in Today's Quest (incomplete). */
          const visibleChoresForRoom = choresInRoom.filter((c) => {
            if (getCompletionsForChore(c.id, c.schedule).length > 0) return false;
            if (c.questOnly && c.assignedQuestTo && c.assignedQuestTo !== playerName) return false;
            if (questsToday.includes(c.id)) return false;
            return true;
          });
          const totalDailyRemaining = chores.filter((c) => c.schedule === 'daily' && getCompletionsForChore(c.id, c.schedule).length === 0 && !c.questOnly && isChoreVisibleForPlayer(c, playerName)).length;
          const recentMine = playerName
            ? choreActivity
                .filter((a) => a.playerName === playerName && a.room === choreRoomTab)
                .slice(0, 10)
            : [];
          const rewardRedemptionsForPlayer = displayedPlayer
            ? rewardRedemptionLog.filter((e) => e.playerName === displayedPlayer.name)
            : [];
          const redeemedRewardsPages = Math.max(
            1,
            Math.ceil(rewardRedemptionsForPlayer.length / REDEEMED_REWARDS_PAGE_SIZE),
          );
          const safeRedeemedPage = Math.min(
            redeemedRewardsPage,
            Math.max(0, redeemedRewardsPages - 1),
          );
          const redeemedRewardsSlice = rewardRedemptionsForPlayer.slice(
            safeRedeemedPage * REDEEMED_REWARDS_PAGE_SIZE,
            (safeRedeemedPage + 1) * REDEEMED_REWARDS_PAGE_SIZE,
          );
          const periodMatcher = (at) => {
            const d = new Date(at);
            if (boardPeriod === 'month') return getMonthKey(d) === getMonthKey();
            if (boardPeriod === 'quarter') return getQuarterKey(d) === getQuarterKey();
            if (boardPeriod === 'year') return d.getFullYear() === new Date().getFullYear();
            return getWeekKey(d) === getWeekKey();
          };
          const boardRows = players
            .map((p) => {
              const acts = choreActivity.filter((a) => a.playerName === p.name && periodMatcher(a.at));
              const choreCount = acts.length;
              const coinCount = acts.reduce((sum, a) => sum + (Number(a.coins) || 0), 0);
              const effortStarCount = acts.reduce((sum, a) => sum + (Number(a.effortStars) || 0), 0);
              return {
                name: p.name,
                choreCount,
                coinCount,
                effortStarCount,
                fav: p.favouriteColor,
                iconUrl: p.iconUrl,
              };
            })
            .sort(
              (a, b) =>
                (b.coinCount - a.coinCount) ||
                (b.effortStarCount - a.effortStarCount) ||
                (b.choreCount - a.choreCount),
            );
          const activityFiltered =
            activityRoomFilter === '__all__'
              ? choreActivity
              : choreActivity.filter((a) => a && a.room === activityRoomFilter);
          const activityPages = Math.max(1, Math.ceil(activityFiltered.length / activityPageSizeChores));
          const activitySlice = activityFiltered.slice(
            activityPage * activityPageSizeChores,
            (activityPage + 1) * activityPageSizeChores,
          );
          return (
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                flexDirection: isChoreNavVertical ? 'row' : 'column',
                gap: isChoreNavVertical ? 2 : 0,
                alignItems: 'stretch',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Tabs
                value={choreLeftTab}
                onChange={(_, value) => {
                  setChoreLeftTab(value);
                  setActivityPage(0);
                  setRedeemedRewardsPage(0);
                }}
                orientation={isChoreNavVertical ? 'vertical' : 'horizontal'}
                variant={isChoreNavVertical ? 'standard' : 'scrollable'}
                scrollButtons={isChoreNavVertical ? false : 'auto'}
                allowScrollButtonsMobile
                sx={{
                  borderRight: isChoreNavVertical ? 1 : 0,
                  borderBottom: isChoreNavVertical ? 0 : 1,
                  borderColor: 'divider',
                  minWidth: isChoreNavVertical ? 140 : undefined,
                  width: isChoreNavVertical ? 'auto' : '100%',
                  alignSelf: isChoreNavVertical ? 'flex-start' : 'stretch',
                  flexShrink: 0,
                  minHeight: 48,
                  mb: 0,
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                }}
              >
                <Tab value="chores" label="Chores" />
                <Tab value="skills" label="Skills" />
                <Tab value="board" label="Board" />
                <Tab value="activity" label="Activity" />
                <Tab value="achievements" label="Achievements" />
                <Tab value="rewards" label="Rewards Store" />
                <Tab value="redeemedRewards" label="Rewards" />
                {showRewardRequestsTab && (
                  <Tab value="rewardRequests" label="Reward Requests" />
                )}
              </Tabs>
              <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                {role === 'Life Master' && players.length > 0 && (
                  choreLeftTab === 'board' ? (
                    <Box
                      sx={{
                        mb: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        minHeight: 48,
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.5,
                        boxSizing: 'border-box',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                        These are the top scorers this time around!
                      </Typography>
                    </Box>
                  ) : choreLeftTab === 'activity' || choreLeftTab === 'rewardRequests' ? null : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        minHeight: 48,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      }}
                    >
                      <Tabs
                        value={Math.min(Math.max(0, xpTargetPlayerIndex), players.length - 1)}
                        onChange={(_, v) => {
                          setXpTargetPlayerIndex(Number(v));
                          setRedeemedRewardsPage(0);
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          minHeight: 48,
                          borderBottom: 0,
                          mb: 0,
                          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                        }}
                      >
                        {players.map((p, i) => (
                          <Tab key={p.name} label={p.name} value={i} />
                        ))}
                      </Tabs>
                      {choreLeftTab === 'achievements' && role === 'Life Master' && (
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ flexShrink: 0, alignSelf: 'center', whiteSpace: 'nowrap' }}
                          onClick={() => {
                            setIsSettingsOpen(true);
                            setSettingsSection('achievements');
                          }}
                        >
                          Manage achievements
                        </Button>
                      )}
                    </Box>
                  )
                )}
                {choreLeftTab === 'chores' && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: choreTheme.background,
                      ...(choreTheme.panelBackgroundSize
                        ? {
                            backgroundSize: choreTheme.panelBackgroundSize,
                            backgroundRepeat: choreTheme.panelBackgroundRepeat || 'no-repeat, repeat',
                          }
                        : {}),
                      border: '1px solid',
                      borderColor: 'divider',
                      color: choreTheme.textColor,
                      '& .MuiTypography-root': { color: `${choreTheme.textColor} !important` },
                      '& .MuiTab-root': { color: `${choreTheme.textColor} !important`, opacity: 0.9, fontWeight: 700 },
                      '& .MuiButton-root': { color: choreTheme.textColor },
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          minWidth: 220,
                          maxWidth: '100%',
                          position: 'relative',
                          overflow: 'hidden',
                          flex: { xs: '1 1 100%', sm: '0 1 auto' },
                          ...choreTheme.tasksLeftCardSx,
                        }}
                      >
                        <ChoreTasksLeftDecoration themeId={choreTheme.id} />
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.88, position: 'relative', zIndex: 1 }}>
                          Tasks Left Today
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, position: 'relative', zIndex: 1, letterSpacing: '-0.02em' }}>
                          {totalDailyRemaining}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, border: '2px solid', borderColor: '#7f0000', borderRadius: 2, bgcolor: 'rgba(183, 28, 28, 0.9)', minWidth: 0, maxWidth: '100%', flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalFireDepartmentIcon sx={{ color: '#ffb74d' }} />
                          <Box>
                            <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, color: '#fff !important' }}>Current Streak</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#fff !important' }}>
                              {playerStreak} day(s)
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fff !important' }}>
                              {Math.max(0, 3 - doneToday)} more chores needed today to keep streak.
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          border: '2px solid',
                          borderColor: choreTheme.accent,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.88)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                          minWidth: 160,
                          maxWidth: '100%',
                          flex: { xs: '1 1 100%', sm: '0 1 auto' },
                          ml: { xs: 0, sm: 'auto' },
                          alignSelf: 'stretch',
                        }}
                      >
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.85 }}>
                          {role === 'Player' ? 'I am,' : 'Player'}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                          {playerName || '—'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        ...SHARED_REWARD_PANEL_STACK_SX,
                        mb: 2,
                        p: 1.5,
                        border: '1px solid',
                        borderColor: '#c49000',
                        borderRadius: 2,
                        background: 'linear-gradient(145deg, rgba(255,246,186,0.95) 0%, rgba(255,214,74,0.85) 45%, rgba(224,165,20,0.9) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -8px 18px rgba(153,98,0,0.22), 0 6px 16px rgba(166,115,0,0.18)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-20%',
                          width: '55%',
                          height: '100%',
                          background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.52) 45%, rgba(255,255,255,0) 100%)',
                          transform: 'skewX(-14deg)',
                          pointerEvents: 'none',
                        },
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, opacity: 0.85, mb: 0.25 }}>
                          Coins
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                          Current: {playerCoins.coins ?? 0}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.125, lineHeight: 1.35 }}>
                          Total Earned: {playerCoins.totalEarned ?? 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mb: 0, lineHeight: 1.35 }}>
                        Pending (not in jar): {playerCoins.pending ?? 0}
                        {Number(playerCoins.pendingSpent) > 0 ? ` · Awaiting approval: ${playerCoins.pendingSpent}` : ''}
                      </Typography>
                      <Box sx={SHARED_REWARD_PANEL_ROW_SX}>
                        <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: { md: 420 } }}>
                          <Box
                            sx={{
                              ...PENDING_COINS_ZONE_GOLD_SX,
                              minHeight: 120,
                              py: 1.5,
                              justifyContent: (playerCoins.pending || 0) === 0 ? 'center' : 'flex-start',
                              alignContent: (playerCoins.pending || 0) === 0 ? 'center' : 'flex-end',
                              alignItems: (playerCoins.pending || 0) === 0 ? 'center' : 'flex-end',
                            }}
                          >
                            {[...Array(Math.min(playerCoins.pending || 0, 40))].map((_, i) => (
                              <Box
                                key={i}
                                draggable
                                onClick={() => handleRedeemCoinToJar(playerName)}
                                onDragStart={(e) => {
                                  if (e.dataTransfer) {
                                    e.dataTransfer.setData('text/plain', 'coin');
                                    e.dataTransfer.effectAllowed = 'move';
                                  }
                                }}
                                sx={{ cursor: 'grab', userSelect: 'none', '&:active': { cursor: 'grabbing' } }}
                              >
                                <Box
                                  component="img"
                                  src={COIN_PNG_SRC}
                                  alt=""
                                  sx={{ width: 28, height: 28, display: 'block', objectFit: 'contain', pointerEvents: 'none' }}
                                />
                              </Box>
                            ))}
                            {(playerCoins.pending || 0) > 40 && (
                              <Typography variant="caption" sx={{ alignSelf: 'flex-end', pl: 0.5 }}>
                                +{(playerCoins.pending || 0) - 40} more
                              </Typography>
                            )}
                            {(playerCoins.pending || 0) === 0 && (
                              <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'center', width: '100%', py: 0.5 }}>
                                No pending coins
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box sx={SHARED_REWARD_PANEL_JAR_COLUMN_SX}>
                          <Box sx={{ width: CHORES_COINS_JAR_WIDTH_PX, maxWidth: '100%', position: 'relative' }}>
                            <Box
                              component="div"
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                              }}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const data = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
                                if (data === 'coin') handleRedeemCoinToJar(playerName);
                              }}
                              sx={{
                                ...CHORES_COINS_JAR_LIP_SX,
                                cursor: 'copy',
                                '&:hover': { borderColor: '#546e7a', bgcolor: '#455a64' },
                              }}
                            />
                            <Box sx={CHORES_COINS_JAR_BODY_SX}>
                              {[...Array(Math.min(playerCoins.coins || 0, 30))].map((_, i) => (
                                <Box
                                  key={i}
                                  component="img"
                                  src={COIN_PNG_SRC}
                                  alt=""
                                  sx={{ width: 22, height: 22, display: 'block', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                                />
                              ))}
                            </Box>
                          </Box>
                          <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 600, lineHeight: 1.2 }}>
                            {playerCoins.coins || 0} coins in jar
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2, border: '2px solid', borderColor: choreTheme.questBorder, borderRadius: 2, bgcolor: choreTheme.questBg, p: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ color: choreTheme.accent, fontWeight: 700 }}>
                        {choreTheme.emoji} {choreTheme.questTitle}
                      </Typography>
                      <List dense sx={{ pt: 0 }}>
                        {activeQuestTodayIds.length === 0 ? (
                          <ListItem>
                            <ListItemText primary="No quests today." />
                          </ListItem>
                        ) : (
                          activeQuestTodayIds.map((qid) => {
                            const chore = chores.find((c) => c.id === qid);
                            if (!chore) {
                              return (
                                <ListItem key={qid}>
                                  <ListItemText primary={qid} />
                                </ListItem>
                              );
                            }
                            const canDo = canPlayerCompleteChore(playerName, chore);
                            const isQuestToday = questsToday.includes(chore.id);
                            return (
                              <ListItem
                                key={qid}
                                sx={{
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                  mb: 0.5,
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'flex-start',
                                  gap: 0.5,
                                  bgcolor: 'rgba(255,255,255,0.45)',
                                }}
                              >
                                {(role === 'Life Master' || role === 'Player') && playerName ? (
                                  <Tooltip title={isQuestToday ? "Remove from today's quests" : "Set as today's quest"}>
                                    <IconButton
                                      size="small"
                                      sx={{ mt: 0.25 }}
                                      onClick={() => toggleQuestChoreForPlayerToday(playerName, chore.id)}
                                      aria-label={isQuestToday ? 'Remove from today quests' : 'Add to today quests'}
                                    >
                                      {isQuestToday ? (
                                        <FavoriteIcon sx={{ color: '#c62828' }} />
                                      ) : (
                                        <FavoriteBorderIcon sx={{ color: '#c62828' }} />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                ) : null}
                                <ListItemText
                                  sx={{ flex: '1 1 200px', minWidth: 0 }}
                                  primary={`${chore.title} · ${chore.schedule}`}
                                  secondary={[
                                    `Effort ${'★'.repeat(Number(chore.effortStars) || 1)} · Open`,
                                    chore.skillName
                                      ? `+${choreXpFromEffortStars(chore.effortStars)} XP${chore.subSkillName ? ` → ${chore.subSkillName}` : ''}${chore.scaleXpWithLevel ? ` (scales · Lv ${Math.max(1, Number(chore.requiredLevel) || 1)}+)` : ''}`
                                      : null,
                                  ].filter(Boolean).join(' · ')}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, ml: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                  <ChoreStarRewardBanner chore={chore} />
                                  <ChoreCoinRewardBanner chore={chore} effortCoinsByStar={effortCoinsByStar} />
                                  <Button size="small" variant="contained" disabled={!canDo} onClick={() => handleCompleteChore(chore)}>
                                    Complete
                                  </Button>
                                </Box>
                              </ListItem>
                            );
                          })
                        )}
                      </List>
                    </Box>
                    <ChoreThemeSectionSeparator themeId={choreTheme.id} accent={choreTheme.accent} />
                    <Tabs
                      value={choreRoomTab}
                      onChange={(_, value) => setChoreRoomTab(value)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{
                        mb: 1,
                        '& .MuiTab-root': { color: `${choreTheme.textColor} !important`, opacity: 0.85 },
                        '& .Mui-selected': { color: `${choreTheme.textColor} !important`, opacity: 1 },
                        '& .MuiTabs-indicator': { backgroundColor: choreTheme.accent },
                      }}
                    >
                      {CHORE_ROOMS.map((room) => <Tab key={room} value={room} label={room} />)}
                    </Tabs>
                    {role === 'Life Master' && (
                      <Box sx={{ mb: 1.5 }}>
                        <Button variant="outlined" onClick={() => setManageChoresDialogOpen(true)} sx={{ borderColor: choreTheme.accent, color: choreTheme.textColor }}>
                          Manage Chores
                        </Button>
                      </Box>
                    )}
                    <List dense>
                      {CHORE_PERIODS.map((sched) => {
                        const group = visibleChoresForRoom.filter((c) => c.schedule === sched);
                        if (group.length === 0) return null;
                        const schedLabel = sched === 'daily' ? 'Daily' : sched === 'weekly' ? 'Weekly' : 'Monthly';
                        return (
                          <React.Fragment key={sched}>
                            <ListSubheader
                              component="div"
                              sx={{
                                bgcolor: 'transparent',
                                color: `${choreTheme.textColor} !important`,
                                fontWeight: 800,
                                lineHeight: '36px',
                                py: 0.5,
                              }}
                            >
                              {schedLabel}
                            </ListSubheader>
                            {group.map((chore) => {
                              const doneByAnyone = getCompletionsForChore(chore.id, chore.schedule).length > 0;
                              const canDo = canPlayerCompleteChore(playerName, chore);
                              const periodDoneLabel = doneByAnyone ? `Done (${getCompletionsForChore(chore.id, chore.schedule)[0]?.playerName || 'someone'})` : 'Open';
                              const isQuestToday = questsToday.includes(chore.id);
                              return (
                                <ListItem
                                  key={chore.id}
                                  sx={{
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    mb: 0.5,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    alignItems: 'flex-start',
                                    gap: 0.5,
                                  }}
                                >
                                  {(role === 'Life Master' || role === 'Player') && playerName ? (
                                    <Tooltip title={isQuestToday ? "Remove from today's quests" : "Set as today's quest"}>
                                      <IconButton
                                        size="small"
                                        sx={{ mt: 0.25 }}
                                        onClick={() => toggleQuestChoreForPlayerToday(playerName, chore.id)}
                                        aria-label={isQuestToday ? 'Remove from today quests' : 'Add to today quests'}
                                      >
                                        {isQuestToday ? (
                                          <FavoriteIcon sx={{ color: '#c62828' }} />
                                        ) : (
                                          <FavoriteBorderIcon sx={{ color: '#c62828' }} />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                  ) : null}
                                  <ListItemText
                                    sx={{ flex: '1 1 200px', minWidth: 0 }}
                                    primary={`${chore.title} · ${chore.schedule}`}
                                    secondary={[
                                      `Effort ${'★'.repeat(Number(chore.effortStars) || 1)} · ${periodDoneLabel}`,
                                      chore.skillName
                                        ? `+${choreXpFromEffortStars(chore.effortStars)} XP${chore.subSkillName ? ` → ${chore.subSkillName}` : ''}${chore.scaleXpWithLevel ? ` (scales · Lv ${Math.max(1, Number(chore.requiredLevel) || 1)}+)` : ''}`
                                        : null,
                                    ].filter(Boolean).join(' · ')}
                                  />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, ml: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <ChoreStarRewardBanner chore={chore} />
                                    <ChoreCoinRewardBanner chore={chore} effortCoinsByStar={effortCoinsByStar} />
                                    <Button size="small" variant="contained" disabled={!canDo} onClick={() => handleCompleteChore(chore)}>Complete</Button>
                                    {role === 'Life Master' && <IconButton size="small" onClick={() => setChores((prev) => prev.filter((c) => c.id !== chore.id))}><DeleteIcon fontSize="small" /></IconButton>}
                                  </Box>
                                </ListItem>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                      {visibleChoresForRoom.length === 0 && (
                        <ListItem>
                          <ListItemText
                            primary={
                              activeQuestTodayIds.length > 0
                                ? "Today's Quest above lists the remaining chores for this room."
                                : 'Nothing left in this room for now.'
                            }
                            secondary={
                              activeQuestTodayIds.length > 0
                                ? null
                                : 'Completed chores stay hidden until the next period.'
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Recent Activity (I am)</Typography>
                    <List dense>
                      {recentMine.length === 0 ? (
                        <ListItem>
                          <ListItemText
                            primary={
                              !playerName
                                ? 'No chores completed yet.'
                                : choreActivity.some((a) => a.playerName === playerName)
                                  ? `No recent activity in ${choreRoomTab}.`
                                  : 'No chores completed yet.'
                            }
                          />
                        </ListItem>
                      ) : (
                        recentMine.map((a) => (
                        <ListItem key={a.id}>
                          <ListItemText
                            primary={`${a.choreTitle} (${a.room})`}
                            secondary={`${new Date(a.at).toLocaleString()} · +${a.coins} coins · Effort ${a.effortStars}★`}
                          />
                        </ListItem>
                        ))
                      )}
                    </List>
                  </Box>
                )}
                {choreLeftTab === 'skills' && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: choreTheme.background,
                      ...(choreTheme.panelBackgroundSize
                        ? {
                            backgroundSize: choreTheme.panelBackgroundSize,
                            backgroundRepeat: choreTheme.panelBackgroundRepeat || 'no-repeat, repeat',
                          }
                        : {}),
                      border: '1px solid',
                      borderColor: 'divider',
                      color: choreTheme.textColor,
                      '& .MuiTypography-root': { color: `${choreTheme.textColor} !important` },
                      '& .MuiTab-root': { color: `${choreTheme.textColor} !important`, opacity: 0.9, fontWeight: 700 },
                      '& .MuiButton-root': { color: choreTheme.textColor },
                    }}
                  >
                    {role === 'Life Master' && (
                      <Box
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: 'rgba(255,255,255,0.78)',
                          border: '1px solid',
                          borderColor: '#000',
                          color: '#000',
                          '& .MuiInputLabel-root': { color: '#000 !important' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#000 !important' },
                          '& .MuiOutlinedInput-root': {
                            color: '#000',
                            '& fieldset': { borderColor: '#000' },
                            '&:hover fieldset': { borderColor: '#000' },
                            '&.Mui-focused fieldset': { borderColor: '#000' },
                          },
                          '& .MuiInputBase-input': { color: '#000 !important' },
                          '& .MuiOutlinedInput-input': { color: '#000 !important' },
                          '& .MuiOutlinedInput-input:-webkit-autofill': {
                            WebkitTextFillColor: '#000',
                          },
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 700, color: '#000 !important' }}>
                          Chore Skills (separate from Skills tab)
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: 'rgba(0,0,0,0.85) !important' }}>
                          Add skills used only for chores. XP from chores applies to these names. Names must not duplicate the Skills tab.
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start', mb: 1 }}>
                          <TextField
                            size="small"
                            label="Skill Name"
                            value={newChoreSkillNameInput}
                            onChange={(e) => setNewChoreSkillNameInput(e.target.value)}
                            InputProps={{
                              sx: {
                                bgcolor: '#fff',
                                color: '#000',
                                '& input': { color: '#000 !important', WebkitTextFillColor: '#000 !important' },
                              },
                            }}
                            InputLabelProps={{ sx: { color: 'rgba(0,0,0,0.75)', '&.Mui-focused': { color: '#000' } } }}
                            sx={{ minWidth: 160, flex: '1 1 140px' }}
                          />
                          <TextField
                            size="small"
                            label="Sub-skills (comma-separated, required)"
                            value={newChoreSkillSubSkillsInput}
                            onChange={(e) => setNewChoreSkillSubSkillsInput(e.target.value)}
                            InputProps={{
                              sx: {
                                bgcolor: '#fff',
                                color: '#000',
                                '& input': { color: '#000 !important', WebkitTextFillColor: '#000 !important' },
                              },
                            }}
                            InputLabelProps={{ sx: { color: 'rgba(0,0,0,0.75)', '&.Mui-focused': { color: '#000' } } }}
                            sx={{ minWidth: 220, flex: '2 1 200px' }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleAddChoreSkillDefinition}
                            sx={{
                              bgcolor: '#e0e0e0',
                              color: '#000',
                              '&:hover': { bgcolor: '#bdbdbd' },
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                        {choreSkills.length === 0 && (
                          <Typography variant="body2" sx={{ opacity: 0.85 }}>
                            No Chore Skills yet. Add at least one to pick a skill when creating chores.
                          </Typography>
                        )}
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="h5" sx={{ marginTop: 0 }}>
                        Chore Skills
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setChoreSkillsSectionExpanded((v) => !v)}
                        aria-expanded={choreSkillsSectionExpanded}
                        aria-label={choreSkillsSectionExpanded ? 'Collapse Skills List' : 'Expand Skills List'}
                      >
                        {choreSkillsSectionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                    {choreSkillsSectionExpanded &&
                      (choreSkills.length > 0 ? (
                        renderSkillsCards(choreSkills)
                      ) : (
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.85 }}>
                          Add Chore Skills above (Life Master) to see XP and progress here.
                        </Typography>
                      ))}
                  </Box>
                )}
                {choreLeftTab === 'board' && (
                  <Box
                    sx={{
                      ...OVERVIEW_GOLDEN_JAR_PANEL_SX,
                      mt: 0,
                      mb: 0,
                      p: 2,
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1, color: '#000' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmojiEventsIcon
                            sx={{
                              color: '#e6a800',
                              filter: 'drop-shadow(0 0 10px rgba(198, 140, 0, 0.45))',
                            }}
                          />
                          <Typography variant="h6" sx={{ m: 0, fontWeight: 800, color: '#000 !important' }}>
                            Leaderboard
                          </Typography>
                        </Box>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel sx={{ color: 'rgba(0,0,0,0.65)' }}>Range</InputLabel>
                          <Select
                            label="Range"
                            value={boardPeriod}
                            onChange={(e) => setBoardPeriod(e.target.value)}
                            sx={{
                              color: '#000',
                              '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(153, 98, 0, 0.55)' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(153, 98, 0, 0.75)' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(153, 98, 0, 0.9)' },
                              '& .MuiSvgIcon-root': { color: 'rgba(0,0,0,0.65)' },
                            }}
                          >
                            <MenuItem value="week">This Week</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                            <MenuItem value="quarter">This Quarter</MenuItem>
                            <MenuItem value="year">This Year</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0,0,0,0.65) !important' }}>
                        Chores completed in the selected range (from activity). Coins and effort stars are summed from those completions.
                      </Typography>
                      <List dense disablePadding>
                        {boardRows.map((r, idx) => (
                          <ListItem
                            key={r.name}
                            alignItems="flex-start"
                            sx={{
                              py: 1.25,
                              px: 1,
                              mb: 0.75,
                              borderRadius: 2,
                              border: '1px solid rgba(153, 98, 0, 0.32)',
                              bgcolor: 'rgba(255,255,255,0.42)',
                              ...(r.fav && {
                                borderLeft: `4px solid ${r.fav}`,
                                boxShadow: `inset 0 0 0 1px ${r.fav}33`,
                              }),
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 56, mt: 0.25 }}>
                              <Avatar
                                src={r.iconUrl || undefined}
                                alt={r.name}
                                sx={{
                                  width: 44,
                                  height: 44,
                                  border: r.fav ? `2px solid ${r.fav}` : '2px solid rgba(153, 98, 0, 0.35)',
                                  fontWeight: 700,
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  color: '#000',
                                }}
                              >
                                {r.name.charAt(0).toUpperCase()}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              disableTypography
                              primary={
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, columnGap: 1.5 }}>
                                  <Typography component="span" variant="subtitle1" sx={{ fontWeight: 800, color: '#000 !important' }}>
                                    {idx + 1}. {r.name}
                                  </Typography>
                                  <Typography component="span" variant="body2" sx={{ color: '#b8860b !important', fontWeight: 700 }}>
                                    +{r.coinCount} coins
                                  </Typography>
                                  <Typography component="span" variant="body2" sx={{ color: '#c62828 !important', fontWeight: 700 }}>
                                    +{r.effortStarCount} effort ★
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={`+${r.choreCount} chores`}
                                    sx={{
                                      height: 24,
                                      fontWeight: 700,
                                      color: '#4a3500',
                                      border: '1px solid rgba(153, 98, 0, 0.5)',
                                      bgcolor: 'rgba(255, 255, 255, 0.55)',
                                    }}
                                  />
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                )}
                {choreLeftTab === 'activity' && (
                  <Box sx={{ p: { xs: 1, sm: 2 } }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Activity</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Chore completions (newest first in each page). Showing {activityPageSizeChores} per page.
                    </Typography>
                    <Tabs
                      value={activityRoomFilter}
                      onChange={(_, v) => {
                        setActivityRoomFilter(v);
                        setActivityPage(0);
                      }}
                      variant="scrollable"
                      scrollButtons="auto"
                      allowScrollButtonsMobile
                      sx={{
                        mb: 1.5,
                        minHeight: 48,
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                      }}
                    >
                      <Tab value="__all__" label="ALL" />
                      {CHORE_ROOMS.map((room) => (
                        <Tab key={room} value={room} label={room} />
                      ))}
                    </Tabs>
                    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {activitySlice.length === 0 ? (
                        <ListItem disablePadding sx={{ display: 'block', overflow: 'visible' }}>
                          <Box sx={ACTIVITY_SCROLL_ITEM_SX}>
                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                              <ListItemText
                                primary={
                                  choreActivity.length === 0
                                    ? 'No chore activity yet.'
                                    : 'No completions for this room.'
                                }
                                secondary={
                                  choreActivity.length === 0
                                    ? 'Complete chores to see entries here.'
                                    : 'Try ALL or pick another room.'
                                }
                                primaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_PRIMARY_SX }}
                                secondaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_SECONDARY_SX }}
                              />
                            </Box>
                          </Box>
                        </ListItem>
                      ) : (
                        activitySlice.map((a) => (
                          <ListItem key={a.id} disablePadding sx={{ display: 'block', overflow: 'visible' }}>
                            <Box sx={ACTIVITY_SCROLL_ITEM_SX}>
                              <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <ListItemText
                                  primary={`${a.playerName} · ${a.choreTitle}`}
                                  secondary={`${new Date(a.at).toLocaleString()} · ${a.room} · +${a.coins} coins · ${a.effortStars}★`}
                                  primaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_PRIMARY_SX }}
                                  secondaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_SECONDARY_SX }}
                                />
                              </Box>
                            </Box>
                          </ListItem>
                        ))
                      )}
                    </List>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Button size="small" disabled={activityPage <= 0} onClick={() => setActivityPage((p) => Math.max(0, p - 1))}>Previous</Button>
                      <Typography variant="body2" color="text.secondary">
                        Page {activityPage + 1} of {activityPages}
                        {activityFiltered.length > 0 ? ` · ${activityFiltered.length} total` : ''}
                      </Typography>
                      <Button size="small" disabled={activityPage >= activityPages - 1} onClick={() => setActivityPage((p) => Math.min(activityPages - 1, p + 1))}>Next</Button>
                    </Box>
                  </Box>
                )}
                {choreLeftTab === 'rewards' && (
                  <Box sx={{ ...CHORE_REWARDS_GOLD_SX, mt: 0 }}>
                    <Box sx={{ position: 'relative', zIndex: 1, color: '#2a1f00', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceWalletIcon sx={{ color: '#a67c00', filter: 'drop-shadow(0 0 6px rgba(255,180,0,0.4))' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1200' }}>
                            Rewards Store
                          </Typography>
                        </Box>
                        {role === 'Life Master' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setManageRewardsDialogOpen(true)}
                            sx={{ borderColor: 'rgba(120, 80, 0, 0.45)', color: '#1a1200' }}
                          >
                            Manage Reward Store
                          </Button>
                        )}
                      </Box>
                      {!displayedPlayer ? (
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)' }}>
                          Select a player to see coin balance and redeem rewards.
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.88, mb: 1, color: 'rgba(0,0,0,0.65)' }}>
                            {displayedPlayer.name}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.35, color: '#1a1200' }}>
                            Current: {playerCoins.coins ?? 0}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.125, lineHeight: 1.35, color: 'rgba(0,0,0,0.75)' }}>
                            Total Earned: {playerCoins.totalEarned ?? 0}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mb: 1, lineHeight: 1.35, color: 'rgba(0,0,0,0.6)' }}>
                            Pending (not banked): {playerCoins.pending ?? 0}
                          </Typography>
                          {displayedPlayer.userType !== 'Adult' && (
                            <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: 'rgba(0,0,0,0.55)' }}>
                              Redeeming spends coins from your balance right away. A parent must approve the reward; if they deny it, your coins are returned.
                            </Typography>
                          )}
                          {rewardsStore.length === 0 ? (
                            <Box sx={{ ...PENDING_CHORE_REWARD_EMPTY_GOLD_SX }}>
                              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)', fontWeight: 600 }}>
                                No rewards in the store yet.
                              </Typography>
                            </Box>
                          ) : rewardsForPlayer.length === 0 ? (
                            <Box sx={{ ...PENDING_CHORE_REWARD_EMPTY_GOLD_SX }}>
                              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)', fontWeight: 600 }}>
                                No rewards are available for this player in the store.
                              </Typography>
                            </Box>
                          ) : (
                            <List dense disablePadding>
                              {rewardsForPlayer.map((r) => (
                                <ListItem
                                  key={r.id}
                                  sx={{
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    alignItems: 'center',
                                    py: 1.25,
                                    borderBottom: 1,
                                    borderColor: 'rgba(0,0,0,0.1)',
                                  }}
                                >
                                  <ListItemText
                                    primary={r.name}
                                    secondary={[
                                      `${r.cost} coins`,
                                      Number(r.screenTimeMinutes) > 0 ? `${r.screenTimeMinutes} min screen time (if redeemed)` : null,
                                    ]
                                      .filter(Boolean)
                                      .join(' · ')}
                                    primaryTypographyProps={{ variant: 'body2', sx: { color: '#1a1200', fontWeight: 600 } }}
                                    secondaryTypographyProps={{ variant: 'caption', sx: { color: 'rgba(0,0,0,0.6)' } }}
                                  />
                                  <Button
                                    size="small"
                                    variant="contained"
                                    disabled={playerCoins.coins < (Number(r.cost) || 0)}
                                    onClick={() => handleRequestReward(r.id)}
                                    sx={CHORE_REWARD_REDEEM_BUTTON_SX}
                                  >
                                    Redeem
                                  </Button>
                                  {role === 'Life Master' && (
                                    <IconButton
                                      size="small"
                                      aria-label={`Remove ${r.name}`}
                                      onClick={() => setRewardsStore((prev) => prev.filter((x) => x.id !== r.id))}
                                      sx={{ color: 'rgba(0,0,0,0.55)' }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                )}
                {choreLeftTab === 'redeemedRewards' && (
                  <Box sx={{ ...CHORE_REWARDS_GOLD_SX, mt: 0 }}>
                    <Box sx={{ position: 'relative', zIndex: 1, color: '#2a1f00', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AccountBalanceWalletIcon sx={{ color: '#a67c00', filter: 'drop-shadow(0 0 6px rgba(255,180,0,0.4))' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1200' }}>
                          Rewards
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0,0,0,0.65)' }}>
                        Screen time and your redemption history from the Rewards Store (newest first). Showing {REDEEMED_REWARDS_PAGE_SIZE} per page.
                      </Typography>
                      {!displayedPlayer ? (
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)' }}>
                          Select a player to see screen time and redemption history.
                        </Typography>
                      ) : (
                        <>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'rgba(0,0,0,0.6)' }}>
                            {displayedPlayer.name}
                          </Typography>
                          <ScreenTimeRewardsPanel
                            key={displayedPlayer.name}
                            playerName={displayedPlayer.name}
                            favouriteColor={displayedPlayer.favouriteColor}
                            screenTimeByPlayer={screenTimeByPlayer}
                            screenTimeTick={screenTimeTick}
                            onStart={(m) => handleStartScreenTime(displayedPlayer.name, m)}
                            onPause={() => handlePauseScreenTime(displayedPlayer.name)}
                            onResume={() => handleResumeScreenTime(displayedPlayer.name)}
                          />
                          {rewardRedemptionsForPlayer.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)' }}>
                              No redeemed rewards yet for {displayedPlayer.name}.
                            </Typography>
                          ) : (
                            <>
                              <List dense disablePadding>
                                {redeemedRewardsSlice.map((e) => (
                                  <ListItem
                                    key={e.id}
                                    sx={{
                                      flexWrap: 'wrap',
                                      gap: 1,
                                      alignItems: 'center',
                                      py: 1.25,
                                      borderBottom: 1,
                                      borderColor: 'rgba(0,0,0,0.1)',
                                    }}
                                  >
                                    <Box
                                      component="img"
                                      src={COIN_PNG_SRC}
                                      alt=""
                                      sx={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
                                    />
                                    <ListItemText
                                      primary={e.rewardName}
                                      secondary={[
                                        `${new Date(e.at).toLocaleString()} · ${e.cost} coins`,
                                        Number(e.screenTimeMinutes) > 0 ? `+${e.screenTimeMinutes} min screen time` : null,
                                        e.refunded && Number(e.screenTimeMinutes) > 0 ? 'Screen time refunded' : null,
                                      ]
                                        .filter(Boolean)
                                        .join(' · ')}
                                      primaryTypographyProps={{ variant: 'body2', sx: { color: '#1a1200', fontWeight: 600 } }}
                                      secondaryTypographyProps={{ variant: 'caption', sx: { color: 'rgba(0,0,0,0.6)' } }}
                                    />
                                    {role === 'Life Master' && Number(e.screenTimeMinutes) > 0 && !e.refunded && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleRefundScreenTimeRedemption(e.id)}
                                      >
                                        Refund screen time
                                      </Button>
                                    )}
                                  </ListItem>
                                ))}
                              </List>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Button
                                  size="small"
                                  disabled={safeRedeemedPage <= 0}
                                  onClick={() => setRedeemedRewardsPage((p) => Math.max(0, p - 1))}
                                >
                                  Previous
                                </Button>
                                <Typography variant="body2" color="text.secondary">
                                  Page {safeRedeemedPage + 1} of {redeemedRewardsPages}
                                  {rewardRedemptionsForPlayer.length > 0 ? ` · ${rewardRedemptionsForPlayer.length} total` : ''}
                                </Typography>
                                <Button
                                  size="small"
                                  disabled={safeRedeemedPage >= redeemedRewardsPages - 1}
                                  onClick={() => setRedeemedRewardsPage((p) => Math.min(redeemedRewardsPages - 1, p + 1))}
                                >
                                  Next
                                </Button>
                              </Box>
                            </>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                )}
                {choreLeftTab === 'rewardRequests' && showRewardRequestsTab && (
                  <Box sx={{ ...CHORE_REWARDS_GOLD_SX, mt: 0 }}>
                    <Box sx={{ position: 'relative', zIndex: 1, color: '#2a1f00', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AccountBalanceWalletIcon sx={{ color: '#a67c00', filter: 'drop-shadow(0 0 6px rgba(255,180,0,0.4))' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1200' }}>
                          Reward Requests
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0,0,0,0.65)' }}>
                        Coin reward redemptions from the chore rewards store. Approve to confirm or deny to cancel.
                      </Typography>
                      {rewardRequests.filter((r) => r.status === 'pending').length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                          No pending coin reward requests.
                        </Typography>
                      ) : (
                        <List dense disablePadding>
                          {rewardRequests
                            .filter((r) => r.status === 'pending')
                            .map((r) => (
                              <ListItem
                                key={r.id}
                                sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center', py: 1.25, borderBottom: 1, borderColor: 'rgba(0,0,0,0.1)' }}
                              >
                                <ListItemText
                                  primary={`${r.playerName} requested ${r.rewardName}`}
                                  secondary={`${r.cost} coins`}
                                  primaryTypographyProps={{ variant: 'body2', sx: { color: '#1a1200' } }}
                                  secondaryTypographyProps={{ variant: 'caption', sx: { color: 'rgba(0,0,0,0.6)' } }}
                                />
                                {canApproveRewardRequests && (
                                  <>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => handleResolveRewardRequest(r.id, true)}
                                      sx={CHORE_REWARD_REDEEM_BUTTON_SX}
                                    >
                                      Approve
                                    </Button>
                                    <Button size="small" color="error" variant="outlined" onClick={() => handleResolveRewardRequest(r.id, false)}>
                                      Deny
                                    </Button>
                                  </>
                                )}
                              </ListItem>
                            ))}
                        </List>
                      )}
                      {!canApproveRewardRequests && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(0,0,0,0.55)' }}>
                          Only adults can approve or deny requests.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                {choreLeftTab === 'achievements' && (
                  <Box sx={{ ...CHORE_REWARDS_GOLD_SX, mt: 0 }}>
                    <Box sx={{ position: 'relative', zIndex: 1, color: '#2a1f00', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <EmojiEventsIcon sx={{ color: '#a67c00', filter: 'drop-shadow(0 0 6px rgba(255,180,0,0.4))' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1200' }}>
                          Chore Achievements
                        </Typography>
                      </Box>
                      {!displayedPlayer ? (
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)' }}>
                          Select a player to view Chore Achievements.
                        </Typography>
                      ) : achievementDefinitions.filter(isChoreAchievementDef).length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)' }}>
                          {role === 'Life Master'
                            ? 'No Chore Achievements yet. Use Manage achievements (above the player tabs).'
                            : 'No Chore Achievements yet.'}
                        </Typography>
                      ) : (
                        <List dense disablePadding>
                          {achievementDefinitions.filter(isChoreAchievementDef).map((def) => {
                            const count = countChoreCompletionsForPlayer(choreActivity, displayedPlayer.name, def.choreId);
                            const thr = Math.max(1, Number(def.threshold) || 1);
                            const unlocked = count >= thr;
                            const chore = chores.find((c) => c.id === def.choreId);
                            const choreLabel = chore ? `${formatChoreRoomLabel(chore)}: ${chore.title}` : (def.choreId ? 'Unknown Chore' : '—');
                            return (
                              <ListItem
                                key={def.id}
                                sx={{ alignItems: 'flex-start', py: 1.25, borderBottom: 1, borderColor: 'rgba(0,0,0,0.1)' }}
                              >
                                <ListItemIcon sx={{ minWidth: 42, mt: 0.25 }}>
                                  {unlocked ? (
                                    <EmojiEventsIcon sx={{ color: '#b8860b' }} />
                                  ) : (
                                    <LockOutlinedIcon sx={{ color: 'rgba(0,0,0,0.35)' }} />
                                  )}
                                </ListItemIcon>
                                <ListItemText
                                  primary={def.name}
                                  primaryTypographyProps={{ variant: 'body2', sx: { color: '#1a1200', fontWeight: 600 } }}
                                  secondary={
                                    <>
                                      {def.unlockMessage ? (
                                        <Typography component="span" variant="body2" display="block" sx={{ color: 'rgba(0,0,0,0.7)', mt: 0.25 }}>
                                          {def.unlockMessage}
                                        </Typography>
                                      ) : null}
                                      <Typography component="span" variant="caption" sx={{ color: 'rgba(0,0,0,0.55)' }}>
                                        Chore: {choreLabel} · {unlocked ? 'Unlocked' : `${count} / ${thr} completions`}
                                      </Typography>
                                    </>
                                  }
                                />
                                <Chip
                                  size="small"
                                  label={unlocked ? 'Unlocked' : `${count}/${thr}`}
                                  sx={{
                                    fontWeight: 700,
                                    ...(unlocked
                                      ? {
                                          bgcolor: 'rgba(46, 125, 50, 0.25)',
                                          color: '#1b5e20',
                                          border: '1px solid rgba(46, 125, 50, 0.45)',
                                        }
                                      : {
                                          bgcolor: 'rgba(255, 255, 255, 0.45)',
                                          color: '#3e2723',
                                          border: '1px solid rgba(120, 80, 0, 0.35)',
                                        }),
                                  }}
                                  variant="outlined"
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })()}

        {role !== 'Overview' && role !== 'Weekly Review' && topTab === 'showcase' && (() => {
          const displayedPlayer = role === 'Life Master'
            ? players[xpTargetPlayerIndex]
            : role === 'Player' && activePlayerIndex != null
              ? players[activePlayerIndex]
              : null;
          const playerName = displayedPlayer?.name || '';
          if (!displayedPlayer) {
            return (
              <Box sx={{ mt: 3, width: '100%', maxWidth: '100%' }}>
                <Typography color="text.secondary">Select a player to view showcase.</Typography>
              </Box>
            );
          }
          const sc = normalizeShowcaseConfig(showcaseByPlayer[playerName] || {});
          const skillDefs = achievementDefinitions.filter(isSkillAchievementDef);
          const choreDefs = achievementDefinitions.filter(isChoreAchievementDef);
          const playerCoins = coinsByPlayer[playerName] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
          const playerStreak = getStreakDays(playerName);
          const doneToday = getTodayDoneCount(playerName);
          const starRow = starsByPlayer[playerName] || { pending: 0, current: 0, totalEarned: 0 };
          const updateShowcase = (patch) => {
            setShowcaseByPlayer((prev) => {
              const merged = {
                ...(prev[playerName] || {}),
                ...patch,
                showcaseUpdatedAt: Date.now(),
              };
              return { ...prev, [playerName]: normalizeShowcaseConfig(merged) };
            });
          };

          const skillLevelLine = (skillName) => {
            const skill =
              filterMergedSkillsForPlayer(mergedSkillDefsForXp, playerName).find((s) => s.name === skillName) ||
              skills.find((s) => s.name === skillName);
            if (!skill) return '—';
            const subs = skill.subSkills || [];
            if (subs.length === 0) {
              return '—';
            }
            return subs
              .map((s) => {
                const lv = getLevelInfo(getEntriesForSubSkill(playerName, skillName, s).actual).level;
                return `${s}: L${lv}`;
              })
              .join(' · ');
          };

          const renderShowcaseBlock = (blockId) => {
            switch (blockId) {
              case 'skillAchievements':
                return (
                  <ShowcaseSkillAchievementsPanel
                    ids={sc.skillAchievementIds}
                    onIdsChange={(skillAchievementIds) => updateShowcase({ skillAchievementIds })}
                    defs={skillDefs}
                    playerName={playerName}
                    xpGrantLog={xpGrantLog}
                    tasks={tasks}
                    variant="galaxy"
                  />
                );
              case 'choreAchievements':
                return (
                  <ShowcaseChoreAchievementsPanel
                    ids={sc.choreAchievementIds}
                    onIdsChange={(choreAchievementIds) => updateShowcase({ choreAchievementIds })}
                    defs={choreDefs}
                    playerName={playerName}
                    choreActivity={choreActivity}
                    chores={chores}
                    variant="gold"
                  />
                );
              case 'skillsShowcase':
                return (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Skills</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      Choose up to three skills to show your levels.
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel id="showcase-skills-label">Skills</InputLabel>
                      <Select
                        labelId="showcase-skills-label"
                        label="Skills"
                        multiple
                        value={sc.showcaseSkillNames}
                        onChange={(e) => {
                          const v = e.target.value;
                          const arr = typeof v === 'string' ? v.split(',') : v;
                          updateShowcase({ showcaseSkillNames: arr.slice(0, 3) });
                        }}
                        renderValue={(selected) => selected.join(', ') || '—'}
                      >
                        {filterMergedSkillsForPlayer(mergedSkillDefsForXp, playerName).map((s) => (
                          <MenuItem key={s.name} value={s.name}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {sc.showcaseSkillNames.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">None selected yet.</Typography>
                    ) : (
                      <List dense disablePadding>
                        {sc.showcaseSkillNames.map((name) => {
                          const SkillIcon = getSkillIconConfig(name, null);
                          const line = skillLevelLine(name);
                          return (
                            <ListItem key={name} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {SkillIcon ? <SkillIcon fontSize="small" /> : null}
                              </ListItemIcon>
                              <ListItemText primary={name} secondary={line} />
                            </ListItem>
                          );
                        })}
                      </List>
                    )}
                  </Box>
                );
              case 'streak':
                return (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Chore Streak</Typography>
                    <Box sx={{ p: 1.5, border: '2px solid', borderColor: '#7f0000', borderRadius: 2, bgcolor: 'rgba(183, 28, 28, 0.9)', minWidth: 0, maxWidth: '100%', flex: { xs: '1 1 100%', sm: '0 1 auto' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalFireDepartmentIcon sx={{ color: '#ffb74d' }} />
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, color: '#fff !important' }}>Current Streak</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 700, color: '#fff !important' }}>
                            {playerStreak} day(s)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#fff !important' }}>
                            {Math.max(0, 3 - doneToday)} more chores needed today to keep streak.
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              case 'coins':
                return (
                  <Box sx={SHOWCASE_GOLD_PANEL_SX}>
                    <Typography variant="subtitle1" gutterBottom>Coins</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#b8860b !important' }}>
                      Current: {playerCoins.coins ?? 0}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'block', mt: 0.5, color: 'rgba(0,0,0,0.7) !important' }}>
                      Total Earned: {playerCoins.totalEarned ?? 0}
                    </Typography>
                  </Box>
                );
              case 'stars':
                return (
                  <Box sx={SHOWCASE_GALAXY_PANEL_SX}>
                    <Typography variant="subtitle1" gutterBottom>Stars</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#ffca28 !important' }}>
                      Current: {starRow.current ?? 0}
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'block', mt: 0.5, color: 'rgba(255,255,255,0.72) !important' }}>
                      Total Earned: {starRow.totalEarned ?? 0}
                    </Typography>
                  </Box>
                );
              default:
                return null;
            }
          };

          return (
            <Box sx={{ mt: 3, width: '100%', maxWidth: '100%' }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Showcase
              </Typography>
              <ShowcaseGridLayout
                layout={sc.layout}
                gridCols={sc.gridCols}
                onLayoutChange={(newLayout) => updateShowcase({ layout: newLayout })}
                renderBlock={renderShowcaseBlock}
              />
            </Box>
          );
        })()}

        {role !== 'Overview' && role !== 'Weekly Review' && topTab === 'rules' && (
          <RulesPage
            rulesPage={rulesPage}
            onChange={(next) => setRulesPage(normalizeRulesPage(next))}
            readOnly={role !== 'Life Master'}
          />
        )}

        {role !== 'Overview' && role !== 'Weekly Review' && topTab === 'skills' && (() => {
          const displayedPlayer = role === 'Life Master'
            ? skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage'
              ? null
              : players[Number(skillsPlayerFilter)]
            : role === 'Player' && activePlayerIndex != null
              ? players[activePlayerIndex]
              : null;
          const homeChoreTheme = displayedPlayer ? getChoreThemeConfig(displayedPlayer) : null;
          const skillsFavColor = displayedPlayer?.favouriteColor;
          const starData = displayedPlayer ? (starsByPlayer[displayedPlayer.name] || { pending: 0, current: 0, totalEarned: 0 }) : null;
          const starRewardsForPlayer = displayedPlayer
            ? starRewards.filter((r) => rewardIsVisibleToPlayer(r, displayedPlayer.name))
            : [];
          const rewardRedemptionsForPlayerSkills = displayedPlayer
            ? rewardRedemptionLog.filter((e) => e.playerName === displayedPlayer.name)
            : [];
          const redeemedRewardsPagesSkills = Math.max(
            1,
            Math.ceil(rewardRedemptionsForPlayerSkills.length / REDEEMED_REWARDS_PAGE_SIZE),
          );
          const safeRedeemedPageSkills = Math.min(
            redeemedRewardsPage,
            Math.max(0, redeemedRewardsPagesSkills - 1),
          );
          const redeemedRewardsSliceSkills = rewardRedemptionsForPlayerSkills.slice(
            safeRedeemedPageSkills * REDEEMED_REWARDS_PAGE_SIZE,
            (safeRedeemedPageSkills + 1) * REDEEMED_REWARDS_PAGE_SIZE,
          );
          const skillAchDefs = achievementDefinitions.filter(isSkillAchievementDef);
          const skillAchUnlockedCount = displayedPlayer
            ? skillAchDefs.filter((def) => {
                const count = countTaskCompletionsForPlayer(xpGrantLog, displayedPlayer.name, def.taskId);
                const thr = Math.max(1, Number(def.threshold) || 1);
                return count >= thr;
              }).length
            : 0;
          const skillAchievementsFiltered = displayedPlayer
            ? skillAchDefs.filter((def) => {
                const count = countTaskCompletionsForPlayer(xpGrantLog, displayedPlayer.name, def.taskId);
                const thr = Math.max(1, Number(def.threshold) || 1);
                const unlocked = count >= thr;
                return skillAchievementsListTab === 'unlocked' ? unlocked : !unlocked;
              })
            : [];
          const sumTotalXpLifetime = (name) => {
            const block = xpByPlayer[name];
            if (!block || typeof block !== 'object') return 0;
            let t = 0;
            Object.keys(block).forEach((skillName) => {
              const sk = block[skillName];
              if (!sk || typeof sk !== 'object') return;
              Object.keys(sk).forEach((k) => {
                if (k === '__skillXp' || k.startsWith('__')) return;
                const e = sk[k];
                t += typeof e === 'object' && e && 'actual' in e ? Number(e.actual) || 0 : Number(e) || 0;
              });
            });
            return t;
          };
          const skillPeriodMatcher = (at) => {
            const d = new Date(at);
            if (skillsBoardPeriod === 'month') return getMonthKey(d) === getMonthKey();
            if (skillsBoardPeriod === 'quarter') return getQuarterKey(d) === getQuarterKey();
            if (skillsBoardPeriod === 'year') return d.getFullYear() === new Date().getFullYear();
            return getWeekKey(d) === getWeekKey();
          };
          const skillBoardRows = players
            .map((p) => {
              const periodEntries = xpGrantLog.filter((e) => e.playerName === p.name && skillPeriodMatcher(e.at));
              const xp = periodEntries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
              const starsEarned = periodEntries.reduce((s, e) => s + (Number(e.starReward) || 0), 0);
              const gainByKey = {};
              periodEntries.forEach((e) => {
                const sk = e.skillName;
                const sub = e.subSkillName || null;
                const key = sub ? `${sk}\u0000${sub}` : `${sk}\u0000__root`;
                gainByKey[key] = (gainByKey[key] || 0) + (Number(e.amount) || 0);
              });
              let levelsGained = 0;
              filterMergedSkillsForPlayer(mergedSkillDefsForXp, p.name).forEach((skill) => {
                const subs = (skill.subSkills || []).filter(Boolean);
                subs.forEach((s) => {
                  const cur = getEntriesForSubSkill(p.name, skill.name, s).actual;
                  const g = gainByKey[`${skill.name}\u0000${s}`] || 0;
                  const start = Math.max(0, cur - g);
                  levelsGained += Math.max(0, xpToLevel(cur) - xpToLevel(start));
                });
              });
              return { name: p.name, xp, levelsGained, starsEarned, fav: p.favouriteColor, iconUrl: p.iconUrl };
            })
            .sort((a, b) => b.xp - a.xp);
          const xpLogSorted = [...xpGrantLog].sort((a, b) => new Date(b.at) - new Date(a.at));
          const skillsForActivityFilter = displayedPlayer
            ? filterMergedSkillsForPlayer(mergedSkillDefsForXp, displayedPlayer.name)
            : mergedSkillDefsForXp;
          const skillsActivityPageSize = 10;
          const xpLogActivityFiltered = xpLogSorted.filter((e) => {
            if (
              !(
                skillsPlayerFilter === 'all' ||
                skillsPlayerFilter === 'manage' ||
                e.playerName === players[Number(skillsPlayerFilter)]?.name
              )
            ) {
              return false;
            }
            if (skillsActivitySkillFilter !== '__all__' && e.skillName !== skillsActivitySkillFilter) {
              return false;
            }
            if (skillsActivitySubFilter !== '__all__' && (e.subSkillName || '') !== skillsActivitySubFilter) {
              return false;
            }
            const t = new Date(e.at).getTime();
            if (skillsActivityDateFrom) {
              const from = new Date(`${skillsActivityDateFrom}T00:00:00`);
              if (t < from.getTime()) return false;
            }
            if (skillsActivityDateTo) {
              const to = new Date(`${skillsActivityDateTo}T23:59:59.999`);
              if (t > to.getTime()) return false;
            }
            return true;
          });
          const skillsActivityPages = Math.max(1, Math.ceil(xpLogActivityFiltered.length / skillsActivityPageSize));
          const skillsActivitySlice = xpLogActivityFiltered.slice(
            skillsActivityPage * skillsActivityPageSize,
            (skillsActivityPage + 1) * skillsActivityPageSize,
          );
          const skillsActivityFilterCount =
            (skillsActivitySkillFilter !== '__all__' ? 1 : 0) +
            (skillsActivitySubFilter !== '__all__' ? 1 : 0) +
            (skillsActivityDateFrom ? 1 : 0) +
            (skillsActivityDateTo ? 1 : 0);
          const skillsActivitySubOptions =
            skillsActivitySkillFilter === '__all__'
              ? []
              : (skillsForActivityFilter.find((s) => s.name === skillsActivitySkillFilter)?.subSkills || []).filter(Boolean);
          const recentXpHome = xpLogSorted
            .filter((e) => !displayedPlayer || e.playerName === displayedPlayer.name)
            .slice(0, 12);
          const skillsHomeStatBoxSx = {
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: 'text.primary',
            minWidth: 200,
            flex: '1 1 200px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 88,
          };
          return (
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: 'stretch',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <Tabs
              value={skillsLeftTab}
                    onChange={(_, v) => {
                      setSkillsLeftTab(v);
                      setSkillsActivityPage(0);
                      setRedeemedRewardsPage(0);
                    }}
              orientation={isChoreNavDesktop ? 'vertical' : 'horizontal'}
              variant={isChoreNavDesktop ? 'standard' : 'scrollable'}
              scrollButtons={isChoreNavDesktop ? false : 'auto'}
              allowScrollButtonsMobile
              sx={{
                borderRight: isChoreNavDesktop ? 1 : 0,
                borderBottom: isChoreNavDesktop ? 0 : 1,
                borderColor: 'divider',
                minWidth: isChoreNavDesktop ? 140 : undefined,
                width: { xs: '100%', md: 'auto' },
                alignSelf: { xs: 'stretch', md: 'flex-start' },
                flexShrink: 0,
              }}
            >
              <Tab value="home" label="Home" />
              <Tab value="skills" label="Skills" />
              {role === 'Life Master' && <Tab value="tasks" label="Tasks" />}
              <Tab value="board" label="Board" />
              <Tab value="activity" label="Activity" />
              <Tab value="achievements" label="Achievements" />
              <Tab value="rewards" label="Rewards Store" />
              <Tab value="redeemedRewards" label="Rewards" />
              {showRewardRequestsTab && (
                <Tab value="rewardRequests" label="Reward Requests" />
              )}
            </Tabs>
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            {role === 'Life Master' && players.length > 0 && skillsLeftTab !== 'tasks' && (
              skillsLeftTab === 'board' ? (
                <Box
                  sx={{
                    mb: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    minHeight: 48,
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    py: 0.5,
                    boxSizing: 'border-box',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    These are the top scorers this time around!
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    minHeight: 48,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                  }}
                >
                  <Tabs
                    value={skillsPlayerFilter}
                    onChange={(_, v) => {
                      setSkillsPlayerFilter(v);
                      setSkillsActivityPage(0);
                      setRedeemedRewardsPage(0);
                      if (v !== 'all' && v !== 'manage') setXpTargetPlayerIndex(Number(v));
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      minHeight: 48,
                      borderBottom: 0,
                      mb: 0,
                      '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                    }}
                  >
                    <Tab label="All" value="all" />
                    {players.map((p, i) => (
                      <Tab key={p.name} label={p.name} value={String(i)} />
                    ))}
                    {skillsLeftTab === 'rewards' && role === 'Life Master' && (
                      <Tab label="Manage rewards" value="manage" />
                    )}
                  </Tabs>
                  {skillsLeftTab === 'achievements' && role === 'Life Master' && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ flexShrink: 0, alignSelf: 'center', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setSettingsSection('achievements');
                      }}
                    >
                      Manage achievements
                    </Button>
                  )}
                  {skillsLeftTab === 'rewards' && role === 'Life Master' && (
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ flexShrink: 0, alignSelf: 'center', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        setStarRewardMgmtDialogOpen(true);
                        setStarRewardMgmtDraft(null);
                      }}
                    >
                      Edit Reward
                    </Button>
                  )}
                </Box>
              )
            )}
          {skillsLeftTab === 'home' && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                ...(skillsFavColor && {
                  borderLeft: 4,
                  borderLeftColor: skillsFavColor,
                  bgcolor: `${skillsFavColor}18`,
                }),
              }}
            >
              {role === 'Life Master' && (skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage') ? (
                <>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2, alignItems: 'stretch' }}>
                    <Box sx={skillsHomeStatBoxSx}>
                      <Typography variant="caption" color="text.secondary">Skills tracked</Typography>
                      <Typography variant="h5" sx={{ color: 'text.primary' }}>{skills.length}</Typography>
                    </Box>
                    <Box sx={skillsHomeStatBoxSx}>
                      <Typography variant="caption" color="text.secondary">Total XP (lifetime, all)</Typography>
                      <Typography variant="h5" sx={{ color: 'text.primary' }}>
                        {players.reduce((acc, p) => acc + sumTotalXpLifetime(p.name), 0)}
                      </Typography>
                    </Box>
                    <Box sx={skillsHomeStatBoxSx}>
                      <Typography variant="caption" color="text.secondary">View</Typography>
                      <Typography variant="h5" sx={{ color: 'text.primary', lineHeight: 1.25 }}>Everyone</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Select a player tab for personal stars, rewards, and recent XP.
                  </Typography>
                </>
              ) : !displayedPlayer ? (
                <Typography color="text.secondary">Select a player tab to see Home.</Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2, alignItems: 'stretch' }}>
                    <Box sx={skillsHomeStatBoxSx}>
                      <Typography variant="caption" color="text.secondary">Skills tracked</Typography>
                      <Typography variant="h5" sx={{ color: 'text.primary' }}>
                        {filterMergedSkillsForPlayer(mergedSkillDefsForXp, displayedPlayer.name).length}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        ...skillsHomeStatBoxSx,
                        bgcolor: '#a5d6a7',
                        borderColor: '#66bb6a',
                        '& .MuiTypography-root': { color: '#111 !important' },
                      }}
                    >
                      <Typography variant="caption">Total XP (lifetime)</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{sumTotalXpLifetime(displayedPlayer.name)}</Typography>
                    </Box>
                    <Box
                      sx={{
                        ...skillsHomeStatBoxSx,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        minHeight: 96,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary">
                          {role === 'Player' ? 'I am' : 'Player'}
                        </Typography>
                        <Typography variant="h5" sx={{ color: 'text.primary', wordBreak: 'break-word', lineHeight: 1.25 }}>
                          {displayedPlayer.name}
                        </Typography>
                      </Box>
                      <Box
                        component="span"
                        role="img"
                        aria-label={homeChoreTheme?.label || 'Chore theme'}
                        title={homeChoreTheme?.label || ''}
                        sx={{
                          flexShrink: 0,
                          fontSize: { xs: '2.25rem', sm: '2.75rem' },
                          lineHeight: 1,
                          userSelect: 'none',
                          opacity: 0.92,
                        }}
                      >
                        {homeChoreTheme?.emoji ?? ''}
                      </Box>
                    </Box>
                  </Box>
                  {starData && (
                    <Box sx={{ ...STAR_REWARDS_GALAXY_SX, mt: 0 }}>
              <Box sx={{ position: 'relative', zIndex: 1, color: '#ede7ff', ...SHARED_REWARD_PANEL_STACK_SX }}>
                <Box sx={{ width: '100%' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: 700,
                      opacity: 0.85,
                      mb: 0.25,
                      color: '#f3e8ff',
                      textShadow: '0 0 12px rgba(186, 104, 255, 0.45)',
                    }}
                  >
                    Star rewards
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.35, color: '#ffffff' }}>
                    Current: {starData.current ?? 0}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.125, lineHeight: 1.35, color: 'rgba(255,255,255,0.78)' }}>
                    Total Earned: {starData.totalEarned ?? 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'flex-end' },
                    justifyContent: 'space-between',
                    gap: { xs: 2, md: 3 },
                    width: '100%',
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      flex: '0 1 auto',
                      minWidth: 0,
                      width: { xs: '100%', md: 'auto' },
                      maxWidth: { xs: 400, md: 'min(46%, 400px)' },
                      alignSelf: { xs: 'flex-start', md: 'flex-end' },
                    }}
                  >
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.9, mb: 0.75, lineHeight: 1.35 }}>
                      Pending (not in jar): {starData.pending ?? 0}
                    </Typography>
                    <Box
                      sx={{
                        ...PENDING_STARS_ZONE_GALAXY_SX,
                        width: '100%',
                        maxWidth: '100%',
                        justifyContent: starData.pending === 0 ? 'center' : 'flex-start',
                        alignContent: starData.pending === 0 ? 'center' : 'flex-end',
                        alignItems: starData.pending === 0 ? 'center' : 'flex-end',
                      }}
                    >
                      {[...Array(Math.min(starData.pending, 30))].map((_, i) => (
                        <Box
                          key={i}
                          draggable
                          onClick={() => handleRedeemStarToJar(displayedPlayer.name)}
                          onDragStart={(e) => {
                            if (e.dataTransfer) {
                              e.dataTransfer.setData('text/plain', 'star');
                              e.dataTransfer.effectAllowed = 'move';
                            }
                          }}
                          sx={{ cursor: 'grab', color: '#ffca28', userSelect: 'none', '&:active': { cursor: 'grabbing' } }}
                          title="Drag to jar to redeem"
                        >
                          <StarIcon sx={{ fontSize: 40, filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.55))' }} />
                        </Box>
                      ))}
                      {starData.pending > 30 && (
                        <Typography variant="body2" sx={{ alignSelf: 'flex-end', pl: 0.5, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
                          +{starData.pending - 30} more
                        </Typography>
                      )}
                      {starData.pending === 0 && (
                        <Typography variant="body1" sx={{ fontWeight: 600, textAlign: 'left', width: '100%', py: 0.5, color: 'rgba(255,255,255,0.82)' }}>
                          No pending stars
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      ...SHARED_REWARD_PANEL_JAR_COLUMN_SX,
                      alignItems: 'center',
                      alignSelf: { xs: 'flex-end', md: 'flex-end' },
                      width: { xs: '100%', md: 'auto' },
                    }}
                  >
                    <Box sx={{ width: CHORES_STAR_JAR_WIDTH_PX, maxWidth: '100%', position: 'relative' }}>
                      <Box
                        component="div"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const data = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
                          if (data === 'star') handleRedeemStarToJar(displayedPlayer.name);
                        }}
                        sx={{
                          ...CHORES_COINS_JAR_LIP_SX,
                          borderColor: 'rgba(48, 27, 72, 0.95)',
                          bgcolor: 'rgba(28, 16, 44, 0.92)',
                          cursor: 'copy',
                          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.45), 0 0 18px rgba(103, 58, 183, 0.35)',
                          '&:hover': {
                            borderColor: 'rgba(186, 104, 255, 0.75)',
                            bgcolor: 'rgba(40, 22, 62, 0.96)',
                          },
                        }}
                        title="Drop stars here (on the lip) to redeem"
                      />
                      <Box sx={CHORES_STAR_JAR_BODY_SX}>
                        {[...Array(Math.min(starData.current || 0, 30))].map((_, i) => (
                          <StarIcon
                            key={i}
                            sx={{
                              fontSize: 22,
                              color: '#ffc107',
                              position: 'relative',
                              zIndex: 1,
                              width: '100%',
                              maxWidth: 22,
                              height: 'auto',
                              filter: 'drop-shadow(0 0 3px rgba(255, 193, 7, 0.65))',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 600, lineHeight: 1.2, color: '#f3e8ff' }}>
                      {starData.current || 0} stars in jar
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
                  )}
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Recent XP</Typography>
                  <List dense>
                    {recentXpHome.length === 0 ? (
                      <ListItem><ListItemText primary="No XP grants yet." /></ListItem>
                    ) : (
                      recentXpHome.map((e, idx) => (
                        <ListItem key={`${e.at}-${idx}`}>
                          <ListItemText
                            primary={`${e.skillName || '—'}${e.subSkillName ? ` · ${e.subSkillName}` : ''}`}
                            secondary={`${e.playerName} · +${e.amount} XP · ${new Date(e.at).toLocaleString()}`}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </>
              )}
            </Box>
          )}
          {skillsLeftTab === 'skills' && (
            <Box
              sx={{
                ...(skillsFavColor && {
                  p: 2,
                  borderRadius: 1,
                  bgcolor: `${skillsFavColor}18`,
                  borderLeft: 4,
                  borderLeftColor: skillsFavColor,
                }),
              }}
            >
            {role === 'Life Master' && players.length > 0 && (() => {
              const grantXpPlayerIndex =
                skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage'
                  ? xpTargetPlayerIndex
                  : Math.min(Math.max(0, Number(skillsPlayerFilter) || 0), players.length - 1);
              return (
      <Box sx={{
            mb: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            ...(darkMode && { bgcolor: 'grey.900' }),
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Typography variant="h6" component="span">Grant XP</Typography>
              <Tooltip title="XP grant log">
                <IconButton size="small" aria-label="XP grant log" onClick={() => setXpLogDialogOpen(true)}>
                  <ViewListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                gap: 2,
                mt: 1,
                width: '100%',
                '& > *': { minWidth: 0, flex: { xs: '1 1 auto', sm: '1 1 200px' } },
              }}
            >
            {(skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage') && (
            <Box sx={{ minWidth: 0, width: '100%', maxWidth: { sm: 400 } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="xp-target-player-label">
                  XP Target Player
                </InputLabel>
                <Select
                  labelId="xp-target-player-label"
                  label="XP Target Player"
                  value={xpTargetPlayerIndex}
                  onChange={(e) =>
                    setXpTargetPlayerIndex(Number(e.target.value))
                  }
                >
                  {players.map((player, index) => (
                    <MenuItem key={index} value={index}>
                      {player.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            )}
            <Box sx={{ minWidth: 0, width: '100%', maxWidth: { sm: 400 } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="xp-skill-label">Skill</InputLabel>
                <Select
                  labelId="xp-skill-label"
                  label="Skill"
                  value={xpSkillName}
                  onChange={(e) => {
                    setXpSkillName(e.target.value);
                    setXpSubSkillName('');
                  }}
                >
                  {[...mergedSkillDefsForGrantTarget]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((skill) => (
                    <MenuItem key={skill.name} value={skill.name}>
                      {skill.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 0, width: '100%', maxWidth: { sm: 400 } }}>
              <FormControl
                fullWidth
                size="small"
                disabled={
                  !xpSkillName ||
                  !(getSkillDefMergedForGrantTarget(xpSkillName)?.subSkills || []).filter(Boolean).length
                }
              >
                <InputLabel id="xp-sub-skill-label">Sub-skill</InputLabel>
                <Select
                  labelId="xp-sub-skill-label"
                  label="Sub-skill"
                  value={xpSubSkillName}
                  onChange={(e) => setXpSubSkillName(e.target.value)}
                >
                  {([...(getSkillDefMergedForGrantTarget(xpSkillName)?.subSkills || [])]
                    .sort((a, b) => a.localeCompare(b))
                  ).map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            </Box>
            {(() => {
              const targetPlayer = players[grantXpPlayerIndex];
              const targetName = targetPlayer?.name;
              const skillDef = getSkillDefMergedForGrantTarget(xpSkillName);
              const hasSub = (skillDef?.subSkills || []).filter(Boolean).length > 0;
              if (!targetName || !xpSkillName) return null;
              if (!hasSub || !xpSubSkillName) return null;
              const entries = getEntriesForSubSkill(targetName, xpSkillName, xpSubSkillName);
              const levelInfo = getLevelInfo(entries.actual);
              const label = `${xpSkillName} › ${xpSubSkillName}`;
              return (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    width: '100%',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {targetName} — {label}
                  </Typography>
                  <Box sx={{ ...XP_PROGRESS_CONTAINER_SX, flexWrap: 'wrap' }}>
                    <Typography variant="body2">Lvl {levelInfo.level}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={levelInfo.progress * 100}
                      sx={XP_PROGRESS_BAR_SX}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {levelInfo.xpToNextLevel > 0 ? `${levelInfo.xpToNextLevel} XP to next` : 'Max'}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      XP: {entries.actual} {entries.pending > 0 && `| Pending: ${entries.pending}`}
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                flexWrap: 'wrap',
                alignItems: { xs: 'stretch', lg: 'flex-start' },
                gap: { xs: 1.5, lg: 1 },
                mt: 2,
                width: '100%',
                maxWidth: '100%',
                '& > *': { minWidth: 0 },
              }}
            >
              <FormControl
                fullWidth
                size="small"
                sx={{ flex: { xs: '1 1 auto', lg: '1 1 200px' }, minWidth: 0, maxWidth: '100%' }}
              >
                <InputLabel id="xp-task-label">Task / Action</InputLabel>
                <Select
                  labelId="xp-task-label"
                  label="Task / Action"
                  value={xpTaskId}
                  onChange={(e) => {
                    setXpTaskId(e.target.value);
                  }}
                >
                  {(() => {
                    const player = players[grantXpPlayerIndex];
                    const playerName = player?.name;
                    if (!playerName || !xpSkillName) return [];
                    const skillDef = getSkillDefMergedForGrantTarget(xpSkillName);
                    const hasSub =
                      skillDef &&
                      Array.isArray(skillDef.subSkills) &&
                      skillDef.subSkills.filter(Boolean).length > 0;
                    if (!hasSub || !xpSubSkillName) return [];
                    const currentXp = getXpForSubSkill(
                      playerName,
                      xpSkillName,
                      xpSubSkillName
                    );
                    const level = xpToLevel(currentXp);
                    const applicable = tasks.filter((t) => {
                      if (t.skillName !== xpSkillName) return false;
                      const taskSub = t.subSkillName || null;
                      if (taskSub !== xpSubSkillName) return false;
                      return typeof t.requiredLevel === 'number'
                        ? t.requiredLevel <= level
                        : true;
                    });
                    return applicable.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.title} (Lv {t.requiredLevel}, +{t.xpReward} XP{t.scaleXpWithLevel ? ' (scales)' : ''}{t.starReward ? `, ★${t.starReward}` : ''})
                      </MenuItem>
                    ));
                  })()}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="What happened?"
                placeholder="Optional note for the log"
                value={xpWhatHappened}
                onChange={(e) => setXpWhatHappened(e.target.value)}
                sx={{
                  minWidth: 0,
                  flex: { xs: '1 1 100%', lg: '1 1 200px' },
                  width: { xs: '100%', lg: 'auto' },
                  maxWidth: '100%',
                }}
              />
              {xpTaskId && (() => {
                const task = tasks.find((t) => t.id === xpTaskId);
                const player = players[grantXpPlayerIndex];
                if (!task?.scaleXpWithLevel || !player?.name || typeof task.xpReward !== 'number') return null;
                const skill = getSkillDefMergedForGrantTarget(xpSkillName);
                const hasSub = skill && Array.isArray(skill.subSkills) && skill.subSkills.filter(Boolean).length > 0;
                if (!hasSub || !xpSubSkillName) return null;
                const currentXp = getXpForSubSkill(player.name, xpSkillName, xpSubSkillName);
                const currentLevel = xpToLevel(currentXp);
                const minLevel = Math.max(1, Number(task.requiredLevel) || 1);
                const scaled = Math.max(1, Math.round(task.xpReward * getXpDeltaForLevel(currentLevel) / getXpDeltaForLevel(minLevel)));
                return (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                      alignSelf: { xs: 'flex-start', lg: 'center' },
                      ml: { xs: 0, lg: 1 },
                      width: { xs: '100%', lg: 'auto' },
                    }}
                  >
                    Will grant: +{scaled} XP at level {currentLevel}
                  </Typography>
                );
              })()}
              <Button
                variant="outlined"
                sx={{ alignSelf: { xs: 'stretch', lg: 'center' } }}
                onClick={() => {
                  if (!players.length || !xpSkillName || !xpTaskId) return;
                  const skill = getSkillDefMergedForGrantTarget(xpSkillName);
                  const hasSubSkills =
                    skill && Array.isArray(skill.subSkills) && skill.subSkills.filter(Boolean).length > 0;
                  if (!hasSubSkills || !xpSubSkillName) {
                    return;
                  }
                  const task = tasks.find((t) => t.id === xpTaskId);
                  if (!task || typeof task.xpReward !== 'number') return;
                  let amount = 0;
                  const baseXp = task.xpReward;
                  if (task.scaleXpWithLevel) {
                    const player = players[grantXpPlayerIndex];
                    const playerName = player?.name;
                    if (playerName) {
                      const currentXp = getXpForSubSkill(playerName, xpSkillName, xpSubSkillName);
                      const currentLevel = xpToLevel(currentXp);
                      const minLevel = Math.max(1, Number(task.requiredLevel) || 1);
                      const deltaCurrent = getXpDeltaForLevel(currentLevel);
                      const deltaMin = getXpDeltaForLevel(minLevel);
                      amount = Math.max(1, Math.round(baseXp * deltaCurrent / deltaMin));
                    } else {
                      amount = baseXp;
                    }
                  } else {
                    amount = baseXp;
                  }
                  if (amount <= 0) return;
                  const key = `${xpSkillName}:${xpSubSkillName}`;
                  setRecentTaskIdsBySkillKey((prev) => {
                    const list = [...(prev[key] || []).filter((id) => id !== xpTaskId), xpTaskId].slice(-3);
                    return { ...prev, [key]: list };
                  });
                  const starReward = typeof task.starReward === 'number' && task.starReward > 0 ? task.starReward : 0;
                  handleGrantXp(
                    xpSkillName,
                    xpSubSkillName,
                    amount,
                    {
                      taskId: xpTaskId,
                      taskTitle: task.title,
                      whatHappened: xpWhatHappened?.trim() || undefined,
                      starReward: starReward || undefined,
                      playerIndex: grantXpPlayerIndex,
                    }
                  );
                  setXpWhatHappened('');
                }}
              >
                Award Task
              </Button>
              {role === 'Life Master' && (
                <Button
                  variant="outlined"
                  color="warning"
                  sx={{ alignSelf: { xs: 'stretch', lg: 'center' } }}
                  disabled={!xpTaskId || !tasks.find((t) => t.id === xpTaskId && Number(t.starReward) > 0)}
                  onClick={() => {
                    const player = players[grantXpPlayerIndex];
                    const task = tasks.find((t) => t.id === xpTaskId);
                    if (!player?.name || !task || !(Number(task.starReward) > 0)) return;
                    handleRemoveStarsForTask(
                      player.name,
                      task,
                      xpWhatHappened?.trim() || undefined
                    );
                    setXpWhatHappened('');
                  }}
                >
                  Remove Task Stars
                </Button>
              )}
            </Box>
          </Box>
            );
            })()}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ marginTop: 0 }}>
                Skills
              </Typography>
              <IconButton
                size="small"
                onClick={() => setSkillsSectionExpanded((v) => !v)}
                aria-expanded={skillsSectionExpanded}
                aria-label={skillsSectionExpanded ? 'Collapse Skills List' : 'Expand Skills List'}
              >
                {skillsSectionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            {skillsSectionExpanded && (role === 'Life Master' && (skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage') ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                Select a player tab (not All) to view skill levels and actions.
              </Typography>
            ) : (
              renderSkillsCards()
            ))}
            </Box>
          )}
          {skillsLeftTab === 'tasks' && role === 'Life Master' && (
            <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 720 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Manage Tasks / Actions</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ minWidth: 200 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="task-skill-label-inline">Skill</InputLabel>
                    <Select
                      labelId="task-skill-label-inline"
                      label="Skill"
                      value={taskSkillName}
                      onChange={(e) => {
                        setTaskSkillName(e.target.value);
                        setTaskSubSkillName('');
                      }}
                    >
                      {skills
                        .filter((sk) => (sk.subSkills || []).filter(Boolean).length > 0)
                        .map((skill) => (
                          <MenuItem key={skill.name} value={skill.name}>
                            {skill.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ minWidth: 200 }}>
                  <FormControl
                    fullWidth
                    size="small"
                    disabled={
                      !taskSkillName ||
                      !(skills.find((s) => s.name === taskSkillName)?.subSkills || []).filter(Boolean).length
                    }
                  >
                    <InputLabel id="task-sub-skill-label-inline">Sub-skill</InputLabel>
                    <Select
                      labelId="task-sub-skill-label-inline"
                      label="Sub-skill"
                      value={taskSubSkillName}
                      onChange={(e) => setTaskSubSkillName(e.target.value)}
                    >
                      {(skills.find((s) => s.name === taskSkillName)?.subSkills || []).filter(Boolean).map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <TextField
                label="Task / Action Name"
                fullWidth
                margin="dense"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Required Level"
                  type="number"
                  value={taskRequiredLevel}
                  onChange={(e) => setTaskRequiredLevel(e.target.value)}
                />
                <TextField
                  label="XP Reward (at min level)"
                  type="number"
                  value={taskXpReward}
                  onChange={(e) => setTaskXpReward(e.target.value)}
                  helperText={taskScaleXpWithLevel ? 'Scales with level above minimum' : null}
                />
                <FormControlLabel
                  control={<Switch checked={taskScaleXpWithLevel} onChange={(e) => setTaskScaleXpWithLevel(e.target.checked)} />}
                  label="Scale XP with level"
                />
                <FormControlLabel
                  control={<Switch checked={taskGrantStars} onChange={(e) => setTaskGrantStars(e.target.checked)} />}
                  label="Grant stars"
                />
                {taskGrantStars && (
                  <TextField
                    label="Stars earned"
                    type="number"
                    value={taskStarAmount}
                    onChange={(e) => setTaskStarAmount(e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={{ width: 100 }}
                  />
                )}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {editingTaskId && (
                  <Typography variant="body2" color="primary">Editing task — change fields and click Update</Typography>
                )}
                <Button
                  variant="contained"
                  onClick={handleAddTask}
                  disabled={
                    !taskSkillName ||
                    !taskTitle ||
                    !taskXpReward ||
                    !!editingTaskId ||
                    (!(skills.find((s) => s.name === taskSkillName)?.subSkills || []).filter(Boolean).length ||
                      !(taskSubSkillName || '').trim())
                  }
                >
                  Add Task
                </Button>
                {editingTaskId && (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleUpdateTask}
                      disabled={
                        !taskSkillName ||
                        !taskTitle ||
                        !taskXpReward ||
                        (!(skills.find((s) => s.name === taskSkillName)?.subSkills || []).filter(Boolean).length ||
                          !(taskSubSkillName || '').trim())
                      }
                    >
                      Update Task
                    </Button>
                    <Button variant="outlined" onClick={handleCancelEditTask}>Cancel Edit</Button>
                  </>
                )}
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Existing Tasks</Typography>
                {!taskSkillName && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Select a skill and sub-skill above to see its tasks.
                  </Typography>
                )}
                {taskSkillName && (() => {
                  const selectedSkill = taskSkillName;
                  const selectedSub = (taskSubSkillName || '').trim() || null;
                  const filtered = tasks.filter((t) => {
                    if (t.skillName !== selectedSkill) return false;
                    const taskSub = t.subSkillName || null;
                    return taskSub === selectedSub;
                  });

                  if (filtered.length === 0) {
                    return (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        No tasks for this selection yet.
                      </Typography>
                    );
                  }

                  return filtered.map((t) => (
                    <Box key={t.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                        {t.title} — Level {t.requiredLevel}, +{t.xpReward} XP{t.scaleXpWithLevel ? ' (scales)' : ''}{t.starReward ? `, ★${t.starReward}` : ''}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditTask(t)}
                        disabled={!!editingTaskId && editingTaskId !== t.id}
                      >
                        Edit
                      </Button>
                    </Box>
                  ));
                })()}
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'board' && (
            <Box sx={{ ...STAR_REWARDS_GALAXY_SX, mt: 0, mb: 0, p: 2 }}>
              <Box sx={{ position: 'relative', zIndex: 1, color: '#ede7ff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon sx={{ color: '#ffc107', filter: 'drop-shadow(0 0 10px rgba(255,193,7,0.45))' }} />
                    <Typography variant="h6" sx={{ m: 0, fontWeight: 800, color: '#fff', textShadow: '0 0 20px rgba(186, 104, 255, 0.45)' }}>
                      Leaderboard
                    </Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Range</InputLabel>
                    <Select
                      label="Range"
                      value={skillsBoardPeriod}
                      onChange={(e) => setSkillsBoardPeriod(e.target.value)}
                      sx={{
                        color: '#fff',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(186, 104, 255, 0.45)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(233, 213, 255, 0.55)' },
                        '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.8)' },
                      }}
                    >
                      <MenuItem value="week">This Week</MenuItem>
                      <MenuItem value="month">This Month</MenuItem>
                      <MenuItem value="quarter">This Quarter</MenuItem>
                      <MenuItem value="year">This Year</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                  XP and level gains in the selected range (from the XP log).
                </Typography>
                <List dense disablePadding>
                  {skillBoardRows.map((r, idx) => (
                    <ListItem
                      key={r.name}
                      alignItems="flex-start"
                      sx={{
                        py: 1.25,
                        px: 1,
                        mb: 0.75,
                        borderRadius: 2,
                        border: '1px solid rgba(186, 104, 255, 0.28)',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        ...(r.fav && {
                          borderLeft: `4px solid ${r.fav}`,
                          boxShadow: `inset 0 0 0 1px ${r.fav}33`,
                        }),
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 56, mt: 0.25 }}>
                        <Avatar
                          src={r.iconUrl || undefined}
                          alt={r.name}
                          sx={{
                            width: 44,
                            height: 44,
                            border: r.fav ? `2px solid ${r.fav}` : '2px solid rgba(186, 104, 255, 0.45)',
                            fontWeight: 700,
                            bgcolor: 'rgba(255,255,255,0.12)',
                            color: '#fff',
                          }}
                        >
                          {r.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, columnGap: 1.5 }}>
                            <Typography component="span" variant="subtitle1" sx={{ fontWeight: 800, color: '#fff' }}>
                              {idx + 1}. {r.name}
                            </Typography>
                            <Typography component="span" variant="body2" sx={{ color: '#ffca28', fontWeight: 700 }}>
                              +{r.xp} XP
                            </Typography>
                            <Typography component="span" variant="body2" sx={{ color: '#ffe082', fontWeight: 700 }}>
                              +{r.starsEarned} ★
                            </Typography>
                            <Chip
                              size="small"
                              label={`+${r.levelsGained} levels`}
                              sx={{
                                height: 24,
                                fontWeight: 700,
                                color: '#ede7ff',
                                border: '1px solid rgba(186, 104, 255, 0.45)',
                                bgcolor: 'rgba(103, 58, 183, 0.35)',
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'activity' && (
            <Box sx={{ p: { xs: 1, sm: 2 } }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                <Typography variant="h6" sx={{ m: 0 }}>Activity</Typography>
                <Badge badgeContent={skillsActivityFilterCount} color="primary" overlap="rectangular" invisible={skillsActivityFilterCount === 0}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={(ev) => setSkillsActivityFilterAnchorEl(ev.currentTarget)}
                  >
                    Filters
                  </Button>
                </Badge>
              </Box>
              <Popover
                open={Boolean(skillsActivityFilterAnchorEl)}
                anchorEl={skillsActivityFilterAnchorEl}
                onClose={() => setSkillsActivityFilterAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: { p: 2, minWidth: 280, maxWidth: 'min(100vw - 24px, 400px)' },
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
                  Filter activity
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="skills-act-skill-lbl">Skill</InputLabel>
                    <Select
                      labelId="skills-act-skill-lbl"
                      label="Skill"
                      value={skillsActivitySkillFilter}
                      onChange={(e) => setSkillsActivitySkillFilter(e.target.value)}
                    >
                      <MenuItem value="__all__">All skills</MenuItem>
                      {skillsForActivityFilter.map((s) => (
                        <MenuItem key={s.name} value={s.name}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small" disabled={skillsActivitySkillFilter === '__all__' || skillsActivitySubOptions.length === 0}>
                    <InputLabel id="skills-act-sub-lbl">Sub-skill</InputLabel>
                    <Select
                      labelId="skills-act-sub-lbl"
                      label="Sub-skill"
                      value={skillsActivitySubFilter}
                      onChange={(e) => setSkillsActivitySubFilter(e.target.value)}
                    >
                      <MenuItem value="__all__">All sub-skills</MenuItem>
                      {skillsActivitySubOptions.map((sub) => (
                        <MenuItem key={sub} value={sub}>
                          {sub}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="From date"
                    type="date"
                    size="small"
                    fullWidth
                    value={skillsActivityDateFrom}
                    onChange={(e) => setSkillsActivityDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="To date"
                    type="date"
                    size="small"
                    fullWidth
                    value={skillsActivityDateTo}
                    onChange={(e) => setSkillsActivityDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setSkillsActivitySkillFilter('__all__');
                        setSkillsActivitySubFilter('__all__');
                        setSkillsActivityDateFrom('');
                        setSkillsActivityDateTo('');
                        setSkillsActivityPage(0);
                      }}
                    >
                      Clear all
                    </Button>
                    <Button size="small" variant="contained" onClick={() => setSkillsActivityFilterAnchorEl(null)}>
                      Done
                    </Button>
                  </Box>
                </Stack>
              </Popover>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                XP grants (newest first). Use player tabs above for who, and Filters for skill, sub-skill, or date range. Showing {skillsActivityPageSize} per page.
              </Typography>
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {skillsActivitySlice.length === 0 ? (
                  <ListItem disablePadding sx={{ display: 'block', overflow: 'visible' }}>
                    <Box sx={ACTIVITY_SCROLL_ITEM_SX}>
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <ListItemText
                          primary="No XP grants in this view."
                          secondary={
                            skillsPlayerFilter === 'all' || skillsPlayerFilter === 'manage'
                              ? 'Complete tasks or grant XP to see entries here, or widen your filters.'
                              : `No entries for ${players[Number(skillsPlayerFilter)]?.name || 'this player'} yet.`
                          }
                          primaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_PRIMARY_SX }}
                          secondaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_SECONDARY_SX }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ) : (
                  skillsActivitySlice.map((e, i) => (
                    <ListItem
                      key={`${e.at}-${e.playerName}-${e.skillName}-${e.amount}-${i}`}
                      disablePadding
                      sx={{ display: 'block', overflow: 'visible' }}
                    >
                      <Box sx={ACTIVITY_SCROLL_ITEM_SX}>
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <ListItemText
                            primary={`${e.playerName} · ${e.skillName}${e.subSkillName ? ` · ${e.subSkillName}` : ''}`}
                            secondary={`${new Date(e.at).toLocaleString()} · +${e.amount} XP${e.taskTitle ? ` · ${e.taskTitle}` : ''}`}
                            primaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_PRIMARY_SX }}
                            secondaryTypographyProps={{ variant: 'body2', sx: ACTIVITY_SCROLL_TEXT_SECONDARY_SX }}
                          />
                        </Box>
                      </Box>
                    </ListItem>
                  ))
                )}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Button size="small" disabled={skillsActivityPage <= 0} onClick={() => setSkillsActivityPage((p) => Math.max(0, p - 1))}>Previous</Button>
                <Typography variant="body2" color="text.secondary">
                  Page {skillsActivityPage + 1} of {skillsActivityPages}
                  {xpLogActivityFiltered.length > 0 ? ` · ${xpLogActivityFiltered.length} total` : ''}
                </Typography>
                <Button size="small" disabled={skillsActivityPage >= skillsActivityPages - 1} onClick={() => setSkillsActivityPage((p) => Math.min(skillsActivityPages - 1, p + 1))}>Next</Button>
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'achievements' && !displayedPlayer && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Select a player to view skill achievements.
              </Typography>
            </Box>
          )}
          {skillsLeftTab === 'achievements' && displayedPlayer && (
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(186, 104, 255, 0.45)',
                background: 'linear-gradient(155deg, #0a0618 0%, #12082a 40%, #1a0f38 100%)',
                boxShadow: '0 16px 48px rgba(48, 25, 92, 0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  background: 'linear-gradient(90deg, rgba(186, 104, 255, 0.22) 0%, rgba(103, 58, 183, 0.08) 55%, transparent 100%)',
                  borderBottom: '1px solid rgba(186, 104, 255, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(145deg, rgba(255, 193, 7, 0.25) 0%, rgba(186, 104, 255, 0.2) 100%)',
                      border: '1px solid rgba(255, 193, 7, 0.35)',
                      boxShadow: '0 0 24px rgba(255, 193, 7, 0.15)',
                    }}
                  >
                    <EmojiEventsIcon sx={{ fontSize: 28, color: '#ffc107', filter: 'drop-shadow(0 0 10px rgba(255,193,7,0.45))' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" sx={{ color: 'rgba(233, 213, 255, 0.75)', letterSpacing: 1.2, display: 'block', lineHeight: 1.2 }}>
                      Skill milestones
                    </Typography>
                    <Typography variant="h6" sx={{ m: 0, color: '#fff', fontWeight: 800, textShadow: '0 0 24px rgba(186, 104, 255, 0.5)' }}>
                      Achievements
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)' }}>
                      {displayedPlayer.name}
                      {skillAchDefs.length > 0
                        ? ` · ${skillAchUnlockedCount} / ${skillAchDefs.length} unlocked`
                        : ''}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    onClick={() => setSkillAchievementsListTab('unlocked')}
                    aria-pressed={skillAchievementsListTab === 'unlocked'}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      minWidth: 96,
                      ...(skillAchievementsListTab === 'unlocked'
                        ? {
                            bgcolor: '#2e7d32',
                            color: '#fff',
                            boxShadow: '0 0 16px rgba(76, 175, 80, 0.35)',
                            '&:hover': { bgcolor: '#1b5e20' },
                          }
                        : {
                            border: '1px solid rgba(129, 199, 132, 0.45)',
                            color: '#a5d6a7',
                            bgcolor: 'transparent',
                            '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.12)' },
                          }),
                    }}
                    variant={skillAchievementsListTab === 'unlocked' ? 'contained' : 'outlined'}
                  >
                    Unlocked
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSkillAchievementsListTab('locked')}
                    aria-pressed={skillAchievementsListTab === 'locked'}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      minWidth: 96,
                      ...(skillAchievementsListTab === 'locked'
                        ? {
                            bgcolor: '#c62828',
                            color: '#fff',
                            boxShadow: '0 0 16px rgba(239, 83, 80, 0.35)',
                            '&:hover': { bgcolor: '#b71c1c' },
                          }
                        : {
                            border: '1px solid rgba(239, 83, 80, 0.45)',
                            color: '#ef9a9a',
                            bgcolor: 'transparent',
                            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.12)' },
                          }),
                    }}
                    variant={skillAchievementsListTab === 'locked' ? 'contained' : 'outlined'}
                  >
                    Locked
                  </Button>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setSkillAchievementsExpanded((v) => !v)}
                  aria-expanded={skillAchievementsExpanded}
                  aria-label={skillAchievementsExpanded ? 'Collapse Skill Achievements' : 'Expand Skill Achievements'}
                  sx={{ color: 'rgba(255,255,255,0.85)' }}
                >
                  {skillAchievementsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Box sx={{ p: 2, pt: skillAchievementsExpanded ? 2 : 1.5 }}>
                {!skillAchievementsExpanded && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                    {skillAchDefs.length === 0
                      ? (role === 'Life Master'
                        ? 'No Skill Achievements yet. Use Manage achievements (above the player tabs).'
                        : 'No Skill Achievements yet.')
                      : `${skillAchDefs.length} achievement${skillAchDefs.length === 1 ? '' : 's'} · ${skillAchUnlockedCount} unlocked — expand to see details.`}
                  </Typography>
                )}
                {skillAchievementsExpanded && skillAchDefs.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                    {role === 'Life Master'
                      ? 'No Skill Achievements yet. Use Manage achievements (above the player tabs).'
                      : 'No Skill Achievements yet.'}
                  </Typography>
                )}
                {skillAchievementsExpanded && skillAchDefs.length > 0 && skillAchievementsFiltered.length === 0 && (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                    {skillAchievementsListTab === 'unlocked'
                      ? 'No unlocked achievements yet. Keep earning task completions!'
                      : 'No locked achievements — everything is unlocked!'}
                  </Typography>
                )}
                {skillAchievementsExpanded && skillAchDefs.length > 0 && skillAchievementsFiltered.length > 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 1.5,
                    }}
                  >
                    {skillAchievementsFiltered.map((def) => {
                      const count = countTaskCompletionsForPlayer(xpGrantLog, displayedPlayer.name, def.taskId);
                      const thr = Math.max(1, Number(def.threshold) || 1);
                      const unlocked = count >= thr;
                      const pct = Math.min(100, Math.round((count / thr) * 100));
                      const task = tasks.find((t) => t.id === def.taskId);
                      const taskLabel = task ? task.title : (def.taskId ? 'Unknown task' : '—');
                      return (
                        <Paper
                          key={def.id}
                          elevation={unlocked ? 6 : 0}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: unlocked
                              ? 'linear-gradient(160deg, rgba(46, 125, 50, 0.35) 0%, rgba(26, 15, 48, 0.92) 100%)'
                              : 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(10, 8, 20, 0.95) 100%)',
                            border: unlocked ? '1px solid rgba(129, 199, 132, 0.55)' : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: unlocked ? '0 0 32px rgba(76, 175, 80, 0.12)' : 'none',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            <Box
                              sx={{
                                mt: 0.25,
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                bgcolor: unlocked ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255,255,255,0.06)',
                                border: `2px solid ${unlocked ? 'rgba(255, 193, 7, 0.65)' : 'rgba(255,255,255,0.12)'}`,
                              }}
                            >
                              {unlocked ? (
                                <EmojiEventsIcon sx={{ color: '#ffc107', fontSize: 22 }} />
                              ) : (
                                <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 20 }} />
                              )}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>
                                {def.name}
                              </Typography>
                              {def.unlockMessage ? (
                                <Typography variant="body2" sx={{ mt: 0.5, color: 'rgba(233, 213, 255, 0.85)' }}>
                                  {def.unlockMessage}
                                </Typography>
                              ) : null}
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'rgba(255,255,255,0.5)' }}>
                                Task: {taskLabel}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={unlocked ? 100 : pct}
                                sx={{
                                  mt: 1,
                                  height: 8,
                                  borderRadius: 2,
                                  bgcolor: 'rgba(255,255,255,0.08)',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    background: unlocked
                                      ? 'linear-gradient(90deg, #66bb6a, #43a047)'
                                      : 'linear-gradient(90deg, rgba(186, 104, 255, 0.9), rgba(103, 58, 183, 0.85))',
                                  },
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                                  {unlocked ? 'Completed' : `${count} / ${thr} toward unlock`}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={unlocked ? 'Unlocked' : `${pct}%`}
                                  sx={{
                                    fontWeight: 700,
                                    ...(unlocked
                                      ? { bgcolor: 'rgba(76, 175, 80, 0.35)', color: '#e8f5e9', border: '1px solid rgba(129, 199, 132, 0.6)' }
                                      : { bgcolor: 'rgba(186, 104, 255, 0.2)', color: '#ede7ff', border: '1px solid rgba(186, 104, 255, 0.35)' }),
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'rewards' && role === 'Life Master' && skillsPlayerFilter === 'manage' && (
            <Box sx={{ ...STAR_REWARDS_GALAXY_SX, mt: 0 }}>
              <Box sx={{ position: 'relative', zIndex: 1, color: '#ede7ff', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarIcon sx={{ color: '#ffc107', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.45))' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', textShadow: '0 0 16px rgba(186, 104, 255, 0.45)' }}>
                    Manage Star Rewards
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.78)' }}>
                  Use <strong>Edit Reward</strong> (above the player tabs) to add or edit rewards, including who can see each one.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    setStarRewardMgmtDialogOpen(true);
                    setStarRewardMgmtDraft(null);
                  }}
                >
                  Open reward manager
                </Button>
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'rewards' && skillsPlayerFilter !== 'manage' && !displayedPlayer && (
            <Box sx={{ ...STAR_REWARDS_GALAXY_SX, mt: 0 }}>
              <Box sx={{ position: 'relative', zIndex: 1, color: '#ede7ff', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarIcon sx={{ color: '#ffc107', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.45))' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', textShadow: '0 0 16px rgba(186, 104, 255, 0.45)' }}>
                    Rewards Store
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.78)' }}>
                  Select a player to see star balance and redeem rewards.
                </Typography>
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'rewards' && skillsPlayerFilter !== 'manage' && displayedPlayer && starData && (
            <Box sx={{ ...STAR_REWARDS_GALAXY_SX, mt: 0 }}>
              <Box sx={{ position: 'relative', zIndex: 1, color: '#ede7ff', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarIcon sx={{ color: '#ffc107', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.45))' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', textShadow: '0 0 16px rgba(186, 104, 255, 0.45)' }}>
                    Rewards Store
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mb: 1, color: 'rgba(255,255,255,0.75)' }}>
                  {displayedPlayer.name}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.35, color: '#ffffff' }}>
                  Current: {starData.current ?? 0}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.125, lineHeight: 1.35, color: 'rgba(255,255,255,0.78)' }}>
                  Total Earned: {starData.totalEarned ?? 0}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mb: 1, lineHeight: 1.35 }}>
                  Pending (not in jar): {starData.pending ?? 0}
                </Typography>
                {displayedPlayer.userType !== 'Adult' && (
                  <Typography variant="caption" sx={{ display: 'block', mb: 1.5, color: 'rgba(255,255,255,0.65)' }}>
                    Redeeming takes stars from your jar right away. A parent must approve the reward; if they deny it, your stars are returned.
                  </Typography>
                )}
                {starRewards.length === 0 ? (
                  <Box
                    sx={{
                      ...PENDING_STARS_ZONE_GALAXY_SX,
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      minHeight: 100,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
                      No rewards in the store yet.
                    </Typography>
                  </Box>
                ) : starRewardsForPlayer.length === 0 ? (
                  <Box
                    sx={{
                      ...PENDING_STARS_ZONE_GALAXY_SX,
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      minHeight: 100,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', fontWeight: 600 }}>
                      No rewards are available for this player in the store.
                    </Typography>
                  </Box>
                ) : (
                  <List dense disablePadding>
                    {starRewardsForPlayer.map((r) => (
                      <ListItem
                        key={r.id}
                        sx={{
                          flexWrap: 'wrap',
                          gap: 1,
                          alignItems: 'center',
                          py: 1.25,
                          borderBottom: 1,
                          borderColor: 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <ListItemText
                          primary={r.name}
                          secondary={r.description || null}
                          primaryTypographyProps={{ variant: 'body2', sx: { color: '#fff', fontWeight: 600 } }}
                          secondaryTypographyProps={{ variant: 'caption', sx: { color: 'rgba(255,255,255,0.65)' } }}
                        />
                        <Typography variant="body2" sx={{ color: '#ffca28', fontWeight: 700 }}>★{r.cost}</Typography>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={(starData.current || 0) < (r.cost || 0)}
                          onClick={() => handleRequestStarReward(r.id)}
                          sx={{
                            borderColor: 'rgba(255, 255, 255, 0.35)',
                            background: 'linear-gradient(180deg, rgba(186, 104, 255, 0.95) 0%, rgba(103, 58, 183, 0.92) 100%)',
                            '&:hover': {
                              background: 'linear-gradient(180deg, rgba(206, 124, 255, 0.98) 0%, rgba(123, 78, 203, 0.95) 100%)',
                            },
                          }}
                        >
                          Redeem
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'redeemedRewards' && (
            <Box sx={{ ...CHORE_REWARDS_GOLD_SX, mt: 0 }}>
              <Box sx={{ position: 'relative', zIndex: 1, color: '#2a1f00', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccountBalanceWalletIcon sx={{ color: '#a67c00', filter: 'drop-shadow(0 0 6px rgba(255,180,0,0.4))' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1a1200' }}>
                    Rewards
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(0,0,0,0.65)' }}>
                  Screen time and your redemption history from the Rewards Store (newest first). Showing {REDEEMED_REWARDS_PAGE_SIZE} per page.
                </Typography>
                {!displayedPlayer ? (
                  <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)' }}>
                    Select a player (tabs above) to see screen time and redemption history.
                  </Typography>
                ) : (
                  <>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'rgba(0,0,0,0.6)' }}>
                      {displayedPlayer.name}
                    </Typography>
                    <ScreenTimeRewardsPanel
                      key={displayedPlayer.name}
                      playerName={displayedPlayer.name}
                      favouriteColor={displayedPlayer.favouriteColor}
                      screenTimeByPlayer={screenTimeByPlayer}
                      screenTimeTick={screenTimeTick}
                      onStart={(m) => handleStartScreenTime(displayedPlayer.name, m)}
                      onPause={() => handlePauseScreenTime(displayedPlayer.name)}
                      onResume={() => handleResumeScreenTime(displayedPlayer.name)}
                    />
                    {rewardRedemptionsForPlayerSkills.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.65)' }}>
                        No redeemed rewards yet for {displayedPlayer.name}.
                      </Typography>
                    ) : (
                      <>
                        <List dense disablePadding>
                          {redeemedRewardsSliceSkills.map((e) => (
                            <ListItem
                              key={e.id}
                              sx={{
                                flexWrap: 'wrap',
                                gap: 1,
                                alignItems: 'center',
                                py: 1.25,
                                borderBottom: 1,
                                borderColor: 'rgba(0,0,0,0.1)',
                              }}
                            >
                              <Box
                                component="img"
                                src={COIN_PNG_SRC}
                                alt=""
                                sx={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }}
                              />
                              <ListItemText
                                primary={e.rewardName}
                                secondary={[
                                  `${new Date(e.at).toLocaleString()} · ${e.cost} coins`,
                                  Number(e.screenTimeMinutes) > 0 ? `+${e.screenTimeMinutes} min screen time` : null,
                                  e.refunded && Number(e.screenTimeMinutes) > 0 ? 'Screen time refunded' : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                                primaryTypographyProps={{ variant: 'body2', sx: { color: '#1a1200', fontWeight: 600 } }}
                                secondaryTypographyProps={{ variant: 'caption', sx: { color: 'rgba(0,0,0,0.6)' } }}
                              />
                              {role === 'Life Master' && Number(e.screenTimeMinutes) > 0 && !e.refunded && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleRefundScreenTimeRedemption(e.id)}
                                >
                                  Refund screen time
                                </Button>
                              )}
                            </ListItem>
                          ))}
                        </List>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Button
                            size="small"
                            disabled={safeRedeemedPageSkills <= 0}
                            onClick={() => setRedeemedRewardsPage((p) => Math.max(0, p - 1))}
                          >
                            Previous
                          </Button>
                          <Typography variant="body2" color="text.secondary">
                            Page {safeRedeemedPageSkills + 1} of {redeemedRewardsPagesSkills}
                            {rewardRedemptionsForPlayerSkills.length > 0 ? ` · ${rewardRedemptionsForPlayerSkills.length} total` : ''}
                          </Typography>
                          <Button
                            size="small"
                            disabled={safeRedeemedPageSkills >= redeemedRewardsPagesSkills - 1}
                            onClick={() => setRedeemedRewardsPage((p) => Math.min(redeemedRewardsPagesSkills - 1, p + 1))}
                          >
                            Next
                          </Button>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </Box>
            </Box>
          )}
          {skillsLeftTab === 'rewardRequests' && showRewardRequestsTab && (
            <Box sx={{ ...STAR_REWARDS_GALAXY_SX, mt: 0 }}>
              <Box sx={{ position: 'relative', zIndex: 1, color: '#ede7ff', p: 2, ...SHARED_REWARD_PANEL_STACK_SX }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <StarIcon sx={{ color: '#ffc107', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.45))' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#fff', textShadow: '0 0 16px rgba(186, 104, 255, 0.45)' }}>
                    Reward Requests
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.78)' }}>
                  Kids spend stars when they tap Redeem; approve to confirm the reward or deny to return their stars.
                </Typography>
                {starRewardRequests.filter((r) => r.status === 'pending').length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>No pending star reward requests.</Typography>
                ) : (
                  <List dense disablePadding>
                    {starRewardRequests.filter((r) => r.status === 'pending').map((r) => (
                      <ListItem key={r.id} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center', borderBottom: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                        <ListItemText
                          primary={`${r.playerName} — ${r.rewardName}`}
                          secondary={`★${r.cost}`}
                          primaryTypographyProps={{ variant: 'body2', sx: { color: '#fff' } }}
                          secondaryTypographyProps={{ variant: 'caption', sx: { color: 'rgba(255,255,255,0.65)' } }}
                        />
                        {canApproveRewardRequests && (
                          <>
                            <Button size="small" variant="contained" onClick={() => handleResolveStarRewardRequest(r.id, true)}>Approve</Button>
                            <Button size="small" color="error" variant="outlined" onClick={() => handleResolveStarRewardRequest(r.id, false)}>Deny</Button>
                          </>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
                {!canApproveRewardRequests && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'rgba(255,255,255,0.65)' }}>
                    Only adults can approve or deny requests.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
            </Box>
          </Box>
          );
        })()}

        {role === 'Overview' && (
          <>
            {overviewTabIndex === 0 && (
              <Box
                sx={{
                  mt: 0,
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  gap: 2,
                  alignItems: 'stretch',
                  width: '100%',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  pb: 1,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {players.map((player) => {
                  const overviewStarData = starsByPlayer[player.name] || { pending: 0, current: 0, totalEarned: 0 };
                  const overviewCoins = coinsByPlayer[player.name] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 };
                  return (
                    <Box
                      key={player.name}
                      sx={{
                        p: 1.5,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: '0 0 auto',
                        width: { xs: 'min(100%, 380px)', sm: 380 },
                        minWidth: { xs: 'min(100%, 380px)', sm: 360 },
                        maxWidth: 400,
                        boxSizing: 'border-box',
                      }}
                    >
                      <Avatar src={player.iconUrl || undefined} alt={player.name} sx={{ width: 48, height: 48, mb: 1 }}>
                        {player.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2">{player.name}</Typography>
                      <OverviewStarAndCoinJarsPanel
                        playerName={player.name}
                        starData={overviewStarData}
                        playerCoins={overviewCoins}
                        onRedeemCoin={handleRedeemCoinToJar}
                        onRedeemStar={handleRedeemStarToJar}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}

            {overviewTabIndex >= 1 && players[overviewTabIndex - 1] && (() => {
              const player = players[overviewTabIndex - 1];
              const overviewStarData = starsByPlayer[player.name] || { pending: 0, current: 0, totalEarned: 0 };
              return (
              <Card sx={{ marginTop: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar src={player.iconUrl || undefined} alt={player.name} sx={{ mr: 2 }}>
                      {player.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle1">{player.name}</Typography>
                  </Box>
                  <Box sx={{ mb: 2, width: '100%', maxWidth: 520 }}>
                    <OverviewStarAndCoinJarsPanel
                      playerName={player.name}
                      starData={overviewStarData}
                      playerCoins={coinsByPlayer[player.name] || { pending: 0, coins: 0, pendingSpent: 0, totalEarned: 0 }}
                      onRedeemCoin={handleRedeemCoinToJar}
                      onRedeemStar={handleRedeemStarToJar}
                    />
                  </Box>
                  {filterMergedSkillsForPlayer(mergedSkillDefsForXp, player.name).map((skill) => {
                    const subSkills = skill.subSkills || [];
                    const hasSub = subSkills.length > 0;
                    if (hasSub) {
                      return (
                        <Box key={skill.name} sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {(() => {
                              const SkillIcon = getSkillIconConfig(skill.name, null);
                              return SkillIcon ? <SkillIcon fontSize="small" /> : null;
                            })()}
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {skill.name}
                            </Typography>
                          </Box>
                          {subSkills.map((s) => {
                            const { actual, pending } = getEntriesForSubSkill(
                              player.name,
                              skill.name,
                              s
                            );
                            const levelInfo = getLevelInfo(actual);
                            return (
                              <Box
                                key={s}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  ml: 2,
                                  mt: 0.25,
                                  gap: 1,
                                  minWidth: 0,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <Box sx={{ ...XP_PROGRESS_CONTAINER_SX, flex: '1 1 0', minWidth: 0, maxWidth: 'none' }}>
                                  {(() => {
                                    const SubIcon = getSkillIconConfig(skill.name, s);
                                    return SubIcon ? <SubIcon fontSize="small" /> : null;
                                  })()}
                                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{s} — Lvl {levelInfo.level}</Typography>
                                  <LinearProgress variant="determinate" value={levelInfo.progress * 100} sx={XP_PROGRESS_BAR_SX} />
                                  <Typography variant="caption" color="text.secondary" noWrap>
                                    {levelInfo.xpToNextLevel > 0 ? `${levelInfo.xpToNextLevel} to next` : 'Max'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, minWidth: 140 }}>
                                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                                    XP: {actual} | Pending: {pending}
                                  </Typography>
                                  <Tooltip title={getDocContent(skill.name, s) ? 'Open documentation' : 'Documentation'}>
                                    <IconButton
                                      size="small"
                                      aria-label="Documentation"
                                      onClick={(e) => handleDocClick(e, skill.name, s)}
                                    >
                                      <MenuBookIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="XP grant log for this skill">
                                    <IconButton
                                      size="small"
                                      aria-label="XP log"
                                      onClick={() => {
                                        setXpLogFilter({ playerName: player.name, skillName: skill.name, subSkillName: s });
                                        setXpLogDialogOpen(true);
                                      }}
                                    >
                                      <ViewListIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Available tasks for this skill">
                                    <IconButton
                                      size="small"
                                      aria-label="Tasks"
                                      onClick={() => {
                                        setTasksModalContext({ playerName: player.name, skillName: skill.name, subSkillName: s });
                                        setTasksModalOpen(true);
                                      }}
                                    >
                                      <TaskAltIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Skill Tree">
                                    <IconButton
                                      size="small"
                                      aria-label="Skill Tree"
                                      onClick={() => {
                                        setSkillTreeModalContext({ playerName: player.name, skillName: skill.name });
                                        setSkillTreeModalOpen(true);
                                      }}
                                    >
                                      <ArrowUpwardIcon fontSize="small" sx={{ color: 'white' }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      );
                    }

                    return (
                      <Box key={skill.name} sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {skill.name}: add at least one sub-skill in Settings to track XP.
                        </Typography>
                      </Box>
                    );
                  })}
                </CardContent>
              </Card>
              );
            })()}
          </>
        )}

        {role === 'Weekly Review' && (() => {
          const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
          const weekStart = Date.now() - WEEK_MS;
          const selectedPlayer = weeklyReviewTabIndex >= 1 ? players[weeklyReviewTabIndex - 1] : null;
          const thisWeekAll = xpGrantLog.filter((e) => new Date(e.at).getTime() >= weekStart);
          const thisWeek = selectedPlayer
            ? thisWeekAll.filter((e) => e.playerName === selectedPlayer.name)
            : thisWeekAll;
          const totalXpThisWeek = thisWeek.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          const totalStarsThisWeek = thisWeek.reduce((sum, e) => sum + (Number(e.starReward) || 0), 0);
          const xpByPlayer = {};
          thisWeek.forEach((e) => {
            const name = e.playerName || 'Unknown';
            if (!xpByPlayer[name]) xpByPlayer[name] = 0;
            xpByPlayer[name] += Number(e.amount) || 0;
          });
          const taskCounts = {};
          const taskPlayerCounts = {};
          thisWeek.forEach((e) => {
            const key = e.taskTitle || e.taskId || '(no task)';
            if (!taskCounts[key]) taskCounts[key] = 0;
            taskCounts[key] += 1;
            if (key === '(no task)') return;
            const pname = e.playerName || 'Unknown';
            if (!taskPlayerCounts[key]) taskPlayerCounts[key] = {};
            if (!taskPlayerCounts[key][pname]) taskPlayerCounts[key][pname] = 0;
            taskPlayerCounts[key][pname] += 1;
          });
          const taskList = Object.entries(taskCounts)
            .filter(([title]) => title !== '(no task)')
            .sort((a, b) => b[1] - a[1]);

          const choreWeekAll = choreActivity.filter((a) => a && new Date(a.at).getTime() >= weekStart);
          const choreWeek = selectedPlayer
            ? choreWeekAll.filter((a) => a.playerName === selectedPlayer.name)
            : choreWeekAll;
          const choresCompletedThisWeek = choreWeek.length;
          const coinsEarnedThisWeek = choreWeek.reduce((sum, a) => sum + (Number(a.coins) || 0), 0);

          return (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, mt: 0 }}>
                <Card
                  sx={{
                    minWidth: 160,
                    flex: '1 1 140px',
                    maxWidth: 220,
                    background: 'linear-gradient(145deg, #0d2818 0%, #1b4332 38%, #2d6a4f 72%, #40916c 100%)',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(27, 67, 50, 0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
                  }}
                >
                  <CardContent>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>
                      XP Earned This Week (Skills)
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>
                      {totalXpThisWeek}
                    </Typography>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    minWidth: 160,
                    flex: '1 1 140px',
                    maxWidth: 220,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(186, 104, 255, 0.45)',
                    background: 'linear-gradient(165deg, #060214 0%, #12082a 22%, #1e1048 48%, #0d0630 78%, #050210 100%)',
                    boxShadow:
                      'inset 0 0 80px rgba(75, 0, 130, 0.35), 0 8px 28px rgba(48, 25, 92, 0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                    '&::before': STAR_REWARDS_GALAXY_SX['&::before'],
                    '&::after': STAR_REWARDS_GALAXY_SX['&::after'],
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>
                      Stars Earned This Week
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>
                      {totalStarsThisWeek}
                    </Typography>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    minWidth: 160,
                    flex: '1 1 140px',
                    maxWidth: 220,
                    background: 'linear-gradient(145deg, #0a1929 0%, #0d47a1 42%, #1565c0 78%, #1976d2 100%)',
                    color: '#fff',
                    boxShadow: '0 6px 22px rgba(13, 71, 161, 0.42), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <CardContent>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.88)', fontWeight: 700 }}>
                      Chores Completed This Week
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800 }}>
                      {choresCompletedThisWeek}
                    </Typography>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    minWidth: 160,
                    flex: '1 1 140px',
                    maxWidth: 220,
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(180, 130, 0, 0.45)',
                    background: 'linear-gradient(155deg, #fffdf5 0%, #fff3c4 18%, #ffe082 45%, #ffc107 72%, #c79100 100%)',
                    boxShadow: 'inset 0 0 72px rgba(212, 168, 40, 0.22), 0 8px 24px rgba(166, 115, 0, 0.28)',
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="overline" sx={{ color: 'rgba(60, 40, 0, 0.85)', fontWeight: 700 }}>
                      Coins Earned This Week
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1a1200', fontWeight: 800 }}>
                      {coinsEarnedThisWeek}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              {!selectedPlayer && (
                <>
                  <Typography variant="h6" sx={{ mb: 1 }}>XP by Player</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    {Object.entries(xpByPlayer).length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No XP granted this week.</Typography>
                    ) : (
                      Object.entries(xpByPlayer)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, xp]) => {
                          const p = players.find((pl) => pl.name === name);
                          const raw = p?.favouriteColor && String(p.favouriteColor).trim();
                          const fav =
                            raw && /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw : null;
                          const fg = fav ? contrastingTextOnHex6(fav) : undefined;
                          return (
                            <Card
                              key={name}
                              variant={fav ? 'elevation' : 'outlined'}
                              sx={{
                                minWidth: 140,
                                bgcolor: fav || 'background.paper',
                                color: fav ? fg : undefined,
                                borderColor: fav ? 'transparent' : 'divider',
                              }}
                            >
                              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Typography variant="subtitle2">{name}</Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color: fav ? fg : 'primary.main',
                                  }}
                                >
                                  +{xp} XP
                                </Typography>
                              </CardContent>
                            </Card>
                          );
                        })
                    )}
                  </Box>
                </>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <EmojiEventsIcon sx={{ color: 'warning.main', filter: 'drop-shadow(0 0 8px rgba(255,193,7,0.35))' }} />
                <Typography variant="h6" sx={{ m: 0 }}>Tasks Completed This Week</Typography>
              </Box>
              {taskList.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No task completions recorded this week.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {taskList.map(([title, count], idx) => {
                    const perPlayer = Object.entries(taskPlayerCounts[title] || {}).sort((a, b) => b[1] - a[1]);
                    return (
                      <Box
                        key={title}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'stretch', sm: 'flex-start' },
                          justifyContent: 'space-between',
                          gap: 1.5,
                          py: 1.25,
                          px: 1.5,
                          borderRadius: 2,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 1.25, minWidth: 0, flex: '1 1 auto' }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              color: 'primary.main',
                              flexShrink: 0,
                              minWidth: '2.5rem',
                              pt: 0.125,
                            }}
                          >
                            # {idx + 1}
                          </Typography>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                              {title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {count} total completion{count !== 1 ? 's' : ''} this week
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                            alignItems: 'center',
                            flex: { sm: '0 1 auto' },
                          }}
                        >
                          {perPlayer.map(([playerName, n]) => {
                            const pl = players.find((p) => p.name === playerName);
                            const raw = pl?.favouriteColor && String(pl.favouriteColor).trim();
                            const fav = raw && /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw : null;
                            const fg = fav ? contrastingTextOnHex6(fav) : undefined;
                            return (
                              <Box
                                key={playerName}
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1.5,
                                  border: 1,
                                  borderColor: fav ? `${fav}88` : 'divider',
                                  bgcolor: fav || 'background.paper',
                                  color: fav ? fg : 'text.primary',
                                  boxShadow: fav ? `inset 0 0 0 1px ${fav}44` : undefined,
                                }}
                              >
                                <Avatar
                                  src={pl?.iconUrl || undefined}
                                  alt={playerName}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: '0.9rem',
                                    border: fav ? `2px solid ${fav}` : '1px solid',
                                    borderColor: fav ? fav : 'divider',
                                  }}
                                >
                                  {playerName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                                  x {n}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </>
          );
        })()}

        <Dialog
          open={manageChoresDialogOpen}
          onClose={() => {
            setManageChoresDialogOpen(false);
            setEditingChoreId(null);
            setNewChoreSubSkill('');
            setManageChoreSkillEditIdx(null);
            setManageChoreSkillEditName('');
            setManageChoreSkillEditSubs('');
          }}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Manage Chores</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Pick a room for each chore (or edit an existing one below). Bedroom chores belong to one player; other rooms are shared. Set today&apos;s quest with the heart next to a chore on the Chores screen while viewing as that player.
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Chore skill definitions
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              XP is awarded only on sub-skills. Edit the skill name and comma-separated sub-skills (required).
            </Typography>
            {choreSkills.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No chore skills yet. Add one under Chores → Chore Skills, then return here to edit sub-skills.
              </Typography>
            ) : (
              <List dense sx={{ mb: 2 }}>
                {choreSkills.map((cs, idx) => (
                  <ListItem
                    key={`manage-chore-skill-${idx}`}
                    alignItems="flex-start"
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 1,
                      py: 1.5,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    {manageChoreSkillEditIdx === idx ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-end' }}>
                        <TextField
                          size="small"
                          label="Skill name"
                          value={manageChoreSkillEditName}
                          onChange={(e) => setManageChoreSkillEditName(e.target.value)}
                          sx={{ minWidth: 160 }}
                        />
                        <TextField
                          size="small"
                          label="Sub-skills (comma-separated)"
                          value={manageChoreSkillEditSubs}
                          onChange={(e) => setManageChoreSkillEditSubs(e.target.value)}
                          sx={{ flex: '1 1 220px', minWidth: 200 }}
                        />
                        <Button size="small" variant="contained" onClick={handleSaveManageChoreSkillEdit}>
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setManageChoreSkillEditIdx(null);
                            setManageChoreSkillEditName('');
                            setManageChoreSkillEditSubs('');
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <ListItemText
                          primary={cs.name}
                          secondary={
                            (cs.subSkills || []).length > 0
                              ? `Sub-skills: ${(cs.subSkills || []).join(', ')}`
                              : 'No sub-skills — add at least one'
                          }
                        />
                        <IconButton
                          size="small"
                          aria-label={`Edit ${cs.name}`}
                          onClick={() => {
                            setManageChoreSkillEditIdx(idx);
                            setManageChoreSkillEditName(cs.name);
                            setManageChoreSkillEditSubs((cs.subSkills || []).join(', '));
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
            {editingChoreId ? (
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1.5 }}>
                Editing an existing chore — update fields and click Save changes, or Cancel edit.
              </Typography>
            ) : null}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, alignItems: 'flex-end' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="new-chore-room-label">Room</InputLabel>
                <Select
                  labelId="new-chore-room-label"
                  label="Room"
                  value={newChoreRoom}
                  onChange={(e) => setNewChoreRoom(e.target.value)}
                >
                  {CHORE_ROOMS.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {newChoreRoom === BEDROOM_ROOM && (
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="bedroom-for-label">Bedroom for</InputLabel>
                  <Select
                    labelId="bedroom-for-label"
                    label="Bedroom for"
                    value={newChoreBedroomOwner || players[0]?.name || ''}
                    onChange={(e) => setNewChoreBedroomOwner(e.target.value)}
                    disabled={players.length === 0}
                  >
                    {players.map((p) => (
                      <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField size="small" label="Chore Title" value={newChoreTitle} onChange={(e) => setNewChoreTitle(e.target.value)} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Period</InputLabel>
                <Select label="Period" value={newChoreSchedule} onChange={(e) => setNewChoreSchedule(e.target.value)}>
                  {CHORE_PERIODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField size="small" label="Effort (1-5)" type="number" inputProps={{ min: 1, max: 5 }} value={newChoreEffortStars} onChange={(e) => setNewChoreEffortStars(e.target.value)} sx={{ width: 120 }} />
              <FormControl size="small" sx={{ minWidth: 180 }} required>
                <InputLabel id="new-chore-skill-label">Chore Skill</InputLabel>
                <Select
                  labelId="new-chore-skill-label"
                  label="Chore Skill"
                  value={newChoreSkill && choreSkillDropdownNames.includes(newChoreSkill) ? newChoreSkill : ''}
                  onChange={(e) => setNewChoreSkill(e.target.value)}
                  disabled={choreSkillDropdownNames.length === 0}
                >
                  {choreSkillDropdownNames.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {newChoreSubSkillOptions.length > 0 ? (
                <FormControl size="small" sx={{ minWidth: 180 }} required>
                  <InputLabel id="new-chore-subskill-label">Sub-skill</InputLabel>
                  <Select
                    labelId="new-chore-subskill-label"
                    label="Sub-skill"
                    value={newChoreSubSkill && newChoreSubSkillOptions.includes(newChoreSubSkill) ? newChoreSubSkill : newChoreSubSkillOptions[0] || ''}
                    onChange={(e) => setNewChoreSubSkill(e.target.value)}
                  >
                    {newChoreSubSkillOptions.map((sub) => (
                      <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', minWidth: 160 }}>
                XP from effort:{' '}
                <strong>{choreXpFromEffortStars(Number(newChoreEffortStars) || 1)}</strong>
                {newChoreScaleXpWithLevel ? ' (at min level, scales)' : newChoreSubSkillOptions.length > 0 ? ' → sub-skill' : ''}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={newChoreScaleXpWithLevel}
                    onChange={(e) => setNewChoreScaleXpWithLevel(e.target.checked)}
                    size="small"
                  />
                }
                label="Scale XP with level"
                sx={{ ml: 0, mr: 0 }}
              />
              {newChoreScaleXpWithLevel && (
                <TextField
                  size="small"
                  label="Min level"
                  type="number"
                  value={newChoreRequiredLevel}
                  onChange={(e) => setNewChoreRequiredLevel(e.target.value)}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                />
              )}
              <Button
                variant="contained"
                onClick={() => {
                  const title = newChoreTitle.trim();
                  if (!title) return;
                  if (newChoreRoom === BEDROOM_ROOM && players.length === 0) return;
                  const skillPick = (newChoreSkill || '').trim();
                  if (!skillPick || choreSkillDropdownNames.length === 0) return;
                  if (newChoreSubSkillOptions.length > 0 && !(newChoreSubSkill || '').trim()) return;
                  const bedroomOwner =
                    newChoreRoom === BEDROOM_ROOM
                      ? (newChoreBedroomOwner.trim() || players[0]?.name || '').trim()
                      : undefined;
                  if (newChoreRoom === BEDROOM_ROOM && !bedroomOwner) return;
                  const xpVal = choreXpFromEffortStars(Number(newChoreEffortStars) || 1);
                  const minLvl = Math.max(1, parseInt(newChoreRequiredLevel, 10) || 1);

                  if (editingChoreId) {
                    setChores((prev) =>
                      prev.map((c) => {
                        if (c.id !== editingChoreId) return c;
                        const next = {
                          ...c,
                          title,
                          room: newChoreRoom,
                          schedule: newChoreSchedule,
                          effortStars: Math.min(5, Math.max(1, Number(newChoreEffortStars) || 1)),
                          skillName: skillPick,
                          xpReward: xpVal,
                        };
                        if (newChoreRoom === BEDROOM_ROOM && bedroomOwner) {
                          next.bedroomOwner = bedroomOwner;
                        } else {
                          delete next.bedroomOwner;
                        }
                        if (xpVal > 0 && newChoreScaleXpWithLevel) {
                          next.scaleXpWithLevel = true;
                          next.requiredLevel = minLvl;
                        } else {
                          delete next.scaleXpWithLevel;
                          delete next.requiredLevel;
                        }
                        if (newChoreSubSkillOptions.length > 0 && (newChoreSubSkill || '').trim()) {
                          next.subSkillName = newChoreSubSkill.trim();
                        } else {
                          delete next.subSkillName;
                        }
                        return next;
                      }),
                    );
                    setEditingChoreId(null);
                  } else {
                    setChores((prev) => [
                      ...prev,
                      {
                        id: `chore_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                        title,
                        room: newChoreRoom,
                        schedule: newChoreSchedule,
                        effortStars: Math.min(5, Math.max(1, Number(newChoreEffortStars) || 1)),
                        skillName: skillPick,
                        xpReward: xpVal,
                        ...(xpVal > 0 && newChoreScaleXpWithLevel
                          ? { scaleXpWithLevel: true, requiredLevel: minLvl }
                          : {}),
                        ...(newChoreRoom === BEDROOM_ROOM && bedroomOwner ? { bedroomOwner } : {}),
                        ...(newChoreSubSkillOptions.length > 0 && (newChoreSubSkill || '').trim()
                          ? { subSkillName: newChoreSubSkill.trim() }
                          : {}),
                      },
                    ]);
                  }
                  setNewChoreTitle('');
                  setNewChoreSchedule('daily');
                  setNewChoreEffortStars('1');
                  setNewChoreSkill(choreSkillDropdownNames[0] || '');
                  setNewChoreSubSkill('');
                  setNewChoreScaleXpWithLevel(false);
                  setNewChoreRequiredLevel('1');
                  setNewChoreBedroomOwner('');
                  setNewChoreRoom(choreRoomTab);
                }}
                disabled={
                  (newChoreRoom === BEDROOM_ROOM && players.length === 0) ||
                  choreSkillDropdownNames.length === 0 ||
                  !newChoreSkill ||
                  !(newChoreSkill || '').trim() ||
                  (newChoreSubSkillOptions.length > 0 && !(newChoreSubSkill || '').trim())
                }
              >
                {editingChoreId ? 'Save changes' : 'Add Chore'}
              </Button>
              {editingChoreId ? (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingChoreId(null);
                    setNewChoreTitle('');
                    setNewChoreSchedule('daily');
                    setNewChoreEffortStars('1');
                    setNewChoreScaleXpWithLevel(false);
                    setNewChoreRequiredLevel('1');
                    setNewChoreBedroomOwner('');
                    setNewChoreRoom(choreRoomTab);
                    setNewChoreSkill(choreSkillDropdownNames[0] || '');
                    setNewChoreSubSkill('');
                  }}
                >
                  Cancel edit
                </Button>
              ) : null}
            </Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Existing Chores
              {newChoreRoom ? (
                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 400, mt: 0.25 }}>
                  Showing {newChoreRoom} only — change Room above to switch.
                </Typography>
              ) : null}
            </Typography>
            <List dense>
              {(() => {
                const choresForRoom = chores.filter((c) => c.room === newChoreRoom);
                if (choresForRoom.length === 0) {
                  return (
                    <ListItem>
                      <ListItemText primary={`No chores in ${newChoreRoom || 'this room'} yet.`} />
                    </ListItem>
                  );
                }
                const periodSet = new Set(CHORE_PERIODS);
                const otherChores = choresForRoom.filter((c) => !periodSet.has(c.schedule));
                const renderChoreRow = (chore) => (
                  <ListItem
                    key={chore.id}
                    secondaryAction={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                        <IconButton
                          size="small"
                          aria-label={`Edit ${chore.title}`}
                          onClick={() => {
                            setEditingChoreId(chore.id);
                            setNewChoreTitle(chore.title || '');
                            setNewChoreSchedule(chore.schedule || 'daily');
                            setNewChoreEffortStars(String(Math.min(5, Math.max(1, Number(chore.effortStars) || 1))));
                            const skillName = chore.skillName || '';
                            setNewChoreSkill(
                              skillName && choreSkillDropdownNames.includes(skillName)
                                ? skillName
                                : choreSkillDropdownNames[0] || '',
                            );
                            {
                              const ed = resolveSkillDefForChore(skillName);
                              const edSubs = ed?.subSkills?.filter(Boolean) || [];
                              setNewChoreSubSkill(
                                chore.subSkillName && edSubs.includes(chore.subSkillName)
                                  ? chore.subSkillName
                                  : (edSubs[0] || ''),
                              );
                            }
                            setNewChoreScaleXpWithLevel(Boolean(chore.scaleXpWithLevel));
                            setNewChoreRequiredLevel(String(Math.max(1, Number(chore.requiredLevel) || 1)));
                            setNewChoreBedroomOwner(chore.bedroomOwner || '');
                            setNewChoreRoom(chore.room && CHORE_ROOMS.includes(chore.room) ? chore.room : CHORE_ROOMS[0]);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          aria-label={`Delete ${chore.title}`}
                          onClick={() => setChores((prev) => prev.filter((c) => c.id !== chore.id))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={`${formatChoreRoomLabel(chore)} · ${chore.title}`}
                      secondary={[
                        `${chore.schedule} · Effort ${'★'.repeat(Number(chore.effortStars) || 1)}`,
                        chore.skillName
                          ? `+${choreXpFromEffortStars(chore.effortStars)} XP${chore.subSkillName ? ` → ${chore.subSkillName}` : ''}${chore.scaleXpWithLevel ? ` (scales · Lv ${Math.max(1, Number(chore.requiredLevel) || 1)}+)` : ''}`
                          : null,
                        chore.questOnly ? `quest: ${chore.assignedQuestTo}` : null,
                      ].filter(Boolean).join(' · ')}
                    />
                  </ListItem>
                );
                return (
                  <>
                    {CHORE_PERIODS.map((sched) => {
                      const group = choresForRoom.filter((c) => c.schedule === sched);
                      if (group.length === 0) return null;
                      const schedLabel = sched === 'daily' ? 'Daily' : sched === 'weekly' ? 'Weekly' : 'Monthly';
                      return (
                        <React.Fragment key={sched}>
                          <ListSubheader
                            component="div"
                            sx={{
                              bgcolor: 'transparent',
                              color: 'text.secondary',
                              fontWeight: 800,
                              lineHeight: '36px',
                              py: 0.5,
                            }}
                          >
                            {schedLabel}
                          </ListSubheader>
                          {group.map((chore) => renderChoreRow(chore))}
                        </React.Fragment>
                      );
                    })}
                    {otherChores.length > 0 ? (
                      <React.Fragment key="other-schedule">
                        <ListSubheader
                          component="div"
                          sx={{
                            bgcolor: 'transparent',
                            color: 'warning.main',
                            fontWeight: 800,
                            lineHeight: '36px',
                            py: 0.5,
                          }}
                        >
                          Other
                        </ListSubheader>
                        {otherChores.map((chore) => renderChoreRow(chore))}
                      </React.Fragment>
                    ) : null}
                  </>
                );
              })()}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setManageChoresDialogOpen(false);
                setEditingChoreId(null);
                setNewChoreSubSkill('');
                setManageChoreSkillEditIdx(null);
                setManageChoreSkillEditName('');
                setManageChoreSkillEditSubs('');
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={manageRewardsDialogOpen} onClose={() => setManageRewardsDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Manage Reward Store</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Leave &quot;Visible to&quot; empty so every player can see the reward, or limit it to specific players.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <TextField size="small" label="Reward" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} />
              <TextField size="small" label="Coin cost" type="number" value={newRewardCost} onChange={(e) => setNewRewardCost(e.target.value)} />
              <TextField
                size="small"
                label="Screen time (Optional)"
                type="number"
                inputProps={{ min: 0 }}
                value={newRewardScreenTime}
                onChange={(e) => setNewRewardScreenTime(e.target.value)}
                helperText="Minutes of screen time when redeemed"
                sx={{ minWidth: 160 }}
              />
              <FormControl size="small" sx={{ minWidth: 200, maxWidth: '100%', flex: '1 1 200px' }}>
                <InputLabel id="new-coin-reward-vis-label">Visible to</InputLabel>
                <Select
                  labelId="new-coin-reward-vis-label"
                  label="Visible to"
                  multiple
                  value={newRewardVisibleTo}
                  onChange={(e) =>
                    setNewRewardVisibleTo(
                      typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                    )
                  }
                  renderValue={(selected) => (selected.length === 0 ? 'Everyone' : selected.join(', '))}
                >
                  {players.map((p) => (
                    <MenuItem key={p.name} value={p.name}>
                      <Checkbox checked={newRewardVisibleTo.indexOf(p.name) > -1} size="small" />
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={() => {
                  const name = newRewardName.trim();
                  if (!name) return;
                  setRewardsStore((prev) => {
                    const st = Math.max(0, Math.floor(Number(newRewardScreenTime) || 0));
                    return [
                      ...prev,
                      {
                        id: `rw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        name,
                        cost: Math.max(1, Number(newRewardCost) || 1),
                        ...(st > 0 ? { screenTimeMinutes: st } : {}),
                        ...(newRewardVisibleTo.length > 0 ? { visibleToPlayerNames: [...newRewardVisibleTo] } : {}),
                      },
                    ];
                  });
                  setNewRewardName('');
                  setNewRewardCost('1');
                  setNewRewardScreenTime('');
                  setNewRewardVisibleTo([]);
                }}
              >
                Add Reward
              </Button>
            </Box>
            <List dense>
              {rewardsStore.length === 0 ? (
                <ListItem><ListItemText primary="No rewards in store yet." /></ListItem>
              ) : (
                rewardsStore.map((r) => (
                  <ListItem
                    key={r.id}
                    alignItems="flex-start"
                    sx={{ flexDirection: 'column', alignItems: 'stretch', py: 1.5 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
                      <ListItemText
                        primary={r.name}
                        secondary={[
                          `${r.cost} coins`,
                          Number(r.screenTimeMinutes) > 0 ? `${r.screenTimeMinutes} min screen time` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                        sx={{ flex: 1, minWidth: 0 }}
                      />
                      <IconButton size="small" color="error" onClick={() => setRewardsStore((prev) => prev.filter((x) => x.id !== r.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                      <InputLabel id={`coin-reward-vis-${r.id}`}>Visible to</InputLabel>
                      <Select
                        labelId={`coin-reward-vis-${r.id}`}
                        label="Visible to"
                        multiple
                        value={Array.isArray(r.visibleToPlayerNames) ? r.visibleToPlayerNames : []}
                        onChange={(e) => {
                          const v = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                          setRewardsStore((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, visibleToPlayerNames: v.length ? [...v] : [] } : x,
                            ),
                          );
                        }}
                        renderValue={(selected) => (selected.length === 0 ? 'Everyone' : selected.join(', '))}
                      >
                        {players.map((p) => (
                          <MenuItem key={p.name} value={p.name}>
                            <Checkbox
                              checked={(Array.isArray(r.visibleToPlayerNames) ? r.visibleToPlayerNames : []).indexOf(p.name) > -1}
                              size="small"
                            />
                            {p.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      label="Screen time (min)"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={r.screenTimeMinutes != null && r.screenTimeMinutes !== '' ? r.screenTimeMinutes : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setRewardsStore((prev) =>
                          prev.map((x) => {
                            if (x.id !== r.id) return x;
                            if (raw === '') return { ...x, screenTimeMinutes: undefined };
                            const n = Math.max(0, Math.floor(Number(raw) || 0));
                            return n > 0 ? { ...x, screenTimeMinutes: n } : { ...x, screenTimeMinutes: undefined };
                          }),
                        );
                      }}
                      sx={{ mt: 1, maxWidth: 200 }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManageRewardsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={apiCallsModalOpen} onClose={() => setApiCallsModalOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>API Calls for Sub-skill</DialogTitle>
          <DialogContent>
            {apiCallsContext ? (() => {
              const { playerName, skillName, subSkillName } = apiCallsContext;
              const matchingTasks = tasks.filter((t) => t.skillName === skillName && (t.subSkillName || null) === (subSkillName || null));
              const host = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : 'http://localhost:2988';
              const base = `${host}/api`;
              const xpPayload = JSON.stringify({
                playerName,
                skillName,
                subSkillName,
                amount: 10,
                whatHappened: 'API grant',
              });
              const pinQ = encodeURIComponent(lifeMasterPin || '');
              const xpCurl = `curl -X POST "${base}/xp/sub-skill?pin=${pinQ}" \\\n  -H "Content-Type: application/json" \\\n  -d '${xpPayload}'`;
              return (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Player: <strong>{playerName}</strong> · Skill: <strong>{skillName}</strong> · Sub-skill: <strong>{subSkillName}</strong>
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Add XP to this sub-skill</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    NFC Tools (HTTP POST)
                  </Typography>
                  <Box component="pre" sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', fontSize: 12, mb: 1.5 }}>
{`Request URL:
${base}/xp/sub-skill?pin=${pinQ}

POST parameters:
playerName=${playerName}
skillName=${skillName}
subSkillName=${subSkillName}
amount=10
whatHappened=API grant`}
                  </Box>
                  <Box component="pre" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', fontSize: 12, mb: 2 }}>
                    {xpCurl}
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>Complete a Task for This Sub-skill</Typography>
                  {matchingTasks.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No tasks currently configured for this sub-skill.
                    </Typography>
                  ) : (
                    <List dense>
                      {matchingTasks.map((t) => {
                        const taskPayload = JSON.stringify({
                          playerName,
                          taskId: t.id,
                          whatHappened: 'Completed via API',
                        });
                        const taskCurl = `curl -X POST "${base}/tasks/complete?pin=${pinQ}" \\\n  -H "Content-Type: application/json" \\\n  -d '${taskPayload}'`;
                        return (
                          <ListItem key={t.id} sx={{ display: 'block', borderBottom: 1, borderColor: 'divider', py: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {t.title} (taskId: {t.id}, +{t.xpReward} XP{t.starReward ? `, ★${t.starReward}` : ''})
                            </Typography>
                            <Box component="pre" sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', fontSize: 12, mt: 0.5, mb: 0.5 }}>
{`Request URL:
${base}/tasks/complete?pin=${pinQ}

POST parameters:
playerName=${playerName}
taskId=${t.id}
whatHappened=Completed via API`}
                            </Box>
                            <Box component="pre" sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', fontSize: 12, mt: 0.5, mb: 0 }}>
                              {taskCurl}
                            </Box>
                          </ListItem>
                        );
                      })}
                    </List>
                  )}
                </>
              );
            })() : (
              <Typography variant="body2" color="text.secondary">No sub-skill selected.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApiCallsModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isSettingsOpen} onClose={handleCloseSettings} fullWidth maxWidth="md" PaperProps={{ sx: { minHeight: '70vh' } }}>
          <DialogTitle>{role === 'Player' ? 'Your Settings' : 'Settings'}</DialogTitle>
          <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
            <Box
              sx={{
                width: 200,
                flexShrink: 0,
                borderRight: 1,
                borderColor: 'divider',
                pt: 2,
                pb: 2,
              }}
            >
              {role === 'Player' ? (
                <List dense>
                  <ListItem
                    button
                    selected={settingsSection === 'playerAppearance'}
                    onClick={() => setSettingsSection('playerAppearance')}
                  >
                    <ListItemText primary="Appearance" />
                  </ListItem>
                  <ListItem
                    button
                    selected={settingsSection === 'playerShowcase'}
                    onClick={() => setSettingsSection('playerShowcase')}
                  >
                    <ListItemText primary="Showcase" />
                  </ListItem>
                </List>
              ) : (
                <List dense>
                  <ListItem
                    button
                    selected={settingsSection === 'account'}
                    onClick={() => { setSettingsSection('account'); setAccountPinMessage(''); }}
                  >
                    <ListItemText primary="Account" />
                  </ListItem>
                  <ListItem
                    button
                    selected={settingsSection === 'effort'}
                    onClick={() => setSettingsSection('effort')}
                  >
                    <ListItemText primary="Effort" />
                  </ListItem>
                  <ListItem
                    button
                    selected={settingsSection === 'skills'}
                    onClick={() => setSettingsSection('skills')}
                  >
                    <ListItemText primary="Skills" secondary="Sub-skills & removal" />
                  </ListItem>
                  <ListItem
                    button
                    selected={settingsSection === 'api'}
                    onClick={() => setSettingsSection('api')}
                  >
                    <ListItemText primary="API Requests" />
                  </ListItem>
                  <ListItem
                    button
                    selected={settingsSection === 'reset'}
                    onClick={() => {
                      setSettingsSection('reset');
                      setResetSectionMessage('');
                    }}
                  >
                    <ListItemText primary="Reset progress" />
                  </ListItem>
                  <ListItem
                    button
                    selected={settingsSection === 'managePlayers'}
                    onClick={() => setSettingsSection('managePlayers')}
                  >
                    <ListItemText primary="Manage Players" />
                  </ListItem>
                </List>
              )}
            </Box>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {role === 'Player' && settingsSection === 'playerAppearance' && activePlayerIndex != null && players[activePlayerIndex] && (() => {
                const p = players[activePlayerIndex];
                const idx = activePlayerIndex;
                return (
                  <>
                    <Typography variant="h6" gutterBottom>App Theme</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Light or dark mode for this device (same as the control under the main title).
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={darkMode ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
                      onClick={() => setDarkMode((prev) => !prev)}
                      sx={{ mb: 3 }}
                      aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                      {darkMode ? 'Light theme' : 'Dark theme'}
                    </Button>
                    <Typography variant="h6" gutterBottom>Your Player</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Colours and chore screen theme for {p.name}.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 360 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">Favourite Colour</Typography>
                        <input
                          type="color"
                          value={p.favouriteColor || '#6200ee'}
                          onChange={(e) => handleUpdatePlayerFavouriteColor(idx, e.target.value)}
                          style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}
                        />
                      </Box>
                      <FormControl size="small" sx={{ maxWidth: 260 }}>
                        <InputLabel id="player-settings-chore-theme">Chore Theme</InputLabel>
                        <Select
                          labelId="player-settings-chore-theme"
                          label="Chore Theme"
                          value={p.choreTheme || 'unicorns'}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPlayers((prev) => prev.map((pl, i) => (i === idx ? { ...pl, choreTheme: v } : pl)));
                          }}
                        >
                          {CHORE_THEMES.map((theme) => (
                            <MenuItem key={theme.id} value={theme.id}>{theme.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label="Quest box title"
                        value={p.questBoxTitle || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPlayers((prev) => prev.map((pl, i) => (i === idx ? { ...pl, questBoxTitle: v } : pl)));
                        }}
                        sx={{ maxWidth: 260 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="text.secondary">Quest Border Colour</Typography>
                        <input
                          type="color"
                          value={p.questBoxBorderColor || '#d16ba5'}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPlayers((prev) => prev.map((pl, i) => (i === idx ? { ...pl, questBoxBorderColor: v } : pl)));
                          }}
                          style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}
                        />
                        <Typography variant="body2" color="text.secondary">Quest Background</Typography>
                        <input
                          type="color"
                          value={p.questBoxBgColor || '#ffffff'}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPlayers((prev) => prev.map((pl, i) => (i === idx ? { ...pl, questBoxBgColor: v } : pl)));
                          }}
                          style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}
                        />
                      </Box>
                    </Box>
                  </>
                );
              })()}
              {role === 'Player' && settingsSection === 'playerShowcase' && activePlayerIndex != null && players[activePlayerIndex] && (() => {
                const p = players[activePlayerIndex];
                return (
                  <>
                    <Typography variant="h6" gutterBottom>Reset Showcase</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Restore the default Showcase layout and clear your pinned Skill and Chore Achievements and showcased skills. Stars, coins, streak, and other progress are unchanged.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowcaseByPlayer((prev) => ({
                          ...prev,
                          [p.name]: normalizeShowcaseConfig({ showcaseUpdatedAt: Date.now() }),
                        }));
                      }}
                    >
                      Reset Showcase to default
                    </Button>
                  </>
                );
              })()}
              {settingsSection === 'achievements' && role === 'Life Master' && (
                <Box sx={{ width: '100%' }}>
                  <Tabs
                    value={settingsAchievementsTab}
                    onChange={(_, v) => setSettingsAchievementsTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                  >
                    <Tab value="skill" label="Skills" />
                    <Tab value="chore" label="Chores" />
                  </Tabs>
                  {settingsAchievementsTab === 'skill' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Tie an achievement to a skill task. Progress is counted from XP grant log entries for that task.
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-end', mb: 3 }}>
                        <TextField
                          size="small"
                          label="Achievement name"
                          value={newSkillAchievementName}
                          onChange={(e) => setNewSkillAchievementName(e.target.value)}
                          sx={{ minWidth: 200 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 240 }}>
                          <InputLabel id="ach-skill-task-label">Task</InputLabel>
                          <Select
                            labelId="ach-skill-task-label"
                            label="Task"
                            value={newSkillAchievementTaskId}
                            onChange={(e) => setNewSkillAchievementTaskId(e.target.value)}
                          >
                            {tasks.map((t) => (
                              <MenuItem key={t.id} value={t.id}>
                                {t.title} (Lv {t.requiredLevel ?? '—'})
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          size="small"
                          label="Threshold (completions)"
                          type="number"
                          inputProps={{ min: 1 }}
                          value={newSkillAchievementThreshold}
                          onChange={(e) => setNewSkillAchievementThreshold(e.target.value)}
                          sx={{ width: 160 }}
                        />
                        <TextField
                          size="small"
                          label="Unlock message (optional)"
                          value={newSkillAchievementUnlock}
                          onChange={(e) => setNewSkillAchievementUnlock(e.target.value)}
                          sx={{ minWidth: 260, flex: '1 1 200px' }}
                        />
                        <Button
                          variant="contained"
                          onClick={() => {
                            const name = newSkillAchievementName.trim();
                            if (!name || !newSkillAchievementTaskId) return;
                            const threshold = Math.max(1, parseInt(newSkillAchievementThreshold, 10) || 1);
                            setAchievementDefinitions((prev) => [
                              ...prev,
                              {
                                kind: 'skill',
                                id: `ach_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                                name,
                                taskId: newSkillAchievementTaskId,
                                threshold,
                                unlockMessage: newSkillAchievementUnlock.trim() || '',
                              },
                            ]);
                            setNewSkillAchievementName('');
                            setNewSkillAchievementTaskId('');
                            setNewSkillAchievementThreshold('1');
                            setNewSkillAchievementUnlock('');
                          }}
                          disabled={!newSkillAchievementName.trim() || !newSkillAchievementTaskId}
                        >
                          Add Skill Achievement
                        </Button>
                      </Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Defined Skill Achievements
                      </Typography>
                      {achievementDefinitions.filter(isSkillAchievementDef).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          None yet.
                        </Typography>
                      ) : (
                        <List dense>
                          {achievementDefinitions.filter(isSkillAchievementDef).map((def) => {
                            const t = tasks.find((x) => x.id === def.taskId);
                            return (
                              <ListItem
                                key={def.id}
                                secondaryAction={
                                  <IconButton edge="end" aria-label="Delete" onClick={() => setAchievementDefinitions((prev) => prev.filter((x) => x.id !== def.id))}>
                                    <DeleteIcon />
                                  </IconButton>
                                }
                              >
                                <ListItemText
                                  primary={def.name}
                                  secondary={`Task: ${t ? t.title : def.taskId} · threshold ${Math.max(1, Number(def.threshold) || 1)}${def.unlockMessage ? ` · ${def.unlockMessage}` : ''}`}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                    </Box>
                  )}
                  {settingsAchievementsTab === 'chore' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Tie an achievement to a chore. Progress is counted from completed chore activity for that chore.
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-end', mb: 2 }}>
                        <TextField
                          size="small"
                          label="Achievement name"
                          value={newChoreAchievementName}
                          onChange={(e) => setNewChoreAchievementName(e.target.value)}
                          sx={{ minWidth: 200 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 280 }}>
                          <InputLabel id="ach-chore-label">Chore</InputLabel>
                          <Select
                            labelId="ach-chore-label"
                            label="Chore"
                            value={newChoreAchievementChoreId}
                            onChange={(e) => setNewChoreAchievementChoreId(e.target.value)}
                          >
                            {chores.map((c) => (
                              <MenuItem key={c.id} value={c.id}>
                                {formatChoreRoomLabel(c)}: {c.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          size="small"
                          label="Threshold (completions)"
                          type="number"
                          inputProps={{ min: 1 }}
                          value={newChoreAchievementThreshold}
                          onChange={(e) => setNewChoreAchievementThreshold(e.target.value)}
                          sx={{ width: 160 }}
                        />
                        <TextField
                          size="small"
                          label="Unlock message (optional)"
                          value={newChoreAchievementUnlock}
                          onChange={(e) => setNewChoreAchievementUnlock(e.target.value)}
                          sx={{ minWidth: 260, flex: '1 1 200px' }}
                        />
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => {
                            const name = newChoreAchievementName.trim();
                            if (!name || !newChoreAchievementChoreId) return;
                            const threshold = Math.max(1, parseInt(newChoreAchievementThreshold, 10) || 1);
                            setAchievementDefinitions((prev) => [
                              ...prev,
                              {
                                kind: 'chore',
                                id: `ach_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                                name,
                                choreId: newChoreAchievementChoreId,
                                threshold,
                                unlockMessage: newChoreAchievementUnlock.trim() || '',
                              },
                            ]);
                            setNewChoreAchievementName('');
                            setNewChoreAchievementChoreId('');
                            setNewChoreAchievementThreshold('1');
                            setNewChoreAchievementUnlock('');
                          }}
                          disabled={!newChoreAchievementName.trim() || !newChoreAchievementChoreId || chores.length === 0}
                        >
                          Add Chore Achievement
                        </Button>
                      </Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Defined Chore Achievements
                      </Typography>
                      {achievementDefinitions.filter(isChoreAchievementDef).length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          None yet.
                        </Typography>
                      ) : (
                        <List dense>
                          {achievementDefinitions.filter(isChoreAchievementDef).map((def) => {
                            const c = chores.find((x) => x.id === def.choreId);
                            return (
                              <ListItem
                                key={def.id}
                                secondaryAction={
                                  <IconButton edge="end" aria-label="Delete" onClick={() => setAchievementDefinitions((prev) => prev.filter((x) => x.id !== def.id))}>
                                    <DeleteIcon />
                                  </IconButton>
                                }
                              >
                                <ListItemText
                                  primary={def.name}
                                  secondary={`Chore: ${c ? `${formatChoreRoomLabel(c)}: ${c.title}` : def.choreId} · threshold ${Math.max(1, Number(def.threshold) || 1)}${def.unlockMessage ? ` · ${def.unlockMessage}` : ''}`}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              {settingsSection === 'account' && role === 'Life Master' && (
                <>
                  <Typography variant="h6" gutterBottom>Life Master PIN</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Change the PIN used to sign in as Life Master.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 320 }}>
                    <TextField
                      label="Current PIN"
                      type="password"
                      autoComplete="current-password"
                      value={accountCurrentPin}
                      onChange={(e) => setAccountCurrentPin(e.target.value)}
                      size="small"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 20 }}
                    />
                    <TextField
                      label="New PIN"
                      type="password"
                      autoComplete="new-password"
                      value={accountNewPin}
                      onChange={(e) => setAccountNewPin(e.target.value)}
                      size="small"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 20 }}
                    />
                    <TextField
                      label="Confirm new PIN"
                      type="password"
                      autoComplete="new-password"
                      value={accountConfirmPin}
                      onChange={(e) => setAccountConfirmPin(e.target.value)}
                      size="small"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 20 }}
                    />
                    {accountPinMessage && (
                      <Typography variant="body2" color={accountPinMessage.startsWith('Life Master') ? 'success.main' : 'error.main'}>
                        {accountPinMessage}
                      </Typography>
                    )}
                    <Button variant="contained" onClick={handleChangeLifeMasterPin}>
                      Change Life Master PIN
                    </Button>
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Skill & task icons
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    All icon libraries (Material UI and react-icons sets) are enabled. Choose icons per skill and sub-skill below.
                  </Typography>
                  <AssignIconSection
                    skills={skills}
                    settingsTarget={settingsTarget}
                    setSettingsTarget={setSettingsTarget}
                    settingsIconPkg={settingsIconPkg}
                    setSettingsIconPkg={setSettingsIconPkg}
                    settingsIconName={settingsIconName}
                    setSettingsIconName={setSettingsIconName}
                    enabledPackagesList={enabledPackagesList}
                    onApply={handleApplySettingsIcon}
                  />
                </>
              )}
              {settingsSection === 'effort' && role === 'Life Master' && (
                <>
                  <Typography variant="h6" gutterBottom>Effort</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Coins awarded per effort star (1–5) when a chore is completed.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TextField
                        key={star}
                        size="small"
                        type="number"
                        label={`${star}★ coins`}
                        sx={{ width: 100 }}
                        value={effortCoinsByStar[star] ?? 0}
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value) || 0);
                          setEffortCoinsByStar((prev) => ({ ...prev, [star]: v }));
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
              {settingsSection === 'skills' && role === 'Life Master' && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 0,
                    maxWidth: 720,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ px: 2, pt: 2, pb: 0 }}>
                    <Typography variant="h6" gutterBottom>
                      Skills
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0 }}>
                      Manage sub-skills for main and chore-only skills, or remove skills from the Skills tab.
                    </Typography>
                  </Box>
                  <Tabs
                    value={settingsSkillsSubTab}
                    onChange={(_, v) => setSettingsSkillsSubTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                      px: 1,
                      minHeight: 48,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 },
                    }}
                  >
                    <Tab value="addSkill" label="Add skill" />
                    <Tab value="skillSubs" label="Skill sub-skills" />
                    <Tab value="choreSkillSubs" label="Chore sub-skills" />
                    <Tab value="removeSkills" label="Remove skills" />
                    <Tab value="playerAccess" label="Player access" />
                  </Tabs>
                  <Box sx={{ p: 2 }}>
                    {settingsSkillsSubTab === 'addSkill' && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Create a new skill with at least one sub-skill. Each sub-skill is saved to the server.
                        </Typography>
                        <TextField
                          label="Skill Name"
                          fullWidth
                          size="small"
                          margin="dense"
                          value={skillName}
                          onChange={(e) => setSkillName(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        {newSkillSubSkills.map((value, index) => (
                          <TextField
                            key={index}
                            label={index === 0 ? 'Sub Skill' : 'Additional Sub Skill'}
                            fullWidth
                            size="small"
                            margin="dense"
                            value={value}
                            onChange={(e) => handleNewSkillSubSkillChange(index, e.target.value)}
                          />
                        ))}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Button variant="text" size="small" onClick={handleAddNewSkillSubSkillField}>
                            Add Another Sub Skill
                          </Button>
                          <Button variant="contained" size="small" onClick={() => addSkill()}>
                            Add Skill
                          </Button>
                        </Box>
                      </>
                    )}
                    {settingsSkillsSubTab === 'skillSubs' && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Add sub-skills to skills from the main Skills tab. Each add is saved to the server (same as the old control on the skill cards).
                        </Typography>
                        {skills.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No skills yet. Use the Add skill tab above to create a skill first.
                          </Typography>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {skills.map((sk) => (
                              <Paper key={sk.name} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>{sk.name}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                  <TextField
                                    label="Add sub-skill"
                                    size="small"
                                    value={newSubSkillDraftMain[sk.name] || ''}
                                    onChange={(e) =>
                                      setNewSubSkillDraftMain((prev) => ({ ...prev, [sk.name]: e.target.value }))
                                    }
                                    sx={{ minWidth: 200, flex: '1 1 160px' }}
                                  />
                                  <Button variant="contained" size="small" onClick={() => handleAddSubSkill(sk.name)}>
                                    Add
                                  </Button>
                                </Box>
                                {(sk.subSkills || []).length > 0 ? (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    Current: {(sk.subSkills || []).join(', ')}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    No sub-skills yet.
                                  </Typography>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                    {settingsSkillsSubTab === 'choreSkillSubs' && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Add sub-skills to chore-only skill definitions (listed under Chores → Chore Skills). These are separate from the main Skills tab. Changes save with your game state.
                        </Typography>
                        {choreSkills.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No chore skills yet. Add skill names under Chores → Chore Skills first.
                          </Typography>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {choreSkills.map((sk) => (
                              <Paper key={sk.name} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>{sk.name}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                  <TextField
                                    label="Add sub-skill"
                                    size="small"
                                    value={newSubSkillDraftChore[sk.name] || ''}
                                    onChange={(e) =>
                                      setNewSubSkillDraftChore((prev) => ({ ...prev, [sk.name]: e.target.value }))
                                    }
                                    sx={{ minWidth: 200, flex: '1 1 160px' }}
                                  />
                                  <Button variant="contained" size="small" onClick={() => handleAddChoreSubSkill(sk.name)}>
                                    Add
                                  </Button>
                                </Box>
                                {(sk.subSkills || []).length > 0 ? (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    Current: {(sk.subSkills || []).join(', ')}
                                  </Typography>
                                ) : (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    No sub-skills yet.
                                  </Typography>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                    {settingsSkillsSubTab === 'playerAccess' && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Choose which players may use each skill and sub-skill. If all players are selected for a skill, it behaves like &quot;everyone&quot; (same as leaving unrestricted). Sub-skill rows override the skill list for that sub only; all players selected means inherit from the skill.
                        </Typography>
                        {players.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">Add players in Manage Players first.</Typography>
                        ) : (
                          <>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                              Main Skills tab
                            </Typography>
                            {skills.length === 0 ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                No skills yet.
                              </Typography>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                                {skills.map((sk) => {
                                  const allNames = players.map((p) => p.name);
                                  const value =
                                    Array.isArray(sk.visibleToPlayerNames) && sk.visibleToPlayerNames.length > 0
                                      ? sk.visibleToPlayerNames
                                      : allNames;
                                  return (
                                    <Paper key={sk.name} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                        {sk.name}
                                      </Typography>
                                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                                        <InputLabel id={`skill-pl-${sk.name}`}>Players who can use this skill</InputLabel>
                                        <Select
                                          labelId={`skill-pl-${sk.name}`}
                                          multiple
                                          label="Players who can use this skill"
                                          value={value}
                                          renderValue={(selected) => {
                                            const sel = typeof selected === 'string' ? selected.split(',') : selected;
                                            return sel.length === allNames.length ? 'Everyone' : sel.join(', ');
                                          }}
                                          onChange={(e) => {
                                            const v = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                            const isEveryone =
                                              v.length === allNames.length && allNames.every((n) => v.includes(n));
                                            setSkills((prev) =>
                                              prev.map((s) =>
                                                s.name === sk.name
                                                  ? { ...s, visibleToPlayerNames: isEveryone ? undefined : [...v] }
                                                  : s,
                                              ),
                                            );
                                          }}
                                        >
                                          {players.map((p) => (
                                            <MenuItem key={p.name} value={p.name}>
                                              <Checkbox checked={value.indexOf(p.name) > -1} size="small" />
                                              {p.name}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                      {(sk.subSkills || []).filter(Boolean).map((sub) => {
                                        const map = sk.subSkillVisibleToPlayerNames || {};
                                        const subVal = map[sub] && map[sub].length ? map[sub] : allNames;
                                        return (
                                          <Box key={sub} sx={{ pl: 1.5, borderLeft: 2, borderColor: 'divider', mb: 1 }}>
                                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                              Sub-skill: {sub}
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                              <InputLabel id={`sub-pl-${sk.name}-${sub}`}>Players (optional override)</InputLabel>
                                              <Select
                                                labelId={`sub-pl-${sk.name}-${sub}`}
                                                multiple
                                                label="Players (optional override)"
                                                value={subVal}
                                                renderValue={(selected) => {
                                                  const sel = typeof selected === 'string' ? selected.split(',') : selected;
                                                  if (sel.length === allNames.length) return 'Same as skill default';
                                                  return sel.join(', ');
                                                }}
                                                onChange={(e) => {
                                                  const v = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                                  const isEveryone =
                                                    v.length === allNames.length && allNames.every((n) => v.includes(n));
                                                  setSkills((prev) =>
                                                    prev.map((s) => {
                                                      if (s.name !== sk.name) return s;
                                                      const nextMap = { ...(s.subSkillVisibleToPlayerNames || {}) };
                                                      if (isEveryone) {
                                                        delete nextMap[sub];
                                                      } else {
                                                        nextMap[sub] = [...v];
                                                      }
                                                      return {
                                                        ...s,
                                                        subSkillVisibleToPlayerNames:
                                                          Object.keys(nextMap).length > 0 ? nextMap : undefined,
                                                      };
                                                    }),
                                                  );
                                                }}
                                              >
                                                {players.map((p) => (
                                                  <MenuItem key={p.name} value={p.name}>
                                                    <Checkbox checked={subVal.indexOf(p.name) > -1} size="small" />
                                                    {p.name}
                                                  </MenuItem>
                                                ))}
                                              </Select>
                                            </FormControl>
                                          </Box>
                                        );
                                      })}
                                    </Paper>
                                  );
                                })}
                              </Box>
                            )}
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                              Chore-only skills
                            </Typography>
                            {choreSkills.length === 0 ? (
                              <Typography variant="body2" color="text.secondary">
                                No chore-only skills. Add under Chores → Chore Skills if needed.
                              </Typography>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {choreSkills.map((sk) => {
                                  const allNames = players.map((p) => p.name);
                                  const value =
                                    Array.isArray(sk.visibleToPlayerNames) && sk.visibleToPlayerNames.length > 0
                                      ? sk.visibleToPlayerNames
                                      : allNames;
                                  return (
                                    <Paper key={sk.name} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                        {sk.name}
                                      </Typography>
                                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                                        <InputLabel id={`cskill-pl-${sk.name}`}>Players who can use this skill</InputLabel>
                                        <Select
                                          labelId={`cskill-pl-${sk.name}`}
                                          multiple
                                          label="Players who can use this skill"
                                          value={value}
                                          renderValue={(selected) => {
                                            const sel = typeof selected === 'string' ? selected.split(',') : selected;
                                            return sel.length === allNames.length ? 'Everyone' : sel.join(', ');
                                          }}
                                          onChange={(e) => {
                                            const v = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                            const isEveryone =
                                              v.length === allNames.length && allNames.every((n) => v.includes(n));
                                            setChoreSkills((prev) =>
                                              prev.map((s) =>
                                                s.name === sk.name
                                                  ? { ...s, visibleToPlayerNames: isEveryone ? undefined : [...v] }
                                                  : s,
                                              ),
                                            );
                                          }}
                                        >
                                          {players.map((p) => (
                                            <MenuItem key={p.name} value={p.name}>
                                              <Checkbox checked={value.indexOf(p.name) > -1} size="small" />
                                              {p.name}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                      {(sk.subSkills || []).filter(Boolean).map((sub) => {
                                        const map = sk.subSkillVisibleToPlayerNames || {};
                                        const subVal = map[sub] && map[sub].length ? map[sub] : allNames;
                                        return (
                                          <Box key={sub} sx={{ pl: 1.5, borderLeft: 2, borderColor: 'divider', mb: 1 }}>
                                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
                                              Sub-skill: {sub}
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                              <InputLabel id={`csub-pl-${sk.name}-${sub}`}>Players (optional override)</InputLabel>
                                              <Select
                                                labelId={`csub-pl-${sk.name}-${sub}`}
                                                multiple
                                                label="Players (optional override)"
                                                value={subVal}
                                                renderValue={(selected) => {
                                                  const sel = typeof selected === 'string' ? selected.split(',') : selected;
                                                  if (sel.length === allNames.length) return 'Same as skill default';
                                                  return sel.join(', ');
                                                }}
                                                onChange={(e) => {
                                                  const v = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                                                  const isEveryone =
                                                    v.length === allNames.length && allNames.every((n) => v.includes(n));
                                                  setChoreSkills((prev) =>
                                                    prev.map((s) => {
                                                      if (s.name !== sk.name) return s;
                                                      const nextMap = { ...(s.subSkillVisibleToPlayerNames || {}) };
                                                      if (isEveryone) {
                                                        delete nextMap[sub];
                                                      } else {
                                                        nextMap[sub] = [...v];
                                                      }
                                                      return {
                                                        ...s,
                                                        subSkillVisibleToPlayerNames:
                                                          Object.keys(nextMap).length > 0 ? nextMap : undefined,
                                                      };
                                                    }),
                                                  );
                                                }}
                                              >
                                                {players.map((p) => (
                                                  <MenuItem key={p.name} value={p.name}>
                                                    <Checkbox checked={subVal.indexOf(p.name) > -1} size="small" />
                                                    {p.name}
                                                  </MenuItem>
                                                ))}
                                              </Select>
                                            </FormControl>
                                          </Box>
                                        );
                                      })}
                                    </Paper>
                                  );
                                })}
                              </Box>
                            )}
                          </>
                        )}
                      </>
                    )}
                    {settingsSkillsSubTab === 'removeSkills' && (
                      <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Permanently removes definitions from the Skills tab. XP, tasks, skill tree, icons, and XP log lines for that skill or sub-skill are removed. Chores that awarded XP under a removed skill have that XP cleared.
                        </Typography>
                        {skills.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No skills defined yet.</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {skills.map((sk) => (
                              <Paper key={sk.name} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{sk.name}</Typography>
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    onClick={() => handleRemoveSkillDefinition(sk.name)}
                                  >
                                    Remove skill
                                  </Button>
                                </Box>
                                {(sk.subSkills || []).length > 0 && (
                                  <Box sx={{ mt: 1.5, pl: 1.5, borderLeft: 2, borderColor: 'divider' }}>
                                    {(sk.subSkills || []).map((sub) => (
                                      <Box
                                        key={sub}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: 1,
                                          py: 0.5,
                                        }}
                                      >
                                        <Typography variant="body2">{sub}</Typography>
                                        <Button
                                          size="small"
                                          color="error"
                                          variant="text"
                                          onClick={() => handleRemoveSubSkillDefinition(sk.name, sub)}
                                        >
                                          Remove
                                        </Button>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                              </Paper>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Paper>
              )}
              {settingsSection === 'managePlayers' && role === 'Life Master' && (
                <>
                  <Typography variant="h6" gutterBottom>Manage Players</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use &quot;Reset Showcase&quot; on a player to restore their default Showcase layout and clear pinned achievements and showcased skills. Stars, coins, streak, and other progress are unchanged.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {players.map((player, index) => {
                      const expanded = Boolean(managePlayersExpanded[index]);
                      return (
                        <Paper key={`${player.name}-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            <IconButton
                              size="small"
                              aria-label={expanded ? 'Collapse Player' : 'Expand Player'}
                              onClick={() =>
                                setManagePlayersExpanded((prev) => ({
                                  ...prev,
                                  [index]: !prev[index],
                                }))
                              }
                            >
                              {expanded ? (
                                <ToggleOnIcon sx={{ fontSize: 22 }} color="primary" />
                              ) : (
                                <ToggleOffIcon sx={{ fontSize: 22, opacity: 0.75 }} />
                              )}
                            </IconButton>
                            <Tooltip title="Move up">
                              <span>
                                <IconButton
                                  size="small"
                                  aria-label="Move player up"
                                  onClick={() => handleMovePlayer(index, 'up')}
                                  disabled={index === 0}
                                >
                                  <KeyboardArrowUpIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Move down">
                              <span>
                                <IconButton
                                  size="small"
                                  aria-label="Move player down"
                                  onClick={() => handleMovePlayer(index, 'down')}
                                  disabled={index === players.length - 1}
                                >
                                  <KeyboardArrowDownIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Avatar src={player.iconUrl || undefined} alt={player.name} sx={{ width: 36, height: 36 }}>
                              {player.name.charAt(0).toUpperCase()}
                            </Avatar>
                            {!expanded && (
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 0.5 }}>
                                {player.name}
                              </Typography>
                            )}
                          </Box>
                          <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 420 }}>
                              <TextField
                                label="Player Name"
                                fullWidth
                                size="small"
                                value={player.name}
                                onChange={(e) => handleUpdatePlayerName(index, e.target.value)}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" color="text.secondary">Favourite Colour</Typography>
                                <input
                                  type="color"
                                  value={player.favouriteColor || '#6200ee'}
                                  onChange={(e) => handleUpdatePlayerFavouriteColor(index, e.target.value)}
                                  style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}
                                />
                              </Box>
                              <TextField
                                label="PIN"
                                type="password"
                                size="small"
                                placeholder="Leave blank for default (2222)"
                                value={player.pin ?? ''}
                                onChange={(e) => handleUpdatePlayerPin(index, e.target.value)}
                                sx={{ maxWidth: 220 }}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 20 }}
                              />
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                  <InputLabel>User Type</InputLabel>
                                  <Select
                                    label="User Type"
                                    value={player.userType || 'Child'}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, userType: v } : p)));
                                    }}
                                  >
                                    <MenuItem value="Adult">Adult</MenuItem>
                                    <MenuItem value="Child">Child</MenuItem>
                                  </Select>
                                </FormControl>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                  <InputLabel>Goal Period</InputLabel>
                                  <Select
                                    label="Goal Period"
                                    value={choreGoalsByPlayer[player.name]?.period || 'week'}
                                    onChange={(e) => {
                                      const period = e.target.value;
                                      setChoreGoalsByPlayer((prev) => ({
                                        ...prev,
                                        [player.name]: { ...(prev[player.name] || {}), period },
                                      }));
                                    }}
                                  >
                                    <MenuItem value="week">Weekly</MenuItem>
                                    <MenuItem value="month">Monthly</MenuItem>
                                  </Select>
                                </FormControl>
                                <TextField
                                  size="small"
                                  type="number"
                                  label="Chore Goal"
                                  sx={{ width: 110 }}
                                  value={choreGoalsByPlayer[player.name]?.choreTarget ?? 0}
                                  onChange={(e) => {
                                    const choreTarget = Math.max(0, Number(e.target.value) || 0);
                                    setChoreGoalsByPlayer((prev) => ({
                                      ...prev,
                                      [player.name]: { ...(prev[player.name] || {}), choreTarget },
                                    }));
                                  }}
                                />
                                <TextField
                                  size="small"
                                  type="number"
                                  label="Coin target"
                                  sx={{ width: 110 }}
                                  value={choreGoalsByPlayer[player.name]?.coinTarget ?? 0}
                                  onChange={(e) => {
                                    const coinTarget = Math.max(0, Number(e.target.value) || 0);
                                    setChoreGoalsByPlayer((prev) => ({
                                      ...prev,
                                      [player.name]: { ...(prev[player.name] || {}), coinTarget },
                                    }));
                                  }}
                                />
                              </Box>
                              <FormControl size="small" sx={{ maxWidth: 260 }}>
                                <InputLabel>Chore Theme</InputLabel>
                                <Select
                                  label="Chore Theme"
                                  value={player.choreTheme || 'unicorns'}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, choreTheme: v } : p)));
                                  }}
                                >
                                  {CHORE_THEMES.map((theme) => (
                                    <MenuItem key={theme.id} value={theme.id}>{theme.label}</MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <TextField
                                size="small"
                                label="Quest box title"
                                value={player.questBoxTitle || ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, questBoxTitle: v } : p)));
                                }}
                                sx={{ maxWidth: 260 }}
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" color="text.secondary">Quest Border Colour</Typography>
                                <input
                                  type="color"
                                  value={player.questBoxBorderColor || '#d16ba5'}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, questBoxBorderColor: v } : p)));
                                  }}
                                  style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}
                                />
                                <Typography variant="body2" color="text.secondary">Quest Background</Typography>
                                <input
                                  type="color"
                                  value={player.questBoxBgColor || '#ffffff'}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, questBoxBgColor: v } : p)));
                                  }}
                                  style={{ width: 36, height: 28, padding: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}
                                />
                              </Box>
                              <Button variant="outlined" component="label" size="small" sx={{ alignSelf: 'flex-start' }}>
                                Choose Icon (PNG)
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg"
                                  hidden
                                  onChange={(e) => handlePlayerIconFileChange(index, e)}
                                />
                              </Button>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button size="small" variant="outlined" onClick={() => openActivityLogForPlayer(player.name)}>
                                  Activity log
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setShowcaseByPlayer((prev) => ({
                                      ...prev,
                                      [player.name]: normalizeShowcaseConfig({ showcaseUpdatedAt: Date.now() }),
                                    }));
                                  }}
                                >
                                  Reset Showcase
                                </Button>
                              </Box>
                            </Box>
                          </Collapse>
                        </Paper>
                      );
                    })}
                  </Box>
                  <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    Add New Player
                  </Typography>
                  <TextField
                    label="Player Name"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Button variant="outlined" component="label" size="small">
                      Choose Icon (PNG)
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        hidden
                        onChange={handleNewPlayerIconFileChange}
                      />
                    </Button>
                  </Box>
                  <Button sx={{ mt: 2 }} variant="contained" onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
                    Add Player
                  </Button>
                </>
              )}
              {settingsSection === 'reset' && role === 'Life Master' && (
                <>
                  <Typography variant="h6" gutterBottom>Reset Player Progress</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Clears XP, pending XP, levels (back to start), stars (pending, jar, and total earned), skill tree points, and this player&apos;s activity log entries.
                    Skills, sub-skills, and tasks are not removed.
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 360 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="reset-player-label">Player</InputLabel>
                      <Select
                        labelId="reset-player-label"
                        label="Player"
                        value={resetSectionPlayerIndex}
                        onChange={(e) => setResetSectionPlayerIndex(Number(e.target.value))}
                      >
                        {players.map((p, i) => (
                          <MenuItem key={p.name} value={i}>{p.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Life Master PIN"
                      type="password"
                      size="small"
                      value={resetSectionPin}
                      onChange={(e) => setResetSectionPin(e.target.value)}
                      autoComplete="off"
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 20 }}
                    />
                    <TextField
                      label="Type CONFIRM to delete progress"
                      size="small"
                      value={resetSectionConfirm}
                      onChange={(e) => setResetSectionConfirm(e.target.value)}
                      placeholder="CONFIRM"
                      autoComplete="off"
                    />
                    {resetSectionMessage && (
                      <Typography
                        variant="body2"
                        color={resetSectionMessage.startsWith('Progress reset') ? 'success.main' : 'error.main'}
                      >
                        {resetSectionMessage}
                      </Typography>
                    )}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleConfirmResetPlayerProgress}
                      disabled={!players.length}
                    >
                      Reset this player&apos;s progress
                    </Button>
                  </Box>
                </>
              )}
              {settingsSection === 'api' && role === 'Life Master' && (
                <>
                  <Typography variant="h6" gutterBottom>Backend API Requests</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Use the Life Master PIN as the POST authentication key. You can send it as query param
                    (<code>?pin=&lt;pin&gt;</code>) or in JSON body (<code>"pin":"..."</code>), and headers also still work.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="GET /state"
                        secondary="Fetch full app state (skills, players, XP, chores, etc.). Does not include lifeMasterPin."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /auth/verify-life-master"
                        secondary="Body: { pin }. Returns ok if PIN matches (no PIN auth on this route). Used by the app to log in as Life Master."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /state"
                        secondary="Update and persist app state (requires auth header). Response omits lifeMasterPin."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="GET /skills"
                        secondary="Fetch skills list only."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /skills"
                        secondary="Create a skill or add a sub-skill (requires auth header)."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /xp/sub-skill"
                        secondary="Add pending XP directly to a specific sub-skill for a player."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /tasks/complete"
                        secondary="Complete a task by taskId and grant its predefined XP (and star reward if configured)."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="GET /chores"
                        secondary="Fetch chore definitions only."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /chores"
                        secondary="Create a chore (title, room, schedule; optional XP, stars, quest fields). For room Bedroom, bedroomOwner (player name) is required. Same PIN auth as POST /skills."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /chores/complete"
                        secondary="Record a chore completion for a player (period, quest, and assignment rules match the app)."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /chores/delete"
                        secondary="Remove a chore by choreId."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="POST /quests/today"
                        secondary="Set or add today’s quest chore ids for a player (choreIds array or addChoreId)."
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Also available with /api prefix"
                        secondary="/api/state, /api/skills, /api/chores, …"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Full HTTP reference"
                        secondary="See server/API.md in the repo for endpoint details and curl examples."
                      />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Examples</Typography>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>NFC Tools format (Request URL + POST parameters)</Typography>
                  <Box component="pre" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', fontSize: 12, mb: 1.5 }}>
{`XP to sub-skill
Request URL:
http://<YOUR_PC_IP>:2988/api/xp/sub-skill?pin=${encodeURIComponent(lifeMasterPin || '')}
POST parameters:
playerName=Alex
skillName=Reading
subSkillName=Comprehension
amount=25
whatHappened=Great session

Complete task by id
Request URL:
http://<YOUR_PC_IP>:2988/api/tasks/complete?pin=${encodeURIComponent(lifeMasterPin || '')}
POST parameters:
playerName=Alex
taskId=1700000000000
whatHappened=Completed before dinner`}
                  </Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Chores (JSON)</Typography>
                  <Box component="pre" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', fontSize: 12, mb: 1.5 }}>
{`Complete chore by id
curl -X POST "http://localhost:2988/api/chores/complete?pin=${encodeURIComponent(lifeMasterPin || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{"playerName":"Alex","choreId":"chore_1700000000000_abc12"}'

Create chore
curl -X POST "http://localhost:2988/api/chores?pin=${encodeURIComponent(lifeMasterPin || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Dishes","room":"Kitchen","schedule":"daily","effortStars":2,"skillName":"Life Skills"}'

Assign today’s quest (append)
curl -X POST "http://localhost:2988/api/quests/today?pin=${encodeURIComponent(lifeMasterPin || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{"playerName":"Alex","addChoreId":"chore_1700000000000_abc12"}'`}
                  </Box>
                  <Box component="pre" sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', fontSize: 12, mb: 1.5 }}>
{`# Full state
curl http://localhost:2988/state

# Add a skill (headerless auth via query pin)
curl -X POST "http://localhost:2988/skills?pin=${encodeURIComponent(lifeMasterPin || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Reading"}'

# Add a sub-skill (headerless auth via JSON body pin)
curl -X POST http://localhost:2988/skills \\
  -H "Content-Type: application/json" \\
  -d '{"pin":"${lifeMasterPin}","name":"Reading","subSkill":"Comprehension"}'

# Save state
curl -X POST "http://localhost:2988/state?pin=${encodeURIComponent(lifeMasterPin || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{"skills":[],"players":[]}'

# Add XP to a sub-skill
curl -X POST "http://localhost:2988/xp/sub-skill?pin=${encodeURIComponent(lifeMasterPin || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{"playerName":"Alex","skillName":"Reading","subSkillName":"Comprehension","amount":25,"whatHappened":"Great session"}'

# Complete task by ID (uses task.xpReward automatically)
curl -X POST "http://localhost:2988/tasks/complete?pin=${encodeURIComponent(lifeMasterPin || '')}" \\
  -H "Content-Type: application/json" \\
  -d '{"playerName":"Alex","taskId":"1700000000000","whatHappened":"Completed before dinner"}'`}
                  </Box>
                </>
              )}
            </Box>
          </Box>
          <DialogActions>
            <Button onClick={handleCloseSettings}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={starRewardMgmtDialogOpen}
          onClose={() => {
            setStarRewardMgmtDialogOpen(false);
            setStarRewardMgmtDraft(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Typography component="span" variant="h6">
                {!starRewardMgmtDraft
                  ? 'Star rewards'
                  : starRewardMgmtDraft.id
                    ? 'Edit reward'
                    : 'Add reward'}
              </Typography>
              {!starRewardMgmtDraft ? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    setStarRewardMgmtDraft({
                      id: null,
                      name: '',
                      description: '',
                      cost: '1',
                      visibleToPlayerNames: [],
                    })
                  }
                >
                  Add reward
                </Button>
              ) : null}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {!starRewardMgmtDraft ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Choose a reward to edit (including who can see it), or add a new one.
                </Typography>
                {starRewards.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No rewards yet. Click &quot;Add reward&quot;.
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {starRewards.map((r) => (
                      <ListItem
                        key={r.id}
                        sx={{
                          flexWrap: 'wrap',
                          gap: 1,
                          borderBottom: 1,
                          borderColor: 'divider',
                          py: 1.25,
                        }}
                      >
                        <ListItemText
                          sx={{ flex: '1 1 180px', minWidth: 0 }}
                          primary={r.name}
                          secondary={
                            r.description ? `${r.description} · ★${r.cost}` : `★${r.cost}`
                          }
                        />
                        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                          <IconButton
                            size="small"
                            aria-label="Edit"
                            onClick={() =>
                              setStarRewardMgmtDraft({
                                id: r.id,
                                name: r.name,
                                description: r.description || '',
                                cost: String(r.cost),
                                visibleToPlayerNames: [
                                  ...(Array.isArray(r.visibleToPlayerNames) ? r.visibleToPlayerNames : []),
                                ],
                              })
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Remove"
                            onClick={() => {
                              if (!window.confirm('Remove this reward?')) return;
                              setStarRewards((prev) => prev.filter((x) => x.id !== r.id));
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            ) : (
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  label="Reward name"
                  size="small"
                  fullWidth
                  value={starRewardMgmtDraft.name}
                  onChange={(e) =>
                    setStarRewardMgmtDraft((d) => (d ? { ...d, name: e.target.value } : d))
                  }
                />
                <TextField
                  label="Description (optional)"
                  size="small"
                  fullWidth
                  value={starRewardMgmtDraft.description}
                  onChange={(e) =>
                    setStarRewardMgmtDraft((d) => (d ? { ...d, description: e.target.value } : d))
                  }
                />
                <TextField
                  label="Cost (stars)"
                  type="number"
                  size="small"
                  fullWidth
                  value={starRewardMgmtDraft.cost}
                  onChange={(e) =>
                    setStarRewardMgmtDraft((d) => (d ? { ...d, cost: e.target.value } : d))
                  }
                  inputProps={{ min: 1 }}
                />
                <FormControl fullWidth size="small">
                  <InputLabel id="star-reward-dialog-vis-label">Visible to</InputLabel>
                  <Select
                    labelId="star-reward-dialog-vis-label"
                    label="Visible to"
                    multiple
                    value={starRewardMgmtDraft.visibleToPlayerNames}
                    onChange={(e) => {
                      const v = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                      setStarRewardMgmtDraft((d) => (d ? { ...d, visibleToPlayerNames: v } : d));
                    }}
                    renderValue={(selected) =>
                      selected.length === 0 ? 'Everyone' : selected.join(', ')
                    }
                  >
                    {players.map((p) => (
                      <MenuItem key={p.name} value={p.name}>
                        <Checkbox
                          checked={starRewardMgmtDraft.visibleToPlayerNames.indexOf(p.name) > -1}
                          size="small"
                        />
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary">
                  Leave empty so every player can see this reward, or pick specific players.
                </Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            {!starRewardMgmtDraft ? (
              <Button
                onClick={() => {
                  setStarRewardMgmtDialogOpen(false);
                  setStarRewardMgmtDraft(null);
                }}
              >
                Close
              </Button>
            ) : (
              <>
                <Button onClick={() => setStarRewardMgmtDraft(null)}>Back</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (!starRewardMgmtDraft) return;
                    const name = starRewardMgmtDraft.name.trim();
                    if (!name) return;
                    const cost = Math.max(1, parseInt(starRewardMgmtDraft.cost, 10) || 1);
                    const description = starRewardMgmtDraft.description.trim() || null;
                    const vis = Array.isArray(starRewardMgmtDraft.visibleToPlayerNames)
                      ? starRewardMgmtDraft.visibleToPlayerNames
                      : [];
                    if (starRewardMgmtDraft.id) {
                      setStarRewards((prev) =>
                        prev.map((x) =>
                          x.id === starRewardMgmtDraft.id
                            ? {
                                ...x,
                                name,
                                description,
                                cost,
                                visibleToPlayerNames: vis.length ? [...vis] : [],
                              }
                            : x,
                        ),
                      );
                    } else {
                      setStarRewards((prev) => [
                        ...prev,
                        {
                          id: `reward_${Date.now()}`,
                          name,
                          description,
                          cost,
                          ...(vis.length ? { visibleToPlayerNames: [...vis] } : {}),
                        },
                      ]);
                    }
                    setStarRewardMgmtDraft(null);
                  }}
                  disabled={!starRewardMgmtDraft.name.trim()}
                >
                  Save
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

export default App;
