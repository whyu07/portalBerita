package utils

import (
	"regexp"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

// ArticleSanitizer returns a bluemonday policy for article content
func ArticleSanitizer() *bluemonday.Policy {
	p := bluemonday.NewPolicy()

	// Text formatting
	p.AllowElements("p", "br", "hr")
	p.AllowElements("h1", "h2", "h3", "h4", "h5", "h6")
	p.AllowElements("strong", "b", "em", "i", "u", "s", "del", "ins", "sub", "sup")
	p.AllowElements("ul", "ol", "li")
	p.AllowElements("blockquote", "pre", "code")
	p.AllowElements("span", "div")

	// Links
	p.AllowAttrs("href", "title", "target", "rel").OnElements("a")
	p.AllowRelativeURLs(false)
	p.RequireParseableURLs(true)
	p.AllowURLSchemes("http", "https")

	// Images
	p.AllowAttrs("src", "alt", "title", "width", "height", "loading").OnElements("img")

	// Figure / figcaption
	p.AllowElements("figure", "figcaption")

	// YouTube iframe - only allow youtube-nocookie.com embed
	p.AllowAttrs("src", "width", "height", "frameborder", "allow", "allowfullscreen", "title", "loading").OnElements("iframe")
	p.AllowAttrs("class", "style").OnElements("div") // for video wrapper

	// Table (optional but useful)
	p.AllowElements("table", "thead", "tbody", "tr", "th", "td")

	// Generic attributes
	p.AllowAttrs("class").Globally()

	return p
}

// SanitizeArticleContent sanitizes HTML content for article storage
func SanitizeArticleContent(content string) string {
	p := ArticleSanitizer()
	sanitized := p.Sanitize(content)

	// Additional: validate iframe src is YouTube only
	sanitized = sanitizeIframes(sanitized)

	return sanitized
}

// sanitizeIframes removes iframes that are not YouTube embeds
func sanitizeIframes(html string) string {
	iframeRegex := regexp.MustCompile(`<iframe[^>]*src="([^"]*)"[^>]*>`)
	return iframeRegex.ReplaceAllStringFunc(html, func(match string) string {
		srcMatch := regexp.MustCompile(`src="([^"]*)"`).FindStringSubmatch(match)
		if len(srcMatch) < 2 {
			return "" // remove iframe without src
		}
		src := srcMatch[1]
		if isValidYouTubeEmbed(src) {
			return match
		}
		return "" // remove non-YouTube iframes
	})
}

// isValidYouTubeEmbed checks if a URL is a valid YouTube embed URL
func isValidYouTubeEmbed(url string) bool {
	allowedPrefixes := []string{
		"https://www.youtube.com/embed/",
		"https://youtube.com/embed/",
		"https://www.youtube-nocookie.com/embed/",
		"https://youtube-nocookie.com/embed/",
	}
	for _, prefix := range allowedPrefixes {
		if strings.HasPrefix(url, prefix) {
			return true
		}
	}
	return false
}

// IsHTMLContent checks if content appears to contain HTML tags
func IsHTMLContent(content string) bool {
	return strings.Contains(content, "<p>") || strings.Contains(content, "<h") ||
		strings.Contains(content, "<div") || strings.Contains(content, "<br")
}

// SanitizePlainText strips ALL HTML tags from text input.
// Use this for fields that should never contain HTML (title, name, summary, comments, etc.).
func SanitizePlainText(text string) string {
	p := bluemonday.StrictPolicy()
	sanitized := p.Sanitize(text)
	// Trim leading/trailing whitespace that might remain after stripping tags
	return strings.TrimSpace(sanitized)
}

// ValidateURL checks that a URL string uses only http:// or https:// schemes.
// Returns true if the URL is valid and safe, or if the URL is empty (optional field).
func ValidateURL(rawURL string) bool {
	if rawURL == "" {
		return true // empty is allowed for optional fields
	}
	return strings.HasPrefix(rawURL, "http://") || strings.HasPrefix(rawURL, "https://")
}
