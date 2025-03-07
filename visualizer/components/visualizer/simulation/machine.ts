import { createMachine } from "@zag-js/core"
import type { Service } from "@zag-js/core"
import type { StateNode } from "../utils/graph/types"

export const simMachine = createMachine<SimulationSchema>({
  initialState() {
    return "idle"
  },

  on: {
    SET_CHILD: {
      actions: ["setChild"],
      target: "registered",
    },
    PREPARE_ELK_GRAPH: {
      target: "pending",
    },
    PREVIEW_EVENT: {
      actions: ["previewEvent"],
    },
    UNPREVIEW_EVENT: {
      actions: ["unpreviewEvent"],
    },
    CHILD_TRANSITION: {
      actions: ["childTransition"],
    },
  },

  states: {
    idle: {},
    registered: {},
    pending: {
      on: {
        ELK_GRAPH_READY: {
          target: "ready",
        },
      },
    },

    ready: {},
  },

  context({ bindable }) {
    return {
      previewedEvent: bindable<string | undefined>(() => ({
        defaultValue: undefined,
      })),
    }
  },

  refs() {
    return {
      child: undefined,
      machine: undefined,
      settings: undefined,
    }
  },

  implementations: {
    actions: {
      setChild({ refs, event }) {
        refs.set("child", event.child)
        refs.set("machine", event.machine)
        refs.set("settings", event.settings)
      },
      previewEvent({ context, event }) {
        context.set("previewedEvent", event.eventType)
      },
      unpreviewEvent({ context }) {
        context.set("previewedEvent", undefined)
      },
      childTransition({ refs, event }) {
        refs.get("child")?.send({ type: event.eventType })
      },
    },
  },
})

interface SimulationContext {
  previewedEvent: string | undefined
}

export interface SimulationSchema {
  context: SimulationContext
  initial: "idle"
  refs: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    child: Service<any> | undefined
    machine: StateNode | undefined
    settings: Record<string, unknown> | undefined
  }
  action: "setChild" | "previewEvent" | "unpreviewEvent" | "childTransition"
  event:
    | {
        type: "SET_CHILD"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        child: Service<any>
        machine: StateNode
        settings: Record<string, unknown>
      }
    | { type: "PREPARE_ELK_GRAPH" }
    | { type: "ELK_GRAPH_READY" }
    | { type: "PREVIEW_EVENT"; eventType: string }
    | { type: "UNPREVIEW_EVENT" }
    | { type: "CHILD_TRANSITION"; eventType: string }
  state: "idle" | "registered" | "pending" | "ready"
}
