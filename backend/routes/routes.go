package routes

import (
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
	configCors.AllowAllOrigins = true
	configCors.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(configCors))

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

		// Categories Admin
		categoriesAdmin := api.Group("/categories")
		categoriesAdmin.Use(middlewares.JWTAuthMiddleware(), middlewares.RequireRole(models.RoleAdmin))
		{
			categoriesAdmin.POST("", controllers.CreateCategory)
			categoriesAdmin.PUT("/:id", controllers.UpdateCategory)
			categoriesAdmin.DELETE("/:id", controllers.DeleteCategory)
		}

		// Articles Public
		api.GET("/articles", controllers.GetArticles)
		api.GET("/articles/:slug", controllers.GetArticleBySlug)

		// Articles Auth / Admin / Author
		articlesAdmin := api.Group("/articles")
		articlesAdmin.Use(middlewares.JWTAuthMiddleware(), middlewares.RequireRole(models.RoleAdmin, models.RoleAuthor))
		{
			articlesAdmin.POST("", controllers.CreateArticle)
			articlesAdmin.PUT("/:id", controllers.UpdateArticle)
			articlesAdmin.DELETE("/:id", controllers.DeleteArticle)
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
