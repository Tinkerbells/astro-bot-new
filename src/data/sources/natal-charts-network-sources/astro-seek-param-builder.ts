import type { AstroSeekNatalParams } from './dto.js'

type CoordInput = {
  latitude: number
  longitude: number
}

type BirthInput = CoordInput & {
  birthDate: string // ISO date (yyyy-mm-dd)
  birthTime?: string | null // hh:mm in local tz (or null)
  timezone?: string
  houseSystem?: string
}

export class AstroSeekParamBuilder {
  buildNatalParams(input: BirthInput): AstroSeekNatalParams {
    const { birthDate, birthTime, latitude, longitude, houseSystem } = input
    const birthTimeUnknown = !birthTime
    const date = new Date(`${birthDate}T${birthTime ?? '00:00:00'}Z`)
    const lat = this.toDegMin(latitude)
    const lon = this.toDegMin(longitude)
    const normalizedHouseSystem = this.normalizeHouseSystem(houseSystem)

    return {
      natal_input: 1,
      send_calculation: 1,
      narozeni_den: date.getUTCDate(),
      narozeni_mesic: date.getUTCMonth() + 1,
      narozeni_rok: date.getUTCFullYear(),
      narozeni_hodina: birthTimeUnknown ? 0 : date.getUTCHours(),
      narozeni_minuta: birthTimeUnknown ? 0 : date.getUTCMinutes(),
      narozeni_city: '',
      narozeni_mesto_hidden: 'Вручную: °\'с. ш., °\'в. д.',
      narozeni_stat_hidden: '',
      narozeni_podstat_kratky_hidden: '',
      narozeni_sirka_stupne: lat.deg,
      narozeni_sirka_minuty: lat.min,
      narozeni_sirka_smer: lat.dir,
      narozeni_delka_stupne: lon.deg,
      narozeni_delka_minuty: lon.min,
      narozeni_delka_smer: lon.dir,
      narozeni_timezone_form: 'auto',
      narozeni_timezone_dst_form: 'auto',
      house_system: normalizedHouseSystem,
      hid_fortune: 1,
      hid_fortune_check: 'on',
      hid_chiron: 1,
      hid_chiron_check: 'on',
      hid_lilith: 1,
      hid_lilith_check: 'on',
      hid_uzel: 1,
      hid_uzel_check: 'on',
      tolerance: 1,
      tolerance_paral: 1.2,
      ...(birthTimeUnknown ? { narozeni_no_cas: 'on' } : {}),
    }
  }

  private toDegMin(value: number): { deg: number, min: number, dir: number } {
    const abs = Math.abs(value)
    const deg = Math.floor(abs)
    let min = Math.round((abs - deg) * 60)
    let degAdjusted = deg
    if (min === 60) {
      degAdjusted += 1
      min = 0
    }
    const dir = value >= 0 ? 0 : 1
    return { deg: degAdjusted, min, dir }
  }

  private normalizeHouseSystem(houseSystem?: string): string {
    if (!houseSystem)
      return 'placidus'
    const v = houseSystem.toLowerCase()
    if (v === 'p' || v === 'placidus')
      return 'placidus'
    return houseSystem
  }
}

export const astroSeekParamBuilder = new AstroSeekParamBuilder()
