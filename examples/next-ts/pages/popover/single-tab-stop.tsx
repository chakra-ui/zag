import styles from "../../../../shared/src/css/popover.module.css"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../../components/presence"

export default function Page() {
  const service = useMachine(popover.machine, {
    id: useId(),
    modal: true,
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <main className="popover">
      <div data-part="root">
        <button data-testid="button-before">Button :before</button>

        <button data-testid="popover-trigger" {...api.getTriggerProps()}>
          Sort by
        </button>

        <Portal>
          <div {...api.getPositionerProps()} className={styles.Positioner}>
            <Presence data-testid="popover-content" className="popover-content" {...api.getContentProps()} className={styles.Content}>
              <fieldset style={{ border: "none", padding: 0 }}>
                <label>
                  <input data-testid="radio-name-asc" type="radio" name="sort" value="name-asc" defaultChecked /> Name
                  (A to Z)
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
