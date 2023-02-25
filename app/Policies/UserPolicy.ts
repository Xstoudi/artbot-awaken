import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'

export default class UserPolicy extends BasePolicy {
  public async viewList() {
    return false
  }
  public async view(user: User, target: User) {
    return user.id === target.id
  }
  public async create() {
    return false
  }
  public async update(user: User, target: User) {
    return user.id === target.id
  }
  public async delete(user: User, target: User) {
    return user.id === target.id
  }

  public async before(user: User | null) {
    if (user && user.isAdmin) return true
  }
}
