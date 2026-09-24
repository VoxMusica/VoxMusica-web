import { useTranslation } from 'react-i18next'

import { Progress } from '@/components/ui/progress'
import { getPasswordStrength } from '@/services/setup/admin-account.schema'

const strengthColors = {
  empty: '',
  weak: 'bg-red-500',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500'
}

interface PasswordStrengthMeterProps {
  password: string
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { t } = useTranslation()
  const { score, label } = getPasswordStrength(password)

  if (label === 'empty') return null

  return (
    <div className="flex flex-col gap-1">
      <Progress value={score} indicatorClassName={strengthColors[label]} />
      <span className="text-xs text-muted-foreground">
        {t(`password.strength.${label}`)}
      </span>
    </div>
  )
}
