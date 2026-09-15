package controllers

import (
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/models"
	"portal-berita-backend/utils"

	"github.com/gin-gonic/gin"
)

func GetCommentsByArticle(c *gin.Context) {
	articleID := c.Param("articleId")
	var comments []models.Comment

	if err := config.DB.Preload("User").Where("article_id = ?", articleID).Order("created_at DESC").Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil komentar"})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func CreateComment(c *gin.Context) {
	articleID := c.Param("articleId")
	var req models.CreateCommentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("userID")
	userID := userIDVal.(uint)

	var article models.Article
	if err := config.DB.First(&article, articleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	comment := models.Comment{
		ArticleID: article.ID,
		UserID:    userID,
		Content:   utils.SanitizePlainText(req.Content),
	}

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengirim komentar"})
		return
	}

	config.DB.Preload("User").First(&comment, comment.ID)
	c.JSON(http.StatusCreated, comment)
}

func DeleteComment(c *gin.Context) {
	id := c.Param("id")
	userIDVal, _ := c.Get("userID")
	userRoleVal, _ := c.Get("userRole")

	userID := userIDVal.(uint)
	userRole := models.Role(userRoleVal.(string))

	var comment models.Comment
	if err := config.DB.First(&comment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Komentar tidak ditemukan"})
		return
	}

	if comment.UserID != userID && userRole != models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak berhak menghapus komentar ini"})
		return
	}

	if err := config.DB.Delete(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus komentar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Komentar berhasil dihapus"})
}
