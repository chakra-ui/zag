import * as disclosure from "@zag-js/disclosure"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { disclosureControls, disclosureData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "disclosure",
  setup() {
    const controls = useControls(disclosureControls)

    const [state, send] = useMachine(disclosure.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => disclosure.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="disclosure">
            <a href="#" {...api.buttonProps}>
              {disclosureData.label}
            </a>
            <div {...api.disclosureProps}>
              <ul>
                {disclosureData.content.map(({ href, label }, index) => (
                  <li key={index}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
