import { render } from "@testing-library/vue"
import { machine, connect } from "@zag-js/tags-input"
import type { UserDefinedContext } from "@zag-js/tags-input/src/tags-input.types"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { defineComponent, computed, h } from "vue"

export function setupVue(userContext: Partial<UserDefinedContext> = {}) {
  const testComponent = defineComponent({
    setup() {
      const [state, send] = useMachine(
        machine({
          id: "foo",
          ...userContext,
        }),
      )
      const apiRef = computed(() => connect(state.value, send, normalizeProps))

      return () => {
        const api = apiRef.value

        return h(
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
          </div>,
        )
      }
    },
  })
  render(testComponent)
}
