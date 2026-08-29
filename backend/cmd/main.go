package main

import (
	"log"
	"portal-berita-backend/config"
	"portal-berita-backend/routes"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env if exists
	_ = godotenv.Load()

	// Load and Validate Configuration
	config.LoadConfig()
	config.ValidateConfig()

	// Initialize Database
	config.InitDB()

	// Setup Router
	r := routes.SetupRouter()

	log.Printf("🚀 Server Portal Berita Backend running on port %s...", config.Cfg.Port)
	if err := r.Run(":" + config.Cfg.Port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
