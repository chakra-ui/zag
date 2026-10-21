"use client"

import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Btn, Eyebrow } from "components/ui/layout"
import { frameworks, installCommands } from "lib/home"
import { useId, useState } from "react"
import { Box, HStack, styled } from "styled-system/jsx"

export function Ctas() {
  return (
    <HStack gap="3" flexWrap="wrap">
      <Btn href="/overview/introduction">Get started →</Btn>
      <Btn href="/components/react/accordion" tone="ghost">
        Browse components
      </Btn>
    </HStack>
  )
}

export function FrameworkRow() {
  return (
    <HStack gap="5" color="text.muted">
      <Eyebrow>Works with</Eyebrow>
      {frameworks.map((f) => (
        <Box key={f.id} fontSize="20px" title={f.label} filter="grayscale(1)">
          <f.icon />
        </Box>
      ))}
    </HStack>
  )
}

export function Install() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "pnpm",
  })
  const api = tabs.connect(service, normalizeProps)
  const [copied, setCopied] = useState(false)
  const current =
    installCommands.find((m) => m.id === api.value) ?? installCommands[0]
  return (
    <Box
      {...api.getRootProps()}
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.muted"
      maxW="lg"
      fontFamily="mono"
      fontSize="13px"
    >
      <HStack
        {...api.getListProps()}
        gap="0"
        borderBottomWidth="1px"
        borderColor="border"
        px="2"
      >
        {installCommands.map((m) => (
          <styled.button
            key={m.id}
            {...api.getTriggerProps({ value: m.id })}
            px="3"
            py="2"
            color="text.muted"
            borderBottomWidth="1px"
            borderColor="transparent"
            mb="-1px"
            _selected={{ color: "text.bold", borderColor: "text.bold" }}
          >
            {m.id}
          </styled.button>
        ))}
      </HStack>
      <HStack justify="space-between" px="4" py="3" gap="4">
        <styled.code color="text.bold" whiteSpace="nowrap" overflow="hidden">
          <styled.span color="text.muted">$ </styled.span>
          {current.cmd}
        </styled.code>
        <styled.button
          color="text.muted"
          _hover={{ color: "text.bold" }}
          onClick={() => {
            navigator.clipboard?.writeText(current.cmd)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
        >
          {copied ? "copied" : "copy"}
        </styled.button>
      </HStack>
    </Box>
  )
}
