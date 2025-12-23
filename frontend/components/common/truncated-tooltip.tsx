import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TruncatedTooltipProps {
  value: string | number
  limit: number
  className?: string
}

export function TruncatedTooltip({
  value,
  limit,
  className,
}: TruncatedTooltipProps) {
  const text = String(value)


  if (text.length <= limit) {
    return <span className={className}>{text}</span>
  }

  const truncated = text.slice(0, limit) + "..."

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`cursor-pointer truncate ${className ?? ""}`}
          >
            {truncated}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs wrap-break-word">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
