export const ZodiacSigns = {
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12,
} as const

export const ZodiacIcons: Record<ZodiacSigsName, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
}

export type ZodiacSigsName = keyof typeof ZodiacSigns

export class Zodiac {
  id: number
  name: ZodiacSigsName
  icon: string

  constructor(zodiac: Partial<Zodiac>) {
    Object.assign(this, zodiac)
  }

  public getIcon(): string {
    return this.icon
  }

  public getI18nKey(): string {
    return `zodiac-${this.name}`
  }

  static getByIndex(index: number) {
    const signs = Object.keys(ZodiacSigns) as ZodiacSigsName[]
    const zeroBasedIndex = index >= 1 && index <= 12 ? index - 1 : index
    const name = signs[zeroBasedIndex]
    const icon = ZodiacIcons[name]
    return new Zodiac({ id: index, name, icon })
  }
}
