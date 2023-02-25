import { BaseCommand, flags } from '@adonisjs/core/build/standalone'
import Database from '@ioc:Adonis/Lucid/Database'
import Drive from '@ioc:Adonis/Core/Drive'
import Artist from 'App/Models/Artist'
import Painting from 'App/Models/Painting'
import axios from 'axios'
import Mastodon from 'App/Services/Mastodon'
import { WIKIART_BASE_URL } from 'App/Services/Wikiart'
import { DateTime } from 'luxon'

export default class Toot extends BaseCommand {
  public static commandName = 'toot'
  public static description = 'Send toot to Mastodon'

  @flags.number({
    alias: 'a',
    name: 'Artist identifier',
    description: 'Artist identifier in database for whom to tweet',
  })
  public artist: number

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    if (this.artist === undefined) {
      const artists = await Artist.query().whereNull('deleted_at')
      for (const artist of artists) {
        await this.handleArtist(artist)
      }
    } else {
      const artist = await Artist.query().where('id', this.artist).whereNull('deleted_at').first()
      if (artist === null) {
        this.logger.error(`No artist found for id ${this.artist}`)
        this.exitCode = 1
        return
      }
      await this.handleArtist(artist)
    }
  }

  private async handleArtist(artist: Artist) {
    const painting = await this.pickPainting(artist)
    if (painting === null) {
      this.logger.error(`No painting found for artist ${artist.wikiartSeo}`)
      this.exitCode = 2
      return
    }

    this.logger.info(`Tooting for artist ${artist.wikiartSeo}`)
    await this.downloadPaintingImage(painting)
    await this.sendToot(artist, painting)
    await this.updatePainting(painting)
  }

  private pickPainting(artist: Artist): Promise<Painting | null> {
    return Painting.query()
      .from(
        Database.from('paintings')
          .where('artist_id', artist.id)
          .andWhere('banned', false)
          .andWhereNotNull('reviewer_id')
          .orderByRaw('posted_at ASC NULLS FIRST, RANDOM()')
          .limit(20)
          .as('painting_pool')
      )
      .orderByRaw('RANDOM()')
      .limit(1)
      .first()
  }

  private async downloadPaintingImage(painting: Painting) {
    const response = await axios(painting.imageUrl, { responseType: 'stream' })
    await Drive.putStream(this.paintingLocation(painting.id), response.data)
  }

  private async sendToot(artist: Artist, painting: Painting) {
    const description = `${painting.title}${
      painting.completitionYear === null ? '' : `, ${painting.completitionYear}`
    } by ${artist.name}`

    const mastodon = await Mastodon.with(artist.mastoAccessToken)
    const mediaAttachement = await mastodon.uploadMedia(
      new Blob([await Drive.get(this.paintingLocation(painting.id))]),
      description
    )

    const sensitive = painting.contentWarning !== null
    const contentWarning = sensitive ? `[CW: ${painting.contentWarning}]\n` : ''

    const tags = await painting.related('tags').query().limit(10)
    const tagLine = tags
      .concat(await artist.related('tags').query())
      .map((tag) => tag.name)
      .concat('artbot')
      .map((tag) => `#${tag}`)
      .join(' ')

    await mastodon.toot(
      `${contentWarning}${description}`,
      `${WIKIART_BASE_URL}/${artist.wikiartSeo}/${painting.url}\n${tagLine}`,
      sensitive,
      mediaAttachement
    )
  }

  private async updatePainting(painting: Painting) {
    painting.postedAt = DateTime.now()
    return painting.save()
  }

  private paintingLocation(id: number) {
    return `painting-${id}`
  }
}
