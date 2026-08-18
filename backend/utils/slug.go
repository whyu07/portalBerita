package utils

import (
	"fmt"
	"portal-berita-backend/models"
	"regexp"
	"strings"

	"gorm.io/gorm"
)

// GenerateUniqueSlug creates a URL-friendly slug from a string and ensures it's unique in the Article table
func GenerateUniqueSlug(db *gorm.DB, title string) (string, error) {
	// 1 & 2: Trim and Lowercase
	slug := strings.ToLower(strings.TrimSpace(title))

	// 3: Replace non-alphanumeric with hyphen
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")

	// 4 & 5: Collapse multiple hyphens and trim from ends
	regMultipleHyphens := regexp.MustCompile("-+")
	slug = regMultipleHyphens.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")

	// 6: Check if empty
	if slug == "" {
		return "", fmt.Errorf("judul tidak valid untuk dibuatkan slug")
	}

	// 7 & 8: Check for uniqueness and append suffix if needed
	originalSlug := slug
	suffix := 2
	for {
		var count int64
		if err := db.Model(&models.Article{}).Where("slug = ?", slug).Count(&count).Error; err != nil {
			return "", err
		}

		if count == 0 {
			break // Unique slug found
		}

		slug = fmt.Sprintf("%s-%d", originalSlug, suffix)
		suffix++
	}

	return slug, nil
}
