"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Box, styled } from "styled-system/jsx"
import { duration, ease, swapBlur } from "./motion"

export const items = [
  { value: "rename", label: "Rename" },
  { value: "copy", label: "Copy" },
  { value: "share", label: "Share" },
  { value: "delete", label: "Delete" },
]

export type Snapshot = { open: boolean; highlighted: string | null }

const washBg = {
  base: "rgba(47, 133, 90, 0.09)",
  _dark: "rgba(72, 187, 120, 0.11)",
} as const
const washHold = 380
const washFade = 600
const washStagger = 50
const lineH = 24
const gapH = 12

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

type Line = {
  src: string
  gap?: boolean
  chip?: { name: string; value: (s: Snapshot) => string }
  item?: string
}

const lines: Line[] = [
  {
    src: 'const service = useMachine(menu.machine, { id: "edit" })',
    chip: { name: "state", value: (s) => (s.open ? '"open"' : '"closed"') },
  },
  { src: "const api = menu.connect(service, normalizeProps)" },
  {
    src: "<button {...api.getTriggerProps()}>Edit</button>",
    gap: true,
    chip: { name: "aria-expanded", value: (s) => String(s.open) },
  },
  { src: "<div {...api.getPositionerProps()}>" },
  { src: "  <ul {...api.getContentProps()}>" },
  ...items.map((item): Line => ({
    src: `    <li {...api.getItemProps({ value: "${item.value}" })}>${item.label}</li>`,
    item: item.value,
  })),
  { src: "  </ul>" },
  { src: "</div>" },
]

const lineTop = (index: number) =>
  index * lineH + lines.slice(0, index + 1).filter((l) => l.gap).length * gapH

const firstItemLine = lines.findIndex((l) => l.item)

function washFrames(reduced: boolean): Keyframe[] {
  const total = duration.swap + washHold + washFade
  const swept = duration.swap / total
  const held = (duration.swap + washHold) / total
  const start = reduced ? "inset(0 0 0 0)" : "inset(0 100% 0 0)"
  return [
    { offset: 0, clipPath: start, opacity: reduced ? 0 : 1, easing: ease.out },
    { offset: swept, clipPath: "inset(0 0 0 0)", opacity: 1 },
    { offset: held, clipPath: "inset(0 0 0 0)", opacity: 1, easing: "ease" },
    { offset: 1, clipPath: "inset(0 0 0 0)", opacity: 0 },
  ]
}

function ringFrames(): Keyframe[] {
  const total = duration.swap + washHold + washFade
  return [
    { offset: 0, opacity: 0, easing: ease.out },
    { offset: duration.swap / total, opacity: 1 },
    { offset: (duration.swap + washHold) / total, opacity: 1, easing: "ease" },
    { offset: 1, opacity: 0 },
  ]
}

function play(el: Element | null | undefined, frames: Keyframe[], delay = 0) {
  if (!el) return
  el.getAnimations().forEach((a) => a.cancel())
  el.animate(frames, {
    duration: duration.swap + washHold + washFade,
    delay,
    fill: "backwards",
  })
}

export function CodePanel(props: { snapshot: Snapshot; reduced: boolean }) {
  const { snapshot, reduced } = props
  const washRefs = useRef<(HTMLElement | null)[]>([])
  const ringRefs = useRef<(HTMLElement | null)[]>([])
  const floatRingRef = useRef<HTMLElement | null>(null)

  const keys = lines.map((line) =>
    line.chip
      ? line.chip.value(snapshot)
      : line.item && snapshot.highlighted === line.item
        ? "on"
        : null,
  )
  const signature = keys.join("|")
  const prevKeys = useRef(keys)

  useLayoutEffect(() => {
    const prev = prevKeys.current
    prevKeys.current = keys
    let order = 0
    keys.forEach((key, i) => {
      if (key == null || key === prev[i]) return
      const delay = order++ * washStagger
      play(washRefs.current[i], washFrames(reduced), delay)
      play(ringRefs.current[i], ringFrames(), delay)
      if (lines[i].item) play(floatRingRef.current, ringFrames(), delay)
    })
  }, [signature])

  const hiIndex = items.findIndex((i) => i.value === snapshot.highlighted)
  const lastHi = useRef(Math.max(hiIndex, 0))
  const wasShown = useRef(false)
  const shown = hiIndex >= 0
  const glide = shown && wasShown.current && !reduced
  const at = shown ? hiIndex : lastHi.current
  useLayoutEffect(() => {
    if (hiIndex >= 0) lastHi.current = hiIndex
    wasShown.current = hiIndex >= 0
  })

  return (
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
      <Box position="relative" minW="max-content" ps="3" pe="5">
        {lines.map((line, i) => (
          <CodeLine
            key={i}
            line={line}
            value={keys[i]}
            reduced={reduced}
            washRef={(el) => {
              washRefs.current[i] = el
            }}
            ringRef={(el) => {
              ringRefs.current[i] = el
            }}
          />
        ))}
        <Box
          aria-hidden
          position="absolute"
          top="0"
          insetStart="0"
          insetEnd="0"
          h="24px"
          ps="3"
          display="grid"
          gridTemplateColumns={{ base: "104px 1fr", md: "162px 1fr" }}
          pointerEvents="none"
          willChange="transform"
          style={{
            transform: `translateY(${lineTop(firstItemLine + at)}px)`,
            opacity: shown ? 1 : 0,
            transition: glide
              ? `transform ${duration.hop}ms ${ease.inOut}, opacity ${duration.close}ms ${ease.out}`
              : `opacity ${shown ? duration.hop : duration.close}ms ${ease.out}`,
          }}
        >
          <ChipSlot>
            <ChipShell ringRef={(el) => (floatRingRef.current = el)}>
              <styled.span display={{ base: "none", md: "inline" }}>
                data-highlighted
              </styled.span>
              <styled.span display={{ base: "inline", md: "none" }}>
                highlighted
              </styled.span>
            </ChipShell>
          </ChipSlot>
        </Box>
      </Box>
    </styled.pre>
  )
}

