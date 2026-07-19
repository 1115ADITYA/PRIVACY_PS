const state = require('../state');

function setupSocketEvents(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Initial state to dashboard
    socket.emit('dashboard:init', {
      devices: Array.from(state.devices.values()),
      presentationState: state.presentationState
    });

    // Mobile device connecting
    socket.on('device:connect', (deviceInfo) => {
      const profile = {
        id: socket.id,
        connectedAt: Date.now(),
        ...deviceInfo
      };
      
      state.devices.set(socket.id, profile);
      console.log('Device connected:', profile);
      
      // Notify dashboard
      socket.broadcast.emit('device:joined', profile);
    });

    // Mobile device interacting (tap, swipe, etc.)
    socket.on('device:interaction', (interactionData) => {
      // Forward interaction to dashboard
      socket.broadcast.emit('interaction:received', {
        deviceId: socket.id,
        ...interactionData
      });
    });

    // Presenter changing state
    socket.on('dashboard:set_state', (newState) => {
      state.presentationState = newState;
      // Broadcast state change to all clients
      io.emit('presentation:state_change', newState);
      
      if (newState === 'ACT_3') {
        io.emit('presentation:command', 'ERASING');
      } else {
        io.emit('presentation:command', null);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      if (state.devices.has(socket.id)) {
        state.devices.delete(socket.id);
        io.emit('device:left', socket.id);
      }
    });
  });
}

module.exports = setupSocketEvents;
