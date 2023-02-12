import I18n from '@ioc:Adonis/Addons/I18n'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class DetectUserLocale {
  protected getUserLanguage(ctx: HttpContextContract) {
    const availableLocales = I18n.supportedLocales()
    return ctx.request.language(availableLocales) || ctx.request.input('lang')
  }

  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const language = this.getUserLanguage(ctx)

    if (language) {
      ctx.i18n.switchLocale(language)
    }

    if ('view' in ctx) {
      ctx.view.share({ i18n: ctx.i18n })
    }

    await next()
  }
}
