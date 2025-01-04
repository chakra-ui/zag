import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const Menu = () => {
  const [state, send] = useMachine(
    menu.machine({
      id: useId(),
      positioning: { hideWhenDetached: true },
    }),
  )

  const api = menu.connect(state, send, normalizeProps)

  return (
    <div>
      <button {...api.getTriggerProps()}>
        Actions <span {...api.getIndicatorProps()}>▾</span>
      </button>
      {api.open && (
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
            <li {...api.getItemProps({ value: "edit" })}>Edit</li>
            <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
            <li {...api.getItemProps({ value: "delete" })}>Delete</li>
            <li {...api.getItemProps({ value: "export" })}>Export...</li>
          </ul>
        </div>
      )}
    </div>
  )
}

const HorizontalScrollBox = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          width: "300px",
          height: "100%",
          overflowX: "scroll",
          columnGap: "24px",
          flexShrink: 0,
          padding: "16px",
          border: "1px solid #ccc",
          backgroundColor: "#f0f0f0",
        }}
      >
        {[...Array(6).keys()].map((x) => (
          <div
            key={x}
            style={{
              backgroundColor: "lightgray",
              borderRadius: "4px",
              padding: "16px",
              whiteSpace: "nowrap",
            }}
          >
            Item {x}
          </div>
        ))}
        <div>
          <Menu />
        </div>
      </div>
    </div>
  )
}

const VerticalScrollBox = () => {
  return (
    <div style={{ backgroundColor: "#ffffff", border: "1px solid black" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center",
          maxHeight: "200px",
          width: "200px",
          overflowY: "auto",
          border: "1px solid black",
        }}
      >
        {[...Array(12).keys()].map((x) => (
          <Menu key={x} />
        ))}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <main style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", gap: "40px" }}>
      <HorizontalScrollBox />
      <VerticalScrollBox />
    </main>
  )
}
