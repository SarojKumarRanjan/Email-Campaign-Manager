

const Loading = ({ message = "Loading...", isLoading = true }: { message?: string, isLoading?: boolean }) => {
    return (
        isLoading ? (
            <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center gap-2 text-muted-foreground">

                <p>{message}</p>
            </div>
        ) : null
    )
}

export default Loading
