import React from 'react';
import {serif} from '../fonts';
import type {Order} from '../schemas';
import {theme} from '../theme';
import {CheckIcon, WarningIcon} from './Icons';

export const STATUS_LABEL: Record<Order['deliveryStatus'], string> = {
  not_shipped: 'Not shipped yet',
  in_transit: 'In transit',
  out_for_delivery: 'Out for delivery',
  delayed: 'Delayed',
  delivered: 'Delivered',
};

const TABS = ['Needs attention', 'Find an order', 'Settings', 'Plan'] as const;

/** The Lateling page frame: name, tabs, content. Mirrors the app's admin page, without any platform chrome. */
export const AppWindow: React.FC<{
  activeTab: (typeof TABS)[number];
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({activeTab, children, style}) => (
  <div
    style={{
      background: theme.paper,
      border: `2px solid ${theme.line}`,
      borderRadius: 32,
      boxShadow: theme.shadowLift,
      padding: '30px 36px 36px',
      position: 'relative',
      ...style,
    }}
  >
    <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
      <div style={{fontFamily: serif, fontWeight: 700, fontSize: 52, lineHeight: 1.2}}>Lateling</div>
      <div style={{fontSize: 26, color: theme.inkMuted}}>fern-and-fable</div>
    </div>
    <div style={{display: 'flex', gap: 38, borderBottom: `2px solid ${theme.line}`, marginTop: 14, marginBottom: 28}}>
      {TABS.map((t) => (
        <div
          key={t}
          style={{
            fontSize: 28,
            fontWeight: 600,
            padding: '10px 4px 16px',
            marginBottom: -2,
            whiteSpace: 'nowrap',
            color: t === activeTab ? theme.primary : theme.inkMuted,
            borderBottom: `4px solid ${t === activeTab ? theme.primary : 'transparent'}`,
          }}
        >
          {t}
        </div>
      ))}
    </div>
    {children}
  </div>
);

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      background: theme.surface,
      border: `2px solid ${theme.line}`,
      borderRadius: 22,
      boxShadow: theme.shadow,
      padding: '24px 28px',
      ...style,
    }}
  >
    {children}
  </div>
);

export const LateFlag: React.FC<{size?: number}> = ({size = 28}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      background: theme.clayTint,
      color: theme.clay,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1,
      padding: `${size * 0.32}px ${size * 0.6}px`,
      borderRadius: 999,
      whiteSpace: 'nowrap',
    }}
  >
    <WarningIcon size={size} strokeWidth={2.2} />
    Possibly late
  </span>
);

/** Outline or filled button. When `doneLabel` is given and `done` is true it shows a check mark. */
export const Button: React.FC<{
  label: string;
  primary?: boolean;
  done?: boolean;
  doneLabel?: string;
  icon?: React.ReactNode;
  size?: number;
}> = ({label, primary, done, doneLabel = 'Copied', icon, size = 28}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      padding: `${size * 0.62}px ${size * 0.9}px`,
      borderRadius: 14,
      border: `2px solid ${done || primary ? theme.primary : theme.lineStrong}`,
      background: done ? theme.primaryTint : primary ? theme.primary : theme.surface,
      color: done ? theme.primary : primary ? '#fff' : theme.ink,
    }}
  >
    {done ? <CheckIcon size={size} strokeWidth={2.6} /> : icon}
    {done ? doneLabel : label}
  </span>
);
