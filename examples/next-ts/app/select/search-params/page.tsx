"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useId } from "react"
import "@styles/select.css"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

export default function Page() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const selectedCountry = searchParams.get("country")

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    positioning: { placement: "right-end" },
    value: selectedCountry ? [selectedCountry] : undefined,
    onValueChange: (details) => {
      router.push(`${pathname}?country=${details.value[0]}`)
    },
  })

  const api = select.connect(service, normalizeProps)

  return (
    <div style={{ padding: "40px" }}>
      <h1>{selectedCountry ?? "-"}</h1>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button onClick={() => router.push(`${pathname}?country=${selectData[0].value}`)}>
          Change to {selectData[0].label}
        </button>
        <button onClick={() => router.push(`${pathname}?country=${selectData[1].value}`)}>
          Change to {selectData[1].label}
        </button>
      </div>

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
    </div>
  )
}
