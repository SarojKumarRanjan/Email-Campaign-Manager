package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"

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
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	req.UserID = userID

	if err := h.svc.CreateContact(&req); err != nil {
		if err.Error() == "contact already exists" {
			utils.ErrorResponse(w, http.StatusConflict, err.Error())
			return
		}
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Contact created successfully", nil)
}

func (h *ContactHandler) GetContact(w http.ResponseWriter, r *http.Request) {
	var contactId uint64
	var userId uint64
	id := r.PathValue("id")
	if id == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Contact ID is required")
		return
	}
	contactId, _ = strconv.ParseUint(id, 10, 64)

	userId, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	contact, err := h.svc.GetContact(contactId, userId)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contact retrieved successfully", contact)
}

func parseIntDefault(val string, def int) int {
	if v, err := strconv.Atoi(val); err == nil {
		return v
	}
	return def
}

func defaultString(val, def string) string {
	if val == "" {
		return def
	}
	return val
}

func (h *ContactHandler) ListContacts(w http.ResponseWriter, r *http.Request) {
	var filter types.ContactFilter
	query := r.URL.Query()

	filter.Page = parseIntDefault(query.Get("page"), 1)
	filter.Limit = parseIntDefault(query.Get("limit"), 10)
	filter.SortBy = defaultString(query.Get("sort_by"), "created_at")
	filter.SortOrder = defaultString(query.Get("sort_order"), "desc")
	filter.Search = query.Get("search")
	filter.JoinOperator = defaultString(query.Get("join_operator"), "and")

	filtersJSON := query.Get("filters")

	if filtersJSON != "" {
		if err := json.Unmarshal([]byte(filtersJSON), &filter.Filters); err != nil {
			utils.ErrorResponse(w, http.StatusBadRequest, "Invalid filters format")
			return
		}
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	filter.UserID = userID

	contacts, total, err := h.svc.ListContacts(r.Context(), &filter)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]interface{}{
		"data":  contacts,
		"total": total,
		"page":  filter.Page,
		"limit": filter.Limit,
	}

	utils.SuccessResponse(w, http.StatusOK, "Contacts retrieved successfully", response)
}

func (h *ContactHandler) UpdateContact(w http.ResponseWriter, r *http.Request) {
	// 1.22 routing or mux specific? user uses standard mux in server.go but logic seemed manual parsing
	// Wait, server.go uses `mux.Handle("GET /api/v1/contacts/{id}", ...)` which is Go 1.22 pattern
	// So `r.PathValue("id")` should work if Go version is >= 1.22.
	// However, previous code `GetContact` used `r.URL.Query().Get("id")`.
	// The routing in server.go: `mux.Handle("GET /api/v1/contacts/{id}", ...)`
	// implies we should use path values. But `GetContact` implementation I saw used Query "id".
	// Let's stick to what I see in `GetContact` implementation if I can ...
	// Actually `GetContact` I saw earlier:
	// id := r.URL.Query().Get("id")
	// But the route is `/api/v1/contacts/{id}`.
	// If the route is `/contacts/{id}`, then `Query().Get("id")` would be empty unless ?id=... is passed.
	// I will assume `r.PathValue` is the correct way for Go 1.22+ given the route syntax.
	// Or I'll fallback to manual parsing if needed.

	idStr := r.PathValue("id")
	if idStr == "" {
		// Fallback for older Go or compatibility
		// Try parsing from path manually if `PathValue` not available (would result in compile error if < 1.22)
		// Assuming Go 1.22 for now based on `{id}` syntax.
		// If `GetContact` used Query, maybe the route definition in `server.go` was actually `.../contacts`?
		// "GET /api/v1/contacts/{id}" is definitely Go 1.22 syntax.
		// I will use r.PathValue("id") which is correct for that syntax.
	}

	contactID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid contact ID")
		return
	}

	var req types.UpdateContactRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.UpdateContact(contactID, userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contact updated successfully", nil)
}

func (h *ContactHandler) DeleteContact(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	contactID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid contact ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.DeleteContact(contactID, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contact deleted successfully", nil)
}

func (h *ContactHandler) GetContactByEmail(w http.ResponseWriter, r *http.Request) {
	email := r.PathValue("email")
	if email == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Email is required")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	contact, err := h.svc.GetContactByEmail(email, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusNotFound, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contact retrieved successfully", contact)
}

func (h *ContactHandler) GetContactActivity(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	contactID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid contact ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	activities, err := h.svc.GetContactActivity(contactID, userID)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Activity retrieved successfully", activities)
}

func (h *ContactHandler) SubscribeContact(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	contactID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid contact ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.SubscribeContact(contactID, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Contact subscribed successfully", nil)
}

func (h *ContactHandler) UnsubscribeContact(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	contactID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid contact ID")
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.UnsubscribeContact(contactID, userID); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Contact unsubscribed successfully", nil)
}

func (h *ContactHandler) BulkCreateContacts(w http.ResponseWriter, r *http.Request) {
	var req types.BulkCreateContactsRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.BulkCreateContacts(userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusCreated, "Contacts created successfully", nil)
}

func (h *ContactHandler) BulkUpdateContacts(w http.ResponseWriter, r *http.Request) {
	var req types.BulkUpdateContactsRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.BulkUpdateContacts(userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contacts updated successfully", nil)
}

func (h *ContactHandler) BulkDeleteContacts(w http.ResponseWriter, r *http.Request) {
	var req types.BulkDeleteContactsRequest
	if err := utils.ReadJSON(w, r, &req); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.BulkDeleteContacts(userID, &req); err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contacts deleted successfully", nil)
}

func (h *ContactHandler) ImportContacts(w http.ResponseWriter, r *http.Request) {
	// 10MB limit
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "File too large")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, "Invalid file")
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, "Failed to read file")
		return
	}

	fileType := "csv"
	// Basic extension check
	if strings.HasSuffix(header.Filename, ".xlsx") {
		fileType = "excel"
	}

	var req types.ImportContactsRequest
	// User can provide field mapping as JSON string in form data
	mappingStr := r.FormValue("field_mapping")
	if mappingStr != "" {
		_ = json.Unmarshal([]byte(mappingStr), &req.FieldMapping)
	}
	req.FileData = fileBytes

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	if err := h.svc.ImportContacts(userID, &req, fileType); err != nil {
		utils.ErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Contacts imported successfully", nil)
}

func (h *ContactHandler) ExportContacts(w http.ResponseWriter, r *http.Request) {
	format := r.URL.Query().Get("format")
	if format == "" {
		format = "csv"
	}

	userID, ok := r.Context().Value(types.UserIDKey).(uint64)
	if !ok {
		utils.ErrorResponse(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Reuse list logic for filtering, modify request to assume empty filter means all
	var filter types.ContactFilter
	// TODO: Populate filter from query params like ListCalls if we want filtered export
	// For now, simpler approach:
	filter.UserID = userID

	data, err := h.svc.ExportContacts(userID, &filter, format)
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", "attachment; filename=contacts.csv")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
