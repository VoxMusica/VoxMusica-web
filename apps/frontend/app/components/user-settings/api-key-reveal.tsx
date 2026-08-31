import { Check, Copy, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { cn } from '@/lib/utils'

type ApiKeyRevealProps = {
  apiKey: string
  className?: string
}

export const ApiKeyReveal = ({ apiKey, className }: ApiKeyRevealProps) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const maskedKey = '•'.repeat(Math.min(apiKey.length, 40))

  const onCopy = async () => {
    await navigator.clipboard.writeText(apiKey)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <InputGroup className={cn('font-mono', className)}>
      <InputGroupAddon>
        <KeyRound className='size-4' />
      </InputGroupAddon>
      <InputGroupInput
        readOnly
        value={isRevealed ? apiKey : maskedKey}
        className='tracking-wider'
      />
      <InputGroupAddon align='inline-end' className='gap-1'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 cursor-pointer'
          onClick={() => setIsRevealed((prev) => !prev)}
          aria-label={isRevealed ? 'Hide key' : 'Reveal key'}
        >
          {isRevealed ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 cursor-pointer'
          onClick={onCopy}
          aria-label='Copy key'
        >
          {isCopied ? <Check className='size-4 text-green-600' /> : <Copy className='size-4' />}
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}
