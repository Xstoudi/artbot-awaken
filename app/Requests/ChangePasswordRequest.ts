import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { FormRequest } from '@ioc:Adonis/Addons/FormRequest'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'
import User from 'App/Models/User'

export default class ChangePasswordRequest extends FormRequest {
  constructor(protected context: HttpContextContract) {
    super(context)
  }

  public async authorize() {
    const { id } = this.context.request.params()
    const user = await User.findOrFail(id)
    return this.context.bouncer.with('UserPolicy').allows('update', user)
  }

  public rules() {
    return ChangePasswordValidator
  }

  protected async before() {}

  protected async after() {}
}
