"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { ChevronsUpDownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId } from "react"
import "@styles/select.css"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

export default function Page() {
  const router = useRouter()

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
  })

  const api = select.connect(service, normalizeProps)

  return (
    <div style={{ paddingBlock: "32px", maxWidth: "400px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h1>Page</h1>

        <div {...api.getRootProps()}>
          <div {...api.getControlProps()}>
            <label {...api.getLabelProps()}>Label</label>
            <button {...api.getTriggerProps()}>
              <span>{api.valueAsString || "Select a country"}</span>
              <span {...api.getIndicatorProps()}>
                <ChevronsUpDownIcon />
              </span>
            </button>
          </div>
          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                <ul {...api.getListProps()}>
                  {selectData.map((item) => (
                    <li key={item.value} {...api.getItemProps({ item })}>
                      <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Portal>
        </div>

        <button type="button" onClick={() => router.push("/")}>
          Go to main page
        </button>
        <button type="button" onClick={() => router.push("/")}>
          Go to main page
        </button>
        <button type="button" onClick={() => router.push("/")}>
          Go to main page
        </button>
      </div>
    </div>
  )
}
