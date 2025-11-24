import { createClient } from "@/lib/supabase/server"
import { ImportPageContent } from "@/components/import/ImportPageContent"

export default async function ImportPage({
    searchParams
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: connections } = await supabase
        .from('user_platform_connections')
        .select('*')
        .eq('user_id', user?.id)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Import Contacts</h2>
                <p className="text-muted-foreground">
                    Connect your accounts to sync contacts from different platforms.
                </p>
            </div>
            
            <ImportPageContent 
                initialConnections={connections || []} 
                searchParams={searchParams}
            />
        </div>
    )
}

