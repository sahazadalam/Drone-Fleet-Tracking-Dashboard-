import React from 'react'
import { useApp } from '../context/AppContext'

const PerformanceMetrics = () => {
  const { performance } = useApp()

  const metrics = [
    {
      title: "System Uptime",
      value: performance.uptime || "99.8%",
      icon: "🟢",
      color: "#10B981",
      description: "Overall system reliability"
    },
    {
      title: "Response Time",
      value: performance.response_time || "45ms",
      icon: "⚡",
      color: "#3B82F6",
      description: "Average API response"
    },
    {
      title: "Mission Success",
      value: "95.5%",
      icon: "✅",
      color: "#8B5CF6",
      description: "Completed successfully"
    },
    {
      title: "Flight Time",
      value: performance.total_flight_time || "248h",
      icon: "🕒",
      color: "#F59E0B",
      description: "Total operational hours"
    }
  ]

  return (
    <div className="performance-metrics">
      <h3>📈 Performance Metrics</h3>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-header">
              <div 
                className="metric-icon"
                style={{ backgroundColor: metric.color + '20', color: metric.color }}
              >
                {metric.icon}
              </div>
              <span className="metric-title">{metric.title}</span>
            </div>
            <div className="metric-value" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="metric-description">
              {metric.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PerformanceMetrics