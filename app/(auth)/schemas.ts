import * as z from 'zod'

const emailSchema = z
  .string()
  .min(1, { message: '電子郵件為必填項' })
  .email({ message: '請輸入有效的電子郵件地址' })

const passwordSchema = z
  .string()
  .min(8, { message: '密碼必須至少8個字符' })
  .regex(/[A-Z]/, { message: '密碼必須包含至少一個大寫字母' })
  .regex(/[a-z]/, { message: '密碼必須包含至少一個小寫字母' })
  .regex(/[0-9]/, { message: '密碼必須包含至少一個數字' })

// 註冊的電子郵件規則
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
// 密碼重置時的密碼規則
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '密碼不匹配',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
