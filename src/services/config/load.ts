import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import schema from '#services/config/schema'
#services/config/schema

function findConfigFile(): string | null {
  const CONFIG_DIR = process.env.CONFIG_DIR || '/config'

  const candidates = ['config.yaml', 'config.yml', 'config.json'];
  for (const name of candidates) {
    const fullPath = join(CONFIG_DIR, name);
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
}

const loadConfigFile = (filePath: string): Promise<Record<string, unknown>> => {
  const raw = readFileSync(filePath, 'utf-8');
  if (filePath.endsWith('.json')) {
    return JSON.parse(raw);
  }
  return parse(raw) as Record<string, unknown>; // plain read, comments discarded (fine for load-only)
}

export const loadConfig = ()  => {
  const configFile = findConfigFile();
  if (configFile) {
    const fileConfig = loadConfigFile(configFile)
    schema.load(fileConfig)
  }

  schema.validate({ allowed: 'strict' });

  return schema;
}
