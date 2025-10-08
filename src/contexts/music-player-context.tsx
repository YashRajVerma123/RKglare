
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MusicPlayerContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openPlayer: () => void;
  closePlayer: () => void;
  toggleMinimize: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openPlayer = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };
  const closePlayer = () => setIsOpen(false);
  const toggleMinimize = () => setIsMinimized(!isMinimized);

  return (
    <MusicPlayerContext.Provider value={{ isOpen, isMinimized, openPlayer, closePlayer, toggleMinimize }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
