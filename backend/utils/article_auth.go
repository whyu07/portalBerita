package utils

import (
	"portal-berita-backend/models"
	"time"
)

// CanManageArticle checks if a user is allowed to manage (edit/delete/status) a specific article
func CanManageArticle(userRole string, userID uint, articleAuthorID uint) bool {
	if models.Role(userRole) == models.RoleAdmin {
		return true
	}
	if models.Role(userRole) == models.RoleAuthor && userID == articleAuthorID {
		return true
	}
	return false
}

// ApplyArticleStatus updates the article's status and PublishedAt field according to the rules
func ApplyArticleStatus(article *models.Article, nextStatus models.Status) {
	now := time.Now()

	if nextStatus == models.StatusPublished {
		if article.Status != models.StatusPublished || article.PublishedAt == nil {
			article.PublishedAt = &now
		}
		// If it's already published, leave PublishedAt intact
	} else if nextStatus == models.StatusDraft {
		article.PublishedAt = nil
	}

	article.Status = nextStatus
}
