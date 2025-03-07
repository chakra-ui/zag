import { createContext, useContext } from "react"
import type { SimulationSchema } from "./machine"
import type { Service } from "@zag-js/core"

export type SimulationContextValue = {
  service: Service<SimulationSchema>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  child: Service<any>
}

const SimulationContext = createContext<SimulationContextValue | undefined>(undefined)

export const SimulationProvider: React.FC<{
  children: React.ReactNode
  value: SimulationContextValue
}> = ({ children, value }) => {
  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export const useSimulation = (): SimulationContextValue => {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider")
  }
  return context
}
