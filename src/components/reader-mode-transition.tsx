
'use client';

import { useEffect } from 'react';
import BookIcon from './ui/book-icon';
import { cn } from '@/lib/utils';

type TransitionState = 'opening' | 'closing' | 'open' | 'closed';

interface ReaderModeTransitionProps {
  state: TransitionState;
  onOpen: () => void;
  onClose: () => void;
}

const ReaderModeTransition = ({ state, onOpen, onClose }: ReaderModeTransitionProps) => {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state === 'opening') {
      timer = setTimeout(onOpen, 600); // Corresponds to animation duration
    } else if (state === 'closing') {
      timer = setTimeout(onClose, 600);
    }
    return () => clearTimeout(timer);
  }, [state, onOpen, onClose]);

  if (state === 'closed' || state === 'open') {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[110] flex items-center justify-center pointer-events-none',
        state === 'opening' && 'animate-fade-in-fast',
        state === 'closing' && 'animate-fade-out-fast'
      )}
    >
      <div className="relative h-24 w-24">
        <BookIcon
          className={cn(
            'h-24 w-24 text-primary transition-transform duration-500 ease-in-out',
            state === 'opening' && 'animate-book-open',
            state === 'closing' && 'animate-book-close'
          )}
        />
      </div>

      <style jsx>{`
        @keyframes book-open {
          0% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.5) rotate(-15deg);
          }
          100% {
            transform: scale(100) rotate(-15deg);
          }
        }
        @keyframes book-close {
          0% {
            transform: scale(100) rotate(-15deg);
          }
          50% {
            transform: scale(1.5) rotate(-15deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes fade-in-fast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out-fast {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-book-open {
          animation: book-open 0.6s ease-in-out forwards;
        }
        .animate-book-close {
          animation: book-close 0.6s ease-in-out forwards;
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
        }
        .animate-fade-out-fast {
            animation: fade-out-fast 0.2s ease-in forwards 0.4s;
        }
      `}</style>
    </div>
  );
};

export default ReaderModeTransition;
