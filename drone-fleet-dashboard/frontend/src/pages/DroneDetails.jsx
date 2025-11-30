import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const DroneDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [drone, setDrone] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDroneDetails()
  }, [id])

  const fetchDroneDetails = async () => {
    try {
      const response = await fetch(`/api/drones/${id}`)
      const data = await response.json()
      if (data.success) {
        setDrone(data.drone)
      }
    } catch (error) {
      console.error('Failed to fetch drone details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return '#10b981'
      case 'offline': return '#6b7280'
      case 'low_battery': return '#f59e0b'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading drone details...</p>
      </div>
    )
  }

  if (!drone) {
    return (
      <div className="error-container">
        <h2>Drone Not Found</h2>
        <p>The drone you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="drone-details-page">
      <div className="page-header">
        <button onClick={() => navigate('/')} className="btn-outline">
          ← Back to Dashboard
        </button>
        <h1>{drone.name}</h1>
        <span 
          className="status-badge"
          style={{ backgroundColor: getStatusColor(drone.status) }}
        >
          {drone.status}
        </span>
      </div>

      <div className="drone-details-grid">
        {/* Drone Information */}
        <div className="detail-card">
          <h3>Drone Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name</span>
              <span className="info-value">{drone.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value capitalize">{drone.status}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Battery</span>
              <div className="battery-display">
                <div 
                  className="battery-level"
                  style={{ width: `${drone.battery}%` }}
                />
                <span className="battery-percent">{drone.battery}%</span>
              </div>
            </div>
            <div className="info-item">
              <span className="info-label">Last Update</span>
              <span className="info-value">
                {new Date(drone.last_update).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Position Information */}
        <div className="detail-card">
          <h3>Position & Movement</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Latitude</span>
              <span className="info-value">{drone.lat.toFixed(6)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Longitude</span>
              <span className="info-value">{drone.lng.toFixed(6)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Speed</span>
              <span className="info-value">{drone.speed} m/s</span>
            </div>
            <div className="info-item">
              <span className="info-label">Altitude</span>
              <span className="info-value">{drone.altitude} m</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="detail-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="btn-primary">Start Mission</button>
            <button className="btn-secondary">Return to Home</button>
            <button className="btn-outline">Emergency Stop</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DroneDetails