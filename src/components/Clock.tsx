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
    <div className={`px-4 flex items-center justify-center font-mono font-bold text-xs md:text-sm tracking-wider h-full transition-colors ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>
      {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};
