import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/react"
import { chakra } from "@chakra-ui/system"
import { useId } from "react"
import { Flex } from "@chakra-ui/layout"

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
    <chakra.div width="240px" {...api.rootProps}>
      <Flex padding={20} {...api.rootProps}>
        <Flex
          bg="bg-bold"
          align="center"
          justify="center"
          {...api.getPanelProps({ id: "aside" })}
        >
          <p>Aside</p>
        </Flex>
        <Flex
          bg="#e2e8f0"
          justify="center"
          align="center"
          w={2}
          h={40}
          {...api.getResizeTriggerProps({ id: "aside:content" })}
        >
          <chakra.div bg="#000" w={0.5} h={4} />
        </Flex>
        <Flex
          bg="bg-bold"
          align="center"
          justify="center"
          {...api.getPanelProps({ id: "content" })}
        >
          <p>Content</p>
        </Flex>
        <Flex
          bg="#e2e8f0"
          justify="center"
          align="center"
          w={2}
          h={40}
          {...api.getResizeTriggerProps({ id: "content:sources" })}
        >
          <chakra.div bg="#000" w={0.5} h={4} />
        </Flex>
        <Flex
          bg="bg-bold"
          align="center"
          justify="center"
          {...api.getPanelProps({ id: "sources" })}
        >
          <p>Sources</p>
        </Flex>
      </Flex>
    </chakra.div>
  )
}
