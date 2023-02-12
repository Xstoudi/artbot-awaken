import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { FormRequest } from '@ioc:Adonis/Addons/FormRequest'
import StoreArtistValidator from 'App/Validators/StoreArtistValidator'

export default class StoreArtistRequest extends FormRequest {
  constructor(protected context: HttpContextContract) {
    super(context)
  }

  public async authorize() {
    return true
  }

  public rules() {
    return StoreArtistValidator
  }

  protected async before() {}

  protected async after() {}
}
