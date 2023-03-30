import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Artist from 'App/Models/Artist'
import Mastodon from 'App/Services/Mastodon'

export default class IndicesController {
  public async index({ view }: HttpContextContract) {
    const artistsData = await Artist.query().whereNull('deleted_at')

    const artists = (
      await Promise.allSettled(
        artistsData.map((artistData) =>
          Mastodon.with(artistData.mastoAccessToken)
            .then((masto) => masto.verifyCredentials())
            .then(async (mastoAccount) => ({
              id: artistData.id,
              name: artistData.name,
              mastodon: mastoAccount,
            }))
            .catch(() => {
              console.log(
                `Something failed for ${artistData.name} (${artistData.id}) with token ${artistData.mastoAccessToken}`
              )
              return null
            })
        )
      )
    )
      .filter((artist) => artist.status === 'fulfilled')
      .map((artist: PromiseFulfilledResult<any>) => artist.value)
      .sort((a, b) => (a.mastodon.followersCount > b.mastodon.followersCount ? 1 : -1))

    return view.render('index', { artists })
  }
}
