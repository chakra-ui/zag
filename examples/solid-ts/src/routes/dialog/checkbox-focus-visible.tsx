import * as checkbox from "@zag-js/checkbox"
import * as dialog from "@zag-js/dialog"
import * as popover from "@zag-js/popover"
import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as zagSwitch from "@zag-js/switch"
import { XIcon } from "lucide-solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"

// Mouse-clicking a control inside a focus trap must not set data-focus-visible when focus
// moves from another control: label activation first focuses the content (tabIndex=-1),
// and that intermediate focus event consumes `hasEventBeforeFocus`.

function Checkbox(props: { label: string; testId: string }) {
  const service = useMachine(checkbox.machine, { id: createUniqueId() })
  const api = createMemo(() => checkbox.connect(service, normalizeProps))
  return (
    <label
      {...api().getRootProps()}
      data-testid={props.testId}
      style={{ display: "flex", gap: "8px", "align-items": "center" }}
    >
      <div {...api().getControlProps()} style={{ width: "18px", height: "18px", border: "2px solid #888" }} />
      <span {...api().getLabelProps()}>{props.label}</span>
      <input {...api().getHiddenInputProps()} />
    </label>
  )
}

function Switch(props: { label: string; testId: string }) {
  const service = useMachine(zagSwitch.machine, { id: createUniqueId() })
  const api = createMemo(() => zagSwitch.connect(service, normalizeProps))
  return (
    <label
      {...api().getRootProps()}
      data-testid={props.testId}
      style={{ display: "flex", gap: "8px", "align-items": "center" }}
    >
      <input {...api().getHiddenInputProps()} />
      <span
        {...api().getControlProps()}
        style={{ width: "30px", height: "18px", background: "#bbb", "border-radius": "9px" }}
      >
        <span {...api().getThumbProps()} />
      </span>
      <span {...api().getLabelProps()}>{props.label}</span>
    </label>
  )
}

function RadioGroup(props: { testId: string }) {
  const service = useMachine(radio.machine, { id: createUniqueId() })
  const api = createMemo(() => radio.connect(service, normalizeProps))
  return (
    <div {...api().getRootProps()}>
      <Index each={["one", "two"]}>
        {(v) => (
          <label
            {...api().getItemProps({ value: v() })}
            data-testid={`${props.testId}-${v()}`}
            style={{ display: "flex", gap: "8px" }}
          >
            <div
              {...api().getItemControlProps({ value: v() })}
              style={{ width: "18px", height: "18px", border: "2px solid #888", "border-radius": "9px" }}
            />
            <span {...api().getItemTextProps({ value: v() })}>Radio {v()}</span>
            <input {...api().getItemHiddenInputProps({ value: v() })} />
          </label>
        )}
      </Index>
    </div>
  )
}

export default function Page() {
  const dialogService = useMachine(dialog.machine, { id: createUniqueId() })
  const dlg = createMemo(() => dialog.connect(dialogService, normalizeProps))
  const popoverService = useMachine(popover.machine, { id: createUniqueId() })
  const pop = createMemo(() => popover.connect(popoverService, normalizeProps))

  return (
    <main style={{ padding: "40px", "font-family": "system-ui" }}>
      <style>{`
        [data-checkbox-root], [data-switch-root], [data-radio-group-item] { padding: 5px; border-radius: 6px; }
        [data-focus-visible] { outline: 3px solid crimson; outline-offset: 2px; background: #ffe9ec; }
      `}</style>
      <h1 style={{ "font-size": "20px", "margin-bottom": "16px" }}>focus-visible inside focus traps</h1>

      <section style={{ "margin-bottom": "20px" }}>
        <h2 style={{ "font-size": "14px" }}>Control — no focus trap</h2>
        <Checkbox label="First" testId="out-a" />
        <Checkbox label="Second" testId="out-b" />
      </section>

      <div style={{ display: "flex", gap: "12px" }}>
        <button {...dlg().getTriggerProps()}>Open dialog</button>
        <button {...pop().getTriggerProps()} data-testid="popover-trigger">
          Open popover
        </button>
      </div>

      <Show when={dlg().open}>
        <Portal>
          <div {...dlg().getBackdropProps()} style={{ position: "fixed", inset: "0", background: "rgba(0,0,0,.4)" }} />
          <div
            {...dlg().getPositionerProps()}
            style={{ position: "fixed", inset: "0", display: "grid", "place-items": "center" }}
          >
            <div
              {...dlg().getContentProps()}
              style={{ background: "#fff", padding: "24px", "border-radius": "8px", "min-width": "320px" }}
            >
              <h2 {...dlg().getTitleProps()} style={{ "font-size": "15px" }}>
                Dialog
              </h2>
              <div style={{ display: "grid", gap: "8px", margin: "12px 0" }}>
                <Checkbox label="First" testId="dlg-cb-a" />
                <Checkbox label="Second" testId="dlg-cb-b" />
                <Switch label="Switch A" testId="dlg-sw-a" />
                <Switch label="Switch B" testId="dlg-sw-b" />
                <RadioGroup testId="dlg-radio" />
              </div>
              <button {...dlg().getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>

      <div {...pop().getPositionerProps()}>
        <div {...pop().getContentProps()} style={{ background: "#fff", border: "1px solid #ccc", padding: "16px" }}>
          <div style={{ display: "grid", gap: "8px" }}>
            <Checkbox label="First" testId="pop-cb-a" />
            <Checkbox label="Second" testId="pop-cb-b" />
          </div>
        </div>
      </div>
    </main>
  )
}
