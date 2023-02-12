import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'painting_tag'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('tag_id').unsigned().references('id').inTable('tags').onDelete('CASCADE')
      table
        .integer('painting_id')
        .unsigned()
        .references('id')
        .inTable('paintings')
        .onDelete('CASCADE')

      table.unique(['tag_id', 'painting_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
