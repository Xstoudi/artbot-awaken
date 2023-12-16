import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { formRequest } from '@melchyore/adonis-form-request/build'
import Painting from 'App/Models/Painting'
import MissingUpdateRequest from 'App/Requests/MissingUpdateRequest'
import { DateTime } from 'luxon'

export default class MissingsController {
  public async index({ response, request, view }: HttpContextContract) {
    const { artistId } = request.params()
    const missing = await Painting.query()
      .whereNull('reviewer_id')
      .where('artist_id', artistId)
      .first()

    if (!missing) {
      const totalCount: { count: string } | null = await Database.from('paintings')
        .select(Database.raw('count(id) as count'))
        .where('artist_id', artistId)
        .first()
      const reviewedCount: { count: string } | null = await Database.from('paintings')
        .select(Database.raw('count(id) as count'))
        .where('artist_id', artistId)
        .andWhereNotNull('reviewer_id')
        .first()

      const total = totalCount !== null ? Number(totalCount.count) : 0
      const reviewed = reviewedCount !== null ? Number(reviewedCount.count) : 0

      const ratio = total === 0 ? 0 : 100 * (reviewed / total)

      return view.render('missings/index', {
        ratio: ratio.toFixed(2),
      })
    }

    return response.redirect().toRoute('missings.show', { artistId, paintingId: missing.id })
  }

  public async create({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }

  public async store({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }

  public async show({ request, view }: HttpContextContract) {
    const { artistId, paintingId } = request.params()
    const missing = await Painting.findOrFail(paintingId)

    await missing.load('artist')

    const totalCount: { count: string } | null = await Database.from('paintings')
      .select(Database.raw('count(id) as count'))
      .where('artist_id', artistId)
      .first()
    const reviewedCount: { count: string } | null = await Database.from('paintings')
      .select(Database.raw('count(id) as count'))
      .where('artist_id', artistId)
      .andWhereNotNull('reviewer_id')
      .first()

    const total = totalCount !== null ? Number(totalCount.count) : 0
    const reviewed = reviewedCount !== null ? Number(reviewedCount.count) : 0

    const ratio = total === 0 ? 0 : 100 * (reviewed / total)

    return view.render('missings/show', {
      artistId,
      missing,
      ratio: ratio.toFixed(2),
    })
  }

  public async edit({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }

  @formRequest()
  public async update({ response, auth }: HttpContextContract, request: MissingUpdateRequest) {
    const { artistId, paintingId } = request.params()
    const data = request.validated()

    const painting = await Painting.findOrFail(paintingId)
    painting.banned = data.banned || false
    painting.contentWarning = data.contentWarning || null
    painting.reviewedAt = DateTime.now()

    await painting.save()
    await painting.related('reviewer').associate(auth.user!)

    return response.redirect().toRoute('missings.index', [artistId])
  }

  public async destroy({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }
}
