"use client"

import * as select from "@zag-js/select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { hCopy, installCommands } from "lib/home"
import * as tabs from "@zag-js/tabs"
import Link from "next/link"
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type { ComponentType, ReactNode } from "react"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { Ctas, FrameworkRow } from "./actions"
import {
  GhostCombobox,
  GhostDatePicker,
  GhostDialog,
  GhostMenu,
  GhostSlider,
  GhostTabs,
  HighlightRows,
  Pop,
} from "./hero-concept-2-ghost"
import type { GhostProps } from "./hero-concept-2-ghost"
import {
  LiveCombobox,
  LiveDatePicker,
  LiveDialog,
  LiveMenu,
  LiveSlider,
  LiveTabs,
  Pinned,
} from "./hero-concept-2-live"
import {
  createClock,
  springMs,
  Swap,
  usePrefersReduced,
} from "./hero-concept-2-motion"
import type { Clock } from "./hero-concept-2-motion"
import { duration, ease, hopGap, rest, resumeAfter } from "./motion"
import { ReleaseBadge } from "./release-badge"
import { accent, gutter } from "./shared"

interface Kind {
  value: string
  label: string
  name: string
  pkg: string
  Live?: ComponentType
  Ghost?: ComponentType<GhostProps>
  script: [number, number][]
}

const kind = (
  value: string,
  label: string,
  Live: ComponentType,
  Ghost: ComponentType<GhostProps>,
  script: [number, number][],
): Kind => ({
  value,
  label,
  name: value.replace("-", " "),
  pkg: `@zag-js/${value}`,
  Live,
  Ghost,
  script,
})

const all: Kind = {
  value: "components",
  label: "components",
  name: "components",
  pkg: "@zag-js/*",
  script: [],
}

const step = duration.hop + hopGap

const kinds: Kind[] = [
  all,
  kind("menu", "menus", LiveMenu, GhostMenu, [
    [220, 1],
    [duration.press + 20, 2],
    [260, 3],
    [step, 4],
    [step, 5],
  ]),
  kind("slider", "sliders", LiveSlider, GhostSlider, [
    [260, 1],
    [springMs + 140, 2],
  ]),
  kind("tabs", "tabs", LiveTabs, GhostTabs, [
    [260, 1],
    [640, 2],
  ]),
  kind("combobox", "comboboxes", LiveCombobox, GhostCombobox, [
    [200, 1],
    [380, 2],
    [170, 3],
    [300, 4],
    [220, 5],
    [duration.press + 40, 6],
  ]),
  kind("date-picker", "date pickers", LiveDatePicker, GhostDatePicker, [
    [260, 1],
    [620, 2],
  ]),
  kind("dialog", "dialogs", LiveDialog, GhostDialog, [
    [280, 1],
    [duration.press + 40, 2],
    [1100, 3],
  ]),
]

const collection = select.collection({ items: kinds })

const rowH = 40

const popups = ["select", "menu", "combobox", "dialog"]
  .map(
    (scope) =>
      `[data-scope="${scope}"][data-part="content"][data-state="open"]`,
  )
  .join(", ")

interface GhostSelectState {
  open: boolean
  hi: number
  press: boolean
  glide: number
}

interface Scene {
  shown: number
  beat: number
  loops: number
}

function useGate(rootRef: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    )
    io.observe(el)
    const onVis = () => setHidden(document.hidden)
    onVis()
    document.addEventListener("visibilitychange", onVis)
    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [rootRef])

  return visible && !hidden
}

interface Session {
  id: number
  start: number
}

