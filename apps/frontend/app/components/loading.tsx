import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Loading = () => {
  const { t } = useTranslation()
  return  <div className="h-full w-full overflow-hidden flex items-center justify-center">
      <div className='flex flex-col gap-8 justify-center items-center'>
        <div className='flex items-center justify-center'>
          <Loader2 className='animate-spin text-muted-foreground size-20 text-primary' />
        </div>
        {t('bootstrap.loading')}
      </div>
    </div>
}

export default Loading