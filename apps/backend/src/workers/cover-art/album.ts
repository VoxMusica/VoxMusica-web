import type { Logger } from "pino"

export const lookAlbumCover = (albumlId: string, logger: Logger) => {
  logger.info(`Looking for album ${albumlId}`)
  
}
