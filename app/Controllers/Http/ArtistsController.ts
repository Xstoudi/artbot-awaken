import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Artist from 'App/Models/Artist'
import { formRequest } from '@melchyore/adonis-form-request/build'
import StoreArtistRequest from 'App/Requests/StoreArtistRequest'
import Mastodon from 'App/Services/Mastodon'
import Tag from 'App/Models/Tag'
import sanitizeTag from 'App/Services/SanitizeTag'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import execa from 'execa'

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
              name: artistData.name,
              mastodon: mastoAccount,
              paintingsCount: await Database.from('paintings')
                .where('artist_id', artistData.id)
                .count('id as count')
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

    const paintings = await artist
      .related('paintings')
      .query()
      .preload('tags')
      .preload('reviewer')
      .paginate(page, 10)

    paintings.baseUrl(`/artists/${id}`)

    const instance = await Mastodon.with(artist.mastoAccessToken)

    const totalCount: { count: string } | null = await Database.from('paintings')
      .select(Database.raw('count(id) as count'))
      .where('artist_id', artist.id)
      .first()
    const reviewedCount: { count: string } | null = await Database.from('paintings')
      .select(Database.raw('count(id) as count'))
      .where('artist_id', artist.id)
      .andWhereNotNull('reviewer_id')
      .first()

    const total = totalCount !== null ? Number(totalCount.count) : 0
    const reviewed = reviewedCount !== null ? Number(reviewedCount.count) : 0

    const ratio = total === 0 ? 0 : 100 * (reviewed / total)

    return view.render('artists/show', {
      artist,
      paintings,
      mastodon: await instance.verifyCredentials(),
      missingRatio: ratio.toFixed(2),
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

  public async toot({ request, response }: HttpContextContract) {
    const { id } = request.params()
    try {
      await execa.node('ace', ['toot', '-a', id], {
        stdio: 'inherit',
      })
    } catch (error) {
      // TODO handle error
      console.log(error)
    }
    // TODO handle success

    console.log('success')

    return response.redirect().back()
  }
}
