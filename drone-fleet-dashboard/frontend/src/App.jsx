import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import ConnectionStatus from './components/ConnectionStatus'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DroneDetails from './pages/DroneDetails'
import Missions from './pages/Missions'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'
import './styles/styles.css'
import './styles/animations.css'

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <ConnectionStatus />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/drone/:id" element={<DroneDetails />} />
              <Route path="/missions" element={<Missions />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/alerts" element={<Alerts />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  )
}

export default App