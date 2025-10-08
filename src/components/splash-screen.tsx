
'use client';

import { useState, useEffect } from 'react';
import Logo from './logo';
import { cn } from '@/lib/utils';

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Only show the splash screen once per session
    const hasBeenShown = sessionStorage.getItem('splashShown') === 'true';

    if (hasBeenShown) {
      setVisible(false);
      return;
    }

    // Start fading out after a very short delay.
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 50); // Reduced wait before starting fade.

    // Hide component completely after fade-out animation
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 450); // 50ms wait + 400ms fade duration

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background',
        'transition-opacity duration-400 ease-out',
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
