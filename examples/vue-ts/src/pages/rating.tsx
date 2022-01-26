import { css } from "@emotion/css"
import * as Rating from "@ui-machines/rating"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { ratingStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const styles = css(ratingStyle)

export default defineComponent({
  name: "Rating",
  setup() {
    const [state, send] = useMachine(
      Rating.machine.withContext({
        allowHalf: true,
      }),
    )

    const ref = useSetup({ send, id: "1" })

    const ratingRef = computed(() => Rating.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { size, rootProps, getRatingProps, inputProps } = ratingRef.value
      return (
        <div class={styles}>
          <div>
            <div class="rating" ref={ref} {...rootProps}>
              {Array.from({ length: size }).map((_, index) => (
                <div
                  class="rating__rate"
                  key={index}
                  {...getRatingProps({ index: index + 1 })}
                  style={{ width: "20px", height: "20px" }}
                />
              ))}
            </div>
            <input {...inputProps} />
          </div>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
