
import CreateContact from "@/components/contact/create-contact";
import PageHeader from "@/components/common/page-header";
import ContactList from "@/components/contact/contact-list";




export default function ContactsPage() {


    return (
        <div className="p-4 grow flex flex-col gap-4">
            <PageHeader
                title="Contacts"
                rightNode={<CreateContact />}
            />
            <div className="flex-1">
                <ContactList />
            </div>
        </div>
    );
}
