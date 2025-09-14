import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateTagsTables extends BaseSchema {
  protected tableName = 'tags'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      table.string('name').notNullable().unique()
      table.string('slug').notNullable().unique()
      table.string('color').defaultTo('#007bff') // For UI styling
      table.text('description').nullable()
      table.integer('posts_count').defaultTo(0) // Cache count for performance
      
      table.timestamp('created_at', { useTz: true }).nullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
