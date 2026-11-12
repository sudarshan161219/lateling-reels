import React from 'react';
import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import type {Order} from '../schemas';
import {theme} from '../theme';
import {Button, Card, LateFlag, STATUS_LABEL} from './AppWindow';
import {ClickTarget, Highlight} from './primitives';

/**
 * The "Needs attention" list: orders that are not shipped after the merchant's limit,
 * or that the carrier reports delayed. Rows are shown in the order given (oldest first).
 */
export const NeedsAttentionList: React.FC<{
  orders: Order[];
  /** Frame at which the first row appears. */
  appearAt?: number;
  /** Frame at which the "Possibly late" flags get a ring. */
  highlightFlagsAt?: number;
  highlightFlagsUntil?: number;
  /** Frame at which the first row's "Copy reply" turns into "Copied". */
  copiedAt?: number;
}> = ({orders, appearAt = 0, highlightFlagsAt, highlightFlagsUntil, copiedAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const late = orders.filter((o) => o.possiblyLate).length;
  return (
    <div>
      <div style={{fontSize: 27, color: theme.inkMuted, lineHeight: 1.4}}>
        Orders from the last 60 days. Oldest first.
      </div>
      <div style={{fontSize: 34, fontWeight: 700, margin: '20px 0 18px'}}>
        Possibly late <span style={{fontWeight: 400, color: theme.inkMuted}}>({late})</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
        {orders.map((o, i) => {
          const p = spring({frame: frame - appearAt - i * 6, fps, config: {damping: 200}});
          const flag = <LateFlag />;
          return (
            <Card
              key={o.orderNumber}
              style={{
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px)`,
                position: 'relative',
                zIndex: i === 0 ? 2 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div style={{minWidth: 0}}>
                <div style={{fontSize: 34, lineHeight: 1.3, whiteSpace: 'nowrap'}}>
                  <span style={{color: theme.primary, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 6}}>
                    {o.orderNumber}
                  </span>
                  <span style={{color: theme.inkMuted}}> · {o.customerName}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 12}}>
                  <span style={{fontSize: 29, fontWeight: 700, whiteSpace: 'nowrap'}}>{STATUS_LABEL[o.deliveryStatus]}</span>
                  {o.possiblyLate ? (
                    highlightFlagsAt !== undefined ? (
                      <Highlight at={highlightFlagsAt + i * 5} until={highlightFlagsUntil} radius={999} pad={8}>
                        {flag}
                      </Highlight>
                    ) : (
                      flag
                    )
                  ) : null}
                </div>
                <div style={{fontSize: 26, color: theme.inkMuted, marginTop: 12, lineHeight: 1.3}}>{o.timeline}</div>
              </div>
              <ClickTarget clickAt={i === 0 ? copiedAt : undefined} from={[-260, 300]}>
                <Button label="Copy reply" done={i === 0 && copiedAt !== undefined && frame >= copiedAt} size={26} />
              </ClickTarget>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
