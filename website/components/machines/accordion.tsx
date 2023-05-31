import { Box } from "styled-system/jsx"
import { panda } from "styled-system/jsx"
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  {
    title: "Watercraft",
    desc: "Yacht, Boats and Dinghies",
    content: "Sample accordion content",
  },
  {
    title: "Automobiles",
    desc: "Cars, Trucks and Vans",
    content: "Sample accordion content",
  },
  {
    title: "Aircrafts",
    desc: "Airplanes, Helicopters and Rockets",
    content: "Sample accordion content",
  },
]

type AccordionProps = {
  controls: {
    collapsible: boolean
    multiple: boolean
  }
}

export function Accordion(props: AccordionProps) {
  const [state, send] = useMachine(
    accordion.machine({ id: useId(), value: "Aircrafts" }),
    {
      context: props.controls,
    },
  )

  const api = accordion.connect(state, send, normalizeProps)

  return (
    <Box width="400px" {...api.rootProps}>
      {items.map((item) => (
        <Box
          bg="bg-subtle"
          borderWidth="1px"
          fontSize="sm"
          key={item.title}
          {...api.getItemProps({ value: item.title })}
        >
          <h3>
            <panda.button
              width="full"
              py="2"
              px="3"
              textAlign="start"
              cursor="pointer"
              {...api.getTriggerProps({ value: item.title })}
              _focusVisible={{
                outline: "2px solid #0070f3",
              }}
            >
              <Box fontWeight="semibold">{item.title}</Box>
              <Box fontSize="xs" color="text-subtle">
                {item.desc}
              </Box>
            </panda.button>
          </h3>
          <Box
            width="full"
            py="2"
            px="3"
            {...api.getContentProps({ value: item.title })}
          >
            {item.content}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
