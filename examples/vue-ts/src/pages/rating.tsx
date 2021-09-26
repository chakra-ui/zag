import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { rating } from "@ui-machines/web"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { css } from "@emotion/css"

const styles = css`
  .rating {
    display: flex;
  }
  .rating__rate {
    margin: 0 3px;
    background: salmon;
  }
  .rating__rate:focus {
    outline: 2px solid royalblue;
  }
  .rating__rate[data-highlighted] {
    background: red;
  }
`

export default defineComponent({
  name: "Rating",
  setup() {
    const [state, send] = useMachine(
      rating.machine.withContext({
        uid: "rating-35",
        allowHalf: true,
      }),
    )

    const ref = useMount(send)
    const mp = computed(() => rating.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <div className={styles}>
          <div>
            <div className="rating" ref={ref} {...mp.value.rootProps}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  className="rating__rate"
                  key={index}
                  {...mp.value.getRatingProps({ index: index + 1 })}
                  style={{ width: "20px", height: "20px" }}
                />
              ))}
            </div>
            <input {...mp.value.inputProps} />
          </div>
          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
