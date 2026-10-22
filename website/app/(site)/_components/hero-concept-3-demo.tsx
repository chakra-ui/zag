"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { Box, Stack, styled } from "styled-system/jsx"
import { CodePanel, items, type Snapshot } from "./hero-concept-3-code"
import { duration, ease, hopGap, rest, resumeAfter } from "./motion"

type Cue = { key: string; n: number }

type Driver = {
  open: () => void
  highlight: (value: string) => void
  press: (value: string) => void
  select: (value: string) => void
  key: (key: string) => void
}

type Beat = { wait: number; run: (d: Driver) => void }

const pressHold = duration.press + 60
const idleEvents = [
  "pointerdown",
  "pointermove",
  "pointerleave",
  "keydown",
  "focusin",
  "focusout",
  "wheel",
] as const
const rowH = 32

const pointerPass: Beat[] = [
  { wait: rest.base, run: (d) => d.open() },
  { wait: duration.open + hopGap, run: (d) => d.highlight("rename") },
  { wait: rest.short, run: (d) => d.highlight("copy") },
  { wait: rest.short, run: (d) => d.highlight("share") },
  { wait: rest.short, run: (d) => d.press("share") },
  { wait: pressHold, run: (d) => d.select("share") },
]

const keyboardPass: Beat[] = [
  {
    wait: rest.base,
    run: (d) => {
      d.key("↓")
      d.open()
    },
  },
  { wait: 16, run: (d) => d.highlight("rename") },
  {
    wait: rest.short,
    run: (d) => {
      d.key("↓")
      d.highlight("copy")
    },
  },
  {
    wait: rest.short,
    run: (d) => {
      d.key("Enter")
      d.press("copy")
    },
  },
  { wait: pressHold, run: (d) => d.select("copy") },
]

const beats = [...pointerPass, ...keyboardPass]

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
  const [pressed, setPressed] = useState<string | null>(null)
  const [cue, setCue] = useState<Cue | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const hoveredRef = useRef(false)
  const hoverRef = useRef<(hovered: boolean) => void>(() => {})

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
    const el = rootRef.current
    if (!el) return

    let cueCount = 0
    const driver: Driver = {
      open: () => apiRef.current.setOpen(true),
      highlight: (value) => apiRef.current.setHighlightedValue(value),
      press: (value) => setPressed(value),
      select: (value) => {
        setSelected(value)
        setPressed(null)
        setCue(null)
        closeRef.current()
      },
      key: (key) => setCue({ key, n: ++cueCount }),
    }

    let index = 0
    let remaining = beats[0].wait
    let startedAt = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let visible = false
    let hovered = false

    const running = () => visible && !hovered && !document.hidden
    const fire = () => {
      timer = undefined
      beats[index].run(driver)
      index = (index + 1) % beats.length
      remaining = beats[index].wait
      if (running()) schedule()
    }
    const schedule = () => {
      startedAt = performance.now()
      timer = setTimeout(fire, remaining)
    }
    const sync = () => {
      if (running()) {
        if (timer === undefined) schedule()
        return
      }
      if (timer === undefined) return
      clearTimeout(timer)
      timer = undefined
      remaining = Math.max(0, remaining - (performance.now() - startedAt))
    }

    hoverRef.current = (next) => {
      hovered = next
      sync()
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        sync()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    document.addEventListener("visibilitychange", sync)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", sync)
      hoverRef.current = () => {}
      clearTimeout(timer)
    }
  }, [live, reduced])

  useEffect(() => {
    if (!live || reduced) return
    const el = rootRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const arm = () => {
      clearTimeout(timer)
      timer = setTimeout(check, resumeAfter)
    }
    const check = () => {
      const busy =
        hoveredRef.current ||
        el.contains(document.activeElement) ||
        apiRef.current.open
      if (busy) return arm()
      liveRef.current = false
      setSelected(null)
      setPressed(null)
      setCue(null)
      setLive(false)
    }
    idleEvents.forEach((type) => el.addEventListener(type, arm))
    arm()
    return () => {
      clearTimeout(timer)
      idleEvents.forEach((type) => el.removeEventListener(type, arm))
    }
  }, [live, reduced])

  const handOver = () => {
    if (liveRef.current) return
    liveRef.current = true
    setLive(true)
    setPressed(null)
    setCue(null)
  }

  const snapshot: Snapshot = {
    open: service.state.hasTag("open"),
    highlighted: api.highlightedValue,
  }

  const hiIndex = items.findIndex((i) => i.value === api.highlightedValue)
  const lastHi = useRef(Math.max(hiIndex, 0))
  const wasShown = useRef(false)
  const shown = hiIndex >= 0
  const at = shown ? hiIndex : lastHi.current
  const isPressed = pressed != null && pressed === api.highlightedValue
  useLayoutEffect(() => {
    if (hiIndex >= 0) lastHi.current = hiIndex
    wasShown.current = hiIndex >= 0
  })
  const barTransition = reduced
    ? `opacity ${duration.hop}ms ${ease.out}`
    : isPressed
      ? `transform ${duration.press}ms ${ease.out}`
      : shown && wasShown.current
        ? `transform ${duration.hop}ms ${ease.inOut}, opacity ${duration.close}ms ${ease.out}`
        : `opacity ${shown ? duration.hop : duration.close}ms ${ease.out}`

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
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return
        hoveredRef.current = true
        hoverRef.current(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        hoveredRef.current = false
        hoverRef.current(false)
      }}
      onPointerDown={handOver}
      onFocus={handOver}
      onKeyDown={handOver}
    >
      <Box
        position="relative"
        h="196px"
        display="flex"
        alignItems="center"
        justifyContent={{ base: "flex-start", md: "center" }}
        px={{ base: "5", md: "8" }}
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
            style={{ transition: `transform ${duration.press}ms ${ease.out}` }}
            _hover={{ bg: "bg.muted" }}
            _active={{ transform: "scale(0.98)" }}
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
              style={{
                transition: reduced
                  ? "none"
                  : `transform ${api.open ? duration.open : duration.close}ms ${ease.out}`,
              }}
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
          <Box position="relative" h="16px">
            <Hint
              open={api.open}
              selected={selected}
              live={live}
              reduced={reduced}
            />
            <KeyCue cue={api.open ? cue : null} reduced={reduced} />
          </Box>
        </Stack>
        <div {...api.getPositionerProps()}>
          <styled.ul
            {...api.getContentProps()}
            hidden={false}
            inert={!live || undefined}
            position="relative"
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
            transformOrigin="var(--transform-origin)"
            style={{
              opacity: api.open ? 1 : 0,
              transform: api.open || reduced ? "none" : "scale(0.96)",
              visibility: api.open ? "visible" : "hidden",
              transition: api.open
                ? `opacity ${duration.open}ms ${ease.out}, transform ${duration.open}ms ${ease.out}, visibility 0s`
                : `opacity ${duration.close}ms ${ease.out}, transform ${duration.close}ms ${ease.out}, visibility 0s linear ${duration.close}ms`,
            }}
          >
            <styled.li
              role="presentation"
              aria-hidden
              position="absolute"
              top="1"
              left="1"
              right="1"
              h="32px"
              borderRadius="md"
              bg={{ base: "gray.100", _dark: "whiteAlpha.100" }}
              pointerEvents="none"
              style={{
                transform: `translateY(${at * rowH}px)${isPressed && !reduced ? " scale(0.98)" : ""}`,
                opacity: shown ? 1 : 0,
                transition: barTransition,
              }}
            />
            {items.map((item) => (
              <styled.li
                key={item.value}
                {...api.getItemProps({ value: item.value })}
                data-pressed={(!reduced && pressed === item.value) || undefined}
                position="relative"
                display="flex"
                alignItems="center"
                h="32px"
                px="2.5"
                fontSize="14px"
                color="text.subtle"
                borderRadius="md"
                cursor="pointer"
                userSelect="none"
                style={{
                  transition: `transform ${duration.press}ms ${ease.out}`,
                }}
                _highlighted={{ color: "text.bold" }}
                css={{
                  "&[data-pressed], &:active": { transform: "scale(0.98)" },
                  _motionReduce: { transform: "none!" },
                }}
              >
                {item.label}
              </styled.li>
            ))}
          </styled.ul>
        </div>
      </Box>
      <CodePanel snapshot={snapshot} reduced={reduced} />
    </Box>
  )
}

