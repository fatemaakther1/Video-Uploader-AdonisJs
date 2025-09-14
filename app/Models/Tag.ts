import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany, beforeSave } from '@ioc:Adonis/Lucid/Orm'
import Post from './Post'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public slug: string

  @column()
  public color: string

  @column()
  public description: string

  @column({ columnName: 'posts_count' })
  public postsCount: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // **@manyToMany relationship**
  // Tag has many posts, and posts have many tags (inverse of Post.tags)
  @manyToMany(() => Post, {
    pivotTable: 'post_tag',
    localKey: 'id',
    pivotForeignKey: 'tag_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'post_id',
    pivotColumns: ['sort_order', 'is_primary'],
    pivotTimestamps: true,
  })
  public posts: ManyToMany<typeof Post>

  // Auto-generate slug from name
  @beforeSave()
  public static async generateSlug(tag: Tag) {
    if (!tag.slug && tag.name) {
      tag.slug = tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
  }
}
