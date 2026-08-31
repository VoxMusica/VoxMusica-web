import { useTranslation } from 'react-i18next'

import type { FieldError as RHFFieldError } from 'react-hook-form'

import { FieldError } from '@/components/ui/field'

export const TranslatedFieldError = ({error,  errors }: { error?: RHFFieldError, errors?: RHFFieldError[] }) => {
  const { t } = useTranslation()

  if (!errors && !error) return null
  const errorsToUse = errors ?? [error!]

  return <FieldError errors={errorsToUse.map(err => ({ message: t(err.message ?? '') }))} />
}
