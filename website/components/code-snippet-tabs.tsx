"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { Icon } from "components/ui/icon"
import type { ReactNode } from "react"
import { Box, HStack, styled } from "styled-system/jsx"
import { FRAMEWORKS, frameworks } from "../lib/framework-utils"
import { useFramework } from "./framework"

interface CodeSnippetTabsProps {
  id: string
  /** rendered snippet per framework, `null` when a framework has none */
  panels: Record<string, ReactNode>
}

export function CodeSnippetTabs(props: CodeSnippetTabsProps) {
  const { framework: userFramework } = useFramework()

  const service = useMachine(tabs.machine, {
    id: props.id,
    defaultValue: userFramework ?? "react",
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <Box
      width="full"
      maxW="768px"
      borderWidth="1px"
      borderColor="border"
      my="8"
      bg="bg.code.block"
      rounded="md"
      overflow="hidden"
      {...api.getRootProps()}
    >
      <HStack
        gap="5"
        h="10"
        px="4"
        /* an inset line, not a border, so the active underline covers it */
        boxShadow="inset 0 -1px 0 token(colors.border)"
        overflowX="auto"
        {...api.getListProps()}
      >
        {FRAMEWORKS.map((framework) => (
          <styled.button
            position="relative"
            h="full"
            flexShrink="0"
            fontFamily="mono"
            fontSize="12px"
            letterSpacing="0.02em"
            color="text.muted"
            cursor="pointer"
            transition="color 120ms"
            _hover={{ color: "text.bold" }}
            _selected={{
              color: "text.bold",
              _after: {
                content: '""',
                position: "absolute",
                left: "0",
                right: "0",
                bottom: "0",
                h: "1px",
                bg: "text.bold",
              },
            }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "border.primary.bold",
              outlineOffset: "-2px",
            }}
            {...api.getTriggerProps({ value: framework })}
            key={framework}
          >
            <HStack gap="1.5">
              <Icon as={frameworks[framework].icon} opacity="0.7" />
              <p>{frameworks[framework].label}</p>
            </HStack>
          </styled.button>
        ))}
      </HStack>
      {FRAMEWORKS.map((framework) => (
        <Box
          {...api.getContentProps({ value: framework })}
          position="relative"
          key={framework}
          mt="-6"
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "border.primary.bold",
            outlineOffset: "-2px",
          }}
        >
          {props.panels[framework] ?? (
            <Box mt="6" padding="4" fontSize="sm" color="text.muted">
              Snippet not found :(
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}
