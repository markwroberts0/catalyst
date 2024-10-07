import React from 'react'

import { cn } from '@/lib/utils'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground italic border-t mt-4 pt-4',
        className
      )}
      {...props}
    >
      Disclaimer: While the chatbot aims to provide accurate and helpful
      information, please consult official documents or contact our support team
      for formal guidance.
    </p>
  )
}
