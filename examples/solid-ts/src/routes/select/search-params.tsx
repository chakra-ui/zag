import { useLocation, useNavigate, useSearchParams } from "@solidjs/router"
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
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const selectedCountry = () => {
    const value = searchParams.country
    return (Array.isArray(value) ? value[0] : value) ?? null
  }

  const id = createUniqueId()

  const service = useMachine(select.machine, () => ({
    id,
    collection,
    value: selectedCountry() ? [selectedCountry()!] : undefined,
    onValueChange: (details) => {
      navigate(`${location.pathname}?country=${details.value[0]}`)
    },
  }))

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div style={{ padding: "40px" }}>
      <h1>{selectedCountry() ?? "-"}</h1>

      <div style={{ display: "flex", gap: "12px", "margin-bottom": "24px" }}>
        <button onClick={() => navigate(`${location.pathname}?country=${selectData[0].value}`)}>
          Change to {selectData[0].label}
        </button>
        <button onClick={() => navigate(`${location.pathname}?country=${selectData[1].value}`)}>
          Change to {selectData[1].label}
        </button>
      </div>

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
    </div>
  )
}
