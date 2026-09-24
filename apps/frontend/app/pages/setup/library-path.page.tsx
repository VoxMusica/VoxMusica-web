import { useTranslation } from 'react-i18next'

const LibraryPathStep = () => {
  const { t } = useTranslation()

  return (<div>
    { t('setup.done') }
  </div>)
}

export default LibraryPathStep
