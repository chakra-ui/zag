"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { frameworks } from "components/lab/kit"
import { useId, useState } from "react"
import { Box, Grid, HStack, styled } from "styled-system/jsx"
import { CodeHtml } from "./code-html"
import { LiveMenu } from "./live-menu"
import { accent } from "./tokens"

export type HeroPanel = { id: string; file: string; html: string; code: string }

export function HeroCode(props: { panels: HeroPanel[] }) {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "react",
  })
  const api = tabs.connect(service, normalizeProps)
  const current = props.panels.find((p) => p.id === api.value)
  const [copied, setCopied] = useState(false)

  return (
    <Grid
      gridTemplateColumns={{
        base: "minmax(0, 1fr)",
        lg: "minmax(0, 7fr) minmax(0, 5fr)",
      }}
      gap={{ base: "4", lg: "6" }}
    >
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
          <HStack {...api.getListProps()} gap="5" h="10" overflowX="auto">
            {frameworks.map((f) => (
              <styled.button
                key={f.id}
                {...api.getTriggerProps({ value: f.id })}
                position="relative"
                h="full"
                flexShrink="0"
                display="inline-flex"
                alignItems="center"
                gap="1.5"
                fontFamily="mono"
                fontSize="12px"
                color="text.muted"
                cursor="pointer"
                transition="color 120ms"
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
                <Box
                  filter="grayscale(1)"
                  opacity="0.8"
                  css={{ "& svg": { w: "14px", h: "14px" } }}
                >
                  <f.icon />
                </Box>
                {f.label}
              </styled.button>
            ))}
          </HStack>
          <HStack gap="4" fontFamily="mono" fontSize="11px" color="text.muted">
            <styled.span display={{ base: "none", sm: "inline" }}>
              {current?.file}
            </styled.span>
            <styled.button
              cursor="pointer"
              _hover={{ color: "text.bold" }}
              _focusVisible={{
                outline: "2px solid",
                outlineColor: accent,
                outlineOffset: "2px",
              }}
              onClick={() => {
                navigator.clipboard?.writeText(current?.code.trim() ?? "")
                setCopied(true)
                setTimeout(() => setCopied(false), 1200)
              }}
            >
              {copied ? "copied" : "copy"}
            </styled.button>
          </HStack>
        </HStack>
        {props.panels.map((p) => (
          <CodeHtml
            key={p.id}
            html={p.html}
            {...api.getContentProps({ value: p.id })}
            overflowY="auto"
            _focusVisible={{
              outline: "2px solid",
              outlineColor: accent,
              outlineOffset: "-2px",
            }}
          />
        ))}
      </Box>
      <Box
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
        minH={{ base: "240px", lg: "auto" }}
        p="6"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap="6"
      >
        <styled.p fontFamily="mono" fontSize="11px" color="text.muted">
          live · same machine · 4 frameworks
        </styled.p>
        <Box
          flex="1"
          display="flex"
          alignItems="flex-start"
          justifyContent="center"
          pt={{ lg: "16" }}
        >
          <LiveMenu items={["Edit", "Share"]} />
        </Box>
      </Box>
    </Grid>
  )
}
