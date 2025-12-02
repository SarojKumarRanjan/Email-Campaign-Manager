package utils

import (
	"fmt"
	"strings"
)

// Paginator helps build SQL queries with pagination, sorting, and searching
type Paginator struct {
	Page      int
	Limit     int
	SortBy    string
	SortOrder string
	Search    string
}

// NewPaginator creates a new Paginator instance
func NewPaginator(page, limit int, sortBy, sortOrder, search string) *Paginator {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	return &Paginator{
		Page:      page,
		Limit:     limit,
		SortBy:    sortBy,
		SortOrder: sortOrder,
		Search:    search,
	}
}

// Apply adds pagination, sorting, and search clauses to the query
// It returns the modified query and updated arguments
func (p *Paginator) Apply(query string, args []interface{}, allowedSortFields []string, searchFields []string) (string, []interface{}) {
	// Search
	if p.Search != "" && len(searchFields) > 0 {
		var searchClauses []string
		searchTerm := "%" + p.Search + "%"
		for _, field := range searchFields {
			searchClauses = append(searchClauses, fmt.Sprintf("%s LIKE ?", field))
			args = append(args, searchTerm)
		}
		if len(searchClauses) > 0 {
			if strings.Contains(strings.ToUpper(query), "WHERE") {
				query += " AND (" + strings.Join(searchClauses, " OR ") + ")"
			} else {
				query += " WHERE (" + strings.Join(searchClauses, " OR ") + ")"
			}
		}
	}

	// Sorting
	if p.SortBy != "" {
		validSort := false
		for _, field := range allowedSortFields {
			if strings.EqualFold(p.SortBy, field) {
				validSort = true
				break
			}
		}
		if validSort {
			order := "ASC"
			if strings.EqualFold(p.SortOrder, "DESC") {
				order = "DESC"
			}
			query += fmt.Sprintf(" ORDER BY %s %s", p.SortBy, order)
		}
	}

	// Pagination
	offset := (p.Page - 1) * p.Limit
	query += " LIMIT ? OFFSET ?"
	args = append(args, p.Limit, offset)

	return query, args
}

// BuildCountQuery creates a query to count total records matching the search criteria
func (p *Paginator) BuildCountQuery(baseQuery string, args []interface{}, searchFields []string) (string, []interface{}) {
	// Search
	if p.Search != "" && len(searchFields) > 0 {
		var searchClauses []string
		searchTerm := "%" + p.Search + "%"
		for _, field := range searchFields {
			searchClauses = append(searchClauses, fmt.Sprintf("%s LIKE ?", field))
			args = append(args, searchTerm)
		}
		if len(searchClauses) > 0 {
			if strings.Contains(strings.ToUpper(baseQuery), "WHERE") {
				baseQuery += " AND (" + strings.Join(searchClauses, " OR ") + ")"
			} else {
				baseQuery += " WHERE (" + strings.Join(searchClauses, " OR ") + ")"
			}
		}
	}

	return "SELECT COUNT(*) FROM (" + baseQuery + ") as count_table", args
}
