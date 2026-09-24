import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'

import type { SetupOutletContext } from '@/routes/setup.routes'

const WelcomeStep = () => {
  const { t } = useTranslation()
  const { setCanProceed } = useOutletContext<SetupOutletContext>()

  setCanProceed(true)

  return (<div>
    <h1 className="text-2xl font-bold mb-4">{ t('setup.welcome.title') }</h1>
    <p className="text-muted-foreground">{t('setup.welcome.description')}</p>
  </div>)
}

export default WelcomeStep
