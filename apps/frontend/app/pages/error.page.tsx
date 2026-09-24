import { Bug, ServerCrash, } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const ErrorScreen = () => {
  const { t } = useTranslation()
  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center">
      <div className='flex flex-col gap-8 justify-center items-center'> 
        <div className='relative inline-flex size-48'>
          <ServerCrash className='size-full  text-primary' />
          <Bug className='absolute -bottom-1 -right-1 size-[45%] text-sage fill-background' />
        </div>
        {t('bootstrap.error')}
      </div>
    </div>
  )
}
