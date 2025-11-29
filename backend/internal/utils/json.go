package utils

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"email_campaign/internal/logger"
)

type JSONResponse struct {
	Error   bool        `json:"error"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func WriteJSON(w http.ResponseWriter, status int, data interface{}, headers ...http.Header) error {
	out, err := json.Marshal(data)
	if err != nil {
		return err
	}

	if len(headers) > 0 {
		for key, value := range headers[0] {
			w.Header()[key] = value
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, err = w.Write(out)
	return err
}

func SuccessResponse(w http.ResponseWriter, status int, message string, data interface{}) error {
	return WriteJSON(w, status, JSONResponse{
		Error:   false,
		Message: message,
		Data:    data,
	})
}

func ErrorResponse(w http.ResponseWriter, status int, message string) error {
	logger.Error("API Error", map[string]interface{}{
		"status":  status,
		"message": message,
	})

	return WriteJSON(w, status, JSONResponse{
		Error:   true,
		Message: message,
		Data:    nil,
	})
}

func ReadJSON(w http.ResponseWriter, r *http.Request, data interface{}) error {
	maxBytes := 1048576 // 1MB
	r.Body = http.MaxBytesReader(w, r.Body, int64(maxBytes))

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	err := dec.Decode(data)
	if err != nil {
		return err
	}

	err = dec.Decode(&struct{}{})
	if err != io.EOF {
		return errors.New("body must only contain a single JSON value")
	}

	return nil
}

func ErrorJSON(w http.ResponseWriter, err error, status ...int) error {
	statusCode := http.StatusBadRequest

	if len(status) > 0 {
		statusCode = status[0]
	}

	return ErrorResponse(w, statusCode, err.Error())
}
