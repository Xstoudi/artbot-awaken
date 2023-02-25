interface CacheValue<T> {
  expiry: number
  data: T
}

export default class ResponseCache<T> {
  private cacheMap = new Map<string, CacheValue<T>>()

  public async getOr(key: string, get: () => Promise<T>) {
    const cached = this.cacheMap.get(key)
    if (!cached || cached.expiry < Date.now()) {
      const data = await get()
      this.cacheMap.set(key, {
        expiry: Date.now() + 1000 * 60 * 60,
        data,
      })
      return data
    }
    return cached.data
  }
}
