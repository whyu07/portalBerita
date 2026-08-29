package config

import (
	"log"
	"os"
	"strconv"
)

type AppConfig struct {
	AppEnv         string
	Port           string
	JWTSecret      string
	JWTExpires     int
	DBDriver       string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	DBSSLMode      string
	SeedDemoData   bool
}

var Cfg AppConfig

// LoadConfig reads all required environment variables and sets defaults.
func LoadConfig() {
	Cfg = AppConfig{
		AppEnv:         getEnv("APP_ENV", "development"),
		Port:           getEnv("PORT", "8080"),
		JWTSecret:      os.Getenv("JWT_SECRET"),
		JWTExpires:     getEnvAsInt("JWT_EXPIRES_HOURS", 24),
		DBDriver:       getEnv("DB_DRIVER", "sqlite"),
		DBHost:         os.Getenv("DB_HOST"),
		DBPort:         getEnv("DB_PORT", "5432"),
		DBUser:         os.Getenv("DB_USER"),
		DBPassword:     os.Getenv("DB_PASSWORD"),
		DBName:         getEnv("DB_NAME", "portal_berita"),
		DBSSLMode:      getEnv("DB_SSLMODE", "disable"),
		SeedDemoData:   getEnvAsBool("SEED_DEMO_DATA", true),
	}
}

// ValidateConfig enforces strict configuration requirements, especially for production.
func ValidateConfig() {
	if Cfg.AppEnv != "development" && Cfg.AppEnv != "production" && Cfg.AppEnv != "test" {
		log.Fatalf("❌ Startup failed: APP_ENV must be 'development', 'production', or 'test'. Got: '%s'", Cfg.AppEnv)
	}

	if Cfg.AppEnv == "production" {
		// Production MUST use PostgreSQL
		if Cfg.DBDriver != "postgres" {
			log.Fatalf("❌ Startup failed: Production must use DB_DRIVER=postgres. Got: '%s'", Cfg.DBDriver)
		}

		// Production MUST have DB credentials
		if Cfg.DBHost == "" || Cfg.DBUser == "" || Cfg.DBPassword == "" || Cfg.DBName == "" {
			log.Fatal("❌ Startup failed: Production DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME are required.")
		}

		// Production MUST have a strong JWT Secret
		if Cfg.JWTSecret == "" {
			log.Fatal("❌ Startup failed: JWT_SECRET is required in production.")
		}
		if len(Cfg.JWTSecret) < 32 {
			log.Fatal("❌ Startup failed: JWT_SECRET is too short (must be at least 32 characters in production).")
		}

		// Production MUST NOT run seed data
		if Cfg.SeedDemoData {
			log.Println("⚠️  WARNING: SEED_DEMO_DATA is true, but ignored because APP_ENV=production.")
			Cfg.SeedDemoData = false
		}
	} else {
		// Development fallback for JWT secret if not provided
		if Cfg.JWTSecret == "" {
			Cfg.JWTSecret = "dev-only-secret-do-not-use-in-production"
		}
	}

	if Cfg.JWTExpires <= 0 {
		log.Fatalf("❌ Startup failed: JWT_EXPIRES_HOURS must be > 0. Got: %d", Cfg.JWTExpires)
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	strValue := os.Getenv(key)
	if strValue == "" {
		return fallback
	}
	value, err := strconv.Atoi(strValue)
	if err != nil {
		return fallback
	}
	return value
}

func getEnvAsBool(key string, fallback bool) bool {
	strValue := os.Getenv(key)
	if strValue == "" {
		return fallback
	}
	boolValue, err := strconv.ParseBool(strValue)
	if err != nil {
		return fallback
	}
	return boolValue
}
