package middlewares

import (
	"net/http"
	"portal-berita-backend/models"
	"portal-berita-backend/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Header Authorization dibutuhkan"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Format Authorization harus 'Bearer <token>'"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateJWTToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token tidak valid atau telah kedaluwarsa"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)
		c.Next()
	}
}

func RequireRole(allowedRoles ...models.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("userRole")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Autentikasi tidak ditemukan"})
			c.Abort()
			return
		}

		userRole := models.Role(roleVal.(string))
		for _, role := range allowedRoles {
			if userRole == role {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Anda tidak memiliki izin untuk tindakan ini"})
		c.Abort()
	}
}
