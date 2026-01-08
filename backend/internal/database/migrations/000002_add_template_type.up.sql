ALTER TABLE email_templates 
ADD COLUMN type ENUM('mjml', 'html') NOT NULL DEFAULT 'mjml' AFTER subject,
ADD COLUMN mjml_content LONGTEXT AFTER type;
