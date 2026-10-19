"use client"

import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ReactIcon, SolidIcon, SvelteIcon, VueIcon } from "components/icons"
import { showcaseItems } from "lib/showcase"
import Link from "next/link"
import { useId, useState, type ReactNode } from "react"
import { css, cva } from "styled-system/css"
import { Box, Grid, HStack, styled } from "styled-system/jsx"

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

export const Display = styled("h1", {
  base: {
    fontSize: { base: "40px", md: "56px", lg: "64px" },
    lineHeight: "1.02",
    letterSpacing: "-0.04em",
    fontWeight: "semibold",
    color: "text.bold",
    textWrap: "balance",
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

export const cells = css({
  gap: "1px",
  bg: "border",
  borderTopWidth: "1px",
  borderColor: "border",
  "& > *": { bg: "bg" },
})

export function Cell(props: {
  label?: string
  title: string
  children?: ReactNode
  visual?: ReactNode
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      p={{ base: "6", md: "8" }}
      gap="6"
    >
      {props.visual && (
        <Box
          minH="180px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderWidth="1px"
          borderColor="border"
          borderRadius="lg"
          bg="bg.muted"
          overflow="hidden"
        >
          {props.visual}
        </Box>
      )}
      <Box>
        {props.label && <Eyebrow mb="2">{props.label}</Eyebrow>}
        <styled.h3 fontSize="17px" fontWeight="semibold" color="text.bold">
          {props.title}
        </styled.h3>
        {props.children && (
          <styled.p mt="2" color="text.muted" fontSize="15px" lineHeight="1.6">
            {props.children}
          </styled.p>
        )}
      </Box>
    </Box>
  )
}

export const pillars = [
  {
    label: "01 / Logic",
    title: "Statecharts, not effects",
    body: "Every component is a finite state machine. No impossible states, no tangle of booleans.",
  },
  {
    label: "02 / A11y",
    title: "Accessible by default",
    body: "Machines return WAI-ARIA props, keyboard handling and focus management for you.",
  },
  {
    label: "03 / Portable",
    title: "Write once, any framework",
    body: "One machine runs in React, Vue, Solid, Svelte and Preact through a thin adapter.",
  },
  {
    label: "04 / Headless",
    title: "Bring your own styles",
    body: "Zero CSS shipped. Style with Tailwind, Panda, CSS Modules or plain CSS.",
  },
]

export function Stats() {
  const items = [
    ["65M+", "npm downloads"],
    ["5.2K", "GitHub stars"],
    ["50+", "components"],
    ["5", "frameworks"],
  ]
  return (
    <Grid className={cells} gap="1px" columns={{ base: 2, md: 4 }}>
      {items.map(([value, label]) => (
        <Box key={label} px={{ base: "6", md: "8" }} py="10">
          <styled.p
            fontSize={{ base: "36px", md: "48px" }}
            letterSpacing="-0.04em"
            fontWeight="semibold"
            color="text.bold"
            fontVariantNumeric="tabular-nums"
          >
            {value}
          </styled.p>
          <Eyebrow mt="1">{label}</Eyebrow>
        </Box>
      ))}
    </Grid>
  )
}

export function UsedBy() {
  return (
    <Box px={{ base: "4", sm: "6", md: "10" }} py="8">
      <Eyebrow mb="5">Powering</Eyebrow>
      <HStack gap={{ base: "6", md: "10" }} flexWrap="wrap">
        {showcaseItems.slice(0, 9).map((item) => (
          <styled.a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            fontSize="16px"
            fontWeight="semibold"
            letterSpacing="-0.02em"
            color="text.muted"
            _hover={{ color: "text.bold" }}
          >
            {item.name}
          </styled.a>
        ))}
      </HStack>
    </Box>
  )
}

export function Steps() {
  const steps = [
    [
      "Install",
      "Add the adapter and the machine you need.",
      "pnpm add @zag-js/react @zag-js/menu",
    ],
    [
      "Consume",
      "Start the machine with useMachine.",
      "const service = useMachine(menu.machine, { id })",
    ],
    [
      "Connect",
      "Get typed props and spread them on your markup.",
      "const api = menu.connect(service, normalizeProps)",
    ],
  ]
  return (
    <Grid className={cells} gap="1px" columns={{ base: 1, md: 3 }}>
      {steps.map(([title, body, code], i) => (
        <Box key={title} p={{ base: "6", md: "8" }}>
          <Eyebrow>0{i + 1}</Eyebrow>
          <styled.h3
            mt="3"
            fontSize="17px"
            fontWeight="semibold"
            color="text.bold"
          >
            {title}
          </styled.h3>
          <styled.p mt="2" color="text.muted" fontSize="15px">
            {body}
          </styled.p>
          <styled.pre
            mt="6"
            p="4"
            borderWidth="1px"
            borderColor="border"
            borderRadius="md"
            bg="bg.muted"
            fontFamily="mono"
            fontSize="12px"
            color="text.subtle"
            overflowX="auto"
          >
            {code}
          </styled.pre>
        </Box>
      ))}
    </Grid>
  )
}

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
