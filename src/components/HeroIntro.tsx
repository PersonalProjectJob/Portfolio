import React from 'react';
import { motion } from 'framer-motion';
import { SylvaHero } from './SylvaHero';
import { useT } from '../i18n/useT';
import type { DockItemConfig, DepthCardConfig, StatItemConfig } from './SylvaHero/types';

interface HeroIntroProps {
  onComplete: () => void;
  onNavigate: (destination: 'projects' | 'about' | 'services' | 'contact') => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onComplete, onNavigate }) => {
  const t = useT();

  const customDockItems: DockItemConfig[] = [
    {
      id: 'home',
      label: 'Son Thao',
      glyph: 'custom',
      isMark: true,
      delayMs: 120,
      customSvg: (
        <img
          src="/images/logo.png"
          alt="Logo"
          className="w-full h-full object-contain scale-110 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]"
        />
      ),
      onClick: () => {
        onNavigate('about');
      },
    },
    {
      id: 'projects',
      label: t('ui.projects') || 'Projects',
      glyph: 'projects',
      isActive: true,
      delayMs: 180,
      onClick: () => {
        onNavigate('projects');
      },
    },
    {
      id: 'about',
      label: t('ui.about') || 'About',
      glyph: 'about',
      delayMs: 230,
      onClick: () => {
        onNavigate('about');
      },
    },
    {
      id: 'services',
      label: t('ui.services') || 'Services',
      glyph: 'services',
      delayMs: 280,
      onClick: () => {
        onNavigate('services');
      },
    },
    {
      id: 'contact',
      label: t('hero.enterWork') || 'Enter',
      glyph: 'enter',
      isEnter: true,
      delayMs: 330,
      onClick: () => {
        onComplete();
      },
    },
  ];

  const customStats: StatItemConfig[] = [
    {
      label: 'Products Architected',
      value: '18+ live',
      icon: 'circles',
      delayMs: 700,
      parallaxDepth: 12,
      positionClass: 'sylva-stat--a',
    },
    {
      label: 'Design System Coverage',
      value: '99.4% tokens',
      icon: 'rays',
      delayMs: 770,
      parallaxDepth: 13,
      positionClass: 'sylva-stat--b',
    },
  ];

  const customCards: DepthCardConfig[] = [
    {
      id: 'about',
      variant: 'about',
      label: 'Design Philosophy',
      title: 'Less but better, crafted living systems.',
      imageSrc: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
      imageAlt: 'Moss and stone landscape in misty forest',
      knobLabel: 'Read design ethos',
      delayMs: 760,
      portalDelayMs: 920,
      parallaxDepth: 10,
      parallaxRotate: 2.2,
      onKnobClick: () => onNavigate('about'),
    },
    {
      id: 'stove',
      variant: 'stove',
      label: 'Selected Case Study',
      title: 'CryptoMap360 & Nailhub AI',
      imageSrc: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
      imageAlt: 'Dense green moss and trees in wild nature',
      knobLabel: 'Explore selected projects',
      delayMs: 880,
      portalDelayMs: 1080,
      parallaxDepth: 22,
      parallaxRotate: 2.4,
      onKnobClick: () => onNavigate('projects'),
    },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#383b34]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <SylvaHero
        variant="living-green"
        headlineLine1="Step into"
        headlineLine2="the living world"
        ledeText="Architecting scalable digital products, living design systems, and immersive web experiences."
        ghostText="SON THAO"
        dockItems={customDockItems}
        stats={customStats}
        cards={customCards}
        onExploreClick={onComplete}
        onPlayClick={() => onNavigate('about')}
        onNavigate={onNavigate}
        onComplete={onComplete}
      />
    </motion.div>
  );
};
