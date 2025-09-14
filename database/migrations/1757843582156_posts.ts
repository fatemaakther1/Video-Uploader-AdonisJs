import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Posts extends BaseSchema {
  protected tableName = 'posts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Foreign key to users table (@belongsTo relationship)
      table.integer('user_id').unsigned().notNullable()
           .references('id').inTable('users').onDelete('CASCADE')
      
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.string('slug').notNullable().unique()
      table.boolean('is_published').defaultTo(false)
      table.integer('view_count').defaultTo(0)
      
      table.timestamp('created_at', { useTz: true }).nullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
