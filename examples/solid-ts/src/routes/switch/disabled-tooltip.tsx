import { Portal } from "@solidjs/web"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as zagSwitch from "@zag-js/switch"
import * as tooltip from "@zag-js/tooltip"
import { createMemo, createUniqueId } from "solid-js"
import { Presence } from "~/components/presence"
import "@styles/switch.css"
import "@styles/tooltip.css"

export default function Page() {
  const switchService = useMachine(zagSwitch.machine, { id: createUniqueId(), disabled: true })
  const switchApi = createMemo(() => zagSwitch.connect(switchService, normalizeProps))

  const tooltipService = useMachine(tooltip.machine, { id: createUniqueId() })
  const tooltipApi = createMemo(() => tooltip.connect(tooltipService, normalizeProps))

  return (
    <main class="switch">
      {/* Switch props last, so its id and data-state win */}
      <label {...mergeProps(tooltipApi().getTriggerProps(), switchApi().getRootProps())}>
        <input {...switchApi().getHiddenInputProps()} />
        <span {...switchApi().getControlProps()}>
          <span {...switchApi().getThumbProps()} />
        </span>
        <span {...switchApi().getLabelProps()}>Wi-Fi</span>
      </label>

      <Portal>
        <div {...tooltipApi().getPositionerProps()}>
          <Presence class="tooltip-content" {...tooltipApi().getContentProps()}>
            Wi-Fi is managed by your organization
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
