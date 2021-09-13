import { useMachine } from "@ui-machines/react"
import { rating } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

const Star = ({ isHalf, ...rest }: any) => {
  if (isHalf) {
    return (
      <svg viewBox="0 0 273 260" {...rest}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
          fill="currentColor"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
          fill="#bdbdbd"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 273 260" {...rest}>
      <path
        d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

function Page() {
  const [state, send] = useMachine(
    rating.machine.withContext({
      uid: "rating-35",
      allowHalf: false,
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { inputProps, getRatingProps, rootProps, getRatingState, size } = rating.connect(state, send)

  return (
    <>
      <div>
        <div>
          <div className="rating" ref={ref} {...rootProps}>
            {Array.from({ length: size }).map((_, index) => {
              const { isHalf, isHighlighted } = getRatingState(index + 1)
              return (
                <span className="rating__rate" key={index} {...getRatingProps({ index: index + 1 })}>
                  <Star
                    className="rating__star"
                    focusable="false"
                    isHalf={isHalf}
                    color={isHighlighted ? "#ffb400" : "#bdbdbd"}
                  />
                </span>
              )
            })}
          </div>
          <input {...inputProps} />
        </div>
        <StateVisualizer state={state} />
      </div>

      <style jsx>{`
        .rating {
          display: inline-flex;
        }
        .rating__rate {
          width: 20px;
          height: 20px;
          padding: 1px;
        }
        .rating__rate:focus {
          outline: 2px solid royalblue;
        }
      `}</style>
    </>
  )
}

export default Page
