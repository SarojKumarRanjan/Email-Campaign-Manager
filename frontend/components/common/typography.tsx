import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

// Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    children: React.ReactNode;
    asChild?: boolean;
}

export function Heading({ level = 1, className, children, asChild = false, ...props }: HeadingProps) {
    const styles = {
        1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        3: "scroll-m-20 text-2xl font-semibold tracking-tight",
        4: "scroll-m-20 text-xl font-semibold tracking-tight",
        5: "scroll-m-20 text-lg font-semibold tracking-tight",
        6: "scroll-m-20 text-base font-semibold tracking-tight",
    };

    const Comp = asChild ? Slot : (`h${level}` as const);
    
    return (
        <Comp className={cn(styles[level], className)} {...props}>
            {children}
        </Comp>
    );
}

// Subheading Component
interface SubheadingProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
    asChild?: boolean;
}

export function Subheading({ className, children, asChild = false, ...props }: SubheadingProps) {
    const Comp = asChild ? Slot : "p";
    return (
        <Comp className={cn("text-lg text-muted-foreground", className)} {...props}>
            {children}
        </Comp>
    );
}

// Text Component (Normal Text)
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
    asChild?: boolean;
}

export function Text({ className, children, asChild = false, ...props }: TextProps) {
    const Comp = asChild ? Slot : "p";
    return (
        <Comp className={cn("leading-7 not-first:mt-6", className)} {...props}>
            {children}
        </Comp>
    );
}

// Muted Text Component
interface MutedTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
    asChild?: boolean;
}

export function MutedText({ className, children, asChild = false, ...props }: MutedTextProps) {
    const Comp = asChild ? Slot : "p";
    return (
        <Comp className={cn("text-sm text-muted-foreground", className)} {...props}>
            {children}
        </Comp>
    );
}

// Lead Text (Larger intro text)
interface LeadProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
    asChild?: boolean;
}

export function Lead({ className, children, asChild = false, ...props }: LeadProps) {
    const Comp = asChild ? Slot : "p";
    return (
        <Comp className={cn("text-xl text-muted-foreground", className)} {...props}>
            {children}
        </Comp>
    );
}

// Large Text
interface LargeProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    asChild?: boolean;
}

export function Large({ className, children, asChild = false, ...props }: LargeProps) {
    const Comp = asChild ? Slot : "div";
    return (
        <Comp className={cn("text-lg font-semibold", className)} {...props}>
            {children}
        </Comp>
    );
}

// Small Text
interface SmallProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    asChild?: boolean;
}

export function Small({ className, children, asChild = false, ...props }: SmallProps) {
    const Comp = asChild ? Slot : "small";
    return (
        <Comp className={cn("text-sm font-medium leading-none", className)} {...props}>
            {children}
        </Comp>
    );
}

// Inline Code
interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

export function InlineCode({ className, children, ...props }: InlineCodeProps) {
    return (
        <code
            className={cn(
                "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
                className
            )}
            {...props}
        >
            {children}
        </code>
    );
}

// Blockquote
interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
    children: React.ReactNode;
}

export function Blockquote({ className, children, ...props }: BlockquoteProps) {
    return (
        <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props}>
            {children}
        </blockquote>
    );
}

// List (Unordered)
interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
    children: React.ReactNode;
}

export function List({ className, children, ...props }: ListProps) {
    return (
        <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props}>
            {children}
        </ul>
    );
}

// Ordered List
interface OrderedListProps extends React.OlHTMLAttributes<HTMLOListElement> {
    children: React.ReactNode;
}

export function OrderedList({ className, children, ...props }: OrderedListProps) {
    return (
        <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props}>
            {children}
        </ol>
    );
}
