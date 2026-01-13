package service

import (
	"email_campaign/internal/types"
)

func (s *contactService) GetMasterValues(userID uint64, options []string) (map[string]interface{}, error) {
	result := make(map[string]interface{})

	for _, option := range options {
		switch option {
		case "CAMPAIGNS":
			// Fetch minimal campaign data
			// We might need a specific method in repository for drop-down purposes to avoid fetching everything
			// For now, using ListCampaigns with minimal fields
			filter := &types.CampaignFilter{
				UserID: userID,
				Limit:  1000, // Limit to reasonable amount
				SortBy: "created_at",
			}
			campaigns, _, err := s.campaignRepo.ListCampaigns(filter)
			if err != nil {
				return nil, err
			}
			// Map to simple structure
			var campaignList []map[string]interface{}
			for _, c := range campaigns {
				campaignList = append(campaignList, map[string]interface{}{
					"id":   c.ID,
					"name": c.Name,
				})
			}
			result["campaigns"] = campaignList

		case "TAGS":
			// Fetch tags
			tags, _, err := s.tagRepo.ListTags(userID, types.Filter{Limit: 1000})
			if err != nil {
				return nil, err
			}
			result["tags"] = tags
		}
	}
	return result, nil
}
