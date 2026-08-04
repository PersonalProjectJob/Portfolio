import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export const Clock = () => {
  const { isLightMode } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto theme logic
  useEffect(() => {
    const { isManualTheme, isLightMode, setIsLightMode } = useStore.getState();
    if (isManualTheme) return;
    const currentHour = currentTime.getHours();
    const shouldBeLight = currentHour >= 6 && currentHour < 18;
    if (shouldBeLight && !isLightMode) setIsLightMode(true);
    else if (!shouldBeLight && isLightMode) setIsLightMode(false);
  }, [currentTime]);

  return (
    <div className={`px-2.5 h-full rounded-md flex items-center justify-center font-mono font-bold text-[11px] md:text-xs tracking-wider transition-colors ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
      {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};
