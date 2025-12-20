

import { Button } from "../ui/button";
import { Heading, Subheading, Text } from "./typography";
import { Undo2 } from "lucide-react";
interface PageHeaderProps {
    title: string;
    description?: string;
    backButton?: boolean;
    rightNode?: React.ReactNode;
}

export default function PageHeader({
    title,
    description,
    backButton,
    rightNode,
}: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between sticky top-0 z-10 bg-background">
            <div className="flex items-center  gap-2">
                {
                    backButton && (
                        <Button variant="ghost" size="icon">
                            <Undo2 className="size-8" />
                        </Button>
                    )
                }
                <Heading level={3}>{title}</Heading>
                {
                    description && (
                        <Subheading>{description}</Subheading>
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
