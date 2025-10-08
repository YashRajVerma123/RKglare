
'use client';

import { useMusicPlayer } from '@/contexts/music-player-context';
import { motion } from 'framer-motion';
import { X, Minimize2, Music } from 'lucide-react';
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
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        className={cn(
          "pointer-events-auto glass-card shadow-2xl absolute top-1/2 left-1/2 rounded-xl"
        )}
        initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
        animate={{
          opacity: isMinimized ? 0 : 1,
          x: isMinimized ? '-500%' : '-50%',
          y: '-50%',
        }}
        exit={{ opacity: 0, scale: 0.9, y: '-50%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30, duration: 0.6 }}
      >
        <div className="flex items-center justify-between pl-4 pr-1 bg-muted/30 rounded-t-xl cursor-grab active:cursor-grabbing h-12">
           <div className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                <h3 className="font-semibold text-sm">Lofi Girl</h3>
            </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMinimize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePlayer}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="w-[350px] h-[432px] rounded-b-xl overflow-hidden">
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
