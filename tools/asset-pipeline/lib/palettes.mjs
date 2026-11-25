// Original Aevoria palettes. Each ramp = [outline, shadow, base, light].
import { ramp, flat } from './raster.mjs';

export const SKIN = {
  light: ramp('#6b3b2a', '#e2a27f', '#f7cba6', '#ffe6cf'),
  medium: ramp('#5a2e1e', '#bf7a4f', '#dca172', '#f1c497'),
  deep: ramp('#331810', '#704024', '#965a35', '#b57a4f'),
};
export const UNDER = ramp('#2c2e42', '#6f7390', '#9ea2bd', '#c9cce0');
export const HAIR = {
  chestnut: ramp('#2e170f', '#6e3b22', '#a1602f', '#d39150'),
  midnight: ramp('#0e1226', '#252f58', '#3a4c88', '#6a85c4'),
};
export const EYES = {
  male: { iris: flat('#6a3a1e'), dark: flat('#1c1424'), white: flat('#ffffff'), mouth: flat('#8a3434'), blush: null },
  female: { iris: flat('#1f7a6a'), dark: flat('#1a1428'), white: flat('#ffffff'), mouth: flat('#b04a5a'), blush: flat('#f29a9a') },
};
export const GOLD = ramp('#5a3a0e', '#b07f26', '#e1b04a', '#ffe28e');
export const OUTFIT = {
  wayfarer: {
    jacket: ramp('#10304a', '#1c6486', '#2a93b4', '#72d0e6'),
    trim: GOLD,
    shorts: ramp('#3a3022', '#857050', '#b6996a', '#dcc79a'),
    boots: ramp('#24160e', '#58361f', '#86532e', '#b07a48'),
    gloves: ramp('#24160e', '#4e3020', '#74472a', '#9a6a42'),
    scarf: ramp('#481212', '#ae3826', '#de5e36', '#ff9a62'),
  },
  runeweave: {
    tunic: ramp('#4a4236', '#c4b89c', '#ece3cc', '#fffdf4'),
    rune: ramp('#12224a', '#2a54a6', '#3e86e0', '#8cc6ff'),
    leggings: ramp('#0e1228', '#232c58', '#344282', '#5463aa'),
    shoes: ramp('#3a3428', '#a89c80', '#d8cfb6', '#f6f0de'),
    wraps: ramp('#12224a', '#2a54a6', '#3e86e0', '#8cc6ff'),
    cape: ramp('#121c42', '#283c8a', '#395cbe', '#6c92e8'),
    lining: GOLD,
  },
};
export const LEATHER = ramp('#2a190e', '#663f21', '#916031', '#bd8a4c');
export const SHADOW_RGBA = [24, 18, 44, 92];

export const MOUNT = {
  body: ramp('#2e2850', '#6b62a6', '#958ad0', '#c2b9f0'),
  belly: ramp('#4a4236', '#cfc2a2', '#f0e7cf', '#fffaf0'),
  mane: ramp('#5a2c08', '#c06a18', '#f0a030', '#ffd27a'),
  crystal: ramp('#0c3a52', '#1f86b0', '#3fc8e6', '#b8f6ff'),
  hoof: ramp('#1a1622', '#3a3448', '#564e68', '#7a7290'),
  saddle: ramp('#123236', '#1f6a68', '#2c9e94', '#6ed6c2'),
  trim: GOLD,
  eye: flat('#1c1424'), eyeHi: flat('#ffffff'),
};
