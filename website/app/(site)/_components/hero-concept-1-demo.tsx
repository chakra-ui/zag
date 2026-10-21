"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { css } from "styled-system/css"
import { Box, HStack, styled } from "styled-system/jsx"
import { MenuChart, type MenuBeat } from "./hero-concept-1-chart"
import { accent } from "./shared"

const items = [
  { value: "rename", label: "Rename", hint: "F2" },
  { value: "duplicate", label: "Duplicate", hint: "⌘D" },
  { value: "share", label: "Share", hint: "⌘S" },
  { value: "delete", label: "Delete", hint: "⌫" },
]

type Step = [event: string, rest: number]

const scripts: Step[][] = [
  [
    ["TRIGGER_CLICK", 1700],
    ["ARROW_DOWN", 1300],
    ["ARROW_DOWN", 1300],
    ["ENTER", 1800],
    ["TRIGGER_BLUR", 1600],
  ],
  [
    ["TRIGGER_FOCUS", 1400],
    ["ARROW_DOWN", 1500],
    ["ARROW_DOWN", 1200],
    ["ARROW_DOWN", 1300],
    ["CLOSE", 1700],
    ["TRIGGER_BLUR", 1600],
  ],
]

const positioning = { placement: "bottom-end", gutter: 6 } as const

function useBeat(service: menu.Service) {
  const state = String(service.state.get())
  const highlighted = service.context.get("highlightedValue")
  const event = service.event.current()
  const last = useRef<{ state: string; highlighted: string | null } | null>(
    null,
  )
  const [beat, setBeat] = useState<MenuBeat | null>(null)
  const lastAt = useRef(0)

  useLayoutEffect(() => {
    const prev = last.current
    last.current = { state, highlighted }
    if (!prev) return
    if (prev.state === state && prev.highlighted === highlighted) return
    const now = performance.now()
    const follows = now - lastAt.current < 160
    lastAt.current = now
    setBeat((b) => {
      if (b && follows && b.event === event.type && prev.state === state) {
        return { ...b, highlighted }
      }
      return {
        id: (b?.id ?? 0) + 1,
        from: prev.state,
        to: state,
        event: event.type,
        highlighted,
        prevHighlighted: prev.highlighted,
      }
    })
  })

  return { state, highlighted, beat }
}

const itemClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6",
  px: "2.5",
  h: "8",
  rounded: "sm",
  cursor: "pointer",
  color: "text.muted",
  fontSize: "13px",
  outline: "0",
  _highlighted: {
    bg: { base: "gray.100", _dark: "whiteAlpha.100" },
    color: "text.bold",
  },
})

function FileRow(props: { api: menu.Api; children?: ReactNode }) {
  const { api } = props
  return (
    <HStack
      justify="space-between"
      gap="3"
      px="3"
      py="2.5"
      borderWidth="1px"
      borderColor="border"
      rounded="md"
      bg="bg"
    >
      <HStack gap="3" minW="0">
        <Box
          flexShrink="0"
          w="8"
          h="8"
          rounded="sm"
          borderWidth="1px"
          borderColor="border"
          display="grid"
          placeItems="center"
          fontFamily="mono"
          fontSize="9px"
          color="text.muted"
        >
          PDF
        </Box>
        <Box minW="0">
          <styled.p fontSize="14px" color="text.bold" truncate>
            q3-report.pdf
          </styled.p>
          <styled.p fontSize="12px" color="text.muted" truncate>
            2.4 MB · edited 2m ago
          </styled.p>
        </Box>
      </HStack>
      <styled.button
        {...api.getTriggerProps()}
        flexShrink="0"
        display="inline-flex"
        alignItems="center"
        gap="1.5"
        h="8"
        px="3"
        rounded="md"
        borderWidth="1px"
        borderColor="border.bold"
        fontSize="13px"
        color="text.muted"
        bg="bg"
        cursor="pointer"
        transition="color 160ms, border-color 160ms"
        _hover={{ color: "text.bold" }}
        _open={{ color: "text.bold" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "border.primary.bold",
          outlineOffset: "2px",
        }}
      >
        Actions
        <styled.svg
          viewBox="0 0 12 12"
          w="3"
          h="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          transition="transform 160ms"
          css={{ "[data-state=open] > &": { transform: "rotate(180deg)" } }}
          aria-hidden="true"
        >
          <path d="M3 4.5 L6 7.5 L9 4.5" />
        </styled.svg>
      </styled.button>
      {props.children}
    </HStack>
  )
}

function FileMenu(props: { api: menu.Api }) {
  const { api } = props
  return (
    <FileRow api={api}>
      <div {...api.getPositionerProps()}>
        <Box
          {...api.getContentProps()}
          w="200px"
          p="1"
          bg="bg.popover"
          borderWidth="1px"
          borderColor="border.bold"
          rounded="md"
          outline="0"
          boxShadow="0 16px 40px -18px rgb(0 0 0 / 0.35)"
          zIndex="1"
        >
          {items.map((item) => (
            <div
              key={item.value}
              {...api.getItemProps({ value: item.value })}
              className={itemClass}
            >
              <span>{item.label}</span>
              <styled.span fontFamily="mono" fontSize="11px" opacity="0.6">
                {item.hint}
              </styled.span>
            </div>
          ))}
        </Box>
      </div>
    </FileRow>
  )
}

