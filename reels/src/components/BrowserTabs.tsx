import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../theme';
import {SearchIcon} from './Icons';

/** Frame at which tab `i` opens. */
export const tabOpensAt = (i: number, startAt: number, every: number) => startAt + i * every;

/**
 * A plain browser window where tabs pile up one by one: the manual way to answer
 * a "where is my order?" email. Generic chrome, no product branding.
 */
export const BrowserTabs: React.FC<{tabs: string[]; startAt: number; every: number; height?: number}> = ({
  tabs,
  startAt,
  every,
  height = 600,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const open = Math.max(1, Math.min(tabs.length, Math.floor((frame - startAt) / every) + 1));
  const active = open - 1;
  const sinceSwitch = frame - tabOpensAt(active, startAt, every);
  const pageIn = spring({frame: sinceSwitch, fps, config: {damping: 200}});
  return (
    <div
      style={{
        height,
        background: '#fff',
        border: `2px solid ${theme.line}`,
        borderRadius: 28,
        boxShadow: theme.shadowLift,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 6, background: theme.sunken, padding: '16px 14px 0', height: 86}}>
        {tabs.slice(0, open).map((t, i) => {
          const p = spring({frame: frame - tabOpensAt(i, startAt, every), fps, config: {damping: 200}});
          const on = i === active;
          return (
            <div
              key={i}
              style={{
                flex: `${p} 1 0`,
                minWidth: 0,
                maxWidth: 300,
                height: 70,
                borderRadius: '16px 16px 0 0',
                background: on ? '#fff' : theme.line,
                color: on ? theme.ink : theme.inkMuted,
                fontSize: 24,
                fontWeight: on ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                padding: '0 14px',
                opacity: p,
              }}
            >
              <span style={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{t}</span>
            </div>
          );
        })}
      </div>

      <div style={{flex: 1, padding: '34px 36px', opacity: 0.3 + 0.7 * pageIn, position: 'relative'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{fontSize: 42, fontWeight: 700}}>{tabs[active]}</div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: theme.clay,
              background: theme.clayTint,
              borderRadius: 999,
              padding: '10px 22px',
              whiteSpace: 'nowrap',
            }}
          >
            Tab {open} of {tabs.length}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            height: 76,
            borderRadius: 14,
            border: `2px solid ${theme.line}`,
            marginTop: 28,
            padding: '0 20px',
            color: theme.inkSubtle,
            fontSize: 28,
          }}
        >
          <SearchIcon size={32} />
          Searching…
        </div>
        {[0.92, 0.7, 0.84, 0.56].map((w, i) => {
          const widths = [w, 1.5 - w, w * 0.8 + 0.1];
          return (
            <div
              key={i}
              style={{
                height: 30,
                width: `${widths[active % 3] * 100}%`,
                maxWidth: '100%',
                borderRadius: 10,
                background: theme.sunken,
                marginTop: 28,
                opacity: sinceSwitch > i * 3 ? 1 : 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
