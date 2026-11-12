import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {Order} from '../schemas';
import {theme} from '../theme';
import {Card, LateFlag, STATUS_LABEL} from './AppWindow';
import {BoxIcon, CheckIcon, ClockIcon, CopyIcon, TruckIcon} from './Icons';
import {ClickTarget, Highlight} from './primitives';

const StatusIcon: React.FC<{status: Order['deliveryStatus']}> = ({status}) => {
  const late = status === 'delayed';
  const Icon =
    status === 'delivered' ? CheckIcon : status === 'not_shipped' ? BoxIcon : status === 'delayed' ? ClockIcon : TruckIcon;
  return (
    <div
      style={{
        width: 92,
        height: 92,
        borderRadius: 46,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: late ? theme.clayTint : theme.primaryTint,
        color: late ? theme.clay : theme.primary,
      }}
    >
      <Icon size={48} />
    </div>
  );
};

const wrap = (node: React.ReactNode, at: number | undefined, until?: number) =>
  at === undefined ? node : <Highlight at={at} until={until} pad={12}>{node}</Highlight>;

/**
 * One order: delivery status first, then payment, items, address and tracking.
 * `compact` leaves out the address and the footer.
 */
export const OrderCard: React.FC<{
  order: Order;
  compact?: boolean;
  highlightStatusAt?: number;
  highlightStatusUntil?: number;
  highlightTrackingAt?: number;
  highlightTrackingUntil?: number;
  /** Frame at which "Copy summary" turns into "Copied". */
  copiedAt?: number;
  style?: React.CSSProperties;
}> = ({
  order: o,
  compact,
  highlightStatusAt,
  highlightStatusUntil,
  highlightTrackingAt,
  highlightTrackingUntil,
  copiedAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const copied = copiedAt !== undefined && frame >= copiedAt;
  const detail = o.estimatedDelivery ? `${o.timeline} · Estimated delivery ${o.estimatedDelivery}` : o.timeline;
  return (
    <Card style={{padding: '26px 30px', ...style}}>
      <div style={{fontSize: 27, color: theme.inkMuted, lineHeight: 1.3}}>
        Order{' '}
        <span style={{color: theme.primary, fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 6}}>
          {o.orderNumber}
        </span>{' '}
        · {o.orderDate} · <span style={{color: theme.ink, fontWeight: 700}}>{o.total}</span>
      </div>

      <div style={{marginTop: 22}}>
        {wrap(
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <StatusIcon status={o.deliveryStatus} />
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <span style={{fontSize: 44, fontWeight: 700, lineHeight: 1.15}}>{STATUS_LABEL[o.deliveryStatus]}</span>
                {o.possiblyLate ? <LateFlag size={24} /> : null}
              </div>
              <div style={{fontSize: 27, color: theme.inkMuted, lineHeight: 1.35, marginTop: 6, maxWidth: 620}}>{detail}</div>
            </div>
          </div>,
          highlightStatusAt,
          highlightStatusUntil,
        )}
      </div>

      <div style={{fontSize: 26, color: theme.inkMuted, marginTop: 22}}>
        {o.fulfillmentStatus} · {o.paymentStatus}
      </div>
      <div style={{marginTop: 10}}>
        {o.items.map((it) => (
          <div key={it.name} style={{fontSize: 31, lineHeight: 1.45}}>
            {it.quantity} × {it.name}
          </div>
        ))}
      </div>
      {compact ? null : (
        <div style={{fontSize: 26, color: theme.inkMuted, marginTop: 12, lineHeight: 1.35}}>Ship to {o.shippingAddress}</div>
      )}

      {o.trackingNumber ? (
        <div style={{marginTop: 18}}>
          {wrap(
            <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 29}}>
              <TruckIcon size={34} color={theme.inkMuted} />
              <span style={{color: theme.inkMuted}}>{o.carrier}</span>
              <span style={{color: theme.primary, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 6}}>
                {o.trackingNumber}
              </span>
            </div>,
            highlightTrackingAt,
            highlightTrackingUntil,
          )}
        </div>
      ) : null}

      {compact ? null : (
        <div
          style={{
            borderTop: `2px solid ${theme.line}`,
            marginTop: 22,
            paddingTop: 20,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <ClickTarget clickAt={copiedAt} from={[-320, 200]}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 29,
              fontWeight: 700,
              color: theme.primary,
              background: copied ? theme.primaryTint : 'transparent',
              padding: '10px 18px',
              borderRadius: 12,
            }}
          >
            {copied ? <CheckIcon size={30} strokeWidth={2.6} /> : <CopyIcon size={30} />}
            {copied ? 'Copied' : 'Copy summary'}
          </span>
          </ClickTarget>
        </div>
      )}
    </Card>
  );
};
