"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { css } from "styled-system/css"
import { Box, HStack, styled } from "styled-system/jsx"
import {
  MenuChart,
  motionVars,
  travel,
  typeStep,
  type MenuBeat,
} from "./hero-concept-1-chart"
import { rest, resumeAfter } from "./motion"
import { accent } from "./shared"

const items = [
  { value: "rename", label: "Rename", hint: "F2" },
  { value: "duplicate", label: "Duplicate", hint: "⌘D" },
  { value: "share", label: "Share", hint: "⌘S" },
  { value: "delete", label: "Delete", hint: "⌫" },
]

type Step = [event: string, rest: number]

const moved = rest.base + travel

const scripts: Step[][] = [
  [
    ["TRIGGER_CLICK", moved],
    ["ARROW_DOWN", rest.base],
    ["ARROW_DOWN", rest.base],
    ["ENTER", moved],
    ["TRIGGER_BLUR", moved],
  ],
  [
    ["TRIGGER_FOCUS", moved],
    ["ARROW_DOWN", moved],
    ["ARROW_DOWN", rest.base],
    ["ARROW_DOWN", rest.base],
    ["CLOSE", moved],
    ["TRIGGER_BLUR", moved],
  ],
]

const positioning = { placement: "bottom-end", gutter: 6 } as const

const inertEffects = [
  "trackInteractOutside",
  "trackFocusVisible",
  "trackPositioning",
  "scrollToHighlightedItem",
]

const ghostMachine = {
  ...menu.machine,
  implementations: {
    ...menu.machine.implementations,
    effects: {
      ...menu.machine.implementations?.effects,
      ...Object.fromEntries(inertEffects.map((name) => [name, () => {}])),
    },
  },
} as typeof menu.machine

const rowH = 32

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

  const reset = useCallback(() => setBeat(null), [])

  return { state, highlighted, beat, reset }
}

const anchored = {
  position: "absolute",
  top: "calc(100% + 6px)",
  right: "12px",
  left: "auto",
  transform: "none",
  zIndex: 1,
} as const

const contentClass = css({
  position: "relative",
  w: "200px",
  p: "1",
  bg: "bg.popover",
  borderWidth: "1px",
  borderColor: "border.bold",
  rounded: "md",
  outline: "0",
  boxShadow: "0 16px 40px -18px rgb(0 0 0 / 0.35)",
  transformOrigin: "calc(100% - 40px) -6px",
  transition:
    "opacity var(--hc1-open) var(--hc1-out), transform var(--hc1-open) var(--hc1-out), visibility 0s",
  "&[data-state=closed]": {
    opacity: "0",
    transform: "scale(0.96)",
    visibility: "hidden",
    pointerEvents: "none",
    transition:
      "opacity var(--hc1-close) var(--hc1-out), transform var(--hc1-close) var(--hc1-out), visibility 0s linear var(--hc1-close)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&[data-state=closed]": { transform: "none" },
  },
})

const barClass = css({
  position: "absolute",
  top: "1",
  left: "1",
  right: "1",
  h: "8",
  rounded: "sm",
  bg: { base: "gray.100", _dark: "whiteAlpha.100" },
  pointerEvents: "none",
  opacity: "0",
  transition: "opacity var(--hc1-close) var(--hc1-out)",
  "&[data-on]": {
    opacity: "1",
    transition: "opacity var(--hc1-hop) var(--hc1-out)",
  },
  "&[data-glide]": {
    transition:
      "opacity var(--hc1-hop) var(--hc1-out), transform var(--hc1-hop) var(--hc1-inout)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&[data-glide]": {
      transition: "opacity var(--hc1-hop) var(--hc1-out)",
    },
  },
})

