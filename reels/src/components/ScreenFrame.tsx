import React from 'react';
import {Easing, Img, interpolate, useCurrentFrame} from 'remotion';
import {serif} from '../fonts';
import type {Product} from '../products';
import {theme} from '../theme';
import {accentOf, ProductMark, resolveSrc, useEnter} from './primitives';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * A real screenshot of the product in a plain window frame. If the product file gives the screen a
 * "focus" box, the view eases into that box between `zoomFrom` and `zoomTo` so small text gets readable.
 */
export const ScreenFrame: React.FC<{
  product: Product;
  file: string;
  zoomFrom?: number;
  zoomTo?: number;
  maxHeight?: number;
}> = ({product, file, zoomFrom = 20, zoomTo = 50, maxHeight = 820}) => {
  const frame = useCurrentFrame();
  const p = useEnter(0);
  const screen = product.screens.find((s) => s.file === file);
  const focus = screen?.focus;
  let transform = 'none';
  let origin = '50% 0%';
  if (focus) {
    const scale = Math.min(2.4, 1 / Math.max(focus.w, focus.h));
    const t = interpolate(frame, [zoomFrom, zoomTo], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
    transform = `scale(${1 + (scale - 1) * t})`;
    origin = `${(focus.x + focus.w / 2) * 100}% ${(focus.y + focus.h / 2) * 100}%`;
  }
  return (
    <div
      style={{
        background: theme.surface,
        border: `2px solid ${theme.line}`,
        borderRadius: 28,
        boxShadow: theme.shadowLift,
        overflow: 'hidden',
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 22px',
          borderBottom: `2px solid ${theme.line}`,
          background: theme.sunken,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: theme.line}} />
        ))}
        <div
          style={{
            marginLeft: 14,
            flex: 1,
            fontSize: 24,
            color: theme.inkSubtle,
            background: theme.surface,
            borderRadius: 999,
            padding: '8px 20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {product.url}
        </div>
      </div>
      <div style={{overflow: 'hidden', display: 'flex', justifyContent: 'center', background: theme.surface}}>
        <Img
          src={resolveSrc(file)}
          style={{
            display: 'block',
            width: '100%',
            maxHeight,
            objectFit: 'contain',
            objectPosition: 'top',
            transform,
            transformOrigin: origin,
          }}
        />
      </div>
    </div>
  );
};

/** Used where a screen would go when the product has no screenshots: logo, name, kind and one line. */
export const ProductCard: React.FC<{product: Product}> = ({product}) => {
  const a = useEnter(0);
  const b = useEnter(8);
  const rise = (p: number) => ({opacity: p, transform: `translateY(${(1 - p) * 24}px)`});
  return (
    <div
      style={{
        background: theme.surface,
        border: `2px solid ${theme.line}`,
        borderRadius: 32,
        boxShadow: theme.shadowLift,
        padding: '56px 52px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        ...rise(a),
      }}
    >
      <ProductMark product={product} size={150} />
      <div style={{fontFamily: serif, fontWeight: 700, fontSize: product.name.length <= 12 ? 96 : 76, lineHeight: 1.12, marginTop: 30}}>
        {product.name}
      </div>
      <div
        style={{
          marginTop: 22,
          fontSize: 30,
          fontWeight: 600,
          color: accentOf(product),
          background: theme.primaryTint,
          borderRadius: 999,
          padding: '10px 24px',
        }}
      >
        {product.kind}
      </div>
      <div style={{marginTop: 34, fontSize: 42, lineHeight: 1.38, color: theme.inkMuted, textWrap: 'balance', ...rise(b)}}>
        {product.oneLiner}
      </div>
    </div>
  );
};

/** A screenshot if the script picked one, otherwise the product card. */
export const ScreenOrCard: React.FC<{product: Product; screen?: string; maxHeight?: number}> = ({product, screen, maxHeight}) =>
  screen ? <ScreenFrame product={product} file={screen} maxHeight={maxHeight} /> : <ProductCard product={product} />;
