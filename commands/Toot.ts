import { BaseCommand } from '@adonisjs/core/build/standalone'
import Database from '@ioc:Adonis/Lucid/Database'
import Artist from 'App/Models/Artist'
import Painting from 'App/Models/Painting'

export default class Toot extends BaseCommand {
  public static commandName = 'toot'
  public static description = 'Send toot to Mastodon'

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    const artists = await Artist.query().whereNull('deleted_at')
    for (const artist of artists) {
      const painting = await this.pickPainting(artist)
      if (painting === null) {
        this.logger.error(`No painting found for artist ${artist.wikiartSeo}`)
        continue
      }

      painting.
    }
  }

  private pickPainting(artist: Artist): Promise<Painting | null> {
    return Painting.query()
      .from(
        Database.from('paintings')
          .where('artist_id', artist.id)
          .orderByRaw('posted_at ASC NULLS FIRST, RANDOM()')
          .limit(20)
          .as('painting_pool')
      )
      .orderByRaw('RANDOM()')
      .limit(1)
      .first()
  }
}
