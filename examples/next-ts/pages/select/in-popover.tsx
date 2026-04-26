import * as popover from "@zag-js/popover"
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
            <div {...api.getContentProps()}>
              <div {...api.getListProps()}>
                {selectData.map((item) => (
                  <div key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}

export default function Page() {
  const service = useMachine(popover.machine, {
    id: useId(),
    portalled: true,
    modal: false,
  })
  const api = popover.connect(service, normalizeProps)

  return (
    <div style={{ padding: "20px" }}>
      <button {...api.getTriggerProps()}>Open Popover</button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getTitleProps()}>Select in Popover</div>
              <div>
                <Select />
              </div>
              <button {...api.getCloseTriggerProps()}>X</button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
