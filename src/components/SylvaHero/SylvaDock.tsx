import React, { useEffect, useRef } from 'react';
import type { DockItemConfig } from './types';

interface SylvaDockProps {
  items: DockItemConfig[];
  activeId?: string;
  onItemClick?: (item: DockItemConfig) => void;
  onBurst?: (x: number, y: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export const SylvaDock: React.FC<SylvaDockProps> = ({
  items,
  activeId,
  onItemClick,
  onBurst,
  className = '',
  style = {},
}) => {
  const dockRef = useRef<HTMLElement>(null);
  const itemsRef = useRef<{ el: HTMLElement; w: number; h: number; v: number; vel: number; target: number }[]>([]);
  const specRef = useRef<{ el: HTMLElement; ang: number; tAng: number; br: number; tBr: number; focused: boolean; reach: number }[]>([]);

  const renderGlyph = (item: DockItemConfig) => {
    if (item.customSvg) return item.customSvg;

    switch (item.glyph) {
      case 'home':
        return (
          <svg viewBox="0 0 22 24" aria-hidden="true">
            <path d="M11 1.3c-2.1 0-3.95 1.2-4.75 2.95C3.95 4.55 2.3 6.25 2.3 8.35c0 2.3 1.9 4.2 4.3 4.2h8.8c2.4 0 4.3-1.9 4.3-4.2 0-2.1-1.65-3.8-4-4.1C14.95 2.5 13.1 1.3 11 1.3Z" />
            <path d="M9.6 12.55h2.8v4.2c1.35.3 2.45 1.15 3.15 2.4-1.35.4-2.4.15-3.15-.4v4.15H9.6v-4.15c-.75.55-1.8.8-3.15.4.7-1.25 1.8-2.1 3.15-2.4v-4.2Z" />
          </svg>
        );
      case 'grove':
      case 'projects':
        return (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 14V9" />
            <path d="M8 9c0-2.4 1.7-4.3 4-4.3.2 2.6-1.6 4.6-4 4.3Z" />
            <path d="M8 10.5C7.9 8.4 6.4 6.8 4.4 6.8 4.3 8.9 5.9 10.6 8 10.5Z" />
          </svg>
        );
      case 'habitats':
      case 'about':
        return (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M1.6 12.4c2.4-3.4 4.3-5.1 5.7-5.1 2 0 3 3.6 5 3.6 1.1 0 1.9-.5 2.4-1.4" />
            <path d="M4.3 6.2C5.5 4.4 6.6 3.5 7.6 3.5c1.5 0 2.2 2.4 3.7 2.4" />
          </svg>
        );
      case 'journal':
      case 'services':
        return (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 2.4h5.3L12 5.1v8.5H4z" />
            <path d="M9.2 2.4V5h2.7" />
            <path d="M6 8.4h4M6 10.8h2.8" />
          </svg>
        );
      case 'enter':
      case 'contact':
      default:
        return (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6.6 2.5h5.1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6.6" />
            <path d="M2.6 8h6.6" />
            <path d="m7 5.6 2.4 2.4L7 10.4" />
          </svg>
        );
    }
  };

  useEffect(() => {
    const root = dockRef.current;
    if (!root) return;

    let disposed = false;
    let animId = 0;
    let lastTick = performance.now();
    let aimX = 0, aimY = 0, aimSeen = false, aimMoved = false;
    let isKeyFocused = false;
    let dockLive = false;
    let dockDirty = true;
    let specDirty = true;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fineHover = () => !reduced && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    const isNarrow = () => window.matchMedia('(max-width: 900px)').matches;

    const getStageWidth = () => {
      const stage = root.closest('.sylva-stage') || root.parentElement;
      return stage ? stage.getBoundingClientRect().width : window.innerWidth;
    };

    const getU = () => {
      return getStageWidth() / (isNarrow() ? 760 : 1600);
    };

    const itemEls = Array.from(root.querySelectorAll<HTMLElement>('[data-dock]'));
    itemsRef.current = itemEls.map((el) => ({
      el,
      w: 0,
      h: 0,
      v: 0,
      vel: 0,
      target: 0,
    }));

    const specEls = Array.from(root.parentElement?.querySelectorAll<HTMLElement>('[data-spec]') || [root]);
    specRef.current = specEls.map((el) => ({
      el,
      ang: 2.4,
      tAng: 2.4,
      br: 0,
      tBr: 0,
      focused: false,
      reach: el.classList.contains('sylva-dock') ? 250 : 185,
    }));

    const measureDock = () => {
      if (!root) return;
      itemsRef.current.forEach((st) => {
        st.el.style.width = '';
        st.el.style.height = '';
        st.el.style.transform = '';
        st.el.dataset.near = 'false';
        st.v = 0;
        st.vel = 0;
        st.target = 0;
      });
      itemsRef.current.forEach((st) => {
        const r = st.el.getBoundingClientRect();
        st.w = r.width;
        st.h = r.height;
      });
      dockLive = false;
      dockDirty = true;
      aimMoved = aimSeen;
    };

    measureDock();
    if (document.fonts?.ready) {
      document.fonts.ready.then(measureDock);
    }
    window.addEventListener('resize', measureDock);

    const dockRest = () => {
      dockLive = false;
      dockDirty = true;
      itemsRef.current.forEach((st) => {
        st.target = 0;
        st.el.dataset.near = 'false';
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      aimX = e.clientX;
      aimY = e.clientY;
      aimSeen = true;
      aimMoved = true;
      isKeyFocused = false;
      dockDirty = true;
      specDirty = true;
    };

    const handlePointerLeave = () => {
      aimSeen = false;
      dockRest();
      specRef.current.forEach((st) => {
        st.tBr = st.focused ? 0.9 : 0;
      });
      specDirty = true;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    const handleFocusIn = (e: FocusEvent) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('[data-dock]');
      if (!item || !fineHover()) return;
      const idx = itemsRef.current.findIndex((st) => st.el === item);
      itemsRef.current.forEach((st, i) => {
        st.target = i === idx ? 1 : Math.abs(i - idx) === 1 ? 0.24 : 0;
        st.el.dataset.near = st.target > 0.08 ? 'true' : 'false';
      });
      dockLive = false;
      isKeyFocused = true;
      dockDirty = true;
    };

    const handleFocusOut = () => {
      requestAnimationFrame(() => {
        if (!root.contains(document.activeElement)) {
          isKeyFocused = false;
          dockRest();
        }
      });
    };

    root.addEventListener('focusin', handleFocusIn);
    root.addEventListener('focusout', handleFocusOut);

    const drawDock = (dt: number) => {
      if (!root || !fineHover()) return;
      const u = getU();

      if (aimSeen && aimMoved && !isKeyFocused) {
        const rr = root.getBoundingClientRect();
        if (aimX > rr.left - 48 && aimX < rr.right + 48 && aimY > rr.top - 44 && aimY < rr.bottom + 104) {
          itemsRef.current.forEach((st) => {
            const r = st.el.getBoundingClientRect();
            const prox = clamp01(1 - Math.abs(aimX - (r.left + r.width * 0.5)) / (128 * u));
            st.target = prox * prox * (3 - 2 * prox);
            st.el.dataset.near = st.target > 0.08 ? 'true' : 'false';
          });
          dockLive = true;
          dockDirty = true;
        } else if (dockLive) {
          dockRest();
        }
      }

      if (!dockDirty) return;
      let moving = false;
      itemsRef.current.forEach((st) => {
        st.vel += (st.target - st.v) * 190 * dt;
        st.vel *= Math.exp(-23 * dt);
        st.v += st.vel * dt;
        if (Math.abs(st.target - st.v) < 0.001 && Math.abs(st.vel) < 0.004) {
          st.v = st.target;
          st.vel = 0;
        } else {
          moving = true;
        }

        const v = Math.min(Math.max(st.v, 0), 1.08);
        const isMark = st.el.classList.contains('sylva-dock-mark');
        const ew = isMark ? 14 * u : Math.min(18 * u, st.w * 0.24);
        const eh = isMark ? 14 * u : 16 * u;
        st.el.style.width = (st.w + ew * v).toFixed(2) + 'px';
        st.el.style.height = (st.h + eh * v).toFixed(2) + 'px';
        st.el.style.transform = `translateY(${(v * 3.5 * u).toFixed(2)}px)`;
      });
      if (!moving) dockDirty = false;
    };

    const drawSpec = (dt: number) => {
      if (!fineHover()) return;
      const u = getU();

      if (aimSeen && aimMoved) {
        specRef.current.forEach((st) => {
          const r = st.el.getBoundingClientRect();
          const cx = r.left + r.width * 0.5;
          const cy = r.top + r.height * 0.5;
          const dx = Math.max(r.left - aimX, 0, aimX - r.right);
          const dy = Math.max(r.top - aimY, 0, aimY - r.bottom);
          const d = Math.sqrt(dx * dx + dy * dy);

          st.tAng =
            d === 0
              ? Math.atan2(2 / Math.max(r.height, 1), -2 / Math.max(r.width, 1)) +
                ((aimX - cx) / Math.max(r.width * 0.5, 1)) * 0.30 +
                ((cy - aimY) / Math.max(r.height * 0.5, 1)) * 0.15
              : Math.atan2(cy - aimY, aimX - cx);

          const raw = clamp01(1 - d / (st.reach * u));
          st.tBr = Math.max(raw * raw * (3 - 2 * raw), st.focused ? 0.9 : 0);
        });
        specDirty = true;
      }

      if (!specDirty) return;
      let moving = false;
      specRef.current.forEach((st) => {
        const diff = ((st.tAng - st.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        st.ang += diff * (1 - Math.exp(-dt * 8));
        st.br += (st.tBr - st.br) * (1 - Math.exp(-dt * 9));
        if (Math.abs(diff) < 0.001 && Math.abs(st.tBr - st.br) < 0.002) {
          st.ang = st.tAng;
          st.br = st.tBr;
        } else {
          moving = true;
        }
        st.el.style.setProperty('--spec-angle', st.ang.toFixed(4) + 'rad');
        st.el.style.setProperty('--spec-bright', (clamp01(st.br) * 0.92).toFixed(3));
      });
      if (!moving) specDirty = false;
    };

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = lastTick ? Math.min((now - lastTick) / 1000, 0.05) : 0.016;
      lastTick = now;

      drawDock(dt);
      drawSpec(dt);
      aimMoved = false;

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', measureDock);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      root.removeEventListener('focusin', handleFocusIn);
      root.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <div className={`sylva-dock-wrap ${className}`} style={style}>
      <nav ref={dockRef} className="sylva-dock sylva-par" style={{ '--pd': 5 } as React.CSSProperties} data-spec aria-label="Primary">
        {items.map((item) => {
          const isActive = activeId ? activeId === item.id : item.isActive;
          const isMark = item.isMark;
          const isEnter = item.isEnter;

          const itemClasses = [
            'sylva-dock-item',
            isMark ? 'sylva-dock-mark' : '',
            isActive ? 'is-active' : '',
            isEnter ? 'sylva-dock-item--enter' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            onBurst?.(e.clientX, e.clientY);
            item.onClick?.();
            onItemClick?.(item);
          };

          return (
            <a
              key={item.id}
              className={itemClasses}
              data-dock
              data-spec
              data-burst
              href={item.href || '#'}
              style={{ '--d': `${item.delayMs || 150}ms` } as React.CSSProperties}
              aria-label={item.ariaLabel || item.label}
              onClick={handleClick}
            >
              <span className="sylva-glyph" aria-hidden="true">
                {renderGlyph(item)}
              </span>
              {!isMark && <span>{item.label}</span>}
            </a>
          );
        })}
      </nav>
    </div>
  );
};
