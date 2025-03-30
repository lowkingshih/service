import Link from 'next/link'
import { RegisterForm } from './register-form'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">註冊新帳號</h2>
          <p className="mt-2 text-sm text-gray-600">
            或{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              登入現有帳號
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
