import React, { useEffect, useState } from 'react'

const ConnectionStatus = () => {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [dronesCount, setDronesCount] = useState(0)

  useEffect(() => {
    checkBackendConnection()
  }, [])

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/drones')
      if (response.ok) {
        const data = await response.json()
        setBackendStatus('connected')
        setDronesCount(data.drones?.length || 0)
      } else {
        setBackendStatus('error')
      }
    } catch (error) {
      setBackendStatus('error')
      console.error('Backend connection failed:', error)
    }
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected': return '#10B981'
      case 'checking': return '#F59E0B'
      case 'error': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected': return `Connected (${dronesCount} drones)`
      case 'checking': return 'Checking connection...'
      case 'error': return 'Backend connection failed'
      default: return 'Unknown status'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '8px 12px',
      borderRadius: '8px',
      backgroundColor: getStatusColor(),
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      {getStatusText()}
    </div>
  )
}

export default ConnectionStatus