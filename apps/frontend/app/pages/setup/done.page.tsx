import { useTranslation } from 'react-i18next'

const DoneStep = () => {
  const { t } = useTranslation()

  return (<div>
    { t('setup.done') }
  </div>)
}

export default DoneStep
