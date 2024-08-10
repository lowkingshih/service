'use client'

import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const userNameDefault = searchParams.get('user') || ''
  const router = useRouter()

  const handleSubmit = () => {
    router.push(`/dashboard?user=${userNameDefault}&mode=all`)
  }

  return (
    <div className="bg-whitesmoke flex h-screen w-screen flex-col justify-center">
      <div className="mb-3">
        <div className="flex flex-col items-center">
          {userNameDefault && <div className="text-xl">歡迎回來，{userNameDefault}！</div>}
          <div className="text-3xl">萬隆基督的教會</div>
          <div className="text-xl">服事表</div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center space-y-3 p-3">
          <div className="flex items-center">
            <Button onClick={handleSubmit}>進入服事表</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
