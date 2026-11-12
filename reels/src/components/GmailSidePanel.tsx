import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {Order, Template} from '../schemas';
import {theme} from '../theme';
import {STATUS_LABEL} from './AppWindow';
import {CheckIcon, InsertIcon, TruckIcon} from './Icons';
import {ClickTarget, Highlight, useEnter} from './primitives';
import {TemplateBody} from './ReplyTemplate';

/**
 * A customer email with the Lateling side panel next to it. A generic mail layout,
 * no mail provider branding. Clicking Insert drops the template into the reply draft.
 * Nothing is sent.
 */
export const GmailSidePanel: React.FC<{
  order: Order;
  template: Template;
  emailBody: string;
  /** Frame at which the panel slides in. */
  panelAt?: number;
  highlightStatusAt?: number;
  highlightStatusUntil?: number;
  /** Frame at which Insert is clicked and the reply draft fills in. */
  insertAt?: number;
}> = ({order: o, template, emailBody, panelAt = 0, highlightStatusAt, highlightStatusUntil, insertAt}) => {
  const frame = useCurrentFrame();
  const p = useEnter(panelAt);
  const inserted = insertAt !== undefined && frame >= insertAt;
  const status = (
    <div>
      <div style={{fontSize: 36, fontWeight: 700, lineHeight: 1.2}}>{STATUS_LABEL[o.deliveryStatus]}</div>
      <div style={{fontSize: 23, color: theme.inkMuted, lineHeight: 1.35, marginTop: 4}}>
        {o.timeline}
        {o.estimatedDelivery ? ` · Estimated delivery ${o.estimatedDelivery}` : ''}
      </div>
    </div>
  );
  return (
    <div
      style={{
        display: 'flex',
        height: 900,
        background: '#fff',
        border: `2px solid ${theme.line}`,
        borderRadius: 32,
        boxShadow: theme.shadowLift,
        overflow: 'hidden',
      }}
    >
      {/* the email */}
      <div style={{flex: 1, minWidth: 0, padding: '30px 26px', display: 'flex', flexDirection: 'column'}}>
        <div style={{fontSize: 30, fontWeight: 700, lineHeight: 1.25}}>Where is my order?</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 20}}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: theme.sunken,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 26,
              color: theme.inkMuted,
              flexShrink: 0,
            }}
          >
            {o.customerName[0]}
          </div>
          <div style={{minWidth: 0}}>
            <div style={{fontSize: 25, fontWeight: 600}}>{o.customerName}</div>
            <div style={{fontSize: 20, color: theme.inkSubtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {o.customerEmail}
            </div>
          </div>
        </div>
        <div style={{fontSize: 25, lineHeight: 1.5, marginTop: 20, color: theme.ink}}>{emailBody}</div>

        <div
          style={{
            marginTop: 'auto',
            border: `2px solid ${inserted ? theme.primary : theme.line}`,
            borderRadius: 18,
            padding: '18px 20px',
            minHeight: 430,
            background: theme.surface,
          }}
        >
          <div style={{fontSize: 21, color: theme.inkSubtle, marginBottom: 10}}>Reply draft</div>
          {inserted ? (
            <TemplateBody order={o} template={template} fillFrom={0} fillEvery={0} fontSize={23} />
          ) : (
            <div style={{width: 3, height: 32, background: Math.floor(frame / 8) % 2 ? theme.ink : 'transparent'}} />
          )}
        </div>
      </div>

      {/* the side panel */}
      <div
        style={{
          width: 468,
          background: theme.paper,
          borderLeft: `2px solid ${theme.line}`,
          padding: '26px 24px',
          transform: `translateX(${(1 - p) * 480}px)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{fontSize: 22, fontWeight: 600, color: theme.primary}}>Lateling</div>
        <div style={{fontSize: 32, fontWeight: 700, marginTop: 10, lineHeight: 1.2}}>{o.customerName}</div>
        <div style={{fontSize: 23, color: theme.inkMuted, marginTop: 4}}>
          {o.customerOrderCount} {o.customerOrderCount === 1 ? 'order' : 'orders'} · {o.customerTotalSpent} spent
        </div>

        <div
          style={{
            background: theme.surface,
            border: `2px solid ${theme.line}`,
            borderRadius: 18,
            padding: '18px 18px 20px',
            marginTop: 20,
          }}
        >
          <div style={{fontSize: 22, color: theme.inkMuted, marginBottom: 14}}>
            Replying about <b style={{color: theme.primary}}>{o.orderNumber}</b> · <b style={{color: theme.ink}}>{o.total}</b>
          </div>
          {highlightStatusAt === undefined ? (
            status
          ) : (
            <Highlight at={highlightStatusAt} until={highlightStatusUntil} block pad={10}>
              {status}
            </Highlight>
          )}
          <div style={{marginTop: 14}}>
            {o.items.map((it) => (
              <div key={it.name} style={{fontSize: 25, lineHeight: 1.45}}>
                {it.quantity} × {it.name}
              </div>
            ))}
          </div>
          {o.trackingNumber ? (
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 22}}>
              <TruckIcon size={28} color={theme.inkMuted} />
              <span style={{color: theme.inkMuted}}>{o.carrier}</span>
              <span style={{color: theme.primary, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 5}}>
                {o.trackingNumber}
              </span>
            </div>
          ) : null}
        </div>

        <div style={{marginTop: 'auto', borderTop: `2px solid ${theme.line}`, paddingTop: 18}}>
          <div style={{fontSize: 23, marginBottom: 6}}>
            <b>Insert a reply</b> <span style={{color: theme.inkMuted}}>for {o.orderNumber}</span>
          </div>
          {[template.name, 'Order has shipped'].map((name, i) => (
            <div
              key={name}
              style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '14px 0'}}
            >
              <span style={{fontSize: 25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{name}</span>
              <ClickTarget clickAt={i === 0 ? insertAt : undefined} from={[-300, -260]}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 25,
                  fontWeight: 700,
                  color: theme.primary,
                  background: i === 0 && inserted ? theme.primaryTint : 'transparent',
                  padding: '6px 12px',
                  borderRadius: 10,
                  whiteSpace: 'nowrap',
                }}
              >
                {i === 0 && inserted ? <CheckIcon size={26} strokeWidth={2.6} /> : <InsertIcon size={26} />}
                {i === 0 && inserted ? 'Inserted' : 'Insert'}
              </span>
              </ClickTarget>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
