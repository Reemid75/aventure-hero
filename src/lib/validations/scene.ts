import { z } from 'zod'

export const sceneSchema = z.object({
  title: z
    .string()
    .min(1, 'Titre requis')
    .max(100, '100 caractères maximum'),
  content: z.string().min(1, 'Contenu requis'),
  is_start: z.boolean(),
  is_ending: z.boolean(),
  ending_type: z
    .enum(['victory', 'defeat', 'neutral'])
    .nullable()
    .optional(),
  /** URL du visuel facultatif de la scène */
  visual_url: z.string().optional(),
  /** Saisie libre séparée par des virgules, convertie en tableau lors de la soumission */
  keywords_raw: z.string().optional(),
  required_keywords_raw: z.string().optional(),
  item_keywords_raw: z.string().optional(),
})

/** Parse une chaîne "mot1, mot2, mot3" en tableau de mots-clés nettoyés */
export function parseKeywords(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

export const choiceSchema = z.object({
  label: z
    .string()
    .min(1, 'Label requis')
    .max(200, '200 caractères maximum'),
  to_scene_id: z.string().uuid('Scène de destination invalide'),
  order_index: z.number().int().min(0).default(0),
})

export type SceneInput = z.infer<typeof sceneSchema>
export type ChoiceInput = z.infer<typeof choiceSchema>
