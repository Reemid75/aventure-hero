import { z } from 'zod'

export const storySchema = z.object({
  title: z
    .string()
    .min(2, '2 caractères minimum')
    .max(100, '100 caractères maximum'),
  description: z.string().max(500, '500 caractères maximum').optional(),
  is_published: z.boolean(),
})

export type StoryInput = z.infer<typeof storySchema>
