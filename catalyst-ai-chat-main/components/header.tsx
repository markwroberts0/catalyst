import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconSeparator, IconEY } from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { Session } from '@/lib/types'

async function SidebarControls() {
  const session = (await auth()) as Session
  return session?.user ? (
    <>
      <IconSeparator className="size-8 text-muted-foreground/50 mx-2" />
      <SidebarMobile>
        <ChatHistory userId={session.user.id} />
      </SidebarMobile>
      <SidebarToggle />
    </>
  ) : null
}

async function LoginOrUserMenu() {
  const session = (await auth()) as Session
  return (
    <>
      {session?.user ? (
        <UserMenu user={session.user} />
      ) : (
        <Button variant="link" asChild className={cn(buttonVariants())}>
          <Link href="/login">Login</Link>
        </Button>
      )}
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <Link href="/new" rel="nofollow">
          <IconEY className="size-8 mb-2" />
        </Link>
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <SidebarControls />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-bold leading-none mt-auto mb-[-2px]">
          Catalyst
        </h1>
      </div>
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <LoginOrUserMenu />
        </React.Suspense>
      </div>
    </header>
  )
}
