import { DateTime } from 'luxon'
import {
  BaseModel,
  BelongsTo,
  belongsTo,
  column,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Artist from './Artist'
import Tag from './Tag'
import User from './User'

export default class Painting extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public artistId: number

  @column()
  public reviewerId: number | null

  @column()
  public wikiartIdentifier: string

  @column()
  public title: string

  @column()
  public completitionYear: number | null

  @column()
  public imageUrl: string

  @column()
  public url: string

  @column()
  public contentWarning: string | null

  @column()
  public banned: boolean

  @column.dateTime()
  public postedAt?: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Artist)
  public artist: BelongsTo<typeof Artist>

  @belongsTo(() => User, { foreignKey: 'reviewerId' })
  public reviewer: BelongsTo<typeof User>

  @manyToMany(() => Tag)
  public tags: ManyToMany<typeof Tag>
}
