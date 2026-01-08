export interface Template {
    id: number;
    user_id: number;
    name: string;
    subject: string;
    type: 'mjml' | 'html';
    html_content: string;
    mjml_content?: string;
    text_content?: string;
    thumbnail_url?: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateTemplateRequest {
    name: string;
    subject: string;
    type: 'mjml' | 'html';
    html_content: string;
    mjml_content?: string;
    text_content?: string;
    is_default?: boolean;
}

export interface UpdateTemplateRequest {
    name?: string;
    subject?: string;
    type?: 'mjml' | 'html';
    html_content?: string;
    mjml_content?: string;
    text_content?: string;
    is_default?: boolean;
}

export interface PreviewTemplateRequest {
    html_content: string;
    variables?: Record<string, any>;
}

export interface TemplateListResponse {
    data: Template[];
    page: number;
    limit: number;
    total: number;
}
