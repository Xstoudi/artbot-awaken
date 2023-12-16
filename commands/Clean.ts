import { BaseCommand } from '@adonisjs/core/build/standalone'
import Drive from '@ioc:Adonis/Core/Drive'

export default class Clean extends BaseCommand {
  public static commandName = 'clean'
  public static description = 'Clean temp folder'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const toDeletes = await Drive.list('.').toArray()
    this.logger.info(`Run clean up routine.`)
    try {
      await Promise.allSettled(toDeletes.map(item => Drive.delete(item.location)))
      this.logger.info(`Deleted ${toDeletes.length} files.`)
    } catch (error) {
      this.logger.error(`Failed to delete, ${error}`)
    }
  }
}
