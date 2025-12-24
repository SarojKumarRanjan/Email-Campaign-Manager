"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FullscreenModalProps {
  side?: "top" | "bottom" | "left" | "right";
  height?: number; // Interpreted as percentage of viewport (1 to 100)
  title?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * FullscreenModal component using Shadcn UI Sheet
 * Provides a customizable side-panel modal that can take up to 100% of the viewport.
 */
export const FullscreenModal = ({
  side = "right",
  height = 100,
  title,
  open,
  onClose,
  children,
  className,
}: FullscreenModalProps) => {
  const isHorizontal = side === "left" || side === "right";
  
  const sizeStyle: React.CSSProperties = isHorizontal 
    ? { width: `${height}vw`, maxWidth: "100vw" } 
    : { height: `${height}vh`, maxHeight: "100vh" };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side={side}
        style={sizeStyle}
        className={cn(
          "flex flex-col p-0 gap-0 sm:max-w-none transition-all duration-300",
          className
        )}
      >
        {title && (
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="flex-1 overflow-y-auto w-full h-full p-2">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