function useDirector(props: {
  running: boolean
  done: boolean
  reduced: boolean
  session: Session
  rootRef: React.RefObject<HTMLElement | null>
}) {
  const [scene, setScene] = useState<Scene>({ shown: 0, beat: 0, loops: 0 })
  const [ghost, setGhost] = useState<GhostSelectState>({
    open: false,
    hi: 0,
    press: false,
    glide: duration.hop,
  })
  const clockRef = useRef<Clock | null>(null)
  const reducedRef = useRef(props.reduced)
  const { rootRef, session } = props

  useEffect(() => {
    reducedRef.current = props.reduced
  }, [props.reduced])

  useEffect(() => {
    const clock = createClock(() => rootRef.current)
    clockRef.current = clock
    let alive = true
    const wait = (ms: number) => clock.wait(ms * (reducedRef.current ? 1.5 : 1))
    const set = (patch: Partial<GhostSelectState>) =>
      setGhost((g) => ({ ...g, ...patch }))

    async function pick(from: number, to: number) {
      set({ open: true, hi: from, press: false, glide: duration.hop })
      await wait(duration.open + 160)
      const dist = Math.abs(to - from)
      if (reducedRef.current) {
        set({ hi: to })
        await wait(520)
      } else if (dist <= 2) {
        for (let i = 1; i <= dist; i++) {
          set({ hi: from + Math.sign(to - from) * i })
          await wait(step)
        }
      } else {
        const glide = duration.hop * 2.6
        set({ hi: to, glide })
        await wait(glide + hopGap)
      }
      set({ press: true })
      await wait(duration.press + 30)
    }

    async function run() {
      let at = session.start
      let loops = session.id > 0 ? 1 : 0
      setScene({ shown: at, beat: 0, loops })
      set({ open: false, press: false, hi: at })
      if (session.id === 0) {
        await wait(rest.long)
      } else {
        await wait(duration.swap + 80)
        for (const [ms, beat] of kinds[at].script) {
          await wait(ms)
          if (!alive) return
          setScene((s) => ({ ...s, beat }))
        }
        await wait(rest.base)
      }
      while (alive) {
        const to = (at + 1) % kinds.length
        await pick(at, to)
        if (!alive) return
        if (to === 0) loops++
        set({ open: false, press: false })
        setScene({ shown: to, beat: 0, loops })
        await wait(duration.swap + 80)
        for (const [ms, beat] of kinds[to].script) {
          await wait(ms)
          if (!alive) return
          setScene((s) => ({ ...s, beat }))
        }
        await wait(rest.base)
        at = to
      }
    }

    run()
    return () => {
      alive = false
      clock.dispose()
      clockRef.current = null
    }
  }, [rootRef, session])

  useEffect(() => {
    const clock = clockRef.current
    if (!clock) return
    if (props.done) clock.dispose()
    else if (props.running) clock.resume()
    else clock.pause()
  }, [props.running, props.done, session])

  return { scene, ghost }
}

function Word(props: { kind: Kind; reduced: boolean }) {
  return (
    <styled.span position="relative" display="inline-block">
      <Swap id={props.kind.value} mode="word" reduced={props.reduced}>
        {props.kind.label}
      </Swap>
      <styled.span
        position="absolute"
        left="0"
        right="0"
        bottom="0.04em"
        h="1px"
        bg="border.bold"
        transition="background 160ms ease"
        css={{
          "[data-c2-trigger]:hover &": { bg: "text.muted" },
          "[data-c2-trigger][data-state=open] &, [data-c2-trigger][data-ghost-open] &":
            { bg: accent },
        }}
      />
    </styled.span>
  )
}

