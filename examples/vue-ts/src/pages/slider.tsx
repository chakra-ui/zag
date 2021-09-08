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
    --slider-thumb-size: 20px;
    --slider-track-height: 4px;
    height: var(--slider-thumb-size);
    display: flex;
    align-items: center;
    margin: 45px;
    max-width: 200px;
    position: relative;
  }

  .slider__thumb {
    all: unset;
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    border-radius: 9999px;
    background: white;
    box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 10px;
    border-radius: 999px;
  }

  .slider__thumb:focus-visible {
    box-shadow: rgb(0 0 0 / 22%) 0px 0px 0px 5px;
  }

  .slider__thumb:hover {
    background-color: rgb(245, 242, 255);
  }

  .slider__track {
    height: var(--slider-track-height);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 9999px;
    flex-grow: 1;
  }

  .slider__track-inner {
    background: magenta;
    border-radius: inherit;
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
    const connect = computed(() => slider.connect(state.value, send, normalizeProps))

    return () => {
      const { rootProps, innerTrackProps, trackProps, inputProps, thumbProps } = connect.value
      return (
        <form
          className={styles}
          onChange={(e) => {
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <div className="slider" ref={_ref} {...rootProps}>
            <div className="slider__track" {...trackProps}>
              <div className="slider__track-inner" {...innerTrackProps} />
            </div>
            <div className="slider__thumb" {...thumbProps}>
              <input {...inputProps} />
            </div>
          </div>
          <StateVisualizer state={state.value} />
        </form>
      )
    }
  },
})
