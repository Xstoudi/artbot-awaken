import { BaseCommand } from '@adonisjs/core/build/standalone'
import Database, { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'
import Logger from '@ioc:Adonis/Core/Logger'
import Artist from 'App/Models/Artist'
import Painting from 'App/Models/Painting'
import Tag from 'App/Models/Tag'
import sanitizeTag from 'App/Services/SanitizeTag'
import Wikiart from 'App/Services/Wikiart'

export default class FetchPaintings extends BaseCommand {
  public static commandName = 'fetch:paintings'

  public static description = 'Fetch paintings from Wikiart'

  public static settings = {
    loadApp: true,
    stayAlive: true,
  }

  private trx: TransactionClientContract

  public async run() {
    const artists = await Artist.all()

    this.trx = await Database.transaction()
    this.trx.on('commit', () => this.logger.info('Transaction committed'))
    this.trx.on('rollback', () => this.logger.info('Transaction rolled back'))
    for (const artist of artists) {
      await this.fetchPaintings(artist)
    }

    await this.trx.commit()
    await this.exit()
  }

  private async fetchPaintings(artist: Artist) {
    const wikiart = await Wikiart.getInstance()

    let count = 0
    for await (const wikiartPainting of wikiart.paintings(artist.wikiartIdentifier)) {
      const { data: fullPainting } = await wikiart.painting(wikiartPainting.id)
      const tags = await Promise.all(
        [...fullPainting.genres, ...fullPainting.styles, ...fullPainting.tags]
          .filter((s) => s.length !== 0)
          .map((tag) => this.handleTag(tag))
      )

      const painting = await Painting.updateOrCreate(
        { wikiartIdentifier: fullPainting.id },
        {
          artistId: artist.id,
          wikiartIdentifier: fullPainting.id,
          title: fullPainting.title,
          completitionYear: fullPainting.completitionYear,
          imageUrl: fullPainting.image,
        },
        { client: this.trx }
      )

      if (tags.length !== 0) {
        await painting.related('tags').sync(
          tags.map((t) => t.id),
          true,
          this.trx
        )
      }
      count++
      this.logger.info(`Saved painting #${count} of ${artist.wikiartSeo}`)
    }
  }

  private async handleTag(tag: string) {
    const sanitizedTag = sanitizeTag(tag)
    const existingTag = await Tag.firstOrCreate(
      { name: sanitizedTag },
      { name: sanitizedTag },
      { client: this.trx }
    )
    return existingTag
  }
}
