import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class MissingUpdateValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    sensitive: schema.boolean(),
  })

  public messages: CustomMessages = {}
}
