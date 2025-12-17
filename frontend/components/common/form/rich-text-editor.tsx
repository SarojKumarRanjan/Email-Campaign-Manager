"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";

import {
    Bold, Italic, Strikethrough, Underline as UnderlineIcon,
    List, ListOrdered,
    Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight,
    Link as LinkIcon, Image as ImageIcon,
    Undo, Redo,
    Quote
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    height?: number;
}

export function RichTextEditor({ value, onChange, placeholder, disabled, className, height = 150 }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || "Write something...",
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-md max-w-full',
                },
            }),
        ],
        content: value,
        editable: !disabled,
        editorProps: {
            attributes: {
                class: cn(
                    `min-h-[${height}px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`,
                    "prose prose-sm max-w-none dark:prose-invert",
                    "text-foreground",
                    className
                ),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Dialog States
    const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
    const [linkUrl, setLinkUrl] = React.useState("");

    const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState("");

    if (!editor) {
        return null;
    }

    // --- Link Handlers ---
    const openLinkDialog = () => {
        const previousUrl = editor.getAttributes("link").href;
        setLinkUrl(previousUrl || "");
        setLinkDialogOpen(true);
    };

    const saveLink = () => {
        if (linkUrl === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
        }
        setLinkDialogOpen(false);
    };

    // --- Image Handlers ---
    const openImageDialog = () => {
        setImageUrl("");
        setImageDialogOpen(true);
    };

    const saveImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
        }
        setImageDialogOpen(false);
    };

    return (
        <div className="flex flex-col gap-2">
            {!disabled && (
                <div className="flex flex-wrap items-center gap-1 rounded-md border bg-muted/20 p-1">

                    {/* History */}
                    <div className="flex items-center gap-0.5">
                        <Toggle size="sm" onPressedChange={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                            <Undo className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" onPressedChange={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                            <Redo className="h-4 w-4" />
                        </Toggle>
                    </div>

                    <div className="mx-1 h-5 w-px bg-border" />

                    {/* Typography */}
                    <div className="flex items-center gap-0.5">
                        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
                            <Bold className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
                            <Italic className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
                            <UnderlineIcon className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
                            <Strikethrough className="h-4 w-4" />
                        </Toggle>
                    </div>

                    <div className="mx-1 h-5 w-px bg-border" />

                    {/* Headings */}
                    <div className="flex items-center gap-0.5">
                        <Toggle size="sm" pressed={editor.isActive("heading", { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                            <Heading1 className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                            <Heading2 className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                            <Heading3 className="h-4 w-4" />
                        </Toggle>
                    </div>

                    <div className="mx-1 h-5 w-px bg-border" />

                    {/* Alignment */}
                    <div className="flex items-center gap-0.5">
                        <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}>
                            <AlignLeft className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}>
                            <AlignCenter className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}>
                            <AlignRight className="h-4 w-4" />
                        </Toggle>
                    </div>

                    <div className="mx-1 h-5 w-px bg-border" />

                    {/* Lists & Structure */}
                    <div className="flex items-center gap-0.5">
                        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
                            <List className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
                            <ListOrdered className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
                            <Quote className="h-4 w-4" />
                        </Toggle>
                    </div>

                    <div className="mx-1 h-5 w-px bg-border" />

                    {/* Media */}
                    <div className="flex items-center gap-0.5">
                        <Toggle size="sm" pressed={linkDialogOpen || editor.isActive("link")} onPressedChange={openLinkDialog}>
                            <LinkIcon className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="sm" pressed={imageDialogOpen} onPressedChange={openImageDialog}>
                            <ImageIcon className="h-4 w-4" />
                        </Toggle>
                    </div>
                </div>
            )}
            <EditorContent editor={editor} />

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Insert Link</DialogTitle>
                        <DialogDescription>
                            Enter the URL for your link.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link-url" className="sr-only">
                                Link
                            </Label>
                            <Input
                                id="link-url"
                                defaultValue={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        saveLink();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <Button type="button" variant="secondary" onClick={() => setLinkDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={saveLink}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                        <DialogDescription>
                            Enter the URL for your image.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="image-url" className="sr-only">
                                Image URL
                            </Label>
                            <Input
                                id="image-url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.png"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        saveImage();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <Button type="button" variant="secondary" onClick={() => setImageDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={saveImage}>
                            Insert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
