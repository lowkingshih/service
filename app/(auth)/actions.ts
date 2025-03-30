'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { registerSchema } from './schemas'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    console.log('login error：', { error })
    console.log('login error：', {
      'error.status': error.status,
      'error.message': error.message,
      'error.name': error.name,
      'error.code': error.code,
    })
    redirect('/')
  }

  redirect('/')
}

/** 註冊新帳號，寄送驗證信 */
export async function registerUser(formData: FormData | { email: string; password: string }) {
  // 從 FormData 或直接對象獲取電子郵件
  const email =
    typeof formData === 'object' && 'email' in formData
      ? formData.email
      : formData instanceof FormData
        ? (formData.get('email') as string)
        : ''
  const password =
    typeof formData === 'object' && 'password' in formData
      ? formData.password
      : formData instanceof FormData
        ? (formData.get('password') as string)
        : ''
  // 驗證輸入
  const validatedFields = registerSchema.parse({ email, password })
  const supabase = await createClient()
  // 模擬延遲以模擬伺服器處理
  const { error } = await supabase.auth.signUp({
    email: validatedFields.email,
    password: validatedFields.password,
  })
  if (error) throw error
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: '/reset-password',
  })
  if (error) throw new Error('重設密碼郵件發送錯誤')
  return { email }
}
