import React from 'react'
import { useApp } from '../context/AppContext'
import DroneCard from '../components/DroneCard'
import ChatBot from '../components/ChatBot'
import PerformanceMetrics from '../components/PerformanceMetrics'

const Dashboard = () => {
  const { drones, dashboardStats, performance, notifications } = useApp()

  const onlineDrones = drones.filter(d => d.status === 'online').length
  const totalDrones = drones.length

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className="stat-card enhanced" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color + '20', color }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
        {trend && (
          <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className="dashboard enhanced">
      {/* Enhanced Header Stats */}
      <div className="dashboard-header">
        <div className="welcome-banner">
          <h1>SkyFleet Control Center</h1>
          <p>Real-time monitoring and management of your drone fleet</p>
        </div>
        <div className="stats-grid enhanced">
          <StatCard 
            title="Total Drones" 
            value={dashboardStats.total_drones || totalDrones}
            subtitle="4 deployed"
            icon="🚁"
            color="#3B82F6"
            trend={2}
          />
          <StatCard 
            title="Online Now" 
            value={dashboardStats.online_drones || onlineDrones}
            subtitle="3 active"
            icon="🟢"
            color="#10B981"
          />
          <StatCard 
            title="Avg Battery" 
            value={dashboardStats.avg_battery ? `${dashboardStats.avg_battery}%` : "52%"}
            subtitle="Good condition"
            icon="🔋"
            color="#F59E0B"
            trend={-5}
          />
          <StatCard 
            title="Active Missions" 
            value={dashboardStats.active_missions || 2}
            subtitle="1 pending"
            icon="🎯"
            color="#8B5CF6"
          />
        </div>
      </div>

      <div className="dashboard-content enhanced">
        {/* Performance Metrics */}
        <div className="metrics-section">
          <PerformanceMetrics />
        </div>

        {/* Drones Grid */}
        <div className="drones-section enhanced">
          <div className="section-header">
            <h2>🛸 Live Drone Fleet</h2>
            <div className="section-actions">
              <span className="drones-count">{drones.length} Drones Active</span>
              <button className="btn-outline">
                + Add Drone
              </button>
            </div>
          </div>
          
          <div className="drones-grid enhanced">
            {drones.map((drone, index) => (
              <DroneCard 
                key={drone.id} 
                drone={drone}
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>

          {drones.length === 0 && (
            <div className="empty-state enhanced">
              <div className="empty-icon">🚁</div>
              <h3>No Drones Connected</h3>
              <p>Drones will appear here when they come online</p>
              <button className="btn-primary">
                Deploy New Drone
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-panel enhanced">
          {notifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification enhanced ${notification.type}`}
              style={{ 
                borderLeftColor: 
                  notification.type === 'warning' ? '#F59E0B' :
                  notification.type === 'critical' ? '#EF4444' : '#3B82F6'
              }}
            >
              <div className="notification-icon">
                {notification.type === 'warning' ? '⚠️' : 
                 notification.type === 'critical' ? '🔴' : 'ℹ️'}
              </div>
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-time">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <button className="notification-close">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Chat Bot */}
      <ChatBot />
    </div>
  )
}

export default Dashboard