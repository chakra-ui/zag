import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

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

export default function Page() {
  const controls = useControls(selectControls)

  const [state, send] = useMachine(
    select.machine({
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
      onClose() {
        console.log("onClose")
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
        <button className="previous-tabbable">previous tabbable</button>

        {/* control */}
        <div className="control">
          <label {...api.labelProps}>Label</label>
          <button {...api.triggerProps}>
            <span>{api.selectedOption?.label ?? "Select option"}</span>
            <CaretIcon />
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
              {selectData.map(({ label, value }) => (
                <li key={value} {...api.getOptionProps({ label, value })}>
                  <span>{label}</span>
                  {value === api.selectedOption?.value && "✓"}
                </li>
              ))}
            </ul>
          </div>
        </Portal>

        <button className="next-tabbable">next tabbable</button>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["data"]} />
      </Toolbar>
    </>
  )
}
