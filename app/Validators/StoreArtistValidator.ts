import { schema, CustomMessages } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class StoreArtistValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    mastoAccessToken: schema.string({ trim: true }),
    wikiartIdentifier: schema.string({ trim: true }),
    wikiartSeo: schema.string({ trim: true }),
    tags: schema.string.optional({ trim: true }),
  })

  public messages: CustomMessages = {
    'mastoAccessToken.required': 'Mastodon access token is required',
    'wikiartIdentifier.required': 'Wikiart identifier is required',
  }
}
