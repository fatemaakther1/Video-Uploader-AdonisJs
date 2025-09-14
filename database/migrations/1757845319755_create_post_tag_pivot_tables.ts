import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreatePostTagPivotTables extends BaseSchema {
  protected tableName = 'post_tag' // Pivot table for @manyToMany relationship

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Foreign keys for many-to-many relationship
      table.integer('post_id').unsigned().notNullable()
           .references('id').inTable('posts').onDelete('CASCADE')
      
      table.integer('tag_id').unsigned().notNullable()
           .references('id').inTable('tags').onDelete('CASCADE')
      
      // Ensure unique combinations (no duplicate relationships)
      table.unique(['post_id', 'tag_id'])
      
      // Optional: Add metadata to pivot table
      table.integer('sort_order').defaultTo(0) // For ordering tags
      table.boolean('is_primary').defaultTo(false) // Mark primary tag
      
      table.timestamp('created_at', { useTz: true }).nullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
