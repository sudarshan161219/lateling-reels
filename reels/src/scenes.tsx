import React from 'react';
import {AppWindow} from './components/AppWindow';
import {BrowserTabs} from './components/BrowserTabs';
import {FindOrderSearch} from './components/FindOrderSearch';
import {GmailSidePanel} from './components/GmailSidePanel';
import {MailIcon} from './components/Icons';
import {NeedsAttentionList} from './components/NeedsAttentionList';
import {OrderCard} from './components/OrderCard';
import {SceneLabel, Stage, useEnter} from './components/primitives';
import {ReplyTemplate, variableCount} from './components/ReplyTemplate';
import type {Order, Template} from './schemas';
import {theme} from './theme';

/** Scenes run over three equal steps of `step` frames, so captions can change with each step. */
type Steps = {step: number};

/** The manual way: a customer email, then six tabs opened one after another. */
export const PainScene: React.FC<{
  email: {fromName: string; subject: string; body: string};
  tabs: string[];
  frames: number;
}> = ({email, tabs, frames}) => {
  const p = useEnter(0);
  const startAt = 14;
  const every = Math.floor((frames - startAt - 12) / tabs.length);
  return (
    <Stage>
      <SceneLabel text="Without Lateling" />
      <div
        style={{
          background: theme.surface,
          border: `2px solid ${theme.line}`,
          borderRadius: 24,
          boxShadow: theme.shadow,
          padding: '22px 26px',
          display: 'flex',
          gap: 20,
          marginBottom: 24,
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: theme.sunken,
            color: theme.inkMuted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MailIcon size={38} />
        </div>
        <div style={{minWidth: 0}}>
          <div style={{fontSize: 26, color: theme.inkMuted}}>{email.fromName}</div>
          <div style={{fontSize: 34, fontWeight: 700, lineHeight: 1.25, marginTop: 2}}>{email.subject}</div>
          <div style={{fontSize: 28, lineHeight: 1.4, marginTop: 8, color: theme.ink}}>{email.body}</div>
        </div>
      </div>
      <BrowserTabs tabs={tabs} startAt={startAt} every={every} height={560} />
    </Stage>
  );
};

/** Find an order: type the email, see the customer, see the order. */
export const FindOrderScene: React.FC<Steps & {order: Order; label?: string}> = ({order, step, label}) => {
  const cardAt = step * 2;
  return (
    <Stage>
      {label ? <SceneLabel text={label} tone="brand" /> : null}
      <AppWindow activeTab="Find an order">
        <FindOrderSearch
          order={order}
          query={order.customerEmail}
          typeFrom={Math.max(16, step - 8 - 70)}
          typeTo={step - 8}
          resultAt={step}
          highlightCustomerAt={step + 10}
          highlightCustomerUntil={cardAt - 6}
        />
        <Reveal at={cardAt}>
          <OrderCard order={order} compact highlightStatusAt={cardAt + 12} style={{marginTop: 20}} />
        </Reveal>
      </AppWindow>
    </Stage>
  );
};

/** Reply template: variables visible, then filled from the order, then copied. */
export const ReplyTemplateScene: React.FC<Steps & {order: Order; template: Template; label?: string}> = ({
  order,
  template,
  step,
  label,
}) => {
  const n = Math.max(1, variableCount(template.body));
  const fillEvery = Math.max(3, Math.min(8, Math.floor((step - 12) / n)));
  return (
    <Stage justify="flex-start">
      {label ? <SceneLabel text={label} tone="brand" /> : null}
      <AppWindow activeTab="Find an order">
        <ReplyTemplate order={order} template={template} fillFrom={step} fillEvery={fillEvery} copiedAt={step * 2 + 14} />
      </AppWindow>
    </Stage>
  );
};

/** Needs attention: the list, the "Possibly late" flags, then copy a reply. */
export const NeedsAttentionScene: React.FC<Steps & {orders: Order[]; label?: string; copy?: boolean}> = ({
  orders,
  step,
  label,
  copy = true,
}) => (
  <Stage>
    {label ? <SceneLabel text={label} tone="brand" /> : null}
    <AppWindow activeTab="Needs attention">
      <NeedsAttentionList
        orders={orders}
        appearAt={6}
        highlightFlagsAt={step + 4}
        highlightFlagsUntil={step * 2 - 4}
        copiedAt={copy ? step * 2 + 20 : undefined}
      />
    </AppWindow>
  </Stage>
);

/** Order detail: the whole order, the delivery status, then tracking and Copy summary. */
export const OrderDetailScene: React.FC<Steps & {order: Order}> = ({order, step}) => (
  <Stage>
    <AppWindow activeTab="Find an order">
      <OrderCard
        order={order}
        highlightStatusAt={step + 4}
        highlightStatusUntil={step * 2 - 4}
        highlightTrackingAt={step * 2 + 2}
        highlightTrackingUntil={step * 2 + 26}
        copiedAt={step * 2 + 40}
      />
    </AppWindow>
  </Stage>
);

/** Gmail add-on: the panel next to the email, the status, then Insert. */
export const GmailPanelScene: React.FC<Steps & {order: Order; template: Template}> = ({order, template, step}) => (
  <Stage>
    <GmailSidePanel
      order={order}
      template={template}
      emailBody="Hi, I still have not received my order. Can you tell me where it is?"
      panelAt={10}
      highlightStatusAt={step + 4}
      highlightStatusUntil={step * 2 - 4}
      insertAt={step * 2 + 22}
    />
  </Stage>
);

const Reveal: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const p = useEnter(at);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>{children}</div>;
};
