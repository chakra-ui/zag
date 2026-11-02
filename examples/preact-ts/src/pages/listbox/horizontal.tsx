import * as listbox from "@zag-js/listbox"
import { Car, CookingPot, Coffee, Dumbbell, PawPrint, Snowflake, Waves, Wifi } from "lucide-preact"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.amenities })

const icons = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  breakfast: Coffee,
  pets: PawPrint,
  ac: Snowflake,
  kitchen: CookingPot,
}

export default function Page() {
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: useId(),
    orientation: "horizontal",
    selectionMode: "multiple",
    defaultValue: ["wifi", "breakfast"],
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <>
      <main className="listbox listbox-tags">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Amenities</label>
          <div {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {listboxData.amenities.map((item) => {
                const Icon = icons[item.value as keyof typeof icons]
                return (
                  <li key={item.value} {...api.getItemProps({ item, highlightOnHover: true })}>
                    <Icon className="listbox-item-icon" aria-hidden />
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
