'use client'

import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FaSyncAlt } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import useGoogleSheet from '../_hooks/useGoogleSheet'
import useGoogleSheetUrl from '../_hooks/useGoogleSheetUrl'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

/**  同步服事表資料 */
export default function SyncServiceButton() {
  const { toast } = useToast()
  /** 紀錄下次同步成功後是否顯示 toast */
  const [showToast, setShowToast] = useState(false)
  const { dataUpdatedAt, isFetching, isRefetching, refetch: refetchSheet } = useGoogleSheet()
  const { refetch: refetchSheetUrl } = useGoogleSheetUrl()
  const refetch = async () => {
    await refetchSheet()
    await refetchSheetUrl()
  }
  const formattedDate = format(new Date(dataUpdatedAt), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhTW })
  const isSyncing = isFetching || isRefetching
  useEffect(() => {
    if (showToast && !isSyncing) {
      toast({
        description: '表單資料已成功同步',
        variant: 'notice',
        duration: 3000,
      })
      setShowToast(false)
    }
  }, [showToast, toast, isSyncing])
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={isSyncing}>
          <FaSyncAlt className={cn(isSyncing && 'mr-2 animate-spin')} />
          {isSyncing && '同步中'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle> 上次同步時間： {formattedDate} </DialogTitle>
          <DialogDescription> 按下按鈕會從 Google Sheet 取得最新的表單資料。 </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              onClick={() => {
                refetch()
                setShowToast(true)
              }}
            >
              同步表單資料
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
