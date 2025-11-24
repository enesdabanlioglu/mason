import { createClient } from "@/lib/supabase/server"
import { ContactsTable } from "@/components/contacts/ContactsTable"
import { AddContactDialog } from "@/components/contacts/AddContactDialog"

export default async function ContactsPage({
    searchParams
}: {
    searchParams: { page?: string, query?: string }
}) {
    const supabase = await createClient()
    const page = Number(searchParams.page) || 1
    const pageSize = 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    let query = supabase.from('contacts').select('*', { count: 'exact' })
    
    if (searchParams.query) {
        query = query.or(`name.ilike.%${searchParams.query}%,company.ilike.%${searchParams.query}%`)
    }
    
    const { data: contacts, count } = await query.range(from, to).order('created_at', { ascending: false })
    
    return (
         <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Contacts</h2>
                    <p className="text-muted-foreground">
                        Manage your imported and manual contacts.
                    </p>
                </div>
                <AddContactDialog />
            </div>
            
            <ContactsTable 
                contacts={contacts || []} 
                pageCount={Math.ceil((count || 0) / pageSize)}
                currentPage={page}
            />
        </div>
    )
}
