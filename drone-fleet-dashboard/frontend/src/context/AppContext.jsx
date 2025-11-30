import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { apiService } from '../services/api'

const AppContext = createContext()

const initialState = {
  drones: [],
  missions: [],
  alerts: [],
  performance: {},
  analytics: {},
  dashboardStats: {},
  user: null,
  isConnected: false,
  notifications: [],
  loading: true,
  error: null,
  socket: null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_DRONES':
      return { ...state, drones: action.payload, loading: false, error: null }
    case 'UPDATE_DRONES':
      return { ...state, drones: action.payload }
    case 'UPDATE_MISSIONS':
      return { ...state, missions: action.payload }
    case 'SET_MISSIONS':
      return { ...state, missions: action.payload }
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload }
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] }
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload ? { ...alert, read: true } : alert
        )
      }
    case 'SET_PERFORMANCE':
      return { ...state, performance: action.payload }
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload }
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload }
    case 'SET_SOCKET':
      return { ...state, socket: action.payload }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 10)
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    initializeApp()
    return () => {
      // Cleanup WebSocket on unmount
      if (state.socket) {
        state.socket.close()
      }
    }
  }, [])

  const initializeApp = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Fetch initial data
      await Promise.all([
        fetchDrones(),
        fetchDashboardData(),
        fetchMissions(),
        fetchAlerts(),
        fetchAnalytics()
      ])
      
      // Connect WebSocket after data is loaded
      connectWebSocket()
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
      console.error('Failed to initialize app:', error)
    }
  }

  const connectWebSocket = () => {
    try {
      const wsUrl = 'ws://localhost:8080/ws/1'
      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log('✅ WebSocket connected to backend')
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
        dispatch({ type: 'SET_SOCKET', payload: socket })
        dispatch({ type: 'SET_ERROR', payload: null })
        
        // Send initial connection message
        socket.send(JSON.stringify({
          type: 'client_connected',
          message: 'Frontend connected'
        }))
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('📡 WebSocket message received:', data.type)
          
          switch (data.type) {
            case 'live_update':
              dispatch({ type: 'UPDATE_DRONES', payload: data.drones })
              dispatch({ type: 'UPDATE_MISSIONS', payload: data.missions })
              
              // Check for low battery alerts
              data.drones.forEach(drone => {
                if (drone.battery < 20 && drone.status === 'online') {
                  dispatch({
                    type: 'ADD_NOTIFICATION',
                    payload: {
                      id: Date.now(),
                      type: 'warning',
                      message: `Low battery on ${drone.name}: ${drone.battery}%`,
                      timestamp: new Date()
                    }
                  })
                }
              })
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      socket.onclose = () => {
        console.log('❌ WebSocket disconnected')
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
        // Attempt reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        dispatch({ type: 'SET_ERROR', payload: 'WebSocket connection failed' })
      }

    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to establish real-time connection' })
    }
  }

  const sendWebSocketMessage = (message) => {
    if (state.socket && state.socket.readyState === WebSocket.OPEN) {
      state.socket.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected')
    }
  }

  const controlDrone = async (droneId, action) => {
    try {
      // Send via WebSocket for real-time
      sendWebSocketMessage({
        type: 'control_drone',
        drone_id: droneId,
        action: action
      })

      // Also send via REST API for reliability
      const response = await fetch(`http://localhost:8080/api/drones/${droneId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            message: `Drone command sent: ${action}`,
            timestamp: new Date()
          }
        })
      }
    } catch (error) {
      console.error('Failed to control drone:', error)
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          message: `Failed to send command: ${error.message}`,
          timestamp: new Date()
        }
      })
    }
  }

  const controlMission = async (missionId, action) => {
    try {
      // Send via WebSocket for real-time
      sendWebSocketMessage({
        type: 'control_mission',
        mission_id: missionId,
        action: action
      })

      // Also send via REST API for reliability
      const response = await fetch(`http://localhost:8080/api/missions/${missionId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            message: `Mission ${action}d successfully`,
            timestamp: new Date()
          }
        })
      }
    } catch (error) {
      console.error('Failed to control mission:', error)
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          message: `Failed to ${action} mission: ${error.message}`,
          timestamp: new Date()
        }
      })
    }
  }

  const createMission = async (missionData) => {
    try {
      const response = await fetch('http://localhost:8080/api/missions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(missionData)
      })

      const data = await response.json()
      
      if (data.success) {
        dispatch({ type: 'SET_MISSIONS', payload: [...state.missions, data.mission] })
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'success',
            message: `Mission "${missionData.name}" created successfully`,
            timestamp: new Date()
          }
        })
        return data
      }
    } catch (error) {
      console.error('Failed to create mission:', error)
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          message: `Failed to create mission: ${error.message}`,
          timestamp: new Date()
        }
      })
    }
  }

  const fetchDrones = async () => {
    try {
      const data = await apiService.fetchDrones()
      if (data.success) {
        dispatch({ type: 'SET_DRONES', payload: data.drones })
        console.log('✅ Loaded drones:', data.drones.length)
      } else {
        throw new Error(data.error || 'Failed to fetch drones')
      }
    } catch (error) {
      console.error('❌ Failed to fetch drones:', error)
      dispatch({ type: 'SET_ERROR', payload: `Drones: ${error.message}` })
    }
  }

  const fetchDashboardData = async () => {
    try {
      const data = await apiService.fetchDashboard()
      if (data.success) {
        dispatch({ type: 'SET_DASHBOARD_STATS', payload: data.data.stats })
        dispatch({ type: 'SET_PERFORMANCE', payload: data.data.performance })
        dispatch({ type: 'SET_ALERTS', payload: data.data.recent_alerts })
        console.log('✅ Loaded dashboard data')
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard')
      }
    } catch (error) {
      console.error('❌ Failed to fetch dashboard:', error)
      dispatch({ type: 'SET_ERROR', payload: `Dashboard: ${error.message}` })
    }
  }

  const fetchMissions = async () => {
    try {
      const data = await apiService.fetchMissions()
      if (data.success) {
        dispatch({ type: 'SET_MISSIONS', payload: data.missions })
        console.log('✅ Loaded missions:', data.missions.length)
      } else {
        throw new Error(data.error || 'Failed to fetch missions')
      }
    } catch (error) {
      console.error('❌ Failed to fetch missions:', error)
      dispatch({ type: 'SET_ERROR', payload: `Missions: ${error.message}` })
    }
  }

  const fetchAlerts = async () => {
    try {
      const data = await apiService.fetchAlerts()
      if (data.success) {
        dispatch({ type: 'SET_ALERTS', payload: data.alerts })
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const data = await apiService.fetchAnalytics()
      if (data.success) {
        dispatch({ type: 'SET_ANALYTICS', payload: data.data })
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const markAlertAsRead = async (alertId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/alerts/${alertId}/read`, {
        method: 'PUT'
      })
      if (response.ok) {
        dispatch({ type: 'MARK_ALERT_READ', payload: alertId })
      }
    } catch (error) {
      console.error('Failed to mark alert as read:', error)
    }
  }

  const retryConnection = () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    initializeApp()
  }

  const value = {
    ...state,
    dispatch,
    fetchDrones,
    fetchMissions,
    fetchAnalytics,
    fetchDashboardData,
    markAlertAsRead,
    retryConnection,
    controlDrone,
    controlMission,
    createMission,
    sendWebSocketMessage
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}