import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { FormRequest } from '@ioc:Adonis/Addons/FormRequest'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'

export default class ChangePasswordRequest extends FormRequest {
  constructor(protected context: HttpContextContract) {
    super(context)
  }

  public async authorize() {
    return this.context.auth.user?.id === Number(this.context.params.id)
  }

  public rules() {
    return ChangePasswordValidator
  }

  protected async before() {}

  protected async after() {}
}
