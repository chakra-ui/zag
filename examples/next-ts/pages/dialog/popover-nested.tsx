import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, type ReactNode } from "react"

function DialogWrapper({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>{trigger}</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Dialog</h2>
              <p {...api.getDescriptionProps()}>Dialog content</p>
              <button {...api.getCloseTriggerProps()}>X</button>
              <div>{children}</div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

function PopoverWrapper({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  const service = useMachine(popover.machine, { id: useId() })
  const api = popover.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>{trigger}</button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getTitleProps()}>Popover</div>
              <button {...api.getCloseTriggerProps()}>X</button>
              <div>{children}</div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  return (
    <>
      <main style={{ padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Bug Case: Dialog -> Popover -> Dialog */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Dialog 1 → Popover 1 → Dialog 2</h3>
            <div>
              <DialogWrapper trigger="Open Dialog 1">
                <PopoverWrapper trigger="Open Popover 1">
                  <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
                </PopoverWrapper>
              </DialogWrapper>
            </div>
            <p style={{ color: "red", marginTop: "8px" }}>BUG: Closing Dialog 2 closes Popover 1 and Dialog 1</p>
          </section>

          {/* OK Case: Dialog -> Dialog */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Dialog 1 → Dialog 2</h3>
            <div>
              <DialogWrapper trigger="Open Dialog 1">
                <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
              </DialogWrapper>
            </div>
            <p style={{ color: "green", marginTop: "8px" }}>OK: Closing Dialog 2 keeps Dialog 1 open</p>
          </section>

          {/* OK Case: Popover -> Dialog */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Popover 1 → Dialog 1</h3>
            <div>
              <PopoverWrapper trigger="Open Popover 1">
                <DialogWrapper trigger="Open Dialog 1">Dialog 1 Content</DialogWrapper>
              </PopoverWrapper>
            </div>
            <p style={{ color: "green", marginTop: "8px" }}>OK: Closing Dialog 1 keeps Popover 1 open</p>
          </section>

          {/* Additional Case: Dialog -> Popover */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Dialog 1 → Popover 1</h3>
            <div>
              <DialogWrapper trigger="Open Dialog 1">
                <PopoverWrapper trigger="Open Popover 1">Popover 1 Content</PopoverWrapper>
              </DialogWrapper>
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>Test: Closing Popover 1 should keep Dialog 1 open</p>
          </section>

          {/* Additional Case: Popover -> Popover -> Dialog */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Popover 1 → Popover 2 → Dialog 1</h3>
            <div>
              <PopoverWrapper trigger="Open Popover 1">
                <PopoverWrapper trigger="Open Popover 2">
                  <DialogWrapper trigger="Open Dialog 1">Dialog 1 Content</DialogWrapper>
                </PopoverWrapper>
              </PopoverWrapper>
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>Test: Closing Dialog 1 should keep both Popovers open</p>
          </section>

          <hr style={{ margin: "24px 0", border: "1px solid #ccc" }} />
          <h2 style={{ fontWeight: "bold", marginBottom: "16px" }}>Edge Cases</h2>

          {/* Edge Case 1: Deep nesting (4 levels) */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Deep: Dialog → Popover → Dialog → Popover</h3>
            <div>
              <DialogWrapper trigger="Open Dialog 1">
                <PopoverWrapper trigger="Open Popover 1">
                  <DialogWrapper trigger="Open Dialog 2">
                    <PopoverWrapper trigger="Open Popover 2">Deep nested content</PopoverWrapper>
                  </DialogWrapper>
                </PopoverWrapper>
              </DialogWrapper>
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>Test: Each Escape should close only the topmost layer</p>
          </section>

          {/* Edge Case 2: Click outside with focusable element */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Click Outside Test</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <DialogWrapper trigger="Open Dialog 1">
                <PopoverWrapper trigger="Open Popover 1">
                  <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
                </PopoverWrapper>
              </DialogWrapper>
              <button data-testid="outside-button">Outside Button</button>
              <input data-testid="outside-input" placeholder="Outside Input" />
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>
              Test: Click outside button/input should close layers appropriately
            </p>
          </section>

          {/* Edge Case 3: Three dialogs in sequence */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Dialog → Dialog → Dialog</h3>
            <div>
              <DialogWrapper trigger="Open Dialog 1">
                <DialogWrapper trigger="Open Dialog 2">
                  <DialogWrapper trigger="Open Dialog 3">Dialog 3 Content</DialogWrapper>
                </DialogWrapper>
              </DialogWrapper>
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>Test: Each Escape closes only topmost dialog</p>
          </section>

          {/* Edge Case 4: Three popovers in sequence */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Popover → Popover → Popover</h3>
            <div>
              <PopoverWrapper trigger="Open Popover 1">
                <PopoverWrapper trigger="Open Popover 2">
                  <PopoverWrapper trigger="Open Popover 3">Popover 3 Content</PopoverWrapper>
                </PopoverWrapper>
              </PopoverWrapper>
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>Test: Each Escape closes only topmost popover</p>
          </section>

          {/* Edge Case 5: Alternating pattern */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Popover → Dialog → Popover → Dialog</h3>
            <div>
              <PopoverWrapper trigger="Open Popover 1">
                <DialogWrapper trigger="Open Dialog 1">
                  <PopoverWrapper trigger="Open Popover 2">
                    <DialogWrapper trigger="Open Dialog 2">Dialog 2 Content</DialogWrapper>
                  </PopoverWrapper>
                </DialogWrapper>
              </PopoverWrapper>
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>Test: Alternating layers should each close individually</p>
          </section>

          {/* Edge Case 6: Dialog with sibling triggers */}
          <section>
            <h3 style={{ fontWeight: "bold" }}>Dialog with Multiple Popover Triggers</h3>
            <div>
              <DialogWrapper trigger="Open Dialog 1">
                <div style={{ display: "flex", gap: "8px" }}>
                  <PopoverWrapper trigger="Popover A">
                    <DialogWrapper trigger="Open Dialog A">Dialog A Content</DialogWrapper>
                  </PopoverWrapper>
                  <PopoverWrapper trigger="Popover B">
                    <DialogWrapper trigger="Open Dialog B">Dialog B Content</DialogWrapper>
                  </PopoverWrapper>
                </div>
              </DialogWrapper>
            </div>
            <p style={{ color: "gray", marginTop: "8px" }}>
              Test: Opening one popover then another, closing should work correctly
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
