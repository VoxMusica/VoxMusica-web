import { useState } from 'react'
import { DateTime } from 'luxon'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export const DatePicker = () => {
  const [date, setDate] = useState<Date>()
  return <Popover>
    <PopoverTrigger
      render={
        <Button
          variant='outline'
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {date
            ? DateTime.fromJSDate(date).toFormat('DDD')
            : <span>Pick a date</span>}
        </Button>
      }
    />
    <PopoverContent className='w-auto p-0'>
      <Calendar mode='single' selected={date} onSelect={setDate} />
    </PopoverContent>
  </Popover>
}
