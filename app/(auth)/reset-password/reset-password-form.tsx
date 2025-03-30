'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

// 模擬 API 請求函數
const resetPassword = async (data: { password: string; token: string }) => {
  // 在實際應用中，這裡會是真正的 API 請求
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 驗證 token（在實際應用中由後端處理）
  if (!data.token) {
    throw new Error('無效的重置令牌')
  }

  return { success: true }
}

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  // 初始化表單
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // 使用 React Query 的 useMutation
  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword({ password: values.password, token }),
    onSuccess: () => {
      toast({
        title: '密碼已重置',
        description: '您的密碼已成功更新',
      })
    },
    onError: (error) => {
      toast({
        title: '重置失敗',
        description: error instanceof Error ? error.message : '無法重置密碼，請稍後再試',
        variant: 'error',
      })
    },
  })

  // 提交表單處理
  function onSubmit(values: ResetPasswordFormValues) {
    resetPasswordMutation.mutate(values)
  }

  // 如果已提交成功，顯示成功畫面
  if (resetPasswordMutation.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-medium">密碼已重置</h3>
        <p className="text-center text-sm text-muted-foreground">
          您的密碼已成功更新，現在可以使用新密碼登入
        </p>
        <Button className="mt-4 w-full" onClick={() => router.push('/login')}>
          前往登入
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>新密碼</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormDescription>密碼必須至少8個字符，包含大小寫字母和數字</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>確認密碼</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? '處理中...' : '重置密碼'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
