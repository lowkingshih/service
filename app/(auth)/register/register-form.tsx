'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { registerUser } from '@/app/(auth)/actions'
import { registerSchema, type RegisterInput } from '@/app/(auth)/schemas'
import { useToast } from '@/hooks/use-toast'
export function RegisterForm() {
  const { toast } = useToast()
  const [isSuccess, setIsSuccess] = useState(false)
  const [successEmail, setSuccessEmail] = useState('')

  // 設置表單
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: RegisterInput) => registerUser(data),
    onSuccess: () => {
      setSuccessEmail(form.getValues().email)
      setIsSuccess(true)
    },
    onError: (error) => {
      toast({
        title: '註冊失敗',
        description: `${error.message ?? error}`,
        variant: 'error',
      })
    },
  })

  // 提交處理
  function onSubmit(data: RegisterInput) {
    mutate(data)
  }

  // 如果註冊成功，顯示成功訊息
  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">註冊成功！</CardTitle>
          <CardDescription className="text-center">
            我們已發送一封確認郵件至 {successEmail}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            請檢查您的電子郵件信箱，並點擊確認連結以完成註冊流程。
          </p>
          <p className="mt-2 text-sm text-gray-600">如果您沒有收到郵件，請檢查垃圾郵件資料夾。</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={() => (window.location.href = '/login')}>
            返回登入頁面
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // 註冊表單
  return (
    <Card>
      <CardHeader>
        <CardTitle>註冊</CardTitle>
        <CardDescription>請輸入您的電子郵件地址以註冊新帳號</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error.message}</span>
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電子郵件</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密碼</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? '處理中...' : '註冊'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
