'use client'

import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SocialLogin } from './social-login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '../actions'
import { loginSchema, type LoginFormValues } from '../schemas'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function LoginPage() {
  const { toast } = useToast()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // Define the form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      return login(formData)
    },
    onSuccess: () => {
      toast({
        title: '登入成功',
        description: '歡迎回來！',
      })
    },
    onError: (error) => {
      toast({
        title: '登入失敗',
        description: error.message,
        variant: 'error',
      })
    },
  })

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">登入您的帳號</h1>
          <p className="mt-2 text-sm text-gray-600">
            或{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              註冊新帳號
            </Link>
          </p>
        </div>

        <SocialLogin language="zh" redirectUrl={`${origin}/api/auth/callback`} />

        <div className="relative flex items-center">
          <div className="flex-grow border-t"></div>
          <span className="mx-2 flex-shrink text-xs text-muted-foreground">或</span>
          <div className="flex-grow border-t"></div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>電子郵件</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
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
                  <div className="flex items-center justify-between">
                    <FormLabel>密碼</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      忘記密碼？
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" className="mb-2 w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? '登入中...' : '登入'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
