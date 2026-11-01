import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import "@styles/menu.css"

const Menu = () => {
  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    positioning: { hideWhenDetached: true },
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <div>
      <button {...api().getTriggerProps()}>
        Actions <span {...api().getIndicatorProps()}>▾</span>
      </button>
      <Show when={api().open}>
        <div {...api().getPositionerProps()}>
          <ul {...api().getContentProps()}>
            <li {...api().getItemProps({ value: "edit" })}>Edit</li>
            <li {...api().getItemProps({ value: "duplicate" })}>Duplicate</li>
            <li {...api().getItemProps({ value: "delete" })}>Delete</li>
            <li {...api().getItemProps({ value: "export" })}>Export...</li>
          </ul>
        </div>
      </Show>
    </div>
  )
}

const HorizontalScrollBox = () => {
  return (
    <div style={{ display: "flex", "justify-content": "center", "align-items": "center" }}>
      <div
        style={{
          display: "flex",
          width: "300px",
          height: "100%",
          "overflow-x": "scroll",
          "column-gap": "24px",
          "flex-shrink": 0,
          padding: "16px",
          border: "1px solid #ccc",
          "background-color": "#f0f0f0",
        }}
      >
        <Index each={[...Array(6).keys()]}>
          {(x) => (
            <div
              style={{
                "background-color": "lightgray",
                "border-radius": "4px",
                padding: "16px",
                "white-space": "nowrap",
              }}
            >
              Item {x()}
            </div>
          )}
        </Index>
        <div>
          <Menu />
        </div>
      </div>
    </div>
  )
}

const VerticalScrollBox = () => {
  return (
    <div style={{ "background-color": "#ffffff", border: "1px solid black" }}>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          gap: "16px",
          "align-items": "center",
          "max-height": "200px",
          width: "200px",
          "overflow-y": "auto",
          border: "1px solid black",
        }}
      >
        <Index each={[...Array(12).keys()]}>{() => <Menu />}</Index>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main
      style={{ height: "100vh", display: "flex", "justify-content": "center", "align-items": "center", gap: "40px" }}
    >
      <HorizontalScrollBox />
      <VerticalScrollBox />
    </main>
  )
}
