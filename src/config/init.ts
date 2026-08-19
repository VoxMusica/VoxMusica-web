import dotenv from "dotenv"
import logger from '#logger.ts'
import { Config } from "#config/config.ts"


export const initConfig = async () => {
  dotenv.config()
  if(process.env.LOG_LEVEL){
    logger.level = process.env.LOG_LEVEL
  }
  logger.info('Initializing configuration...')
  const config = Config.instance.load()
  await config;
}


