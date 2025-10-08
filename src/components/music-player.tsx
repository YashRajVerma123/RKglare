
'use client';

import { useMusicPlayer } from '@/contexts/music-player-context';
import { motion } from 'framer-motion';
import { X, Minus, Music, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';

const MusicPlayer = () => {
  const { isOpen, isMinimized, closePlayer, toggleMinimize } = useMusicPlayer();

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ top: 0, left: 0, right: typeof window !== 'undefined' ? window.innerWidth - 350 : 0, bottom: typeof window !== 'undefined' ? window.innerHeight - 480 : 0 }}
      className="fixed top-1/2 left-1/2 w-[350px] h-[480px] z-[60] glass-card rounded-xl shadow-2xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, height: isMinimized ? 56 : 480 }}
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
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator"
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen={false}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            ></iframe>
        </div>
      )}
    </motion.div>
  );
};

export default MusicPlayer;
