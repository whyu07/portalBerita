package routes

import (
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/controllers"
	"portal-berita-backend/middlewares"
	"portal-berita-backend/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS Config
	configCors := cors.DefaultConfig()
	configCors.AllowAllOrigins = false
	configCors.AllowOrigins = config.Cfg.CORSOrigins
	configCors.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(configCors))

	r.GET("/health", func(c *gin.Context) {
		sqlDB, err := config.DB.DB()
		if err != nil || sqlDB.Ping() != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "error"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api/v1")
	{
		// Auth Routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.GET("/me", middlewares.JWTAuthMiddleware(), controllers.GetMe)
		}

		// Categories Public
		api.GET("/categories", controllers.GetCategories)

		// Tags Public
		api.GET("/tags", controllers.GetTags)
		api.GET("/tags/:slug/articles", controllers.GetArticlesByTag)

		// Categories Admin + Author
		categoriesAdmin := api.Group("/categories")
		categoriesAdmin.Use(middlewares.JWTAuthMiddleware(), middlewares.RequireRole(models.RoleAdmin, models.RoleAuthor))
		{
			categoriesAdmin.POST("", controllers.CreateCategory)
			categoriesAdmin.PUT("/:id", controllers.UpdateCategory)
			categoriesAdmin.DELETE("/:id", controllers.DeleteCategory)
		}

		// Tags Admin + Author
		tagsAdmin := api.Group("/admin/tags")
		tagsAdmin.Use(middlewares.JWTAuthMiddleware(), middlewares.RequireRole(models.RoleAdmin, models.RoleAuthor))
		{
			tagsAdmin.POST("", controllers.CreateTag)
			tagsAdmin.PUT("/:id", controllers.UpdateTag)
			tagsAdmin.DELETE("/:id", controllers.DeleteTag)
		}

		// Articles Public
		api.GET("/articles", controllers.GetArticles)
		api.GET("/articles/popular", controllers.GetPopularArticles)
		api.GET("/breaking-news", controllers.GetBreakingNews)
		api.GET("/articles/:slug/related", controllers.GetRelatedArticles)
		api.GET("/articles/:slug", controllers.GetArticleBySlug)

		// Articles Auth / Admin / Author
		articlesAdmin := api.Group("/articles")
		articlesAdmin.Use(middlewares.JWTAuthMiddleware(), middlewares.RequireRole(models.RoleAdmin, models.RoleAuthor))
		{
			articlesAdmin.POST("", controllers.CreateArticle)
			articlesAdmin.PUT("/:id", controllers.UpdateArticle)
			articlesAdmin.DELETE("/:id", controllers.DeleteArticle)
		}

		// Managed Articles (Dashboard) - Admin + Author
		managedArticles := api.Group("/admin/articles")
		managedArticles.Use(middlewares.JWTAuthMiddleware(), middlewares.RequireRole(models.RoleAdmin, models.RoleAuthor))
		{
			managedArticles.GET("", controllers.GetManagedArticles)
			managedArticles.GET("/popular", controllers.GetPopularArticles)
			managedArticles.PATCH("/:id/status", controllers.UpdateArticleStatus)
			managedArticles.PATCH("/:id/breaking", controllers.ToggleBreakingNews)
		}

		// Comments Routes
		api.GET("/comments/article/:articleId", controllers.GetCommentsByArticle)
		api.POST("/comments/article/:articleId", middlewares.JWTAuthMiddleware(), controllers.CreateComment)
		api.DELETE("/comments/:id", middlewares.JWTAuthMiddleware(), controllers.DeleteComment)

		// User Management Admin
		managedUsers := api.Group("/admin/users")
		managedUsers.Use(middlewares.JWTAuthMiddleware(), middlewares.RequireRole(models.RoleAdmin))
		{
			managedUsers.GET("", controllers.ListManagedUsers)
			managedUsers.POST("", controllers.CreateManagedUser)
			managedUsers.PUT("/:id", controllers.UpdateManagedUser)
			managedUsers.DELETE("/:id", controllers.DeleteManagedUser)
		}
	}

	return r
}
