import { tagsInput } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import { css, CSSObject } from "@emotion/css"

import { useMount } from "../hooks/use-mount"
import { tagsInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

const styles = css(tagsInputStyle as CSSObject)

export default defineComponent({
  name: "TagsInput",
  setup() {
    const { context, ui: PropertyControls } = useControls({
      autoFocus: { type: "boolean", defaultValue: true, label: "autoFocus" },
      addOnPaste: { type: "boolean", defaultValue: false, label: "addOnPaste" },
      addOnBlur: { type: "boolean", defaultValue: false, label: "addOnBlur" },
      max: { type: "number", defaultValue: 4, label: "max" },
      allowOutOfRange: { type: "boolean", defaultValue: false, label: "allowOutOfRange" },
    })

    const [state, send] = useMachine(
      tagsInput.machine.withContext({
        uid: "123",
        value: ["React", "Vue"],
      }),
      {
        context: context.value,
      },
    )

    const ref = useMount(send)

    const machineState = computed(() => tagsInput.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <>
          <PropertyControls />
          <div className={styles}>
            <div ref={ref} {...machineState.value.rootProps} className="tags-input">
              {state.value.context.value.map((value, index) => (
                <span key={index}>
                  <div className="tag" {...machineState.value.getTagProps({ index, value })}>
                    <span>{value} </span>
                    <button className="tag-close" {...machineState.value.getTagDeleteButtonProps({ index, value })}>
                      &#x2715;
                    </button>
                  </div>
                  <input style={{ width: 40 }} {...machineState.value.getTagInputProps({ index })} />
                </span>
              ))}
              <input placeholder="Add tag..." {...machineState.value.inputProps} />
            </div>

            <StateVisualizer state={state.value} />
          </div>
        </>
      )
    }
  },
})
