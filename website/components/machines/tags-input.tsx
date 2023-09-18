import * as tagsInput from "@zag-js/tags-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { chakra } from "@chakra-ui/system"
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
    <chakra.div width="400px">
      <chakra.div {...api.rootProps}>
        <label {...api.labelProps}>Enter frameworks:</label>
        <chakra.div
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
                <chakra.div
                  bg="bg-bold"
                  px="2"
                  display="inline-block"
                  margin="4px"
                  _highlighted={{ bg: "bg-primary-bold", color: "white" }}
                  _disabled={{ opacity: 0.6 }}
                  {...api.getItemProps(opt)}
                >
                  <span>{value}</span>
                  <chakra.button ml="1" {...api.getItemDeleteTriggerProps(opt)}>
                    &#x2715;
                  </chakra.button>
                </chakra.div>
                <chakra.input
                  px="2"
                  width="10"
                  outline="0"
                  {...api.getItemInputProps(opt)}
                />
              </span>
            )
          })}
          <chakra.input
            margin="4px"
            px="2"
            placeholder="Add tag..."
            _focus={{ outline: "0" }}
            bg="bg-subtle"
            {...api.inputProps}
          />
        </chakra.div>
      </chakra.div>
    </chakra.div>
  )
}
