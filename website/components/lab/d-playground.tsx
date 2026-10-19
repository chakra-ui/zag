"use client"

import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useRef, useState } from "react"
import { Box, Grid, HStack, styled } from "styled-system/jsx"

const accent = { base: "#2f855a", _dark: "#48bb78" }

type View = {
  open?: boolean
  hl?: number
  picked?: string
  value?: number
  dragging?: boolean
  input?: string
}
type Kind = "send" | "state" | "ctx" | "props" | "effect" | "cb"
type Entry = { kind: Kind; text: string }
type Step = { input: string; entries: Entry[]; view: View }
type PlayId = "menu" | "dialog" | "slider"

const send = (type: string, extra = ""): Entry => ({
  kind: "send",
  text: `send({ type: "${type}"${extra} })`,
})
const state = (from: string, to: string): Entry => ({
  kind: "state",
  text: from === to ? `${from} (stays)` : `${from} → ${to}`,
})

const scripts: Record<
  PlayId,
  { label: string; initial: View; still: View; steps: Step[] }
> = {
  menu: {
    label: "Menu",
    initial: { open: false, hl: -1 },
    still: { open: true, hl: 1, input: "↓" },
    steps: [
      {
        input: "click",
        view: { open: true, hl: -1 },
        entries: [
          send("TRIGGER_CLICK"),
          state("idle", "open"),
          { kind: "props", text: 'trigger  aria-expanded="true"' },
          { kind: "props", text: 'content  data-state="open"' },
        ],
      },
      {
        input: "↓",
        view: { open: true, hl: 0 },
        entries: [
          send("ARROW_DOWN"),
          state("open", "open"),
          { kind: "ctx", text: 'highlightedValue  "edit"' },
        ],
      },
      {
        input: "↓",
        view: { open: true, hl: 1 },
        entries: [
          send("ARROW_DOWN"),
          { kind: "ctx", text: 'highlightedValue  "duplicate"' },
          { kind: "props", text: "item  data-highlighted" },
        ],
      },
      {
        input: "↵",
        view: { open: false, hl: -1, picked: "duplicate" },
        entries: [
          send("ITEM_CLICK", ', id: "duplicate"'),
          state("open", "closed"),
          { kind: "cb", text: 'onSelect({ value: "duplicate" })' },
          { kind: "props", text: 'trigger  aria-expanded="false"' },
        ],
      },
    ],
  },
  dialog: {
    label: "Dialog",
    initial: { open: false },
    still: { open: true, input: "click" },
    steps: [
      {
        input: "click",
        view: { open: true },
        entries: [
          send("TOGGLE"),
          state("closed", "open"),
          {
            kind: "effect",
            text: "trapFocus  preventScroll  hideContentBelow",
          },
          { kind: "props", text: 'content  role="dialog" aria-modal="true"' },
          { kind: "cb", text: "onOpenChange({ open: true })" },
        ],
      },
      {
        input: "tab",
        view: { open: true, hl: 1 },
        entries: [
          {
            kind: "effect",
            text: "focus trapped  input → save → close → input",
          },
        ],
      },
      {
        input: "esc",
        view: { open: false },
        entries: [
          send("CLOSE"),
          state("open", "closed"),
          { kind: "cb", text: "onOpenChange({ open: false })" },
          { kind: "effect", text: "restoreFocus  trigger" },
        ],
      },
    ],
  },
  slider: {
    label: "Slider",
    initial: { value: 30, dragging: false },
    still: { value: 61, dragging: true, input: "drag" },
    steps: [
      {
        input: "press",
        view: { value: 42, dragging: true },
        entries: [
          send("POINTER_DOWN"),
          state("idle", "dragging"),
          { kind: "props", text: "thumb  data-dragging" },
        ],
      },
      {
        input: "drag",
        view: { value: 61, dragging: true },
        entries: [
          send("POINTER_MOVE"),
          { kind: "cb", text: "onValueChange({ value: [61] })" },
        ],
      },
      {
        input: "drag",
        view: { value: 76, dragging: true },
        entries: [
          send("POINTER_MOVE"),
          { kind: "cb", text: "onValueChange({ value: [76] })" },
          { kind: "props", text: 'thumb  aria-valuenow="76"' },
        ],
      },
      {
        input: "release",
        view: { value: 76, dragging: false },
        entries: [
          send("POINTER_UP"),
          state("dragging", "focus"),
          { kind: "cb", text: "onValueChangeEnd({ value: [76] })" },
        ],
      },
      {
        input: "→",
        view: { value: 77, dragging: false },
        entries: [
          send("ARROW_INC"),
          state("focus", "focus"),
          { kind: "props", text: 'thumb  aria-valuenow="77"' },
        ],
      },
    ],
  },
}

