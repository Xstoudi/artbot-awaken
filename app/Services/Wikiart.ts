import axios, { AxiosInstance } from 'axios'

import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'

export const WIKIART_BASE_URL = 'https://www.wikiart.org/en'
const API_URL = `${WIKIART_BASE_URL}/Api/2`

export default class Wikiart {
  private static cachedSession: string | null = null

  private static remainingRequests = 0
  private static startTime = 0

  private static async timeCheck() {
    if (Wikiart.startTime === 0 || Date.now() - Wikiart.startTime > 2500) {
      Wikiart.startTime = Date.now()
      Wikiart.remainingRequests = 10
    }

    if (Wikiart.remainingRequests === 0) {
      const diff = Date.now() - Wikiart.startTime
      await new Promise((resolve) => setTimeout(resolve, 2500 - diff))
      Wikiart.remainingRequests = 10
      Wikiart.startTime = Date.now()
    }

    Wikiart.remainingRequests--
  }

  private static async newSession() {
    await Wikiart.timeCheck()
    const { data } = await axios.get(`${API_URL}/login`, {
      params: {
        accessCode: Env.get('WIKIART_ACCESS_CODE'),
        secretCode: Env.get('WIKIART_SECRET_CODE'),
      },
    })
    Wikiart.cachedSession = data.SessionKey
  }

  public static async getInstance() {
    if (Wikiart.cachedSession === null) {
      try {
        await Wikiart.newSession()
        Logger.info(`New session: ${Wikiart.cachedSession}`)
      } catch (error) {
        Logger.error('Fail to retrieve new Wikiart session', error.toJSON())
        throw error
      }
    }

    return new Wikiart(axios.create())
  }

  private constructor(private instance: AxiosInstance) {
    this.instance.interceptors.response.use(undefined, async (error) => {
      const { config } = error
      if (!error.response.data.Exception.Message.includes('limit')) {
        Logger.error('Wikiart error', error.toJSON())
        return Promise.reject(error)
      }

      Logger.info('Wikiart limit reached, generating new session')

      // generate new session and retry
      await Wikiart.newSession()
      config.params.authSessionKey = Wikiart.cachedSession
      return this.instance.request(config)
    })
  }

  public paintings(artistId: string) {
    const instance = this.instance
    return {
      async *[Symbol.asyncIterator](): AsyncGenerator<PaintingShort> {
        let hasMore = true
        let paginationToken: string | null = null
        while (hasMore) {
          try {
            const params =
              paginationToken === null
                ? {
                    id: artistId,
                    authSessionKey: Wikiart.cachedSession,
                  }
                : {
                    id: artistId,
                    authSessionKey: Wikiart.cachedSession,
                    paginationToken: decodeURIComponent(paginationToken),
                  }

            await Wikiart.timeCheck()
            const response = await instance.get<ListWithPagination<PaintingShort>>(
              `${API_URL}/PaintingsByArtist`,
              {
                params,
              }
            )

            hasMore = response.data.hasMore
            paginationToken = response.data.paginationToken

            for (const painting of response.data.data) {
              yield painting
            }
          } catch (error) {
            Logger.error('Wikiart error while retrieving paintings', error.toJSON())
            hasMore = false
          }
        }
      },
    }
  }

  public async painting(id: string) {
    await Wikiart.timeCheck()
    return this.instance
      .get<Painting>(`${API_URL}/Painting`, {
        params: {
          id,
          authSessionKey: Wikiart.cachedSession,
        },
      })
      .catch((error) => {
        Logger.error('Wikiart error while retrieving painting', error.toJSON())
        throw error
      })
  }
}
