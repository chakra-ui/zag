import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export default function Page() {
  const [showTriggers, setShowTriggers] = useState(true)
  const [showContent, setShowContent] = useState(true)
  const [controlled, setControlled] = useState(false)
  const [selectedTrigger, setSelectedTrigger] = useState("inside")
  const parentService = useMachine(popover.machine, {
    id: useId(),
    closeOnInteractOutside: false,
    positioning: { placement: "bottom-start" },
  })
  const parent = popover.connect(parentService, normalizeProps)
  const childService = useMachine(dialog.machine, {
    id: useId(),
    modal: false,
    triggerValue: controlled ? selectedTrigger || null : undefined,
    closeOnInteractOutside: false,
  })
  const child = dialog.connect(childService, normalizeProps)

  return (
    <main>
      <h1>Overlay ownership</h1>
      <p>A dialog can open from inside the popover, from outside it, or from code.</p>
      <p>
        Parent: <output data-testid="parent-state">{String(parent.open)}</output>, child:{" "}
        <output data-testid="child-state">{String(child.open)}</output>
      </p>
      <p>
        <label>
          <input type="checkbox" checked={controlled} onChange={(event) => setControlled(event.target.checked)} />{" "}
          Control selected trigger
        </label>{" "}
        <label>
          Selected trigger{" "}
          <select
            aria-label="Selected trigger"
            value={selectedTrigger}
            onChange={(event) => setSelectedTrigger(event.target.value)}
          >
            <option value="inside">Inside</option>
            <option value="outside">Outside</option>
            <option value="">Default</option>
          </select>
        </label>
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <button {...child.getTriggerProps({ value: "outside" })}>Outside trigger</button>
        <button onClick={() => child.setTriggerValue("inside")}>Select inside trigger</button>
        <button onClick={() => child.setOpen(true)}>Open child from code</button>
        <button onClick={() => parent.setOpen(false)}>Close parent</button>
        <button onClick={() => setShowTriggers((value) => !value)}>Toggle inside triggers</button>
        <button onClick={() => setShowContent((value) => !value)}>Toggle parent content</button>
      </div>
      <p>
        <button {...parent.getTriggerProps()}>Open parent</button>
      </p>
      <Portal>
        {showContent && (
          <div {...parent.getPositionerProps()}>
            <section {...parent.getContentProps()} style={{ width: 420 }}>
              <h2 {...parent.getTitleProps()}>Parent popover</h2>
              <p {...parent.getDescriptionProps()}>Closing this popover also closes a dialog opened from inside it.</p>
              {showTriggers && (
                <div style={{ display: "flex", gap: 12 }}>
                  <button {...child.getTriggerProps({ value: "inside" })}>Inside trigger</button>
                  <button {...child.getTriggerProps()}>Default inside trigger</button>
                </div>
              )}
            </section>
          </div>
        )}
        <div {...child.getPositionerProps()}>
          <section
            {...child.getContentProps()}
            style={{
              position: "fixed",
              right: 24,
              bottom: 24,
              top: "auto",
              left: "auto",
              transform: "none",
              width: 360,
            }}
          >
            <h2 {...child.getTitleProps()}>Child dialog</h2>
            <p {...child.getDescriptionProps()}>Its selected trigger determines which overlay owns it.</p>
            <button {...child.getCloseTriggerProps()} style={{ position: "static", width: "auto", height: "auto" }}>
              Close child
            </button>
          </section>
        </div>
      </Portal>
    </main>
  )
}
