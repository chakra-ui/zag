"use client"

import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as zagSwitch from "@zag-js/switch"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"
import { Presence } from "@/components/presence"
import "@styles/switch.css"
import "@styles/tooltip.css"

export default function Page() {
  const switchService = useMachine(zagSwitch.machine, { id: useId(), disabled: true })
  const switchApi = zagSwitch.connect(switchService, normalizeProps)

  const tooltipService = useMachine(tooltip.machine, { id: useId() })
  const tooltipApi = tooltip.connect(tooltipService, normalizeProps)

  return (
    <main className="switch">
      {/* Switch props last, so its id and data-state win */}
      <label {...mergeProps<any>(tooltipApi.getTriggerProps(), switchApi.getRootProps())}>
        <input {...switchApi.getHiddenInputProps()} />
        <span {...switchApi.getControlProps()}>
          <span {...switchApi.getThumbProps()} />
        </span>
        <span {...switchApi.getLabelProps()}>Wi-Fi</span>
      </label>

      <Portal>
        <div {...tooltipApi.getPositionerProps()}>
          <Presence className="tooltip-content" {...tooltipApi.getContentProps()}>
            Wi-Fi is managed by your organization
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
