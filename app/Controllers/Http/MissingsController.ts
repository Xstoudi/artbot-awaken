import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { formRequest } from '@melchyore/adonis-form-request/build'
import Painting from 'App/Models/Painting'
import MissingUpdateRequest from 'App/Requests/MissingUpdateRequest'

export default class MissingsController {
  public async index({ response, view }: HttpContextContract) {
    const missing = await Painting.query().whereNull('sensitive').preload('artist').first()
    if (!missing) {
      const counts: { sensitive: boolean | null; count: number }[] = await Database.from(
        'paintings'
      )
        .select(['sensitive', Database.raw('count(*) as count')])
        .groupBy('sensitive')

      const nulled = counts.find((c) => c.sensitive === null)?.count || 0
      const filled = counts.filter((c) => c.sensitive !== null).reduce((a, b) => a + b.count, 0)
      const total = nulled + filled
      const ratio = total === 0 ? 0 : 100 * (filled / total)
      return view.render('missings/index', {
        ratio: ratio.toFixed(2),
      })
    }
    return response.redirect().toRoute('missings.show', { id: missing.id })
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
    const { id } = request.params()
    const missing = await Painting.findOrFail(id)

    await missing.load('artist')

    const counts: { sensitive: boolean | null; count: string }[] = await Database.from('paintings')
      .select(['sensitive', Database.raw('count(*) as count')])
      .groupBy('sensitive')

    const nulled = Number(counts.find((c) => c.sensitive === null)?.count) || 0
    const filled = counts
      .filter((c) => c.sensitive !== null)
      .reduce((a, b) => a + Number(b.count), 0)
    const total = nulled + filled
    const ratio = total === 0 ? 0 : 100 * (filled / total)
    return view.render('missings/show', {
      missing,
      ratio: ratio.toFixed(2),
    })
  }

  public async edit({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }

  @formRequest()
  public async update({ response }: HttpContextContract, request: MissingUpdateRequest) {
    const { id } = request.params()
    const data = request.validated()

    const painting = await Painting.findOrFail(id)
    painting.sensitive = data.sensitive
    await painting.save()

    return response.redirect().toRoute('missings.index')
  }

  public async destroy({}: HttpContextContract) {
    // TODO
    throw new Error('Not implemented')
  }
}