type Line = Entry & { delay: number; at: number; view?: View; input?: string }

function timeline(id: PlayId) {
  const out: Line[] = []
  let at = 0
  scripts[id].steps.forEach((step, s) => {
    step.entries.forEach((entry, e) => {
      const delay = e === 0 ? (s === 0 ? 700 : 1300) : 240
      at += delay
      out.push({
        ...entry,
        delay,
        at,
        ...(e === 0 ? { view: step.view, input: step.input } : {}),
      })
    })
  })
  return out
}

const timelines: Record<PlayId, Line[]> = {
  menu: timeline("menu"),
  dialog: timeline("dialog"),
  slider: timeline("slider"),
}

const order: PlayId[] = ["menu", "dialog", "slider"]

const playCss = `
@keyframes zd-log { from { opacity: 0; transform: translateX(-6px); filter: blur(3px) } to { opacity: 1; transform: none; filter: none } }
@keyframes zd-caret { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
@keyframes zd-key { 0% { opacity: 0; transform: translateY(4px) scale(.9) } 20%, 80% { opacity: 1; transform: none } 100% { opacity: .0; transform: translateY(-4px) } }
.zd-log { animation: zd-log 380ms cubic-bezier(.2,.7,.2,1) both }
.zd-caret { animation: zd-caret 1s steps(1) infinite }
.zd-key { animation: zd-key 1200ms ease-out both }
.zd-fade { transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.7,.2,1), visibility 260ms }
@media (prefers-reduced-motion: reduce) { .zd-log, .zd-caret, .zd-key { animation: none } .zd-fade { transition: none } }
`

const items = ["Edit", "Duplicate", "Archive", "Delete"]

function Button(props: { children: string; solid?: boolean }) {
  return (
    <Box
      display="inline-flex"
      alignItems="center"
      h="8"
      px="3"
      borderRadius="md"
      fontSize="13px"
      fontWeight="medium"
      borderWidth="1px"
      borderColor={props.solid ? "text.bold" : "border.bold"}
      bg={props.solid ? "text.bold" : "bg"}
      color={props.solid ? "bg" : "text.bold"}
    >
      {props.children}
    </Box>
  )
}

function MenuPreview(props: { view: View }) {
  const { open, hl = -1, picked } = props.view
  return (
    <Box position="relative" w="200px" h="210px">
      <HStack
        h="9"
        px="3"
        w="fit-content"
        gap="2"
        borderWidth="1px"
        borderColor={open ? "text.muted" : "border.bold"}
        borderRadius="md"
        bg="bg"
        fontSize="13px"
        color="text.bold"
        transition="border-color 200ms"
      >
        Actions
        <styled.span color="text.muted" fontSize="10px">
          ▾
        </styled.span>
      </HStack>
      <Box
        className="zd-fade"
        position="absolute"
        top="11"
        left="0"
        w="180px"
        p="1"
        bg="bg"
        borderWidth="1px"
        borderColor="border.bold"
        borderRadius="lg"
        boxShadow="0 16px 32px -16px rgba(0,0,0,0.4)"
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "none" : "translateY(-4px) scale(.98)",
          visibility: open ? "visible" : "hidden",
          transformOrigin: "top left",
        }}
      >
        {items.map((item, i) => (
          <Box
            key={item}
            px="2.5"
            h="8"
            display="flex"
            alignItems="center"
            borderRadius="md"
            fontSize="13px"
            transition="background 160ms, color 160ms"
            bg={i === hl ? "bg.muted" : "transparent"}
            color={i === hl ? "text.bold" : "text.muted"}
            position="relative"
          >
            {i === hl && (
              <Box
                position="absolute"
                left="0"
                top="2"
                bottom="2"
                w="2px"
                borderRadius="full"
                bg={accent}
              />
            )}
            {item}
          </Box>
        ))}
      </Box>
      {picked && !open && (
        <styled.p
          key={picked}
          className="zd-log"
          position="absolute"
          top="14"
          left="0"
          fontFamily="mono"
          fontSize="11px"
          color="text.muted"
        >
          selected <styled.span color={accent}>{picked}</styled.span>
        </styled.p>
      )}
    </Box>
  )
}

