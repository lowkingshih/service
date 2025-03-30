'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Session } from '@supabase/supabase-js'

type AuthContextType = {
  session: Session | null
}

const AuthContext = createContext<AuthContextType>({
  session: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if (session) {
        setSession(session)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])
  console.log('session', session)

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
