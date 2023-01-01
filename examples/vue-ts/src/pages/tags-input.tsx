import { tagsInputControls } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default defineComponent({
  name: "TagsInput",
  setup() {
    const controls = useControls(tagsInputControls)

    const [state, send] = useMachine(
      tagsInput.machine({
        id: "tags-input",
        value: ["React", "Vue"],
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => tagsInput.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="tags-input">
            <div {...api.rootProps}>
              <label {...api.labelProps}>Enter frameworks:</label>
              <div {...api.controlProps}>
                {api.value.map((value, index) => (
                  <span key={`${toDashCase(value)}-tag-${index}`}>
                    <div data-testid={`${toDashCase(value)}-tag`} {...api.getTagProps({ index, value })}>
                      <span>{value} </span>
                      <button
                        data-testid={`${toDashCase(value)}-close-button`}
                        {...api.getTagDeleteTriggerProps({ index, value })}
                      >
                        &#x2715;
                      </button>
                    </div>
                    <input data-testid={`${toDashCase(value)}-input`} {...api.getTagInputProps({ index, value })} />
                  </span>
                ))}
                <input data-testid="input" placeholder="add tag" {...api.inputProps} />
              </div>
              <input {...api.hiddenInputProps} />
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
