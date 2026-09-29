package config

import (
	"log"
	"os"
	"strconv"
	"strings"
)

type AppConfig struct {
	AppEnv                 string
	Port                   string
	JWTSecret              string
	JWTExpires             int
	DBDriver               string
	DBHost                 string
	DBPort                 string
	DBUser                 string
	DBPassword             string
	DBName                 string
	DBSSLMode              string
	SeedDemoData           bool
	CORSOrigins            []string
	BootstrapAdminName     string
	BootstrapAdminEmail    string
	BootstrapAdminPassword string
}

var Cfg AppConfig

// LoadConfig reads all required environment variables and sets defaults.
func LoadConfig() {
	Cfg = AppConfig{
		AppEnv:                 getEnv("APP_ENV", "development"),
		Port:                   getEnv("PORT", "8080"),
		JWTSecret:              os.Getenv("JWT_SECRET"),
		JWTExpires:             getEnvAsInt("JWT_EXPIRES_HOURS", 24),
		DBDriver:               getEnv("DB_DRIVER", "sqlite"),
		DBHost:                 os.Getenv("DB_HOST"),
		DBPort:                 getEnv("DB_PORT", "5432"),
		DBUser:                 os.Getenv("DB_USER"),
		DBPassword:             os.Getenv("DB_PASSWORD"),
		DBName:                 getEnv("DB_NAME", "portal_berita"),
		DBSSLMode:              getEnv("DB_SSLMODE", "disable"),
		SeedDemoData:           getEnvAsBool("SEED_DEMO_DATA", true),
		CORSOrigins:            getEnvAsCSV("CORS_ORIGINS", []string{"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5175", "http://127.0.0.1:5175"}),
		BootstrapAdminName:     os.Getenv("BOOTSTRAP_ADMIN_NAME"),
		BootstrapAdminEmail:    os.Getenv("BOOTSTRAP_ADMIN_EMAIL"),
		BootstrapAdminPassword: os.Getenv("BOOTSTRAP_ADMIN_PASSWORD"),
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
		if strings.TrimSpace(os.Getenv("CORS_ORIGINS")) == "" {
			log.Fatal("❌ Startup failed: CORS_ORIGINS is required in production.")
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

	bootstrapFields := 0
	if Cfg.BootstrapAdminName != "" {
		bootstrapFields++
	}
	if Cfg.BootstrapAdminEmail != "" {
		bootstrapFields++
	}
	if Cfg.BootstrapAdminPassword != "" {
		bootstrapFields++
	}
	if bootstrapFields > 0 && bootstrapFields < 3 {
		log.Fatal("❌ Startup failed: BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL, and BOOTSTRAP_ADMIN_PASSWORD must be provided together.")
	}
	if Cfg.BootstrapAdminPassword != "" && len(Cfg.BootstrapAdminPassword) < 12 {
		log.Fatal("❌ Startup failed: BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.")
	}
	if len(Cfg.CORSOrigins) == 0 {
		log.Fatal("❌ Startup failed: CORS_ORIGINS must contain at least one allowed origin.")
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

func getEnvAsCSV(key string, fallback []string) []string {
	rawValue := strings.TrimSpace(os.Getenv(key))
	if rawValue == "" {
		return fallback
	}

	values := make([]string, 0)
	for _, value := range strings.Split(rawValue, ",") {
		value = strings.TrimSpace(value)
		if value != "" {
			values = append(values, value)
		}
	}
	if len(values) == 0 {
		return fallback
	}
	return values
}
