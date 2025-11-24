import { google, people_v1 } from 'googleapis'
import { IPlatformAdapter } from '@/types/platform'
import { Contact } from '@/types/index'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/encryption'
import crypto from 'crypto'

export class GoogleContactsAdapter implements IPlatformAdapter {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    )
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/contacts.readonly', 'profile', 'email'],
      prompt: 'consent'
    })
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code)
    this.oauth2Client.setCredentials(tokens)

    // Use service role client to bypass RLS and PostgREST cache issues
    const supabase = createServiceRoleClient()
    
    const { error } = await supabase.from('user_platform_connections').upsert({
      user_id: userId,
      platform: 'google',
      access_token: encrypt(tokens.access_token!),
      refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
      token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      is_active: true,
      connected_at: new Date().toISOString(),
    }, { onConflict: 'user_id, platform' })

    if (error) {
        console.error('Error saving tokens', error)
        throw error
    }
  }

  async fetchContacts(userId: string): Promise<Contact[]> {
    // Use service role client for fetching connections
    const supabase = createServiceRoleClient()
    const { data: connection } = await supabase
      .from('user_platform_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'google')
      .single()

    if (!connection || !connection.access_token) {
      throw new Error('Not connected to Google')
    }

    const accessToken = decrypt(connection.access_token)
    const refreshToken = connection.refresh_token ? decrypt(connection.refresh_token) : null

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    this.oauth2Client.on('tokens', async (tokens) => {
       if (tokens.access_token) {
         const updateData: { access_token: string; token_expires_at?: string; refresh_token?: string } = {
           access_token: encrypt(tokens.access_token),
           token_expires_at: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : undefined
         }
         if (tokens.refresh_token) {
             updateData.refresh_token = encrypt(tokens.refresh_token)
         }
         
         await supabase.from('user_platform_connections').update(updateData).eq('id', connection.id)
       }
    })

    const service = google.people({ version: 'v1', auth: this.oauth2Client })
    
    const contacts: Contact[] = []
    let nextPageToken: string | undefined = undefined
    
    try {
        do {
            // Explicitly type the response
            const res: any = await service.people.connections.list({
                resourceName: 'people/me',
                pageSize: 100,
                personFields: 'names,organizations,emailAddresses,phoneNumbers,occupations',
                pageToken: nextPageToken
            })
            
            if (res.data.connections) {
                for (const person of res.data.connections) {
                    const name = person.names?.[0]?.displayName || 'Unknown'
                    const company = person.organizations?.[0]?.name || ''
                    const position = person.organizations?.[0]?.title || ''
                    const email = person.emailAddresses?.[0]?.value || undefined
                    const phone = person.phoneNumbers?.[0]?.value || undefined
                    const googleId = person.resourceName?.replace('people/', '') || undefined

                    if (name === 'Unknown' && !email && !phone) continue

                    contacts.push({
                        id: crypto.randomUUID(),
                        user_id: userId,
                        name,
                        company,
                        position,
                        email,
                        phone,
                        google_contact_id: googleId,
                        source_platform: 'google',
                        source_id: googleId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                }
            }
            nextPageToken = res.data.nextPageToken || undefined
        } while (nextPageToken)
    } catch (error: any) {
        console.error('Error fetching contacts', error)
        
        // Check for specific API errors
        if (error?.code === 403 || error?.status === 403) {
            const errorMessage = error?.message || ''
            if (errorMessage.includes('People API has not been used') || errorMessage.includes('it is disabled')) {
                throw new Error(
                    'Google People API is not enabled. Please enable it in your Google Cloud Console: ' +
                    'https://console.cloud.google.com/apis/library/people.googleapis.com'
                )
            }
            if (errorMessage.includes('insufficient authentication scopes')) {
                throw new Error(
                    'Insufficient permissions. Please reconnect your Google account with the required permissions.'
                )
            }
        }
        
        throw error
    }

    return contacts
  }

  async disconnect(userId: string): Promise<void> {
     const supabase = createServiceRoleClient()
     await supabase.from('user_platform_connections').delete().eq('user_id', userId).eq('platform', 'google')
  }
}
