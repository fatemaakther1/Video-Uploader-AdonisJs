import { DateTime } from 'luxon'
import { BaseModel, column, hasOne, hasMany, HasOne, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'
import Post from './Post'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: string

  @column()
  public username: string

  @column({ serializeAs: null })
   // Hide password in JSON responses
  public password: string

  @column({ columnName: 'first_name' })
  public firstName: string

  @column({ columnName: 'last_name' })
  public lastName: string

  @column({ columnName: 'is_active' })
  public isActive: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // **@hasOne relationship**
  // One user has one profile (one-to-one)
  @hasOne(() => Profile, {
    foreignKey: 'userId', // Column in profiles table
  })
  public profile: HasOne<typeof Profile>

  // **@hasMany relationship**
  // One user has many posts (one-to-many)
  @hasMany(() => Post, {
    foreignKey: 'userId', // Column in posts table
  })
  public posts: HasMany<typeof Post>

  // Computed property example
  public get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
