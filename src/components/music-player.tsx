
'use client';

import { useMusicPlayer } from '@/contexts/music-player-context';
import { motion } from 'framer-motion';
import { X, Minus, Music, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { useRef } from 'react';

const MusicPlayer = () => {
  const { isOpen, isMinimized, closePlayer, toggleMinimize } = useMusicPlayer();
  const constraintsRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  return (
      <motion.div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[60]">
        <motion.div
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            className="absolute top-1/2 left-1/2 w-[350px] h-[480px] pointer-events-auto glass-card rounded-xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, height: isMinimized ? 56 : 480, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
        <div className="flex items-center justify-between p-2 pr-1 bg-muted/30 rounded-t-xl cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-2 pl-2">
                <Music className="h-4 w-4" />
                <h3 className="font-semibold text-sm">Music Player</h3>
            </div>
            <div className="flex items-center">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMinimize}>
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closePlayer}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
        
        {!isMinimized && (
            <div className="w-full h-[calc(100%-56px)] rounded-b-xl overflow-hidden">
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
        )}
        </motion.div>
    </motion.div>
  );
};

export default MusicPlayer;
