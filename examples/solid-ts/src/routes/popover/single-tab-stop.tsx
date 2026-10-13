import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/popover.css"

export default function Page() {
  const service = useMachine(popover.machine, {
    id: createUniqueId(),
    modal: true,
  })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <main class="popover">
      <div data-part="root">
        <button data-testid="button-before">Button :before</button>

        <button data-testid="popover-trigger" {...api().getTriggerProps()}>
          Sort by
        </button>

        <Portal>
          <div {...api().getPositionerProps()}>
            <Presence data-testid="popover-content" class="popover-content" {...api().getContentProps()}>
              <fieldset style={{ border: "none", padding: 0 }}>
                <label>
                  <input data-testid="radio-name-asc" type="radio" name="sort" value="name-asc" checked /> Name (A to Z)
                </label>
                <label>
                  <input data-testid="radio-name-desc" type="radio" name="sort" value="name-desc" /> Name (Z to A)
                </label>
                <label>
                  <input data-testid="radio-hours" type="radio" name="sort" value="hours" /> Hours
                </label>
              </fieldset>
            </Presence>
          </div>
        </Portal>

        <button data-testid="button-after">Button :after</button>
      </div>
    </main>
  )
}
