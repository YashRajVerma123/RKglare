
'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

const SplashScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('splashShown') === 'true';

    if (hasBeenShown) {
      setIsLoading(false);
      return;
    }

    // Start the fade-out process after 2 seconds (2000ms)
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Hide the component completely after the fade-out animation (500ms)
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 2500); // 2000ms wait + 500ms fade

    // Cleanup timers if the component unmounts
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };

  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background',
        'transition-opacity duration-500 ease-out',
        isFadingOut ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="animate-fade-in-up">
        <Logo />
      </div>
    </div>
  );
};

export default SplashScreen;
