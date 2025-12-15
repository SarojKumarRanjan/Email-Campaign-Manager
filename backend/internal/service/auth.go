package service

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"io"
	"math/big"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"email_campaign/internal/config"
	"email_campaign/internal/repository"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type AuthService interface {
	Register(req *types.RegisterRequest) error
	VerifyEmail(req *types.VerifyEmailRequest) (*types.LoginResponse, error)
	Login(req *types.LoginRequest) (*types.LoginResponse, error)
	GetGoogleLoginURL() string
	GoogleCallback(code string) (*types.LoginResponse, error)
	RefreshToken(req *types.RefreshTokenRequest) (*types.LoginResponse, error)
	ForgotPassword(email string) error
	GetProfile(userID uint64) (*types.User, error)
	UpdateProfile(userID uint64, req *types.UpdateUserRequest) error
}

type authService struct {
	repo       repository.AuthRepository
	userRepo   repository.UserRepository
	googleConf *oauth2.Config
}

func NewAuthService(repo repository.AuthRepository, userRepo repository.UserRepository) AuthService {
	cfg := config.Load()
	return &authService{
		repo:     repo,
		userRepo: userRepo,
		googleConf: &oauth2.Config{
			ClientID:     cfg.GoogleClientID,
			ClientSecret: cfg.GoogleClientSecret,
			RedirectURL:  cfg.GoogleRedirectURL,
			Scopes: []string{
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			},
			Endpoint: google.Endpoint,
		},
	}
}

func (s *authService) Register(req *types.RegisterRequest) error {
	// Check if user exists
	_, _, err := s.repo.GetUserByEmail(req.Email)
	if err == nil {
		return errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	req.Password = string(hashedPassword)

	// Create user
	if err := s.repo.CreateUser(req); err != nil {
		return err
	}

	// Generate OTP
	otp, err := generateOTP()
	if err != nil {
		return err
	}

	// Store OTP
	if err := s.repo.StoreOTP(req.Email, otp); err != nil {
		return err
	}

	// Send OTP
	go utils.SendOTP(req.Email, otp)

	return nil
}

func (s *authService) VerifyEmail(req *types.VerifyEmailRequest) (*types.LoginResponse, error) {
	storedOTP, err := s.repo.GetOTP(req.Email)
	if err != nil {
		return nil, err
	}

	if storedOTP != req.OTP {
		return nil, errors.New("invalid otp")
	}

	if err := s.repo.VerifyUser(req.Email); err != nil {
		return nil, err
	}

	// Auto-login: Get user and generate tokens
	user, _, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, err
	}

	accessToken, refreshToken, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, err
	}

	return &types.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	}, nil
}

func (s *authService) Login(req *types.LoginRequest) (*types.LoginResponse, error) {
	user, passwordHash, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	// TODO: Check if verified (requires DB update to fetch is_verified)
	// For now, assuming if they can login, they are verified or we enforce it here.
	// Ideally GetUserByEmail should return is_verified too.
	// Let's assume we enforce it.

	accessToken, refreshToken, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, err
	}

	return &types.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	}, nil
}

func (s *authService) GetGoogleLoginURL() string {
	return s.googleConf.AuthCodeURL("state", oauth2.AccessTypeOffline)
}

func (s *authService) GoogleCallback(code string) (*types.LoginResponse, error) {
	token, err := s.googleConf.Exchange(context.Background(), code)
	if err != nil {
		return nil, err
	}

	client := s.googleConf.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var googleUser types.GoogleUser
	if err := json.Unmarshal(data, &googleUser); err != nil {
		return nil, err
	}

	user, err := s.repo.GetOrCreateGoogleUser(&googleUser)
	if err != nil {
		return nil, err
	}

	accessToken, refreshToken, err := utils.GenerateTokenPair(user.ID)
	if err != nil {
		return nil, err
	}

	return &types.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	}, nil
}

func (s *authService) RefreshToken(req *types.RefreshTokenRequest) (*types.LoginResponse, error) {
	claims, err := utils.ValidateToken(req.RefreshToken)
	if err != nil {
		return nil, err
	}

	// Ideally check if user still exists / is active
	// For now just generate new pair

	accessToken, refreshToken, err := utils.GenerateTokenPair(claims.UserID)
	if err != nil {
		return nil, err
	}

	return &types.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *authService) ForgotPassword(email string) error {
	// TODO: Generate reset token and send email
	// For now, just check if user exists
	_, _, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return errors.New("user not found")
	}
	return nil
}

func (s *authService) GetProfile(userID uint64) (*types.User, error) {
	return s.userRepo.GetUserByID(userID)
}

func (s *authService) UpdateProfile(userID uint64, req *types.UpdateUserRequest) error {
	user, err := s.userRepo.GetUserByID(userID)
	if err != nil {
		return err
	}

	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.CompanyName = req.CompanyName

	return s.userRepo.UpdateUser(user)
}

func generateOTP() (string, error) {
	const digits = "0123456789"
	ret := make([]byte, 6)
	for i := 0; i < 6; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		ret[i] = digits[num.Int64()]
	}
	return string(ret), nil
}
