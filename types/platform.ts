import { Contact, PlatformType } from './index'

export interface PlatformConnection {
  id: string
  user_id: string
  platform: PlatformType
  connected_at: string
  last_synced_at?: string
  is_active: boolean
}

export interface IPlatformAdapter {
  getAuthUrl(): string
  handleCallback(code: string, userId: string): Promise<void>
  fetchContacts(userId: string): Promise<Contact[]>
  disconnect(userId: string): Promise<void>
}