function DialogPreview(props: { view: View }) {
  const { open, hl } = props.view
  const field = (focused: boolean) => (
    <Box
      h="8"
      borderWidth="1px"
      borderColor={focused ? accent : "border.bold"}
      borderRadius="md"
      bg="bg"
      transition="border-color 200ms"
    />
  )
  return (
    <>
      <Button>Edit profile</Button>
      <Box
        className="zd-fade"
        position="absolute"
        inset="0"
        bg={{ base: "rgba(255,255,255,0.6)", _dark: "rgba(0,0,0,0.55)" }}
        backdropFilter="blur(2px)"
        display="grid"
        placeItems="center"
        style={{
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
        }}
      >
        <Box
          className="zd-fade"
          w="250px"
          p="5"
          bg="bg"
          borderWidth="1px"
          borderColor="border.bold"
          borderRadius="xl"
          boxShadow="0 24px 48px -20px rgba(0,0,0,0.5)"
          style={{ transform: open ? "none" : "translateY(8px) scale(.97)" }}
        >
          <styled.p fontSize="14px" fontWeight="semibold" color="text.bold">
            Edit profile
          </styled.p>
          <styled.p mt="1" fontSize="12px" color="text.muted">
            Focus stays inside until you close.
          </styled.p>
          <Box mt="4" display="flex" flexDirection="column" gap="2">
            {field(!!open && hl !== 1)}
            {field(!!open && hl === 1)}
          </Box>
          <HStack mt="4" justify="flex-end" gap="2">
            <Button>Cancel</Button>
            <Button solid>Save</Button>
          </HStack>
        </Box>
      </Box>
    </>
  )
}

function SliderPreview(props: { view: View }) {
  const { value = 30, dragging } = props.view
  return (
    <Box w="240px">
      <HStack justify="space-between" mb="3">
        <styled.span fontSize="12px" color="text.muted">
          Volume
        </styled.span>
        <styled.span
          fontFamily="mono"
          fontSize="12px"
          color="text.bold"
          fontVariantNumeric="tabular-nums"
        >
          {value}
        </styled.span>
      </HStack>
      <Box position="relative" h="5" display="flex" alignItems="center">
        <Box
          flex="1"
          h="1"
          borderRadius="full"
          bg="border.bold"
          overflow="hidden"
        >
          <Box
            h="full"
            bg={accent}
            transition="width 520ms cubic-bezier(.2,.7,.2,1)"
            style={{ width: `${value}%` }}
          />
        </Box>
        <Box
          position="absolute"
          w="4"
          h="4"
          borderRadius="full"
          bg="bg"
          borderWidth="2px"
          borderColor={accent}
          transition="left 520ms cubic-bezier(.2,.7,.2,1), box-shadow 200ms"
          style={{
            left: `calc(${value}% - 8px)`,
            boxShadow: dragging ? "0 0 0 5px rgba(72,187,120,0.25)" : "none",
          }}
        />
        <styled.svg
          viewBox="0 0 16 16"
          w="4"
          h="4"
          position="absolute"
          top="4"
          color="text.bold"
          transition="left 520ms cubic-bezier(.2,.7,.2,1), opacity 200ms"
          style={{ left: `calc(${value}% - 2px)`, opacity: dragging ? 1 : 0 }}
          aria-hidden
        >
          <path
            d="M3 1 L3 13 L6 10 L8.5 15 L10.5 14 L8 9 L12 9 Z"
            fill="currentColor"
            stroke="var(--colors-bg, #fff)"
            strokeWidth="1"
          />
        </styled.svg>
      </Box>
    </Box>
  )
}

