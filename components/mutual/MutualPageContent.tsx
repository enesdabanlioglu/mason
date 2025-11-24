"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Network, User } from "lucide-react"
import { MutualConnection } from "@/types/index"

interface MutualPageContentProps {
    initialMutuals: MutualConnection[]
}

export function MutualPageContent({ initialMutuals }: MutualPageContentProps) {
    if (!initialMutuals || initialMutuals.length === 0) {
        return (
             <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-4">
                <Network className="h-12 w-12 text-muted-foreground/50" />
                <p>No mutual connections found yet.</p>
                <p className="text-sm">Import more contacts to find matches.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {initialMutuals.map((mutual) => (
                <Card key={mutual.user_id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={mutual.user_avatar} />
                            <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{mutual.user_name || 'Anonymous User'}</CardTitle>
                            <p className="text-sm text-muted-foreground">Member</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm py-1">
                                {mutual.mutual_count} Mutual Contacts
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
