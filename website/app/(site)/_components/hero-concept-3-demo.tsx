"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useRef, useState } from "react"
import { Box, Stack, styled } from "styled-system/jsx"
import { accent } from "./shared"

const items = [
  { value: "rename", label: "Rename" },
  { value: "copy", label: "Copy" },
  { value: "share", label: "Share" },
  { value: "delete", label: "Delete" },
]

const flashBg = {
  base: "rgba(47, 133, 90, 0.08)",
  _dark: "rgba(72, 187, 120, 0.10)",
} as const
const flashMs = 1000

function tokenize(src: string): [string, string][] {
  const out: [string, string][] = []
  const re =
    /(\s+)|(const\b)|("[^"]*")|([A-Za-z_][A-Za-z0-9_]*)(?=\()|(<\/?)([a-z]+)|(\.\.\.|=>|=)|([A-Za-z_][A-Za-z0-9_]*)|([^\sA-Za-z_"]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src))) {
    if (m[1]) out.push(["", m[1]])
    else if (m[2]) out.push(["keyword", m[2]])
    else if (m[3]) out.push(["string", m[3]])
    else if (m[4]) out.push(["function", m[4]])
    else if (m[5]) {
      out.push(["punctuation", m[5]])
      out.push(["tag", m[6]])
    } else if (m[7]) out.push(["operator", m[7]])
    else if (m[8]) out.push(["", m[8]])
    else if (m[9]) out.push(["punctuation", m[9]])
  }
  return out
}

type Snapshot = { open: boolean; highlighted: string | null }
type Chip = { name: string; value?: string }
type Line = { src: string; gap?: boolean; chip?: (s: Snapshot) => Chip | null }

const lines: Line[] = [
  {
    src: 'const service = useMachine(menu.machine, { id: "edit" })',
    chip: (s) => ({ name: "state", value: s.open ? '"open"' : '"closed"' }),
  },
  { src: "const api = menu.connect(service, normalizeProps)" },
  {
    src: "<button {...api.getTriggerProps()}>Edit</button>",
    gap: true,
    chip: (s) => ({ name: "aria-expanded", value: String(s.open) }),
  },
  { src: "<div {...api.getPositionerProps()}>" },
  { src: "  <ul {...api.getContentProps()}>" },
  ...items.map((item): Line => ({
    src: `    <li {...api.getItemProps({ value: "${item.value}" })}>${item.label}</li>`,
    chip: (s) =>
      s.highlighted === item.value ? { name: "data-highlighted" } : null,
  })),
  { src: "  </ul>" },
  { src: "</div>" },
]

type Step = { wait: number; run: (api: menu.Api, close: () => void) => void }

const script: Step[] = [
  { wait: 1600, run: (api) => api.setOpen(true) },
  { wait: 1100, run: (api) => api.setHighlightedValue("rename") },
  { wait: 950, run: (api) => api.setHighlightedValue("copy") },
  { wait: 950, run: (api) => api.setHighlightedValue("share") },
  { wait: 1500, run: (_api, close) => close() },
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduced
}

