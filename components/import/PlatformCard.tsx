"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react"
import { useState } from "react"

interface PlatformCardProps {
    platform: string
    name: string
    icon: React.ElementType
    description: string
    isConnected: boolean
    lastSyncedAt?: string
    contactCount?: number
    onConnect: () => void
    onDisconnect: () => void
    onSync: () => void
    disabled?: boolean
}

export function PlatformCard({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    platform,
    name,
    icon: Icon,
    description,
    isConnected,
    lastSyncedAt,
    contactCount,
    onConnect,
    onDisconnect,
    onSync,
    disabled
}: PlatformCardProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleConnect = async () => {
        if (disabled) return
        setIsLoading(true)
        await onConnect()
        // Loading state persists until redirect or parent update
    }

    const handleDisconnect = async () => {
        setIsLoading(true)
        await onDisconnect()
        setIsLoading(false)
    }

    const handleSync = async () => {
        setIsLoading(true)
        await onSync()
        setIsLoading(false)
    }

    return (
        <Card className={cn("w-full hover:shadow-lg transition-all", isConnected && "border-emerald-500/50")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {name}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">{description}</p>
                    <div className="flex items-center gap-2 mt-2">
                        {isConnected ? (
                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                                <Check className="h-3 w-3 mr-1" /> Connected
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Not Connected</Badge>
                        )}
                        {disabled && <Badge variant="outline">Coming Soon</Badge>}
                    </div>
                    {isConnected && (
                        <div className="text-xs text-muted-foreground mt-2">
                            {contactCount !== undefined && <p>Contacts: {contactCount}</p>}
                            <p>Last Synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleDateString() : 'Never'}</p>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
                {isConnected ? (
                    <>
                       <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={isLoading}>
                           Disconnect
                       </Button>
                       <Button size="sm" onClick={handleSync} disabled={isLoading}>
                           {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sync Now"}
                       </Button>
                    </>
                ) : (
                    <Button className="w-full" onClick={handleConnect} disabled={disabled || isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
