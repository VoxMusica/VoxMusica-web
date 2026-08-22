import convict from 'convict'
import { SUPPORTED_LOCALES } from '#services/locales/index'
import { enumArrayFormat } from '#services/config/formatig/format'


const schema = convict({
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
  },
  library: {
    music: {
      doc: 'Path to music libraries',
      format: 'string-array',
      default: ['/music'],
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
});

export default schema;