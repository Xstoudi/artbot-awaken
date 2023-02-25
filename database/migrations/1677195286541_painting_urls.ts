import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'paintings'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('url').notNullable().defaultTo('-- MISSING --')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('url')
    })
  }
}
