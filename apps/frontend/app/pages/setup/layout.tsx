import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { SETUP_STEPS } from './config'
import { AnimatedHeight } from '@/components/animated-height'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { SetupOutletContext } from '@/routes/setup.routes'



const SetupLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation() 
  const [canProceed, setCanProceed] = useState(true)
  const [onNext, setOnNext] = useState<(() => boolean | Promise<boolean>) | null>(null)
  const currentStep = SETUP_STEPS.indexOf(location.pathname)
  const progress = currentStep * 100 / (SETUP_STEPS.length - 1)

  const handlePreviousClick = () => {
    navigate(SETUP_STEPS[currentStep - 1 ])
  }
  const handleNextClick = async () => {
    const success = onNext ? await onNext() : true

    if (success && currentStep < SETUP_STEPS.length - 1) {
      navigate(SETUP_STEPS[currentStep + 1])
    }
  }

  const outletContext: SetupOutletContext = {
    setCanProceed,
    setOnNext: useCallback((handler) => setOnNext(() => handler), [])
  }

  const showPrevious = currentStep > 0
  const showNext = currentStep <= SETUP_STEPS.length - 2

  return (
     <div className="h-dvh w-screen overflow-hidden flex items-center justify-center">
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="flex flex-col gap-4">
          <AnimatedHeight duration={500}>
            <Outlet context={outletContext} />
          </AnimatedHeight>

          <div className="flex flex-col gap-4 bg-white dark:bg-neutral-900">
            <Progress value={progress} className="[&>div>div]:duration-500" />
            <div className="flex items-center justify-center gap-2">
              {showPrevious && <Button onClick={handlePreviousClick}>{t('ui.previous')}</Button>}
              {showNext && <Button onClick={handleNextClick} disabled={!canProceed}>{t('ui.next')}</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SetupLayout
