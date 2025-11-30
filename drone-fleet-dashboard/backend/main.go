package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"os"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

var (
	DB          *Database
	HubInstance = NewHub()
	clients     = make(map[*Client]bool)
	clientsMu   sync.Mutex
)

type Database struct {
	drones   []Drone
	missions []Mission
	alerts   []Alert
	mu       sync.RWMutex
}

type Drone struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Status      string    `json:"status"`
	Battery     int       `json:"battery"`
	Lat         float64   `json:"lat"`
	Lng         float64   `json:"lng"`
	Speed       float64   `json:"speed"`
	Altitude    float64   `json:"altitude"`
	Temperature int       `json:"temperature"`
	Signal      int       `json:"signal"`
	LastUpdate  time.Time `json:"last_update"`
	Type        string    `json:"type"`
	Color       string    `json:"color"`
}

type Mission struct {
	ID        int       `json:"id"`
	DroneID   int       `json:"drone_id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	Progress  int       `json:"progress"`
	Priority  string    `json:"priority"`
	CreatedAt time.Time `json:"created_at"`
}

type Alert struct {
	ID      int       `json:"id"`
	Type    string    `json:"type"`
	Message string    `json:"message"`
	DroneID int       `json:"drone_id"`
	Time    time.Time `json:"time"`
	Read    bool      `json:"read"`
}

type Client struct {
	conn *websocket.Conn
	send chan []byte
}

func NewDatabase() *Database {
	now := time.Now()
	return &Database{
		drones: []Drone{
			{
				ID:          1,
				Name:        "Alpha-1",
				Status:      "online",
				Battery:     85,
				Lat:         37.7749,
				Lng:         -122.4194,
				Speed:       15.5,
				Altitude:    120.0,
				Temperature: 25,
				Signal:      95,
				LastUpdate:  now,
				Type:        "delivery",
				Color:       "#3B82F6",
			},
			{
				ID:          2,
				Name:        "Beta-2",
				Status:      "online",
				Battery:     72,
				Lat:         37.7849,
				Lng:         -122.4094,
				Speed:       12.3,
				Altitude:    95.0,
				Temperature: 28,
				Signal:      87,
				LastUpdate:  now,
				Type:        "surveillance",
				Color:       "#10B981",
			},
			{
				ID:          3,
				Name:        "Gamma-3",
				Status:      "maintenance",
				Battery:     100,
				Lat:         37.7649,
				Lng:         -122.4294,
				Speed:       0.0,
				Altitude:    0.0,
				Temperature: 22,
				Signal:      0,
				LastUpdate:  now,
				Type:        "mapping",
				Color:       "#F59E0B",
			},
			{
				ID:          4,
				Name:        "Delta-4",
				Status:      "online",
				Battery:     45,
				Lat:         37.7799,
				Lng:         -122.4144,
				Speed:       8.7,
				Altitude:    150.0,
				Temperature: 26,
				Signal:      92,
				LastUpdate:  now,
				Type:        "inspection",
				Color:       "#8B5CF6",
			},
		},
		missions: []Mission{
			{
				ID:        1,
				DroneID:   1,
				Name:      "Emergency Delivery",
				Status:    "completed",
				Progress:  100,
				Priority:  "high",
				CreatedAt: now.Add(-2 * time.Hour),
			},
			{
				ID:        2,
				DroneID:   2,
				Name:      "Area Surveillance",
				Status:    "running",
				Progress:  65,
				Priority:  "medium",
				CreatedAt: now.Add(-1 * time.Hour),
			},
		},
		alerts: []Alert{
			{
				ID:      1,
				Type:    "warning",
				Message: "Delta-4 battery below 50%",
				DroneID: 4,
				Time:    now.Add(-10 * time.Minute),
				Read:    false,
			},
		},
	}
}

// WebSocket Hub
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	log.Println("🚀 WebSocket Hub started")

	ticker := time.NewTicker(3 * time.Second) // Update every 3 seconds
	defer ticker.Stop()

	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.Lock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()

		case <-ticker.C:
			h.broadcastLiveUpdates()
		}
	}
}

func (h *Hub) broadcastLiveUpdates() {
	DB.mu.Lock()
	defer DB.mu.Unlock()

	// Update drone positions and battery
	for i := range DB.drones {
		if DB.drones[i].Status == "online" {
			// Simulate movement
			DB.drones[i].Lat += (rand.Float64() - 0.5) * 0.001
			DB.drones[i].Lng += (rand.Float64() - 0.5) * 0.001
			DB.drones[i].Battery -= rand.Intn(2)
			DB.drones[i].Speed = 5.0 + rand.Float64()*15.0
			DB.drones[i].Temperature = 20 + rand.Intn(15)
			DB.drones[i].Signal = 70 + rand.Intn(30)
			DB.drones[i].LastUpdate = time.Now()

			// Update status based on battery
			if DB.drones[i].Battery <= 20 {
				DB.drones[i].Status = "low_battery"
			}
			if DB.drones[i].Battery <= 0 {
				DB.drones[i].Status = "offline"
				DB.drones[i].Speed = 0.0
			}
		}
	}

	// Update mission progress
	for i := range DB.missions {
		if DB.missions[i].Status == "running" {
			DB.missions[i].Progress += rand.Intn(5)
			if DB.missions[i].Progress >= 100 {
				DB.missions[i].Status = "completed"
				DB.missions[i].Progress = 100
			}
		}
	}

	// Broadcast updates
	message := map[string]interface{}{
		"type":      "live_update",
		"drones":    DB.drones,
		"missions":  DB.missions,
		"timestamp": time.Now(),
	}

	jsonMessage, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling update: %v", err)
		return
	}

	h.broadcast <- jsonMessage
}

// WebSocket handler
func handleWebSocket(c *websocket.Conn) {
	client := &Client{
		conn: c,
		send: make(chan []byte, 256),
	}

	HubInstance.register <- client

	defer func() {
		HubInstance.unregister <- client
		c.Close()
	}()

	go client.writePump()
	client.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle incoming messages from frontend
		var msg map[string]interface{}
		if err := json.Unmarshal(message, &msg); err == nil {
			handleWebSocketMessage(msg)
		}
	}
}

func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := c.conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

func handleWebSocketMessage(msg map[string]interface{}) {
	switch msg["type"] {
	case "control_drone":
		handleDroneControl(msg)
	case "control_mission":
		handleMissionControl(msg)
	}
}

func handleDroneControl(msg map[string]interface{}) {
	DB.mu.Lock()
	defer DB.mu.Unlock()

	droneID := int(msg["drone_id"].(float64))
	action := msg["action"].(string)

	for i := range DB.drones {
		if DB.drones[i].ID == droneID {
			switch action {
			case "return_home":
				DB.drones[i].Status = "returning_home"
				log.Printf("Drone %d returning home", droneID)
			case "emergency_stop":
				DB.drones[i].Status = "emergency_stop"
				DB.drones[i].Speed = 0.0
				log.Printf("Emergency stop for drone %d", droneID)
			case "start_mission":
				DB.drones[i].Status = "online"
				log.Printf("Starting mission for drone %d", droneID)
			}
			break
		}
	}
}

func handleMissionControl(msg map[string]interface{}) {
	DB.mu.Lock()
	defer DB.mu.Unlock()

	missionID := int(msg["mission_id"].(float64))
	action := msg["action"].(string)

	for i := range DB.missions {
		if DB.missions[i].ID == missionID {
			switch action {
			case "pause":
				DB.missions[i].Status = "paused"
				log.Printf("Mission %d paused", missionID)
			case "resume":
				DB.missions[i].Status = "running"
				log.Printf("Mission %d resumed", missionID)
			case "cancel":
				DB.missions[i].Status = "cancelled"
				log.Printf("Mission %d cancelled", missionID)
			}
			break
		}
	}
}

// API Routes
func setupRoutes(app *fiber.App) {
	// Root endpoint
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "🚀 Drone Fleet API is running!",
			"version": "1.0.0",
		})
	})

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		DB.mu.RLock()
		defer DB.mu.RUnlock()
		return c.JSON(fiber.Map{
			"status":    "healthy",
			"timestamp": time.Now(),
			"service":   "drone-fleet-backend",
			"drones":    len(DB.drones),
			"missions":  len(DB.missions),
		})
	})

	// Drones endpoint
	app.Get("/api/drones", func(c *fiber.Ctx) error {
		DB.mu.RLock()
		defer DB.mu.RUnlock()
		return c.JSON(fiber.Map{
			"success": true,
			"drones":  DB.drones,
		})
	})

	// Control drone endpoint
	app.Post("/api/drones/:id/control", func(c *fiber.Ctx) error {
		droneID := c.Params("id")
		var request map[string]string
		if err := c.BodyParser(&request); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		action := request["action"]
		DB.mu.Lock()
		defer DB.mu.Unlock()

		for i := range DB.drones {
			if DB.drones[i].ID == convertToInt(droneID) {
				switch action {
				case "return_home":
					DB.drones[i].Status = "returning_home"
				case "emergency_stop":
					DB.drones[i].Status = "emergency_stop"
					DB.drones[i].Speed = 0.0
				case "start_mission":
					DB.drones[i].Status = "online"
				}
				return c.JSON(fiber.Map{
					"success": true,
					"message": "Drone control command sent",
				})
			}
		}

		return c.Status(404).JSON(fiber.Map{"error": "Drone not found"})
	})

	// Dashboard endpoint
	app.Get("/api/dashboard", func(c *fiber.Ctx) error {
		DB.mu.RLock()
		defer DB.mu.RUnlock()

		onlineDrones := 0
		totalBattery := 0
		for _, drone := range DB.drones {
			if drone.Status == "online" {
				onlineDrones++
			}
			totalBattery += drone.Battery
		}

		avgBattery := 0
		if len(DB.drones) > 0 {
			avgBattery = totalBattery / len(DB.drones)
		}

		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"stats": fiber.Map{
					"total_drones":    len(DB.drones),
					"online_drones":   onlineDrones,
					"avg_battery":     avgBattery,
					"active_missions": len(DB.missions),
					"total_alerts":    len(DB.alerts),
				},
				"performance": fiber.Map{
					"uptime":             "99.8%",
					"response_time":      "45ms",
					"completed_missions": 127,
					"active_drones":      3,
					"total_flight_time":  "248h",
				},
				"recent_alerts": DB.alerts,
			},
		})
	})

	// Missions endpoint
	app.Get("/api/missions", func(c *fiber.Ctx) error {
		DB.mu.RLock()
		defer DB.mu.RUnlock()
		return c.JSON(fiber.Map{
			"success":  true,
			"missions": DB.missions,
		})
	})

	// Control mission endpoint
	app.Post("/api/missions/:id/control", func(c *fiber.Ctx) error {
		missionID := c.Params("id")
		var request map[string]string
		if err := c.BodyParser(&request); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		action := request["action"]
		DB.mu.Lock()
		defer DB.mu.Unlock()

		for i := range DB.missions {
			if DB.missions[i].ID == convertToInt(missionID) {
				switch action {
				case "pause":
					DB.missions[i].Status = "paused"
				case "resume":
					DB.missions[i].Status = "running"
				case "cancel":
					DB.missions[i].Status = "cancelled"
				}
				return c.JSON(fiber.Map{
					"success": true,
					"message": "Mission control command sent",
				})
			}
		}

		return c.Status(404).JSON(fiber.Map{"error": "Mission not found"})
	})

	// Create mission endpoint
	app.Post("/api/missions", func(c *fiber.Ctx) error {
		var request struct {
			Name    string `json:"name"`
			DroneID int    `json:"drone_id"`
			Type    string `json:"type"`
		}
		if err := c.BodyParser(&request); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
		}

		DB.mu.Lock()
		defer DB.mu.Unlock()

		newMission := Mission{
			ID:        len(DB.missions) + 1,
			DroneID:   request.DroneID,
			Name:      request.Name,
			Status:    "pending",
			Progress:  0,
			Priority:  "medium",
			CreatedAt: time.Now(),
		}

		DB.missions = append(DB.missions, newMission)

		return c.JSON(fiber.Map{
			"success": true,
			"message": "Mission created successfully",
			"mission": newMission,
		})
	})

	// Alerts endpoint
	app.Get("/api/alerts", func(c *fiber.Ctx) error {
		DB.mu.RLock()
		defer DB.mu.RUnlock()
		return c.JSON(fiber.Map{
			"success": true,
			"alerts":  DB.alerts,
		})
	})

	// Mark alert as read
	app.Put("/api/alerts/:id/read", func(c *fiber.Ctx) error {
		alertID := c.Params("id")
		DB.mu.Lock()
		defer DB.mu.Unlock()

		for i := range DB.alerts {
			if DB.alerts[i].ID == convertToInt(alertID) {
				DB.alerts[i].Read = true
				return c.JSON(fiber.Map{
					"success": true,
					"message": "Alert marked as read",
				})
			}
		}

		return c.Status(404).JSON(fiber.Map{"error": "Alert not found"})
	})

	// Analytics endpoint
	app.Get("/api/analytics", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"battery_distribution": []fiber.Map{
					{"range": "0-20%", "count": 0},
					{"range": "21-50%", "count": 1},
					{"range": "51-80%", "count": 1},
					{"range": "81-100%", "count": 2},
				},
				"status_distribution": fiber.Map{
					"online":      3,
					"offline":     0,
					"maintenance": 1,
				},
				"mission_success_rate": 95.5,
				"average_flight_time":  "45 minutes",
				"most_active_drone":    "Alpha-1",
			},
		})
	})

	// WebSocket endpoint
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/:id", websocket.New(handleWebSocket))
}

func convertToInt(s string) int {
	if s == "1" {
		return 1
	}
	if s == "2" {
		return 2
	}
	if s == "3" {
		return 3
	}
	if s == "4" {
		return 4
	}
	return 0
}

func main() {
	// Initialize database
	DB = NewDatabase()
	log.Println("✅ Database initialized with demo data")

	// Start WebSocket hub
	go HubInstance.Run()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "Drone Fleet API v2.0",
	})

	// CORS - Allow all origins for development
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Setup routes
	setupRoutes(app)

	// Start server
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📡 API available at: http://localhost:%s", port)
	log.Printf("🔌 WebSocket available at: ws://localhost:%s/ws/1", port)
	log.Printf("🎮 Interactive features enabled!")

	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
