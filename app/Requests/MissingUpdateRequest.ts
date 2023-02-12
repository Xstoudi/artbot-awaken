import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { FormRequest } from '@ioc:Adonis/Addons/FormRequest'
import MissingUpdateValidator from 'App/Validators/MissingUpdateValidator'

export default class MissingUpdateRequest extends FormRequest {
  constructor(protected context: HttpContextContract) {
    super(context)
  }

  public async authorize() {
    return true
  }

  public rules() {
    return MissingUpdateValidator
  }

  protected async before() {}

  protected async after() {}
}
