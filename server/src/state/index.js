// Simple in-memory state
const state = {
  devices: new Map(), // socketId -> deviceProfile
  presentationState: 'ACT_0' // ACT_0, ACT_1, ACT_2, ACT_3
};

module.exports = state;
