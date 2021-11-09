import { rating } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { computed, h, Fragment } from "vue"
import { defineComponent } from "@vue/runtime-core"
import { css, CSSObject } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { ratingStyle } from "../../../../shared/style"

const styles = css(ratingStyle as CSSObject)

export default defineComponent({
  name: "Rating",
  setup() {
    const [state, send] = useMachine(
      rating.machine.withContext({
        uid: "123",
        allowHalf: true,
      }),
    )

    const ref = useMount(send)

    const machineState = computed(() => rating.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <div class={styles}>
          <div>
            <div class="rating" ref={ref} {...machineState.value.rootProps}>
              {Array.from({ length: machineState.value.size }).map((_, index) => (
                <div
                  class="rating__rate"
                  key={index}
                  {...machineState.value.getRatingProps({ index: index + 1 })}
                  style={{ width: "20px", height: "20px" }}
                />
              ))}
            </div>
            <input {...machineState.value.inputProps} />
          </div>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
