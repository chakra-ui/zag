import * as checkbox from "@zag-js/checkbox"
import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import * as radio from "@zag-js/radio-group"
import * as zagSwitch from "@zag-js/switch"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

// Repro for chakra-ui#10918 / PR #3265.
// Clicking a control with the MOUSE inside a focus-trapped overlay wrongly sets
// data-focus-visible, when focus moves from another control in the same overlay:
// label activation first focuses the nearest focusable ancestor (the overlay content,
// tabIndex=-1), and that intermediate focus event consumes `hasEventBeforeFocus`.

function Checkbox({ label, testId }: { label: string; testId: string }) {
  const service = useMachine(checkbox.machine, { id: useId() })
  const api = checkbox.connect(service, normalizeProps)
  return (
    <label {...api.getRootProps()} data-testid={testId} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div {...api.getControlProps()} style={{ width: 18, height: 18, border: "2px solid #888" }} />
      <span {...api.getLabelProps()}>{label}</span>
      <input {...api.getHiddenInputProps()} />
    </label>
  )
}

function Switch({ label, testId }: { label: string; testId: string }) {
  const service = useMachine(zagSwitch.machine, { id: useId() })
  const api = zagSwitch.connect(service, normalizeProps)
  return (
    <label {...api.getRootProps()} data-testid={testId} style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input {...api.getHiddenInputProps()} />
      <span {...api.getControlProps()} style={{ width: 30, height: 18, background: "#bbb", borderRadius: 9 }}>
        <span {...api.getThumbProps()} />
      </span>
      <span {...api.getLabelProps()}>{label}</span>
    </label>
  )
}

function RadioGroup({ testId }: { testId: string }) {
  const service = useMachine(radio.machine, { id: useId() })
  const api = radio.connect(service, normalizeProps)
  return (
    <div {...api.getRootProps()}>
      {["one", "two"].map((v) => (
        <label
          key={v}
          {...api.getItemProps({ value: v })}
          data-testid={`${testId}-${v}`}
          style={{ display: "flex", gap: 8 }}
        >
          <div
            {...api.getItemControlProps({ value: v })}
            style={{ width: 18, height: 18, border: "2px solid #888", borderRadius: 9 }}
          />
          <span {...api.getItemTextProps({ value: v })}>Radio {v}</span>
          <input {...api.getItemHiddenInputProps({ value: v })} />
        </label>
      ))}
    </div>
  )
}

export default function Page() {
  const dlg = dialog.connect(useMachine(dialog.machine, { id: useId() }), normalizeProps)
  const pop = popover.connect(useMachine(popover.machine, { id: useId() }), normalizeProps)

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <style>{`
        [data-part="root"] { padding: 5px; border-radius: 6px; }
        [data-focus-visible] { outline: 3px solid crimson; outline-offset: 2px; background: #ffe9ec; }
      `}</style>
      <h1 style={{ fontSize: 20, marginBottom: 16 }}>focus-visible inside focus traps</h1>

      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 14 }}>Control — no focus trap</h2>
        <Checkbox label="First" testId="out-a" />
        <Checkbox label="Second" testId="out-b" />
      </section>

      <div style={{ display: "flex", gap: 12 }}>
        <button {...dlg.getTriggerProps()}>Open dialog</button>
        <button {...pop.getTriggerProps()} data-testid="popover-trigger">
          Open popover
        </button>
      </div>

      {dlg.open && (
        <Portal>
          <div {...dlg.getBackdropProps()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)" }} />
          <div
            {...dlg.getPositionerProps()}
            style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center" }}
          >
            <div {...dlg.getContentProps()} style={{ background: "#fff", padding: 24, borderRadius: 8, minWidth: 320 }}>
              <h2 {...dlg.getTitleProps()} style={{ fontSize: 15 }}>
                Dialog
              </h2>
              <div style={{ display: "grid", gap: 8, margin: "12px 0" }}>
                <Checkbox label="First" testId="dlg-cb-a" />
                <Checkbox label="Second" testId="dlg-cb-b" />
                <Switch label="Switch A" testId="dlg-sw-a" />
                <Switch label="Switch B" testId="dlg-sw-b" />
                <RadioGroup testId="dlg-radio" />
              </div>
              <button {...dlg.getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      )}

      <div {...pop.getPositionerProps()}>
        <div {...pop.getContentProps()} style={{ background: "#fff", border: "1px solid #ccc", padding: 16 }}>
          <div style={{ display: "grid", gap: 8 }}>
            <Checkbox label="First" testId="pop-cb-a" />
            <Checkbox label="Second" testId="pop-cb-b" />
          </div>
        </div>
      </div>
    </main>
  )
}
