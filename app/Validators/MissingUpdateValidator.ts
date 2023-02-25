import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MissingUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    contentWarning: schema.string.optional(),
    banned: schema.boolean.optional(),
  })

  public messages: CustomMessages = {}
}
