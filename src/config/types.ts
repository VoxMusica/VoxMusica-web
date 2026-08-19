export interface Locales {
  sources: string[]
  target: string
}

export interface Directories {
  music: string[]
}

export interface ConfigData {
  locales: Locales,
  directories: Directories
}
