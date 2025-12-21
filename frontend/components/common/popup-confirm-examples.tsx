/**
 * PopupConfirm Component Examples
 * 
 * This file demonstrates all the different ways to use the PopupConfirm component.
 */

import PopupConfirm from "@/components/common/popup-confirm";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Info, CheckCircle } from "lucide-react";

export default function PopupConfirmExamples() {
    return (
        <div className="space-y-8 p-8">
            <h1 className="text-2xl font-bold">PopupConfirm Examples</h1>

            {/* Info Variant */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Info Variant</h2>
                <PopupConfirm
                    variant="info"
                    title="Information"
                    description="This is an informational message to help you understand something."
                    proceedText="Got it"
                >
                    <Button variant="outline">
                        <Info className="mr-2 h-4 w-4" />
                        Show Info
                    </Button>
                </PopupConfirm>
            </div>

            {/* Warning Variant */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Warning Variant</h2>
                <PopupConfirm
                    variant="warning"
                    title="Warning: Unsaved Changes"
                    description="You have unsaved changes. Are you sure you want to leave this page?"
                    proceedText="Leave Anyway"
                    cancelText="Stay"
                    onProceed={() => console.log("User left the page")}
                >
                    <Button variant="outline">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Show Warning
                    </Button>
                </PopupConfirm>
            </div>

            {/* Error/Destructive Variant */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Error Variant (Destructive Action)</h2>
                <PopupConfirm
                    variant="error"
                    title="Delete Contact?"
                    description="This will permanently delete the contact. This action cannot be undone."
                    proceedText="Delete"
                    onProceed={() => console.log("Contact deleted")}
                >
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Contact
                    </Button>
                </PopupConfirm>
            </div>

            {/* Success Variant */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Success Variant</h2>
                <PopupConfirm
                    variant="success"
                    title="Confirm Submission"
                    description="Everything looks good! Ready to submit your form?"
                    proceedText="Submit"
                    onProceed={() => console.log("Form submitted")}
                >
                    <Button>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Form
                    </Button>
                </PopupConfirm>
            </div>

            {/* Custom Icon */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Custom Icon</h2>
                <PopupConfirm
                    variant="error"
                    customIcon={<Trash2 className="h-6 w-6 text-red-500" />}
                    title="Delete Forever"
                    description="This item will be permanently deleted from the database."
                    proceedText="Delete Forever"
                >
                    <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </PopupConfirm>
            </div>

            {/* Without Icon */}
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Without Icon</h2>
                <PopupConfirm
                    variant="info"
                    showIcon={false}
                    title="Simple Confirmation"
                    description="This is a simple confirmation without an icon."
                >
                    <Button variant="outline">No Icon Confirm</Button>
                </PopupConfirm>
            </div>
        </div>
    );
}
