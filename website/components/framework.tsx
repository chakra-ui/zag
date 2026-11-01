"use client"

import { isFramework, type Framework } from "lib/framework-utils"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type Context = {
  framework: Framework
  setFramework: (value: Framework) => void
}

export const FrameworkContext = createContext<Context>({
  framework: "react",
  setFramework: () => {},
})

export function useFramework() {
  return useContext(FrameworkContext)
}

const COOKIE = "zag-framework"

function readStoredFramework(): Framework | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  const value = match?.[1]
  return value && isFramework(value) ? value : undefined
}

function storeFramework(value: Framework) {
  document.cookie = `${COOKIE}=${value}; path=/; max-age=31536000; samesite=lax`
}

type FrameworkProviderProps = {
  /** framework from the URL. Without it, the last picked framework is used. */
  value?: Framework
  children: React.ReactNode
}

export function FrameworkProvider({ value, children }: FrameworkProviderProps) {
  const [framework, setFrameworkState] = useState<Framework>(value ?? "react")

  useEffect(() => {
    if (value) {
      storeFramework(value)
      return
    }
    const stored = readStoredFramework()
    if (stored) setFrameworkState(stored)
  }, [value])

  const setFramework = useCallback((next: Framework) => {
    storeFramework(next)
    setFrameworkState(next)
  }, [])

  const context = useMemo(
    () => ({ framework, setFramework }),
    [framework, setFramework],
  )
  return (
    <FrameworkContext.Provider value={context}>
      {children}
    </FrameworkContext.Provider>
  )
}
