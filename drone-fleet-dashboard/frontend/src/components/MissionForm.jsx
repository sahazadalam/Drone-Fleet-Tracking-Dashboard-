import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

const MissionForm = ({ onClose, onSubmit }) => {
  const { drones } = useApp()
  const [formData, setFormData] = useState({
    name: '',
    drone_id: '',
    type: 'surveillance'
  })

  const availableDrones = drones.filter(drone => 
    drone.status === 'online' || drone.status === 'maintenance'
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.drone_id) {
      onSubmit(formData)
    } else {
      alert('Please fill in all required fields')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale-in">
        <div className="modal-header">
          <h2>Create New Mission</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="mission-form">
          <div className="form-group">
            <label htmlFor="name">Mission Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter mission name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="drone_id">Select Drone *</label>
            <select
              id="drone_id"
              name="drone_id"
              value={formData.drone_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a drone</option>
              {availableDrones.map(drone => (
                <option key={drone.id} value={drone.id}>
                  {drone.name} ({drone.type}) - Battery: {drone.battery}% - {drone.status}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Mission Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="surveillance">Surveillance</option>
              <option value="delivery">Delivery</option>
              <option value="mapping">Mapping</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>

          <div className="selected-drone-info">
            {formData.drone_id && (
              <div className="drone-preview">
                <h4>Selected Drone:</h4>
                {availableDrones
                  .filter(d => d.id == formData.drone_id)
                  .map(drone => (
                    <div key={drone.id} className="drone-preview-card">
                      <span className="drone-name">{drone.name}</span>
                      <span className="drone-status" style={{ 
                        color: drone.status === 'online' ? '#10B981' : '#F59E0B' 
                      }}>
                        {drone.status}
                      </span>
                      <span className="drone-battery">Battery: {drone.battery}%</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Mission
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MissionForm