import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {mono} from '../fonts';
import type {Order, Template} from '../schemas';
import {theme} from '../theme';
import {Button, Card, STATUS_LABEL} from './AppWindow';
import {CopyIcon} from './Icons';
import {ClickTarget} from './primitives';

/** Variables a template body may use. Anything else, or anything without a value, stays visible. */
export const TEMPLATE_VARIABLES = [
  'first_name',
  'customer_name',
  'order_name',
  'order_total',
  'items',
  'shipping_address',
  'carrier',
  'tracking_number',
  'delivery_status',
  'estimated_delivery',
  'fulfillment_status',
  'signoff',
] as const;

export const variableValues = (o: Order, t: Template): Record<string, string | undefined> => ({
  first_name: o.customerName.split(' ')[0],
  customer_name: o.customerName,
  order_name: o.orderNumber,
  order_total: o.total,
  items: o.items.map((i) => `${i.quantity} × ${i.name}`).join(', '),
  shipping_address: o.shippingAddress,
  carrier: o.carrier,
  tracking_number: o.trackingNumber,
  delivery_status: STATUS_LABEL[o.deliveryStatus].toLowerCase(),
  estimated_delivery: o.estimatedDelivery,
  fulfillment_status: o.fulfillmentStatus.toLowerCase(),
  signoff: t.signOff,
});

type Part = {text: string; variable?: string; index?: number};

const parse = (body: string): Part[] => {
  let n = 0;
  return body
    .split(/(\{\{\s*[a-z_]+\s*\}\})/g)
    .filter(Boolean)
    .map((text) => {
      const m = text.match(/^\{\{\s*([a-z_]+)\s*\}\}$/);
      return m ? {text, variable: m[1], index: n++} : {text};
    });
};

/**
 * Template text where each {{variable}} is replaced by the order's value, one after another.
 * Before `fillFrom` every variable shows as a token. A variable with no value stays a token.
 */
export const TemplateBody: React.FC<{
  order: Order;
  template: Template;
  fillFrom: number;
  fillEvery?: number;
  fontSize?: number;
}> = ({order, template, fillFrom, fillEvery = 7, fontSize = 28}) => {
  const frame = useCurrentFrame();
  const values = variableValues(order, template);
  return (
    <div style={{fontSize, lineHeight: 1.55, whiteSpace: 'pre-wrap', color: theme.ink}}>
      {parse(template.body).map((part, i) => {
        if (!part.variable) return <span key={i}>{part.text}</span>;
        const value = values[part.variable];
        const at = fillFrom + (part.index ?? 0) * fillEvery;
        if (value === undefined || frame < at) {
          return (
            <span
              key={i}
              style={{
                fontFamily: mono,
                fontSize: fontSize * 0.78,
                color: theme.clay,
                background: theme.clayTint,
                borderRadius: 8,
                padding: '3px 8px',
              }}
            >
              {`{{${part.variable}}}`}
            </span>
          );
        }
        const glow = interpolate(frame, [at, at + 18], [1, 0.35], {extrapolateRight: 'clamp'});
        return (
          <span
            key={i}
            style={{
              fontWeight: 600,
              color: theme.primary,
              background: `rgba(47,91,69,${0.2 * glow})`,
              borderRadius: 8,
              padding: '2px 6px',
              margin: '0 -2px',
            }}
          >
            {value}
          </span>
        );
      })}
    </div>
  );
};

export const variableCount = (body: string) => parse(body).filter((p) => p.variable).length;

/** A reply template card with a "Copy reply" button. */
export const ReplyTemplate: React.FC<{
  order: Order;
  template: Template;
  fillFrom: number;
  fillEvery?: number;
  copiedAt?: number;
  style?: React.CSSProperties;
}> = ({order, template, fillFrom, fillEvery, copiedAt, style}) => {
  const frame = useCurrentFrame();
  return (
    <Card style={{padding: '28px 30px', ...style}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18}}>
        <div style={{fontSize: 34, fontWeight: 700}}>{template.name}</div>
        <div style={{fontSize: 24, color: theme.inkMuted, whiteSpace: 'nowrap'}}>Reply for {order.orderNumber}</div>
      </div>
      <div style={{background: theme.paper, border: `2px solid ${theme.line}`, borderRadius: 16, padding: '22px 24px'}}>
        <TemplateBody order={order} template={template} fillFrom={fillFrom} fillEvery={fillEvery} />
      </div>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 22}}>
        <ClickTarget clickAt={copiedAt} from={[-360, 160]}>
          <Button
            label="Copy reply"
            primary
            icon={<CopyIcon size={28} />}
            done={copiedAt !== undefined && frame >= copiedAt}
          />
        </ClickTarget>
      </div>
    </Card>
  );
};
