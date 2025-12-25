export enum CampaignStatus {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    SENDING = 'sending',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface Campaign {
    id: number;
    user_id: number;
    template_id?: number;
    name: string;
    subject: string;
    from_name: string;
    from_email: string;
    reply_to_email: string;
    status: CampaignStatus;
    scheduled_at?: string;
    started_at?: string;
    completed_at?: string;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    failed_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    unsubscribed_count: number;
    created_at: string;
    updated_at: string;
    tags?: any[]; // We can refine this if we import Tag type
    template?: any; // We can refine this if we import Template type
}

export interface CampaignStats {
    campaign_id: number;
    total_recipients: number;
    sent_count: number;
    delivered_count: number;
    failed_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    unsubscribed_count: number;
    unique_opens: number;
    unique_clicks: number;
    open_rate: number;
    click_rate: number;
    bounce_rate: number;
    delivery_rate: number;
    unsubscribe_rate: number;
    updated_at: string;
}
