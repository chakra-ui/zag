import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { useId } from "react"
import { Toolbar } from "../../components/toolbar"

interface Item {
  label: string
  value: string
}

const items: Item[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Cherry", value: "cherry" },
  { label: "Date", value: "date" },
  { label: "Elderberry", value: "elderberry" },
  { label: "Fig", value: "fig" },
  { label: "Grape", value: "grape" },
  { label: "Honeydew", value: "honeydew" },
  { label: "Kiwi", value: "kiwi" },
  { label: "Lemon", value: "lemon" },
  { label: "Mango", value: "mango" },
  { label: "Nectarine", value: "nectarine" },
  { label: "Orange", value: "orange" },
  { label: "Papaya", value: "papaya" },
  { label: "Peach", value: "peach" },
  { label: "Pear", value: "pear" },
  { label: "Pineapple", value: "pineapple" },
  { label: "Plum", value: "plum" },
  { label: "Raspberry", value: "raspberry" },
  { label: "Strawberry", value: "strawberry" },
  { label: "Watermelon", value: "watermelon" },
]

interface DemoProps {
  label: string
  defaultValue?: string | undefined
}

function AlignedSelect({ label, defaultValue }: DemoProps) {
  const service = useMachine(select.machine as select.Machine<Item>, {
    collection: select.collection({ items }),
    id: useId(),
    defaultValue: defaultValue ? [defaultValue] : undefined,
    alignItemWithTrigger: true,
  })

  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>
          <span {...api.getValueTextProps()}>{api.valueAsString || "Select a fruit"}</span>
          <span {...api.getIndicatorProps()}>▼</span>
        </button>
      </div>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getScrollArrowProps({ placement: "top" })}>▲</div>
              <div {...api.getListProps()}>
                {items.map((item) => (
                  <div key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                ))}
              </div>
              <div {...api.getScrollArrowProps({ placement: "bottom" })}>▼</div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <>
      <main className="select">
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>
              Top edge — fallback (insufficient space above for alignment)
            </p>
            <AlignedSelect label="Top" defaultValue="pineapple" />
          </div>

          <div style={{ pointerEvents: "auto", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>
              Middle — aligned: selected item overlaps trigger value
            </p>
            <AlignedSelect label="Middle" defaultValue="mango" />
          </div>

          <div style={{ pointerEvents: "auto", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px" }}>
              Bottom edge — falls back to standard positioning (opens above)
            </p>
            <AlignedSelect label="Bottom" defaultValue="watermelon" />
          </div>
        </div>
      </main>

      <Toolbar viz>
        <div />
      </Toolbar>
    </>
  )
}
