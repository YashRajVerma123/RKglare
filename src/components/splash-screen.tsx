
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

    // Function to handle the end of the splash screen
    const endSplash = () => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
        sessionStorage.setItem('splashShown', 'true');
      }, 500); // Corresponds to fade-out duration
    };
    
    // If the page is already loaded when the component mounts, end immediately.
    if (document.readyState === 'complete') {
      endSplash();
    } else {
      // Otherwise, listen for the window's 'load' event.
      window.addEventListener('load', endSplash);
    }
    
    // Cleanup the event listener
    return () => {
      window.removeEventListener('load', endSplash);
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
