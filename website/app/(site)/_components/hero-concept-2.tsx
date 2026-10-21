"use client"

import * as select from "@zag-js/select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { hCopy, installCommands } from "lib/home"
import * as tabs from "@zag-js/tabs"
import Link from "next/link"
import { useEffect, useId, useRef, useState } from "react"
import type { ComponentType } from "react"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { Ctas, FrameworkRow } from "./actions"
import {
  LiveCombobox,
  LiveDatePicker,
  LiveDialog,
  LiveMenu,
  LiveSlider,
  LiveTabs,
  Pinned,
} from "./hero-concept-2-live"
import type { LiveProps } from "./hero-concept-2-live"
import { ReleaseBadge } from "./release-badge"
import { accent, gutter } from "./shared"

interface Kind {
  value: string
  label: string
  name: string
  pkg: string
  Live?: ComponentType<LiveProps>
  still?: boolean
}

const kind = (
  value: string,
  label: string,
  Live: ComponentType<LiveProps>,
  still?: boolean,
): Kind => ({
  value,
  label,
  name: value.replace("-", " "),
  pkg: `@zag-js/${value}`,
  Live,
  still,
})

const all: Kind = {
  value: "components",
  label: "components",
  name: "components",
  pkg: "@zag-js/*",
}

const kinds: Kind[] = [
  all,
  kind("menu", "menus", LiveMenu, true),
  kind("slider", "sliders", LiveSlider),
  kind("tabs", "tabs", LiveTabs),
  kind("combobox", "comboboxes", LiveCombobox),
  kind("date-picker", "date pickers", LiveDatePicker),
  kind("dialog", "dialogs", LiveDialog, true),
]

const collection = select.collection({ items: kinds })

const timing = { step1: 1500, step2: 3300, next: 5600, still: 3200, rest: 4800 }

function useAutoplayGate(rootRef: React.RefObject<HTMLElement | null>) {
  const [stopped, setStopped] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      {
        threshold: 0.35,
      },
    )
    io.observe(el)
    const stop = () => setStopped(true)
    const events = ["pointerdown", "keydown", "focusin", "touchstart"] as const
    events.forEach((e) => el.addEventListener(e, stop, { passive: true }))
    return () => {
      io.disconnect()
      events.forEach((e) => el.removeEventListener(e, stop))
    }
  }, [rootRef])

  return { active: !stopped && visible && !reduced }
}

function Headline(props: { api: select.Api }) {
  const { api } = props
  const current = kinds.find((k) => k.value === api.value[0]) ?? kinds[0]
  const wordRef = useRef<HTMLSpanElement>(null)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = wordRef.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return
    el.animate(
      [
        { opacity: 0, transform: "translateY(0.12em)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 260, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
    )
  }, [current.value])

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
        <Box {...api.getControlProps()} display="block">
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
            textDecorationLine="underline"
            textDecorationThickness="1px"
            textUnderlineOffset="0.14em"
            textDecorationColor="border.bold"
            transition="text-decoration-color 160ms"
            _hover={{ textDecorationColor: "text.muted" }}
            _open={{ textDecorationColor: accent }}
            focusVisibleRing="outside"
            data-c2-trigger=""
          >
            <styled.span
              ref={wordRef}
              display="inline-block"
              whiteSpace="nowrap"
            >
              {current.label}
            </styled.span>
            <styled.svg
              viewBox="0 0 12 12"
              w="0.32em"
              h="0.32em"
              flexShrink="0"
              color="text.muted"
              alignSelf="center"
              transition="transform 160ms"
              css={{ "[data-state=open] > &": { transform: "rotate(180deg)" } }}
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
                  py="2"
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
      <Grid
        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
        gap="2"
        w={{ base: "full", sm: "360px" }}
      >
        {kinds.slice(1).map((k) => (
          <styled.button
            key={k.value}
            type="button"
            onClick={() => api.selectValue(k.value)}
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap="1"
            px="3"
            py="2.5"
            borderWidth="1px"
            borderColor="border"
            borderRadius="md"
            textAlign="start"
            transition="border-color 160ms, background 160ms"
            _hover={{ borderColor: "border.bold", bg: "bg.muted" }}
            focusVisibleRing="outside"
          >
            <styled.span fontSize="14px" color="text.bold">
              {k.label}
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
              {k.pkg.replace("@zag-js/", "")}
            </styled.span>
          </styled.button>
        ))}
      </Grid>
    </Pinned>
  )
}

function Stage(props: {
  kind: Kind
  step: number
  auto: boolean
  api: select.Api
  state: string
}) {
  const { kind } = props
  const Live = kind.Live
  return (
    <Box
      w="full"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg"
      overflow="hidden"
      data-c2-stage={kind.value}
    >
      <HStack
        justify="space-between"
        px="5"
        py="3"
        borderBottomWidth="1px"
        borderColor="border"
        gap="4"
      >
        <styled.p fontFamily="mono" fontSize="12px" color="text.bold">
          {Live ? kind.pkg : "@zag-js/select"}
        </styled.p>
        <Link
          href={
            Live
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
            {Live ? `Read the ${kind.name} docs →` : "Browse the docs →"}
          </styled.span>
        </Link>
      </HStack>
      <Box h="384px" display="flex" flexDirection="column">
        {Live ? (
          <Live key={kind.value} step={props.step} auto={props.auto} />
        ) : (
          <Overview api={props.api} state={props.state} />
        )}
      </Box>
    </Box>
  )
}

function InstallFor(props: { pkg: string }) {
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
          {cmd}
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
  const { active } = useAutoplayGate(rootRef)
  const [step, setStep] = useState({ v: all.value, n: 0 })

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
    defaultValue: [all.value],
    deselectable: false,
    positioning: { placement: "bottom-start", gutter: 10 },
  })
  const api = select.connect(service, normalizeProps)
  const value = api.value[0] ?? all.value
  const kind = kinds.find((k) => k.value === value) ?? kinds[0]
  const apiRef = useRef(api)

  useEffect(() => {
    apiRef.current = api
  })

  useEffect(() => {
    if (!active) return
    const idx = kinds.findIndex((k) => k.value === value)
    const next = kinds[(idx + 1) % kinds.length]
    const dwell =
      value === all.value
        ? timing.rest
        : kinds[idx]?.still
          ? timing.still
          : timing.next
    const timers = [
      setTimeout(() => setStep({ v: value, n: 1 }), timing.step1),
      setTimeout(() => setStep({ v: value, n: 2 }), timing.step2),
      setTimeout(() => apiRef.current.setValue([next.value]), dwell),
    ]
    return () => timers.forEach(clearTimeout)
  }, [active, value])

  return (
    <Grid
      ref={rootRef}
      gridTemplateColumns={{ base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" }}
      gap={{ base: "12", lg: "10" }}
      alignItems="center"
      px={gutter}
      pt={{ base: "12", md: "20" }}
      pb={{ base: "12", md: "20" }}
    >
      <Stack gap="7" minW="0">
        <Box>
          <ReleaseBadge />
        </Box>
        <Headline api={api} />
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
          <InstallFor pkg={kind.Live ? kind.pkg : ""} />
        </Box>
        <FrameworkRow />
      </Stack>
      <Box w="full" maxW="560px" justifySelf="center" minW="0">
        <Stage
          kind={kind}
          step={step.v === value ? step.n : 0}
          auto={active}
          api={api}
          state={service.state.get()}
        />
      </Box>
    </Grid>
  )
}
