import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Logger from '@ioc:Adonis/Core/Logger'

export default class AuthController {
  public async index({ view }: HttpContextContract) {
    return view.render('auth/login')
  }
  public async login({ auth, request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      await auth.attempt(email, password)
      return response.redirect().toRoute('artists.index')
    } catch (error) {
      Logger.error(error)
      return response.redirect().toRoute('auth.index')
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()
    return response.redirect().toRoute('auth.index')
  }
}
