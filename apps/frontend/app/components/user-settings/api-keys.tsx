import { Plus, Trash2, X } from 'lucide-react'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'


import NewApiKey from './new-api-key'
import { ConfirmDialog } from '@/components/confirm-dialog'
import Loading from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useDeleteApiKey, useApiKeys } from '@/queries/user/user.queries'


export const ApiKeys = () => {
  const { t, i18n } = useTranslation()
  const [showNewKey, setShowNewKey] = useState(false)
  const { data: apiKeys, isPending, isError, error } = useApiKeys()
  const { mutateAsync: deleteMutate } = useDeleteApiKey()

  if (isPending) return <Loading />
  if (isError) return <div>Something went wrong: {error.message}</div>

  const formatDate = (date : Date | undefined) => date &&  DateTime.fromISO(date as unknown as string).setLocale(i18n.language).toLocaleString(DateTime.DATE_MED)

  const handleDeleteKey = (keyId: string) => async () => {
    await deleteMutate(keyId)
  }

  return <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex justify-between">
          <h2>{t('user-settings.apiKeys.title')}</h2>
          <Button className="cursor-pointer" onClick={() => setShowNewKey(true)}>
            <Plus />
            {t('user-settings.apiKeys.new')}
          </Button>
      </CardTitle>
      <CardDescription>
          {t('user-settings.apiKeys.description')}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {showNewKey && <div className="relative border-l-2 border-border pt-4 pb-4 pl-8 pr-12 mb-4 mt-4">
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='absolute right-2 top-2 size-7 cursor-pointer'
          onClick={() => setShowNewKey(false)}
          aria-label={t('common.close')}
        >
          <X className='size-4' />
        </Button>
        <NewApiKey />
      </div>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              { t('user-settings.apiKeys.label') }
            </TableHead>
            <TableHead>
              { t('user-settings.apiKeys.createdAt') }
            </TableHead>
            <TableHead>
              { t('user-settings.apiKeys.lastUsedAt') }
            </TableHead>
            <TableHead>
              { t('user-settings.apiKeys.expiresAt') }
            </TableHead>
            <TableHead  className="w-px whitespace-nowrap"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys?.map(apiKey => <TableRow key={apiKey.id}>
            <TableCell>{apiKey.label}</TableCell>
            <TableCell>{formatDate(apiKey.createdAt)}</TableCell>
            <TableCell>{formatDate(apiKey.lastUsedAt) ?? t('user-settings.apiKeys.lastUsedAtMissing')}</TableCell>
            <TableCell>{formatDate(apiKey.expiresAt) ?? t('user-settings.apiKeys.expiresAtMissing')}</TableCell>
            <TableCell>
              <ConfirmDialog
                  trigger={
                    <Button variant='destructive' className="cursor-pointer">
                      <Trash2 />
                      {t('user-settings.apiKeys.revoke')}
                    </Button>
                  }
                  title={t('user-settings.apiKeys.revokeTitle')}
                  description={t('user-settings.apiKeys.revokeDescription', { label: apiKey.label })}
                  confirmLabel={t('user-settings.apiKeys.revokeConfirm')}
                  variant='destructive'
                  onConfirm={handleDeleteKey(apiKey.id)}
                />
            </TableCell>
          </TableRow>
         )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
}
export default ApiKeys
