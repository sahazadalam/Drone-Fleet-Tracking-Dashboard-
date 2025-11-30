// Application constants
export const DRONE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  LOW_BATTERY: 'low_battery',
  ERROR: 'error',
  MAINTENANCE: 'maintenance'
}

export const MISSION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
}

export const COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  OFFLINE: '#6b7280'
}

export const MAP_CONFIG = {
  DEFAULT_CENTER: [37.7749, -122.4194],
  DEFAULT_ZOOM: 13,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

export const WEBSOCKET_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  MAX_RECONNECT_ATTEMPTS: 5
}

// Demo data for development
export const DEMO_DRONES = [
  {
    id: 1,
    name: 'Alpha-1',
    status: 'online',
    battery: 85,
    lat: 37.7749,
    lng: -122.4194,
    speed: 15.5,
    altitude: 120,
    last_update: new Date()
  },
  {
    id: 2,
    name: 'Beta-2',
    status: 'online',
    battery: 72,
    lat: 37.7849,
    lng: -122.4094,
    speed: 12.3,
    altitude: 95,
    last_update: new Date()
  }
]

export const CHATBOT_RESPONSES = {
  GREETING: "Hello! I'm your Drone Fleet Assistant. How can I help you today?",
  BATTERY_INFO: "Drones typically have battery life of 20-30 minutes. Low battery warnings appear below 20%.",
  MISSION_HELP: "Create missions in the Missions tab. You can set waypoints and assign drones to automated routes.",
  STATUS_INFO: "Green = Online, Yellow = Low Battery, Red = Error/Offline. Real-time updates appear on the map."
}