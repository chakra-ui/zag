import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { Presence } from "../components/presence"
import styles from "../../shared/styles/drawer-nested.module.css"

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

export default function Page() {
  const baseId = useId()
  const [firstOpen, setFirstOpen] = useState(false)
  const [secondOpen, setSecondOpen] = useState(false)
  const [thirdOpen, setThirdOpen] = useState(false)

  const firstService = useMachine(drawer.machine, {
    id: `${baseId}-root`,
    open: firstOpen,
    onOpenChange: ({ open }) => {
      setFirstOpen(open)
      if (!open) {
        setSecondOpen(false)
        setThirdOpen(false)
      }
    },
  })

  const secondService = useMachine(drawer.machine, {
    id: `${baseId}-second`,
    open: secondOpen,
    onOpenChange: ({ open }) => {
      setSecondOpen(open)
      if (!open) setThirdOpen(false)
    },
  })

  const thirdService = useMachine(drawer.machine, {
    id: `${baseId}-third`,
    open: thirdOpen,
    onOpenChange: ({ open }) => setThirdOpen(open),
  })

  const firstApi = drawer.connect(firstService, normalizeProps)
  const secondApi = drawer.connect(secondService, normalizeProps)
  const thirdApi = drawer.connect(thirdService, normalizeProps)

  return (
    <main className={styles.main}>
      <button {...firstApi.getTriggerProps()} className={styles.button}>
        Open drawer stack
      </button>

      <Presence {...firstApi.getBackdropProps()} className={styles.backdrop} />
      <div {...firstApi.getPositionerProps()} className={styles.positioner}>
        <Presence {...firstApi.getContentProps()} className={styles.contentHost}>
          <div className={styles.popup}>
            <div {...firstApi.getGrabberProps()} className={styles.handle}>
              <div {...firstApi.getGrabberIndicatorProps()} />
            </div>
            <div className={styles.content}>
              <div {...firstApi.getTitleProps()} className={styles.title}>
                Account
              </div>
              <p className={styles.description}>
                Nested drawers can be styled to stack, while each drawer remains independently focus managed.
              </p>

              <div className={styles.actions}>
                <div className={styles.actionsLeft}>
                  <button {...secondApi.getTriggerProps()} className={styles.ghostButton}>
                    Security settings
                  </button>
                </div>
                <button {...firstApi.getCloseTriggerProps()} className={styles.button}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </Presence>
      </div>

      <Portal>
        <div {...secondApi.getPositionerProps()} className={styles.positioner}>
          <Presence {...secondApi.getContentProps()} className={styles.contentHost}>
            <div className={styles.popup}>
              <div {...secondApi.getGrabberProps()} className={styles.handle}>
                <div {...secondApi.getGrabberIndicatorProps()} />
              </div>
              <div className={styles.content}>
                <div {...secondApi.getTitleProps()} className={styles.title}>
                  Security
                </div>
                <p className={styles.description}>Review sign-in activity and update your security preferences.</p>

                <ul className={styles.list}>
                  <li>Passkeys enabled</li>
                  <li>2FA via authenticator app</li>
                  <li>3 signed-in devices</li>
                </ul>

                <div className={styles.actions}>
                  <div className={styles.actionsLeft}>
                    <button {...thirdApi.getTriggerProps()} className={styles.ghostButton}>
                      Advanced options
                    </button>
                  </div>
                  <button {...secondApi.getCloseTriggerProps()} className={styles.button}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Presence>
        </div>
      </Portal>

      <Portal>
        <div {...thirdApi.getPositionerProps()} className={styles.positioner}>
          <Presence {...thirdApi.getContentProps()} className={styles.contentHost}>
            <div className={styles.popup}>
              <div {...thirdApi.getGrabberProps()} className={styles.handle}>
                <div {...thirdApi.getGrabberIndicatorProps()} />
              </div>
              <div className={styles.content}>
                <div {...thirdApi.getTitleProps()} className={styles.title}>
                  Advanced
                </div>
                <p className={styles.description}>This drawer is taller to demonstrate variable-height stacking.</p>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="device-name">
                    Device name
                  </label>
                  <input id="device-name" className={styles.input} defaultValue="Personal laptop" />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    className={styles.textarea}
                    defaultValue="Rotate recovery codes and revoke older sessions."
                    rows={3}
                  />
                </div>

                <div className={styles.actions}>
                  <button {...thirdApi.getCloseTriggerProps()} className={styles.button}>
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
