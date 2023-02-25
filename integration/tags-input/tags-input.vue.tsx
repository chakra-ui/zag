import { render } from "@testing-library/vue"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { defineComponent, computed, h } from "vue"

export function setupTestVue(machine: any, connect: any) {
  const testComponent = defineComponent({
    setup() {
      const [state, send] = useMachine(machine)
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