function GhostSelect(props: {
  ghost: GhostSelectState
  value: string
  reduced: boolean
}) {
  const { ghost, reduced } = props
  return (
    <Box
      aria-hidden="true"
      inert
      position="absolute"
      top="100%"
      left="0"
      zIndex="50"
      fontSize="15px"
      fontWeight="normal"
      letterSpacing="normal"
      lineHeight="normal"
      pointerEvents="none"
    >
      <Pop
        open={ghost.open}
        reduced={reduced}
        origin="top left"
        style={{ top: 10, left: 0 }}
      >
        <Box
          minW="min(300px, calc(100vw - 32px))"
          bg="bg.popover"
          borderWidth="1px"
          borderColor="border.bold"
          borderRadius="md"
          p="1"
          boxShadow="0 20px 48px -20px rgb(0 0 0 / 0.4)"
        >
          <HighlightRows
            reduced={reduced}
            hi={ghost.hi}
            pressed={ghost.press}
            glideMs={ghost.glide}
            rowH={rowH}
            rows={kinds.map((item) => (
              <HStack key={item.value} gap="3" px="3" h="full">
                <styled.span
                  w="3"
                  color={accent}
                  fontSize="12px"
                  style={{ opacity: item.value === props.value ? 1 : 0 }}
                >
                  ✓
                </styled.span>
                <styled.span flex="1" color="text.bold">
                  {item.label}
                </styled.span>
                <styled.span
                  fontFamily="mono"
                  fontSize="11px"
                  color="text.muted"
                >
                  {item.pkg}
                </styled.span>
              </HStack>
            ))}
          />
        </Box>
      </Pop>
    </Box>
  )
}

function Headline(props: {
  api: select.Api
  shown: Kind
  ghost: GhostSelectState | null
  reduced: boolean
  hover: Hover
}) {
  const { api, shown, ghost, reduced } = props
  return (
    <>
      <styled.h1 srOnly>{hCopy.hero.title}</styled.h1>
      <Box
        {...api.getRootProps()}
        fontSize={{ base: "40px", md: "56px", xl: "64px" }}
        lineHeight="1.06"
        letterSpacing="-0.04em"
        fontWeight="semibold"
        color="text.bold"
      >
        <styled.label {...api.getLabelProps()} srOnly>
          Component
        </styled.label>
        <styled.span display="block" aria-hidden="true">
          Accessible
        </styled.span>
        <Box
          {...api.getControlProps()}
          display="block"
          position="relative"
          {...props.hover}
        >
          <styled.button
            {...api.getTriggerProps()}
            display="inline-flex"
            alignItems="baseline"
            gap="0.22em"
            font="inherit"
            letterSpacing="inherit"
            color="text.bold"
            cursor="pointer"
            textAlign="start"
            borderRadius="sm"
            focusVisibleRing="outside"
            data-c2-trigger=""
            data-ghost-open={ghost?.open ? "" : undefined}
          >
            <Word kind={shown} reduced={reduced} />
            <styled.svg
              viewBox="0 0 12 12"
              w="0.32em"
              h="0.32em"
              flexShrink="0"
              color="text.muted"
              alignSelf="center"
              style={{ transition: `transform ${duration.open}ms ${ease.out}` }}
              css={{
                "[data-state=open] > &, [data-ghost-open] > &": {
                  transform: "rotate(180deg)",
                },
              }}
              aria-hidden="true"
            >
              <path
                d="M2 4.5 6 8.5 10 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </styled.svg>
          </styled.button>
          {ghost && (
            <GhostSelect ghost={ghost} value={shown.value} reduced={reduced} />
          )}
        </Box>
        <styled.span display="block" aria-hidden="true">
          for any framework
        </styled.span>
      </Box>
      <Portal>
        <div {...api.getPositionerProps()}>
          <styled.div
            {...api.getContentProps()}
            minW="min(300px, calc(100vw - 32px))"
            bg="bg.popover"
            borderWidth="1px"
            borderColor="border.bold"
            borderRadius="md"
            p="1"
            boxShadow="0 20px 48px -20px rgb(0 0 0 / 0.4)"
            outline="0"
            zIndex="50"
            maxW="calc(100vw - 32px)"
          >
            <styled.ul
              {...api.getListProps()}
              outline="0"
              maxH="min(360px, calc(var(--available-height, 360px) - 16px))"
              overflowY="auto"
              overscrollBehavior="contain"
            >
              {kinds.map((item) => (
                <styled.li
                  key={item.value}
                  {...api.getItemProps({ item })}
                  display="flex"
                  alignItems="center"
                  gap="3"
                  px="3"
                  h="10"
                  borderRadius="sm"
                  cursor="pointer"
                  color="text.muted"
                  _highlighted={{ bg: "bg.muted", color: "text.bold" }}
                >
                  <styled.span
                    {...api.getItemIndicatorProps({ item })}
                    w="3"
                    color={accent}
                    fontSize="12px"
                    css={{
                      "&[hidden]": { display: "block", visibility: "hidden" },
                    }}
                  >
                    ✓
                  </styled.span>
                  <styled.span
                    {...api.getItemTextProps({ item })}
                    flex="1"
                    fontSize="15px"
                    color="text.bold"
                  >
                    {item.label}
                  </styled.span>
                  <styled.span
                    fontFamily="mono"
                    fontSize="11px"
                    color="text.muted"
                  >
                    {item.pkg}
                  </styled.span>
                </styled.li>
              ))}
            </styled.ul>
          </styled.div>
        </div>
      </Portal>
    </>
  )
}

