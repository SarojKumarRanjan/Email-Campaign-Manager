"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SMTPSettingsProps {
    initialSettings: any;
    onSave: (settings: any) => void;
    onTest: (email: string) => void;
    testing?: boolean;
}

const PROVIDER_TEMPLATES = [
    { name: "Gmail", host: "smtp.gmail.com", port: 587 },
    { name: "Amazon SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587 },
    { name: "SendGrid", host: "smtp.sendgrid.net", port: 587 },
    { name: "Mailgun", host: "smtp.mailgun.org", port: 587 },
    { name: "Custom", host: "", port: "" },
];

export default function SMTPSettings({ initialSettings, onSave, onTest, testing }: SMTPSettingsProps) {
    const [smtpSettings, setSmtpSettings] = useState({
        host: initialSettings?.smtp_host || "",
        port: initialSettings?.smtp_port || "",
        username: initialSettings?.smtp_username || "",
        password: "",
        maxConnections: initialSettings?.smtp_max_connections || 5,
        retries: initialSettings?.smtp_retries || 3,
    });
    const [testEmail, setTestEmail] = useState("");

    useEffect(() => {
        if (initialSettings) {
            setSmtpSettings({
                host: initialSettings.smtp_host || "",
                port: initialSettings.smtp_port || "",
                username: initialSettings.smtp_username || "",
                password: "",
                maxConnections: initialSettings.smtp_max_connections || 5,
                retries: initialSettings.smtp_retries || 3,
            });
        }
    }, [initialSettings]);

    const handleTemplateChange = (templateName: string) => {
        const template = PROVIDER_TEMPLATES.find(t => t.name === templateName);
        if (template && template.name !== "Custom") {
            setSmtpSettings({
                ...smtpSettings,
                host: template.host,
                port: template.port,
            });
        }
    };

    const handleSave = () => {
        onSave({
            host: smtpSettings.host,
            port: parseInt(String(smtpSettings.port), 10),
            username: smtpSettings.username,
            password: smtpSettings.password,
            max_connections: parseInt(String(smtpSettings.maxConnections), 10),
            retries: parseInt(String(smtpSettings.retries), 10),
        });
    };

    const handleTest = () => {
        if (!testEmail) {
            toast.error("Please enter an email address for testing");
            return;
        }
        onTest(testEmail);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
                <CardDescription>Configure your email provider settings for sending campaigns.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="template">Provider Template</Label>
                    <Select onValueChange={handleTemplateChange}>
                        <SelectTrigger id="template">
                            <SelectValue placeholder="Quick fill from template" />
                        </SelectTrigger>
                        <SelectContent>
                            {PROVIDER_TEMPLATES.map(t => (
                                <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="host">Host</Label>
                        <Input
                            id="host"
                            value={smtpSettings.host}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                            placeholder="smtp.example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input
                            id="port"
                            type="number"
                            value={smtpSettings.port}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                            placeholder="587"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={smtpSettings.username}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                            autoComplete="off"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={smtpSettings.password}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                            placeholder={initialSettings?.smtp_password_encrypted ? "••••••••" : ""}
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                        <Label htmlFor="maxConnections">Max Connections</Label>
                        <Input
                            id="maxConnections"
                            type="number"
                            value={smtpSettings.maxConnections}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, maxConnections: e.target.value })}
                            min={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="retries">Retries</Label>
                        <Input
                            id="retries"
                            type="number"
                            value={smtpSettings.retries}
                            onChange={(e) => setSmtpSettings({ ...smtpSettings, retries: e.target.value })}
                            min={0}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                        <Input
                            placeholder="Test email address"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="w-64"
                        />
                        <Button variant="outline" onClick={handleTest} disabled={testing}>
                            {testing ? "Sending..." : "Test Connection"}
                        </Button>
                    </div>
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
