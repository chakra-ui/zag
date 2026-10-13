"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { ChevronsUpDownIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useId } from "react"
import "@styles/select.css"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

function PageContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const selectedCountry = searchParams.get("country")

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
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
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  )
}
