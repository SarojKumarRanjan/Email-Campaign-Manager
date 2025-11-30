package types

import (
	"encoding/json"
	"time"
)

type SubscriptionPlan string
type SubscriptionStatus string
type BillingCycle string

const (
	PlanFree         SubscriptionPlan = "free"
	PlanStarter      SubscriptionPlan = "starter"
	PlanProfessional SubscriptionPlan = "professional"
	PlanEnterprise   SubscriptionPlan = "enterprise"

	StatusActive    SubscriptionStatus = "active"
	StatusInactive  SubscriptionStatus = "inactive"
	StatusCancelled SubscriptionStatus = "cancelled"
	StatusSuspended SubscriptionStatus = "suspended"
	StatusPending   SubscriptionStatus = "pending"

	CycleMonthly BillingCycle = "monthly"
	CycleYearly  BillingCycle = "yearly"
)

type Subscription struct {
	ID                     uint64             `json:"id"`
	UserID                 uint64             `json:"user_id"`
	PlanType               SubscriptionPlan   `json:"plan_type"`
	Status                 SubscriptionStatus `json:"status"`
	BillingCycle           BillingCycle       `json:"billing_cycle"`
	Amount                 float64            `json:"amount"`
	Currency               string             `json:"currency"`
	RenewalDate            *time.Time         `json:"renewal_date"`
	CancelDate             *time.Time         `json:"cancel_date"`
	RazorpaySubscriptionID string             `json:"razorpay_subscription_id"`
	RazorpayCustomerID     string             `json:"razorpay_customer_id"`
	RazorpayPlanID         string             `json:"razorpay_plan_id"`
	Features               json.RawMessage    `json:"features"`
	MaxContacts            int                `json:"max_contacts"`
	MaxCampaigns           int                `json:"max_campaigns"`
	EmailLimitPerMonth     int                `json:"email_limit_per_month"`
	IsTrial                bool               `json:"is_trial"`
	TrialEndDate           *time.Time         `json:"trial_end_date"`
	AutoRenew              bool               `json:"auto_renew"`
	CreatedAt              time.Time          `json:"created_at"`
	UpdatedAt              time.Time          `json:"updated_at"`
}

type CreateSubscriptionRequest struct {
	PlanType     SubscriptionPlan `json:"plan_type" binding:"required"`
	BillingCycle BillingCycle     `json:"billing_cycle" binding:"required"`
}

type UpdateSubscriptionRequest struct {
	AutoRenew bool `json:"auto_renew"`
}
