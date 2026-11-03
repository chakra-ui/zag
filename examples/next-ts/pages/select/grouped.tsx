import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { groupedData, selectControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

type Item = (typeof groupedData)[number]

export default function Page() {
  const controls = useControls(selectControls)

  const service = useMachine(select.machine as select.Machine<Item>, {
    collection: select.collection({ items: groupedData, groupBy: (item) => item.type }),
    id: useId(),
    ...controls.context,
  })

  const api = select.connect(service, normalizeProps)

  return (
    <>
      <main className="select">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <span>{api.valueAsString || "Select option"}</span>
              <span {...api.getIndicatorProps()}>▼</span>
            </button>
            <button {...api.getClearTriggerProps()}>X</button>
          </div>

          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                {api.collection.group().map(([type, items]) => (
                  <div key={type} {...api.getItemGroupProps({ id: type })}>
                    <div {...api.getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
                    {items.map((item) => (
                      <div key={item.value} {...api.getItemProps({ item })}>
                        <span {...api.getItemTextProps({ item })}>{item.label}</span>
                        <span {...api.getItemIndicatorProps({ item })}>✓</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
