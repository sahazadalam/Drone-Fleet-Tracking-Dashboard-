import React, { useEffect } from 'react'
import { useApp } from '../context/AppContext'

const Analytics = () => {
  const { analytics, performance, fetchAnalytics } = useApp()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ backgroundColor: color + '20', color }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{title}</p>
        {change && <span className={`change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>}
      </div>
    </div>
  )

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive insights into your drone fleet performance</p>
      </div>

      {/* Performance Metrics */}
      <div className="section">
        <h2>Performance Overview</h2>
        <div className="stats-grid">
          <StatCard 
            title="System Uptime" 
            value={performance.uptime || "99.8%"} 
            icon="🟢" 
            color="#10B981"
          />
          <StatCard 
            title="Response Time" 
            value={performance.response_time || "45ms"} 
            icon="⚡" 
            color="#3B82F6"
          />
          <StatCard 
            title="Completed Missions" 
            value={performance.completed_missions || "127"} 
            icon="✅" 
            color="#8B5CF6"
          />
          <StatCard 
            title="Total Flight Time" 
            value={performance.total_flight_time || "248h"} 
            icon="🕒" 
            color="#F59E0B"
          />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Battery Distribution</h3>
          <div className="chart-container">
            {analytics.battery_distribution?.map((item, index) => (
              <div key={index} className="chart-item">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ 
                      height: `${item.count * 25}%`,
                      backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'][index]
                    }}
                  >
                    <span className="chart-value">{item.count}</span>
                  </div>
                </div>
                <span className="chart-label">{item.range}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Drone Status</h3>
          <div className="status-chart">
            {analytics.status_distribution && Object.entries(analytics.status_distribution).map(([status, count], index) => (
              <div key={status} className="status-item">
                <div className="status-info">
                  <span className="status-dot" style={{
                    backgroundColor: 
                      status === 'online' ? '#10B981' :
                      status === 'offline' ? '#6B7280' : '#F59E0B'
                  }} />
                  <span className="status-name">{status}</span>
                </div>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card full-width">
          <h3>Mission Success Rate</h3>
          <div className="success-rate">
            <div className="gauge">
              <div 
                className="gauge-fill"
                style={{ 
                  transform: `rotate(${(analytics.mission_success_rate || 95.5) * 1.8}deg)`
                }}
              />
              <div className="gauge-center">
                <span className="gauge-value">{analytics.mission_success_rate || 95.5}%</span>
              </div>
            </div>
            <div className="success-info">
              <p>Average mission success rate across all operations</p>
              <div className="success-stats">
                <div className="stat">
                  <span className="stat-value">{analytics.average_flight_time || "45m"}</span>
                  <span className="stat-label">Avg Flight Time</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{analytics.most_active_drone || "Alpha-1"}</span>
                  <span className="stat-label">Most Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics