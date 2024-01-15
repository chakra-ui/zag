import { Flex } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId } from "react"

export function Splitter(props: any) {
  const [state, send] = useMachine(
    splitter.machine({
      id: useId(),
      size: [
        { id: "aside", size: 40, maxSize: 60 },
        { id: "content", size: 20 },
        { id: "sources" },
      ],
    }),
    { context: props.controls },
  )

  const api = splitter.connect(state, send, normalizeProps)

  return (
    <Flex
      align="center"
      justify="center"
      padding={10}
      h={40}
      {...api.rootProps}
    >
      <Flex
        bg="bg-bold"
        w="full"
        padding={2}
        textAlign="center"
        {...api.getPanelProps({ id: "aside" })}
      >
        <p>Aside</p>
      </Flex>
      <Flex
        bg="#e2e8f0"
        w={1}
        h={1}
        {...api.getResizeTriggerProps({ id: "aside:content" })}
      >
        <chakra.div className="bar" />
      </Flex>
      <Flex
        bg="bg-bold"
        w="full"
        padding={2}
        textAlign="center"
        {...api.getPanelProps({ id: "content" })}
      >
        <p>Content</p>
      </Flex>
      <Flex
        bg="#e2e8f0"
        w={1}
        h={1}
        {...api.getResizeTriggerProps({ id: "content:sources" })}
      >
        <chakra.div className="bar" />
      </Flex>
      <Flex
        bg="bg-bold"
        w="full"
        padding={2}
        textAlign="center"
        {...api.getPanelProps({ id: "sources" })}
      >
        <p>Sources</p>
      </Flex>
    </Flex>
  )
}
