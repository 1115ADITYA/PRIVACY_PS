import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function ProfileCard({ device, index }) {
  // Generate random stable avatar string based on device ID
  const avatar = useMemo(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let str = '';
    for (let i = 0; i < 4; i++) {
      str += chars[Math.floor(Math.abs(Math.sin(device.id.charCodeAt(0) + i) * chars.length))];
    }
    return str;
  }, [device.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="glass rounded-xl p-4 flex items-center space-x-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
      
      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/50 relative">
        <span className="font-mono text-sm tracking-wider text-white/80">{avatar}</span>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black" />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-mono text-xs text-white/70 truncate">ID: {device.id.slice(0, 8)}</h3>
          <span className="text-[10px] text-white/30 font-mono">
            {new Date(device.connectedAt).toLocaleTimeString()}
          </span>
        </div>
        <div className="text-xs text-white/90 truncate font-sans font-semibold">
          {device.platform} • {device.screenSize}
        </div>
        
        {/* Advanced Data */}
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-mono text-white/50">
          <div className="truncate">IP: <span className="text-accent">{device.ip || 'Hidden'}</span></div>
          <div className="truncate">NET: <span className="text-white/70">{device.network}</span></div>
          <div className="truncate">BAT: <span className="text-white/70">{device.battery}</span></div>
          <div className="truncate">CPU: <span className="text-white/70">{device.cores}</span></div>
          <div className="truncate">MEM: <span className="text-white/70">{device.ram}</span></div>
          <div className="truncate">LNG: <span className="text-white/70">{device.language}</span></div>
        </div>
      </div>
    </motion.div>
  );
}
