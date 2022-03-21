import { injectGlobal } from "@emotion/css"
import * as Rating from "@ui-machines/rating"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { ratingControls } from "../../../../shared/controls"
import { ratingStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(ratingStyle)

const HalfStar = defineComponent({
  name: "HalfStar",
  setup(_, { attrs }) {
    return () => (
      <svg viewBox="0 0 273 260" {...attrs}>
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
          fill="#bdbdbd"
        />
      </svg>
    )
  },
})

const Star = defineComponent({
  name: "Star",
  setup(_, { attrs }) {
    return () => (
      <svg viewBox="0 0 273 260" {...attrs}>
        <path
          d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
          fill="currentColor"
        />
      </svg>
    )
  },
})

export default defineComponent({
  name: "Rating",
  setup() {
    const controls = useControls(ratingControls)
    const [state, send] = useMachine(Rating.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const rating = computed(() => Rating.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const { getRatingState, rootProps, getRatingProps, inputProps, sizeArray } = rating.value
      return (
        <>
          <controls.ui />

          <div>
            <div class="rating" ref={ref} {...rootProps}>
              {sizeArray.map((index) => {
                const state = getRatingState(index)
                return (
                  <span class="rating__rate" key={index} {...getRatingProps({ index })}>
                    {state.isHalf ? <HalfStar class="rating__star" /> : <Star class="rating__star" />}
                  </span>
                )
              })}
            </div>
            <input {...inputProps} />
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
