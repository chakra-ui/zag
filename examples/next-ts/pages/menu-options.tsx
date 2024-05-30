import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuOptionData, menuControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)

  const [order, setOrder] = useState("")
  const [type, setType] = useState<string[]>([])

  const [state, send] = useMachine(menu.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = menu.connect(state, send, normalizeProps)

  const radios = menuOptionData.order.map((item) => ({
    type: "radio" as const,
    name: "order",
    value: item.value,
    label: item.label,
    checked: order === item.value,
    onCheckedChange: (checked: boolean) => setOrder(checked ? item.value : ""),
  }))

  const checkboxes = menuOptionData.type.map((item) => ({
    type: "checkbox" as const,
    name: "type",
    value: item.value,
    label: item.label,
    checked: type.includes(item.value),
    onCheckedChange: (checked: boolean) =>
      setType((prev) => (checked ? [...prev, item.value] : prev.filter((x) => x !== item.value))),
  }))

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...api.getTriggerProps()}>
            Actions <span {...api.getIndicatorProps()}>▾</span>
          </button>

          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                {radios.map((item) => {
                  return (
                    <div key={item.value} {...api.getOptionItemProps(item)}>
                      <span {...api.getItemIndicatorProps(item)}>✅</span>
                      <span {...api.getItemTextProps(item)}>{item.label}</span>
                    </div>
                  )
                })}
                <hr />
                {checkboxes.map((item) => {
                  return (
                    <div key={item.value} {...api.getOptionItemProps(item)}>
                      <span {...api.getItemIndicatorProps(item)}>✅</span>
                      <span {...api.getItemTextProps(item)}>{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
