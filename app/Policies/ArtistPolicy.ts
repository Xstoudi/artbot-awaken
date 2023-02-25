import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'

export default class ArtistPolicy extends BasePolicy {
  public async create() {
    return false
  }

  public async delete() {
    return false
  }

  public async toot() {
    return false
  }

  public async before(user: User | null) {
    if (user && user.isAdmin) return true
  }
}
