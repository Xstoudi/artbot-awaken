import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'artists'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').notNullable().defaultTo('-- MISSING --')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
    })
  }
}
