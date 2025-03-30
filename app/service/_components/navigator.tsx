'use client'

import Link from 'next/link'
import { useShallow } from 'zustand/shallow'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/useUserStore'
import PersonalSearchBar from './personal-search-bar'
import SyncServiceButton from './sync-service-button'
import { generateQueryString } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import { signOut } from '@/app/(auth)/actions'

export default function Navigator() {
  const user = useUserStore(useShallow((state) => state.user))
  const { session } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onPersonalPage = pathname === '/service' && !!searchParams.get('user')
  return (
    <div className="flex h-16 items-center justify-center space-x-5 border-b bg-gray-200 p-3">
      <SyncServiceButton />
      {user && !onPersonalPage ? (
        <Button asChild>
          <Link href={`/service?${generateQueryString('user', user)}`}> 我的服事表 </Link>
        </Button>
      ) : (
        <PersonalSearchBar />
      )}
      <Button asChild>
        <Link href="/service"> 看總表 </Link>
      </Button>
      {session ? (
        <Button onClick={signOut}>登出</Button>
      ) : (
        <Button asChild>
          <Link href="/login"> 登入 </Link>
        </Button>
      )}
    </div>
  )
}
