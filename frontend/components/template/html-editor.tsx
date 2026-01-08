"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Eye, 
    Code2, 
    Monitor, 
    Smartphone, 
    Tablet,
    Copy,
    Check
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MutedText, Small } from "@/components/common/typography";

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    { 
        ssr: false,
        loading: () => <Skeleton className="w-full h-full" />
    }
);

interface HtmlEditorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
}

type PreviewDevice = "desktop" | "tablet" | "mobile";

const deviceWidths: Record<PreviewDevice, number> = {
    desktop: 800,
    tablet: 600,
    mobile: 375,
};

const defaultHtmlTemplate = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
      .container { background-color: #ffffff; border-radius: 8px; padding: 40px; max-width: 600px; margin: 0 auto; }
      h1 { color: #333333; text-align: center; }
      p { color: #666666; line-height: 1.6; }
      .button { display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to Our Newsletter</h1>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p>Hello there! Thank you for subscribing to our newsletter. We're excited to have you on board.</p>
      <div style="text-align: center;">
        <a href="#" class="button">Get Started</a>
      </div>
    </div>
  </body>
</html>`;

export function HtmlEditor({ value, onChange, className, disabled }: HtmlEditorProps) {
    const [htmlContent, setHtmlContent] = useState(value || defaultHtmlTemplate);
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
    const [copied, setCopied] = useState(false);

    // Sync with parent
    useEffect(() => {
        onChange(htmlContent);
    }, [htmlContent, onChange]);

    // Update from parent value
    useEffect(() => {
        if (value && value !== htmlContent) {
            setHtmlContent(value);
        }
    }, [value]);

    const handleEditorChange = (newValue: string | undefined) => {
        if (newValue !== undefined) {
            setHtmlContent(newValue);
        }
    };

    const handleCopyHtml = async () => {
        try {
            await navigator.clipboard.writeText(htmlContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy HTML:", err);
        }
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <Code2 className="size-4 text-muted-foreground" />
                    <Small className="font-medium">HTML Editor</Small>
                </div>
                <div className="flex items-center gap-4">
                    {/* Device Preview Selector */}
                    <Tabs value={previewDevice} onValueChange={(v) => setPreviewDevice(v as PreviewDevice)}>
                        <TabsList className="h-8">
                            <TabsTrigger value="desktop" className="h-7 px-2">
                                <Monitor className="size-4" />
                            </TabsTrigger>
                            <TabsTrigger value="tablet" className="h-7 px-2">
                                <Tablet className="size-4" />
                            </TabsTrigger>
                            <TabsTrigger value="mobile" className="h-7 px-2">
                                <Smartphone className="size-4" />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyHtml}
                            disabled={!htmlContent}
                        >
                            {copied ? (
                                <Check className="size-4 text-green-500" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Editor & Preview Split */}
            <div className="flex-1 flex min-h-0">
                {/* Code Editor */}
                <div className="w-1/2 border-r flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/20">
                        <Code2 className="size-3.5 text-muted-foreground" />
                        <MutedText className="text-xs">HTML Code</MutedText>
                    </div>
                    <div className="flex-1">
                        <MonacoEditor
                            height="100%"
                            language="html"
                            value={htmlContent}
                            onChange={handleEditorChange}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                lineNumbers: "on",
                                scrollBeyondLastLine: false,
                                wordWrap: "on",
                                tabSize: 2,
                                automaticLayout: true,
                                readOnly: disabled,
                                padding: { top: 8 },
                            }}
                        />
                    </div>
                </div>

                {/* Preview Pane */}
                <div className="w-1/2 flex flex-col bg-muted/10">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/20">
                        <Eye className="size-3.5 text-muted-foreground" />
                        <MutedText className="text-xs">Live Preview</MutedText>
                        <MutedText className="text-xs ml-auto">
                            {deviceWidths[previewDevice]}px
                        </MutedText>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex justify-center">
                        <div 
                            className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
                            style={{ 
                                width: deviceWidths[previewDevice],
                                maxWidth: "100%",
                            }}
                        >
                            {htmlContent ? (
                                <iframe
                                    srcDoc={htmlContent}
                                    className="w-full h-full border-0"
                                    style={{ minHeight: 600 }}
                                    sandbox="allow-same-origin"
                                    title="Email Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    <MutedText>Enter HTML code to see preview</MutedText>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { defaultHtmlTemplate };
