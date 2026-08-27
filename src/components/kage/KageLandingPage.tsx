import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useSiteSettings } from '../../cms/hooks/useSiteSettings';
import { useProjects } from '../../cms/hooks/useProjects';
import { trackEvent } from '../../utils/analytics';

const FRAME_SANDBOX = 'allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts';

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
          setActiveLandingVariant('B');
          setSelectedQuest(event.data.questId);
          setGameState(`CASE_STUDY_${event.data.questId.toUpperCase().replace(/-/g, '')}` as any);
          trackEvent('project_view', {
            project_id: event.data.questId,
            source_variant: 'B',
            interaction_type: 'kage_card_click',
          });
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
          trackEvent('ab_variant_toggle', {
            target_variant: event.data.variant,
            source: 'kage_header',
          });
        } else if (event.data.type === 'SET_LANGUAGE' && (event.data.language === 'vi' || event.data.language === 'en')) {
          setLanguage(event.data.language);
          trackEvent('language_toggle', {
            language: event.data.language,
            source: 'kage_header',
            landing_variant: 'B',
          });
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
      {/* Verified Authored Kage Full-Document Renderer */}
      <iframe
        ref={frameRef}
        title={title}
        src={sourceUrl}
        sandbox={FRAME_SANDBOX}
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
