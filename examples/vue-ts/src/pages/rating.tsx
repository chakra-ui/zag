import { css } from "@emotion/css"
import * as Rating from "@ui-machines/rating"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { ratingStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

const styles = css(ratingStyle)

export default defineComponent({
  name: "Rating",
  setup() {
    const [state, send] = useMachine(
      Rating.machine.withContext({
        uid: "123",
        allowHalf: true,
      }),
    )

    const ref = useMount(send)

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
