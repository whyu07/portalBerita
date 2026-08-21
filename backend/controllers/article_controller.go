package controllers

import (
	"math"
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/models"
	"portal-berita-backend/utils"
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

	// Date Filters
	date := c.Query("date")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	loc, _ := time.LoadLocation("Asia/Jakarta")

	if date != "" {
		parsedDate, err := time.ParseInLocation("2006-01-02", date, loc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Format tanggal salah, gunakan YYYY-MM-DD"})
			return
		}
		endOfDay := parsedDate.AddDate(0, 0, 1)
		query = query.Where("published_at >= ? AND published_at < ?", parsedDate, endOfDay)
	} else if dateFrom != "" || dateTo != "" {
		if dateFrom != "" {
			parsedFrom, err := time.ParseInLocation("2006-01-02", dateFrom, loc)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Format date_from salah, gunakan YYYY-MM-DD"})
				return
			}
			query = query.Where("published_at >= ?", parsedFrom)
		}
		if dateTo != "" {
			parsedTo, err := time.ParseInLocation("2006-01-02", dateTo, loc)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Format date_to salah, gunakan YYYY-MM-DD"})
				return
			}
			endOfDay := parsedTo.AddDate(0, 0, 1)
			query = query.Where("published_at < ?", endOfDay)
		}
	}

	limitStr := c.DefaultQuery("limit", "12")
	pageStr := c.DefaultQuery("page", "1")
	limit, _ := strconv.Atoi(limitStr)
	page, _ := strconv.Atoi(pageStr)

	if page < 1 {
		page = 1
	}
	if limit <= 0 {
		limit = 12
	}
	if limit > 50 {
		limit = 50
	}
	offset := (page - 1) * limit

	var total int64
	query.Count(&total)

	if err := query.Order("published_at DESC, created_at DESC, id DESC").Limit(limit).Offset(offset).Find(&articles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil berita"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	hasNext := page < totalPages

	c.JSON(http.StatusOK, gin.H{
		"data":        articles,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
		"has_next":    hasNext,
	})
}

func GetArticleBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var article models.Article

	if err := config.DB.Preload("Category").Preload("Author").Preload("Tags").Preload("Comments.User").Where("slug = ?", slug).Where("status = ?", models.StatusPublished).First(&article).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	// Increment view count
	config.DB.Model(&article).UpdateColumn("views_count", gorm.Expr("views_count + ?", 1))
	
	// Create ArticleView record for popular tracking
	view := models.ArticleView{
		ArticleID: article.ID,
		ViewedAt:  time.Now(),
	}
	config.DB.Create(&view)

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

	// Validate Tags
	var tags []models.Tag
	if len(req.TagIDs) > 0 {
		config.DB.Where("id IN ?", req.TagIDs).Find(&tags)
		if len(tags) != len(req.TagIDs) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Beberapa tag tidak ditemukan atau tidak valid"})
			return
		}
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

	// Sanitize HTML content
	sanitizedContent := utils.SanitizeArticleContent(req.Content)

	// Validate SEO field lengths
	if len(req.MetaTitle) > 60 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Meta Title maksimal 60 karakter"})
		return
	}
	if len(req.MetaDescription) > 160 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Meta Description maksimal 160 karakter"})
		return
	}

	article := models.Article{
		Title:           req.Title,
		Slug:            slug,
		Summary:         req.Summary,
		Content:         sanitizedContent,
		ThumbnailURL:    req.ThumbnailURL,
		CategoryID:      req.CategoryID,
		AuthorID:        authorID,
		IsFeatured:      req.IsFeatured,
		Tags:            tags,
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		CanonicalURL:    req.CanonicalURL,
		OGImageURL:      req.OGImageURL,
	}

	utils.ApplyArticleStatus(&article, status)

	if err := config.DB.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").Preload("Tags").First(&article, article.ID)
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

	// Validate Tags
	var tags []models.Tag
	if len(req.TagIDs) > 0 {
		config.DB.Where("id IN ?", req.TagIDs).Find(&tags)
		if len(tags) != len(req.TagIDs) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Beberapa tag tidak ditemukan atau tidak valid"})
			return
		}
	}

	// Sanitize HTML content
	article.Title = req.Title
	article.Summary = req.Summary
	article.Content = utils.SanitizeArticleContent(req.Content)
	article.ThumbnailURL = req.ThumbnailURL
	article.CategoryID = req.CategoryID
	article.IsFeatured = req.IsFeatured
	article.MetaTitle = req.MetaTitle
	article.MetaDescription = req.MetaDescription
	article.CanonicalURL = req.CanonicalURL
	article.OGImageURL = req.OGImageURL

	// Validate SEO field lengths
	if len(req.MetaTitle) > 60 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Meta Title maksimal 60 karakter"})
		return
	}
	if len(req.MetaDescription) > 160 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Meta Description maksimal 160 karakter"})
		return
	}

	if req.Status == models.StatusDraft || req.Status == models.StatusPublished {
		utils.ApplyArticleStatus(&article, req.Status)
	}

	if err := config.DB.Save(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui artikel"})
		return
	}

	// Replace tags relationship
	if err := config.DB.Model(&article).Association("Tags").Replace(tags); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui tag artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").Preload("Tags").First(&article, article.ID)
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

	if err := config.DB.Model(&article).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengubah status artikel"})
		return
	}

	config.DB.Preload("Category").Preload("Author").Preload("Tags").First(&article, article.ID)
	c.JSON(http.StatusOK, article)
}

