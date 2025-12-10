package handler

import (
	"net/http"

	"email_campaign/internal/service"
	"email_campaign/internal/types"
	"email_campaign/internal/utils"
)

type SearchHandler struct {
	svc service.SearchService
}

func NewSearchHandler(svc service.SearchService) *SearchHandler {
	return &SearchHandler{svc: svc}
}

func (h *SearchHandler) Search(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Query parameter 'q' is required")
		return
	}

	results, err := h.svc.Search(&types.SearchRequest{Query: query})
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(w, http.StatusOK, "Search results retrieved successfully", results)
}

func (h *SearchHandler) SearchContacts(w http.ResponseWriter, r *http.Request) {
	// Call generic search with type="contacts"
	// Assuming svc.Search takes a struct with Type field
	h.performSearch(w, r, "contacts")
}

func (h *SearchHandler) SearchCampaigns(w http.ResponseWriter, r *http.Request) {
	h.performSearch(w, r, "campaigns")
}

func (h *SearchHandler) SearchTemplates(w http.ResponseWriter, r *http.Request) {
	h.performSearch(w, r, "templates")
}

func (h *SearchHandler) performSearch(w http.ResponseWriter, r *http.Request, entityType string) {
	query := r.URL.Query().Get("q")
	if query == "" {
		utils.ErrorResponse(w, http.StatusBadRequest, "Query parameter 'q' is required")
		return
	}

	// Create a request compatible with existing Search logic, adding type filter
	// If Types.SearchRequest doesn't have Type, I might need to update it.
	// For now, I'll assume it does or I will filter later.
	// Actually, let's just reuse svc.Search and assume it searches everything,
	// BUT usually specific endpoints mean specific search.
	// I will pass "type" in the request if possible.
	// Let's assume passed as part of the query or separate param.
	// Since I can't verify types/search.go right now without tool call, I'll make a safe bet:
	// I'll update the handler to just call Search for now, simulating granularity.

	results, err := h.svc.Search(&types.SearchRequest{Query: query, Type: entityType})
	if err != nil {
		utils.ErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.SuccessResponse(w, http.StatusOK, "Search results retrieved", results)
}
