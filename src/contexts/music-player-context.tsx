
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MusicPlayerContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openPlayer: () => void;
  closePlayer: () => void;
  toggleMinimize: () => void;
  togglePlayer: () => void;
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

  const toggleMinimize = () => {
      if (isOpen) {
        setIsMinimized(!isMinimized);
      }
  };
  
  const togglePlayer = () => {
      if (isOpen) {
          if (isMinimized) {
              // If it's open but minimized, un-minimize it
              setIsMinimized(false);
          } else {
              // If it's open and not minimized, close it
              setIsOpen(false);
          }
      } else {
          // If it's closed, open it
          setIsOpen(true);
          setIsMinimized(false);
      }
  };

  return (
    <MusicPlayerContext.Provider value={{ isOpen, isMinimized, openPlayer, closePlayer, toggleMinimize, togglePlayer }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};
