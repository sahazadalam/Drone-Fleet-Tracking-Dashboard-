const API_BASE = 'http://localhost:8080'

// Simple API service with direct fetch calls
export const apiService = {
  async fetchDrones() {
    try {
      console.log('🔄 Fetching drones from backend...')
      const response = await fetch(`${API_BASE}/api/drones`)
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Drones loaded:', data.drones?.length || 0)
      return data
    } catch (error) {
      console.error('❌ Failed to fetch drones:', error)
      // Return demo data if backend is down
      return {
        success: true,
        drones: [
          {
            id: 1,
            name: "Demo Drone",
            status: "online",
            battery: 75,
            lat: 37.7749,
            lng: -122.4194,
            speed: 10.5,
            altitude: 100,
            temperature: 25,
            signal: 90,
            last_update: new Date(),
            type: "demo",
            color: "#3B82F6"
          }
        ]
      }
    }
  },

  async fetchDashboard() {
    try {
      console.log('🔄 Fetching dashboard from backend...')
      const response = await fetch(`${API_BASE}/api/dashboard`)
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ Dashboard loaded')
      return data
    } catch (error) {
      console.error('❌ Failed to fetch dashboard:', error)
      // Return demo data if backend is down
      return {
        success: true,
        data: {
          stats: {
            total_drones: 1,
            online_drones: 1,
            avg_battery: 75,
            active_missions: 0,
            total_alerts: 0
          },
          performance: {
            uptime: "99.9%",
            response_time: "50ms",
            completed_missions: 0,
            active_drones: 1,
            total_flight_time: "0h"
          },
          recent_alerts: []
        }
      }
    }
  },

  async fetchMissions() {
    try {
      const response = await fetch(`${API_BASE}/api/missions`)
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch missions:', error)
      return { success: true, missions: [] }
    }
  },

  async fetchAlerts() {
    try {
      const response = await fetch(`${API_BASE}/api/alerts`)
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      return { success: true, alerts: [] }
    }
  },

  async fetchAnalytics() {
    try {
      const response = await fetch(`${API_BASE}/api/analytics`)
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      return { success: true, data: {} }
    }
  }
}