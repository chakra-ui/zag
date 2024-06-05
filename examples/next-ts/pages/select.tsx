import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(selectControls)

  const [state, send] = useMachine(
    select.machine({
      collection: select.collection({ items: selectData }),
      id: useId(),
      name: "country",
      onHighlightChange(details) {
        console.log("onHighlightChange", details)
      },
      onValueChange(details) {
        console.log("onChange", details)
      },
      onOpenChange(details) {
        console.log("onOpenChange", details)
      },
    }),
    {
      context: controls.context,
    },
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <>
      <main className="select">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Label</label>
          {/* control */}
          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <span>{api.valueAsString || "Select option"}</span>
              <span {...api.getIndicatorProps()}>▼</span>
            </button>
            <button {...api.getClearTriggerProps()}>X</button>
          </div>

          <form
            onChange={(e) => {
              const formData = serialize(e.currentTarget, { hash: true })
              console.log(formData)
            }}
          >
            {/* Hidden select */}
            <select {...api.getHiddenSelectProps()}>
              {api.empty && <option value="" />}
              {selectData.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </form>

          {/* UI select */}
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
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
