package utils

import (
	"email_campaign/internal/types"
	"fmt"
	"strings"
	"time"
)

type FilterBuilder struct {
	args []interface{}
}

func NewFilterBuilder() *FilterBuilder {
	return &FilterBuilder{
		args: make([]interface{}, 0),
	}
}

// BuildFilterConditions converts frontend filters to SQL WHERE clauses
func (fb *FilterBuilder) BuildFilterConditions(filters []types.Filter, joinOp string, allowedFields map[string]string) (string, []interface{}, error) {
	if len(filters) == 0 {
		return "", nil, nil
	}
	conditions := make([]string, 0, len(filters))

	for _, filter := range filters {
		// Validate field is allowed
		dbColumn, ok := allowedFields[filter.Id]
		if !ok {
			continue // Skip invalid fields
		}
		condition, args, err := fb.buildSingleFilter(filter, dbColumn)
		if err != nil {
			return "", nil, err
		}

		if condition != "" {
			conditions = append(conditions, condition)
			fb.args = append(fb.args, args...)
		}
	}
	if len(conditions) == 0 {
		return "", nil, nil
	}
	// Join conditions with AND/OR
	operator := " AND "
	if strings.ToLower(joinOp) == "or" {
		operator = " OR "
	}
	whereClause := "(" + strings.Join(conditions, operator) + ")"
	return whereClause, fb.args, nil
}
func (fb *FilterBuilder) buildSingleFilter(filter types.Filter, dbColumn string) (string, []interface{}, error) {
	args := make([]interface{}, 0)

	switch filter.Operator {
	case "eq":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s = ?", dbColumn), []interface{}{filter.Value[0]}, nil
	case "ne":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s != ?", dbColumn), []interface{}{filter.Value[0]}, nil
	case "iLike":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s LIKE ?", dbColumn), []interface{}{"%" + filter.Value[0] + "%"}, nil
	case "notILike":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s NOT LIKE ?", dbColumn), []interface{}{"%" + filter.Value[0] + "%"}, nil
	case "lt":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s < ?", dbColumn), []interface{}{filter.Value[0]}, nil
	case "lte":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s <= ?", dbColumn), []interface{}{filter.Value[0]}, nil
	case "gt":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s > ?", dbColumn), []interface{}{filter.Value[0]}, nil
	case "gte":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s >= ?", dbColumn), []interface{}{filter.Value[0]}, nil
	case "isBetween":
		if len(filter.Value) < 2 {
			return "", nil, nil
		}
		return fmt.Sprintf("%s BETWEEN ? AND ?", dbColumn), []interface{}{filter.Value[0], filter.Value[1]}, nil
	case "inArray":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		placeholders := make([]string, len(filter.Value))
		for i, val := range filter.Value {
			placeholders[i] = "?"
			args = append(args, val)
		}
		return fmt.Sprintf("%s IN (%s)", dbColumn, strings.Join(placeholders, ",")), args, nil
	case "notInArray":
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		placeholders := make([]string, len(filter.Value))
		for i, val := range filter.Value {
			placeholders[i] = "?"
			args = append(args, val)
		}
		return fmt.Sprintf("%s NOT IN (%s)", dbColumn, strings.Join(placeholders, ",")), args, nil
	case "isEmpty":
		return fmt.Sprintf("(%s IS NULL OR %s = '')", dbColumn, dbColumn), nil, nil
	case "isNotEmpty":
		return fmt.Sprintf("(%s IS NOT NULL AND %s != '')", dbColumn, dbColumn), nil, nil
	case "isRelativeToToday":
		// Handle relative date filters
		if len(filter.Value) == 0 {
			return "", nil, nil
		}
		// Parse relative date (e.g., "-7" for 7 days ago, "+30" for 30 days from now)
		return fb.buildRelativeDateFilter(dbColumn, filter.Value[0])
	default:
		return "", nil, fmt.Errorf("unsupported operator: %s", filter.Operator)
	}
}
func (fb *FilterBuilder) buildRelativeDateFilter(dbColumn, relativeValue string) (string, []interface{}, error) {
	// Example: "-7" means 7 days ago, "+30" means 30 days from now
	var days int
	_, err := fmt.Sscanf(relativeValue, "%d", &days)
	if err != nil {
		return "", nil, err
	}
	targetDate := time.Now().AddDate(0, 0, days).Format("2006-01-02")
	return fmt.Sprintf("DATE(%s) = ?", dbColumn), []interface{}{targetDate}, nil
}
