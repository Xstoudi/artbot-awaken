import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Painting from './Painting'
import Tag from './Tag'

export default class Artist extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @hasMany(() => Painting)
  public paintings: HasMany<typeof Painting>

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
}
