import Logger from '@ioc:Adonis/Core/Logger'
import { TaskContract } from '@ioc:StouderIO/Scheduler'
import execa from 'execa'

export default class DailyToot implements TaskContract {
  public readonly name: string = 'DailyToot'
  public readonly cron: string = '30 13 * * *'

  public async run(): Promise<void> {
    try {
      await execa.node('ace', ['toot'], { stdio: 'inherit' })
    } catch (err) {
      Logger.error('Error while daily-tooting', err)
    }
  }
}
