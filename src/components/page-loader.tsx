
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

function PageLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    setLoading(false);
  }, [pathname, searchParams, isMounted]);

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
          setLoading(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
