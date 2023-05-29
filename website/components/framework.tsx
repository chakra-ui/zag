import { Framework } from "lib/framework-utils"
import { createContext, useContext, useMemo, useState } from "react"

export const FrameworkContext = createContext<{
  framework: Framework
  setFramework?: (value: Framework) => void
}>({
  framework: "react",
  setFramework: () => {},
})

export function useFramework() {
  return useContext(FrameworkContext)
}

type FrameworkProviderProps = {
  value: Framework
  children: React.ReactNode
}

export function FrameworkProvider({ value, children }: FrameworkProviderProps) {
  const [framework, setFramework] = useState(value)
  const context = useMemo(() => ({ framework, setFramework }), [framework])
  return (
    <FrameworkContext.Provider value={context}>
      {children}
    </FrameworkContext.Provider>
  )
}
