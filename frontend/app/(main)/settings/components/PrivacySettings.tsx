"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface PrivacySettingsProps {
    initialSettings: any;
    onSave: (settings: any) => void;
}

export default function PrivacySettings({ initialSettings, onSave }: PrivacySettingsProps) {
    const [twoFactor, setTwoFactor] = useState(initialSettings?.two_factor_enabled || false);
    const [retentionDays, setRetentionDays] = useState(initialSettings?.data_retention_days || 365);

    useEffect(() => {
        if (initialSettings) {
            setTwoFactor(initialSettings.two_factor_enabled || false);
            setRetentionDays(initialSettings.data_retention_days || 365);
        }
    }, [initialSettings]);

    const handleSave = () => {
        onSave({
            two_factor_enabled: twoFactor,
            data_retention_days: parseInt(String(retentionDays), 10),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Manage security features and data policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">
                            Secure your account with 2FA.
                        </p>
                    </div>
                    <Switch
                        checked={twoFactor}
                        onCheckedChange={setTwoFactor}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="retention">Data Retention (Days)</Label>
                    <Input
                        id="retention"
                        type="number"
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(e.target.value)}
                        min={30}
                        max={3650}
                    />
                    <p className="text-sm text-muted-foreground">
                        Number of days to keep campaign logs and analytics data.
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
