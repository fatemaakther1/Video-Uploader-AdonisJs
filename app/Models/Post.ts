import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, BelongsTo, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Tag from './Tag'

export default class Post extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'user_id' })
  public userId: number // Foreign key

  @column()
  public title: string

  @column()
  public content: string

  @column()
  public slug: string

  @column({ columnName: 'is_published' })
  public isPublished: boolean

  @column({ columnName: 'view_count' })
  public viewCount: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // **@belongsTo relationship**
  // Post belongs to one user (inverse of @hasMany)
  @belongsTo(() => User, {
    foreignKey: 'userId', // Column in this table (posts)
  })
  public user: BelongsTo<typeof User>

  // **@manyToMany relationship**
  // Post has many tags, and tags have many posts
  @manyToMany(() => Tag, {
    pivotTable: 'post_tag', // Name of the pivot table
    localKey: 'id',         // Primary key of this model (posts.id)
    pivotForeignKey: 'post_id', // Foreign key in pivot table referencing posts
    relatedKey: 'id',       // Primary key of related model (tags.id)
    pivotRelatedForeignKey: 'tag_id', // Foreign key in pivot table referencing tags
    pivotColumns: ['sort_order', 'is_primary'], // Additional pivot columns
    pivotTimestamps: true,  // Include created_at/updated_at in pivot
  })
  public tags: ManyToMany<typeof Tag>
}
