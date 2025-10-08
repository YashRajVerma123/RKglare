
'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

function PageLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs when navigation completes.
    if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
    }
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isMounted) return;
    
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && 
          anchor.target !== '_blank' && 
          !anchor.href.startsWith('#') &&
          new URL(anchor.href).origin === window.location.origin) {
        
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(anchor.href);

        if (currentUrl.pathname !== targetUrl.pathname || currentUrl.search !== targetUrl.search) {
          // Only show loader if navigation takes more than 150ms
          loadingTimerRef.current = setTimeout(() => {
            setIsNavigating(true);
          }, 150);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-200',
        isNavigating ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
        <div className="loader-dots">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
        </div>
    </div>
  );
}


export default function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderContent />
    </Suspense>
  )
}
