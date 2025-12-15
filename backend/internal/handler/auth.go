package handler

import (
	"net/http"

	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type AuthHandler struct {
	svc service.AuthService
}

func NewAuthHandler(svc service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req types.RegisterRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.Register(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Please check your email for OTP", nil)
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var req types.VerifyEmailRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.svc.VerifyEmail(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SetTokenCookies(w, resp.AccessToken, resp.RefreshToken)
	utils.SuccessResponse(w, http.StatusOK, "Email verified successfully", resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req types.LoginRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.svc.Login(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}

	utils.SetTokenCookies(w, resp.AccessToken, resp.RefreshToken)
	utils.SuccessResponse(w, http.StatusOK, "Login successful", resp)
}

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := h.svc.GetGoogleLoginURL()
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Missing code")
		return
	}

	resp, err := h.svc.GoogleCallback(code)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SetTokenCookies(w, resp.AccessToken, resp.RefreshToken)
	utils.SuccessResponse(w, http.StatusOK, "Google login successful", resp)
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		utils.ErrorResponse(w, http.StatusUnauthorized, "No refresh token provided")
		return
	}

	req := types.RefreshTokenRequest{
		RefreshToken: cookie.Value,
	}

	resp, err := h.svc.RefreshToken(&req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusUnauthorized, err.Error())
		return
	}
	utils.SetTokenCookies(w, resp.AccessToken, resp.RefreshToken)
	// remove the message from response on production
	utils.SuccessResponse(w, http.StatusOK, "Token refreshed successfully", resp)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	utils.ClearTokenCookies(w)
	utils.SuccessResponse(w, http.StatusOK, "Logged out successfully", nil)
}

func (h *AuthHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req types.ForgotPasswordRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.ForgotPassword(req.Email); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "If your email is registered, you will receive a password reset link", nil)
}

func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)

	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := h.svc.GetProfile(userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Profile retrieved successfully", user)
}

func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req types.UpdateUserRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.UpdateProfile(userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Profile updated successfully", nil)
}
