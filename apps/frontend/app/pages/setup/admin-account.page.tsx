import { zodResolver } from '@hookform/resolvers/zod'
import { User, Lock } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, Controller  } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useOutletContext } from 'react-router'

import type { SetupOutletContext } from '@/routes/setup.routes'

import { PasswordStrengthMeter } from '@/components/form/password-strength-meter'
import { TranslatedFieldError } from '@/components/translated-field-error'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useCreateAdminAccount } from '@/queries/setup.queries'
import { createAdminAccountSchema, type AdminAccountFormValues } from '@/services/setup/admin-account.schema'



const AdminAccountStep = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { mutateAsync, isPending , error } = useCreateAdminAccount()
  const { setCanProceed, setOnNext } = useOutletContext<SetupOutletContext>()

  const form = useForm<AdminAccountFormValues>({
    resolver: zodResolver(createAdminAccountSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' }
  })
  const onSubmit = async (values: AdminAccountFormValues) => {
    await mutateAsync(values)
    navigate('/setup/library-path')
  }

  useEffect(() => {
    setCanProceed(form.formState.isValid && !isPending)
  }, [form.formState.isValid, isPending, setCanProceed])

  useEffect(() => {
    setOnNext(async () => {
      const isValid = await form.trigger()
      if (!isValid) return false

      try {
        await mutateAsync(form.getValues())
        return true
      } catch {
        return false
      }
    })

    return () => setOnNext(null)
  }, [form, mutateAsync, setOnNext])

 return <>
    <div className="mb-2">
      <h1 className="text-2xl font-bold mb-2">{t('setup.adminAccount.heading')}</h1>
      <p className="text-muted-foreground">{t('setup.adminAccount.subtitle')}</p>
    </div>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="username">{t('user.username')}</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <User className="size-4" />
                </InputGroupAddon>
                <InputGroupInput id="username" aria-invalid={fieldState.invalid} {...field} />
              </InputGroup>
              {fieldState.invalid && <TranslatedFieldError error={fieldState.error} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">{t('user.password')}</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput id="password" type="password" aria-invalid={fieldState.invalid} {...field} />
              </InputGroup>
              <PasswordStrengthMeter password={field.value} />
              {fieldState.invalid && <TranslatedFieldError error={fieldState.error} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">
                {t('setup.adminAccount.confirmPassword')}
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <Lock className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="confirmPassword"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
              </InputGroup>
              {fieldState.invalid && <TranslatedFieldError error={fieldState.error} />}
            </Field>
          )}
        />

        {error && <p className="text-sm text-red-500">{error.message}</p>}
      </FieldGroup>
    </form>
  </>
}

export default AdminAccountStep
