
'use client';

import { useState, useEffect } from 'react';

const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  const handleScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPosition = window.scrollY;
    // Ensure we don't divide by zero if content is smaller than viewport
    if (totalHeight <= 0) {
      setProgress(100);
      return;
    }
    const scrollProgress = (scrollPosition / totalHeight) * 100;
    setProgress(scrollProgress);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation in case the page is already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 w-full bg-transparent">
        <div 
            className="h-1 bg-gradient-to-r from-purple-500 from-60% to-blue-500 transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
        />
    </div>
  );
};

export default ReadingProgressBar;
