import {z} from 'zod';

// ---- shared pieces ----

const hook = z.string().min(3).max(60).describe('Big text shown in the first second. Max 60 characters.');
const caption = z.string().min(3).max(80).describe('Burned-in caption. Max 80 characters.');

export const deliveryStatusSchema = z.enum([
  'not_shipped',
  'in_transit',
  'out_for_delivery',
  'delayed',
  'delivered',
]);

export const orderSchema = z.object({
  orderNumber: z.string().max(8).describe('Fake order number, for example "#1042".'),
  customerName: z.string().max(24),
  customerEmail: z.string().max(32).describe('Fake address on example.com.'),
  orderDate: z.string().max(14).describe('For example "Oct 25, 2026".'),
  total: z.string().max(10).describe('For example "$59.90".'),
  items: z
    .array(z.object({quantity: z.number().int().min(1).max(99), name: z.string().max(24)}))
    .min(1)
    .max(2),
  paymentStatus: z.string().max(16).describe('For example "Paid".'),
  fulfillmentStatus: z.string().max(16).describe('"Fulfilled" or "Unfulfilled".'),
  deliveryStatus: deliveryStatusSchema,
  timeline: z.string().max(44).describe('For example "Shipped 6 days ago · Was due Oct 30".'),
  estimatedDelivery: z.string().max(12).optional().describe('For example "Oct 28". Leave out if unknown.'),
  carrier: z.string().max(12).optional().describe('Real carrier name. Leave out if not shipped.'),
  trackingNumber: z.string().max(24).optional().describe('Fake tracking number. Leave out if not shipped.'),
  shippingAddress: z.string().max(48),
  possiblyLate: z.boolean(),
  customerOrderCount: z.number().int().min(1).max(999),
  customerTotalSpent: z.string().max(12).describe('For example "$109.80".'),
});

export const templateSchema = z.object({
  name: z.string().max(28).describe('Template name, for example "Where is my order?".'),
  body: z
    .string()
    .max(240)
    .describe('Reply text with {{variables}}. Use \\n for line breaks. Max 240 characters, at most 4 line breaks.'),
  signOff: z.string().max(40).describe('Value for {{signoff}}, for example "Priya at Fern & Fable".'),
});

export const audioSchema = z
  .object({
    musicSrc: z
      .string()
      .optional()
      .describe('File name inside reels/public (royalty-free track) or an https URL. Leave out for no music.'),
    musicVolume: z.number().min(0).max(1).default(0.12),
    voiceoverSrc: z
      .string()
      .optional()
      .describe('File name inside reels/public or an https URL. Leave out for no voiceover.'),
  })
  .default({musicVolume: 0.12});

/**
 * Optional AI voiceover: one spoken line per scene, in scene order, without the end card.
 * The end card line is fixed in scripts/voice.mjs.
 */
const voiceover = (lines: number, scenes: string) =>
  z
    .array(z.string().min(3).max(90))
    .length(lines)
    .optional()
    .describe(`Spoken lines, one per scene: ${scenes}. Max 90 characters each. Leave out for no voice.`);

const secs = (min: number, max: number, def: number) => z.number().min(min).max(max).default(def);

// ---- BeforeAfter (20 to 25 s) ----

export const beforeAfterSchema = z.object({
  hook,
  customerEmail: z.object({
    fromName: z.string().max(24),
    subject: z.string().max(40),
    body: z.string().max(120),
  }),
  painTabs: z
    .array(z.string().max(9))
    .length(6)
    .describe('Labels of the six tabs a merchant opens to answer by hand.'),
  painCaption: caption,
  findCaption: caption,
  replyCaption: caption,
  order: orderSchema,
  template: templateSchema,
  seconds: z
    .object({
      hook: secs(2, 3, 2.5),
      pain: secs(5, 7, 6),
      find: secs(4.5, 7, 5.5),
      reply: secs(4.5, 7, 5.5),
      endCard: secs(3, 4, 3.5),
    })
    .default({hook: 2.5, pain: 6, find: 5.5, reply: 5.5, endCard: 3.5}),
  voiceover: voiceover(4, 'hook, the manual way, find the order, the reply'),
  audio: audioSchema,
});

