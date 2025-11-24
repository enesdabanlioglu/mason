import * as z from "zod"

export const platformSchema = z.enum(['google', 'linkedin', 'whatsapp', 'instagram', 'manual'])

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  source_platform: platformSchema,
  source_id: z.string().optional().nullable(),
  google_contact_id: z.string().optional().nullable(),
})

export const syncRequestSchema = z.object({
  platform: platformSchema
})

export const connectRequestSchema = z.object({
  platform: platformSchema
})

export const disconnectRequestSchema = z.object({
  platform: platformSchema
})


