import { createContext, useContext } from "react"

export const FRAMEWORKS = ["react", "vue", "solid"] as const

export type Framework = typeof FRAMEWORKS[number]

export const FrameworkContext = createContext<Framework>("react")

export function useFramework() {
  return useContext(FrameworkContext)
}

export function isFramework(str: string): str is Framework {
  return FRAMEWORKS.includes(str as any)
}
