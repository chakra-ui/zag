import * as dialog from "@zag-js/dialog"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId } from "react"

function Select() {
  const service = useMachine(select.machine, {
    collection: select.collection({ items: selectData }),
    id: useId(),
    name: "country",
  })
  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Label</label>
      <div {...api.getControlProps()}>
        <button
          {...mergeProps(api.getTriggerProps(), {
            "aria-controls": !api.open ? null : undefined,
          })}
        >
          <span>{api.valueAsString || "Select option"}</span>
          <span>▼</span>
        </button>
        <button {...api.getClearTriggerProps()}>X</button>
      </div>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <ul {...api.getContentProps()}>
              {selectData.map((item) => (
                <li key={item.value} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </li>
              ))}
            </ul>
          </div>
        </Portal>
      )}
    </div>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)
  return (
    <div style={{ padding: "20px" }}>
      <button {...api.getTriggerProps()} data-testid="trigger-1">
        Open Dialog
      </button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div data-testid="positioner-1" {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <Select />
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