export function MenuWithChips() {
  const [live, setLive] = useState(false)
  const liveRef = useRef(false)
  const [selected, setSelected] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const guard = (event: { preventDefault(): void }) => {
    if (!liveRef.current) event.preventDefault()
  }

  const service = useMachine(menu.machine, {
    id: useId(),
    "aria-label": "Edit",
    positioning: { placement: "right", gutter: 12 },
    onSelect: (details) => setSelected(details.value),
    onInteractOutside: guard,
    onEscapeKeyDown: guard,
    onFocusOutside: guard,
  })
  const api = menu.connect(service, normalizeProps)

  const apiRef = useRef(api)
  apiRef.current = api
  const closeQuietly = () =>
    service.send({ type: "CLOSE", restoreFocus: false })
  const closeRef = useRef(closeQuietly)
  closeRef.current = closeQuietly

  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (live) return
    if (reduced) {
      const a = apiRef.current
      if (!a.open) a.setOpen(true)
      const id = requestAnimationFrame(() =>
        apiRef.current.setHighlightedValue("copy"),
      )
      return () => cancelAnimationFrame(id)
    }
    let index = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let visible = false
    const tick = () => {
      const step = script[index]
      timer = setTimeout(() => {
        step.run(apiRef.current, closeRef.current)
        index = (index + 1) % script.length
        if (visible) tick()
      }, step.wait)
    }
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting
        if (next === visible) return
        visible = next
        clearTimeout(timer)
        if (visible) tick()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [live, reduced])

  const handOver = () => {
    if (liveRef.current) return
    liveRef.current = true
    setLive(true)
  }

  const snapshot: Snapshot = {
    open: service.state.hasTag("open"),
    highlighted: api.highlightedValue,
  }
  const chips = lines.map((line) => line.chip?.(snapshot) ?? null)
  const flashing = useFlash(
    chips.map((c) => (c ? `${c.name}:${c.value ?? ""}` : null)),
  )

  return (
    <Box
      ref={rootRef}
      data-hero-demo=""
      w="full"
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      bg="bg"
      overflow="hidden"
    >
      <style>{keyframes}</style>
      <Box
        position="relative"
        h="196px"
        display="flex"
        alignItems="center"
        justifyContent={{ base: "flex-start", md: "center" }}
        px={{ base: "5", md: "8" }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") handOver()
        }}
        onPointerDown={handOver}
        onFocus={handOver}
        onKeyDown={handOver}
      >
        <Stack
          gap="2.5"
          alignItems={{ base: "flex-start", md: "center" }}
          mt="-2px"
        >
          <styled.button
            {...api.getTriggerProps()}
            display="inline-flex"
            alignItems="center"
            gap="2"
            h="9"
            pl="3.5"
            pr="3"
            fontSize="14px"
            fontWeight="medium"
            color="text.bold"
            bg="bg"
            borderWidth="1px"
            borderColor="border"
            borderRadius="md"
            cursor="pointer"
            outline="none"
            transition="border-color 160ms, background 160ms"
            _hover={{ bg: "bg.muted" }}
            _open={{
              bg: "bg.muted",
              borderColor: { base: "gray.300", _dark: "whiteAlpha.300" },
            }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "border.primary.bold",
              outlineOffset: "2px",
            }}
          >
            Edit
            <styled.svg
              viewBox="0 0 16 16"
              w="3.5"
              h="3.5"
              color="text.muted"
              transition="transform 180ms"
              css={{ "[data-state=open] > &": { transform: "rotate(-90deg)" } }}
              aria-hidden
            >
              <path
                d="M4 6l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </styled.svg>
          </styled.button>
          <styled.p
            fontFamily="mono"
            fontSize="11px"
            color="text.muted"
            whiteSpace="nowrap"
            transition="opacity 160ms"
            opacity={api.open ? 0 : 1}
            aria-live="polite"
          >
            {selected ? (
              <>
                onSelect{" "}
                <styled.span color="text.bold">{`{ value: "${selected}" }`}</styled.span>
              </>
            ) : (
              "click, ↑ ↓, Enter, Esc"
            )}
          </styled.p>
        </Stack>
        <div {...api.getPositionerProps()}>
          <styled.ul
            {...api.getContentProps()}
            inert={!live || undefined}
            minW="176px"
            p="1"
            bg="bg.popover"
            borderWidth="1px"
            borderColor="border"
            borderRadius="lg"
            boxShadow={{
              base: "0 1px 2px rgba(0,0,0,0.04), 0 12px 28px -12px rgba(0,0,0,0.18)",
              _dark: "0 12px 28px -12px rgba(0,0,0,0.7)",
            }}
            outline="none"
            listStyle="none"
            css={{
              "&[data-state=open]": {
                animation: "zc3-in 140ms cubic-bezier(0.2, 0, 0, 1)",
              },
              _motionReduce: { animation: "none!" },
            }}
          >
            {items.map((item) => (
              <styled.li
                key={item.value}
                {...api.getItemProps({ value: item.value })}
                display="flex"
                alignItems="center"
                h="8"
                px="2.5"
                fontSize="14px"
                color="text.subtle"
                borderRadius="md"
                cursor="pointer"
                userSelect="none"
                _highlighted={{
                  bg: { base: "gray.100", _dark: "whiteAlpha.100" },
                  color: "text.bold",
                }}
              >
                {item.label}
              </styled.li>
            ))}
          </styled.ul>
        </div>
      </Box>
      <styled.pre
        className="language-tsx"
        m="0"
        p="0"
        py="4"
        borderWidth="0"
        borderTopWidth="1px"
        borderColor="border"
        bg="code.block"
        overflowX="auto"
        fontFamily="mono"
        fontSize="12px"
        lineHeight="24px"
      >
        <Box minW="max-content" pl="3" pr="5">
          {lines.map((line, i) => (
            <CodeLine
              key={i}
              line={line}
              chip={chips[i]}
              flash={flashing.has(i)}
            />
          ))}
        </Box>
      </styled.pre>
    </Box>
  )
}

