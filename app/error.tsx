'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The page failed to load. Try again, or go back to the dashboard.
      </p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">Error digest: {error.digest}</p>
      ) : null}
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => { window.location.href = '/dashboard' }}>
          Dashboard
        </Button>
      </div>
    </div>
  )
}
