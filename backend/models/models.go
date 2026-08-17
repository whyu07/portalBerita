package models

import (
	"time"
)

type Role string

const (
	RoleAdmin  Role = "admin"
	RoleAuthor Role = "author"
	RoleUser   Role = "user"
)

type Status string

const (
	StatusDraft     Status = "draft"
	StatusPublished Status = "published"
)

// User Model
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Email     string    `gorm:"size:100;uniqueIndex;not null" json:"email"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	Role      Role      `gorm:"type:varchar(20);default:'user'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Category Model
type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Slug        string    `gorm:"size:100;uniqueIndex;not null" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Articles    []Article `gorm:"foreignKey:CategoryID" json:"articles,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Article Model
type Article struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Title        string    `gorm:"size:255;not null" json:"title"`
	Slug         string    `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Summary      string    `gorm:"type:text" json:"summary"`
	Content      string    `gorm:"type:text;not null" json:"content"`
	ThumbnailURL string    `gorm:"size:500" json:"thumbnail_url"`
	CategoryID   uint      `gorm:"not null" json:"category_id"`
	Category     Category  `gorm:"foreignKey:CategoryID" json:"category"`
	AuthorID     uint      `gorm:"not null" json:"author_id"`
	Author       User      `gorm:"foreignKey:AuthorID" json:"author"`
	Status       Status    `gorm:"type:varchar(20);default:'published'" json:"status"`
	ViewsCount   int       `gorm:"default:0" json:"views_count"`
	IsFeatured   bool      `gorm:"default:false" json:"is_featured"`
	Comments     []Comment `gorm:"foreignKey:ArticleID;constraint:OnDelete:CASCADE" json:"comments,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Comment Model
type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ArticleID uint      `gorm:"not null" json:"article_id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// DTO Requests & Responses
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     Role   `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateArticleRequest struct {
	Title        string `json:"title" binding:"required"`
	Summary      string `json:"summary"`
	Content      string `json:"content" binding:"required"`
	ThumbnailURL string `json:"thumbnail_url"`
	CategoryID   uint   `json:"category_id" binding:"required"`
	Status       Status `json:"status"`
	IsFeatured   bool   `json:"is_featured"`
}

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type CreateCommentRequest struct {
	Content string `json:"content" binding:"required"`
}

type CreateManagedUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     Role   `json:"role" binding:"required,oneof=admin author"`
}

type UpdateManagedUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Role     Role   `json:"role" binding:"required,oneof=admin author"`
	Password string `json:"password" binding:"omitempty,min=6"`
}

type ManagedUsersResponse struct {
	Data  []User `json:"data"`
	Total int64  `json:"total"`
	Page  int    `json:"page"`
	Limit int    `json:"limit"`
}
