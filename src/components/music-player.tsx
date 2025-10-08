
'use client';

import { useMusicPlayer } from '@/contexts/music-player-context';
import { motion } from 'framer-motion';
import { X, Minimize2, Music, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

const MusicPlayer = () => {
  const { isOpen, isMinimized, closePlayer, toggleMinimize } = useMusicPlayer();
  const constraintsRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[55]">
      <motion.div
        drag={!isMinimized}
        dragConstraints={constraintsRef}
        dragMomentum={false}
        className={cn(
            "pointer-events-auto glass-card shadow-2xl",
            isMinimized
                ? "fixed top-20 left-1/2 w-[calc(100%-14px)] max-w-4xl"
                : "absolute top-1/2 left-1/2 w-[350px] rounded-xl"
        )}
        initial={{ opacity: 0, scale: 0.9, x: '-50%', y: isMinimized ? '-200%' : '-50%' }}
        animate={{
            opacity: 1,
            scale: 1,
            height: isMinimized ? 56 : 480,
            borderRadius: isMinimized ? '9999px' : '0.75rem',
            x: '-50%',
            y: isMinimized ? 0 : '-50%'
        }}
        exit={{ opacity: 0, scale: 0.9, y: isMinimized ? '-200%' : '-50%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={cn(
            "flex items-center justify-between pl-4 pr-1",
            !isMinimized && "bg-muted/30 rounded-t-xl cursor-grab active:cursor-grabbing"
        )}>
           <div className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                <h3 className="font-semibold text-sm">Lofi Girl</h3>
            </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMinimize}>
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePlayer}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={cn("w-full h-[calc(100%-48px)] rounded-b-xl overflow-hidden", isMinimized && "hidden")}>
          <iframe
            style={{ borderRadius: '0 0 12px 12px' }}
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MusicPlayer;