function Tiles(props: {
  render: (k: Kind) => ReactNode
  stagger: boolean
  reduced: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { stagger, reduced } = props

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !stagger) return
    const anims = Array.from(el.children).map((child, i) =>
      child.animate(
        [
          {
            opacity: 0,
            filter: "blur(2px)",
            transform: reduced ? "none" : "translateY(6px)",
          },
          { opacity: 1, filter: "blur(0px)", transform: "none" },
        ],
        {
          duration: duration.swap,
          delay: 80 + i * 40,
          easing: ease.out,
          fill: "backwards",
        },
      ),
    )
    return () => anims.forEach((a) => a.cancel())
  }, [stagger, reduced])

  return (
    <Grid
      ref={ref}
      gridTemplateColumns="repeat(3, minmax(0, 1fr))"
      gap="2"
      w={{ base: "full", sm: "360px" }}
    >
      {kinds.slice(1).map((k) => props.render(k))}
    </Grid>
  )
}

const tile = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1",
  px: "3",
  py: "2.5",
  borderWidth: "1px",
  borderColor: "border",
  borderRadius: "md",
  textAlign: "start",
} as const

function TileText(props: { k: Kind }) {
  return (
    <>
      <styled.span fontSize="14px" color="text.bold">
        {props.k.label}
      </styled.span>
      <styled.span
        fontFamily="mono"
        fontSize="10.5px"
        color="text.muted"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        maxW="full"
      >
        {props.k.pkg.replace("@zag-js/", "")}
      </styled.span>
    </>
  )
}

function Overview(props: { api: select.Api; state: string }) {
  const { api } = props
  return (
    <Pinned
      states={["idle", "focused", "open"]}
      active={props.state}
      rows={[
        ["state", props.state],
        ["value", api.value],
      ]}
    >
      <Tiles
        stagger={false}
        reduced={false}
        render={(k) => (
          <styled.button
            key={k.value}
            type="button"
            onClick={() => api.selectValue(k.value)}
            {...tile}
            transition="border-color 160ms, background 160ms"
            _hover={{ borderColor: "border.bold", bg: "bg.muted" }}
            focusVisibleRing="outside"
          >
            <TileText k={k} />
          </styled.button>
        )}
      />
    </Pinned>
  )
}

function GhostOverview(props: {
  open: boolean
  stagger: boolean
  reduced: boolean
}) {
  const state = props.open ? "open" : "idle"
  return (
    <Pinned
      states={["idle", "focused", "open"]}
      active={state}
      rows={[
        ["state", state],
        ["value", ["components"]],
      ]}
    >
      <Tiles
        stagger={props.stagger}
        reduced={props.reduced}
        render={(k) => (
          <styled.div key={k.value} {...tile}>
            <TileText k={k} />
          </styled.div>
        )}
      />
    </Pinned>
  )
}

type Hover = {
  onPointerEnter: (e: React.PointerEvent) => void
  onPointerLeave: (e: React.PointerEvent) => void
}

