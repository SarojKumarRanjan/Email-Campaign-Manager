
import CreateContact from "@/components/contact/create-contact";
import PageHeader from "@/components/common/page-header";
import ContactList from "@/components/contact/contact-list";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react"




export default function ContactsPage() {


    return (
        <div className="p-4 grow flex flex-col gap-4">
            <PageHeader
                title="Contacts"
                rightNode={<CreateContact>
                    <Button><UserPlus /> Create Contact</Button>
                </CreateContact>}
            />
            <div className="flex-1">
                <ContactList />
            </div>
        </div>
    );
}
