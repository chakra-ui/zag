import { render } from "@testing-library/react"
import { machine, connect } from "@zag-js/tags-input"
import { useMachine, normalizeProps } from "@zag-js/react"
import type { UserDefinedContext } from "@zag-js/tags-input/src/tags-input.types"

export function setupFramework(userContext: Partial<UserDefinedContext> = {}) {
  function TestComponent() {
    const [state, send] = useMachine(
      machine({
        id: "foo",
        ...userContext,
      }),
    )

    const api = connect(state, send, normalizeProps)

    return (
      <div {...api.rootProps}>
        {api.value.map((value, index) => (
          <span key={index}>
            <div {...api.getTagProps({ index, value })}>
              <span>{value} </span>
              <button {...api.getTagDeleteTriggerProps({ index, value })}>&#x2715;</button>
            </div>
            <input {...api.getTagInputProps({ index, value })} />
          </span>
        ))}
        <input placeholder="Add tag..." {...api.inputProps} />
      </div>
    )
  }
  render(<TestComponent />)
}
