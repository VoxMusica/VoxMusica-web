import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, User } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useLogin } from '@/queries/auth/auth.queries'
import { loginSchema, type LoginFormValue } from '@/services/auth/login.schema'
import { useAuthStore } from '@/store/auth.store'

const LOGIN_FORM_ID = 'login-form'

export const Login = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { mutateAsync, isPending, error } = useLogin()
  const { login } = useAuthStore()

  const form = useForm<LoginFormValue>({
    resolver: zodResolver(loginSchema()),
    defaultValues: { username: '', password: '' }
  })

  const onSubmit = async (values: LoginFormValue) => {
    const result = await mutateAsync(values)
    login({ ...result.user, apiKey: result.apiKey })
    await navigate('/')
  }

  return (
    <div className="h-dvh w-screen overflow-hidden flex items-center justify-center">
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="flex flex-col gap-4">
          <div className="mb-2">
            <h1 className="text-2xl font-bold mb-2">{t('auth.login.heading')}</h1>
          </div>
          <form id={LOGIN_FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
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
                      <InputGroupInput
                        id="username"
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
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">{t('user.password')}</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Lock className="size-4" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="password"
                        type="password"
                        aria-invalid={fieldState.invalid}
                        disabled={isPending}
                        {...field}
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {t('auth.login.error')}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" form={LOGIN_FORM_ID} disabled={isPending} className="w-full">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {t('auth.login.validate')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
