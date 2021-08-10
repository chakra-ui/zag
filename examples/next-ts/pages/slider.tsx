import { useMachine } from "@ui-machines/react"
import { slider } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import serialize from "form-serialize"
import { useMount } from "hooks/use-mount"

function Page() {
  const [state, send] = useMachine(
    slider.machine.withContext({
      uid: "slider-35",
      value: 40,
      name: "volume",
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { inputProps, thumbProps, rootProps, innerTrackProps } = slider.connect(
    state,
    send,
  )

  return (
    <>
      <form // ensure we can read the value within forms
        onChange={(e) => {
          const formData = serialize(e.currentTarget, { hash: true })
          console.log(formData)
        }}
      >
        <div className="slider" ref={ref} {...rootProps}>
          <div className="slider__track">
            <div className="slider__track-inner" {...innerTrackProps} />
          </div>
          <div className="slider__thumb" {...thumbProps}>
            <input {...inputProps} />
          </div>
        </div>
        <StateVisualizer state={state} />
      </form>

      <style jsx>{`
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
      `}</style>
    </>
  )
}

export default Page
