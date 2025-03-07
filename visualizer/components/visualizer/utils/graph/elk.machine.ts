import { createMachine } from "@zag-js/core"
import type { StateElkNode } from "@/components/visualizer/utils/graph/elk.types"
import { DirectedGraphNode } from "./create-graph"
import { getElkGraph } from "./elk.utils"

export const elkMachine = createMachine<ElkSchema>({
  initialState() {
    return "loading"
  },

  states: {
    loading: {
      entry: ["invokePrepareElkGraph", "setElkGraph", "invokeOnElkGraphReady"],
      on: {
        ELK_GRAPH_SUCCESS: {
          target: "success",
        },
      },
    },
    success: {},
  },

  refs({ prop }) {
    return {
      graph: prop("graph"),
    }
  },

  context({ bindable }) {
    return {
      elkGraph: bindable<StateElkNode | undefined>(() => ({
        defaultValue: undefined,
      })),
    }
  },

  implementations: {
    actions: {
      invokePrepareElkGraph: ({ prop }) => {
        prop("onPrepareElkGraph")?.()
      },
      setElkGraph: ({ refs, context }) => {
        // Get the elk graph
        const graph = refs.get("graph")
        if (!graph) return
        getElkGraph(graph).then((elkGraph) => {
          context.set("elkGraph", elkGraph as StateElkNode)
        })
      },
      invokeOnElkGraphReady: ({ prop, send }) => {
        prop("onElkGraphReady")?.()
        send({ type: "ELK_GRAPH_SUCCESS" })
      },
      updateElkGraph: ({ event, refs }) => {
        const graph = event.graph
        refs.set("graph", graph)
      },
    },
  },
})

interface ElkContext {
  elkGraph: StateElkNode | undefined
}

export interface ElkSchema {
  props: {
    graph: DirectedGraphNode
    onPrepareElkGraph: () => void
    onElkGraphReady: () => void
  }
  refs: {
    graph: DirectedGraphNode | undefined
  }
  context: ElkContext
  initial: "loading"
  action: "invokePrepareElkGraph" | "setElkGraph" | "invokeOnElkGraphReady" | "updateElkGraph"
  event: { type: "ELK_GRAPH_READY" } | { type: "ELK_GRAPH_SUCCESS" }
  state: "loading" | "success"
}
