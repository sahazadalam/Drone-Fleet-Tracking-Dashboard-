import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const DroneCard = ({ drone }) => {
  const navigate = useNavigate()
  const { controlDrone } = useApp()
  const [showActions, setShowActions] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10B981'
      case 'offline': return '#6B7280'
      case 'low_battery': return '#F59E0B'
      case 'maintenance': return '#8B5CF6'
      case 'returning_home': return '#3B82F6'
      case 'emergency_stop': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return '🟢'
      case 'offline': return '⚫'
      case 'low_battery': return '🟡'
      case 'maintenance': return '🟣'
      case 'returning_home': return '🔵'
      case 'emergency_stop': return '🔴'
      default: return '⚪'
    }
  }

  const getBatteryColor = (battery) => {
    if (battery > 70) return '#10B981'
    if (battery > 30) return '#F59E0B'
    return '#EF4444'
  }

  const getSignalStrength = (signal) => {
    if (signal > 80) return 'Excellent'
    if (signal > 60) return 'Good'
    if (signal > 40) return 'Fair'
    return 'Poor'
  }

  const getSignalColor = (signal) => {
    if (signal > 80) return '#10B981'
    if (signal > 60) return '#3B82F6'
    if (signal > 40) return '#F59E0B'
    return '#EF4444'
  }

  const handleDroneClick = () => {
    navigate(`/drone/${drone.id}`)
  }

  const handleQuickAction = (action) => {
    switch (action) {
      case 'start_mission':
        controlDrone(drone.id, 'start_mission')
        break
      case 'return_home':
        controlDrone(drone.id, 'return_home')
        break
      case 'emergency_stop':
        if (window.confirm(`Are you sure you want to emergency stop ${drone.name}?`)) {
          controlDrone(drone.id, 'emergency_stop')
        }
        break
    }
    setShowActions(false)
  }

  const getAvailableActions = () => {
    const actions = []
    
    if (drone.status === 'online') {
      actions.push(
        { label: 'Start Mission', action: 'start_mission', color: '#10B981' },
        { label: 'Return Home', action: 'return_home', color: '#3B82F6' },
        { label: 'Emergency Stop', action: 'emergency_stop', color: '#EF4444' }
      )
    } else if (drone.status === 'maintenance') {
      actions.push(
        { label: 'Start Mission', action: 'start_mission', color: '#10B981' }
      )
    } else if (drone.status === 'returning_home' || drone.status === 'emergency_stop') {
      actions.push(
        { label: 'Resume Mission', action: 'start_mission', color: '#10B981' }
      )
    }

    return actions
  }

  const availableActions = getAvailableActions()

  return (
    <div 
      className="drone-card enhanced"
      style={{ 
        cursor: 'pointer',
        borderLeftColor: drone.color || '#3B82F6'
      }}
    >
      <div className="drone-card-header">
        <div className="drone-title" onClick={handleDroneClick}>
          <h3 className="drone-name">{drone.name}</h3>
          <span className="drone-type">{drone.type}</span>
        </div>
        <div className="status-indicator">
          <span className="status-icon">{getStatusIcon(drone.status)}</span>
          <span 
            className="status-text"
            style={{ color: getStatusColor(drone.status) }}
          >
            {drone.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="drone-info-grid enhanced" onClick={handleDroneClick}>
        <div className="info-item">
          <span className="info-label">Battery</span>
          <div className="battery-container">
            <div 
              className="battery-bar"
              style={{ 
                width: `${drone.battery}%`,
                backgroundColor: getBatteryColor(drone.battery)
              }}
            />
            <span className="battery-text">{drone.battery}%</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Speed</span>
          <div className="value-with-unit">
            <span className="info-value">{drone.speed.toFixed(1)}</span>
            <span className="unit">m/s</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Altitude</span>
          <div className="value-with-unit">
            <span className="info-value">{drone.altitude}</span>
            <span className="unit">m</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Signal</span>
          <div className="signal-info">
            <div 
              className="signal-strength"
              style={{ color: getSignalColor(drone.signal) }}
            >
              {getSignalStrength(drone.signal)}
            </div>
            <span className="signal-value">{drone.signal}%</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Temperature</span>
          <div className="value-with-unit">
            <span className="info-value">{drone.temperature}</span>
            <span className="unit">°C</span>
          </div>
        </div>

        <div className="info-item">
          <span className="info-label">Last Update</span>
          <span className="info-value time">
            {new Date(drone.last_update).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="drone-card-footer">
        <div className="drone-actions">
          {availableActions.length > 0 && (
            <div className="action-dropdown">
              <button 
                className="btn-small btn-primary"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(!showActions)
                }}
              >
                Quick Actions ▼
              </button>
              
              {showActions && (
                <div className="action-menu">
                  {availableActions.map((action, index) => (
                    <button
                      key={index}
                      className="action-item"
                      style={{ borderLeftColor: action.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickAction(action.action)
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <button 
            className="btn-small btn-outline"
            onClick={(e) => {
              e.stopPropagation()
              handleDroneClick()
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default DroneCard