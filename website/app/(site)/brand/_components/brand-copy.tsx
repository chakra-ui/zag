"use client"

import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Box, HStack, styled } from "styled-system/jsx"

const accent = { base: "#2f855a", _dark: "#48bb78" }

function useCopy(value: string) {
  const service = useMachine(clipboard.machine, {
    id: useId(),
    value,
    timeout: 1400,
  })
  return clipboard.connect(service, normalizeProps)
}

export function CopyHex(props: { value: string; label: string }) {
  const api = useCopy(props.value)
  return (
    <Box {...api.getRootProps()}>
      <styled.button
        {...api.getTriggerProps()}
        aria-label={`Copy ${props.label} hex ${props.value}`}
        display="inline-flex"
        alignItems="center"
        gap="2"
        h="7"
        px="2"
        ms="-2"
        borderRadius="sm"
        fontFamily="mono"
        fontSize="12px"
        color="text.subtle"
        transition="color 150ms, background 150ms"
        _hover={{ color: "text.bold", bg: "bg.muted" }}
        focusVisibleRing="inside"
      >
        <span>{props.value}</span>
        <styled.span color={api.copied ? accent : "text.muted"}>
          {api.copied ? "copied" : "copy"}
        </styled.span>
      </styled.button>
    </Box>
  )
}

export function CopySnippet(props: { label: string; value: string }) {
  const api = useCopy(props.value)
  return (
    <Box
      {...api.getRootProps()}
      borderWidth="1px"
      borderColor="border"
      borderRadius="md"
      bg="bg.muted"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        h="9"
        pl="3"
        pr="1"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <styled.span
          fontFamily="mono"
          fontSize="11px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="text.muted"
        >
          {props.label}
        </styled.span>
        <styled.button
          {...api.getTriggerProps()}
          aria-label={`Copy ${props.label} snippet`}
          h="7"
          px="2.5"
          borderRadius="sm"
          fontFamily="mono"
          fontSize="12px"
          color="text.muted"
          transition="color 150ms, background 150ms"
          _hover={{ color: "text.bold", bg: "bg" }}
          focusVisibleRing="inside"
        >
          <styled.span color={api.copied ? accent : undefined}>
            {api.copied ? "copied" : "copy"}
          </styled.span>
        </styled.button>
      </HStack>
      <styled.pre
        p="3"
        fontFamily="mono"
        fontSize="12px"
        lineHeight="1.7"
        color="text.subtle"
        overflowX="auto"
        whiteSpace="pre"
      >
        {props.value}
      </styled.pre>
    </Box>
  )
}
