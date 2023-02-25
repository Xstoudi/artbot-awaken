import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { FormRequest } from '@ioc:Adonis/Addons/FormRequest'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class CreateUserRequest extends FormRequest {
  constructor(protected context: HttpContextContract) {
    super(context)
  }

  /**
   * Determine if the user is authorized to make the incoming request.
   * Can be safely deleted if you don't have any authorization logic.
   */
  public async authorize() {
    return this.context.bouncer.with('UserPolicy').allows('create')
  }

  /**
   * Validation rules.
   * Can also return a Validator class.
   */
  public rules() {
    return CreateUserValidator
  }

  /**
   * Before hook to be executed before validation.
   */
  protected async before() {}

  /**
   * After hook to be executed after successful validation.
   */
  protected async after() {}
}
