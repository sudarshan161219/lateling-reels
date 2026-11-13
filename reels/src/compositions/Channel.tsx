import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LatelingMark} from '../components/Icons';
import {sans, serif} from '../fonts';
import {theme} from '../theme';

// YouTube channel art. Rendered as stills:
//   npx remotion still src/index.ts ChannelBanner out/channel-banner.png
//   npx remotion still src/index.ts ChannelAvatar out/channel-avatar.png

export const BANNER = {width: 2560, height: 1440};
// The part of the banner every device shows. Desktop also shows the full width of this band.
const BAND = {top: 508, height: 423};
const SAFE_W = 1546;

const ORDERS = [
  {n: '#1038', status: 'Not shipped', note: 'Ordered 9 days ago', late: true},
  {n: '#1042', status: 'Delayed', note: 'UPS · Was due Nov 4', late: true},
  {n: '#1051', status: 'In transit', note: 'USPS · Due Nov 14', late: false},
  {n: '#1047', status: 'Delayed', note: 'USPS · Was due Oct 30', late: true},
  {n: '#1055', status: 'Out for delivery', note: 'FedEx · Today', late: false},
  {n: '#1060', status: 'Delivered', note: 'DHL · Nov 9', late: false},
];

const OrderRow: React.FC<(typeof ORDERS)[number]> = ({n, status, note, late}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      background: theme.surface,
      border: `2px solid ${theme.line}`,
      borderRadius: 18,
      padding: '18px 24px',
      boxShadow: theme.shadow,
      width: 410,
    }}
  >
    <div style={{fontWeight: 700, fontSize: 30, color: theme.ink}}>{n}</div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1}}>
      <div
        style={{
          alignSelf: 'flex-start',
          fontSize: 22,
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: 999,
          background: late ? theme.clayTint : theme.primaryTint,
          color: late ? theme.clay : theme.primary,
        }}
      >
        {status}
      </div>
      <div style={{fontSize: 21, color: theme.inkSubtle}}>{note}</div>
    </div>
  </div>
);

const Column: React.FC<{rows: (typeof ORDERS)[number][]; side: 'left' | 'right'}> = ({rows, side}) => (
  <div
    style={{
      position: 'absolute',
      top: BAND.top + 26,
      [side]: 50,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      opacity: 0.9,
    }}
  >
    {rows.map((o) => (
      <OrderRow key={o.n} {...o} />
    ))}
  </div>
);

export const ChannelBanner: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, ${theme.sunken} 0%, ${theme.paper} 50%, ${theme.sunken} 100%)`,
      fontFamily: sans,
      color: theme.ink,
    }}
  >
    <Column rows={ORDERS.slice(0, 3)} side="left" />
    <Column rows={ORDERS.slice(3)} side="right" />
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
      <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
        <LatelingMark size={150} />
        <div style={{fontFamily: serif, fontWeight: 700, fontSize: 150, letterSpacing: '-0.02em', lineHeight: 1}}>
          Lateling
        </div>
      </div>
      <div style={{marginTop: 40, fontSize: 44, fontWeight: 500, color: theme.inkMuted, textAlign: 'center'}}>
        Short videos on late orders and “where is my order?” emails
      </div>
    </div>
  </AbsoluteFill>
);

export const AVATAR = {width: 800, height: 800};

/** The mark on a full green square. YouTube crops it to a circle. */
export const ChannelAvatar: React.FC = () => (
  <AbsoluteFill style={{background: theme.primary, alignItems: 'center', justifyContent: 'center'}}>
    <svg width={520} height={520} viewBox="8 8 32 32">
      <path
        d="M8 24s6-10 16-10 16 10 16 10-6 10-16 10S8 24 8 24Z"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinejoin="round"
        transform="translate(24 24) scale(0.82) translate(-24 -24)"
      />
      <circle cx="24" cy="24" r="4.6" fill="#fff" />
    </svg>
  </AbsoluteFill>
);
