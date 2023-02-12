import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { formRequest } from '@melchyore/adonis-form-request/build'
import User from 'App/Models/User'
import ChangePasswordRequest from 'App/Requests/ChangePasswordRequest'

export default class UsersController {
  public async show({ request, view }: HttpContextContract) {
    const { id } = request.params()

    const user = await User.findOrFail(id)

    return view.render('users/show', { user })
  }

  @formRequest()
  public async changePassword(
    { auth, session, response }: HttpContextContract,
    request: ChangePasswordRequest
  ) {
    const { oldPassword, password } = request.validated()

    if (await Hash.verify(auth.user!.password, oldPassword)) {
      auth.user!.password = password
      await auth.user!.save()
    } else {
      session.flash('errors', {
        oldPassword: 'The old password is incorrect',
      })
    }
    return response.redirect().toRoute('users.show', { id: auth.user!.id })
  }
}
