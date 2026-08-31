import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Bootstrap = () => {
  const { t } = useTranslation()
  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center">
      <div className='flex flex-col gap-8 justify-center items-center'>
        <div className='flex items-center justify-center'>
          <Loader2 className='animate-spin text-muted-foreground size-32 text-primary' />
        </div>
        {t('bootstrap.loading')}
      </div>
    </div>
  )
}
