package config

import (
	"fmt"
	"log"
	"os"
	"portal-berita-backend/models"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbSSLMode := os.Getenv("DB_SSLMODE")

	if dbSSLMode == "" {
		dbSSLMode = "disable"
	}

	var database *gorm.DB
	var err error

	if dbHost != "" && dbUser != "" {
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
			dbHost, dbUser, dbPassword, dbName, dbPort, dbSSLMode)

		database, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	}

	if err != nil || dbHost == "" {
		log.Println("⚡ Using SQLite fallback DB (portal_berita.db)...")
		database, err = gorm.Open(sqlite.Open("portal_berita.db"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.Fatalf("Failed to connect to database: %v", err)
		}
	}

	log.Println("✅ Database connection established.")

	// Auto Migrate
	err = database.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Article{},
		&models.Comment{},
	)
	if err != nil {
		log.Fatalf("Auto Migration failed: %v", err)
	}

	DB = database
	SeedData(DB)
	return DB
}

func SeedData(db *gorm.DB) {
	var userCount int64
	db.Model(&models.User{}).Count(&userCount)
	if userCount > 0 {
		return
	}

	log.Println("🌱 Seeding default initial data...")

	// Seed Admin User
	adminPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	adminUser := models.User{
		Name:     "Admin Portal",
		Email:    "admin@portalberita.com",
		Password: string(adminPassword),
		Role:     models.RoleAdmin,
	}
	db.Create(&adminUser)

	// Seed Author User
	authorPassword, _ := bcrypt.GenerateFromPassword([]byte("author123"), bcrypt.DefaultCost)
	authorUser := models.User{
		Name:     "Budi Redaktur",
		Email:    "budi@portalberita.com",
		Password: string(authorPassword),
		Role:     models.RoleAuthor,
	}
	db.Create(&authorUser)

	// Seed Categories
	categories := []models.Category{
		{Name: "Teknologi", Slug: "teknologi", Description: "Berita seputar perkembangan teknologi, AI, gadget, dan software."},
		{Name: "Politik", Slug: "politik", Description: "Kabar terbaru situasi politik tanah air dan mancanegara."},
		{Name: "Ekonomi", Slug: "ekonomi", Description: "Analisis keuangan, investasi, dan perkembangan pasar global."},
		{Name: "Olahraga", Slug: "olahraga", Description: "Liputan sepak bola, bulu tangkis, dan ajang olahraga kelas dunia."},
		{Name: "Hiburan", Slug: "hiburan", Description: "Kabar selebriti, film terbaru, musik, dan pop culture."},
	}
	for i := range categories {
		db.Create(&categories[i])
	}

	// Seed Sample Articles
	articles := []models.Article{
		{
			Title:        "Peluncuran Satelit Komunikasi Terbaru Indonesia Berhasil Mulus",
			Slug:         "peluncuran-satelit-komunikasi-terbaru-indonesia-berhasil-mulus",
			Summary:      "Indonesia sukses meluncurkan satelit generasi baru untuk memperluas jangkauan internet broadband hingga pelosok desa.",
			Content:      "Satelit komunikasi generasi terbaru berhasil mengangkasa menuju orbit geostasioner pada dini hari tadi. Peluncuran ini menjadi milestone penting dalam pemerataan akses internet berkecepatan tinggi di daerah 3T (Tertinggal, Terdepan, dan Terluar).\n\nMenteri Komunikasi menyatakan bahwa operasional penuh satelit ini ditargetkan mulai kuartal berikutnya, membawa harapan baru bagi efisiensi pembelajaran digital dan ekonomi daerah.",
			ThumbnailURL: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
			CategoryID:   categories[0].ID,
			AuthorID:     authorUser.ID,
			Status:       models.StatusPublished,
			ViewsCount:   342,
			IsFeatured:   true,
			CreatedAt:    time.Now().Add(-2 * time.Hour),
		},
		{
			Title:        "Perekonomian Nasional Catat Pertumbuhan 5,2% di Kuartal Ini",
			Slug:         "perekonomian-nasional-catat-pertumbuhan-5-2-di-kuartal-ini",
			Summary:      "Pertumbuhan ekonomi didorong oleh peningkatan konsumsi rumah tangga dan geliat sektor manufaktur.",
			Content:      "Badan Pusat Statistik merilis data terbaru pertumbuhan ekonomi nasional yang mencapai 5,2% secara tahunan (YoY). Konsumsi domestik yang stabil serta peningkatan aktivitas ekspor produk olahan menjadi motor utama penggerak grafik positif ini.",
			ThumbnailURL: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
			CategoryID:   categories[2].ID,
			AuthorID:     adminUser.ID,
			Status:       models.StatusPublished,
			ViewsCount:   189,
			IsFeatured:   false,
			CreatedAt:    time.Now().Add(-5 * time.Hour),
		},
		{
			Title:        "Timnas Indonesia Siap Hadapi Turnamen Tingkat Asia",
			Slug:         "timnas-indonesia-siap-hadapi-turnamen-tingkat-asia",
			Summary:      "Skuad Garuda menggelar pemusatan latihan intensif menjelang laga pembuka grup pekan depan.",
			Content:      "Persiapan skuad nasional terus dimaksimalkan dengan latihan fisik dan taktik intensif. Pelatih menyatakan kepercayaan diri para pemain sangat tinggi usai meraih kemenangan dalam uji coba terakhir.",
			ThumbnailURL: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
			CategoryID:   categories[3].ID,
			AuthorID:     authorUser.ID,
			Status:       models.StatusPublished,
			ViewsCount:   512,
			IsFeatured:   false,
			CreatedAt:    time.Now().Add(-1 * time.Hour),
		},
	}

	for i := range articles {
		db.Create(&articles[i])
	}

	// Seed Sample Comment
	comment := models.Comment{
		ArticleID: articles[0].ID,
		UserID:    authorUser.ID,
		Content:   "Kabar yang sangat menggembirakan untuk konektivitas pendidikan di daerah terluar!",
	}
	db.Create(&comment)

	log.Println("✨ Data seeding completed.")
}
