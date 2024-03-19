import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function CircularProgress(props: any) {
  const [state, send] = useMachine(progress.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = progress.connect(state, send, normalizeProps)

  return (
    <div>
      <div className="centre" {...api.rootProps}>
        <div {...api.labelProps}>Upload progress</div>
        <svg {...(api.circleProps as any)}>
          <circle {...(api.circleTrackProps as any)} />
          <circle {...(api.circleRangeProps as any)} />
        </svg>
        <div {...api.valueTextProps}>{api.valueAsString}</div>
      </div>

      <div>
        <button onClick={() => api.setValue((api.value ?? 0) - 20)}>
          Decrease
        </button>

        <button onClick={() => api.setValue((api.value ?? 0) + 20)}>
          Increase
        </button>

        <button onClick={() => api.setValue(null)}>Indeterminate</button>
      </div>
    </div>
  )
}
