import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useSiteSettings } from '../../cms/hooks/useSiteSettings';
import { useProjects } from '../../cms/hooks/useProjects';
import { trackEvent, trackProjectView, PROJECT_NAME_MAP } from '../../utils/analytics';

export interface KageLandingPageProps {
  className?: string;
  sourceUrl?: string;
  title?: string;
}

export const KageLandingPage: React.FC<KageLandingPageProps> = ({
  className = '',
  sourceUrl = '/landing-pages/kage.html',
  title = 'Kage — Where stillness reveals the unseen',
}) => {
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { setGameState, setSelectedQuest, setActiveLandingVariant, language, setLanguage } = useStore();
  const { settings } = useSiteSettings();
  const { projects } = useProjects();

  const sendProfileData = useCallback(() => {
    if (frameRef.current?.contentWindow) {
      frameRef.current.contentWindow.postMessage(
        {
          type: 'APPLY_PROFILE_DATA',
          settings: settings || null,
          projects: projects || null,
          language: language,
        },
        '*'
      );
    }
  }, [settings, projects, language]);

  useEffect(() => {
    setActiveLandingVariant('B');
  }, [setActiveLandingVariant]);

  useEffect(() => {
    if (ready) {
      sendProfileData();
    }
  }, [ready, sendProfileData]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'NAVIGATE_QUEST' && event.data.questId) {
          const questId = event.data.questId;
          const projectName = PROJECT_NAME_MAP[questId] || questId;
          setActiveLandingVariant('B');
          setSelectedQuest(questId);
          setGameState(`CASE_STUDY_${questId.toUpperCase().replace(/-/g, '')}` as any);
          trackProjectView(questId, projectName, 'B', 'kage_card_click');
        } else if (event.data.type === 'TRACK_EVENT' && event.data.eventName) {
          trackEvent(event.data.eventName, {
            ...event.data.params,
            landing_variant: 'B',
          });
        } else if (event.data.type === 'REQUEST_PROFILE_DATA') {
          sendProfileData();
        } else if (event.data.type === 'SWITCH_VARIANT' && (event.data.variant === 'A' || event.data.variant === 'B')) {
          setActiveLandingVariant(event.data.variant);
          setGameState(event.data.variant === 'B' ? 'CASE_STUDY_KAGE' : 'HERO_LANDING');
          trackEvent('view_mode_toggle', {
            target_variant: event.data.variant,
            target_mode: event.data.variant === 'B' ? '3d' : '2d',
            source: 'kage_header',
          });
        } else if (event.data.type === 'SET_LANGUAGE' && (event.data.language === 'vi' || event.data.language === 'en')) {
          setLanguage(event.data.language);
          trackEvent('language_toggle', {
            language: event.data.language,
            source: 'kage_header',
            landing_variant: 'B',
          });
        } else if (event.data.type === 'OPEN_WINDOW' && event.data.url) {
          window.open(event.data.url, event.data.target || '_blank', 'noopener,noreferrer');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setGameState, setSelectedQuest, setActiveLandingVariant, sendProfileData, setLanguage]);

  return (
    <div
      className={`kage-landing-page-frame ${className}`}
      data-state={ready ? 'ready' : 'loading'}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#080808',
        zIndex: 9999,
      }}
    >
      {/* Verified Authored Kage Full-Document Renderer (First-party trusted iframe) */}
      <iframe
        ref={frameRef}
        title={title}
        src={sourceUrl}
        loading="eager"
        onLoad={() => {
          setReady(true);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          border: 0,
          background: '#080808',
        }}
      />
    </div>
  );
};

export default KageLandingPage;
