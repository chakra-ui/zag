import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "../../components/presence"
import styles from "../../../../shared/styles/drawer-nested.module.css"

export default function Page() {
  const baseId = createUniqueId()
  const [firstOpen, setFirstOpen] = createSignal(false)
  const [secondOpen, setSecondOpen] = createSignal(false)
  const [thirdOpen, setThirdOpen] = createSignal(false)

  const firstService = useMachine(drawer.machine, () => ({
    id: `${baseId}-root`,
    open: firstOpen(),
    onOpenChange({ open }) {
      setFirstOpen(open)
      if (!open) {
        setSecondOpen(false)
        setThirdOpen(false)
      }
    },
  }))

  const secondService = useMachine(drawer.machine, () => ({
    id: `${baseId}-second`,
    open: secondOpen(),
    onOpenChange({ open }) {
      setSecondOpen(open)
      if (!open) setThirdOpen(false)
    },
  }))

  const thirdService = useMachine(drawer.machine, () => ({
    id: `${baseId}-third`,
    open: thirdOpen(),
    onOpenChange({ open }) {
      setThirdOpen(open)
    },
  }))

  const firstApi = createMemo(() => drawer.connect(firstService, normalizeProps))
  const secondApi = createMemo(() => drawer.connect(secondService, normalizeProps))
  const thirdApi = createMemo(() => drawer.connect(thirdService, normalizeProps))

  return (
    <main class={styles.main}>
      <button {...firstApi().getTriggerProps()} class={styles.button}>
        Open drawer stack
      </button>

      <Presence {...firstApi().getBackdropProps()} class={styles.backdrop} />
      <div {...firstApi().getPositionerProps()} class={styles.positioner}>
        <Presence {...firstApi().getContentProps()} class={styles.contentHost}>
          <div class={styles.popup}>
            <div {...firstApi().getGrabberProps()} class={styles.handle}>
              <div {...firstApi().getGrabberIndicatorProps()} />
            </div>
            <div class={styles.content}>
              <div {...firstApi().getTitleProps()} class={styles.title}>
                Account
              </div>
              <p class={styles.description}>
                Nested drawers can be styled to stack, while each drawer remains independently focus managed.
              </p>

              <div class={styles.actions}>
                <div class={styles.actionsLeft}>
                  <button {...secondApi().getTriggerProps()} class={styles.ghostButton}>
                    Security settings
                  </button>
                </div>
                <button {...firstApi().getCloseTriggerProps()} class={styles.button}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </Presence>
      </div>

      <Portal>
        <div {...secondApi().getPositionerProps()} class={styles.positioner}>
          <Presence {...secondApi().getContentProps()} class={styles.contentHost}>
            <div class={styles.popup}>
              <div {...secondApi().getGrabberProps()} class={styles.handle}>
                <div {...secondApi().getGrabberIndicatorProps()} />
              </div>
              <div class={styles.content}>
                <div {...secondApi().getTitleProps()} class={styles.title}>
                  Security
                </div>
                <p class={styles.description}>Review sign-in activity and update your security preferences.</p>

                <ul class={styles.list}>
                  <li>Passkeys enabled</li>
                  <li>2FA via authenticator app</li>
                  <li>3 signed-in devices</li>
                </ul>

                <div class={styles.actions}>
                  <div class={styles.actionsLeft}>
                    <button {...thirdApi().getTriggerProps()} class={styles.ghostButton}>
                      Advanced options
                    </button>
                  </div>
                  <button {...secondApi().getCloseTriggerProps()} class={styles.button}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Presence>
        </div>
      </Portal>

      <Portal>
        <div {...thirdApi().getPositionerProps()} class={styles.positioner}>
          <Presence {...thirdApi().getContentProps()} class={styles.contentHost}>
            <div class={styles.popup}>
              <div {...thirdApi().getGrabberProps()} class={styles.handle}>
                <div {...thirdApi().getGrabberIndicatorProps()} />
              </div>
              <div class={styles.content}>
                <div {...thirdApi().getTitleProps()} class={styles.title}>
                  Advanced
                </div>
                <p class={styles.description}>This drawer is taller to demonstrate variable-height stacking.</p>

                <div class={styles.field}>
                  <label class={styles.label} for="device-name">
                    Device name
                  </label>
                  <input id="device-name" class={styles.input} defaultValue="Personal laptop" />
                </div>

                <div class={styles.field}>
                  <label class={styles.label} for="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    class={styles.textarea}
                    rows={3}
                    defaultValue="Rotate recovery codes and revoke older sessions."
                  />
                </div>

                <div class={styles.actions}>
                  <button {...thirdApi().getCloseTriggerProps()} class={styles.button}>
                    Done
                  </button>
                </div>
              </div>
            </div>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
