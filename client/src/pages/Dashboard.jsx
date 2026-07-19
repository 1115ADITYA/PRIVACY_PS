import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { socket } from '../socket';
import ProfileCard from '../components/ProfileCard';
import CanvasLayer from '../components/CanvasLayer';

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [presentationState, setPresentationState] = useState('ACT_0');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    // Generate QR for the local network IP or localhost
    const url = window.location.origin;
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#00000000'
      }
    }).then(setQrCodeUrl);

    socket.connect();

    socket.on('dashboard:init', (data) => {
      setDevices(data.devices);
      setPresentationState(data.presentationState);
    });

    socket.on('device:joined', (profile) => {
      setDevices(prev => [...prev, profile]);
    });

    socket.on('device:left', (id) => {
      setDevices(prev => prev.filter(d => d.id !== id));
    });

    socket.on('presentation:state_change', (newState) => {
      setPresentationState(newState);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '0') changeState('ACT_0');
      if (e.key === '1') changeState('ACT_1');
      if (e.key === '2') changeState('ACT_2');
      if (e.key === '3') changeState('ACT_3');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeState = (newState) => {
    socket.emit('dashboard:set_state', newState);
    setPresentationState(newState);
  };

  // Metrics
  const avgScreen = devices.length ? 'Mobile' : 'N/A'; // Simplified
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-screen bg-black overflow-hidden flex flex-col ${
        presentationState === 'ACT_3' ? 'glitch-container' : ''
      }`}
    >
      <div className="scanlines z-50"></div>
      
      {/* Top Bar Metrics */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: presentationState !== 'ACT_3' ? 1 : 0 }}
        className="h-16 border-b border-white/10 glass px-8 flex items-center justify-between z-40"
      >
        <div className="flex items-center space-x-8 font-mono text-sm">
          <span className="text-white/50">ANTIGRAVITY<span className="text-accent animate-pulse">_</span></span>
          <div className="flex space-x-4 text-white/30">
            <span>DEVICES: <span className="text-white/80">{devices.length}</span></span>
            <span>AVG_SCR: <span className="text-white/80">{avgScreen}</span></span>
          </div>
        </div>
        <div className="font-mono text-xs text-white/30">
          STATE: <span className="text-white">{presentationState}</span>
        </div>
      </motion.div>

      <div className="flex-1 relative z-30 p-8 flex flex-col">
        
        {/* ACT 0: Connect */}
        <AnimatePresence>
          {presentationState === 'ACT_0' && (
            <motion.div 
              key="act0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="glass p-8 rounded-3xl neon-glow mb-8">
                {qrCodeUrl && <img src={qrCodeUrl} alt="Connect QR" className="w-64 h-64" />}
              </div>
              <h2 className="font-mono text-2xl tracking-[0.3em] uppercase text-white/80">
                Join the Network
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACT 1 & 2: Reveal & Interact */}
        <AnimatePresence>
          {(presentationState === 'ACT_1' || presentationState === 'ACT_2') && (
            <motion.div 
              key="act12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              className="w-full h-full"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 auto-rows-max">
                <AnimatePresence>
                  {devices.map((device, i) => (
                    <ProfileCard key={device.id} device={device} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* ACT 3: The Antigravity Moment */}
        <AnimatePresence>
          {presentationState === 'ACT_3' && (
            <motion.div 
              key="act3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2, duration: 2 }}
                className="text-center"
              >
                <h1 className="text-6xl font-mono text-white tracking-[0.2em] mb-4">
                  YOU ARE NOW INVISIBLE.
                </h1>
                <p className="text-white/40 font-sans tracking-widest uppercase">
                  Privacy should be the default.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CanvasLayer isActive={presentationState === 'ACT_2'} />

      <style>{`
        .glitch-container {
          animation: glitch-anim 0.2s linear infinite;
        }
        @keyframes glitch-anim {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
      `}</style>
    </div>
  );
}
