import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import logger from '#logger'
import { parse as yamlParse } from 'yaml'

import type { ConfigData } from '#config/types'
import type { PartialDeep } from 'type-fest'
import { SUPPORTED_LOCALES } from '#services/locales/index'

const CONFIG_FILE_NAME = 'vmcli'

export const loadConfig = async (): Promise<ConfigData> => {
    const path = process.env['CONFIG_DIR'] ?? '/config/'
    // Check yaml config file
    const fileData = await loadYamlConfig(path) || await loadJsonConfig(path)
    if(!fileData){
      logger.warn(`No configuration file found in ${path}`)
    }
    logger.debug('Loaded configuration file data:', fileData)
    const envData = loadEnvConfig()
    logger.debug('Loaded environment configuration data:', envData)
    const data: PartialDeep<ConfigData> = mergeConfig(fileData ?? {}, envData)
    logger.debug('Loaded configuration data:', data)
    return checkConfig(data)
}

const loadYamlConfig = async (path: string): Promise<PartialDeep<ConfigData> | undefined> =>  {
  const yamlConfigPath = join(path, `${CONFIG_FILE_NAME}.yaml`)
  if(!existsSync(yamlConfigPath)){
    return undefined
  }
  const file = await readFile(yamlConfigPath)
  const data = yamlParse(file.toString())
  return ({
    ...data,
    directories: {
      music: normalizeArray(data.directories?.music)
    }
  }) as PartialDeep<ConfigData>
}

const loadJsonConfig = async (path: string): Promise<PartialDeep<ConfigData> | undefined> =>  {
  const jsonConfigPath = join(path, `${CONFIG_FILE_NAME}.json`)
  if(!existsSync(jsonConfigPath)){
    return undefined
  }
  const file = await readFile(jsonConfigPath)
  const data = JSON.parse(file.toString())
  return ({
    ...data,
    directories: {
      music: normalizeArray(data.directories?.music)
    }
  }) as PartialDeep<ConfigData>
}

const loadEnvConfig = (): PartialDeep<ConfigData> => {
  const sources = process.env['LOCALES_SOURCES']?.split(',')
  const target = process.env['LOCALES_TARGET']
  const musicDirectories = process.env['MUSIC_DIRECTORIES']?.split(',') ?? []

  return {
    locales: {
      ...(sources !== undefined && { sources }),
      ...(target !== undefined && { target }),
    },
    directories: {
      music: musicDirectories
    }
  }
}

const mergeConfig = <T>(...configs: Array<PartialDeep<T>>): PartialDeep<T> => {
  const config: PartialDeep<T> = {} as PartialDeep<T>;
  for(const conf of configs){
    // For each attribute, if it is a subObject then merge it, otherwise overwrite it
    for(const key in conf){
      const value = conf[key]
      const type = typeof value
      if(type === 'object' && value !== null && !Array.isArray(value)){
        config[key] = mergeConfig(config[key] ?? {}, conf[key] ?? {}) as PartialDeep<T>[Extract<keyof PartialDeep<T>, string>]
      }
      else if(conf[key] != undefined){
        //Override if the value if
        // value is a string and not empty
        // is an array and not empty
        // is another type
        if((type === 'string' && value !== '') || (Array.isArray(value) && value.length > 0) || (type !== 'string' && !Array.isArray(value))){
          config[key] = conf[key]
        }
      }
    }
  }
  return config as PartialDeep<T>
}

const checkConfig = (data: PartialDeep<ConfigData>): ConfigData => {
  checkLocalesConfig(data)
  checkDirectoriesConfig(data)

  // Filter out unsupported locales from sources and use default values
  return {
    locales: {
      sources: data.locales!.sources!.filter(locale => SUPPORTED_LOCALES.includes(locale)),
      target: data.locales!.target
    },
    directories: data.directories ?? []
  } as ConfigData
}

const checkLocalesConfig = (data: PartialDeep<ConfigData>): void => {
  if(data.locales?.sources == null || data.locales.sources.length < 1){
    throw new Error('No locales sources defined')
  }
  const nbSupportedLocales = data.locales.sources.filter(locale => SUPPORTED_LOCALES.includes(locale)).length
  if(nbSupportedLocales < 1){
    throw new Error(`No supported locales found in sources: [${data.locales.sources.join(', ')}], supported locales are: ${SUPPORTED_LOCALES.join(', ')}`)
  }
  const unsupportedLocales = data.locales.sources.filter(locale => !SUPPORTED_LOCALES.includes(locale))
  if(unsupportedLocales?.length > 0){
    logger.warn(`Unsupported locales found in sources: [${unsupportedLocales.join(', ')}], will be ignored. Supported locales are: ${SUPPORTED_LOCALES.join(', ')}`)
  }

  if(!data.locales?.target){
    throw new Error('No locales target defined')
  }
  if(!SUPPORTED_LOCALES.includes(data.locales.target)){
    throw new Error(`Locales target ${data.locales.target} is not supported, supported locales are: ${SUPPORTED_LOCALES.join(', ')}`)
  }
}

const checkDirectoriesConfig = (data: PartialDeep<ConfigData>): void => {
  checkDirectoryList('music', data.directories?.music)
}

const checkDirectoryList = (name: string, directories?: string[]): void => {
  if(directories == null || directories.length < 1){
    throw new Error(`No directories defined for ${name}`)
  }
  // Check if directories exist
  const existingDirectories = directories.filter(dir => existsSync(dir))
  if(existingDirectories.length < 1){
    throw new Error(`No existing directories for ${name} found in: [${directories.join(', ')}]`)
  }
  const nonExistingDirectories = directories.filter(dir => !existsSync(dir))
  if(nonExistingDirectories.length > 0){
    logger.warn(`Non-existing directories found for ${name} in: [${nonExistingDirectories.join(', ')}], will be ignored.`)
  }
}

const normalizeArray = (arr: string[] | string | undefined): string[] => {
  if(arr === undefined){
    return []
  }
  if(Array.isArray(arr)){
    return arr
  }
  return [arr]
}