function Preview(props: { id: PlayId; view: View }) {
  if (props.id === "dialog") return <DialogPreview view={props.view} />
  if (props.id === "slider") return <SliderPreview view={props.view} />
  return <MenuPreview view={props.view} />
}

const tagColor: Record<Kind, string> = {
  send: "send",
  state: "state",
  ctx: "context",
  props: "props",
  effect: "effect",
  cb: "callback",
}

function LogLine(props: { line: Line }) {
  const { line } = props
  const [head, ...rest] = line.text.split("  ")
  return (
    <HStack
      className="zd-log"
      gap="0"
      alignItems="baseline"
      py="0.5"
      whiteSpace="nowrap"
    >
      <styled.span
        w={{ base: "12", md: "14" }}
        flexShrink="0"
        color="text.muted"
        opacity="0.5"
        fontVariantNumeric="tabular-nums"
      >
        {(line.at / 1000).toFixed(2)}s
      </styled.span>
      <styled.span
        w={{ base: "16", md: "20" }}
        flexShrink="0"
        color={line.kind === "send" ? accent : "text.muted"}
        opacity={line.kind === "send" ? 1 : 0.75}
      >
        {tagColor[line.kind]}
      </styled.span>
      <styled.span
        color={line.kind === "send" ? "text.bold" : "text.muted"}
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {rest.length ? (
          <>
            <styled.span color="text.bold">{head}</styled.span>
            {"  "}
            {rest.join("  ")}
          </>
        ) : (
          head
        )}
      </styled.span>
    </HStack>
  )
}

