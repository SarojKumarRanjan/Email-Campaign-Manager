package mysql

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"email_campaign/internal/config"
	"email_campaign/internal/database/migrations"

	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-migrate/migrate/v4"
	mysqldriver "github.com/golang-migrate/migrate/v4/database/mysql"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

type service struct {
	db *sql.DB
}

var dbInstance *service

func New(cfg *config.Config) (*service, error) {

	if dbInstance != nil {
		return dbInstance, nil
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&multiStatements=true", cfg.DBUser, cfg.DBPass, cfg.DBHost, cfg.DBPort, cfg.DBName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	if err := db.Ping(); err != nil {
		return nil, err
	}

	driver, err := mysqldriver.WithInstance(db, &mysqldriver.Config{})
	if err != nil {
		return nil, fmt.Errorf("could not create mysql driver: %w", err)
	}

	d, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return nil, fmt.Errorf("could not create iofs driver: %w", err)
	}

	m, err := migrate.NewWithInstance(
		"iofs",
		d,
		"mysql",
		driver,
	)
	if err != nil {
		return nil, fmt.Errorf("could not create migrate instance: %w", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return nil, fmt.Errorf("could not run migrations: %w", err)
	}

	dbInstance = &service{
		db: db,
	}
	return dbInstance, nil
}

func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)

	err := s.db.PingContext(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		log.Fatalf("db down: %v", err)
		return stats
	}

	stats["status"] = "up"
	stats["message"] = "It's healthy"
	stats["open_connections"] = fmt.Sprintf("%d", s.db.Stats().OpenConnections)
	stats["in_use"] = fmt.Sprintf("%d", s.db.Stats().InUse)
	stats["idle"] = fmt.Sprintf("%d", s.db.Stats().Idle)
	stats["wait_count"] = fmt.Sprintf("%d", s.db.Stats().WaitCount)
	stats["wait_duration"] = fmt.Sprintf("%v", s.db.Stats().WaitDuration)
	stats["max_idle_closed"] = fmt.Sprintf("%d", s.db.Stats().MaxIdleClosed)
	stats["max_lifetime_closed"] = fmt.Sprintf("%d", s.db.Stats().MaxLifetimeClosed)

	if s.db.Stats().OpenConnections > 40 {
		stats["message"] = "The database is experiencing heavy load."
	}

	if s.db.Stats().WaitCount > 1000 {
		stats["message"] = "The database has a high number of wait events, indicating potential bottlenecks."
	}

	if s.db.Stats().MaxIdleClosed > 100 {
		stats["message"] = "Many idle connections are being closed, consider revising the connection pool settings."
	}

	if s.db.Stats().MaxLifetimeClosed > 100 {
		stats["message"] = "Many connections are being closed due to max lifetime, consider increasing max lifetime or revising the connection usage patterns."
	}

	return stats
}

func (s *service) Close() error {
	log.Printf("Disconnected from database: %s", "mysql")
	return s.db.Close()
}

func (s *service) DB() *sql.DB {
	return s.db
}
