import CreateContact from "@/components/contact/create-contact"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"

export default function CreateContactComponent() {
    const [open, setOpen] = useState(false)
    return <>
        <CreateContact open={open} onClose={() => setOpen(false)} />
        <Button onClick={() => setOpen(true)}><UserPlus /> Create Contact</Button>
    </>
}
