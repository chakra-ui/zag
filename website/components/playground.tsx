import { Box, Flex, Stack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import React, { useState } from "react"

const Header = (props: any) => (
  <Flex
    fontSize="sm"
    align="center"
    height="48px"
    bg="transparent"
    borderBottomWidth="1px"
    px="4"
    fontWeight="medium"
    {...props}
  />
)

type PlaygroundProps = {
  component: (props: any) => JSX.Element
  defaultContext?: Record<string, any>
  defaultProps?: Record<
    string,
    string | number | boolean | { options: string[]; default: string }
  >
  hideControls?: boolean
  debug?: boolean
}

export function Playground(props: PlaygroundProps) {
  const {
    component: Comp,
    defaultProps = {},
    debug,
    hideControls,
    defaultContext,
  } = props

  const [state, setState] = useState(
    Object.fromEntries(
      Object.entries(defaultProps).map(([key, value]) => [
        key,
        typeof value === "object" ? value.default : value,
      ]),
    ),
  )

  const isEmpty = Object.keys(state).length === 0 || hideControls

  return (
    <Flex
      id="playground"
      direction={{ base: "column", md: "row" }}
      borderWidth="1px"
      minHeight="24em"
      my="16"
      bg="bg-code-block"
      borderColor="border-subtle"
    >
      <Flex
        align="flex-start"
        justify="center"
        py="20"
        flex="1"
        bgImage="radial-gradient(circle,var(--colors-gray-200) 1px, transparent 1px);"
        bgSize="16px 16px"
        _dark={{
          bgImage:
            "radial-gradient(circle,var(--colors-gray-700) 1px, transparent 1px);",
        }}
      >
        <Comp controls={state} defaultContext={defaultContext} />
      </Flex>

      <Box flexBasis="1px" alignSelf="stretch" bg="bg-bold" />

      <Box width={{ md: "240px" }} fontSize="sm" hidden={isEmpty}>
        <Header>Properties</Header>
        <Stack direction="column" spacing="4" px="5" py="4">
          {Object.keys(state).map((key) => {
            const value = state[key]
            const type = defaultProps[key]

            if (typeof type === "boolean") {
              return (
                <Flex
                  as="label"
                  htmlFor={key}
                  justify="space-between"
                  align="center"
                  gap="2"
                  key={key}
                >
                  <div>{key}</div>
                  <chakra.input
                    id={key}
                    type="checkbox"
                    defaultChecked={value as any}
                    bg="bg-subtle"
                    onChange={() => setState({ ...state, [key]: !value })}
                  />
                </Flex>
              )
            }

            if (typeof type === "string") {
              return (
                <div key={key}>
                  <label htmlFor={key}>{key}</label>
                  <chakra.input
                    mt="1"
                    width="full"
                    borderWidth="1px"
                    px="2"
                    id={key}
                    type="text"
                    defaultValue={value as any}
                    bg="bg-subtle"
                    onChange={(e) => {
                      setState({ ...state, [key]: e.target.value })
                    }}
                  />
                </div>
              )
            }

            if (typeof type === "number") {
              return (
                <Flex justify="space-between" key={key}>
                  <label htmlFor={key}>{key}</label>
                  <chakra.input
                    id={key}
                    type="number"
                    maxWidth="6ch"
                    borderWidth="1px"
                    px="2"
                    bg="bg-subtle"
                    defaultValue={state[key] as number}
                    onChange={(e) => {
                      const val = e.currentTarget.valueAsNumber
                      setState((s) => ({ ...s, [key]: isNaN(val) ? 0 : val }))
                    }}
                  />
                </Flex>
              )
            }

            if (!value) return null

            return (
              <Flex justify="space-between" key={key}>
                <label htmlFor={key}>{key}</label>
                <chakra.select
                  id={key}
                  borderWidth="1px"
                  fontSize="xs"
                  px="1"
                  bg="bg-subtle"
                  defaultValue={state[key] as any}
                  onChange={(e) => {
                    setState((s) => ({ ...s, [key]: e.target.value }))
                  }}
                >
                  <option>-----</option>
                  {type.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </chakra.select>
              </Flex>
            )
          })}

          {debug && (
            <Box as="pre" fontSize="xs">
              {JSON.stringify(state, null, 2)}
            </Box>
          )}
        </Stack>
      </Box>
    </Flex>
  )
}
