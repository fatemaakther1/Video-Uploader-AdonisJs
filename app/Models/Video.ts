import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Video extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({ columnName: 'video_id' })
  public videoId: string

  @column({ columnName: 'library_id' })
  public libraryId: string

  @column()
  public title: string

  @column({ columnName: 'is_finished' })
  public isFinished: string

  @column({ columnName: 'processing_status' })
  public processingStatus: number

  @column({ columnName: 'playable_link' })
  public playableLink: string | null
}
