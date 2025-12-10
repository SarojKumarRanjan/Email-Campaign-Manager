package utils

import (
	"bytes"
	"fmt"

	"github.com/xuri/excelize/v2"
)

// ParseExcel reads an Excel file from a byte slice and returns a list of maps
// where the keys are the column headers (assuming first row is header).
func ParseExcel(data []byte) ([]map[string]string, error) {
	reader := bytes.NewReader(data)
	f, err := excelize.OpenReader(reader)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	// Get the first sheet name
	sheetName := f.GetSheetName(0)

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, err
	}

	if len(rows) < 2 {
		return nil, fmt.Errorf("empty or invalid excel file")
	}

	headers := rows[0]
	var result []map[string]string

	for i := 1; i < len(rows); i++ {
		row := rows[i]
		record := make(map[string]string)

		for j, cell := range row {
			if j < len(headers) {
				record[headers[j]] = cell
			}
		}
		result = append(result, record)
	}

	return result, nil
}
