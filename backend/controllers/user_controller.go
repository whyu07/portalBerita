package controllers

import (
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/models"
	"portal-berita-backend/utils"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// ListManagedUsers returns paginated admin and author users
func ListManagedUsers(c *gin.Context) {
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit
	var users []models.User
	var total int64

	db := config.DB.Model(&models.User{}).Where("role IN ?", []models.Role{models.RoleAdmin, models.RoleAuthor})

	if search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		db = db.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ?", searchTerm, searchTerm)
	}

	db.Count(&total)

	if err := db.Order("created_at DESC").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data user"})
		return
	}

	c.JSON(http.StatusOK, models.ManagedUsersResponse{
		Data:  users,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

// CreateManagedUser creates a new admin or author user
func CreateManagedUser(c *gin.Context) {
	var req models.CreateManagedUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check email uniqueness
	var existingUser models.User
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password"})
		return
	}

	user := models.User{
		Name:     utils.SanitizePlainText(req.Name),
		Email:    req.Email,
		Password: string(hashedPassword),
		Role:     req.Role,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mendaftarkan user"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

// UpdateManagedUser updates an existing admin or author user
func UpdateManagedUser(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateManagedUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// Protect non-managed roles from being managed via this endpoint just in case
	if user.Role != models.RoleAdmin && user.Role != models.RoleAuthor {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya admin dan author yang dapat dikelola melalui endpoint ini"})
		return
	}

	// Check email uniqueness if email changed
	if user.Email != req.Email {
		var existingUser models.User
		if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar pada akun lain"})
			return
		}
	}

	// Last Admin Protection
	if user.Role == models.RoleAdmin && req.Role != models.RoleAdmin {
		var adminCount int64
		config.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount)
		if adminCount <= 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal mengubah role. Harus ada setidaknya satu admin."})
			return
		}
	}

	user.Name = utils.SanitizePlainText(req.Name)
	user.Email = req.Email
	user.Role = req.Role

	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses password baru"})
			return
		}
		user.Password = string(hashedPassword)
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan perubahan user"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// DeleteManagedUser deletes an admin or author user
func DeleteManagedUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	// The user requested: "Fitur Hapus Akun hanya pada role: author"
	// This means we only allow deleting users with role author. Let's enforce that.
	if user.Role != models.RoleAuthor {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya akun dengan role author yang dapat dihapus"})
		return
	}

	// Last Admin Protection is no longer strictly needed here since we only delete authors, 
	// but we'll remove it as it's dead code now.

	// Check for related articles
	var articleCount int64
	config.DB.Model(&models.Article{}).Where("author_id = ?", id).Count(&articleCount)
	if articleCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak dapat menghapus akun karena masih memiliki artikel terkait."})
		return
	}

	// Delete the user
	if err := config.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Akun berhasil dihapus"})
}
