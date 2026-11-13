import React, { useEffect, useRef } from 'react';
import type { DepthCardConfig } from './types';

interface SylvaDepthCardProps {
  config: DepthCardConfig;
  className?: string;
  style?: React.CSSProperties;
}

const CUT_STEPS = 12;
const CUT_MS = 1450;

export const SylvaDepthCard: React.FC<SylvaDepthCardProps> = ({ config, className = '', style = {} }) => {
  const figureRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);

  const {
    variant,
    label,
    title,
    imageSrc,
    imageAlt,
    knobLabel,
    knobIcon,
    onKnobClick,
    delayMs = 760,
    portalDelayMs = 920,
    parallaxDepth = variant === 'stove' ? 22 : 10,
    parallaxRotate = variant === 'stove' ? 2.4 : 2.2,
  } = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const media = mediaRef.current;
    if (!canvas || !img || !media) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let animId = 0;
    let timeoutId = 0;

    function launch() {
      timeoutId = window.setTimeout(() => {
        if (!canvas || !img || !media) return;
        const box = canvas.getBoundingClientRect();
        if (!box.width || !box.height) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(box.width * dpr));
        canvas.height = Math.max(1, Math.round(box.height * dpr));
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const cols = 52;
        const rows = Math.max(18, Math.round((cols * box.height) / box.width));

        const sample = document.createElement('canvas');
        sample.width = cols;
        sample.height = rows;
        const sg = sample.getContext('2d', { willReadFrequently: true });
        let rgba: Uint8ClampedArray | null = null;
        try {
          if (sg) {
            sg.drawImage(img, 0, 0, cols, rows);
            rgba = sg.getImageData(0, 0, cols, rows).data;
          }
        } catch {
          // Fallback if image is tainted
        }

        const over = -media.offsetLeft;
        const span = media.offsetWidth;
        const reach = box.width;

        canvas.style.opacity = '1';
        const startedAt = performance.now();

        function paint(now: number) {
          if (!canvas || !ctx) return;
          const t = Math.min(1, (now - startedAt) / CUT_MS);
          const stepped = Math.floor(t * CUT_STEPS) / CUT_STEPS;
          const front = (stepped * span - over) / reach;
          const tailFade = t < 0.88 ? 1 : (1 - t) / 0.12;
          ctx.clearRect(0, 0, box.width, box.height);

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const an = (x + 0.5) / cols;
              const delta = an - front;
              if (delta < -0.16 || delta > 0.16) continue;

              const band = 1 - Math.abs(delta) / 0.16;
              const pulse = 0.68 + 0.32 * Math.sin(x * 2.71 + y * 1.93 + t * 26);
              const alpha = Math.max(0, band * pulse * tailFade);
              if (alpha < 0.08) continue;

              let r = 220,
                g = 238,
                b = 202;
              if (rgba) {
                const q = (y * cols + x) * 4;
                r = Math.min(255, rgba[q] * 1.18 + 20);
                g = Math.min(255, rgba[q + 1] * 1.18 + 24);
                b = Math.min(255, rgba[q + 2] * 1.12 + 14);
              }

              const px = ((x + 0.5) * box.width) / cols;
              const py = ((y + 0.5) * box.height) / rows;
              const jitter = (1 - band) * 5;
              const fx = px + Math.sin(y * 3.17 + x) * jitter;
              const fy = py + Math.cos(x * 2.41 - y) * jitter;
              const radius = (0.55 + band * 1.25) * Math.max(0.75, reach / 300);

              ctx.fillStyle = `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${(alpha * 0.92).toFixed(3)})`;
              ctx.beginPath();
              ctx.arc(fx, fy, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          if (t < 1) {
            animId = requestAnimationFrame(paint);
          } else {
            ctx.clearRect(0, 0, box.width, box.height);
            canvas.style.opacity = '0';
          }
        }

        animId = requestAnimationFrame(paint);
      }, portalDelayMs);
    }

    if (img.complete && img.naturalWidth) {
      launch();
    } else {
      img.addEventListener('load', launch, { once: true });
    }

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animId);
    };
  }, [portalDelayMs]);

  const cardStyle: React.CSSProperties = {
    '--d': `${delayMs}ms`,
    '--pd': parallaxDepth,
    '--pr': parallaxRotate,
    ...style,
  } as React.CSSProperties;

  const defaultKnobSvg = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21v-7" />
      <path d="M12 14c0-3.3 2.4-6 5.5-6 .3 3.6-2.2 6.4-5.5 6Z" />
      <path d="M12 16c-.1-2.9-2.2-5.2-4.9-5.2C6.8 13.7 9 16 12 16Z" />
    </svg>
  );

  return (
    <>
      <article className={`sylva-card sylva-card--${variant} sylva-mask sylva-par ${className}`} style={cardStyle}>
        <figure ref={figureRef} className="sylva-portal" data-delay={portalDelayMs}>
          <span ref={mediaRef} className="sylva-portal-media">
            <img ref={imageRef} src={imageSrc} alt={imageAlt} loading="eager" decoding="async" />
          </span>
          <canvas ref={canvasRef} className="sylva-pixel-reveal" aria-hidden="true" />
        </figure>
        <p className="sylva-label">{label}</p>
        <h2>{title}</h2>

        {variant === 'stove' && (
          <button className="sylva-knob" aria-label={knobLabel} onClick={onKnobClick}>
            {knobIcon || defaultKnobSvg}
          </button>
        )}
      </article>

      {variant === 'about' && (
        <span className="sylva-knob-float sylva-par" style={{ '--pd': parallaxDepth, '--pr': parallaxRotate } as React.CSSProperties}>
          <button className="sylva-knob sylva-knob--about sylva-mask-circle" style={{ '--d': '1100ms' } as React.CSSProperties} aria-label={knobLabel} onClick={onKnobClick}>
            {knobIcon || defaultKnobSvg}
          </button>
        </span>
      )}
    </>
  );
};
