package controllers

import (
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/models"
	"portal-berita-backend/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetTags returns all tags
func GetTags(c *gin.Context) {
	var tags []models.Tag
	if err := config.DB.Order("name ASC").Find(&tags).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar tag"})
		return
	}
	c.JSON(http.StatusOK, tags)
}

// GetArticlesByTag returns articles filtered by tag slug
func GetArticlesByTag(c *gin.Context) {
	slug := c.Param("slug")
	var tag models.Tag

	if err := config.DB.Where("slug = ?", slug).First(&tag).Error; err != nil {
		// Tag not found, return empty array
		c.JSON(http.StatusOK, gin.H{
			"data":  []models.Article{},
			"total": 0,
			"page":  1,
			"limit": 10,
		})
		return
	}

	limitStr := c.DefaultQuery("limit", "10")
	pageStr := c.DefaultQuery("page", "1")
	limit, _ := strconv.Atoi(limitStr)
	page, _ := strconv.Atoi(pageStr)
	offset := (page - 1) * limit

	var articles []models.Article
	query := config.DB.Model(&models.Article{}).
		Preload("Category").
		Preload("Author").
		Preload("Tags").
		Joins("JOIN article_tags ON article_tags.article_id = articles.id").
		Where("article_tags.tag_id = ?", tag.ID).
		Where("articles.status = ?", models.StatusPublished)

	var total int64
	query.Count(&total)

	if err := query.Order("articles.published_at DESC, articles.created_at DESC").
		Limit(limit).Offset(offset).Find(&articles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil berita"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tag":   tag,
		"data":  articles,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// CreateTag creates a new tag (admin only)
func CreateTag(c *gin.Context) {
	var req models.CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// For tags we just use the unique slug generator, though we could use a simple one
	// because tags don't usually have many collisions, but let's just make it simple.
	slug, err := utils.GenerateUniqueSlug(config.DB, req.Name)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag := models.Tag{
		Name: req.Name,
		Slug: slug,
	}

	if err := config.DB.Create(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat tag. Mungkin nama tag sudah ada."})
		return
	}

	c.JSON(http.StatusCreated, tag)
}

// UpdateTag updates an existing tag (admin only)
func UpdateTag(c *gin.Context) {
	id := c.Param("id")
	var tag models.Tag

	if err := config.DB.First(&tag, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag tidak ditemukan"})
		return
	}

	var req models.CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tag.Name = req.Name
	// Note: We retain the old slug as requested by the plan "mempertahankan slug lama agar URL tidak rusak"

	if err := config.DB.Save(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui tag"})
		return
	}

	c.JSON(http.StatusOK, tag)
}

// DeleteTag deletes a tag (admin only)
func DeleteTag(c *gin.Context) {
	id := c.Param("id")
	var tag models.Tag

	if err := config.DB.First(&tag, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tag tidak ditemukan"})
		return
	}

	// GORM will automatically delete the join table records if we use Select(clause.Associations) or if we just delete it.
	// But to be safe, we can clear the association first.
	config.DB.Model(&tag).Association("Articles").Clear()

	if err := config.DB.Delete(&tag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus tag"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tag berhasil dihapus"})
}
