"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
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
            <button {...api.getTriggerProps()}>{api.valueAsString || "Select a country"}</button>
          </div>
          <Portal>
            <div {...api.getPositionerProps()}>
              <ul {...api.getContentProps()}>
                {selectData.map((item) => (
                  <li key={item.value} {...api.getItemProps({ item })}>
                    <span>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </li>
                ))}
              </ul>
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
