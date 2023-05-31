import * as tagsInput from "@zag-js/tags-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { panda } from "styled-system/jsx"
import { useId } from "react"

export function TagsInput(props: any) {
  const [state, send] = useMachine(
    tagsInput.machine({
      id: useId(),
      value: ["React", "Vue"],
    }),
    { context: props.controls },
  )

  const api = tagsInput.connect(state, send, normalizeProps)

  return (
    <panda.div width="400px">
      <panda.div {...api.rootProps}>
        <label {...api.labelProps}>Enter frameworks:</label>
        <panda.div
          className="focus-outline"
          bg="bg-subtle"
          borderWidth="1px"
          mt="2"
          py="2px"
          px="1"
          {...api.controlProps}
        >
          {api.value.map((value, index) => {
            const opt = { index, value }
            return (
              <span key={index}>
                <panda.div
                  bg="bg-bold"
                  px="2"
                  display="inline-block"
                  margin="4px"
                  _selected={{ bg: "bg-primary-bold", color: "white" }}
                  _disabled={{ opacity: 0.6 }}
                  {...api.getTagProps(opt)}
                >
                  <span>{value}</span>
                  <panda.button ml="1" {...api.getTagDeleteTriggerProps(opt)}>
                    &#x2715;
                  </panda.button>
                </panda.div>
                <panda.input
                  px="2"
                  width="10"
                  outline="0"
                  {...api.getTagInputProps(opt)}
                />
              </span>
            )
          })}
          <panda.input
            margin="4px"
            px="2"
            placeholder="Add tag..."
            _focus={{ outline: "0" }}
            bg="bg-subtle"
            {...api.inputProps}
          />
        </panda.div>
      </panda.div>
    </panda.div>
  )
}