const itemClass = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6",
  px: "2.5",
  h: "8",
  cursor: "pointer",
  color: "text.bold",
  fontSize: "13px",
  outline: "0",
  "& > span": {
    opacity: "0.62",
    transition: "opacity var(--hc1-hop) var(--hc1-inout)",
  },
  "& > [data-hint]": { opacity: "0.36" },
  "&[data-highlighted] > span": { opacity: "1" },
  "&[data-highlighted] > [data-hint]": { opacity: "0.6" },
})

function HighlightBar(props: { index: number }) {
  const { index } = props
  const [track, setTrack] = useState({
    index,
    at: Math.max(index, 0),
    glide: false,
  })
  if (track.index !== index) {
    setTrack({
      index,
      at: index >= 0 ? index : track.at,
      glide: index >= 0 && track.index >= 0,
    })
  }
  return (
    <div
      aria-hidden="true"
      className={barClass}
      data-on={index >= 0 ? "" : undefined}
      data-glide={track.glide ? "" : undefined}
      style={{ transform: `translateY(${track.at * rowH}px)` }}
    />
  )
}

function FileRow(props: { api: menu.Api; children?: ReactNode }) {
  const { api } = props
  return (
    <HStack
      position="relative"
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
          transition="transform var(--hc1-hop) var(--hc1-inout)"
          css={{
            "[data-state=open] > &": { transform: "rotate(180deg)" },
            "@media (prefers-reduced-motion: reduce)": { transition: "none" },
          }}
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
  const positionerProps = api.getPositionerProps()
  const { hidden: _hidden, ...contentProps } = api.getContentProps()
  const index = items.findIndex((item) => item.value === api.highlightedValue)
  return (
    <FileRow api={api}>
      <div
        {...positionerProps}
        style={{ ...positionerProps.style, ...anchored }}
      >
        <div {...contentProps} className={contentClass}>
          <HighlightBar index={index} />
          {items.map((item) => (
            <div
              key={item.value}
              {...api.getItemProps({ value: item.value })}
              className={itemClass}
            >
              <span>{item.label}</span>
              <styled.span data-hint="" fontFamily="mono" fontSize="11px">
                {item.hint}
              </styled.span>
            </div>
          ))}
        </div>
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
  "&[data-typing] [data-char]": {
    opacity: "0",
    animation: "hc1-type var(--hc1-press) linear forwards",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&[data-typing]": { animation: "hc1-type var(--hc1-fade) var(--hc1-out)" },
    "&[data-typing] [data-char]": {
      opacity: "1",
      animation: "none",
      animationDelay: "0ms !important",
    },
  },
})

const narratorKeyframes =
  "@keyframes hc1-type { from { opacity: 0; } to { opacity: 1; } }"

const fadeInClass = css({
  animation: "hc1-type var(--hc1-fade) var(--hc1-inout) both",
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
  const parts = narrate(props.state, props.beat)
  const typing = props.beat != null
  let n = 0
  return (
    <p
      key={props.beat?.id ?? 0}
      className={narratorClass}
      data-typing={typing ? "" : undefined}
    >
      <styled.span srOnly>{parts.map(([text]) => text).join("")}</styled.span>
      <span aria-hidden="true">
        {parts.map(([text, tone], i) => (
          <span key={i} data-tone={tone}>
            {typing
              ? Array.from(text, (char, j) => (
                  <span
                    key={j}
                    data-char=""
                    style={{ animationDelay: `${n++ * typeStep}ms` }}
                  >
                    {char}
                  </span>
                ))
              : text}
          </span>
        ))}
      </span>
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
  const ghostService = useMachine(ghostMachine, {
    id: useId(),
    positioning,
  })
  const liveApi = menu.connect(liveService, normalizeProps)
  const ghostApi = menu.connect(ghostService, normalizeProps)

  const live = useBeat(liveService)
  const ghost = useBeat(ghostService)

  const [handedOver, setHandedOver] = useState(false)
  const [resumed, setResumed] = useState(false)
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(true)
  const hoverRef = useRef(false)
  const typedUntil = useRef(0)

  useLayoutEffect(() => {
    if (!ghost.beat) return
    const length = narrate(ghost.state, ghost.beat)
      .map(([text]) => text)
      .join("").length
    typedUntil.current = performance.now() + length * typeStep
  }, [ghost.beat, ghost.state])
  const ghostRef = useRef(ghostService)
  ghostRef.current = ghostService
  const liveRef = useRef(liveService)
  liveRef.current = liveService
  const activeAt = useRef(0)
  const resetGhost = ghost.reset

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
        let last = performance.now()
        const tick = () => {
          if (cancelled) return resolve()
          const now = performance.now()
          const running =
            visibleRef.current && !document.hidden && !hoverRef.current
          if (running) left -= now - last
          last = now
          if (left <= 0) resolve()
          else setTimeout(tick, 50)
        }
        setTimeout(tick, 50)
      })

    const run = async () => {
      await sleep(rest.short)
      let round = 0
      while (!cancelled) {
        const current = String(ghostRef.current.state.get())
        if (current !== "idle") {
          send("CLOSE")
          send("TRIGGER_BLUR")
          await sleep(rest.base)
        }
        for (const [type, wait] of scripts[round % scripts.length]) {
          if (cancelled) return
          send(type)
          await sleep(wait)
          const typing = typedUntil.current + rest.short - performance.now()
          if (typing > 0) await sleep(typing)
        }
        round++
        if (round % 3 === 0) await sleep(rest.long)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [handedOver, reduced])

  useEffect(() => {
    if (!handedOver || reduced) return
    activeAt.current = performance.now()
    const id = setInterval(() => {
      const root = rootRef.current
      const now = performance.now()
      const busy =
        hoverRef.current ||
        String(liveRef.current.state.get()) === "open" ||
        (!!root && root.contains(document.activeElement))
      if (busy) activeAt.current = now
      if (now - activeAt.current < resumeAfter) return
      resetGhost()
      setResumed(true)
      setHandedOver(false)
    }, 250)
    return () => clearInterval(id)
  }, [handedOver, reduced, resetGhost])

  const takeOver = () => {
    activeAt.current = performance.now()
    if (handedOver) return
    ghostRef.current.send({ type: "CLOSE" })
    ghostRef.current.send({ type: "TRIGGER_BLUR" })
    live.reset()
    setHandedOver(true)
  }

  const shown = handedOver ? live : ghost

  return (
    <Box
      ref={rootRef}
      style={motionVars}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") hoverRef.current = true
        activeAt.current = performance.now()
      }}
      onPointerLeave={() => {
        hoverRef.current = false
        activeAt.current = performance.now()
      }}
      onPointerMove={() => {
        activeAt.current = performance.now()
      }}
      onPointerDownCapture={() => {
        activeAt.current = performance.now()
      }}
      onKeyDownCapture={() => {
        activeAt.current = performance.now()
      }}
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      bg="bg"
      overflow="hidden"
    >
      <style>{narratorKeyframes}</style>
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
        <Box
          opacity={handedOver ? 1 : 0}
          style={{
            transition: handedOver
              ? "none"
              : "opacity var(--hc1-fade) var(--hc1-inout)",
          }}
        >
          <FileMenu api={liveApi} />
        </Box>
        {handedOver ? null : (
          <Box
            className={resumed ? fadeInClass : undefined}
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
          className={resumed && !handedOver ? fadeInClass : undefined}
          state={shown.state}
          highlighted={shown.highlighted}
          beat={handedOver ? live.beat : ghost.beat}
        />
      </Box>

      <Box
        key={handedOver ? "live" : "ghost"}
        className={resumed && !handedOver ? fadeInClass : undefined}
        px="4"
        py="3"
        borderTopWidth="1px"
        borderColor="border"
        minH={{ base: "16", md: "11" }}
        aria-live={handedOver ? "polite" : "off"}
      >
        <Narrator state={shown.state} beat={shown.beat} />
      </Box>
    </Box>
  )
}
