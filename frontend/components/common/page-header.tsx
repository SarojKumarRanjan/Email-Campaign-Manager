

import { Button } from "../ui/button";
import { Heading, Subheading, Text } from "./typography";
import { Undo2 } from "lucide-react";
interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    backButton?: boolean;
    onBack?: () => void;
    rightNode?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    backButton,
    onBack,
    rightNode,
}: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background">
            <div className="flex items-center  gap-2">
                {
                    backButton && (
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <Undo2 className="size-8" />
                        </Button>
                    )
                }
                {typeof title === "string" ? <Heading level={3}>{title}</Heading> : title}
                {
                    description && (
                        typeof description === "string" ? <Subheading>{description}</Subheading> : description
                    )
                }
            </div>
            {
                rightNode && (
                    <div className="ml-auto">
                        {rightNode}
                    </div>
                )
            }
        </div>
    )
}
