'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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
import { useMutation } from '@tanstack/react-query'
import { sendPasswordResetEmail } from '../actions'

// 定義表單驗證規則
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: '請輸入電子郵件' })
    .email({ message: '請輸入有效的電子郵件地址' }),
})

export default function ForgotPasswordForm() {
  const { toast } = useToast()
  // 初始化表單
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  // 使用 React Query 的 useMutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => sendPasswordResetEmail(values.email),
    onSuccess: (data) => {
      toast({
        title: '重設密碼郵件已發送',
        description: `我們已發送重設密碼連結至 ${data.email}`,
      })
    },
    onError: () => {
      toast({
        title: '發送失敗',
        description: '無法發送重設密碼郵件，請稍後再試',
        variant: 'error',
      })
    },
  })

  // 提交表單處理
  function onSubmit(values: z.infer<typeof formSchema>) {
    forgotPasswordMutation.mutate(values)
  }

  // 如果已提交成功，顯示成功畫面
  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-medium">郵件已發送</h3>
        <p className="text-center text-sm text-muted-foreground">
          請檢查您的電子郵件信箱，並點擊重設密碼連結
        </p>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => forgotPasswordMutation.reset()}
        >
          返回
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>電子郵件</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormDescription>我們將發送重設密碼連結至此郵箱</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? '發送中...' : '發送重設連結'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
