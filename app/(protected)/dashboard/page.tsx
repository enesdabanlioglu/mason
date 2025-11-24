import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Users, Import, Network } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { count: contactCount } = await supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('user_id', user?.id)
    const { data: mutuals } = await supabase.rpc('get_mutual_connections_summary')
    const mutualCount = mutuals?.length || 0
    
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome back, {user?.user_metadata?.full_name || 'User'}.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Contacts
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{contactCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all platforms
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Mutual Connections
                        </CardTitle>
                        <Network className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mutualCount}</div>
                        <p className="text-xs text-muted-foreground">
                            People with shared contacts
                        </p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Connected Platforms
                        </CardTitle>
                        <Import className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">
                            Google Contacts
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


