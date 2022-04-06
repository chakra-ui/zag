import { injectGlobal } from "@emotion/css"
import * as TagsInput from "@ui-machines/tags-input"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { tagsInputControls } from "../../../../shared/controls"
import { tagsInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(tagsInputStyle)

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default defineComponent({
  name: "TagsInput",
  setup() {
    const controls = useControls(tagsInputControls)

    const [state, send] = useMachine(
      TagsInput.machine.withContext({
        value: ["React", "Vue"],
      }),
      {
        context: controls.context,
      },
    )

    const ref = useSetup({ send, id: "1" })

    const apiRef = computed(() => TagsInput.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <controls.ui />

          <div ref={ref} {...api.rootProps}>
            <label {...api.labelProps}>Enter frameworks:</label>
            <div {...api.controlProps}>
              {api.value.map((value, index) => (
                <span key={`${toDashCase(value)}-tag-${index}`}>
                  <div data-testid={`${toDashCase(value)}-tag`} {...api.getTagProps({ index, value })}>
                    <span>{value} </span>
                    <button
                      data-testid={`${toDashCase(value)}-close-button`}
                      {...api.getTagDeleteButtonProps({ index, value })}
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

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
