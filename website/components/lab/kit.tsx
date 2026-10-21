"use client"

import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ReactIcon, SolidIcon, SvelteIcon, VueIcon } from "components/icons"
import Link from "next/link"
import { useId, useState, type ReactNode } from "react"
import { cva } from "styled-system/css"
import { Box, HStack, styled } from "styled-system/jsx"

export const Frame = styled("div", {
  base: {
    maxW: "8xl",
    mx: "auto",
    borderXWidth: { base: "0", xl: "1px" },
    borderColor: "border",
  },
})

export const Band = styled("section", {
  base: {
    borderTopWidth: "1px",
    borderColor: "border",
    position: "relative",
  },
})

export const Pad = styled("div", {
  base: {
    px: { base: "4", sm: "6", md: "10" },
    py: { base: "12", md: "20" },
  },
})

export const Eyebrow = styled("p", {
  base: {
    fontFamily: "mono",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "text.muted",
  },
})

export const Title = styled("h2", {
  base: {
    fontSize: { base: "28px", md: "36px" },
    lineHeight: "1.1",
    letterSpacing: "-0.03em",
    fontWeight: "semibold",
    color: "text.bold",
    textWrap: "balance",
  },
})

export const Lead = styled("p", {
  base: {
    fontSize: { base: "16px", md: "18px" },
    lineHeight: "1.6",
    color: "text.muted",
    maxW: "52ch",
    textWrap: "pretty",
  },
})

const btn = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2",
    h: "10",
    px: "4",
    fontSize: "14px",
    fontWeight: "medium",
    borderRadius: "md",
    transition: "background 120ms, border-color 120ms",
    focusVisibleRing: "outside",
  },
  variants: {
    tone: {
      solid: {
        bg: "text.bold",
        color: "bg",
        _hover: { opacity: 0.9 },
      },
      ghost: {
        borderWidth: "1px",
        borderColor: "border.bold",
        color: "text.bold",
        _hover: { bg: "bg.muted" },
      },
    },
  },
  defaultVariants: { tone: "solid" },
})

export function Btn(props: {
  href: string
  tone?: "solid" | "ghost"
  children: ReactNode
}) {
  return (
    <Link href={props.href} className={btn({ tone: props.tone })}>
      {props.children}
    </Link>
  )
}

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

export const frameworks = [
  { id: "react", label: "React", icon: ReactIcon },
  { id: "vue", label: "Vue", icon: VueIcon },
  { id: "solid", label: "Solid", icon: SolidIcon },
  { id: "svelte", label: "Svelte", icon: SvelteIcon },
] as const

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

const managers = [
  { id: "pnpm", cmd: "pnpm add @zag-js/react @zag-js/menu" },
  { id: "npm", cmd: "npm i @zag-js/react @zag-js/menu" },
  { id: "yarn", cmd: "yarn add @zag-js/react @zag-js/menu" },
  { id: "bun", cmd: "bun add @zag-js/react @zag-js/menu" },
]

export function Install() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "pnpm",
  })
  const api = tabs.connect(service, normalizeProps)
  const [copied, setCopied] = useState(false)
  const current = managers.find((m) => m.id === api.value) ?? managers[0]
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
        {managers.map((m) => (
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

import { cells } from "./cells"

export { cells }

export function Closing() {
  return (
    <Band>
      <Pad textAlign="center" py={{ base: "16", md: "28" }}>
        <Title maxW="20ch" mx="auto">
          Build your design system on state machines
        </Title>
        <Lead mx="auto" mt="4">
          Start with one component. Keep the logic when you switch frameworks.
        </Lead>
        <HStack justify="center" mt="8">
          <Ctas />
        </HStack>
      </Pad>
    </Band>
  )
}