type Tone = "muted" | "bold" | "accent"

const narratorClass = css({
  fontFamily: "mono",
  fontSize: "12px",
  color: "text.muted",
  "& [data-tone=bold]": { color: "text.bold" },
  "& [data-tone=accent]": { color: accent },
})

function narrate(state: string, beat: MenuBeat | null): [string, Tone][] {
  if (!beat)
    return [
      ["state = ", "muted"],
      [`"${state}"`, "accent"],
    ]
  const parts: [string, Tone][] = [
    ["send(", "muted"],
    [`"${beat.event}"`, "bold"],
    [") → ", "muted"],
  ]
  const moved = beat.from !== beat.to
  const highlightChanged = beat.highlighted !== beat.prevHighlighted
  if (moved) parts.push(["state = ", "muted"], [`"${beat.to}"`, "accent"])
  if (highlightChanged && (!moved || beat.highlighted != null)) {
    if (moved) parts.push([", ", "muted"])
    const value = beat.highlighted == null ? "null" : `"${beat.highlighted}"`
    parts.push(["highlightedValue = ", "muted"], [value, "bold"])
  }
  return parts
}

function Narrator(props: { state: string; beat: MenuBeat | null }) {
  return (
    <p className={narratorClass}>
      {narrate(props.state, props.beat).map(([text, tone], i) => (
        <span key={i} data-tone={tone}>
          {text}
        </span>
      ))}
    </p>
  )
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return reduced
}

export function MenuMachineDemo() {
  const liveService = useMachine(menu.machine, {
    id: useId(),
    positioning,
  })
  const ghostService = useMachine(menu.machine, {
    id: useId(),
    positioning,
  })
  const liveApi = menu.connect(liveService, normalizeProps)
  const ghostApi = menu.connect(ghostService, normalizeProps)

  const live = useBeat(liveService)
  const ghost = useBeat(ghostService)

  const [handedOver, setHandedOver] = useState(false)
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(true)
  const ghostRef = useRef(ghostService)
  ghostRef.current = ghostService

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (handedOver) return
    let cancelled = false
    const send = (type: string) => {
      if (!cancelled) ghostRef.current.send({ type })
    }

    if (reduced) {
      send("TRIGGER_CLICK")
      send("ARROW_DOWN")
      return () => {
        cancelled = true
      }
    }

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        let left = ms
        const tick = () => {
          if (cancelled) return resolve()
          if (visibleRef.current && !document.hidden) left -= 100
          if (left <= 0) resolve()
          else setTimeout(tick, 100)
        }
        setTimeout(tick, 100)
      })

    const run = async () => {
      await sleep(1400)
      let round = 0
      while (!cancelled) {
        const current = String(ghostRef.current.state.get())
        if (current !== "idle") {
          send("CLOSE")
          send("TRIGGER_BLUR")
          await sleep(1200)
        }
        for (const [type, rest] of scripts[round % scripts.length]) {
          if (cancelled) return
          send(type)
          await sleep(rest)
        }
        round++
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [handedOver, reduced])

  const takeOver = () => {
    if (!handedOver) setHandedOver(true)
  }

  const shown = handedOver ? live : ghost

  return (
    <Box
      ref={rootRef}
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      bg="bg"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        gap="3"
        px="4"
        py="2.5"
        borderBottomWidth="1px"
        borderColor="border"
        fontFamily="mono"
        fontSize="11px"
        color="text.muted"
      >
        <span>@zag-js/menu</span>
        <span>{handedOver ? "your input" : "autoplay · try it"}</span>
      </HStack>

      <Box
        position="relative"
        px={{ base: "3", md: "5" }}
        py={{ base: "4", md: "5" }}
        bg="bg.muted"
        zIndex="1"
        onPointerDownCapture={takeOver}
        onFocusCapture={takeOver}
        onKeyDownCapture={takeOver}
      >
        <Box opacity={handedOver ? 1 : 0}>
          <FileMenu api={liveApi} />
        </Box>
        {handedOver ? null : (
          <Box
            position="absolute"
            inset="0"
            px={{ base: "3", md: "5" }}
            pt={{ base: "4", md: "5" }}
            pointerEvents="none"
            inert
            aria-hidden="true"
          >
            <FileMenu api={ghostApi} />
          </Box>
        )}
      </Box>

      <Box
        px={{ base: "2", md: "5" }}
        pt={{ base: "4", md: "5" }}
        pb={{ base: "3", md: "4" }}
        borderTopWidth="1px"
        borderColor="border"
      >
        <MenuChart
          key={handedOver ? "live" : "ghost"}
          state={shown.state}
          highlighted={shown.highlighted}
          beat={handedOver ? live.beat : ghost.beat}
        />
      </Box>

      <Box
        px="4"
        py="3"
        borderTopWidth="1px"
        borderColor="border"
        minH="11"
        aria-live={handedOver ? "polite" : "off"}
      >
        <Narrator state={shown.state} beat={shown.beat} />
      </Box>
    </Box>
  )
}
