package utils

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
)

// ParseCSV reads a CSV file from a byte slice and returns a list of maps
// where the keys are the column headers.
func ParseCSV(data []byte) ([]map[string]string, error) {
	reader := csv.NewReader(bytes.NewReader(data))

	// Read header
	headers, err := reader.Read()
	if err != nil {
		return nil, err
	}

	var result []map[string]string

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, err
		}

		if len(record) != len(headers) {
			continue // Skip malformed lines
		}

		row := make(map[string]string)
		for i, value := range record {
			row[headers[i]] = value
		}
		result = append(result, row)
	}

	return result, nil
}

// GenerateCSV writes a list of maps to a byte slice in CSV format.
func GenerateCSV(data []map[string]interface{}) ([]byte, error) {
	if len(data) == 0 {
		return []byte{}, nil
	}

	// Extract headers
	var headers []string
	for k := range data[0] {
		headers = append(headers, k)
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Write header
	if err := writer.Write(headers); err != nil {
		return nil, err
	}

	// Write data
	for _, row := range data {
		var record []string
		for _, h := range headers {
			if val, ok := row[h]; ok {
				record = append(record, fmt.Sprintf("%v", val))
			} else {
				record = append(record, "")
			}
		}
		if err := writer.Write(record); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
