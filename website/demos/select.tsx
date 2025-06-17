import * as select from "@zag-js/select"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"
import { MdCheck } from "react-icons/md"

interface SelectProps extends Omit<select.Props, "id" | "collection"> {}

export function Select(props: SelectProps) {
  const service = useMachine(select.machine, {
    id: useId(),
    collection: select.collection({
      items: data,
    }),
    ...props,
  })

  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Label</label>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>
          <span>{api.valueAsString || "Select option"}</span>
          <CaretIcon />
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
            {data.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>
                  <MdCheck />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}

const data = [
  { label: "Nigeria", value: "NG" },
  { label: "Japan", value: "JP" },
  { label: "Korea", value: "KO" },
  { label: "Kenya", value: "KE" },
  { label: "United Kingdom", value: "UK" },
]

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)
