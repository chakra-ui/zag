import { Box, Center, Stack, Text } from "@chakra-ui/layout"
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"

const collapsibleData = {
  headline: "@Omikorin starred 4 repositories",
  visibleItem: "@chakra-ui/zag-js",
  items: ["@chakra-ui/ark-ui", "@chakra-ui/panda", "@chakra-ui/chakra-ui"],
}

type CollapsibleProps = {
  controls: {
    disabled: boolean
    dir: "ltr" | "rtl"
  }
}

export function Collapsible(props: CollapsibleProps) {
  const [state, send] = useMachine(collapsible.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = collapsible.connect(state, send, normalizeProps)

  return (
    <Stack width="400px" {...api.rootProps}>
      <Center justifyContent={"space-between"}>
        <Text>{collapsibleData.headline}</Text>
        <Button size="sm" variant="green" {...api.triggerProps}>
          {api.isOpen ? "Collapse" : "Expand"}
        </Button>
      </Center>
      <Box
        bg="bg-subtle"
        padding="4"
        borderWidth="1px"
        fontSize="sm"
        width="full"
        rounded="md"
      >
        <Text>{collapsibleData.visibleItem}</Text>
      </Box>
      <Stack {...api.contentProps}>
        {collapsibleData.items.map((item) => (
          <Box
            key={item}
            bg="bg-subtle"
            padding="4"
            borderWidth="1px"
            fontSize="sm"
            width="full"
            rounded="md"
          >
            <Text>{item}</Text>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
