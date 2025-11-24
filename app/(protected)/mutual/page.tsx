import { createClient } from "@/lib/supabase/server"
import { MutualPageContent } from "@/components/mutual/MutualPageContent"

export default async function MutualPage() {
    const supabase = await createClient()
    const { data: mutuals } = await supabase.rpc('get_mutual_connections_summary')

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Mutual Connections</h2>
                <p className="text-muted-foreground">
                    Discover people who share contacts with you.
                </p>
            </div>
            <MutualPageContent initialMutuals={mutuals || []} />
        </div>
    )
}


