

const API_PATH = {
    AUTH: {
        REGISTER: '/api/v1/auth/register',
        LOGIN: '/api/v1/auth/login',
        LOGOUT: '/api/v1/auth/logout',
        REFRESH_TOKEN: '/api/v1/auth/refresh',
        VERIFY_EMAIL: '/api/v1/auth/verify-email',
        FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
        GET_PROFILE: '/api/v1/auth/profile',
        UPDATE_PROFILE: '/api/v1/auth/profile',
        GET_CURRENT_USER: '/api/v1/users/me',
        UPDATE_CURRENT_USER: '/api/v1/users/me',
        DELETE_CURRENT_USER: '/api/v1/users/me',
        CHANGE_PASSWORD: '/api/v1/users/me/password',
    },

    USER_SETTINGS: {
        GET_SETTINGS: '/api/v1/settings',
        UPDATE_SETTINGS: '/api/v1/settings',
        UPDATE_SMTP: '/api/v1/settings/smtp',
        TEST_SMTP: '/api/v1/settings/smtp/test',
        GET_LIMITS: '/api/v1/settings/limits',
        UPDATE_LIMITS: '/api/v1/settings/limits',
        UPDATE_FILES: '/api/v1/settings/files',
        UPDATE_PRIVACY: '/api/v1/settings/privacy',
    },

    CONTACTS: {
        LIST_CONTACTS: '/api/v1/contacts',
        CREATE_CONTACT: '/api/v1/contacts',
        GET_CONTACT: '/api/v1/contacts/:id',
        UPDATE_CONTACT: '/api/v1/contacts/:id',
        DELETE_CONTACT: '/api/v1/contacts/:id',
        BULK_CREATE_CONTACTS: '/api/v1/contacts/bulk',
        BULK_UPDATE_CONTACTS: '/api/v1/contacts/bulk/update',
        BULK_DELETE_CONTACTS: '/api/v1/contacts/bulk/delete',
        IMPORT_CONTACTS_CSV: '/api/v1/contacts/import/csv',
        EXPORT_CONTACTS_CSV: '/api/v1/contacts/export/csv',
        GET_CONTACT_BY_EMAIL: '/api/v1/contacts/email/:email',
        GET_CONTACT_ACTIVITY: '/api/v1/contacts/:id/activity',
        SUBSCRIBE_CONTACT: '/api/v1/contacts/:id/subscribe',
        UNSUBSCRIBE_CONTACT: '/api/v1/contacts/:id/unsubscribe',
    },

    TAGS: {
        LIST_TAGS: '/api/v1/tags',
        CREATE_TAG: '/api/v1/tags',
        GET_TAG: '/api/v1/tags/:id',
        UPDATE_TAG: '/api/v1/tags/:id',
        DELETE_TAG: '/api/v1/tags/:id',
        GET_TAG_CONTACTS: '/api/v1/tags/:id/contacts',
        ADD_CONTACTS_TO_TAG: '/api/v1/tags/:id/contacts',
        REMOVE_CONTACTS_FROM_TAG: '/api/v1/tags/:id/contacts/remove',
    },

    CONTACT_TAGS: {
        ADD_TAG_TO_CONTACT: '/api/v1/contacts/:id/tags',
        REMOVE_TAG_FROM_CONTACT: '/api/v1/contacts/:id/tags/:tagId',
        GET_CONTACT_TAGS: '/api/v1/contacts/:id/tags',
    },

    TEMPLATES: {
        LIST_TEMPLATES: '/api/v1/templates',
        CREATE_TEMPLATE: '/api/v1/templates',
        GET_TEMPLATE: '/api/v1/templates/:id',
        UPDATE_TEMPLATE: '/api/v1/templates/:id',
        DELETE_TEMPLATE: '/api/v1/templates/:id',
        DUPLICATE_TEMPLATE: '/api/v1/templates/:id/duplicate',
        SET_DEFAULT_TEMPLATE: '/api/v1/templates/:id/set-default',
        PREVIEW_TEMPLATE: '/api/v1/templates/:id/preview',
        UPLOAD_TEMPLATE_IMAGE: '/api/v1/templates/upload/image',
    },

    CAMPAIGNS: {
        LIST_CAMPAIGNS: '/api/v1/campaigns',
        CREATE_CAMPAIGN: '/api/v1/campaigns',
        GET_CAMPAIGN: '/api/v1/campaigns/:id',
        UPDATE_CAMPAIGN: '/api/v1/campaigns/:id',
        DELETE_CAMPAIGN: '/api/v1/campaigns/:id',
        DUPLICATE_CAMPAIGN: '/api/v1/campaigns/:id/duplicate',
        SCHEDULE_CAMPAIGN: '/api/v1/campaigns/:id/schedule',
        SEND_CAMPAIGN: '/api/v1/campaigns/:id/send',
        PAUSE_CAMPAIGN: '/api/v1/campaigns/:id/pause',
        RESUME_CAMPAIGN: '/api/v1/campaigns/:id/resume',
        CANCEL_CAMPAIGN: '/api/v1/campaigns/:id/cancel',
        GET_CAMPAIGN_STATS: '/api/v1/campaigns/:id/stats',
        GET_CAMPAIGN_RECIPIENTS: '/api/v1/campaigns/:id/recipients',
        SEND_TEST_EMAIL: '/api/v1/campaigns/:id/test',
        PREVIEW_CAMPAIGN: '/api/v1/campaigns/:id/preview',
    },

    CAMPAIGN_TAGS: {
        ADD_TAG_TO_CAMPAIGN: '/api/v1/campaigns/:id/tags',
        REMOVE_TAG_FROM_CAMPAIGN: '/api/v1/campaigns/:id/tags/:tagId',
        GET_CAMPAIGN_TAGS: '/api/v1/campaigns/:id/tags',
        UPDATE_CAMPAIGN_TAGS: '/api/v1/campaigns/:id/tags',
    },

    CAMPAIGN_RECIPIENTS: {
        LIST_RECIPIENTS: '/api/v1/campaigns/:campaignId/recipients',
        GET_RECIPIENT: '/api/v1/campaigns/:campaignId/recipients/:id',
        GET_RECIPIENT_EVENTS: '/api/v1/campaigns/:campaignId/recipients/:id/events',
        RETRY_FAILED_RECIPIENT: '/api/v1/campaigns/:campaignId/recipients/:id/retry',
        BULK_RETRY_FAILED: '/api/v1/campaigns/:campaignId/recipients/retry-failed',
        GET_FAILED_RECIPIENTS: '/api/v1/campaigns/:campaignId/recipients/failed',
        GET_DELIVERED_RECIPIENTS: '/api/v1/campaigns/:campaignId/recipients/delivered',
        GET_BOUNCED_RECIPIENTS: '/api/v1/campaigns/:campaignId/recipients/bounced',
        GET_OPENED_RECIPIENTS: '/api/v1/campaigns/:campaignId/recipients/opened',
        GET_CLICKED_RECIPIENTS: '/api/v1/campaigns/:campaignId/recipients/clicked',
    },

    EMAIL_EVENTS: {
        LIST_EVENTS: '/api/v1/campaigns/:campaignId/events',
        GET_EVENT: '/api/v1/campaigns/:campaignId/events/:id',
        TRACK_OPEN: '/api/v1/track/open/:trackingId',
        TRACK_CLICK: '/api/v1/track/click/:trackingId',
        WEBHOOK_BOUNCE: '/api/v1/webhooks/bounce',
        WEBHOOK_COMPLAINT: '/api/v1/webhooks/complaint',
        WEBHOOK_DELIVERY: '/api/v1/webhooks/delivery',
    },

    RETRY_QUEUE: {
        LIST_RETRY_QUEUE: '/api/v1/retry-queue',
        GET_RETRY_ITEM: '/api/v1/retry-queue/:id',
        PROCESS_RETRY_QUEUE: '/api/v1/retry-queue/process',
        CLEAR_RETRY_QUEUE: '/api/v1/retry-queue/clear',
    },

    ANALYTICS: {
        GET_DASHBOARD_STATS: '/api/v1/analytics/dashboard',
        GET_CAMPAIGN_ANALYTICS: '/api/v1/analytics/campaigns/:id',
        GET_CAMPAIGN_TIMELINE: '/api/v1/analytics/campaigns/:id/timeline',
        GET_CAMPAIGN_COMPARISON: '/api/v1/analytics/campaigns/compare',
        GET_CONTACT_ENGAGEMENT: '/api/v1/analytics/contacts/:id/engagement',
        GET_TAG_PERFORMANCE: '/api/v1/analytics/tags/:id/performance',
        GET_EMAIL_PERFORMANCE: '/api/v1/analytics/email-performance',
        GET_SEND_VOLUME: '/api/v1/analytics/send-volume',
        GET_ENGAGEMENT_TRENDS: '/api/v1/analytics/engagement-trends',
        EXPORT_ANALYTICS: '/api/v1/analytics/export',
    },

    REPORTS: {
        GENERATE_CAMPAIGN_REPORT: '/api/v1/reports/campaign/:id',
        GENERATE_MONTHLY_REPORT: '/api/v1/reports/monthly',
        GENERATE_YEARLY_REPORT: '/api/v1/reports/yearly',
        LIST_REPORTS: '/api/v1/reports',
        DOWNLOAD_REPORT: '/api/v1/reports/:id/download',
    },

    DASHBOARD: {
        GET_OVERVIEW: '/api/v1/dashboard/overview',
        GET_RECENT_CAMPAIGNS: '/api/v1/dashboard/recent-campaigns',
        GET_RECENT_ACTIVITY: '/api/v1/dashboard/activity',
        GET_QUICK_STATS: '/api/v1/dashboard/quick-stats',
    },

    SEARCH: {
        SEARCH_CONTACTS: '/api/v1/search/contacts',
        SEARCH_CAMPAIGNS: '/api/v1/search/campaigns',
        SEARCH_TEMPLATES: '/api/v1/search/templates',
        GLOBAL_SEARCH: '/api/v1/search',
    },

    PUBLIC: {
        UNSUBSCRIBE: '/api/v1/public/unsubscribe/:token',
        RESUBSCRIBE: '/api/v1/public/resubscribe/:token',
        UPDATE_PREFERENCES: '/api/v1/public/preferences/:token',
        TRACK_PIXEL: '/api/v1/public/pixel/:trackingId.png',
    },

    SUBSCRIPTIONS: {
        GET_SUBSCRIPTION: '/api/v1/subscriptions',
        CREATE_SUBSCRIPTION: '/api/v1/subscriptions',
    },
} as const;



export default API_PATH
