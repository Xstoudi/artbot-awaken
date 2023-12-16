import { TaskContract } from '@ioc:StouderIO/Scheduler'
import execa from 'execa'
import Logger from '@ioc:Adonis/Core/Logger'

export default class Cleanup implements TaskContract {
  public readonly name: string = 'Cleanup'
  public readonly cron: string = '0 0 * * *'

  public async run(): Promise<void> {
    try {
      await execa.node('ace', ['clean'], { stdio: 'inherit' })
    } catch (err) {
      Logger.error('Error while cleaning up', err)
    }
  }
}
