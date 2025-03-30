import type { Metadata } from 'next'
import Link from 'next/link'
import ForgotPasswordForm from './forgot-password-form'

export const metadata: Metadata = {
  title: '忘記密碼',
  description: '請輸入您的電子郵件地址，我們將發送重設密碼的連結',
}

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">忘記密碼</h1>
          <p className="text-sm text-muted-foreground">
            請輸入您的電子郵件地址，我們將發送重設密碼的連結
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            返回登入
          </Link>
        </p>
      </div>
    </div>
  )
}
