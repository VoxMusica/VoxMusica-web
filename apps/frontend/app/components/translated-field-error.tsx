import { useTranslation } from 'react-i18next'

import { FieldError } from '@/components/ui/field'

import type { FieldError as RHFFieldError } from 'react-hook-form'


export const TranslatedFieldError = ({error,  errors }: { error?: RHFFieldError, errors?: RHFFieldError[] }) => {
  const { t } = useTranslation()

  if (!errors && !error) return null
  const errorsToUse = errors ?? [error!]

  return <FieldError errors={errorsToUse.map(err => ({ message: t(err.message ?? '') }))} />
}
