// Palette and type taken from the Lateling landing page stylesheet.
export const theme = {
  bg: '#ffffff',
  paper: '#f7f3ec',
  surface: '#fffdf9',
  sunken: '#efe9de',
  line: '#e2d9ca',
  lineStrong: '#8f8470',
  ink: '#2a2520',
  inkMuted: '#5c5347',
  inkSubtle: '#716757',
  primary: '#2f5b45',
  primaryTint: '#e3ede5',
  primaryLine: '#cfdfd3',
  clay: '#a8512f',
  clayTint: '#f6ddd2',
  shadow: '0 1px 2px rgba(42,37,32,0.08), 0 1px 1px rgba(42,37,32,0.04)',
  shadowLift: '0 4px 8px rgba(42,37,32,0.06), 0 24px 60px rgba(42,37,32,0.14)',
};

export const VIDEO = {width: 1080, height: 1920, fps: 30};

// Space kept clear for the Instagram / YouTube Shorts interface.
// Top: account row and search. Bottom: caption, audio row and nav. Right: like/comment/share column.
export const SAFE = {top: 240, bottom: 430, side: 64, rightRail: 150};

// The box that UI mock-ups live in.
export const STAGE = {
  left: SAFE.side,
  top: SAFE.top,
  width: VIDEO.width - SAFE.side * 2,
  height: 1000,
};

export const LANDING_URL = 'lateling-site.godhustler90956.workers.dev';
export const END_CARD_LINE = 'Free plan on the Shopify App Store';
export const MAKER = 'buildwithsud';
