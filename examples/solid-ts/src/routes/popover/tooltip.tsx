import * as popover from "@zag-js/popover"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { XIcon } from "lucide-solid"
import { createMemo, createUniqueId, Show } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/popover.css"
import "@styles/tooltip.css"

export default function Page() {
  const ids = { trigger: createUniqueId() }

  const popoverService = useMachine(popover.machine, {
    id: createUniqueId(),
    ids,
  })

  const tooltipService = useMachine(tooltip.machine, {
    id: createUniqueId(),
    ids,
    positioning: { placement: "top" },
  })

  const popoverApi = createMemo(() => popover.connect(popoverService, normalizeProps))
  const tooltipApi = createMemo(() => tooltip.connect(tooltipService, normalizeProps))

  const triggerProps = createMemo(() => mergeProps(popoverApi().getTriggerProps(), tooltipApi().getTriggerProps()))

  return (
    <main class="popover">
      <div data-part="root">
        <button {...triggerProps()}>Click me</button>

        <Show when={tooltipApi().open}>
          <div {...tooltipApi().getPositionerProps()}>
            <div class="tooltip-content" {...tooltipApi().getContentProps()}>
              Tooltip
            </div>
          </div>
        </Show>

        <Portal>
          <div {...popoverApi().getPositionerProps()}>
            <div {...popoverApi().getContentProps()}>
              <div {...popoverApi().getTitleProps()}>Popover Title</div>
              <div data-part="body" data-testid="popover-body">
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input placeholder="input" />
                <button {...popoverApi().getCloseTriggerProps()}>
                  <XIcon />
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
