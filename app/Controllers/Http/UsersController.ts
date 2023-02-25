import Hash from '@ioc:Adonis/Core/Hash'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { formRequest } from '@melchyore/adonis-form-request/build'
import User from 'App/Models/User'
import ChangePasswordRequest from 'App/Requests/ChangePasswordRequest'
import CreateUserRequest from 'App/Requests/CreateUserRequest'

export default class UsersController {
  public async index({ bouncer, view }: HttpContextContract) {
    await bouncer.with('UserPolicy').authorize('viewList')
    const users = await User.all()
    return view.render('users/index', { users })
  }

  public async show({ request, view, bouncer }: HttpContextContract) {
    const { id } = request.params()
    const user = await User.findOrFail(id)

    await bouncer.with('UserPolicy').authorize('view', user)

    return view.render('users/show', { user })
  }

  @formRequest()
  public async store({ response }: HttpContextContract, request: CreateUserRequest) {
    const { email, password } = request.validated()
    const user = new User()
    user.email = email
    user.password = password
    await user.save()
    return response.redirect().toRoute('users.index')
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

  public async destroy({ request, bouncer, response }: HttpContextContract) {
    const { id } = request.params()
    const user = await User.findOrFail(id)
    await bouncer.with('UserPolicy').authorize('delete', user)
    await user.delete()
    return response.redirect().toRoute('users.index')
  }
}
