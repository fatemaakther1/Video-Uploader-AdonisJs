import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Profiles extends BaseSchema {
  protected tableName = 'profiles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Foreign key to users table (@belongsTo relationship)
      // This creates a one-to-one relationship (user @hasOne profile)
      table.integer('user_id').unsigned().notNullable().unique()
           .references('id').inTable('users').onDelete('CASCADE')
      
      table.text('bio').nullable()
      table.string('avatar_url').nullable()
      table.string('website').nullable()
      table.string('location').nullable()
      table.date('birth_date').nullable()
      table.string('phone_number').nullable()
      
      table.timestamp('created_at', { useTz: true }).nullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
