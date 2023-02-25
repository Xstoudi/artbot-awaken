import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'paintings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('artist_id').unsigned().references('id').inTable('artists').onDelete('CASCADE')

      table.string('wikiart_identifier').notNullable().index().unique()

      table.string('title').notNullable()
      table.smallint('completition_year')
      table.string('image_url').notNullable()

      table.string('content_warning').defaultTo(null)
      table.boolean('banned').defaultTo(false)

      table.integer('reviewer_id').unsigned().references('id').inTable('users').onDelete('SET NULL')

      table.timestamp('posted_at', { useTz: true }).defaultTo(null)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
