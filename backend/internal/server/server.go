package server

import (
	"fmt"
	"net/http"
	"time"

	"email_campaign/internal/config"
	"email_campaign/internal/database"
	"email_campaign/internal/handler"
	"email_campaign/internal/middleware"
	"email_campaign/internal/repository"
	"email_campaign/internal/service"
	"email_campaign/internal/utils"
)

type Server struct {
	port int
	db   database.Service

	// Handlers
	authHandler      *handler.AuthHandler
	userHandler      *handler.UserHandler
	contactHandler   *handler.ContactHandler
	templateHandler  *handler.TemplateHandler
	campaignHandler  *handler.CampaignHandler
	analyticsHandler *handler.AnalyticsHandler
	searchHandler    *handler.SearchHandler
	publicHandler    *handler.PublicHandler
}

func NewServer(cfg *config.Config, db database.Service) *http.Server {
	// Repositories
	sqlDB := db.DB()
	authRepo := repository.NewAuthRepository(sqlDB)
	userRepo := repository.NewUserRepository(sqlDB)
	contactRepo := repository.NewContactRepository(sqlDB)
	templateRepo := repository.NewTemplateRepository(sqlDB)
	campaignRepo := repository.NewCampaignRepository(sqlDB)
	analyticsRepo := repository.NewAnalyticsRepository(sqlDB)
	searchRepo := repository.NewSearchRepository(sqlDB)
	publicRepo := repository.NewPublicRepository(sqlDB)

	// Services
	authSvc := service.NewAuthService(authRepo)
	userSvc := service.NewUserService(userRepo)
	contactSvc := service.NewContactService(contactRepo)
	templateSvc := service.NewTemplateService(templateRepo)
	campaignSvc := service.NewCampaignService(campaignRepo)
	analyticsSvc := service.NewAnalyticsService(analyticsRepo)
	searchSvc := service.NewSearchService(searchRepo)
	publicSvc := service.NewPublicService(publicRepo)

	// Handlers
	authHandler := handler.NewAuthHandler(authSvc)
	userHandler := handler.NewUserHandler(userSvc)
	contactHandler := handler.NewContactHandler(contactSvc)
	templateHandler := handler.NewTemplateHandler(templateSvc)
	campaignHandler := handler.NewCampaignHandler(campaignSvc)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsSvc)
	searchHandler := handler.NewSearchHandler(searchSvc)
	publicHandler := handler.NewPublicHandler(publicSvc)

	NewServer := &Server{
		port:             cfg.Port,
		db:               db,
		authHandler:      authHandler,
		userHandler:      userHandler,
		contactHandler:   contactHandler,
		templateHandler:  templateHandler,
		campaignHandler:  campaignHandler,
		analyticsHandler: analyticsHandler,
		searchHandler:    searchHandler,
		publicHandler:    publicHandler,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}

func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", s.HelloWorldHandler)
	mux.HandleFunc("/health", s.healthHandler)

	// Auth Routes
	mux.HandleFunc("POST /api/v1/auth/register", s.authHandler.Register)
	mux.HandleFunc("POST /api/v1/auth/verify-email", s.authHandler.VerifyEmail)
	mux.HandleFunc("POST /api/v1/auth/login", s.authHandler.Login)
	mux.HandleFunc("GET /api/v1/auth/google/login", s.authHandler.GoogleLogin)
	mux.HandleFunc("GET /api/v1/auth/google/callback", s.authHandler.GoogleCallback)
	mux.HandleFunc("POST /api/v1/auth/refresh", s.authHandler.RefreshToken)

	// Protected Routes
	// User Routes
	mux.Handle("GET /api/v1/users/me", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.GetCurrentUser)))

	// Contact Routes
	mux.Handle("GET /api/v1/contacts", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.ListContacts)))

	// Template Routes
	mux.Handle("GET /api/v1/templates", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.ListTemplates)))

	// Campaign Routes
	mux.Handle("GET /api/v1/campaigns", middleware.AuthMiddleware(http.HandlerFunc(s.campaignHandler.ListCampaigns)))

	// Analytics Routes
	mux.Handle("GET /api/v1/analytics/dashboard", middleware.AuthMiddleware(http.HandlerFunc(s.analyticsHandler.GetDashboardStats)))

	// Search Routes
	mux.Handle("GET /api/v1/search", middleware.AuthMiddleware(http.HandlerFunc(s.searchHandler.Search)))

	// Public Routes
	mux.HandleFunc("POST /api/v1/public/unsubscribe", s.publicHandler.Unsubscribe)

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := map[string]string{"message": "Hello World"}
	utils.SuccessResponse(w, http.StatusOK, "Hello World", resp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	utils.SuccessResponse(w, http.StatusOK, "Healthy", s.db.Health())
}
