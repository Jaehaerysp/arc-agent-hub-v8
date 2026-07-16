import { useEffect, useRef } from 'react'

/**
 * Calls `fn` immediately when polling starts, then repeats every
 * `intervalMs` while `enabled` is true.
 *
 * Improvements:
 * - Prevents overlapping requests
 * - Pauses when browser tab is hidden
 * - Cleans up correctly
 */
export function usePolling(fn, intervalMs, enabled = true) {
  const intervalRef = useRef(null)
  const runningRef = useRef(false)

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const execute = async () => {
      // Skip if previous execution still running
      if (runningRef.current) return

      // Skip when tab is hidden
      if (document.visibilityState !== 'visible') return

      runningRef.current = true

      try {
        await fn()
      } finally {
        runningRef.current = false
      }
    }

    // Initial load
    execute()

    intervalRef.current = setInterval(execute, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fn, intervalMs, enabled])
}
