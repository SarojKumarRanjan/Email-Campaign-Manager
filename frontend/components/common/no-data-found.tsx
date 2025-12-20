"use client"


interface NoDataFoundProps {
    message?: string
}

function NoDataFound({ message = "No data found" }: NoDataFoundProps) {
    return (
        <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">

            <p>{message}</p>
        </div>
    )
}

export default NoDataFound

