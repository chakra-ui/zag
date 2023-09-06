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
      onHighlight(details) {
        console.log("onHighlight", details)
      },
      onChange(details) {
        console.log("onChange", details)
      },
      onOpen() {
        console.log("onOpen")
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
        <div {...api.rootProps}>
          {/* control */}
          <div {...api.controlProps}>
            <label {...api.labelProps}>Label</label>
            <button {...api.triggerProps}>
              <span>{api.valueAsString || "Select option"}</span>
              <span>▼</span>
            </button>
          </div>

          <form
            onChange={(e) => {
              const formData = serialize(e.currentTarget, { hash: true })
              console.log(formData)
            }}
          >
            {/* Hidden select */}
            <select {...api.hiddenSelectProps}>
              {selectData.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </form>

          {/* UI select */}
          <Portal>
            <div {...api.positionerProps}>
              <ul {...api.contentProps}>
                {selectData.map((item) => (
                  <li key={item.value} {...api.getItemProps({ item })}>
                    <span className="item-label">{item.label}</span>
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
