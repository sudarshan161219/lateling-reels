import {z} from 'zod';
import botMeter from '../products/bot-meter.json';
import briefd from '../products/briefd.json';
import cutout from '../products/cutout.json';
import invo from '../products/invo.json';
import lateling from '../products/lateling.json';
import portfolioFrame from '../products/portfolio-frame.json';
import retain from '../products/retain.json';
import signoff from '../products/signoff.json';

// One file per product in reels/products/<id>.json. To add a product, write its file
// (copy one of the others) and add it to the list below. The id must match the file name.

export const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(20),
  kind: z.string().max(32).describe('For example "Chrome extension" or "Web app".'),
  url: z.string().max(44).describe('Shown on the end card, without https://.'),
  endCardLine: z.string().max(40).describe('The line in the end card button. Must be true.'),
  spokenEnd: z.string().max(80).describe('What the voiceover says over the end card.'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .describe('Accent colour. Leave out to use the channel green.'),
  logo: z
    .string()
    .optional()
    .describe('"lateling" for the built-in mark, or a file inside reels/public. Leave out for a letter tile.'),
  audience: z.string().max(120),
  oneLiner: z.string().max(140),
  facts: z.array(z.string().max(400)).min(1).describe('Everything a script may say about the product. Nothing else.'),
  dont: z.array(z.string().max(300)).default([]),
  trust: z
    .array(z.object({ok: z.boolean(), text: z.string().max(32)}))
    .max(5)
    .optional()
    .describe('Rows for the ToolTrust video. ok false is shown with a cross ("does not ...").'),
  screens: z
    .array(
      z.object({
        file: z.string().describe('File inside reels/public, for example "products/invo/editor.png".'),
        shows: z.string().max(300).describe('What is on the screen, for the script writer.'),
        focus: z
          .object({x: z.number().min(0).max(1), y: z.number().min(0).max(1), w: z.number().min(0.1).max(1), h: z.number().min(0.1).max(1)})
          .optional()
          .describe('Part of the screen to zoom into, as fractions of its width and height.'),
      }),
    )
    .default([]),
  angles: z.array(z.string().max(160)).default([]),
});

export type Product = z.infer<typeof productSchema>;

const ALL = [lateling, invo, signoff, retain, briefd, botMeter, portfolioFrame, cutout];

export const PRODUCTS: Record<string, Product> = Object.fromEntries(
  ALL.map((raw) => {
    const r = productSchema.safeParse(raw);
    if (!r.success) {
      const id = (raw as {id?: string}).id ?? '?';
      throw new Error(`products/${id}.json: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
    }
    return [r.data.id, r.data];
  }),
);

export const PRODUCT_IDS = Object.keys(PRODUCTS) as [string, ...string[]];
export const DEFAULT_PRODUCT = 'lateling';

export const getProduct = (id: string | undefined): Product => PRODUCTS[id ?? DEFAULT_PRODUCT] ?? PRODUCTS[DEFAULT_PRODUCT];
