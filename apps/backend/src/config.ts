import 'dotenv/config'
import { loadConfig } from "#services/config/load"

export const config = loadConfig()
export default config
