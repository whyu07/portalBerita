package controllers

import (
	"math"
	"net/http"
	"portal-berita-backend/config"
	"portal-berita-backend/models"
	"sort"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetRelatedArticles returns articles related to the given article slug
func GetRelatedArticles(c *gin.Context) {
	slug := c.Param("slug")

	// 1. Find the main article
	var mainArticle models.Article
	if err := config.DB.Preload("Tags").Where("slug = ?", slug).Where("status = ?", models.StatusPublished).First(&mainArticle).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artikel tidak ditemukan"})
		return
	}

	limitStr := c.DefaultQuery("limit", "5")
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 {
		limit = 1
	}
	if limit > 10 {
		limit = 10
	}

	// 2. Collect main article's tag IDs
	var mainTagIDs []uint
	for _, tag := range mainArticle.Tags {
		mainTagIDs = append(mainTagIDs, tag.ID)
	}

	// 3. Fetch candidate articles: same category OR sharing tags OR recent published
	var candidates []models.Article
	query := config.DB.Preload("Category").Preload("Author").Preload("Tags").
		Where("status = ?", models.StatusPublished).
		Where("id != ?", mainArticle.ID).
		Order("published_at DESC, created_at DESC, id DESC").
		Limit(50) // fetch a pool of candidates

	if len(mainTagIDs) > 0 {
		// Get articles that share category OR share tags
		var tagArticleIDs []uint
		config.DB.Table("article_tags").
			Where("tag_id IN ?", mainTagIDs).
			Distinct("article_id").
			Pluck("article_id", &tagArticleIDs)

		query = query.Where(
			config.DB.Where("category_id = ?", mainArticle.CategoryID).
				Or("id IN ?", tagArticleIDs),
		)
	} else {
		// No tags, just use same category or recent
		query = query.Where("category_id = ?", mainArticle.CategoryID)
	}

	query.Find(&candidates)

	// 4. If not enough candidates, fetch more recent articles as fallback
	if len(candidates) < limit {
		var existingIDs []uint
		existingIDs = append(existingIDs, mainArticle.ID)
		for _, c := range candidates {
			existingIDs = append(existingIDs, c.ID)
		}

		var fallback []models.Article
		config.DB.Preload("Category").Preload("Author").Preload("Tags").
			Where("status = ?", models.StatusPublished).
			Where("id NOT IN ?", existingIDs).
			Order("published_at DESC, created_at DESC, id DESC").
			Limit(limit - len(candidates)).
			Find(&fallback)

		candidates = append(candidates, fallback...)
	}

	// 5. Score each candidate
	type scoredArticle struct {
		Article models.Article
		Score   int
	}

	mainTagSet := make(map[uint]bool)
	for _, id := range mainTagIDs {
		mainTagSet[id] = true
	}

	var scored []scoredArticle
	for _, candidate := range candidates {
		score := 0

		// Same category: +50
		if candidate.CategoryID == mainArticle.CategoryID {
			score += 50
		}

		// Shared tags: +20 each, max +40
		tagScore := 0
		if candidate.Tags != nil {
			for _, tag := range candidate.Tags {
				if mainTagSet[tag.ID] {
					tagScore += 20
					if tagScore >= 40 {
						break
					}
				}
			}
		}
		score += tagScore

		// Time proximity based on PublishedAt
		if mainArticle.PublishedAt != nil && candidate.PublishedAt != nil {
			diff := math.Abs(mainArticle.PublishedAt.Sub(*candidate.PublishedAt).Hours())
			if diff <= 24 {
				score += 20
			} else if diff <= 24*7 {
				score += 10
			} else if diff <= 24*30 {
				score += 5
			}
		}

		scored = append(scored, scoredArticle{Article: candidate, Score: score})
	}

	// 6. Sort by score DESC, then PublishedAt DESC, then ID DESC
	sort.Slice(scored, func(i, j int) bool {
		if scored[i].Score != scored[j].Score {
			return scored[i].Score > scored[j].Score
		}
		// Compare PublishedAt
		iPub := scored[i].Article.PublishedAt
		jPub := scored[j].Article.PublishedAt
		if iPub != nil && jPub != nil {
			if !iPub.Equal(*jPub) {
				return iPub.After(*jPub)
			}
		}
		return scored[i].Article.ID > scored[j].Article.ID
	})

	// 7. Take top N
	if len(scored) > limit {
		scored = scored[:limit]
	}

	var result []models.Article
	for _, s := range scored {
		result = append(result, s.Article)
	}

	if result == nil {
		result = []models.Article{}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  result,
		"limit": limit,
	})
}
