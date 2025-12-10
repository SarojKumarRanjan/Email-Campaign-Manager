package server

import (
	"fmt"
	"net/http"
	"time"

	"email_campaign/internal/config"
	"email_campaign/internal/database"
	"email_campaign/internal/handler"
	"email_campaign/internal/logger"
	"email_campaign/internal/middleware"
	"email_campaign/internal/repository"
	"email_campaign/internal/service"
	"email_campaign/internal/utils"
)

type Server struct {
	port int
	db   database.Service

	// Handlers
	authHandler         *handler.AuthHandler
	userHandler         *handler.UserHandler
	contactHandler      *handler.ContactHandler
	templateHandler     *handler.TemplateHandler
	campaignHandler     *handler.CampaignHandler
	analyticsHandler    *handler.AnalyticsHandler
	searchHandler       *handler.SearchHandler
	publicHandler       *handler.PublicHandler
	settingsHandler     *handler.SettingsHandler
	tagHandler          *handler.TagHandler
	subscriptionHandler *handler.SubscriptionHandler
}

func NewServer(cfg *config.Config, db database.Service) *http.Server {
	// Initialize Logger
	if err := logger.Init("app.log"); err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
	}

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
	settingsRepo := repository.NewSettingsRepository(sqlDB)
	tagRepo := repository.NewTagRepository(sqlDB)
	subscriptionRepo := repository.NewSubscriptionRepository(sqlDB)

	// Services
	authSvc := service.NewAuthService(authRepo, userRepo)
	userSvc := service.NewUserService(userRepo)
	contactSvc := service.NewContactService(contactRepo)
	templateSvc := service.NewTemplateService(templateRepo)
	campaignSvc := service.NewCampaignService(campaignRepo)
	analyticsSvc := service.NewAnalyticsService(analyticsRepo)
	searchSvc := service.NewSearchService(searchRepo)
	publicSvc := service.NewPublicService(publicRepo)
	settingsSvc := service.NewSettingsService(settingsRepo)
	tagSvc := service.NewTagService(tagRepo)
	subscriptionSvc := service.NewSubscriptionService(subscriptionRepo)

	// Handlers
	authHandler := handler.NewAuthHandler(authSvc)
	userHandler := handler.NewUserHandler(userSvc)
	contactHandler := handler.NewContactHandler(contactSvc)
	templateHandler := handler.NewTemplateHandler(templateSvc)
	campaignHandler := handler.NewCampaignHandler(campaignSvc)
	analyticsHandler := handler.NewAnalyticsHandler(analyticsSvc)
	searchHandler := handler.NewSearchHandler(searchSvc)
	publicHandler := handler.NewPublicHandler(publicSvc)
	settingsHandler := handler.NewSettingsHandler(settingsSvc)
	tagHandler := handler.NewTagHandler(tagSvc)
	subscriptionHandler := handler.NewSubscriptionHandler(subscriptionSvc)

	NewServer := &Server{
		port:                cfg.Port,
		db:                  db,
		authHandler:         authHandler,
		userHandler:         userHandler,
		contactHandler:      contactHandler,
		templateHandler:     templateHandler,
		campaignHandler:     campaignHandler,
		analyticsHandler:    analyticsHandler,
		searchHandler:       searchHandler,
		publicHandler:       publicHandler,
		settingsHandler:     settingsHandler,
		tagHandler:          tagHandler,
		subscriptionHandler: subscriptionHandler,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      middleware.RequestLogger(NewServer.RegisterRoutes()),
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
	mux.HandleFunc("POST /api/v1/auth/logout", s.authHandler.Logout)
	mux.HandleFunc("POST /api/v1/auth/forgot-password", s.authHandler.ForgotPassword)
	mux.Handle("GET /api/v1/auth/profile", middleware.AuthMiddleware(http.HandlerFunc(s.authHandler.GetProfile)))
	mux.Handle("PUT /api/v1/auth/profile", middleware.AuthMiddleware(http.HandlerFunc(s.authHandler.UpdateProfile)))

	// Protected Routes
	// User Routes
	mux.Handle("GET /api/v1/users/me", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.GetCurrentUser)))
	mux.Handle("PUT /api/v1/users/me", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.UpdateCurrentUser)))
	mux.Handle("DELETE /api/v1/users/me", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.DeleteCurrentUser)))
	mux.Handle("POST /api/v1/users/me/password", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.ChangePassword)))

	// Contact Routes
	// Contact Routes
	mux.Handle("GET /api/v1/contacts", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.ListContacts)))
	mux.Handle("GET /api/v1/contacts/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.GetContact)))
	mux.Handle("POST /api/v1/contacts", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.CreateContact)))
	mux.Handle("PUT /api/v1/contacts/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.UpdateContact)))
	mux.Handle("DELETE /api/v1/contacts/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.DeleteContact)))
	mux.Handle("GET /api/v1/contacts/email/{email}", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.GetContactByEmail)))
	mux.Handle("GET /api/v1/contacts/{id}/activity", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.GetContactActivity)))
	mux.Handle("POST /api/v1/contacts/{id}/subscribe", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.SubscribeContact)))
	mux.Handle("POST /api/v1/contacts/{id}/unsubscribe", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.UnsubscribeContact)))

	// Bulk Operations
	mux.Handle("POST /api/v1/contacts/bulk", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.BulkCreateContacts)))
	mux.Handle("PUT /api/v1/contacts/bulk/update", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.BulkUpdateContacts)))
	mux.Handle("POST /api/v1/contacts/bulk/delete", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.BulkDeleteContacts)))

	// Import/Export
	mux.Handle("POST /api/v1/contacts/import", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.ImportContacts)))
	mux.Handle("GET /api/v1/contacts/export", middleware.AuthMiddleware(http.HandlerFunc(s.contactHandler.ExportContacts)))

	// Template Routes
	// Template Routes
	mux.Handle("GET /api/v1/templates", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.ListTemplates)))
	mux.Handle("POST /api/v1/templates", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.CreateTemplate)))
	mux.Handle("GET /api/v1/templates/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.GetTemplate)))
	mux.Handle("PUT /api/v1/templates/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.UpdateTemplate)))
	mux.Handle("DELETE /api/v1/templates/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.DeleteTemplate)))
	mux.Handle("POST /api/v1/templates/{id}/duplicate", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.DuplicateTemplate)))
	mux.Handle("POST /api/v1/templates/{id}/set-default", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.SetDefaultTemplate)))
	mux.Handle("POST /api/v1/templates/{id}/preview", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.PreviewTemplate)))
	mux.Handle("POST /api/v1/templates/upload/image", middleware.AuthMiddleware(http.HandlerFunc(s.templateHandler.UploadTemplateImage)))

	// Static Files (Uploads)
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	// Campaign Routes
	mux.Handle("GET /api/v1/campaigns", middleware.AuthMiddleware(http.HandlerFunc(s.campaignHandler.ListCampaigns)))

	// Analytics Routes
	mux.Handle("GET /api/v1/analytics/dashboard", middleware.AuthMiddleware(http.HandlerFunc(s.analyticsHandler.GetDashboardStats)))

	// Search Routes
	mux.Handle("GET /api/v1/search", middleware.AuthMiddleware(http.HandlerFunc(s.searchHandler.Search)))

	// Public Routes
	mux.HandleFunc("POST /api/v1/public/unsubscribe", s.publicHandler.Unsubscribe)

	// Settings Routes
	mux.Handle("GET /api/v1/settings", middleware.AuthMiddleware(http.HandlerFunc(s.settingsHandler.GetSettings)))
	mux.Handle("PUT /api/v1/settings", middleware.AuthMiddleware(http.HandlerFunc(s.settingsHandler.UpdateSettings)))
	mux.Handle("PUT /api/v1/settings/smtp", middleware.AuthMiddleware(http.HandlerFunc(s.settingsHandler.UpdateSMTP)))
	mux.Handle("POST /api/v1/settings/smtp/test", middleware.AuthMiddleware(http.HandlerFunc(s.settingsHandler.TestSMTP)))

	// Tag Routes
	mux.Handle("GET /api/v1/tags", middleware.AuthMiddleware(http.HandlerFunc(s.tagHandler.ListTags)))
	mux.Handle("POST /api/v1/tags", middleware.AuthMiddleware(http.HandlerFunc(s.tagHandler.CreateTag)))
	mux.Handle("PUT /api/v1/tags/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.tagHandler.UpdateTag)))
	mux.Handle("DELETE /api/v1/tags/{id}", middleware.AuthMiddleware(http.HandlerFunc(s.tagHandler.DeleteTag)))

	// Subscription Routes
	mux.Handle("GET /api/v1/subscriptions", middleware.AuthMiddleware(http.HandlerFunc(s.subscriptionHandler.GetSubscription)))
	mux.Handle("POST /api/v1/subscriptions", middleware.AuthMiddleware(http.HandlerFunc(s.subscriptionHandler.CreateSubscription)))

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := map[string]string{"message": "Hello World"}
	utils.SuccessResponse(w, http.StatusOK, "Hello World", resp)
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	utils.SuccessResponse(w, http.StatusOK, "Healthy", s.db.Health())
}
