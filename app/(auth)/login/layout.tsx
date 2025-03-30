import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.getUser()
  if (!error) {
    redirect('/')
  }

  return <>{children}</>
}