// GetPopularArticles returns popular articles based on views in a specific period
func GetPopularArticles(c *gin.Context) {
	period := c.DefaultQuery("period", "7d")
	limitStr := c.DefaultQuery("limit", "5")
	limit, _ := strconv.Atoi(limitStr)

	var since time.Time
	now := time.Now()
	switch period {
	case "24h":
		since = now.Add(-24 * time.Hour)
	case "7d":
		since = now.Add(-7 * 24 * time.Hour)
	case "30d":
		since = now.Add(-30 * 24 * time.Hour)
	default:
		// Default to 7d
		since = now.Add(-7 * 24 * time.Hour)
		period = "7d"
	}

	// Raw SQL to get popular articles
	var results []struct {
		models.Article
		PeriodViews int `json:"period_views"`
	}

	query := `
		SELECT a.*, COUNT(v.id) as period_views 
		FROM articles a
		JOIN article_views v ON v.article_id = a.id
		WHERE a.status = ? AND v.viewed_at >= ?
		GROUP BY a.id
		ORDER BY period_views DESC, a.published_at DESC
		LIMIT ?
	`
	if err := config.DB.Raw(query, models.StatusPublished, since, limit).Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data berita populer"})
		return
	}

	// Preload associations manually since Raw won't do it automatically in GORM easily
	var articleIDs []uint
	for _, r := range results {
		articleIDs = append(articleIDs, r.ID)
	}

	var articlesWithAssoc []models.Article
	if len(articleIDs) > 0 {
		config.DB.Preload("Category").Preload("Author").Where("id IN ?", articleIDs).Find(&articlesWithAssoc)
	}

	// Map them back to the results
	for i, result := range results {
		for _, a := range articlesWithAssoc {
			if result.ID == a.ID {
				results[i].Category = a.Category
				results[i].Author = a.Author
				break
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"period": period,
		"data":   results,
	})
}

// GetBreakingNews returns active breaking news
func GetBreakingNews(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "5")
	limit, _ := strconv.Atoi(limitStr)

	var articles []models.Article
	if err := config.DB.Model(&models.Article{}).
		Preload("Category").
		Where("status = ?", models.StatusPublished).
		Where("is_breaking = ?", true).
		Order("breaking_priority DESC, published_at DESC").
		Limit(limit).Find(&articles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data breaking news"})
		return
	}

	c.JSON(http.StatusOK, articles)
}

// ToggleBreakingNews allows admin to toggle breaking status and priority
func ToggleBreakingNews(c *gin.Context) {
	id := c.Param("id")
	var article models.Article

	if err := config.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	var req models.UpdateBreakingNewsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Priority < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Prioritas tidak boleh negatif"})
		return
	}

	if req.IsBreaking {
		article.IsBreaking = true
		article.BreakingPriority = req.Priority
	} else {
		article.IsBreaking = false
		article.BreakingPriority = 0
	}

	if err := config.DB.Save(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengubah status breaking news"})
		return
	}

	c.JSON(http.StatusOK, article)
}
