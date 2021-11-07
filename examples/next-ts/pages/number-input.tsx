import { mergeProps, numberInput } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

export default function Page() {
  const [state, send] = useMachine(numberInput.machine.withContext({ min: 0, max: 100 }))

  const ref = useMount<HTMLInputElement>(send)

  const { inputProps, decrementButtonProps, incrementButtonProps, scrubberProps, cursorProps } = numberInput.connect(
    state,
    send,
  )

  return (
    <div>
      <div>
        <div {...mergeProps(scrubberProps, { style: { width: 32, height: 32, background: "red" } })} />
        <button {...decrementButtonProps}>DEC</button>
        <input ref={ref} {...inputProps} />
        <button {...incrementButtonProps}>INC</button>
        <div {...mergeProps(cursorProps, { style: { width: "24px", height: "24px" } })}>
          <svg
            width="46"
            height="15"
            style={{
              left: "-20px",
              position: "absolute",
              top: "-8px",
              filter: "drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px)",
            }}
          >
            <g transform="translate(2 3)">
              <path
                fillRule="evenodd"
                d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z"
                style={{ strokeWidth: "2px", stroke: "white" }}
              />
              <path
                fillRule="evenodd"
                d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z"
              />
            </g>
          </svg>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
