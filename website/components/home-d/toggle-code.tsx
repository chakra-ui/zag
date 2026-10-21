"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { useId } from "react"
import { Box, HStack, styled } from "styled-system/jsx"
import { CodeHtml } from "./code-html"
import { accent } from "./tokens"

export type TogglePanel = {
  id: string
  label: string
  meta: string
  html: string
}

export function ToggleCode(props: { panels: TogglePanel[]; maxH?: string }) {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: props.panels[0]?.id,
  })
  const api = tabs.connect(service, normalizeProps)
  const meta = props.panels.find((p) => p.id === api.value)?.meta

  return (
    <Box
      {...api.getRootProps()}
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.code.block"
      overflow="hidden"
      minW="0"
    >
      <HStack
        justify="space-between"
        gap="4"
        px="4"
        boxShadow="inset 0 -1px 0 token(colors.border)"
      >
        <HStack {...api.getListProps()} gap="5" h="10">
          {props.panels.map((p) => (
            <styled.button
              key={p.id}
              {...api.getTriggerProps({ value: p.id })}
              position="relative"
              h="full"
              fontFamily="mono"
              fontSize="12px"
              color="text.muted"
              cursor="pointer"
              _hover={{ color: "text.bold" }}
              _selected={{
                color: "text.bold",
                _after: {
                  content: '""',
                  position: "absolute",
                  insetX: "0",
                  bottom: "0",
                  h: "1px",
                  bg: "text.bold",
                },
              }}
              _focusVisible={{
                outline: "2px solid",
                outlineColor: accent,
                outlineOffset: "-2px",
              }}
            >
              {p.label}
            </styled.button>
          ))}
        </HStack>
        <styled.span fontFamily="mono" fontSize="11px" color="text.muted">
          {meta}
        </styled.span>
      </HStack>
      {props.panels.map((p) => (
        <CodeHtml
          key={p.id}
          html={p.html}
          {...api.getContentProps({ value: p.id })}
          maxH={props.maxH}
          overflowY="auto"
          _focusVisible={{
            outline: "2px solid",
            outlineColor: accent,
            outlineOffset: "-2px",
          }}
        />
      ))}
    </Box>
  )
}
