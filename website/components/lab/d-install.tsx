"use client"

import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { adapters } from "components/lab/d-adapters"
import { Eyebrow } from "components/lab/kit"
import { useId } from "react"
import { Box, Grid, HStack, styled } from "styled-system/jsx"

const accent = { base: "#2f855a", _dark: "#48bb78" }

const notes: Record<string, string> = {
  react: "useMachine returns a service. Spread props on JSX.",
  vue: "Props bind with v-bind. Reactivity through computed.",
  solid: "Fine-grained. The api is a memo, no re-renders.",
  svelte: "Runes-native. $derived keeps the api in sync.",
  preact: "Same hooks as React, a fraction of the bytes.",
}

function Command(props: { cmd: string }) {
  const service = useMachine(clipboard.machine, {
    id: useId(),
    value: props.cmd,
    timeout: 1400,
  })
  const api = clipboard.connect(service, normalizeProps)
  return (
    <HStack
      {...api.getRootProps()}
      gap="3"
      justify="space-between"
      h="10"
      pl="3"
      pr="1"
      borderWidth="1px"
      borderColor="border"
      borderRadius="md"
      bg="bg.muted"
      fontFamily="mono"
      fontSize="12px"
      transition="border-color 200ms"
      _hover={{ borderColor: "border.bold" }}
    >
      <styled.code
        color="text.bold"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        <styled.span color="text.muted">$ </styled.span>
        {props.cmd}
      </styled.code>
      <styled.button
        {...api.getTriggerProps()}
        flexShrink="0"
        display="inline-flex"
        alignItems="center"
        gap="1.5"
        h="8"
        px="2.5"
        borderRadius="sm"
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
  )
}

export function InstallCards() {
  return (
    <Grid
      gap="1px"
      bg="border"
      borderTopWidth="1px"
      borderColor="border"
      columns={{ base: 1, md: 2, xl: 3 }}
      css={{ "& > *": { bg: "bg" } }}
    >
      {adapters.map((a) => (
        <Box
          key={a.id}
          p={{ base: "6", md: "8" }}
          display="flex"
          flexDirection="column"
          gap="5"
        >
          <HStack gap="3">
            <Box
              w="9"
              h="9"
              display="grid"
              placeItems="center"
              borderWidth="1px"
              borderColor="border"
              borderRadius="md"
              bg="bg.muted"
              filter="grayscale(1)"
              css={{ "& svg": { w: "4.5", h: "4.5" } }}
            >
              <a.icon />
            </Box>
            <Box>
              <styled.h3
                fontSize="16px"
                fontWeight="semibold"
                color="text.bold"
              >
                {a.label}
              </styled.h3>
              <Eyebrow fontSize="10px">{a.flavor}</Eyebrow>
            </Box>
          </HStack>
          <styled.p
            color="text.muted"
            fontSize="14.5px"
            lineHeight="1.6"
            flex="1"
          >
            {notes[a.id]}
          </styled.p>
          <Command cmd={`pnpm add @zag-js/${a.id}`} />
        </Box>
      ))}
      <Box
        p={{ base: "6", md: "8" }}
        display="flex"
        flexDirection="column"
        gap="5"
      >
        <HStack gap="3">
          <Box
            w="9"
            h="9"
            display="grid"
            placeItems="center"
            borderWidth="1px"
            borderColor={accent}
            borderRadius="md"
            color={accent}
            fontFamily="mono"
            fontSize="13px"
          >
            fx
          </Box>
          <Box>
            <styled.h3 fontSize="16px" fontWeight="semibold" color="text.bold">
              Any machine
            </styled.h3>
            <Eyebrow fontSize="10px">50+ components</Eyebrow>
          </Box>
        </HStack>
        <styled.p
          color="text.muted"
          fontSize="14.5px"
          lineHeight="1.6"
          flex="1"
        >
          Machines are separate packages. Install only what you render.
        </styled.p>
        <Command cmd="pnpm add @zag-js/menu" />
      </Box>
    </Grid>
  )
}
