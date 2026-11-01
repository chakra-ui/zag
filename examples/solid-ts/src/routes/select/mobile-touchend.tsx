import { useNavigate } from "@solidjs/router"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

export default function Page() {
  const navigate = useNavigate()

  const service = useMachine(select.machine, {
    id: createUniqueId(),
    collection,
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div style={{ "padding-block": "32px", "max-width": "400px" }}>
      <div style={{ display: "flex", "flex-direction": "column", gap: "12px" }}>
        <h1>Page</h1>

        <div {...api().getRootProps()}>
          <div {...api().getControlProps()}>
            <label {...api().getLabelProps()}>Label</label>
            <button {...api().getTriggerProps()}>
              <span>{api().valueAsString || "Select a country"}</span>
              <span {...api().getIndicatorProps()}>
                <ChevronsUpDownIcon />
              </span>
            </button>
          </div>
          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <ul {...api().getListProps()}>
                  <For each={selectData}>
                    {(item) => (
                      <li {...api().getItemProps({ item })}>
                        <span {...api().getItemTextProps({ item })}>{item.label}</span>
                        <span {...api().getItemIndicatorProps({ item })}>✓</span>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </div>
          </Portal>
        </div>

        <button type="button" onClick={() => navigate("/")}>
          Go to main page
        </button>
        <button type="button" onClick={() => navigate("/")}>
          Go to main page
        </button>
        <button type="button" onClick={() => navigate("/")}>
          Go to main page
        </button>
      </div>
    </div>
  )
}
