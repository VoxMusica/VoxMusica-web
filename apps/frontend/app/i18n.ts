// i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en.yaml'
import fr from '@/locales/fr.yaml'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr }
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n