function CodeLine(props: { line: Line; chip: Chip | null; flash: boolean }) {
  const { line, chip, flash } = props
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "104px 1fr", md: "162px 1fr" }}
      mt={line.gap ? "3" : "0"}
      data-flash={flash || undefined}
      css={{
        "& [data-code]": {
          transition:
            "background-color 900ms ease-out, border-color 900ms ease-out",
        },
        "&[data-flash] [data-code]": {
          bg: flashBg,
          borderColor: accent,
          transition: "none",
        },
        "& [data-chip]": {
          transition: "border-color 900ms ease-out, color 900ms ease-out",
        },
        "&[data-flash] [data-chip]": {
          borderColor: accent,
          color: accent,
          transition: "none",
        },
        "&[data-flash] [data-chip-value]": {
          color: accent,
          transition: "none",
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end" alignItems="center" pr="3">
        {chip && (
          <styled.span
            data-chip=""
            display="inline-flex"
            alignItems="center"
            justifyContent="space-between"
            gap="1.5"
            w={{ base: "92px", md: "148px" }}
            h="5"
            px="2.5"
            fontSize="10.5px"
            lineHeight="1"
            color="text.muted"
            borderWidth="1px"
            borderColor="border"
            borderRadius="full"
            bg="bg"
            whiteSpace="nowrap"
          >
            <styled.span display={{ base: "none", md: "inline" }}>
              {chip.name}
            </styled.span>
            {chip.value == null && (
              <styled.span display={{ base: "inline", md: "none" }}>
                {chip.name.replace("data-", "")}
              </styled.span>
            )}
            {chip.value != null && (
              <styled.span
                data-chip-value=""
                color="text.bold"
                transition="color 900ms ease-out"
                mx={{ base: "auto", md: "0" }}
              >
                {chip.value}
              </styled.span>
            )}
          </styled.span>
        )}
      </Box>
      <Box
        data-code=""
        borderLeftWidth="2px"
        borderColor="border"
        pl="4"
        whiteSpace="pre"
      >
        {tokenize(line.src).map(([type, text], j) =>
          type ? (
            <span key={j} className={`token ${type}`}>
              {text}
            </span>
          ) : (
            <span key={j}>{text}</span>
          ),
        )}
      </Box>
    </Box>
  )
}

function useFlash(keys: (string | null)[]) {
  const prev = useRef(keys)
  const [flashing, setFlashing] = useState<Set<number>>(() => new Set())
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const signature = keys.join("|")

  useEffect(() => {
    const changed: number[] = []
    keys.forEach((k, i) => {
      if (k !== prev.current[i] && k != null) changed.push(i)
    })
    prev.current = keys
    if (!changed.length) return
    setFlashing((s) => new Set([...s, ...changed]))
    for (const i of changed) {
      clearTimeout(timers.current.get(i))
      timers.current.set(
        i,
        setTimeout(() => {
          setFlashing((s) => {
            const next = new Set(s)
            next.delete(i)
            return next
          })
        }, flashMs),
      )
    }
  }, [signature])

  useEffect(() => {
    const map = timers.current
    return () => map.forEach((t) => clearTimeout(t))
  }, [])

  return flashing
}

const keyframes = `@keyframes zc3-in{from{opacity:0;transform:translateX(-4px) scale(0.98)}to{opacity:1;transform:none}}`
