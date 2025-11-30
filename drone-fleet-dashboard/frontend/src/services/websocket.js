let socket = null

export const connectWebSocket = (dispatch) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws/1`
  
  socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    console.log('WebSocket connected')
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: true })
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      if (data.type === 'drone_update') {
        dispatch({ type: 'UPDATE_DRONE', payload: data.drone })
        
        // Add notification for significant events
        if (data.drone.battery < 20) {
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now(),
              type: 'warning',
              message: `Low battery on ${data.drone.name}: ${data.drone.battery}%`,
              timestamp: new Date()
            }
          })
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error)
    }
  }

  socket.onclose = () => {
    console.log('WebSocket disconnected')
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: false })
    
    // Attempt to reconnect after 3 seconds
    setTimeout(() => connectWebSocket(dispatch), 3000)
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close()
    socket = null
  }
}

export const sendWebSocketMessage = (message) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message))
  }
}