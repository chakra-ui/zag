"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { useId, useState } from "react"
import { Box, HStack, styled } from "styled-system/jsx"
import { accent } from "./tokens"

const modes = [
  {
    id: "humans",
    label: "For humans",
    prefix: "$",
    text: "npm install @zag-js/react @zag-js/menu",
  },
  {
    id: "agents",
    label: "For agents",
    prefix: "→",
    text: "https://zagjs.com/llms.txt",
  },
]

export function InstallPill() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "humans",
  })
  const api = tabs.connect(service, normalizeProps)
  const [copied, setCopied] = useState(false)
  const current = modes.find((m) => m.id === api.value) ?? modes[0]

  return (
    <Box {...api.getRootProps()} w="full" maxW="520px">
      <HStack {...api.getListProps()} gap="4" mb="2.5">
        {modes.map((m) => (
          <styled.button
            key={m.id}
            {...api.getTriggerProps({ value: m.id })}
            fontFamily="mono"
            fontSize="12px"
            color="text.muted"
            cursor="pointer"
            _hover={{ color: "text.bold" }}
            _selected={{ color: "text.bold" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: accent,
              outlineOffset: "2px",
            }}
          >
            {m.label}
          </styled.button>
        ))}
      </HStack>
      {modes.map((m) => (
        <HStack
          key={m.id}
          {...api.getContentProps({ value: m.id })}
          justify="space-between"
          gap="4"
          h="12"
          pl="4"
          pr="1.5"
          borderWidth="1px"
          borderColor="border.bold"
          borderRadius="full"
          bg="bg.muted"
          fontFamily="mono"
          fontSize={{ base: "12px", sm: "13px" }}
          _hidden={{ display: "none" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: accent,
            outlineOffset: "2px",
          }}
        >
          <styled.code
            color="text.bold"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            <styled.span color="text.muted">{m.prefix} </styled.span>
            {m.text}
          </styled.code>
          <styled.button
            flexShrink="0"
            h="9"
            px="4"
            borderRadius="full"
            bg="text.bold"
            color="bg"
            fontSize="12px"
            cursor="pointer"
            _hover={{ opacity: 0.9 }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: accent,
              outlineOffset: "2px",
            }}
            onClick={() => {
              navigator.clipboard?.writeText(current.text)
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            }}
          >
            {copied ? "copied" : "copy"}
          </styled.button>
        </HStack>
      ))}
    </Box>
  )
}
