"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"
import { accent } from "./tokens"

const allItems = ["Edit", "Duplicate", "Share", "Delete"]

const trigger = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  h: "9",
  px: "3.5",
  fontSize: "14px",
  fontWeight: "medium",
  color: "text.bold",
  bg: "bg",
  borderWidth: "1px",
  borderColor: "border.bold",
  borderRadius: "md",
  cursor: "pointer",
  transition: "background 120ms, border-color 120ms",
  _hover: { bg: "bg.muted" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: accent,
    outlineOffset: "2px",
  },
})

const content = css({
  minW: "180px",
  p: "1",
  bg: "bg",
  borderWidth: "1px",
  borderColor: "border.bold",
  borderRadius: "md",
  boxShadow: "0 12px 32px -12px rgba(0, 0, 0, 0.25)",
  listStyle: "none",
  outline: "none",
  zIndex: "10",
})

const item = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: "2.5",
  py: "1.5",
  fontSize: "14px",
  color: "text",
  borderRadius: "sm",
  cursor: "pointer",
  userSelect: "none",
  _highlighted: { bg: "bg.muted", color: "text.bold" },
})

function useMenu(onSelect?: (value: string) => void) {
  const service = useMachine(menu.machine, {
    id: useId(),
    onSelect: (details) => onSelect?.(details.value),
  })
  return menu.connect(service, normalizeProps)
}

type Api = ReturnType<typeof useMenu>

function MenuView(props: { api: Api; items?: string[] }) {
  const { api, items = allItems } = props
  return (
    <>
      <button className={trigger} {...api.getTriggerProps()}>
        Actions
        <styled.span
          {...api.getIndicatorProps()}
          fontSize="10px"
          color="text.muted"
          transition="transform 150ms"
          _open={{ transform: "rotate(180deg)" }}
        >
          ▼
        </styled.span>
      </button>
      <div {...api.getPositionerProps()}>
        <ul className={content} {...api.getContentProps()}>
          {items.map((label) => (
            <li
              key={label}
              className={item}
              {...api.getItemProps({ value: label.toLowerCase() })}
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function Picked(props: { value: string | null }) {
  return (
    <styled.p fontFamily="mono" fontSize="12px" color="text.muted">
      onSelect →{" "}
      <styled.span color={props.value ? accent : "text.muted"}>
        {props.value ? `"${props.value}"` : "…"}
      </styled.span>
    </styled.p>
  )
}

export function LiveMenu(props: { items?: string[] }) {
  const api = useMenu()
  return <MenuView api={api} items={props.items} />
}

const inspected = [
  "aria-haspopup",
  "aria-expanded",
  "aria-controls",
  "data-state",
] as const

export function InspectMenu() {
  const [last, setLast] = useState<string | null>(null)
  const api = useMenu(setLast)
  const props = api.getTriggerProps() as Record<string, unknown>
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap={{ base: "8", md: "16" }}
      align="flex-start"
      w="full"
    >
      <MenuView api={api} />
      <Box flex="1" minW="0" fontFamily="mono" fontSize="12px" lineHeight="1.9">
        <styled.p color="text.muted" mb="2">
          &lt;button
        </styled.p>
        {inspected.map((key) => (
          <HStack key={key} gap="0" pl="4" flexWrap="wrap">
            <styled.span color="text.muted">{key}=</styled.span>
            <styled.span
              color={key === "aria-expanded" && api.open ? accent : "text.bold"}
            >
              &quot;{String(props[key])}&quot;
            </styled.span>
          </HStack>
        ))}
        <styled.p color="text.muted" mb="4">
          &gt;
        </styled.p>
        <Picked value={last} />
      </Box>
    </Stack>
  )
}

function scope(source: string, className: string) {
  return source.replace(/^(\[.*)\{$/gm, `.${className} $1{`)
}

const lookVars = css({
  "--fg": "var(--colors-text-bold)",
  "--bg": "var(--colors-bg)",
  "--line": "var(--colors-border-bold)",
  "--muted": "var(--colors-bg-muted)",
  "--accent": "#2f855a",
  _dark: { "--accent": "#48bb78" },
})

export function LookMenu(props: { name: string; source: string }) {
  const api = useMenu()
  const className = `hd-look-${props.name}`
  return (
    <div className={`${className} ${lookVars}`}>
      <style>{scope(props.source, className)}</style>
      <MenuView api={api} />
    </div>
  )
}
