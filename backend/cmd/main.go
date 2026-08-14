package main

import (
	"log"
	"os"
	"portal-berita-backend/config"
	"portal-berita-backend/routes"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env if exists
	_ = godotenv.Load()

	// Initialize Database
	config.InitDB()

	// Setup Router
	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server Portal Berita Backend running on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
