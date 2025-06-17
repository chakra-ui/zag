import { Box, HStack, Stack, Text, VStack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { CodeArea } from "./code-area"
import { ReactIcon, SolidIcon, VueIcon, SvelteIcon } from "./icons"
import { NumberInput } from "../demos/number-input"
import { Playground } from "./playground"

export function MultiframeworkTabs() {
  const service = useMachine(tabs.machine, {
    id: "m2",
    defaultValue: "react",
  })

  const FrameworkButton = chakra("button", {
    baseStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "120px",
      height: "120px",
      rounded: "md",
      borderWidth: "1px",
      borderColor: "border-bold",
      bg: "bg-subtle",
      _selected: {
        bg: "bg-tertiary-subtle",
        borderBottomWidth: "4px",
        borderBottomColor: "border-primary-subtle",
      },
    },
  })

  const api = tabs.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()}>
      <HStack {...api.getListProps()}>
        <FrameworkButton {...api.getTriggerProps({ value: "react" })}>
          <VStack>
            <ReactIcon />
            <Text>React</Text>
          </VStack>
        </FrameworkButton>
        <FrameworkButton {...api.getTriggerProps({ value: "solid" })}>
          <VStack>
            <SolidIcon />
            <Text>Solid</Text>
          </VStack>
        </FrameworkButton>
        <FrameworkButton {...api.getTriggerProps({ value: "vue" })}>
          <VStack>
            <VueIcon />
            <Text>Vue</Text>
          </VStack>
        </FrameworkButton>
        <FrameworkButton {...api.getTriggerProps({ value: "svelte" })}>
          <VStack>
            <SvelteIcon />
            <Text>Svelte</Text>
          </VStack>
        </FrameworkButton>
      </HStack>

      <Stack direction={{ base: "column", lg: "row" }} spacing="56px" mt="8">
        <Box
          shadow="md"
          width={{ lg: "680px" }}
          flex="1"
          rounded="xl"
          overflow="hidden"
          bg="bg-code-block"
        >
          <Box {...api.getContentProps({ value: "react" })}>
            <CodeArea slug="react/number-input/usage" />
          </Box>
          <Box {...api.getContentProps({ value: "vue" })}>
            <CodeArea slug="vue/number-input/usage" />
          </Box>
          <Box {...api.getContentProps({ value: "solid" })}>
            <CodeArea slug="solid/number-input/usage" />
          </Box>
          <Box {...api.getContentProps({ value: "svelte" })}>
            <CodeArea slug="svelte/number-input/usage" />
          </Box>
        </Box>
        <Box
          flex="1"
          sx={{
            "#playground": {
              marginY: "0",
            },
            "[data-part=root]": {
              transform: "scale(1.5) translateY(40px)",
            },
          }}
        >
          <Playground
            name="number-input"
            component={NumberInput}
            hideControls
            defaultProps={{
              min: -10,
              max: 20,
              disabled: false,
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}
