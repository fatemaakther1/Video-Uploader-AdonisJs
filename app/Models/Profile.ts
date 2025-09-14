import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id' })
  public userId: number // Foreign key

  @column()
  public bio: string

  @column({ columnName: 'avatar_url' })
  public avatarUrl: string

  @column()
  public website: string

  @column()
  public location: string

  @column.date({ columnName: 'birth_date' })
  public birthDate: DateTime

  @column({ columnName: 'phone_number' })
  public phoneNumber: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // **@belongsTo relationship**
  // Profile belongs to one user (inverse of @hasOne)
  @belongsTo(() => User, {
    foreignKey: 'userId', // Column in this table (profiles)
  })
  public user: BelongsTo<typeof User>
}