export function Playground() {
  const [tab, setTab] = useState<PlayId>("menu")
  const [cursor, setCursor] = useState(0)
  const [touched, setTouched] = useState(false)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const go = (next: PlayId) => {
    setTab(next)
    setCursor(0)
  }

  const service = useMachine(tabs.machine, {
    id: useId(),
    value: tab,
    onValueChange: (e) => go(e.value as PlayId),
  })
  const api = tabs.connect(service, normalizeProps)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    const el = rootRef.current
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    )
    if (el) io.observe(el)
    return () => {
      mq.removeEventListener("change", onChange)
      io.disconnect()
    }
  }, [])

  const lines = timelines[tab]

  useEffect(() => {
    if (reduced || !visible) return
    if (cursor < lines.length) {
      const t = setTimeout(() => setCursor((c) => c + 1), lines[cursor].delay)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      if (touched) setCursor(0)
      else go(order[(order.indexOf(tab) + 1) % order.length])
    }, 3000)
    return () => clearTimeout(t)
  }, [cursor, lines, tab, touched, visible, reduced])

  const shown = reduced ? lines : lines.slice(0, cursor)
  const script = scripts[tab]
  const last = [...shown].reverse().find((l) => l.view)
  const view = reduced ? script.still : (last?.view ?? script.initial)
  const input = reduced ? script.still.input : last?.input
  const done = cursor >= lines.length
  const status = reduced ? "static" : done ? "settled" : "streaming"

  return (
    <Box
      ref={rootRef}
      onPointerDown={() => setTouched(true)}
      onKeyDown={() => setTouched(true)}
    >
      <style>{playCss}</style>
      <Box
        {...api.getRootProps()}
        borderWidth="1px"
        borderColor="border"
        borderRadius="xl"
        overflow="hidden"
        bg="bg"
      >
        <HStack
          justify="space-between"
          borderBottomWidth="1px"
          borderColor="border"
          pr="3"
          bg="bg.muted"
        >
          <HStack {...api.getListProps()} gap="0" px="2">
            {order.map((id) => (
              <styled.button
                key={id}
                {...api.getTriggerProps({ value: id })}
                px="3"
                py="3"
                fontSize="13px"
                color="text.muted"
                borderBottomWidth="1px"
                borderColor="transparent"
                mb="-1px"
                transition="color 150ms, border-color 150ms"
                _hover={{ color: "text.bold" }}
                _selected={{ color: "text.bold", borderColor: "text.bold" }}
                focusVisibleRing="inside"
              >
                {scripts[id].label}
              </styled.button>
            ))}
          </HStack>
          <HStack gap="4">
            <HStack
              gap="2"
              fontFamily="mono"
              fontSize="10.5px"
              letterSpacing="0.1em"
              textTransform="uppercase"
              color="text.muted"
              display={{ base: "none", sm: "flex" }}
            >
              <Box
                w="1.5"
                h="1.5"
                borderRadius="full"
                bg={status === "streaming" ? accent : "border.bold"}
              />
              {status}
            </HStack>
            <styled.button
              onClick={() => setCursor(0)}
              disabled={reduced}
              fontFamily="mono"
              fontSize="12px"
              color="text.muted"
              px="2.5"
              h="7"
              borderWidth="1px"
              borderColor="border"
              borderRadius="md"
              _hover={{ color: "text.bold", borderColor: "border.bold" }}
              _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
              focusVisibleRing="outside"
            >
              ↺ replay
            </styled.button>
          </HStack>
        </HStack>
        {order.map((id) => (
          <Box key={id} {...api.getContentProps({ value: id })} outline="none">
            {id === tab && (
              <Grid
                gridTemplateColumns={{
                  base: "minmax(0, 1fr)",
                  md: "minmax(0, 5fr) minmax(0, 7fr)",
                }}
                gap="0"
              >
                <Box
                  aria-hidden
                  position="relative"
                  h={{ base: "280px", md: "400px" }}
                  display="grid"
                  placeItems="center"
                  bg="bg.muted"
                  borderRightWidth={{ base: "0", md: "1px" }}
                  borderBottomWidth={{ base: "1px", md: "0" }}
                  borderColor="border"
                  overflow="hidden"
                  css={{
                    backgroundImage:
                      "radial-gradient(circle, var(--zd-dot) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                    "--zd-dot": "rgba(0,0,0,0.08)",
                    _dark: { "--zd-dot": "rgba(255,255,255,0.07)" },
                  }}
                >
                  <Preview id={tab} view={view} />
                  {input && (
                    <Box
                      key={`${cursor}:${input}`}
                      className="zd-key"
                      position="absolute"
                      right="4"
                      bottom="4"
                      px="2"
                      h="6"
                      display="flex"
                      alignItems="center"
                      fontFamily="mono"
                      fontSize="11px"
                      color="text.bold"
                      bg="bg"
                      borderWidth="1px"
                      borderBottomWidth="2px"
                      borderColor="border.bold"
                      borderRadius="md"
                      style={reduced ? { opacity: 1 } : undefined}
                    >
                      {input}
                    </Box>
                  )}
                </Box>
                <Box
                  role="log"
                  aria-label={`${script.label} machine events`}
                  aria-live="off"
                  position="relative"
                  h={{ base: "300px", md: "400px" }}
                  overflow="hidden"
                  px={{ base: "4", md: "5" }}
                  py="5"
                  fontFamily="mono"
                  fontSize={{ base: "11px", md: "12px" }}
                  lineHeight="1.7"
                  display="flex"
                  flexDirection="column"
                  justifyContent="flex-end"
                  css={{
                    maskImage:
                      "linear-gradient(to bottom, transparent 0, black 72px)",
                  }}
                >
                  {shown.map((line, i) => (
                    <Box
                      key={`${tab}:${i}`}
                      mt={line.kind === "send" && i > 0 ? "3" : "0"}
                    >
                      <LogLine line={line} />
                    </Box>
                  ))}
                  <HStack gap="0" mt="1" color="text.muted">
                    <styled.span w={{ base: "12", md: "14" }} />
                    <Box
                      className={reduced ? undefined : "zd-caret"}
                      w="7px"
                      h="14px"
                      bg={done || reduced ? "border.bold" : accent}
                    />
                  </HStack>
                </Box>
              </Grid>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
