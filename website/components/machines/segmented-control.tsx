import { Flex } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  { label: "React", value: "react" },
  { label: "Angular", value: "ng" },
  { label: "Vue", value: "vue" },
]

type SegmentedControlProps = {
  controls: {
    disabled: boolean
    readonly: boolean
  }
}

export function SegmentedControl(props: SegmentedControlProps) {
  const [state, send] = useMachine(
    radio.machine({ id: useId(), value: "react" }),
    {
      context: props.controls,
    },
  )

  const api = radio.connect(state, send, normalizeProps)

  return (
    <Flex
      align="center"
      pos="relative"
      bg="blackAlpha.200"
      _dark={{
        bg: "blackAlpha.400",
      }}
      p="1.5"
      rounded="md"
      {...api.rootProps}
    >
      <chakra.div
        h="1"
        bg="bg-subtle"
        zIndex="1"
        rounded="md"
        shadow="base"
        {...api.indicatorProps}
      />
      {items.map((opt) => (
        <chakra.label
          display="flex"
          gap="2"
          userSelect="none"
          cursor="pointer"
          fontSize="16"
          px="3"
          py="1"
          zIndex="2"
          _disabled={{
            cursor: "not-allowed",
            opacity: 0.4,
          }}
          _readOnly={{
            cursor: "default",
          }}
          key={opt.value}
          {...api.getRadioProps({ value: opt.value })}
        >
          <chakra.span
            order="2"
            {...api.getRadioLabelProps({ value: opt.value })}
          >
            {opt.label}
          </chakra.span>
          <input data-peer {...api.getRadioInputProps({ value: opt.value })} />
        </chakra.label>
      ))}
    </Flex>
  )
}
