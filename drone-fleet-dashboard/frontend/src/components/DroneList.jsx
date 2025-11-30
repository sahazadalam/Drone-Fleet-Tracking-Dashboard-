import React from 'react'
import DroneCard from './DroneCard'

const DroneList = ({ drones }) => {
  if (drones.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛸</div>
        <h3>No Drones Available</h3>
        <p>Add drones to get started with your fleet management</p>
      </div>
    )
  }

  return (
    <div className="drones-grid">
      {drones.map((drone, index) => (
        <DroneCard 
          key={drone.id} 
          drone={drone}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  )
}

export default DroneList