function ChipSlot(props: { children?: React.ReactNode }) {
  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center" pe="3">
      {props.children}
    </Box>
  )
}

function ChipShell(props: {
  children: React.ReactNode
  ringRef: (el: HTMLElement | null) => void
}) {
  return (
    <styled.span
      position="relative"
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
      {props.children}
      <styled.span
        ref={props.ringRef}
        aria-hidden
        position="absolute"
        inset="-1px"
        borderWidth="1px"
        borderColor="accent"
        borderRadius="full"
        pointerEvents="none"
        opacity="0"
      />
    </styled.span>
  )
}

function CodeLine(props: {
  line: Line
  value: string | null
  reduced: boolean
  washRef: (el: HTMLElement | null) => void
  ringRef: (el: HTMLElement | null) => void
}) {
  const { line, value, reduced, washRef, ringRef } = props
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "104px 1fr", md: "162px 1fr" }}
      h="24px"
      mt={line.gap ? "12px" : "0"}
    >
      <ChipSlot>
        {line.chip && (
          <ChipShell ringRef={ringRef}>
            <styled.span display={{ base: "none", md: "inline" }}>
              {line.chip.name}
            </styled.span>
            <Roll
              value={value ?? ""}
              reduced={reduced}
              mx={{ base: "auto", md: "0" }}
            />
          </ChipShell>
        )}
      </ChipSlot>
      <Box
        position="relative"
        zIndex="0"
        borderLeftWidth="2px"
        borderColor="border"
        ps="4"
        whiteSpace="pre"
      >
        <styled.span
          ref={washRef}
          aria-hidden
          position="absolute"
          top="0"
          bottom="0"
          insetStart="-2px"
          insetEnd="0"
          zIndex="-1"
          bg={washBg}
          borderLeftWidth="2px"
          borderColor="accent"
          pointerEvents="none"
          opacity="0"
        />
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

type RollState = { cur: string; prev: string | null; n: number }

function Roll(props: {
  value: string
  reduced: boolean
  mx: { base: string; md: string }
}) {
  const { value, reduced, mx } = props
  const [state, setState] = useState<RollState>({
    cur: value,
    prev: null,
    n: 0,
  })
  if (state.cur !== value) {
    setState({ cur: value, prev: state.cur, n: state.n + 1 })
  }
  const curRef = useRef<HTMLSpanElement>(null)
  const prevRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (state.n === 0) return
    const opts = { duration: duration.swap, easing: ease.out }
    const shift = reduced ? 0 : 100
    const blur = reduced ? "blur(0px)" : swapBlur
    curRef.current?.animate(
      [
        { transform: `translateY(${shift}%)`, opacity: 0, filter: blur },
        { transform: "translateY(0)", opacity: 1, filter: "blur(0px)" },
      ],
      opts,
    )
    const out = prevRef.current?.animate(
      [
        { transform: "translateY(0)", opacity: 1, filter: "blur(0px)" },
        { transform: `translateY(-${shift}%)`, opacity: 0, filter: blur },
      ],
      { ...opts, fill: "forwards" },
    )
    if (!out) return
    const n = state.n
    out.onfinish = () => setState((s) => (s.n === n ? { ...s, prev: null } : s))
  }, [state.n])

  return (
    <styled.span
      display="inline-grid"
      overflow="hidden"
      justifyItems={{ base: "center", md: "end" }}
      mx={mx}
      css={{ "& > *": { gridArea: "1 / 1" } }}
    >
      {state.prev != null && (
        <styled.span
          key={`p${state.n}`}
          ref={prevRef}
          aria-hidden
          lineHeight="12px"
          color="text.bold"
        >
          {state.prev}
        </styled.span>
      )}
      <styled.span
        key={`c${state.n}`}
        ref={curRef}
        lineHeight="12px"
        color="text.bold"
      >
        {state.cur}
      </styled.span>
    </styled.span>
  )
}
