import React, { useState, useEffect, useRef } from 'react';
import './sylva.css';
import type { SylvaHeroProps, DockItemConfig, DepthCardConfig, StatItemConfig } from './types';
import { SylvaScene, type SylvaSceneHandle } from './SylvaScene';
import { SylvaDock } from './SylvaDock';
import { LiquidMetalButton } from './LiquidMetalButton';
import { SylvaDepthCard } from './SylvaDepthCard';

export const SylvaHero: React.FC<SylvaHeroProps> = ({
  variant = 'living-green',
  headlineLine1 = 'Step into',
  headlineLine2 = 'the living world',
  ledeText = 'We restore wild places through patient design, native planting, and a deeper kind of stewardship.',
  ghostText = 'SYLVA',
  stats,
  cards,
  dockItems,
  onExploreClick,
  onPlayClick,
  onNavigate,
  onComplete,
  className = '',
}) => {
  const sceneRef = useRef<SylvaSceneHandle>(null);
  const [isReady, setIsReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [activeDockId, setActiveDockId] = useState<string>('grove');

  useEffect(() => {
    // Force layout flush so CSS entrance transitions don't get skipped
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 40);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const introTimer = setTimeout(() => {
      setIntroDone(true);
    }, reduced ? 0 : 2900);

    return () => {
      clearTimeout(timer);
      clearTimeout(introTimer);
    };
  }, []);

  const defaultDockItems: DockItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      glyph: 'home',
      isMark: true,
      delayMs: 120,
      onClick: () => {
        setActiveDockId('home');
      },
    },
    {
      id: 'grove',
      label: 'Grove',
      glyph: 'grove',
      isActive: true,
      delayMs: 180,
      onClick: () => {
        setActiveDockId('grove');
        onNavigate?.('projects');
      },
    },
    {
      id: 'habitats',
      label: 'Habitats',
      glyph: 'habitats',
      delayMs: 230,
      onClick: () => {
        setActiveDockId('habitats');
        onNavigate?.('about');
      },
    },
    {
      id: 'journal',
      label: 'Journal',
      glyph: 'journal',
      delayMs: 280,
      onClick: () => {
        setActiveDockId('journal');
        onNavigate?.('services');
      },
    },
    {
      id: 'enter',
      label: 'Enter',
      glyph: 'enter',
      isEnter: true,
      delayMs: 330,
      onClick: () => {
        setActiveDockId('enter');
        if (onComplete) onComplete();
        else onNavigate?.('contact');
      },
    },
  ];

  const defaultStats: StatItemConfig[] = [
    {
      label: 'Canopy restored',
      value: '282 ha',
      icon: 'circles',
      delayMs: 700,
      parallaxDepth: 12,
      positionClass: 'sylva-stat--a',
    },
    {
      label: 'Native species',
      value: '43 mapped',
      icon: 'rays',
      delayMs: 770,
      parallaxDepth: 13,
      positionClass: 'sylva-stat--b',
    },
  ];

  const defaultCards: DepthCardConfig[] = [
    {
      id: 'about',
      variant: 'about',
      label: 'Our Ethos',
      title: 'Let the wild lead.',
      imageSrc: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
      imageAlt: 'A cushion of moss grown over lichen-crusted stones',
      knobLabel: 'Read about Sylva',
      delayMs: 760,
      portalDelayMs: 920,
      parallaxDepth: 10,
      parallaxRotate: 2.2,
      onKnobClick: () => onNavigate?.('about'),
    },
    {
      id: 'stove',
      variant: 'stove',
      label: 'Field Note 07',
      title: 'After the Rain',
      imageSrc: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
      imageAlt: 'Moss-covered boulders in a misty grove',
      knobLabel: 'Open field note: After the Rain',
      delayMs: 880,
      portalDelayMs: 1080,
      parallaxDepth: 22,
      parallaxRotate: 2.4,
      onKnobClick: () => onNavigate?.('projects'),
    },
  ];

  const effectiveDockItems = dockItems || defaultDockItems;
  const effectiveStats = stats || defaultStats;
  const effectiveCards = cards || defaultCards;
  const aboutCard = effectiveCards.find((c) => c.variant === 'about') || effectiveCards[0];
  const stoveCard = effectiveCards.find((c) => c.variant === 'stove') || effectiveCards[1];

  const handlePollenBurst = (clientX: number, clientY: number) => {
    sceneRef.current?.burstAt(clientX, clientY);
  };

  const handleExploreAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExploreClick) onExploreClick();
    else if (onComplete) onComplete();
    else onNavigate?.('projects');
  };

  const handlePlayAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayClick) onPlayClick();
    else if (onComplete) onComplete();
    else onNavigate?.('about');
  };

  const heroClasses = [
    'sylva-root',
    'sylva-hero',
    isReady ? 'sylva-ready' : '',
    introDone ? 'sylva-intro-done' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={heroClasses} id="sylva-hero" data-variant={variant}>
      {/* 3D Three.js WebGL procedural Living World Canvas */}
      <SylvaScene ref={sceneRef} onReady={() => setIsReady(true)} />

      {/* Floating Proximity Magnification Dock */}
      <SylvaDock
        items={effectiveDockItems}
        activeId={activeDockId}
        onBurst={handlePollenBurst}
        onItemClick={(item) => setActiveDockId(item.id)}
      />

      {/* 1600 × 880 Stage Coordinate Space */}
      <div className="sylva-stage" id="sylva-stage">
        {/* Column Guides (z 1) */}
        <div className="sylva-guides sylva-fade" style={{ '--d': '900ms' } as React.CSSProperties} aria-hidden="true">
          <i style={{ left: 'calc(405 * var(--u))' }} />
          <i style={{ left: 'calc(748 * var(--u))' }} />
          <i style={{ left: 'calc(1091 * var(--u))' }} />
        </div>

        {/* Ghost Wordmark (z 1) */}
        <div className="sylva-ghost sylva-fade" style={{ '--d': '1150ms' } as React.CSSProperties} aria-hidden="true">
          {ghostText}
        </div>

        {/* Depth Card 1 (Ethos / About - sits behind Three.js scene) */}
        {aboutCard && <SylvaDepthCard config={aboutCard} />}

        {/* Headline (z 4) */}
        <h1 className="sylva-headline sylva-par" style={{ '--pd': 18, '--pr': 1.2 } as React.CSSProperties}>
          <span>
            <i style={{ '--d': '260ms' } as React.CSSProperties}>{headlineLine1}</i>
          </span>
          <span>
            <i style={{ '--d': '360ms' } as React.CSSProperties}>{headlineLine2}</i>
          </span>
        </h1>

        {/* Lede (z 4) */}
        <p className="sylva-lede sylva-mask sylva-par" style={{ '--d': '480ms', '--pd': 14, '--pr': 1 } as React.CSSProperties}>
          {ledeText}
        </p>

        {/* Liquid Metal Control 1: Explore Button (z 4) */}
        <div className="sylva-pill-clip">
          <div className="sylva-pill sylva-mask sylva-par" style={{ '--d': '600ms', '--pd': 15, '--pr': 1.4 } as React.CSSProperties}>
            <LiquidMetalButton
              variant="explore"
              label="Explore the work"
              onClick={handleExploreAction}
            />
          </div>
        </div>

        {/* Liquid Metal Control 2: Play Button (z 4) */}
        <span className="sylva-play-wrap sylva-par" style={{ '--pd': 20 } as React.CSSProperties}>
          <span className="sylva-play-clip">
            <span className="sylva-play-glass sylva-mask-circle" style={{ '--d': '900ms' } as React.CSSProperties}>
              <LiquidMetalButton
                variant="play"
                label="Play the film"
                onClick={handlePlayAction}
                aria-label="Play the film"
              />
            </span>
          </span>
          <span className="sylva-play-ring sylva-mask-circle" style={{ '--d': '840ms' } as React.CSSProperties} aria-hidden="true" />
        </span>

        {/* Stat Badges (z 4) */}
        {effectiveStats.map((stat, idx) => (
          <dl
            key={idx}
            className={`sylva-stat ${stat.positionClass || ''} sylva-mask sylva-par`}
            style={{
              '--d': `${stat.delayMs || 700}ms`,
              '--pd': stat.parallaxDepth || 12,
            } as React.CSSProperties}
          >
            <span className="sylva-mark" aria-hidden="true">
              {stat.icon === 'rays' ? (
                <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <g id="rays">
                    <path d="M15 3.5v5" /><path d="M15 21.5v5" /><path d="M3.5 15h5" /><path d="M21.5 15h5" />
                    <path d="M6.9 6.9l3.5 3.5" /><path d="M19.6 19.6l3.5 3.5" /><path d="M23.1 6.9l-3.5 3.5" /><path d="M10.4 19.6l-3.5 3.5" />
                  </g>
                  <circle cx="15" cy="15" r="3.6" />
                </svg>
              ) : (
                <svg viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <circle cx="15" cy="15" r="10.5" strokeDasharray="0.6 3.6" />
                  <circle cx="15" cy="15" r="5.6" strokeDasharray="0.6 3.2" />
                  <circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" />
                </svg>
              )}
            </span>
            <div>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          </dl>
        ))}

        {/* Depth Card 2 (Field Note / Projects - sits in front of Three.js scene) */}
        {stoveCard && <SylvaDepthCard config={stoveCard} />}

        {/* Scroll Cue (z 4) */}
        <button
          type="button"
          className="sylva-scroll sylva-mask sylva-par bg-transparent border-0"
          style={{ '--d': '1040ms', '--pd': 9 } as React.CSSProperties}
          onClick={() => {
            if (onComplete) onComplete();
            else onNavigate?.('projects');
          }}
        >
          Discover
          <span className="sylva-track" />
        </button>
      </div>
    </main>
  );
};
