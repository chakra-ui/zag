import * as timer from "@zag-js/timer"
import { type AgentDescriptor, elementOf } from "./shared"

const parts = timer.anatomy.build()

export const timerAgent: AgentDescriptor<timer.Api> = {
  kind: "timer",
  machine: timer.machine,
  connect: timer.connect,
  element: (scope) => elementOf(scope, parts.root),
  state: (api) => {
    const { hours, minutes, seconds } = api.formattedTime
    return { running: api.running, paused: api.paused, time: `${hours}:${minutes}:${seconds}` }
  },
  actions: {
    start: ({ api }) => api().start(),
    pause: ({ api }) => api().pause(),
    resume: ({ api }) => api().resume(),
    reset: ({ api }) => api().reset(),
  },
}
