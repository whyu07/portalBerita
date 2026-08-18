package controllers

import (
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/models"
	"portal-berita-backend/utils"
	"strconv"

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
		} else {
			// Category not found, return empty array
			c.JSON(http.StatusOK, gin.H{
				"data":  []models.Article{},
				"total": 0,
				"page":  1,
				"limit": 10, // dummy limit
			})
			return
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

	if err := query.Order("published_at DESC, created_at DESC").Limit(limit).Offset(offset).Find(&articles).Error; err != nil {
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

	// Validate Category
	var categoryCount int64
	config.DB.Model(&models.Category{}).Where("id = ?", req.CategoryID).Count(&categoryCount)
	if categoryCount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kategori tidak ditemukan atau tidak valid"})
		return
	}

	userIDVal, _ := c.Get("userID")
	authorID := userIDVal.(uint)

	slug, err := utils.GenerateUniqueSlug(config.DB, req.Title)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

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
		IsFeatured:   req.IsFeatured,
	}

	utils.ApplyArticleStatus(&article, status)

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

	// Ownership check
	userRole, _ := c.Get("userRole")
	userID, _ := c.Get("userID")
	if !utils.CanManageArticle(userRole.(string), userID.(uint), article.AuthorID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda bukan pemilik artikel ini"})
		return
	}

	var req models.CreateArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate Category
	var categoryCount int64
	config.DB.Model(&models.Category{}).Where("id = ?", req.CategoryID).Count(&categoryCount)
	if categoryCount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kategori tidak ditemukan atau tidak valid"})
		return
	}

	article.Title = req.Title
	article.Summary = req.Summary
	article.Content = req.Content
	article.ThumbnailURL = req.ThumbnailURL
	article.CategoryID = req.CategoryID
	article.IsFeatured = req.IsFeatured

	if req.Status == models.StatusDraft || req.Status == models.StatusPublished {
		utils.ApplyArticleStatus(&article, req.Status)
	}

	if err := config.DB.Save(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").First(&article, article.ID)
	c.JSON(http.StatusOK, article)
}

func DeleteArticle(c *gin.Context) {
	id := c.Param("id")
	var article models.Article

	if err := config.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// Ownership check
	userRole, _ := c.Get("userRole")
	userID, _ := c.Get("userID")
	if !utils.CanManageArticle(userRole.(string), userID.(uint), article.AuthorID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda bukan pemilik artikel ini"})
		return
	}

	if err := config.DB.Delete(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus artikel"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Artikel berhasil dihapus"})
}

func GetManagedArticles(c *gin.Context) {
	var articles []models.Article
	query := config.DB.Model(&models.Article{}).Preload("Category").Preload("Author")

	// Apply author filter if role is author
	userRole, _ := c.Get("userRole")
	if models.Role(userRole.(string)) == models.RoleAuthor {
		userID, _ := c.Get("userID")
		query = query.Where("author_id = ?", userID.(uint))
	}

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

	if err := query.Order("published_at DESC, created_at DESC").Limit(limit).Offset(offset).Find(&articles).Error; err != nil {
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

func UpdateArticleStatus(c *gin.Context) {
	id := c.Param("id")
	var article models.Article

	if err := config.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// Ownership check
	userRole, _ := c.Get("userRole")
	userID, _ := c.Get("userID")
	if !utils.CanManageArticle(userRole.(string), userID.(uint), article.AuthorID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda bukan pemilik artikel ini"})
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

	utils.ApplyArticleStatus(&article, req.Status)

	if err := config.DB.Save(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengubah status artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").First(&article, article.ID)
	c.JSON(http.StatusOK, article)
}
