import { useMachine } from "@zag-js/react"
import type { Machine as ZagMachine } from "@zag-js/core"

import { SimulationProvider } from "@/components/visualizer/simulation/context"
import { simMachine } from "@/components/visualizer/simulation/machine"
import { useEffectOnce } from "@/components/visualizer/utils/hooks/use-effect-once"
import { createRootNode } from "@/components/visualizer/utils/graph/create-root-node"
import type { Machine } from "@/components/visualizer/types"
import { GraphWrapper } from "@/components/visualizer/graph/wrapper"
import { useDOMSandbox } from "./dom-sandbox"

interface VisualizerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  machine: ZagMachine<any>
  serializedMachine: Machine
  settings: Record<string, unknown>
}

export function Visualizer(props: VisualizerProps): JSX.Element {
  const { machine, serializedMachine, settings } = props
  const { DomSandbox, getRootNode } = useDOMSandbox()

  const simService = useMachine(simMachine)

  const childService = useMachine(machine, {
    ...settings,
    getRootNode,
  })

  useEffectOnce(() => {
    const child = childService
    const machine = createRootNode(serializedMachine.id, serializedMachine, child?.state?.initial ?? "")
    simService.send({ type: "SET_CHILD", child, machine, settings })
  })

  return (
    <SimulationProvider value={{ service: simService, child: childService }}>
      <GraphWrapper />
      <DomSandbox />
    </SimulationProvider>
  )
}
