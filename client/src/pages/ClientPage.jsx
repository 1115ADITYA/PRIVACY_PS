import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../socket';

export default function ClientPage() {
  const [status, setStatus] = useState('CONNECTING...');
  const [presentationState, setPresentationState] = useState('ACT_0');
  const [command, setCommand] = useState(null);
  const interactRef = useRef(null);

  useEffect(() => {
    socket.connect();

    const getDeviceInfo = () => ({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    });

    socket.on('connect', () => {
      setStatus('Welcome to ANTIGRAVITY');
      socket.emit('device:connect', getDeviceInfo());
    });

    socket.on('presentation:state_change', (newState) => {
      setPresentationState(newState);
    });

    socket.on('presentation:command', (cmd) => {
      setCommand(cmd);
      if (cmd === 'ERASING') {
        setTimeout(() => setCommand('INVISIBLE'), 3000);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('presentation:state_change');
      socket.off('presentation:command');
      socket.disconnect();
    };
  }, []);

  const handleInteraction = (e, type) => {
    if (presentationState !== 'ACT_2') return;

    let x = e.clientX;
    let y = e.clientY;

    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }

    // Normalize coordinates 0 to 1
    const nx = x / window.innerWidth;
    const ny = y / window.innerHeight;

    socket.emit('device:interaction', {
      type,
      x: nx,
      y: ny,
      timestamp: Date.now()
    });
  };

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (presentationState === 'ACT_2') {
        handleInteraction(e, 'move');
      }
    };
    
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousemove', handleTouchMove);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousemove', handleTouchMove);
    };
  }, [presentationState]);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none"
      onClick={(e) => handleInteraction(e, 'tap')}
      onTouchStart={(e) => handleInteraction(e, 'tap')}
    >
      <div className="scanlines"></div>
      
      <AnimatePresence mode="wait">
        {command === 'ERASING' && (
          <motion.div
            key="erasing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-black"
          >
            <h1 className="text-4xl font-mono text-accent glitch-text uppercase tracking-widest font-bold">
              Erasing...
            </h1>
          </motion.div>
        )}

        {command === 'INVISIBLE' && (
          <motion.div
            key="invisible"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black"
          >
            <h1 className="text-3xl md:text-5xl font-mono text-white tracking-[0.2em] mb-4 text-center px-4">
              YOU ARE NOW INVISIBLE.
            </h1>
            <p className="text-gray-500 font-sans tracking-wide text-sm md:text-base">
              Privacy should be the default.
            </p>
          </motion.div>
        )}

        {!command && (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center h-full w-full p-8"
          >
            {presentationState === 'ACT_0' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 border-t-2 border-l-2 border-white rounded-full animate-spin mx-auto mb-8"></div>
                <h1 className="text-xl md:text-2xl font-mono tracking-widest text-white/80 uppercase">
                  {status}
                </h1>
              </motion.div>
            )}

            {presentationState === 'ACT_1' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-white/50 font-mono text-sm tracking-widest"
              >
                CONNECTED TO MAINFRAME
              </motion.div>
            )}

            {presentationState === 'ACT_2' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center relative shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                  <div className="absolute inset-0 rounded-full border border-white/5 animate-ping"></div>
                  <span className="text-white/30 font-mono tracking-widest text-sm uppercase">Tap / Swipe</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