function Hint(props: {
  open: boolean
  selected: string | null
  live: boolean
  reduced: boolean
}) {
  const { open, selected, live, reduced } = props
  const shift = reduced ? 0 : 4
  const textRef = useRef<HTMLSpanElement>(null)
  const prevSelected = useRef(selected)
  useLayoutEffect(() => {
    const was = prevSelected.current
    prevSelected.current = selected
    if (was == null || selected != null || open) return
    textRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: duration.fade,
      easing: ease.out,
    })
  }, [selected, open])
  return (
    <styled.p
      fontFamily="mono"
      fontSize="11px"
      lineHeight="16px"
      color="text.muted"
      whiteSpace="nowrap"
      aria-live={live ? "polite" : undefined}
      style={{
        opacity: open ? 0 : 1,
        transform: `translateY(${open ? shift : 0}px)`,
        transition: open
          ? `opacity ${duration.close}ms ${ease.out}, transform ${duration.close}ms ${ease.out}`
          : `opacity ${duration.fade}ms ${ease.out} ${duration.close}ms, transform ${duration.fade}ms ${ease.out} ${duration.close}ms`,
      }}
    >
      <span ref={textRef}>
        {selected ? (
          <>
            onSelect{" "}
            <styled.span color="text.bold">{`{ value: "${selected}" }`}</styled.span>
          </>
        ) : (
          "click, ↑ ↓, Enter, Esc"
        )}
      </span>
    </styled.p>
  )
}

function KeyCue(props: { cue: Cue | null; reduced: boolean }) {
  const { cue, reduced } = props
  const ref = useRef<HTMLElement>(null)
  const last = useRef<Cue | null>(null)
  if (cue) last.current = cue
  const shown = last.current

  useLayoutEffect(() => {
    if (!cue) return
    ref.current?.animate(
      reduced
        ? [{ opacity: 0.4 }, { opacity: 1 }]
        : [
            { opacity: 0.4, transform: "translateY(2px) scale(0.96)" },
            { opacity: 1, transform: "none" },
          ],
      { duration: duration.swap, easing: ease.out },
    )
  }, [cue?.n])

  return (
    <styled.span
      aria-hidden
      position="absolute"
      top="0"
      left={{ base: "0", md: "50%" }}
      display="flex"
      justifyContent={{ base: "flex-start", md: "center" }}
      w="max-content"
      css={{ md: { translate: "-50% 0" } }}
      pointerEvents="none"
      style={{
        opacity: cue ? 1 : 0,
        transition: `opacity ${cue ? duration.hop : duration.close}ms ${ease.out}`,
      }}
    >
      <styled.kbd
        ref={ref}
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        minW="16px"
        h="16px"
        px="1"
        fontFamily="mono"
        fontSize="10.5px"
        lineHeight="1"
        color="text.bold"
        bg="bg.muted"
        borderWidth="1px"
        borderColor="border"
        borderRadius="sm"
      >
        {shown?.key}
      </styled.kbd>
    </styled.span>
  )
}
