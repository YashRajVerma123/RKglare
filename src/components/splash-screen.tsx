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

    sessionStorage.setItem('splashShown', 'true');

    // Timer to start fading out the entire splash screen
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 250); // Reduced from 1200ms

    // Timer to remove the component from the DOM
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 750); // Should be fadeOut duration (500ms) + fadeOutTimer (250ms)

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
