import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'paintings'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('reviewed_at', { useTz: true }).defaultTo(null)
    })

    this.defer(async (db) => {
      await db
        .from(this.tableName)
        .update('reviewed_at', '2023-09-01 00:00:00.000000 +00:00')
        .whereNotNull('reviewer_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reviewed_at')
    })
  }
}
