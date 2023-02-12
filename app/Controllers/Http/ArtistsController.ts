import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Artist from 'App/Models/Artist'
import { formRequest } from '@melchyore/adonis-form-request/build'
import StoreArtistRequest from 'App/Requests/StoreArtistRequest'
import Mastodon from 'App/Services/Mastodon'
import Painting from 'App/Models/Painting'
import Tag from 'App/Models/Tag'
import sanitizeTag from 'App/Services/SanitizeTag'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

export default class ArtistsController {
  public async index({ view }: HttpContextContract) {
    const artistsData = await Artist.query().whereNull('deleted_at')
    const artists = (
      await Promise.allSettled(
        artistsData.map((artistData) =>
          Mastodon.with(artistData.mastoAccessToken)
            .then((masto) => masto.verifyCredentials())
            .then(async (mastoAccount) => ({
              id: artistData.id,
              mastodon: mastoAccount,
              paintingsCount: await Database.from('paintings')
                .where('artist_id', artistData.id)
                .count('* as count')
                .then(([{ count }]) => count),
            }))
        )
      )
    )
      .filter((artist) => artist.status === 'fulfilled')
      .map((artist: PromiseFulfilledResult<any>) => artist.value)
      .sort((a, b) => (a.mastodon.followersCount > b.mastodon.followersCount ? 1 : -1))

    return view.render('artists/index', {
      artists,
    })
  }

  public async create({ view }: HttpContextContract) {
    return view.render('artists/create')
  }

  @formRequest()
  public async store({ response, session }: HttpContextContract, request: StoreArtistRequest) {
    const data = request.validated()

    const instance = await Mastodon.with(data.mastoAccessToken)

    try {
      await instance.verifyCredentials()
    } catch (error) {
      session.flash('errors', {
        mastoAccessToken: error.message,
      })

      session.flashAll()

      return response.redirect().toRoute('artists.create')
    }
    const artist = await Artist.create(data)

    if (data.tags !== undefined) {
      const tags = await Tag.fetchOrCreateMany(
        'name',
        data.tags
          .split(',')
          .map(sanitizeTag)
          .map((t) => ({ name: t }))
      )
      artist.related('tags').sync(tags.map((t) => t.id))
    }

    return response.redirect().toRoute('artists.index')
  }

  public async show({ view, request }: HttpContextContract) {
    const { id } = request.params()
    const page = request.input('page', 1)

    const artist = await Artist.findOrFail(id)

    await artist.load('tags')

    const paintings = await Painting.query()
      .where('artistId', artist.id)
      .preload('tags')
      .paginate(page, 10)

    paintings.baseUrl(`/artists/${id}`)

    const instance = await Mastodon.with(artist.mastoAccessToken)

    return view.render('artists/show', {
      artist,
      paintings,
      mastodon: await instance.verifyCredentials(),
    })
  }

  public async edit({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }

  public async update({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }

  public async destroy({ request, response }: HttpContextContract) {
    const { id } = request.params()
    const artist = await Artist.findOrFail(id)
    artist.deletedAt = DateTime.now()
    await artist.save()
    return response.redirect().toRoute('artists.index')
  }
}
