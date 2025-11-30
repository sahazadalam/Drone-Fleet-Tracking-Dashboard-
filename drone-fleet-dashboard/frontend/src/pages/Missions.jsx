import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import MissionForm from '../components/MissionForm'

const Missions = () => {
  const { missions, controlMission, createMission } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [selectedMission, setSelectedMission] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981'
      case 'running': return '#3B82F6'
      case 'pending': return '#F59E0B'
      case 'paused': return '#8B5CF6'
      case 'cancelled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅'
      case 'running': return '🟢'
      case 'pending': return '🟡'
      case 'paused': return '🟣'
      case 'cancelled': return '🔴'
      default: return '⚪'
    }
  }

  const handleMissionAction = (missionId, action) => {
    controlMission(missionId, action)
  }

  const handleCreateMission = async (missionData) => {
    await createMission(missionData)
    setShowForm(false)
  }

  const handleViewDetails = (mission) => {
    setSelectedMission(mission)
    // In a real app, this would navigate to mission details page
    alert(`Mission Details:\n\nName: ${mission.name}\nStatus: ${mission.status}\nProgress: ${mission.progress}%\nDrone ID: ${mission.drone_id}\nPriority: ${mission.priority}`)
  }

  const MissionActions = ({ mission }) => {
    switch (mission.status) {
      case 'pending':
        return (
          <>
            <button 
              className="btn-secondary"
              onClick={() => handleMissionAction(mission.id, 'resume')}
            >
              Start Mission
            </button>
            <button 
              className="btn-outline"
              onClick={() => handleMissionAction(mission.id, 'cancel')}
            >
              Cancel
            </button>
          </>
        )
      case 'running':
        return (
          <>
            <button 
              className="btn-warning"
              onClick={() => handleMissionAction(mission.id, 'pause')}
            >
              ⏸️ Pause
            </button>
            <button 
              className="btn-outline"
              onClick={() => handleMissionAction(mission.id, 'cancel')}
            >
              Cancel
            </button>
          </>
        )
      case 'paused':
        return (
          <>
            <button 
              className="btn-secondary"
              onClick={() => handleMissionAction(mission.id, 'resume')}
            >
              ▶️ Resume
            </button>
            <button 
              className="btn-outline"
              onClick={() => handleMissionAction(mission.id, 'cancel')}
            >
              Cancel
            </button>
          </>
        )
      case 'completed':
        return (
          <button className="btn-outline" disabled>
            Completed
          </button>
        )
      case 'cancelled':
        return (
          <button className="btn-outline" disabled>
            Cancelled
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="missions-page">
      <div className="page-header">
        <h1>Mission Control</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Create Mission
        </button>
      </div>

      {showForm && (
        <MissionForm 
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateMission}
        />
      )}

      <div className="missions-grid">
        {missions.map((mission, index) => (
          <div 
            key={mission.id}
            className="mission-card animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="mission-header">
              <div>
                <h3>{mission.name}</h3>
                <div className="mission-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${mission.progress}%`,
                        backgroundColor: getStatusColor(mission.status)
                      }}
                    />
                  </div>
                  <span className="progress-text">{mission.progress}%</span>
                </div>
              </div>
              <div className="mission-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(mission.status) }}
                >
                  {getStatusIcon(mission.status)} {mission.status}
                </span>
                <span className="priority-badge">{mission.priority}</span>
              </div>
            </div>

            <div className="mission-info">
              <div className="info-row">
                <span>Drone ID:</span>
                <span className="drone-id">#{mission.drone_id}</span>
              </div>
              <div className="info-row">
                <span>Created:</span>
                <span>{new Date(mission.created_at).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span>Duration:</span>
                <span>{Math.floor((Date.now() - new Date(mission.created_at).getTime()) / 60000)} min</span>
              </div>
            </div>

            <div className="mission-actions">
              <MissionActions mission={mission} />
              <button 
                className="btn-outline"
                onClick={() => handleViewDetails(mission)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {missions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Missions Created</h3>
          <p>Create your first mission to start automated drone operations</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            Create First Mission
          </button>
        </div>
      )}
    </div>
  )
}

export default Missions