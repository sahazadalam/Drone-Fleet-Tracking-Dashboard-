import React, { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapView = ({ center = [37.7749, -122.4194], zoom = 13 }) => {
  const { drones } = useApp()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Update drone markers
    drones.forEach(drone => {
      const position = [drone.lat, drone.lng]
      
      if (markersRef.current[drone.id]) {
        // Update existing marker
        markersRef.current[drone.id].setLatLng(position)
        
        // Update popup content
        markersRef.current[drone.id].getPopup().setContent(`
          <div class="drone-popup">
            <h3>${drone.name}</h3>
            <p><strong>Status:</strong> ${drone.status}</p>
            <p><strong>Battery:</strong> ${drone.battery}%</p>
            <p><strong>Speed:</strong> ${drone.speed} m/s</p>
            <p><strong>Altitude:</strong> ${drone.altitude} m</p>
          </div>
        `)
      } else {
        // Create new marker with custom icon based on status
        const icon = L.divIcon({
          className: `drone-marker ${drone.status}`,
          html: `
            <div class="drone-icon">
              <div class="drone-battery ${drone.battery < 20 ? 'low' : ''}">
                ${drone.battery}%
              </div>
              <div class="drone-arrow"></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })

        const marker = L.marker(position, { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="drone-popup">
              <h3>${drone.name}</h3>
              <p><strong>Status:</strong> ${drone.status}</p>
              <p><strong>Battery:</strong> ${drone.battery}%</p>
              <p><strong>Speed:</strong> ${drone.speed} m/s</p>
              <p><strong>Altitude:</strong> ${drone.altitude} m</p>
            </div>
          `)

        markersRef.current[drone.id] = marker
      }
    })

    // Remove markers for drones that are no longer in the list
    Object.keys(markersRef.current).forEach(droneId => {
      if (!drones.find(d => d.id === parseInt(droneId))) {
        mapInstanceRef.current.removeLayer(markersRef.current[droneId])
        delete markersRef.current[droneId]
      }
    })
  }, [drones])

  return (
    <div className="map-container">
      <div 
        ref={mapRef} 
        className="map-view"
        style={{ height: '600px', width: '100%' }}
      />
    </div>
  )
}

export default MapView