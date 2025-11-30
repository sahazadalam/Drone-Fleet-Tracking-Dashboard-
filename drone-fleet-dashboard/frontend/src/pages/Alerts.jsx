import React, { useEffect } from 'react'
import { useApp } from '../context/AppContext'

const Alerts = () => {
  const { alerts, markAlertAsRead } = useApp()

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🔴'
      case 'warning': return '🟡'
      case 'info': return '🔵'
      default: return '⚪'
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return '#EF4444'
      case 'warning': return '#F59E0B'
      case 'info': return '#3B82F6'
      default: return '#6B7280'
    }
  }

  const handleMarkAsRead = (alertId) => {
    markAlertAsRead(alertId)
  }

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1>Alert Center</h1>
          <p>Monitor and manage system alerts and notifications</p>
        </div>
        <div className="alert-stats">
          <span className="stat">
            Total: <strong>{alerts.length}</strong>
          </span>
          <span className="stat">
            Unread: <strong>{alerts.filter(a => !a.read).length}</strong>
          </span>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No Alerts</h3>
            <p>All systems are operating normally</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`alert-item ${alert.read ? 'read' : 'unread'}`}
              style={{ borderLeftColor: getAlertColor(alert.type) }}
            >
              <div className="alert-icon">
                {getAlertIcon(alert.type)}
              </div>
              <div className="alert-content">
                <div className="alert-header">
                  <h4>{alert.message}</h4>
                  <span className="alert-type" style={{ color: getAlertColor(alert.type) }}>
                    {alert.type}
                  </span>
                </div>
                <div className="alert-meta">
                  <span className="alert-time">
                    {new Date(alert.time).toLocaleString()}
                  </span>
                  {alert.drone_id && (
                    <span className="alert-drone">
                      Drone ID: {alert.drone_id}
                    </span>
                  )}
                </div>
              </div>
              <div className="alert-actions">
                {!alert.read && (
                  <button 
                    className="btn-outline"
                    onClick={() => handleMarkAsRead(alert.id)}
                  >
                    Mark Read
                  </button>
                )}
                <button className="btn-text">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Alerts