export type PlatformType = 'google' | 'linkedin' | 'whatsapp' | 'instagram' | 'manual'

export interface User {
  id: string
  email?: string
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  company: string
  position?: string
  email?: string
  phone?: string
  google_contact_id?: string
  source_platform: PlatformType
  source_id?: string
  created_at: string
  updated_at: string
}

export interface MutualConnection {
  user_id: string
  user_name: string
  user_avatar: string
  mutual_count: number
}
