package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

type LogLevel string

const (
	LevelInfo  LogLevel = "INFO"
	LevelError LogLevel = "ERROR"
)

type LogEntry struct {
	Timestamp string      `json:"timestamp"`
	Level     LogLevel    `json:"level"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
}

type Logger struct {
	mu   sync.Mutex
	file *os.File
}

var GlobalLogger *Logger

func Init(logFilePath string) error {
	file, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}

	GlobalLogger = &Logger{
		file: file,
	}
	return nil
}

func InsertLog(level LogLevel, msg string, data interface{}) {
	if GlobalLogger == nil {
		fmt.Println("Logger not initialized")
		return
	}

	entry := LogEntry{
		Timestamp: time.Now().Format(time.RFC3339),
		Level:     level,
		Message:   msg,
		Data:      data,
	}

	bytes, err := json.Marshal(entry)
	if err != nil {
		fmt.Printf("Failed to marshal log entry: %v\n", err)
		return
	}

	GlobalLogger.mu.Lock()
	defer GlobalLogger.mu.Unlock()

	if _, err := GlobalLogger.file.Write(append(bytes, '\n')); err != nil {
		fmt.Printf("Failed to write log to file: %v\n", err)
	}

	// Placeholder for Object Storage Sync
	// In a real implementation, we might push to a channel here,
	// and a background worker would batch these logs and upload to S3/GCS.
}

func Info(msg string, data interface{}) {
	InsertLog(LevelInfo, msg, data)
}

func Error(msg string, data interface{}) {
	InsertLog(LevelError, msg, data)
}

func Close() {
	if GlobalLogger != nil && GlobalLogger.file != nil {
		GlobalLogger.file.Close()
	}
}
