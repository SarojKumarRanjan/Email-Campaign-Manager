package handler

import (
	"net/http"

	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type ContactHandler struct {
	svc service.ContactService
}

func NewContactHandler(svc service.ContactService) *ContactHandler {
	return &ContactHandler{svc: svc}
}

func (h *ContactHandler) CreateContact(w http.ResponseWriter, r *http.Request) {
	var req types.CreateContactRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorJSON(w, err, http.StatusBadRequest)
		return
	}

	if err := h.svc.CreateContact(&req); err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusCreated, nil)
}

func (h *ContactHandler) GetContact(w http.ResponseWriter, r *http.Request) {
	// TODO: Get ID from URL params
	id := uint64(1) // Placeholder

	contact, err := h.svc.GetContact(id)
	if err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, contact)
}

func (h *ContactHandler) ListContacts(w http.ResponseWriter, r *http.Request) {
	var filter types.ContactFilter
	// TODO: Parse query params into filter

	contacts, err := h.svc.ListContacts(&filter)
	if err != nil {
		utils.ErrorJSON(w, err, http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusOK, contacts)
}
