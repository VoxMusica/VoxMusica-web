import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ApiKeyReveal } from './api-key-reveal'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useCreateApiKey } from '@/queries/user/user.queries'
import { createNewApiKeySchema, type CreateNewApiKeyValue } from '@/services/user-settings/api-keys.schema'

const FORM_ID = 'NEW-API-KEY-FORM'

export const NewApiKey = () => {
  const { data, mutateAsync, isPending, error } = useCreateApiKey()
  const { t } = useTranslation()

  const form = useForm<CreateNewApiKeyValue>({
    resolver: zodResolver(createNewApiKeySchema()),
    defaultValues: { label: '', expiresAt: undefined }
  })
  const onSubmit = async (values: CreateNewApiKeyValue) => {
    mutateAsync(values)
  }

  return data == null ? <>
    <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className='flex flex-col sm:flex-row sm:items-start gap-4'>
        <Controller
          name='label'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='flex-1'>
              <FieldLabel htmlFor='label'>
                {t('user-settings.apiKeys.label')}
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <KeyRound className='size-4' />
                </InputGroupAddon>
                <InputGroupInput
                  id='label'
                  placeholder={t('user-settings.apiKeys.labelPlaceholder')}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                  {...field}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name='expiresAt'
          control={form.control}
          render={({ fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='sm:w-[220px]'>
              <FieldLabel htmlFor='expiresAt'>
                {t('user-settings.apiKeys.expiresAt')}
                <span className='text-muted-foreground'>({t('common.optional')})</span>
              </FieldLabel>
              
              <DatePicker />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button
          type='submit'
          form={FORM_ID}
          disabled={isPending}
          className='sm:mt-[26px]'
        >
          {isPending && <Loader2 className='size-4 animate-spin' />}
          {t('common.create')}
        </Button>
      </FieldGroup>
    </form>
     {error && (
      <p role="alert" className="text-sm text-destructive mt-2">
        {t('user-settings.apiKeys.createError')}
      </p>
    )}
    </> : <div className='space-y-2'>
    <ApiKeyReveal apiKey={data.apiKey} />
    <p className='text-xs text-muted-foreground'>
      {t('user-settings.apiKeys.copyWarning')}
    </p>
  </div>
}
export default NewApiKey