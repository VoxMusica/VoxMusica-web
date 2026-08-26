import convict from 'convict'
import { SUPPORTED_LOCALES } from '#services/locales/index'
import { enumArrayFormat } from '#services/config/format'


type Config = {
  server: {
    port: number,
    host: string,
  },
  logging: {
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
    dir: string
    filename: string,
  },
  data: {
    dir: string,
    filename: string,
  },
  auth: {
    jwtSecret: string,
    tokenExpiry: string | number,
    cookieSecret: string,
  },
  library: {
    music: Record<string, string>
  },
  locales: {
    sources: Array<string>,
    target: string,
  },
  scrobbling: {
    listenbrainzUrl: string
  },
  cache: {
    redis: {
      host: string,
      port: number,
    },
  },
}

const schema = convict<Config>({
  server: {
    port: {
      doc: 'Port to listen on',
      format: 'port',
      default: 4200,
      env: 'PORT',
    },
    host: {
      doc: 'Host to bind to',
      format: String,
      default: '0.0.0.0',
      env: 'HOST',
    },
  },
  logging: {
    level: {
      doc: 'Log level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
      default: 'info',
      env: 'LOG_LEVEL',
    },
    dir: {
      doc: 'Directory to write log files to. If empty, logs go to stdout only.',
      format: String,
      default: '', // empty = stdout-only, matches Docker convention
      env: 'LOG_DIR',
    },
    filename: {
      doc: 'Log filename (only used if logging.dir is set)',
      format: String,
      default: 'vox-musica-server.log',
    },
  },
  data: {
    dir: {
      doc: 'Directory where the data are stored',
      format: String,
      default: '/data',
      env: 'DATA_DIR',
    },
    filename: {
      doc: 'Data filename',
      format: String,
      default: 'voxmusica.db',
    },
  },
  auth: {
    jwtSecret: {
      doc: 'JWT signing secret',
      format: String,
      default: '',
      env: 'JWT_SECRET',
      sensitive: true,
    },
    tokenExpiry: {
      doc: 'JWT expiry',
      format: String,
      default: '7d',
      env: 'JWT_TOKEN_EXPIRY',
    },
    cookieSecret: {
      doc: 'Session cookie secret',
      format: String,
      env: 'SESSION_COOKIE_SECRET',
      default: '',
      sensitive: true,
    }
  },
  library: {
    music: {
      doc: 'Path to music libraries',
      format: Object,
      default: {},
      env: 'MUSIC_DIRS',
    },
  },
  locales: {
    sources: {
      doc: 'The source locales you want to translate',
      format: enumArrayFormat('locale-array', [...SUPPORTED_LOCALES]),
      env: 'LOCALE_SOURCES',
      default: []
    },
    target: {
      doc: 'The target local you want to translate to',
      format: [...SUPPORTED_LOCALES],
      env: 'LOCALE_TARGET',
      default: 'en'
    }
  },
  scrobbling: {
    listenbrainzUrl: {
      doc: 'ListenBrainz API base URL',
      format: String,
      default: 'https://api.listenbrainz.org', // fixed — see note below
      // no `env` key = cannot be overridden by env var
    },
  },
  cache: {
    redis: {
      host: {
        doc: 'Redis host',
        format: String,
        default: 'localhost',
        env: 'REDIS_HOST',
      },
      port: {
        doc: 'Redis port',
        format: 'port',
        default: 6379,
        env: 'REDIS_PORT',
      },
    },
  }
});

export default schema;