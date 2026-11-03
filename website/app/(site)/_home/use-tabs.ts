"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"

// The homepage's tab sets run on Zag's own tabs machine
export function useTabs(id: string, defaultValue: string) {
  const service = useMachine(tabs.machine, { id, defaultValue })
  return tabs.connect(service, normalizeProps)
}
