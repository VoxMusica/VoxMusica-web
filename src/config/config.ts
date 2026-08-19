import logger from '#logger.ts'
import { exit } from 'node:process'
import { loadConfig } from '#config/config-loader.ts'
import type { ConfigData, Directories, Locales } from '#config/types.ts'

export class Config implements ConfigData   {
  static readonly #instance: Config = new Config()
  #isLoaded: boolean = false

  #locales?: Locales
  #directories?: Directories

  public static get instance(): Config {
    return Config.#instance
  }

  public get locales(): Locales {
    if (!this.#locales) {
      throw new Error('Locales not initialized')
    }
    return this.#locales
  }
  public get directories(): Directories {
    if (!this.#directories) {
      throw new Error('Directories not initialized')
    }
    return this.#directories
  }

  public async load(): Promise<void> {
    if(this.#isLoaded){
      logger.info('Configuration already loaded')
      return
    }

    try{
      const data = await loadConfig()

      this.#locales = data.locales
      this.#directories = data.directories
    
      this.#isLoaded = true
    } catch (error) {
      logger.error('Failed to load configuration', error)
      exit(1)
    }
  }
}
