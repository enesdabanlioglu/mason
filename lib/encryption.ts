import 'server-only'
import crypto from 'crypto'

// Security critical: Must be consistent across restarts.
// In production, this MUST be set in env vars.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 32) || '12345678901234567890123456789012' // Fallback for dev ONLY
const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

export function encrypt(text: string): string {
  if (!text) return text
  const iv = crypto.randomBytes(IV_LENGTH)
  // Key must be 32 bytes for aes-256
  const keyBuffer = Buffer.from(ENCRYPTION_KEY.padEnd(32).substring(0, 32)) 
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(text: string): string {
  if (!text) return text
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText = Buffer.from(textParts.join(':'), 'hex')
  const keyBuffer = Buffer.from(ENCRYPTION_KEY.padEnd(32).substring(0, 32))
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

