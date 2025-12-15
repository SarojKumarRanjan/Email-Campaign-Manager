package handler

import (
	"net/http"
	"strconv"

	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type CampaignHandler struct {
	svc service.CampaignService
}

func NewCampaignHandler(svc service.CampaignService) *CampaignHandler {
	return &CampaignHandler{svc: svc}
}

func (h *CampaignHandler) CreateCampaign(w http.ResponseWriter, r *http.Request) {
	var req types.CreateCampaignRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	req.UserID = userID

	if err := h.svc.CreateCampaign(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Campaign created successfully", nil)
}

func (h *CampaignHandler) GetCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	campaign, err := h.svc.GetCampaign(id, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign retrieved successfully", campaign)
}

func (h *CampaignHandler) ListCampaigns(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	filter := types.CampaignFilter{
		UserID: userID,
		Search: r.URL.Query().Get("search"),
	}
	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		filter.Page, _ = strconv.Atoi(pageStr)
	}
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		filter.Limit, _ = strconv.Atoi(limitStr)
	}

	campaigns, err := h.svc.ListCampaigns(&filter)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaigns retrieved successfully", campaigns)
}

func (h *CampaignHandler) UpdateCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	var req types.UpdateCampaignRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.UpdateCampaign(id, userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign updated successfully", nil)
}

func (h *CampaignHandler) DeleteCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.DeleteCampaign(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign deleted successfully", nil)
}

func (h *CampaignHandler) DuplicateCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.DuplicateCampaign(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign duplicated successfully", nil)
}

func (h *CampaignHandler) ScheduleCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	var req types.ScheduleCampaignRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.ScheduleCampaign(id, userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign scheduled successfully", nil)
}

func (h *CampaignHandler) SendCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.SendCampaign(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign sending started", nil)
}

func (h *CampaignHandler) PauseCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.PauseCampaign(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign paused", nil)
}

func (h *CampaignHandler) ResumeCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.ResumeCampaign(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign resumed", nil)
}

func (h *CampaignHandler) CancelCampaign(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.CancelCampaign(id, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Campaign cancelled", nil)
}

func (h *CampaignHandler) GetCampaignRecipients(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	page := 1
	limit := 50

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil {
			page = p
		}
	}
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	recipients, err := h.svc.GetCampaignRecipients(id, userID, page, limit)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Recipients retrieved successfully", recipients)
}

func (h *CampaignHandler) GetCampaignStats(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	stats, err := h.svc.GetCampaignStats(id, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Stats retrieved successfully", stats)
}

func (h *CampaignHandler) TrackOpen(w http.ResponseWriter, r *http.Request) {
	trackingID := r.PathValue("id")
	if trackingID == "" {
		http.Error(w, "Missing tracking ID", http.StatusBadRequest)
		return
	}

	// Async track to not block response
	go func() {
		h.svc.TrackEvent(trackingID, "opened", r.UserAgent(), r.RemoteAddr, "")
	}()

	// Serve 1x1 transparent GIF
	pixel := []byte{
		0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
		0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
		0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3b,
	}
	w.Header().Set("Content-Type", "image/gif")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Write(pixel)
}

func (h *CampaignHandler) ListEvents(w http.ResponseWriter, r *http.Request) {
	// campaignID := r.PathValue("id")
	// call svc...
	utils.SuccessResponse(w, http.StatusOK, "Events listed", []string{})
}

func (h *CampaignHandler) RetryFailedRecipient(w http.ResponseWriter, r *http.Request) {
	// call svc...
	utils.SuccessResponse(w, http.StatusOK, "Retry initiated", nil)
}

func (h *CampaignHandler) GetFailedRecipients(w http.ResponseWriter, r *http.Request) {
	utils.SuccessResponse(w, http.StatusOK, "Failed recipients listed", []string{})
}

func (h *CampaignHandler) TrackClick(w http.ResponseWriter, r *http.Request) {
	trackingID := r.PathValue("id")
	targetURL := r.URL.Query().Get("url")

	if trackingID == "" || targetURL == "" {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Async track
	go func() {
		h.svc.TrackEvent(trackingID, "clicked", r.UserAgent(), r.RemoteAddr, targetURL)
	}()

	http.Redirect(w, r, targetURL, http.StatusFound)
}

func (h *CampaignHandler) WebhookBounce(w http.ResponseWriter, r *http.Request) {
	var req types.WebhookBounceRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.svc.HandleWebhookBounce(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Bounce recorded", nil)
}

func (h *CampaignHandler) WebhookComplaint(w http.ResponseWriter, r *http.Request) {
	var req types.WebhookComplaintRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.svc.HandleWebhookComplaint(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Complaint recorded", nil)
}

func (h *CampaignHandler) WebhookDelivery(w http.ResponseWriter, r *http.Request) {
	var req types.WebhookDeliveryRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.svc.HandleWebhookDelivery(&req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Delivery recorded", nil)
}
