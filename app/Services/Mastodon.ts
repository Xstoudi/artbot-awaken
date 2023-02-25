import masto from 'masto'
import Env from '@ioc:Adonis/Core/Env'
import Drive from '@ioc:Adonis/Core/Drive'

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

  public async uploadMedia(file: Blob, description: string) {
    return this.mastoInstance.v2.mediaAttachments.create({
      file,
      description,
    })
  }

  public async toot(
    text: string,
    subText: string,
    sensitive: boolean,
    media: Awaited<ReturnType<typeof this.uploadMedia>>
  ) {
    const spoilerText = sensitive ? text : undefined
    const status = sensitive ? subText : `${text}\n\n${subText}`
    return this.mastoInstance.v1.statuses.create({
      spoilerText,
      status,
      visibility: 'public',
      sensitive,
      mediaIds: [media.id],
      language: 'en',
    })
  }
}
