import React, { useState, useRef, useEffect } from 'react'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Drone Fleet Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }])
    }, 1000)
  }

  const generateBotResponse = (message) => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('battery') || lowerMessage.includes('power')) {
      return "Drones typically have battery life of 20-30 minutes. You can check individual drone battery levels on the dashboard. Low battery warnings appear when below 20%."
    } else if (lowerMessage.includes('mission') || lowerMessage.includes('task')) {
      return "To create a mission, go to the Missions page, click 'Create Mission', select a drone, and add waypoints. Missions can be started, paused, or cancelled."
    } else if (lowerMessage.includes('status') || lowerMessage.includes('online')) {
      return "Drone status indicators: Green = Online, Yellow = Low Battery, Red = Error/Offline. You can see real-time status updates on the dashboard."
    } else if (lowerMessage.includes('speed') || lowerMessage.includes('fast')) {
      return "Drones in our fleet typically cruise at 10-15 m/s. Maximum speed is 20 m/s for safety. Speed is displayed in real-time on each drone card."
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I can help with: battery info, mission planning, status explanations, speed limits, and general drone operations. What specific help do you need?"
    } else {
      return "I understand you're asking about drones. For detailed information about drone operations, check the dashboard or ask about specific topics like battery, missions, or status."
    }
  }

  return (
    <div className="chatbot-container">
      {/* Chat Button */}
      <button 
        className="chatbot-toggle animate-bounce"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window animate-slide-up">
          <div className="chatbot-header">
            <h3>Drone Fleet Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="close-button"
            >
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-bubble">
                  {message.text}
                </div>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chatbot-input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about drones, missions, battery..."
              className="chatbot-input"
            />
            <button type="submit" className="send-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ChatBot