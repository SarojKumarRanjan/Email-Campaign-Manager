"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";

interface GeneralSettingsProps {
    initialSettings: any;
    onSave: (settings: any) => void;
}

export default function GeneralSettings({ initialSettings, onSave }: GeneralSettingsProps) {
    const [formData, setFormData] = useState({
        default_from_email: initialSettings?.default_from_email || "",
        admin_notification_emails: initialSettings?.admin_notification_emails || "",
        concurrency: initialSettings?.concurrency || 1,
        message_rate: initialSettings?.message_rate || 0,
        batch_size: initialSettings?.batch_size || 100,
        max_error_threshold: initialSettings?.max_error_threshold || 10,
    });

    useEffect(() => {
        if (initialSettings) {
            setFormData({
                default_from_email: initialSettings.default_from_email || "",
                admin_notification_emails: initialSettings.admin_notification_emails || "",
                concurrency: initialSettings.concurrency || 1,
                message_rate: initialSettings.message_rate || 0,
                batch_size: initialSettings.batch_size || 100,
                max_error_threshold: initialSettings.max_error_threshold || 10,
            });
        }
    }, [initialSettings]);

    const handleSave = () => {
        onSave({
            ...formData,
            concurrency: parseInt(String(formData.concurrency), 10),
            message_rate: parseInt(String(formData.message_rate), 10),
            batch_size: parseInt(String(formData.batch_size), 10),
            max_error_threshold: parseInt(String(formData.max_error_threshold), 10),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure core application and campaign parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fromEmail">Default From Email</Label>
                        <Input
                            id="fromEmail"
                            value={formData.default_from_email}
                            onChange={(e) => setFormData({ ...formData, default_from_email: e.target.value })}
                            placeholder="noreply@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="adminEmails">Admin Notification Emails</Label>
                        <Input
                            id="adminEmails"
                            value={formData.admin_notification_emails}
                            onChange={(e) => setFormData({ ...formData, admin_notification_emails: e.target.value })}
                            placeholder="admin@example.com, dev@example.com"
                        />
                        <p className="text-xs text-muted-foreground">Comma separated</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                        <Label htmlFor="concurrency">Concurrency</Label>
                        <Input
                            id="concurrency"
                            type="number"
                            value={formData.concurrency}
                            onChange={(e) => setFormData({ ...formData, concurrency: e.target.value })}
                            min={1}
                        />
                        <p className="text-xs text-muted-foreground">Parallel workers for sending</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="messageRate">Message Rate (msgs/sec)</Label>
                        <Input
                            id="messageRate"
                            type="number"
                            value={formData.message_rate}
                            onChange={(e) => setFormData({ ...formData, message_rate: e.target.value })}
                            min={0}
                        />
                        <p className="text-xs text-muted-foreground">0 for no limit</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="batchSize">Batch Size</Label>
                        <Input
                            id="batchSize"
                            type="number"
                            value={formData.batch_size}
                            onChange={(e) => setFormData({ ...formData, batch_size: e.target.value })}
                            min={1}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxError">Max Error Threshold</Label>
                        <Input
                            id="maxError"
                            type="number"
                            value={formData.max_error_threshold}
                            onChange={(e) => setFormData({ ...formData, max_error_threshold: e.target.value })}
                            min={1}
                        />
                        <p className="text-xs text-muted-foreground">Stop campaign if errors exceed this count</p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
