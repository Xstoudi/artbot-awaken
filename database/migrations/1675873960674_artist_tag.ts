import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'artist_tag'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table.integer('tag_id').unsigned().references('id').inTable('tags').onDelete('CASCADE')
      table.integer('artist_id').unsigned().references('id').inTable('artists').onDelete('CASCADE')

      table.unique(['tag_id', 'artist_id'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
