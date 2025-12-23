package handler

import (
	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
	"net/http"
	"strconv"
)

type TagHandler struct {
	svc service.TagService
}

func NewTagHandler(svc service.TagService) *TagHandler {
	return &TagHandler{svc: svc}
}

func (h *TagHandler) ListTags(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tags, err := h.svc.ListTags(userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Tags retrieved successfully", tags)
}

func (h *TagHandler) CreateTag(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req types.CreateTagRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	tag, err := h.svc.CreateTag(userID, &req)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Tag created successfully", tag)
}

func (h *TagHandler) UpdateTag(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tagIDStr := r.PathValue("id")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	var req types.UpdateTagRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.UpdateTag(userID, tagID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Tag updated successfully", nil)
}

func (h *TagHandler) DeleteTag(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tagIDStr := r.PathValue("id")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	if err := h.svc.DeleteTag(userID, tagID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Tag deleted successfully", nil)
}

func (h *TagHandler) GetTagContacts(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tagIDStr := r.PathValue("id")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	contacts, err := h.svc.GetTagContacts(userID, tagID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Tag contacts retrieved successfully", contacts)
}

func (h *TagHandler) AddContactToTag(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tagIDStr := r.PathValue("id")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	var req struct {
		ContactID uint64 `json:"contact_id"`
	}
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.AddContactToTag(userID, tagID, req.ContactID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contact added to tag successfully", nil)
}

func (h *TagHandler) RemoveContactsFromTag(w http.ResponseWriter, r *http.Request) {
	// Note: The route might be .../tags/:id/contacts/remove and expect body with contact_id
	// OR just DELETE .../tags/:id/contacts/:contactId
	// routes.json suggests: "remove_contacts_from_tag": "/api/v1/tags/:id/contacts/remove"
	// I will stick to body for consistency with Add, or check strict REST.
	// Let's expect body with contact_id.

	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	tagIDStr := r.PathValue("id")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	var req struct {
		ContactID uint64 `json:"contact_id"`
	}
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.RemoveContactFromTag(userID, tagID, req.ContactID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contact removed from tag successfully", nil)
}

func (h *TagHandler) GetContactTags(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	contactIDStr := r.PathValue("id") // Ensure this route is registered correctly under /contacts/:id/tags
	contactID, err := strconv.ParseUint(contactIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid contact ID")
		return
	}

	tags, err := h.svc.GetContactTags(userID, contactID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contact tags retrieved successfully", tags)
}

func (h *TagHandler) AddTagToCampaign(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	campaignIDStr := r.PathValue("id")
	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	var req struct {
		TagID uint64 `json:"tag_id"`
	}
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.svc.AddTagToCampaign(userID, campaignID, req.TagID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Tag added to campaign", nil)
}

func (h *TagHandler) RemoveTagFromCampaign(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	campaignIDStr := r.PathValue("id")
	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	tagIDStr := r.PathValue("tagId")
	tagID, err := strconv.ParseUint(tagIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	if err := h.svc.RemoveTagFromCampaign(userID, campaignID, tagID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Tag removed from campaign", nil)
}

func (h *TagHandler) GetCampaignTags(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	campaignIDStr := r.PathValue("id")
	campaignID, err := strconv.ParseUint(campaignIDStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid campaign ID")
		return
	}

	tags, err := h.svc.GetCampaignTags(userID, campaignID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Campaign tags retrieved", tags)
}
