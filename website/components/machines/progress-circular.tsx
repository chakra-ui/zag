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
      <div className="centre" {...api.getRootProps()}>
        <div {...api.getLabelProps()}>Upload progress</div>
        <svg {...(api.getCircleProps() as any)}>
          <circle {...(api.getCircleTrackProps() as any)} />
          <circle {...(api.getCircleRangeProps() as any)} />
        </svg>
        <div {...api.getValueTextProps()}>{api.valueAsString}</div>
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
