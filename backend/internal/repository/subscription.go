package repository

import (
	"database/sql"
	"email_campaign/internal/types"
)

type SubscriptionRepository interface {
	GetSubscription(userID uint64) (*types.Subscription, error)
	CreateSubscription(sub *types.Subscription) error
	UpdateSubscription(sub *types.Subscription) error
}

type subscriptionRepository struct {
	db *sql.DB
}

func NewSubscriptionRepository(db *sql.DB) SubscriptionRepository {
	return &subscriptionRepository{db: db}
}

func (r *subscriptionRepository) GetSubscription(userID uint64) (*types.Subscription, error) {
	var sub types.Subscription
	query := `SELECT id, user_id, plan_type, status, billing_cycle, amount, currency, 
			  renewal_date, cancel_date, razorpay_subscription_id, razorpay_customer_id, razorpay_plan_id,
			  features, max_contacts, max_campaigns, email_limit_per_month, is_trial, trial_end_date, auto_renew,
			  created_at, updated_at
			  FROM subscriptions WHERE user_id = ?`

	err := r.db.QueryRow(query, userID).Scan(
		&sub.ID, &sub.UserID, &sub.PlanType, &sub.Status, &sub.BillingCycle, &sub.Amount, &sub.Currency,
		&sub.RenewalDate, &sub.CancelDate, &sub.RazorpaySubscriptionID, &sub.RazorpayCustomerID, &sub.RazorpayPlanID,
		&sub.Features, &sub.MaxContacts, &sub.MaxCampaigns, &sub.EmailLimitPerMonth, &sub.IsTrial, &sub.TrialEndDate, &sub.AutoRenew,
		&sub.CreatedAt, &sub.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *subscriptionRepository) CreateSubscription(sub *types.Subscription) error {
	query := `INSERT INTO subscriptions (
		user_id, plan_type, status, billing_cycle, amount, currency, 
		renewal_date, razorpay_subscription_id, razorpay_customer_id, razorpay_plan_id,
		features, max_contacts, max_campaigns, email_limit_per_month, is_trial, trial_end_date, auto_renew
	) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	res, err := r.db.Exec(query,
		sub.UserID, sub.PlanType, sub.Status, sub.BillingCycle, sub.Amount, sub.Currency,
		sub.RenewalDate, sub.RazorpaySubscriptionID, sub.RazorpayCustomerID, sub.RazorpayPlanID,
		sub.Features, sub.MaxContacts, sub.MaxCampaigns, sub.EmailLimitPerMonth, sub.IsTrial, sub.TrialEndDate, sub.AutoRenew,
	)
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	sub.ID = uint64(id)
	return nil
}

func (r *subscriptionRepository) UpdateSubscription(sub *types.Subscription) error {
	query := `UPDATE subscriptions SET 
			  plan_type = ?, status = ?, billing_cycle = ?, amount = ?, currency = ?,
			  renewal_date = ?, cancel_date = ?, razorpay_subscription_id = ?, razorpay_customer_id = ?, razorpay_plan_id = ?,
			  features = ?, max_contacts = ?, max_campaigns = ?, email_limit_per_month = ?, is_trial = ?, trial_end_date = ?, auto_renew = ?
			  WHERE id = ?`

	_, err := r.db.Exec(query,
		sub.PlanType, sub.Status, sub.BillingCycle, sub.Amount, sub.Currency,
		sub.RenewalDate, sub.CancelDate, sub.RazorpaySubscriptionID, sub.RazorpayCustomerID, sub.RazorpayPlanID,
		sub.Features, sub.MaxContacts, sub.MaxCampaigns, sub.EmailLimitPerMonth, sub.IsTrial, sub.TrialEndDate, sub.AutoRenew,
		sub.ID,
	)
	return err
}
