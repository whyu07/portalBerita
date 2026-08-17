package controllers

import (
	"fmt"
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetArticles(c *gin.Context) {
	var articles []models.Article
	query := config.DB.Model(&models.Article{}).Preload("Category").Preload("Author")

	search := c.Query("search")
	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where("title LIKE ? OR summary LIKE ? OR content LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	categorySlug := c.Query("category")
	if categorySlug != "" {
		var category models.Category
		if err := config.DB.Where("slug = ?", categorySlug).First(&category).Error; err == nil {
			query = query.Where("category_id = ?", category.ID)
		}
	}

	// Always enforce published status for public endpoint
	query = query.Where("status = ?", models.StatusPublished)

	isFeatured := c.Query("featured")
	if isFeatured == "true" {
		query = query.Where("is_featured = ?", true)
	}

	limitStr := c.DefaultQuery("limit", "10")
	pageStr := c.DefaultQuery("page", "1")
	limit, _ := strconv.Atoi(limitStr)
	page, _ := strconv.Atoi(pageStr)
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&articles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil berita"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  articles,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

func GetArticleBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var article models.Article

	if err := config.DB.Preload("Category").Preload("Author").Preload("Comments.User").Where("slug = ?", slug).Where("status = ?", models.StatusPublished).First(&article).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// Increment view count
	config.DB.Model(&article).UpdateColumn("views_count", gorm.Expr("views_count + ?", 1))

	c.JSON(http.StatusOK, article)
}

func CreateArticle(c *gin.Context) {
	var req models.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDVal, _ := c.Get("userID")
	authorID := userIDVal.(uint)

	slug := createSlug(req.Title) + "-" + fmt.Sprintf("%d", time.Now().Unix())

	status := req.Status
	if status != models.StatusDraft && status != models.StatusPublished {
		status = models.StatusPublished
	}

	article := models.Article{
		Title:        req.Title,
		Slug:         slug,
		Summary:      req.Summary,
		Content:      req.Content,
		ThumbnailURL: req.ThumbnailURL,
		CategoryID:   req.CategoryID,
		AuthorID:     authorID,
		Status:       status,
		IsFeatured:   req.IsFeatured,
	}

	if err := config.DB.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").First(&article, article.ID)
	c.JSON(http.StatusCreated, article)
}

func UpdateArticle(c *gin.Context) {
	id := c.Param("id")
	var article models.Article

	if err := config.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	var req models.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article.Title = req.Title
	article.Summary = req.Summary
	article.Content = req.Content
	article.ThumbnailURL = req.ThumbnailURL
	article.CategoryID = req.CategoryID
	if req.Status == models.StatusDraft || req.Status == models.StatusPublished {
		article.Status = req.Status
	}
	article.IsFeatured = req.IsFeatured

	if err := config.DB.Save(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").First(&article, article.ID)
	c.JSON(http.StatusOK, article)
}

func DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Article{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus artikel"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Artikel berhasil dihapus"})
}

// GetManagedArticles returns articles for dashboard with status filtering
func GetManagedArticles(c *gin.Context) {
	var articles []models.Article
	query := config.DB.Model(&models.Article{}).Preload("Category").Preload("Author")

	search := c.Query("search")
	if search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where("title LIKE ? OR summary LIKE ? OR content LIKE ?", searchTerm, searchTerm, searchTerm)
	}

	categorySlug := c.Query("category")
	if categorySlug != "" {
		var category models.Category
		if err := config.DB.Where("slug = ?", categorySlug).First(&category).Error; err == nil {
			query = query.Where("category_id = ?", category.ID)
		}
	}

	status := c.Query("status")
	if status == string(models.StatusDraft) || status == string(models.StatusPublished) {
		query = query.Where("status = ?", status)
	}

	isFeatured := c.Query("featured")
	if isFeatured == "true" {
		query = query.Where("is_featured = ?", true)
	}

	limitStr := c.DefaultQuery("limit", "10")
	pageStr := c.DefaultQuery("page", "1")
	limit, _ := strconv.Atoi(limitStr)
	page, _ := strconv.Atoi(pageStr)
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&articles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil berita"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  articles,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// UpdateArticleStatus updates only the status of an article
func UpdateArticleStatus(c *gin.Context) {
	id := c.Param("id")
	var article models.Article

	if err := config.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	var req models.UpdateArticleStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status != models.StatusDraft && req.Status != models.StatusPublished {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status tidak valid"})
		return
	}

	if err := config.DB.Model(&article).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengubah status artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").First(&article, article.ID)
	c.JSON(http.StatusOK, article)
}