// ---- FeatureDemo (20 to 25 s) ----

export const featureSchema = z.enum([
  'needs-attention',
  'find-order',
  'order-detail',
  'reply-template',
  'gmail-panel',
]);

export const featureDemoSchema = z.object({
  feature: featureSchema,
  hook,
  steps: z.array(caption).length(3).describe('One caption per step. Each feature has exactly three steps.'),
  orders: z
    .array(orderSchema)
    .min(1)
    .max(3)
    .describe('"needs-attention" shows all of them, oldest first. Other features use the first one.'),
  template: templateSchema,
  seconds: z
    .object({
      hook: secs(2, 3, 2.5),
      step: secs(4.5, 6.5, 5.5).describe('Length of each of the three steps.'),
      endCard: secs(3, 4, 3.5),
    })
    .default({hook: 2.5, step: 5.5, endCard: 3.5}),
  voiceover: voiceover(4, 'hook, step 1, step 2, step 3'),
  audio: audioSchema,
});

// ---- Tips (20 to 25 s) ----

export const tipsSchema = z.object({
  hook,
  tips: z
    .array(z.object({title: z.string().min(3).max(44), body: z.string().min(3).max(120)}))
    .length(3),
  lateling: z.object({
    caption,
    orders: z.array(orderSchema).min(1).max(3),
  }),
  seconds: z
    .object({
      hook: secs(2, 3, 2.5),
      tip: secs(4, 6, 5).describe('Length of each of the three tips.'),
      lateling: secs(3, 5, 4),
      endCard: secs(2.5, 4, 3),
    })
    .default({hook: 2.5, tip: 5, lateling: 4, endCard: 3}),
  voiceover: voiceover(5, 'hook, tip 1, tip 2, tip 3, the Lateling scene'),
  audio: audioSchema,
});

// ---- Trust (20 to 25 s) ----

export const trustSchema = z.object({
  hook,
  readOnly: z.object({heading: z.string().max(36), caption}),
  data: z.object({heading: z.string().max(44), caption}),
  seconds: z
    .object({
      hook: secs(2, 3, 2.5),
      readOnly: secs(6, 9, 7.5),
      data: secs(6, 9, 7.5),
      endCard: secs(3, 4, 3.5),
    })
    .default({hook: 2.5, readOnly: 7.5, data: 7.5, endCard: 3.5}),
  voiceover: voiceover(3, 'hook, read-only access, where the data goes'),
  audio: audioSchema,
});

export type Order = z.infer<typeof orderSchema>;
export type Template = z.infer<typeof templateSchema>;
export type AudioProps = z.infer<typeof audioSchema>;
export type BeforeAfterProps = z.infer<typeof beforeAfterSchema>;
export type FeatureDemoProps = z.infer<typeof featureDemoSchema>;
export type TipsProps = z.infer<typeof tipsSchema>;
export type TrustProps = z.infer<typeof trustSchema>;

// Allowed total length per composition, in seconds.
export const DURATION_LIMITS = {
  BeforeAfter: [20, 25],
  FeatureDemo: [20, 25],
  Tips: [20, 25],
  Trust: [20, 25],
} as const;

export const totalSeconds = {
  BeforeAfter: (p: BeforeAfterProps) => {
    const s = p.seconds;
    return s.hook + s.pain + s.find + s.reply + s.endCard;
  },
  FeatureDemo: (p: FeatureDemoProps) => p.seconds.hook + p.seconds.step * 3 + p.seconds.endCard,
  Tips: (p: TipsProps) => p.seconds.hook + p.seconds.tip * 3 + p.seconds.lateling + p.seconds.endCard,
  Trust: (p: TrustProps) => {
    const s = p.seconds;
    return s.hook + s.readOnly + s.data + s.endCard;
  },
};

// Scenes in play order, named by their key in "seconds". Used to time the voiceover.
export const SCENES = {
  BeforeAfter: ['hook', 'pain', 'find', 'reply', 'endCard'],
  FeatureDemo: ['hook', 'step', 'step', 'step', 'endCard'],
  Tips: ['hook', 'tip', 'tip', 'tip', 'lateling', 'endCard'],
  Trust: ['hook', 'readOnly', 'data', 'endCard'],
} as const;
