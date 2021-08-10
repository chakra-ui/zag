import { useMachine } from "@ui-machines/react"
import { rating } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

function Page() {
  const [state, send] = useMachine(
    rating.machine.withContext({
      uid: "rating-35",
      allowHalf: true,
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { inputProps, getRatingProps, rootProps } = rating.connect(state, send)

  return (
    <>
      <div>
        <div>
          <div className="rating" ref={ref} {...rootProps}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="rating__rate"
                key={index}
                {...getRatingProps({ index: index + 1 })}
                style={{ width: 20, height: 20 }}
              />
            ))}
          </div>
          <input {...inputProps} />
        </div>
        <StateVisualizer state={state} />
      </div>

      <style jsx>{`
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
      `}</style>
    </>
  )
}

export default Page
