import {
    Heading,
    Subheading,
    Text,
    MutedText,
    Lead,
    Large,
    Small,
    InlineCode,
    Blockquote,
    List,
    OrderedList,
} from "@/components/common/typography";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/common/page-header";

export default function CampaignsPage() {
    return (
        <div className="flex flex-1 flex-col gap-8 p-8">
            <PageHeader
                title="Typography System"
                description="Complete typography components for consistent text styling across the application"
            />

            <div className="grid gap-6">
                {/* Headings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Headings</CardTitle>
                        <CardDescription>
                            Six levels of headings with consistent styling
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Heading level={1}>Heading 1 - Main Page Title</Heading>
                        <Heading level={2}>Heading 2 - Section Title</Heading>
                        <Heading level={3}>Heading 3 - Subsection Title</Heading>
                        <Heading level={4}>Heading 4 - Component Title</Heading>
                        <Heading level={5}>Heading 5 - Small Section</Heading>
                        <Heading level={6}>Heading 6 - Smallest Heading</Heading>
                    </CardContent>
                </Card>

                {/* Text Variants */}
                <Card>
                    <CardHeader>
                        <CardTitle>Text Variants</CardTitle>
                        <CardDescription>
                            Different text styles for various use cases
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Lead Text
                            </Small>
                            <Lead>
                                This is a lead paragraph. Use it for introductory text that needs to stand out from regular body copy.
                            </Lead>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Subheading
                            </Small>
                            <Subheading>
                                This is a subheading, perfect for descriptions and secondary information
                            </Subheading>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Normal Text
                            </Small>
                            <Text>
                                This is normal body text. It has comfortable line height and spacing for easy reading.
                                Use this for most of your content.
                            </Text>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Muted Text
                            </Small>
                            <MutedText>
                                This is muted text, useful for less important information, timestamps, or helper text.
                            </MutedText>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Large Text
                            </Small>
                            <Large>
                                This is large text for emphasis without being a heading
                            </Large>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Small Text
                            </Small>
                            <Small>
                                This is small text for fine print or captions
                            </Small>
                        </div>
                    </CardContent>
                </Card>

                {/* Special Elements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Special Elements</CardTitle>
                        <CardDescription>
                            Blockquotes, code, and lists
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Inline Code
                            </Small>
                            <Text>
                                Use <InlineCode>InlineCode</InlineCode> for code snippets like{" "}
                                <InlineCode>const example = true</InlineCode> within text.
                            </Text>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Blockquote
                            </Small>
                            <Blockquote>
                                "This is a blockquote. Use it for quotations, testimonials, or to highlight important information from external sources."
                            </Blockquote>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Unordered List
                            </Small>
                            <List>
                                <li>First item in the list</li>
                                <li>Second item with more content</li>
                                <li>Third item to show spacing</li>
                            </List>
                        </div>

                        <div>
                            <Small className="text-muted-foreground uppercase tracking-wide mb-2 block">
                                Ordered List
                            </Small>
                            <OrderedList>
                                <li>First step in the process</li>
                                <li>Second step with details</li>
                                <li>Final step to complete</li>
                            </OrderedList>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Example */}
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Example</CardTitle>
                        <CardDescription>
                            How to use typography components in your code
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                            <div className="text-muted-foreground">// Import components</div>
                            <div>import {"{"} Heading, Text, MutedText {"}"} from "@/components/common/typography";</div>
                            <br />
                            <div className="text-muted-foreground">// Use in your component</div>
                            <div>&lt;Heading level={"{2}"}&gt;Page Title&lt;/Heading&gt;</div>
                            <div>&lt;Text&gt;Your content here&lt;/Text&gt;</div>
                            <div>&lt;MutedText&gt;Helper text&lt;/MutedText&gt;</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
