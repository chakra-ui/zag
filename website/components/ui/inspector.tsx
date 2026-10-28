import type { ReactNode } from "react"
import { Box, HStack, styled } from "styled-system/jsx"

export interface InspectorRow {
  name: string
  value?: string
  on: boolean
  note?: string
  active?: boolean
}

export function Inspector(props: {
  part: string
  rows: InspectorRow[]
  footer?: ReactNode
  tone?: string
}) {
  const { part, rows, footer, tone = "var(--colors-accent)" } = props
  return (
    <Box display="flex" flexDirection="column" minW="0">
      <HStack
        justify="space-between"
        px="4"
        py="3.5"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <styled.p textStyle="eyebrow" color="fg.subtle">
          Inspecting
        </styled.p>
        <styled.p
          fontFamily="mono"
          fontSize="12px"
          color="syntax.attr"
          truncate
        >
          {part}
        </styled.p>
      </HStack>
      <Box py="1.5" role="list" aria-label={`Attributes on ${part}`}>
        {rows.map((row) => (
          <HStack
            key={row.name}
            role="listitem"
            gap="2.5"
            px="4"
            py="2"
            fontFamily="mono"
            fontSize="12px"
            transition="background 160ms ease-out"
            style={
              row.active
                ? {
                    background: `color-mix(in srgb, ${tone} 8%, transparent)`,
                    boxShadow: `inset 2px 0 0 ${tone}`,
                  }
                : undefined
            }
          >
            <Box
              boxSize="1.5"
              rounded="full"
              flexShrink="0"
              borderWidth={row.on ? "0" : "1px"}
              borderColor="fg.faint"
              transition="background 160ms ease-out"
              style={{
                background: row.on
                  ? row.active
                    ? tone
                    : "var(--colors-accent)"
                  : "transparent",
              }}
            />
            <styled.span
              color={row.on ? (row.active ? "fg" : "fg.muted") : "fg.faint"}
            >
              {row.name}
            </styled.span>
            <styled.span
              ms="auto"
              color={row.value ? "syntax.string" : "fg.subtle"}
            >
              {row.value ? `"${row.value}"` : row.on ? "on" : "off"}
              {row.note && (
                <styled.span color="fg.faint"> · {row.note}</styled.span>
              )}
            </styled.span>
          </HStack>
        ))}
      </Box>
      {footer && (
        <Box px="4" py="3" borderTopWidth="1px" borderColor="border">
          {footer}
        </Box>
      )}
    </Box>
  )
}
