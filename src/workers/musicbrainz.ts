import { MusicBrainzApi } from 'musicbrainz-api';

import { APP_CONTACT, APP_NAME, APP_VERSION } from '#generated/userAgent'

export const mbApi = new MusicBrainzApi({
  appName: APP_NAME,
    appVersion: APP_VERSION,
    appContactInfo: APP_CONTACT,
})
