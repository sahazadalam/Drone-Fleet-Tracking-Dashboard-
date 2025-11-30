import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const Navbar = () => {
  const location = useLocation()
  const { isConnected, alerts } = useApp()

  const isActive = (path) => location.pathname === path

  const unreadAlerts = alerts.filter(alert => !alert.read).length

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="logo">🚁</div>
        <span className="brand-text">SkyFleet Pro</span>
        <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`} />
      </div>

      <div className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          📊 Dashboard
        </Link>
        <Link 
          to="/missions" 
          className={`nav-link ${isActive('/missions') ? 'active' : ''}`}
        >
          🎯 Missions
        </Link>
        <Link 
          to="/analytics" 
          className={`nav-link ${isActive('/analytics') ? 'active' : ''}`}
        >
          📈 Analytics
        </Link>
        <Link 
          to="/alerts" 
          className={`nav-link ${isActive('/alerts') ? 'active' : ''}`}
        >
          🔔 Alerts {unreadAlerts > 0 && <span className="badge">{unreadAlerts}</span>}
        </Link>
      </div>

      <div className="nav-actions">
        <div className="status-indicator">
          <span className="status-text">
            {isConnected ? '🟢 Live' : '🔴 Offline'}
          </span>
        </div>
        <div className="user-menu">
          <button className="user-avatar">
            👨‍💼
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar