import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Artist from './Artist'
import Tag from './Tag'

export default class Painting extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public artistId: number

  @column()
  public wikiartIdentifier: string

  @column()
  public title: string

  @column()
  public completitionYear: number | null

  @column()
  public imageUrl: string

  @column()
  public sensitive: boolean | null

  @column.dateTime()
  public postedAt?: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Artist)
  public artist: BelongsTo<typeof Artist>

  @manyToMany(() => Tag)
  public tags: ManyToMany<typeof Tag>
}