function Stage(props: {
  kind: Kind
  reduced: boolean
  hover: Hover
  body: ReactNode
  bodyId: string
}) {
  const { kind, reduced } = props
  const live = kind.value !== all.value
  return (
    <Box
      w="full"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg"
      overflow="hidden"
      data-c2-stage={kind.value}
      {...props.hover}
    >
      <HStack
        justify="space-between"
        px="5"
        py="3"
        borderBottomWidth="1px"
        borderColor="border"
        gap="4"
      >
        <styled.div fontFamily="mono" fontSize="12px" color="text.bold">
          <Swap id={kind.value} mode="text" reduced={reduced}>
            {live ? kind.pkg : "@zag-js/select"}
          </Swap>
        </styled.div>
        <Link
          href={
            live
              ? `/components/react/${kind.value}`
              : "/components/react/accordion"
          }
        >
          <styled.span
            fontSize="13px"
            color="text.muted"
            transition="color 160ms"
            _hover={{ color: "text.bold" }}
          >
            <Swap id={kind.value} mode="text" reduced={reduced}>
              {live ? `Read the ${kind.name} docs →` : "Browse the docs →"}
            </Swap>
          </styled.span>
        </Link>
      </HStack>
      <Box h="384px" display="flex" flexDirection="column">
        <Swap id={props.bodyId} mode="panel" reduced={reduced}>
          {props.body}
        </Swap>
      </Box>
    </Box>
  )
}

