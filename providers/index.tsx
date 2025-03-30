import ReactQueryProvider from './query-client-provider'
import { AuthProvider } from './auth-provider'

/** 頂層 providers 進入點 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </ReactQueryProvider>
  )
}
