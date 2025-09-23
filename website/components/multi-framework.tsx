import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { Box, HStack, Stack, styled, VStack } from "styled-system/jsx"
import { NumberInput } from "../demos/number-input"
import { CodeArea } from "./code-area"
import { ReactIcon, SolidIcon, SvelteIcon, VueIcon } from "./icons"
import { Playground } from "./playground"

const FrameworkButton = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "120px",
    height: "120px",
    rounded: "md",
    borderWidth: "1px",
    borderColor: "border.bold",
    bg: "bg.subtle",
    _selected: {
      bg: "bg.tertiary.subtle",
      borderBottomWidth: "4px",
      borderBottomColor: "border.primary.subtle",
    },
  },
})

export function MultiframeworkTabs() {
  const service = useMachine(tabs.machine, {
    id: "m2",
    defaultValue: "react",
  })

  const api = tabs.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()}>
      <HStack {...api.getListProps()}>
        <FrameworkButton {...api.getTriggerProps({ value: "react" })}>
          <VStack>
            <ReactIcon />
            <Box>React</Box>
          </VStack>
        </FrameworkButton>
        <FrameworkButton {...api.getTriggerProps({ value: "solid" })}>
          <VStack>
            <SolidIcon />
            <Box>Solid</Box>
          </VStack>
        </FrameworkButton>
        <FrameworkButton {...api.getTriggerProps({ value: "vue" })}>
          <VStack>
            <VueIcon />
            <Box>Vue</Box>
          </VStack>
        </FrameworkButton>
        <FrameworkButton {...api.getTriggerProps({ value: "svelte" })}>
          <VStack>
            <SvelteIcon />
            <Box>Svelte</Box>
          </VStack>
        </FrameworkButton>
      </HStack>

      <Stack direction={{ base: "column", lg: "row" }} gap="56px" mt="8">
        <Box
          shadow="md"
          width={{ lg: "680px" }}
          flex="1"
          rounded="xl"
          overflow="hidden"
          bg="bg.code.block"
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
          css={{
            "& #playground": {
              marginY: "0",
            },
            "& [data-part=root]": {
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
