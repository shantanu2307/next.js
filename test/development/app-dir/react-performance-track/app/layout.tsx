import { ReactNode, Suspense } from 'react'
import { ReactServerRequests } from './ReactServerRequests'
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <ReactServerRequests />
        <Suspense fallback="Loading Server Requests">
          <div data-react-server-requests-done />
          {children}
        </Suspense>
      </body>
    </html>
  )
}
