import masto from 'masto'
import Env from '@ioc:Adonis/Core/Env'

type MastoClient = Awaited<ReturnType<typeof masto.login>>

export default class Mastodon {
  private static cachedInstances: Map<string, Mastodon> = new Map()

  public static async with(accessToken: string) {
    if (this.cachedInstances.has(accessToken)) {
      return this.cachedInstances.get(accessToken)!
    }

    const instance = await masto.login({
      url: Env.get('MASTODON_URL'),
      accessToken,
    })

    const serviceInstance = new Mastodon(instance)

    this.cachedInstances.set(accessToken, serviceInstance)

    return serviceInstance
  }

  private constructor(private mastoInstance: MastoClient) {}

  public verifyCredentials() {
    return this.mastoInstance.v1.accounts.verifyCredentials()
  }
}
