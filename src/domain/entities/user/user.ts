export class User {
  id?: string
  email?: string

  provider?: string

  socialId?: string

  firstName?: string

  lastName?: string

  birthDateTime?: string

  timezone?: string

  photo?: any

  latitude?: number

  longitude?: number

  zodiacId?: number
  // TODO: добавить transformer который сразу преобразует в Date
  createdAt: string

  // TODO: добавить transformer который сразу преобразует в Date
  updatedAt: string
}
