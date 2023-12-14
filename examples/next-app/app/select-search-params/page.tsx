"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useId } from "react"

const items = selectData

function Select({ value, setValue }: { value: string | null | undefined; setValue: (value: string) => void }) {
  const collection = select.collection({
    items: items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })

  const [state, send] = useMachine(select.machine({ id: useId(), collection }), {
    context: {
      value: value ? [value] : undefined,
      onValueChange(details) {
        setValue(details.value[0])
      },
    },
  })

  const api = select.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <div {...api.controlProps}>
        <label {...api.labelProps}>Label</label>
        <button {...api.triggerProps}>{api.valueAsString || "Select a country"}</button>
      </div>

      <Portal>
        <div {...api.positionerProps}>
          <ul {...api.contentProps}>
            {items.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })}>
                <span>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}

export default function SearchParamClientPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const selectedCountry = searchParams.get("country")

  console.log("search param value:", selectedCountry)

  return (
    <>
      <h1>{selectedCountry}</h1>

      <button
        onClick={() => {
          router.push(`${pathname}?country=${items[0].value}`)
        }}
      >
        Change to {items[0].label}
      </button>

      <button
        onClick={() => {
          router.push(`${pathname}?country=${items[1].value}`)
        }}
      >
        Change to {items[1].label}
      </button>

      <Select
        value={selectedCountry}
        setValue={(value) => {
          router.push(`${pathname}?country=${value}`)
        }}
      />
    </>
  )
}
