import { injectGlobal } from "@emotion/css"
import * as Rating from "@ui-machines/rating"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { ratingStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(ratingStyle)

export default defineComponent({
  name: "Rating",
  setup() {
    const [state, send] = useMachine(Rating.machine.withContext({ allowHalf: true }))

    const ref = useSetup({ send, id: "1" })

    const rating = computed(() => Rating.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { size, rootProps, getRatingProps, inputProps } = rating.value
      return (
        <>
          <div>
            <div class="rating" ref={ref} {...rootProps}>
              {Array.from({ length: size }).map((_, index) => (
                <div class="rating__rate" key={index} {...getRatingProps({ index: index + 1 })} />
              ))}
            </div>
            <input {...inputProps} />
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
