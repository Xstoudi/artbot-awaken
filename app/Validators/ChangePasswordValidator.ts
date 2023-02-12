import { schema, rules, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChangePasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    oldPassword: schema.string(),
    password: schema.string(),
    passwordConfirmation: schema.string({}, [rules.confirmed('password')]),
  })

  public messages: CustomMessages = {}
}
