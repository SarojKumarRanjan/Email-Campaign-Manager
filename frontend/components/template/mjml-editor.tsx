"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    RefreshCw,
    Copy,
    Check,
    AlertCircle
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

interface MjmlEditorProps {
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

const defaultMjmlTemplate = `<mjml>
  <mj-head>
    <mj-title>Email Template</mj-title>
    <mj-preview>Preview text</mj-preview>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" />
      <mj-text font-size="14px" color="#333333" line-height="1.5" />
      <mj-section padding="20px" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" border-radius="8px">
      <mj-column>
        <mj-text font-size="24px" font-weight="bold" align="center">
          Welcome to Our Newsletter
        </mj-text>
        <mj-divider border-color="#e0e0e0" />
        <mj-text>
          Hello there! Thank you for subscribing to our newsletter.
          We're excited to have you on board.
        </mj-text>
        <mj-button background-color="#4F46E5" href="#">
          Get Started
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

export function MjmlEditor({ value, onChange, className, disabled }: MjmlEditorProps) {
    const [mjmlContent, setMjmlContent] = useState(value || defaultMjmlTemplate);
    const [htmlOutput, setHtmlOutput] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
    const [isConverting, setIsConverting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mjml2html, setMjml2html] = useState<any>(null);

    // Load mjml-browser dynamically on client side
    useEffect(() => {
        const loadMjml = async () => {
            try {
                const mjmlBrowser = await import("mjml-browser");
                setMjml2html(() => mjmlBrowser.default);
            } catch (err) {
                console.error("Failed to load mjml-browser:", err);
                setError("Failed to load MJML parser");
            }
        };
        loadMjml();
    }, []);

    // Convert MJML to HTML
    const convertToHtml = useCallback(async (mjmlCode: string) => {
        if (!mjml2html) return;
        
        setIsConverting(true);
        setError(null);
        
        try {
            const result = mjml2html(mjmlCode, {
                validationLevel: "soft",
            });
            
            if (result.errors && result.errors.length > 0) {
                const errorMessages = result.errors
                    .map((e: any) => `Line ${e.line}: ${e.message}`)
                    .join("\n");
                setError(errorMessages);
            }
            
            setHtmlOutput(result.html || "");
        } catch (err: any) {
            setError(err.message || "Failed to convert MJML");
            setHtmlOutput("");
        } finally {
            setIsConverting(false);
        }
    }, [mjml2html]);

    // Debounced conversion
    useEffect(() => {
        const timer = setTimeout(() => {
            convertToHtml(mjmlContent);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [mjmlContent, convertToHtml]);

    // Sync with parent
    useEffect(() => {
        onChange(mjmlContent);
    }, [mjmlContent, onChange]);

    // Update from parent value
    useEffect(() => {
        if (value && value !== mjmlContent) {
            setMjmlContent(value);
        }
    }, [value]);

    const handleEditorChange = (newValue: string | undefined) => {
        if (newValue !== undefined) {
            setMjmlContent(newValue);
        }
    };

    const handleCopyHtml = async () => {
        try {
            await navigator.clipboard.writeText(htmlOutput);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy HTML:", err);
        }
    };

    const handleRefresh = () => {
        convertToHtml(mjmlContent);
    };

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <Code2 className="size-4 text-muted-foreground" />
                    <Small className="font-medium">MJML Editor</Small>
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
                            onClick={handleRefresh}
                            disabled={isConverting}
                        >
                            <RefreshCw className={cn("size-4", isConverting && "animate-spin")} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyHtml}
                            disabled={!htmlOutput}
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

            {/* Error Banner */}
            {error && (
                <div className="flex items-start gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20">
                    <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                    <MutedText className="text-xs text-destructive whitespace-pre-wrap">
                        {error}
                    </MutedText>
                </div>
            )}

            {/* Editor & Preview Split */}
            <div className="flex-1 flex min-h-0">
                {/* Code Editor */}
                <div className="w-1/2 border-r flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/20">
                        <Code2 className="size-3.5 text-muted-foreground" />
                        <MutedText className="text-xs">MJML Code</MutedText>
                    </div>
                    <div className="flex-1">
                        <MonacoEditor
                            height="100%"
                            language="xml"
                            value={mjmlContent}
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
                            {htmlOutput ? (
                                <iframe
                                    srcDoc={htmlOutput}
                                    className="w-full h-full border-0"
                                    style={{ minHeight: 600 }}
                                    sandbox="allow-same-origin"
                                    title="Email Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    {isConverting ? (
                                        <RefreshCw className="size-6 animate-spin" />
                                    ) : (
                                        <MutedText>Enter MJML code to see preview</MutedText>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export the default template for use elsewhere
export { defaultMjmlTemplate };
