import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AdminAuthMiddleware {
  protected redirectTo = '/artists'

  protected async authenticate(auth: HttpContextContract['auth']) {
    if (auth.user === undefined || !auth.user.isAdmin)
      throw new AuthenticationException('Unauthorized access', 'E_UNAUTHORIZED_ACCESS')
  }

  public async handle({ auth }: HttpContextContract, next: () => Promise<void>) {
    await this.authenticate(auth)
    await next()
  }
}
