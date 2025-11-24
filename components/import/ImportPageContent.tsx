"use client"

import { PlatformCard } from "./PlatformCard"
import { Chrome, Linkedin, Phone, Instagram } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect } from "react"
import { PlatformConnection } from "@/types/platform"

interface ImportPageContentProps {
    initialConnections: PlatformConnection[]
    searchParams: { [key: string]: string | string[] | undefined }
}

export function ImportPageContent({ initialConnections, searchParams }: ImportPageContentProps) {
    const router = useRouter()
    
    useEffect(() => {
        if (searchParams.success) {
            toast.success(`Successfully connected ${searchParams.success}`)
            router.replace('/import')
        }
        if (searchParams.error) {
            toast.error(`Error: ${searchParams.error}`)
            router.replace('/import')
        }
    }, [searchParams, router])

    const getConnection = (platform: string) => initialConnections.find((c) => c.platform === platform)

    const handleConnect = (platform: string) => {
        router.push(`/api/platforms/connect?platform=${platform}`)
    }

    const handleDisconnect = async (platform: string) => {
        try {
            const res = await fetch('/api/platforms/disconnect', {
                method: 'POST',
                body: JSON.stringify({ platform }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (!res.ok) throw new Error('Failed to disconnect')
            toast.success('Disconnected')
            router.refresh()
        } catch (error: unknown) {
            console.error(error)
            toast.error('Failed to disconnect')
        }
    }

    const handleSync = async (platform: string) => {
        try {
            toast.info('Syncing contacts...')
            const res = await fetch('/api/contacts/sync', {
                method: 'POST',
                body: JSON.stringify({ platform }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (!res.ok) throw new Error('Failed to sync')
            const data = await res.json()
            toast.success(`Synced ${data.count} contacts`)
            router.refresh()
        } catch (error: unknown) {
            console.error(error)
            toast.error('Failed to sync')
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PlatformCard 
                platform="google"
                name="Google Contacts"
                icon={Chrome}
                description="Import contacts from your Google account."
                isConnected={!!getConnection('google')}
                lastSyncedAt={getConnection('google')?.last_synced_at}
                onConnect={() => handleConnect('google')}
                onDisconnect={() => handleDisconnect('google')}
                onSync={() => handleSync('google')}
            />
             <PlatformCard 
                platform="linkedin"
                name="LinkedIn"
                icon={Linkedin}
                description="Import connections from LinkedIn."
                isConnected={!!getConnection('linkedin')}
                onConnect={() => {}}
                onDisconnect={() => {}}
                onSync={() => {}}
                disabled
            />
            <PlatformCard 
                platform="whatsapp"
                name="WhatsApp"
                icon={Phone}
                description="Import contacts from WhatsApp."
                isConnected={!!getConnection('whatsapp')}
                onConnect={() => {}}
                onDisconnect={() => {}}
                onSync={() => {}}
                disabled
            />
            <PlatformCard 
                platform="instagram"
                name="Instagram"
                icon={Instagram}
                description="Import followers from Instagram."
                isConnected={!!getConnection('instagram')}
                onConnect={() => {}}
                onDisconnect={() => {}}
                onSync={() => {}}
                disabled
            />
        </div>
    )
}