function InstallFor(props: { pkg: string; reduced: boolean }) {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "pnpm",
  })
  const api = tabs.connect(service, normalizeProps)
  const [copied, setCopied] = useState(false)
  const current =
    installCommands.find((m) => m.id === api.value) ?? installCommands[0]
  const cmd = current.cmd.replace(
    " @zag-js/menu",
    props.pkg ? ` ${props.pkg}` : "",
  )
  return (
    <Box
      {...api.getRootProps()}
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.muted"
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
        {installCommands.map((m) => (
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
        <styled.code
          color="text.bold"
          whiteSpace="nowrap"
          overflowX="auto"
          minW="0"
          data-c2-install=""
        >
          <styled.span color="text.muted">$ </styled.span>
          <Swap id={cmd} mode="text" reduced={props.reduced}>
            {cmd}
          </Swap>
        </styled.code>
        <styled.button
          color="text.muted"
          flexShrink="0"
          _hover={{ color: "text.bold" }}
          onClick={() => {
            navigator.clipboard?.writeText(cmd)
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

export function HeroConcept2() {
  const rootRef = useRef<HTMLDivElement>(null)
  const visible = useGate(rootRef)
  const reduced = usePrefersReduced()
  const [handed, setHanded] = useState(false)
  const [hovered, setHovered] = useState(0)
  const [session, setSession] = useState<Session>({ id: 0, start: 0 })

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    defaultValue: [all.value],
    deselectable: false,
    positioning: { placement: "bottom-start", gutter: 10 },
  })
  const api = select.connect(service, normalizeProps)

  const { scene, ghost } = useDirector({
    running: visible && !handed && hovered === 0,
    done: handed,
    reduced,
    session,
    rootRef,
  })

  const realKind = kinds.find((k) => k.value === api.value[0]) ?? all
  const ghostKind = kinds[scene.shown]
  const kind = handed ? realKind : ghostKind

  const handoverRef = useRef(() => {})
  useEffect(() => {
    handoverRef.current = () => {
      if (handed) return
      if (api.value[0] !== ghostKind.value) api.setValue([ghostKind.value])
      setHanded(true)
    }
  })

  useEffect(() => {
    const el = rootRef.current
    if (!el || handed) return
    const take = () => handoverRef.current()
    const events = ["pointerdown", "keydown", "focusin", "touchstart"] as const
    events.forEach((e) => el.addEventListener(e, take, { passive: true }))
    return () => events.forEach((e) => el.removeEventListener(e, take))
  }, [handed])

  const valueRef = useRef(api.value[0])
  useEffect(() => {
    valueRef.current = api.value[0]
  })

  useEffect(() => {
    const el = rootRef.current
    if (!el || !handed || reduced) return
    let last = performance.now()
    let over = el.matches(":hover")
    const bump = () => {
      last = performance.now()
    }
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") over = true
      bump()
    }
    const leave = () => {
      over = false
      bump()
    }
    const busy = () => {
      const active = document.activeElement
      if (active && active !== document.body && el.contains(active)) return true
      return over || !!document.querySelector(popups)
    }
    const local = ["pointermove", "wheel"] as const
    const global = ["pointerdown", "keydown", "focusin", "touchstart"] as const
    local.forEach((e) => el.addEventListener(e, bump, { passive: true }))
    global.forEach((e) =>
      document.addEventListener(e, bump, { passive: true, capture: true }),
    )
    el.addEventListener("pointerenter", enter)
    el.addEventListener("pointerleave", leave)
    const timer = setInterval(() => {
      if (busy()) return bump()
      if (performance.now() - last < resumeAfter) return
      const at = kinds.findIndex((k) => k.value === valueRef.current)
      setSession((prev) => ({ id: prev.id + 1, start: Math.max(at, 0) }))
      setHovered(0)
      setHanded(false)
    }, 250)
    return () => {
      clearInterval(timer)
      local.forEach((e) => el.removeEventListener(e, bump))
      global.forEach((e) => document.removeEventListener(e, bump, true))
      el.removeEventListener("pointerenter", enter)
      el.removeEventListener("pointerleave", leave)
    }
  }, [handed, reduced])

  const hover: Hover = {
    onPointerEnter: (e) => {
      if (e.pointerType === "mouse") setHovered((n) => n + 1)
    },
    onPointerLeave: (e) => {
      if (e.pointerType === "mouse") setHovered((n) => Math.max(0, n - 1))
    },
  }

  let body: ReactNode
  let bodyId: string
  if (handed) {
    const Live = realKind.Live
    bodyId = `live:${realKind.value}`
    body = Live ? <Live /> : <Overview api={api} state={service.state.get()} />
  } else {
    const Ghost = ghostKind.Ghost
    bodyId = `ghost:${ghostKind.value}`
    body = (
      <Box aria-hidden="true" inert display="contents">
        {Ghost ? (
          <Ghost beat={scene.beat} reduced={reduced} />
        ) : (
          <GhostOverview
            open={ghost.open}
            stagger={scene.loops > 0}
            reduced={reduced}
          />
        )}
      </Box>
    )
  }

  return (
    <Grid
      ref={rootRef}
      gridTemplateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }}
      gap={{ base: "12", lg: "10" }}
      alignItems="center"
      px={gutter}
      pt={{ base: "12", md: "20" }}
      pb={{ base: "12", md: "20" }}
      data-c2-handed={handed ? "" : undefined}
    >
      <Stack gap="7" minW="0">
        <Box>
          <ReleaseBadge />
        </Box>
        <Headline
          api={api}
          shown={kind}
          ghost={handed ? { ...ghost, open: false } : ghost}
          reduced={reduced}
          hover={hover}
        />
        <styled.p
          fontSize={{ base: "17px", md: "19px" }}
          lineHeight="1.55"
          color="text.muted"
          maxW="46ch"
          textWrap="pretty"
        >
          {hCopy.hero.subtitle}
        </styled.p>
        <Ctas />
        <Box w="full" maxW="lg">
          <InstallFor
            pkg={kind.value !== all.value ? kind.pkg : ""}
            reduced={reduced}
          />
        </Box>
        <FrameworkRow />
      </Stack>
      <Box w="full" maxW="560px" justifySelf="center" minW="0">
        <Stage
          kind={kind}
          reduced={reduced}
          hover={hover}
          body={body}
          bodyId={bodyId}
        />
      </Box>
    </Grid>
  )
}
