"use client"

import { Box, styled } from "styled-system/jsx"
import type { HTerm } from "./h-copy"

export const accent = { base: "#2f855a", _dark: "#48bb78" } as const

export function ConnectPanel(props: {
  title: string
  id: string
  terms: HTerm[]
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.muted"
      overflow="hidden"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="3"
        px="4"
        h="10"
        borderBottomWidth="1px"
        borderColor="border"
        fontFamily="mono"
        fontSize="12px"
      >
        <styled.span color="text.bold">
          {props.title} <styled.span color="text.muted">→</styled.span>
        </styled.span>
        <styled.span color="text.muted" fontSize="11px">
          {props.id}
        </styled.span>
      </Box>
      <Box px="4" py="4" fontSize="14px" lineHeight="1.6">
        <styled.span fontFamily="mono" color="text.muted" aria-hidden="true">
          {"{"}
        </styled.span>
        <styled.dl display="flex" flexDirection="column" gap="3" py="2" ps="4">
          {props.terms.map((t) => (
            <div key={t.term}>
              <styled.dt
                display="inline"
                fontFamily="mono"
                fontSize="13px"
                color="text.bold"
              >
                {t.key}
                <styled.span color="text.muted">: </styled.span>
              </styled.dt>
              <styled.dd display="inline" color="text.muted" textWrap="pretty">
                <styled.span fontFamily="mono" opacity="0.7">
                  &quot;
                </styled.span>
                {t.body}
                <styled.span fontFamily="mono" opacity="0.7">
                  &quot;
                </styled.span>
                <styled.span fontFamily="mono" opacity="0.7">
                  ,
                </styled.span>
              </styled.dd>
            </div>
          ))}
        </styled.dl>
        <styled.span fontFamily="mono" color="text.muted" aria-hidden="true">
          {"}"}
        </styled.span>
      </Box>
    </Box>
  )
}
