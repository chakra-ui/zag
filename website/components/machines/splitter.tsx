import { Flex } from "@chakra-ui/layout"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId } from "react"

export function Splitter(props: any) {
  const context = props.controls
  const [state, send] = useMachine(
    splitter.machine({
      id: useId(),
      size: [
        { id: "a", size: 50 },
        { id: "b", size: 50 },
      ],
    }),
    { context },
  )

  const isHorizontal = context.orientation === "horizontal"

  const api = splitter.connect(state, send, normalizeProps)

  return (
    <Flex align="center" justify="center" padding={10} {...api.rootProps}>
      <Flex
        bg="bg-subtle"
        borderWidth="1px"
        align="center"
        justify="center"
        h="full"
        w={isHorizontal ? "auto" : "full"}
        {...api.getPanelProps({ id: "a" })}
      >
        <p>A</p>
      </Flex>
      <Flex
        bg="gray.300"
        rounded={4}
        m={2}
        w={isHorizontal ? 2 : 64}
        h={isHorizontal ? 24 : 2}
        {...api.getResizeTriggerProps({ id: "a:b" })}
      />
      <Flex
        bg="bg-subtle"
        borderWidth="1px"
        align="center"
        justify="center"
        h="full"
        w={isHorizontal ? "auto" : "full"}
        {...api.getPanelProps({ id: "b" })}
      >
        <p>B</p>
      </Flex>
    </Flex>
  )
}
