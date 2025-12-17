import { Inbox } from "lucide-react"

interface NoDataFoundProps {
    message?: string
}

export function NoDataFound({ message = "No data found" }: NoDataFoundProps) {
    return (
        <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Inbox className="h-10 w-10" />
            <p>{message}</p>
        </div>
    )
}
