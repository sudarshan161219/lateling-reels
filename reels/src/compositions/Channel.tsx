import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LatelingMark} from '../components/Icons';
import {mono, sans} from '../fonts';
import {theme} from '../theme';

// YouTube channel art for the developer channel. Rendered as stills:
//   npx remotion still src/index.ts ChannelBanner out/channel-banner.png
//   npx remotion still src/index.ts ChannelAvatar out/channel-avatar.png

const NAME = {lead: 'buildwith', handle: 'sud'};
const TAGLINE = 'I build small apps and tools. Short videos on how they work.';

// Shown on the left of the banner (desktop and TV only). Add a row for each new product.
const PROJECTS: {name: string; kind: string; status: string; live: boolean; mark?: 'lateling'}[] = [
  {name: 'Lateling', kind: 'Shopify app', status: 'Live', live: true, mark: 'lateling'},
  {name: 'Next app', kind: 'Coming soon', status: 'Building', live: false},
];

const TERMINAL = ['$ git commit -m "ship it"', '$ npm run build', '✓ done'];

export const BANNER = {width: 2560, height: 1440};
// The part of the banner every device shows. Desktop also shows the full width of this band.
const BAND = {top: 508, height: 423};
const SAFE_W = 1546;
const SIDE_W = 420;

const Card: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      background: dark ? theme.ink : theme.surface,
      border: `2px solid ${dark ? theme.ink : theme.line}`,
      borderRadius: 18,
      padding: '20px 24px',
      boxShadow: theme.shadow,
      width: SIDE_W,
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

const Side: React.FC<{side: 'left' | 'right'; children: React.ReactNode}> = ({side, children}) => (
  <div
    style={{
      position: 'absolute',
      top: BAND.top,
      height: BAND.height,
      [side]: 50,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 18,
    }}
  >
    {children}
  </div>
);

const Placeholder: React.FC = () => (
  <div
    style={{
      width: 64,
      height: 64,
      borderRadius: 15,
      border: `3px dashed ${theme.lineStrong}`,
      flexShrink: 0,
      boxSizing: 'border-box',
    }}
  />
);

export const ChannelBanner: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, ${theme.sunken} 0%, ${theme.paper} 50%, ${theme.sunken} 100%)`,
      fontFamily: sans,
      color: theme.ink,
    }}
  >
    <Side side="left">
      {PROJECTS.map((p) => (
        <Card key={p.name}>
          {p.mark === 'lateling' ? <LatelingMark size={64} /> : <Placeholder />}
          <div style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1}}>
            <div style={{fontWeight: 700, fontSize: 30}}>{p.name}</div>
            <div style={{fontSize: 22, color: theme.inkSubtle}}>{p.kind}</div>
          </div>
          <div
            style={{
              fontSize: 21,
              fontWeight: 600,
              padding: '5px 14px',
              borderRadius: 999,
              background: p.live ? theme.primaryTint : theme.sunken,
              color: p.live ? theme.primary : theme.inkMuted,
            }}
          >
            {p.status}
          </div>
        </Card>
      ))}
    </Side>
    <Side side="right">
      <Card dark>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12, fontFamily: mono, fontSize: 24}}>
          {TERMINAL.map((line) => (
            <div key={line} style={{color: line.startsWith('✓') ? '#9fd3b0' : '#f7f3ec', whiteSpace: 'nowrap'}}>
              {line}
            </div>
          ))}
        </div>
      </Card>
    </Side>
    <div
      style={{
        position: 'absolute',
        top: BAND.top,
        height: BAND.height,
        left: (BANNER.width - SAFE_W) / 2,
        width: SAFE_W,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{fontFamily: mono, fontWeight: 500, fontSize: 150, letterSpacing: '-0.03em', lineHeight: 1}}>
        <span style={{color: theme.inkSubtle}}>{NAME.lead}</span>
        <span style={{color: theme.ink}}>{NAME.handle}</span>
        <span style={{color: theme.primary}}>_</span>
      </div>
      <div style={{marginTop: 44, fontSize: 44, fontWeight: 500, color: theme.inkMuted, textAlign: 'center'}}>
        {TAGLINE}
      </div>
    </div>
  </AbsoluteFill>
);

export const AVATAR = {width: 800, height: 800};

/** "sud_" on a dark square. YouTube crops it to a circle. */
export const ChannelAvatar: React.FC = () => (
  <AbsoluteFill style={{background: theme.ink, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{fontFamily: mono, fontWeight: 500, fontSize: 250, letterSpacing: '-0.04em', lineHeight: 1, marginLeft: 20}}>
      <span style={{color: theme.paper}}>sud</span>
      <span style={{color: '#7fbf95'}}>_</span>
    </div>
  </AbsoluteFill>
);
