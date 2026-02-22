import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (6 caractères min)'),
})

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, '3 caractères minimum')
      .max(20, '20 caractères maximum')
      .regex(/^[a-zA-Z0-9_]+$/, 'Lettres, chiffres et _ uniquement'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Mot de passe trop court (6 caractères min)'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
