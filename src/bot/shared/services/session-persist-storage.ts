import type { Context } from '#root/bot/context.js'
import type { PersistStorage } from '#root/shared/index.js'

export class SessionPersistService implements PersistStorage {
  constructor(private readonly ctx: Context) { }

  public get(key: string): string | null {
    const value = (this.ctx.session as Record<string, unknown>)[key]
    if (value === undefined || value === null)
      return null

    if (typeof value === 'object')
      return JSON.stringify(value)

    return String(value)
  }

  public getAsString(key: string): string {
    const value = this.get(key)
    if (value === null) {
      throw new Error(`Key "${key}" not found in session`)
    }
    return value
  }

  public getAsInt(key: string): number {
    const value = this.getAsString(key)
    const parsed = Number.parseInt(value, 10)
    if (Number.isNaN(parsed)) {
      throw new TypeError(`Key "${key}" is not a valid integer`)
    }
    return parsed
  }

  public getAsFloat(key: string): number {
    const value = this.getAsString(key)
    const parsed = Number.parseFloat(value)
    if (Number.isNaN(parsed)) {
      throw new TypeError(`Key "${key}" is not a valid float`)
    }
    return parsed
  }

  public getAsBoolean(key: string): boolean {
    const value = this.getAsString(key)
    if (value === 'true')
      return true
    if (value === 'false')
      return false
    throw new Error(`Key "${key}" is not a valid boolean`)
  }

  public getAsObject<T extends object = object>(key: string): T {
    const sessionValue = (this.ctx.session as Record<string, unknown>)[key]
    if (sessionValue === undefined || sessionValue === null)
      throw new Error(`Key "${key}" not found in session`)

    if (typeof sessionValue === 'object')
      return sessionValue as T

    const value = this.getAsString(key)
    try {
      return JSON.parse(value) as T
    }
    catch {
      throw new Error(`Key "${key}" is not a valid JSON object`)
    }
  }

  public has(key: string): boolean {
    return key in this.ctx.session
  }

  public set(key: string, value: string): void {
    (this.ctx.session as Record<string, unknown>)[key] = value
  }

  public setPrimitive(key: string, value: number | string | boolean | null): void {
    (this.ctx.session as Record<string, unknown>)[key] = value === null ? null : String(value)
  }

  public setObject(key: string, value: object): void {
    (this.ctx.session as Record<string, unknown>)[key] = value
  }

  public remove(key: string): void {
    delete (this.ctx.session as Record<string, unknown>)[key]
  }

  public clear(): void {
    for (const key of Object.keys(this.ctx.session)) {
      this.remove(key)
    }
  }
}
