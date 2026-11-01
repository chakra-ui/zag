import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Toolbar } from "~/components/toolbar"
import "@styles/select.css"

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

function AlignedSelect(props: DemoProps) {
  const service = useMachine(select.machine as select.Machine<Item>, {
    collection: select.collection({ items }),
    id: createUniqueId(),
    defaultValue: props.defaultValue ? [props.defaultValue] : undefined,
    alignItemWithTrigger: true,
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>{props.label}</label>
      <div {...api().getControlProps()}>
        <button {...api().getTriggerProps()}>
          <span {...api().getValueTextProps()}>{api().valueAsString || "Select a fruit"}</span>
          <span {...api().getIndicatorProps()}>
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getScrollArrowProps({ placement: "top" })}>▲</div>
              <div {...api().getListProps()}>
                <For each={items}>
                  {(item) => (
                    <div {...api().getItemProps({ item })}>
                      <span {...api().getItemTextProps({ item })}>{item.label}</span>
                      <span {...api().getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  )}
                </For>
              </div>
              <div {...api().getScrollArrowProps({ placement: "bottom" })}>▼</div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}

export default function Page() {
  return (
    <>
      <main class="select">
        <div
          style={{
            // fill the canvas below the playground top bar, not the viewport
            position: "absolute",
            inset: 0,
            display: "flex",
            "flex-direction": "column",
            "justify-content": "space-between",
            "align-items": "center",
            padding: "16px",
            "pointer-events": "none",
          }}
        >
          <div style={{ "pointer-events": "auto", "text-align": "center" }}>
            <p style={{ "font-size": "13px", color: "#666", margin: "0 0 8px" }}>
              Top edge — fallback (insufficient space above for alignment)
            </p>
            <AlignedSelect label="Top" defaultValue="pineapple" />
          </div>

          <div style={{ "pointer-events": "auto", "text-align": "center" }}>
            <p style={{ "font-size": "13px", color: "#666", margin: "0 0 8px" }}>
              Middle — aligned: selected item overlaps trigger value
            </p>
            <AlignedSelect label="Middle" defaultValue="mango" />
          </div>

          <div style={{ "pointer-events": "auto", "text-align": "center" }}>
            <p style={{ "font-size": "13px", color: "#666", margin: "0 0 8px" }}>
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
