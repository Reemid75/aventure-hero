export type EndingType = 'victory' | 'defeat' | 'neutral'

export const endingConfig = {
  victory: {
    title: 'Victoire !',
    emoji: '🏆',
    colorClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50',
    borderClass: 'border-yellow-200',
    message: 'Félicitations, vous avez triomphé !',
  },
  defeat: {
    title: 'Défaite...',
    emoji: '💀',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
    message: 'Votre aventure se termine ici. Essayez encore !',
  },
  neutral: {
    title: 'Fin',
    emoji: '📖',
    colorClass: 'text-gray-600',
    bgClass: 'bg-gray-50',
    borderClass: 'border-gray-200',
    message: 'Votre aventure est terminée.',
  },
}

export function getEndingConfig(type: EndingType | null | undefined) {
  return endingConfig[type ?? 'neutral']
}
