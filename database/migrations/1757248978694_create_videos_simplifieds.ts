import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'videos'

  public async up () {
    // Drop the existing table if it exists
    // this.schema.dropTableIfExists(this.tableName)
    
    // Create the enhanced table with additional fields
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')                             // Auto-increment primary key
      table.string('video_id').notNullable()             // Bunny.net video ID
      table.string('library_id').notNullable()           // Bunny.net library ID  
      table.string('title').defaultTo('Untitled Video')  // Video title
      table.string('is_finished').defaultTo('uploading') // Processing status (uploading, processing, success, failed)
      table.integer('processing_status').defaultTo(0)    // Numeric status (0-5)
      table.json('metadata').nullable()                  // Additional metadata from Bunny.net
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
