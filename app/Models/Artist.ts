import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
  ModelQueryBuilderContract,
  scope,
} from '@ioc:Adonis/Lucid/Orm'
import Painting from './Painting'
import Tag from './Tag'
import Database from '@ioc:Adonis/Lucid/Database'

type Builder = ModelQueryBuilderContract<typeof Artist>

export default class Artist extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasMany(() => Painting)
  public paintings: HasMany<typeof Painting>

  @column()
  public name: string

  @column()
  public mastoAccessToken: string

  @column()
  public wikiartIdentifier: string

  @column()
  public wikiartSeo: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @column.dateTime()
  public deletedAt: DateTime

  @manyToMany(() => Tag)
  public tags: ManyToMany<typeof Tag>

  public static withMissingReviewCount = scope((query: Builder, artistId: number) => {
    query.select([
      Database.from('paintings').count('* AS total').where('artist_id', artistId),
      Database.from('paintings')
        .count('* AS reviewed')
        .where('artist_id', artistId)
        .whereNotNull('reviewer_id'),
    ])
  })
}
