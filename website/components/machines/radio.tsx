import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  { id: "apple", label: "Apples" },
  { id: "orange", label: "Oranges" },
  { id: "mango", label: "Mangoes" },
]

export function Radio(props: Omit<radio.Props, "id">) {
  const service = useMachine(radio.machine, {
    id: useId(),
    name: "fruits",
    ...props,
  })

  const api = radio.connect(service, normalizeProps)

  return (
    <div className="radio">
      <div {...api.getRootProps()}>
        <h2 {...api.getLabelProps()}>Fruits</h2>
        <div>
          {items.map((opt) => (
            <label key={opt.id} {...api.getItemProps({ value: opt.id })}>
              <span {...api.getItemTextProps({ value: opt.id })}>
                {opt.label}
              </span>
              <input
                data-peer=""
                {...api.getItemHiddenInputProps({ value: opt.id })}
              />
              <div {...api.getItemControlProps({ value: opt.id })}>
                {api.value === opt.id && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentcolor"
                    transform="scale(0.7)"
                  >
                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                  </svg>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
