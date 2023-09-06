import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId } from "react"

function Select() {
  const [state, send] = useMachine(
    select.machine({
      collection: select.collection({ items: selectData }),
      id: useId(),
      name: "country",
    }),
  )
  const api = select.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <label {...api.labelProps}>Label</label>
      <div {...api.controlProps}>
        <button {...api.triggerProps}>
          <span>{api.valueAsString || "Select option"}</span>
          <span>▼</span>
        </button>
        <button {...api.clearTriggerProps}>X</button>
      </div>

      <div {...api.positionerProps}>
        <ul {...api.contentProps}>
          {selectData.map((item) => (
            <li key={item.value} {...api.getItemProps({ item })}>
              <span>{item.label}</span>
              <span {...api.getItemIndicatorProps({ item })}>✓</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Page() {
  const [state, send] = useMachine(dialog.machine({ id: useId() }))
  const api = dialog.connect(state, send, normalizeProps)
  return (
    <div style={{ padding: "20px" }}>
      <button {...api.triggerProps} data-testid="trigger-1">
        Open Dialog
      </button>
      {api.isOpen && (
        <Portal>
          <div {...api.backdropProps} />
          <div data-testid="container-1" {...api.containerProps}>
            <div {...api.contentProps}>
              <h2 {...api.titleProps}>Edit profile</h2>
              <p {...api.descriptionProps}>Make changes to your profile here. Click save when you are done.</p>
              <Select />
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
