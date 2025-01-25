import * as z from "zod"

const profileFormSchema = z.object({
  name: z.string().min(2).max(32),
  bio: z.string().max(160).optional(),
  isPublic: z.boolean().default(false),
})

export default profileFormSchema
export type ProfileFormValues = z.infer<typeof profileFormSchema> 