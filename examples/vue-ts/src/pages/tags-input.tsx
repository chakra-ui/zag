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
        id: "1",
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
            <div {...api.getRootProps()}>
              <label {...api.getLabelProps()}>Enter frameworks:</label>
              <div {...api.getControlProps()}>
                {api.value.map((value, index) => (
                  <span key={`${toDashCase(value)}-tag-${index}`} {...api.getItemProps({ index, value })}>
                    <div data-testid={`${toDashCase(value)}-tag`} {...api.getItemPreviewProps({ index, value })}>
                      <span data-testid={`${toDashCase(value)}-valuetext`} {...api.getItemTextProps({ index, value })}>
                        {value}{" "}
                      </span>
                      <button
                        data-testid={`${toDashCase(value)}-close-button`}
                        {...api.getItemDeleteTriggerProps({ index, value })}
                      >
                        &#x2715;
                      </button>
                    </div>
                    <input data-testid={`${toDashCase(value)}-input`} {...api.getItemInputProps({ index, value })} />
                  </span>
                ))}
                <input data-testid="input" placeholder="add tag" {...api.getInputProps()} />
              </div>
              <input {...api.getHiddenInputProps()} />
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
