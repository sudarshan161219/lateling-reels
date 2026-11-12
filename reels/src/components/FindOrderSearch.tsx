import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import type {Order} from '../schemas';
import {theme} from '../theme';
import {Card} from './AppWindow';
import {CheckIcon, SearchIcon} from './Icons';
import {ClickTarget, Highlight, useEnter} from './primitives';

/**
 * "Find an order": a search box that types `query`, then the customer card
 * with order count and total spent.
 */
export const FindOrderSearch: React.FC<{
  order: Order;
  query: string;
  /** Typing runs from `typeFrom` to `typeTo`. */
  typeFrom: number;
  typeTo: number;
  /** Frame at which the customer card appears. */
  resultAt: number;
  highlightCustomerAt?: number;
  highlightCustomerUntil?: number;
}> = ({order: o, query, typeFrom, typeTo, resultAt, highlightCustomerAt, highlightCustomerUntil}) => {
  const frame = useCurrentFrame();
  const chars = Math.round(
    interpolate(frame, [typeFrom, typeTo], [0, query.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  const focused = frame >= typeFrom - 4;
  const caret = focused && frame < resultAt && Math.floor(frame / 8) % 2 === 0;
  const p = useEnter(resultAt);
  const stats = (
    <span style={{fontSize: 29, color: theme.inkMuted}}>
      {o.customerOrderCount} {o.customerOrderCount === 1 ? 'order' : 'orders'} · {o.customerTotalSpent} spent
    </span>
  );
  return (
    <div>
      <ClickTarget block clickAt={typeFrom - 4} from={[160, 420]}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          height: 88,
          padding: '0 24px',
          borderRadius: 16,
          background: theme.surface,
          border: `3px solid ${focused ? theme.primary : theme.lineStrong}`,
          fontSize: 31,
        }}
      >
        <SearchIcon size={36} color={theme.inkMuted} />
        {chars === 0 ? (
          <span style={{color: theme.inkSubtle}}>Email, name or order number</span>
        ) : (
          <span>{query.slice(0, chars)}</span>
        )}
        <span style={{width: 3, height: 40, marginLeft: -12, background: caret ? theme.ink : 'transparent'}} />
      </div>
      </ClickTarget>

      <Card style={{marginTop: 20, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
          <div>
            <div style={{fontSize: 36, fontWeight: 700, lineHeight: 1.25}}>{o.customerName}</div>
            <div style={{marginTop: 8}}>
              {highlightCustomerAt === undefined ? (
                stats
              ) : (
                <Highlight at={highlightCustomerAt} until={highlightCustomerUntil} pad={10}>
                  {stats}
                </Highlight>
              )}
            </div>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 28,
              fontWeight: 700,
              color: theme.primary,
              background: theme.primaryTint,
              border: `2px solid ${theme.primary}`,
              borderRadius: 999,
              padding: '12px 22px',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckIcon size={26} strokeWidth={2.6} />
            {o.orderNumber}
          </span>
        </div>
      </Card>
    </div>
  );
};
