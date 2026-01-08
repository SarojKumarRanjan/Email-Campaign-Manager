"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

interface FileSettingsProps {
    initialSettings: any;
    onSave: (settings: any) => void;
}

export default function FileSettings({ initialSettings, onSave }: FileSettingsProps) {
    const [provider, setProvider] = useState(initialSettings?.file_provider || "filesystem");
    const [s3Settings, setS3Settings] = useState({
        bucket: initialSettings?.s3_bucket || "",
        region: initialSettings?.s3_region || "",
        accessKey: initialSettings?.s3_access_key || "",
        secretKey: initialSettings?.s3_secret_key || "",
        bucketPath: initialSettings?.s3_bucket_path || "",
        bucketType: initialSettings?.s3_bucket_type || "public",
        uploadExpiry: initialSettings?.s3_upload_expiry || 15,
    });
    const [cloudinarySettings, setCloudinarySettings] = useState({
        cloudName: initialSettings?.cloudinary_cloud_name || "",
        apiKey: initialSettings?.cloudinary_api_key || "",
        apiSecret: initialSettings?.cloudinary_api_secret || "",
    });
    const [extensions, setExtensions] = useState(initialSettings?.permitted_file_extensions || "jpg,jpeg,png,gif,svg");

    useEffect(() => {
        if (initialSettings) {
            setProvider(initialSettings.file_provider || "filesystem");
            setS3Settings({
                bucket: initialSettings.s3_bucket || "",
                region: initialSettings.s3_region || "",
                accessKey: initialSettings.s3_access_key || "",
                secretKey: initialSettings.s3_secret_key || "",
                bucketPath: initialSettings.s3_bucket_path || "",
                bucketType: initialSettings.s3_bucket_type || "public",
                uploadExpiry: initialSettings.s3_upload_expiry || 15,
            });
            setCloudinarySettings({
                cloudName: initialSettings.cloudinary_cloud_name || "",
                apiKey: initialSettings.cloudinary_api_key || "",
                apiSecret: initialSettings.cloudinary_api_secret || "",
            });
            setExtensions(initialSettings.permitted_file_extensions || "jpg,jpeg,png,gif,svg");
        }
    }, [initialSettings]);

    const handleSave = () => {
        onSave({
            file_provider: provider,
            s3_bucket: s3Settings.bucket,
            s3_region: s3Settings.region,
            s3_access_key: s3Settings.accessKey,
            s3_secret_key: s3Settings.secretKey,
            s3_bucket_path: s3Settings.bucketPath,
            s3_bucket_type: s3Settings.bucketType,
            s3_upload_expiry: parseInt(String(s3Settings.uploadExpiry), 10),
            cloudinary_cloud_name: cloudinarySettings.cloudName,
            cloudinary_api_key: cloudinarySettings.apiKey,
            cloudinary_api_secret: cloudinarySettings.apiSecret,
            permitted_file_extensions: extensions,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>File Upload Settings</CardTitle>
                <CardDescription>Choose where to store uploaded files (images, assets).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup value={provider} onValueChange={setProvider} className="grid grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem value="filesystem" id="filesystem" className="peer sr-only" />
                        <Label
                            htmlFor="filesystem"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <span className="text-xl mb-2">📁</span>
                            Filesystem
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="s3" id="s3" className="peer sr-only" />
                        <Label
                            htmlFor="s3"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <span className="text-xl mb-2">☁️</span>
                            AWS S3
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="cloudinary" id="cloudinary" className="peer sr-only" />
                        <Label
                            htmlFor="cloudinary"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                            <span className="text-xl mb-2">🖼️</span>
                            Cloudinary
                        </Label>
                    </div>
                </RadioGroup>

                {provider === "filesystem" && (
                    <div className="space-y-4 rounded-md border p-4 bg-muted/50">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium">Public Access Path</h4>
                            <p className="text-sm text-muted-foreground">
                                Files uploaded via Filesystem will be accessible at:
                            </p>
                            <code className="block bg-background p-2 rounded text-xs">
                                /uploads/[filename]
                            </code>
                            <p className="text-xs text-muted-foreground italic">
                                Note: Ensure your server is correctly configured to serve the uploads directory.
                            </p>
                        </div>
                    </div>
                )}

                {provider === "s3" && (
                    <div className="space-y-4 rounded-md border p-4 bg-muted/50">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="s3_bucket">Bucket Name</Label>
                                <Input
                                    id="s3_bucket"
                                    value={s3Settings.bucket}
                                    onChange={(e) => setS3Settings({ ...s3Settings, bucket: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s3_region">Region</Label>
                                <Input
                                    id="s3_region"
                                    value={s3Settings.region}
                                    onChange={(e) => setS3Settings({ ...s3Settings, region: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="s3_path">Bucket Path (Prefix)</Label>
                                <Input
                                    id="s3_path"
                                    value={s3Settings.bucketPath}
                                    onChange={(e) => setS3Settings({ ...s3Settings, bucketPath: e.target.value })}
                                    placeholder="uploads/"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s3_type">Access Type</Label>
                                <Select value={s3Settings.bucketType} onValueChange={(v) => setS3Settings({ ...s3Settings, bucketType: v })}>
                                    <SelectTrigger id="s3_type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public Read</SelectItem>
                                        <SelectItem value="private">Private (Signed URLs)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="s3_access_key">Access Key ID</Label>
                                <Input
                                    id="s3_access_key"
                                    value={s3Settings.accessKey}
                                    onChange={(e) => setS3Settings({ ...s3Settings, accessKey: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="s3_secret_key">Secret Access Key</Label>
                                <Input
                                    id="s3_secret_key"
                                    type="password"
                                    value={s3Settings.secretKey}
                                    onChange={(e) => setS3Settings({ ...s3Settings, secretKey: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s3_expiry">Upload URL Expiry (Minutes)</Label>
                            <Input
                                id="s3_expiry"
                                type="number"
                                value={s3Settings.uploadExpiry}
                                onChange={(e) => setS3Settings({ ...s3Settings, uploadExpiry: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {provider === "cloudinary" && (
                    <div className="space-y-4 rounded-md border p-4 bg-muted/50">
                        <div className="space-y-2">
                            <Label htmlFor="cloud_name">Cloud Name</Label>
                            <Input
                                id="cloud_name"
                                value={cloudinarySettings.cloudName}
                                onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, cloudName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_key">API Key</Label>
                            <Input
                                id="api_key"
                                value={cloudinarySettings.apiKey}
                                onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, apiKey: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="api_secret">API Secret</Label>
                            <Input
                                id="api_secret"
                                type="password"
                                value={cloudinarySettings.apiSecret}
                                onChange={(e) => setCloudinarySettings({ ...cloudinarySettings, apiSecret: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="extensions">Permitted File Extensions</Label>
                    <Input
                        id="extensions"
                        value={extensions}
                        onChange={(e) => setExtensions(e.target.value)}
                        placeholder="jpg,jpeg,png,gif,svg"
                    />
                    <p className="text-xs text-muted-foreground">Comma separated list of allowed file types</p>
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

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
