import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { slider } from "@ui-machines/web"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { css } from "@emotion/css"
import serialize from "form-serialize"

const styles = css`
  .slider {
    --slider-thumb-size: 24px;
    --slider-track-height: 4px;
    height: var(--slider-thumb-size);
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 45px;
    max-width: 400px;
    position: relative;
  }

  .slider__thumb {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    border-radius: 999px;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 50%;
    left: var(--slider-thumb-percent);
    background: lime;
  }

  .slider__thumb:focus {
    outline: 2px solid royalblue;
  }

  .slider__track {
    height: var(--slider-track-height);
    background: lightgray;
    border-radius: 24px;
  }

  .slider__track-inner {
    background: magenta;
    height: 100%;
  }
`

export default defineComponent({
  name: "Slider",
  setup() {
    const [state, send] = useMachine(
      slider.machine.withContext({
        uid: "slider-35",
        value: 40,
        name: "volume",
      }),
    )

    const _ref = useMount(send)
    const mp = computed(() => slider.connect(state.value, send, normalizeProps))

    return () => {
      return (
        <form
          className={styles}
          onChange={(e) => {
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <div className="slider" ref={_ref} {...mp.value.rootProps}>
            <div className="slider__track">
              <div className="slider__track-inner" {...mp.value.innerTrackProps} />
            </div>
            <div className="slider__thumb" {...mp.value.thumbProps}>
              <input {...mp.value.inputProps} />
            </div>
          </div>
          <StateVisualizer state={state.value} />
        </form>
      )
    }
  },
})
