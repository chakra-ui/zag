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
      my="8"
      bg="bg.code.block"
      rounded="6px"
      {...api.getRootProps()}
    >
      <Box {...api.getListProps()}>
        {FRAMEWORKS.map((framework) => (
          <styled.button
            py="2"
            px="8"
            fontSize="sm"
            fontWeight="medium"
            borderBottom="2px solid transparent"
            bg="bg.code.block"
            _selected={{
              borderColor: "border.primary.subtle",
              color: "text.primary.bold",
            }}
            _focusVisible={{ outline: "2px solid blue" }}
            {...api.getTriggerProps({ value: framework })}
            key={framework}
          >
            <HStack>
              <Icon as={frameworks[framework].icon} />
              <p>{frameworks[framework].label}</p>
            </HStack>
          </styled.button>
        ))}
      </Box>
      {FRAMEWORKS.map((framework) => (
        <Box
          {...api.getContentProps({ value: framework })}
          position="relative"
          key={framework}
          mt="-6"
          _focusVisible={{ outline: "2px solid blue" }}
        >
          {props.panels[framework] ?? (
            <Box mt="6" padding="4" fontSize="sm" opacity="0.5">
              Snippet not found :(
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )
}
