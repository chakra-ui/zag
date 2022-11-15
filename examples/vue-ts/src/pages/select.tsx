import * as select from "@zag-js/select"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { selectControls, selectData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import serialize from "form-serialize"

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)

export default defineComponent({
  name: "select",
  setup() {
    const controls = useControls(selectControls)

    const [state, send] = useMachine(select.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => select.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="select">
            {/* control */}
            <div class="control">
              <label {...api.labelProps}>Label</label>
              <button {...api.triggerProps}>
                <span>{api.rendered}</span>
                <CaretIcon />
              </button>
            </div>

            <form
              onInput={(e) => {
                const form = e.currentTarget as HTMLFormElement
                const formData = serialize(form, { hash: true })
                console.log(formData)
              }}
            >
              {/* Hidden select */}
              <select {...api.selectProps}>
                {selectData.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </form>

            {/* UI select */}
            <div {...api.positionerProps}>
              <ul {...api.menuProps}>
                {selectData.map(({ label, value }) => (
                  <li key={value} {...api.getOptionProps({ label, value })}>
                    <span>{label}</span>
                    {value === api.selectedOption?.value && "✓"}
                  </li>
                ))}
              </ul>
            </div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} omit={["data"]} />} />
        </>
      )
    }
  },
})
