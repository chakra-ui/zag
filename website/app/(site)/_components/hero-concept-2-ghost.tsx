"use client"

import { useLayoutEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"
import { Box, HStack, Stack, styled } from "styled-system/jsx"
import { duration, ease } from "./motion"
import {
  field,
  frameworks,
  menuItems,
  Pinned,
  popover,
  tabItems,
} from "./hero-concept-2-live"
import {
  springAt,
  springEasing,
  springMs,
  Swap,
  tr,
} from "./hero-concept-2-motion"
import { accent } from "./shared"

export interface GhostProps {
  beat: number
  reduced: boolean
}

export function Pop(props: {
  open: boolean
  reduced: boolean
  origin: string
  style?: CSSProperties
  children: ReactNode
}) {
  const { open, reduced } = props
  const ms = open ? duration.open : duration.close
  return (
    <Box
      position="absolute"
      zIndex="5"
      style={{
        transformOrigin: props.origin,
        opacity: open ? 1 : 0,
        transform: open || reduced ? "none" : "scale(0.96)",
        transition: tr(["opacity", "transform"], ms, ease.out),
        ...props.style,
      }}
    >
      {props.children}
    </Box>
  )
}

export function HighlightRows(props: {
  rows: ReactNode[]
  hi: number
  rowH: number
  pressed?: boolean
  reduced: boolean
  glideMs?: number
  hidden?: number[]
}) {
  const { hi, rowH, pressed, reduced } = props
  const moveMs = pressed ? duration.press : (props.glideMs ?? duration.hop)
  return (
    <Box position="relative">
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        borderRadius="sm"
        bg="bg.muted"
        style={{
          height: rowH,
          opacity: hi >= 0 ? 1 : 0,
          transform: `translateY(${Math.max(hi, 0) * rowH}px) scale(${pressed && !reduced ? 0.98 : 1})`,
          transition: [
            reduced
              ? "transform 0ms"
              : `transform ${moveMs}ms ${pressed ? ease.out : ease.inOut}`,
            `opacity ${duration.hop}ms ${ease.out}`,
          ].join(", "),
        }}
      />
      {props.rows.map((row, i) => {
        const gone = props.hidden?.includes(i)
        return (
          <Box
            key={i}
            position="relative"
            color={hi === i ? "text.bold" : "text.muted"}
            style={{
              height: rowH,
              opacity: gone ? 0 : 1,
              filter: gone ? "blur(2px)" : "blur(0px)",
              transform:
                pressed && hi === i && !reduced ? "scale(0.98)" : "none",
              transition: [
                "color 160ms ease",
                tr(["opacity", "filter"], duration.close, ease.out),
                `transform ${duration.press}ms ${ease.out}`,
              ].join(", "),
            }}
          >
            {row}
          </Box>
        )
      })}
    </Box>
  )
}

const optionRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6",
  px: "2.5",
  h: "full",
} as const

export function GhostMenu(props: GhostProps) {
  const { beat, reduced } = props
  const open = beat >= 2
  const hi = beat >= 3 ? beat - 3 : -1
  const state = open ? "open" : "idle"
  return (
    <Pinned
      states={["idle", "open", "closed"]}
      active={state}
      rows={[
        ["state", state],
        ["highlightedValue", hi >= 0 ? menuItems[hi].value : undefined],
      ]}
    >
      <Box position="relative">
        <styled.div
          {...field}
          display="inline-flex"
          alignItems="center"
          gap="2"
          style={{
            transform: beat === 1 && !reduced ? "scale(0.98)" : "none",
            transition: `transform ${duration.press}ms ${ease.out}`,
          }}
        >
          Actions
          <styled.span color="text.muted" fontSize="11px">
            ▾
          </styled.span>
        </styled.div>
        <Pop
          open={open}
          reduced={reduced}
          origin="top left"
          style={{ top: "calc(100% + 6px)", left: 0 }}
        >
          <styled.div {...popover} minW="212px">
            <HighlightRows
              reduced={reduced}
              hi={hi}
              rowH={32}
              rows={menuItems.map((item) => (
                <styled.div key={item.value} {...optionRow}>
                  {item.label}
                  <styled.span
                    fontFamily="mono"
                    fontSize="11px"
                    color="text.muted"
                  >
                    {item.kbd}
                  </styled.span>
                </styled.div>
              ))}
            />
          </styled.div>
        </Pop>
      </Box>
    </Pinned>
  )
}

const sliderW = 260

export function GhostSlider(props: GhostProps) {
  const { beat, reduced } = props
  const from = 42
  const to = 74
  const [v, setV] = useState(from)
  const thumbRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)
  const state = beat === 1 ? "dragging" : beat >= 2 ? "focus" : "idle"
  const thumbAt = (n: number) => `translate(${(sliderW * n) / 100 - 9}px, -50%)`
  const rangeAt = (n: number) => `scaleX(${n / 100})`

  useLayoutEffect(() => {
    if (beat !== 1) return
    const thumb = thumbRef.current
    const range = rangeRef.current
    if (!thumb || !range || reduced) {
      setV(to)
      return
    }
    const opts: KeyframeAnimationOptions = {
      duration: springMs,
      easing: springEasing(),
      fill: "forwards",
    }
    const a = thumb.animate(
      [{ transform: thumbAt(from) }, { transform: thumbAt(to) }],
      opts,
    )
    const b = range.animate(
      [{ transform: rangeAt(from) }, { transform: rangeAt(to) }],
      opts,
    )
    let raf = 0
    const tick = () => {
      const t = Number(a.currentTime ?? 0)
      setV(Math.round(from + (to - from) * springAt(Math.min(t, springMs))))
      if (t < springMs) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      a.cancel()
      b.cancel()
    }
  }, [beat, reduced])

  return (
    <Pinned
      states={["idle", "focus", "dragging"]}
      active={state}
      rows={[
        ["state", state],
        ["value", [v]],
      ]}
    >
      <Box w="260px">
        <HStack justify="space-between" mb="2" fontSize="13px">
          <styled.span color="text.muted">Volume</styled.span>
          <styled.span fontFamily="mono" color="text.bold">
            {v}
          </styled.span>
        </HStack>
        <Box py="2.5">
          <Box position="relative" h="2px" bg="border.bold" borderRadius="full">
            <Box
              ref={rangeRef}
              position="absolute"
              inset="0"
              bg="text.bold"
              borderRadius="full"
              transformOrigin="left center"
              style={{ transform: rangeAt(v) }}
            />
            <Box
              ref={thumbRef}
              position="absolute"
              top="50%"
              left="0"
              w="18px"
              h="18px"
              borderRadius="full"
              bg="bg"
              borderWidth="1px"
              borderColor="text.bold"
              style={{
                transform: thumbAt(v),
                boxShadow:
                  beat === 1 ? "0 0 0 3px var(--colors-border-bold)" : "none",
                transition: "box-shadow 160ms ease",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Pinned>
  )
}

export function GhostTabs(props: GhostProps) {
  const { beat, reduced } = props
  const value = tabItems[Math.min(beat, tabItems.length - 1)].value
  const state = beat >= 1 ? "focused" : "idle"
  const listRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  useLayoutEffect(() => {
    const list = listRef.current
    const bar = barRef.current
    const tab = list?.querySelector<HTMLElement>(`[data-tab="${value}"]`)
    if (!bar || !tab) return
    bar.style.transition =
      placed.current && !reduced
        ? `transform ${duration.swap}ms ${ease.inOut}`
        : "none"
    bar.style.transform = `translateX(${tab.offsetLeft}px) scaleX(${tab.offsetWidth / 100})`
    placed.current = true
  }, [value, reduced])

  const body = tabItems.find((t) => t.value === value)?.body
  return (
    <Pinned
      states={["idle", "focused"]}
      active={state}
      rows={[
        ["state", state],
        ["value", value],
      ]}
    >
      <Box w="280px">
        <HStack
          ref={listRef}
          position="relative"
          gap="0"
          borderBottomWidth="1px"
          borderColor="border"
        >
          {tabItems.map((t) => (
            <styled.span
              key={t.value}
              data-tab={t.value}
              px="3"
              py="2"
              mb="-1px"
              fontSize="14px"
              color={t.value === value ? "text.bold" : "text.muted"}
              transition="color 200ms ease"
            >
              {t.label}
            </styled.span>
          ))}
          <styled.span
            ref={barRef}
            position="absolute"
            left="0"
            bottom="-1px"
            w="100px"
            h="1px"
            bg={accent}
            transformOrigin="0 0"
          />
        </HStack>
        <Box pt="3" fontSize="14px" color="text.muted" minH="12">
          <Swap id={value} mode="text" reduced={reduced}>
            {body}
          </Swap>
        </Box>
      </Box>
    </Pinned>
  )
}

function Caret(props: { on: boolean; reduced: boolean; tick: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { on, reduced, tick } = props
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !on || reduced) return
    const a = el.animate(
      [
        { opacity: 1 },
        { opacity: 1, offset: 0.5 },
        { opacity: 0, offset: 0.5 },
        { opacity: 0 },
      ],
      { duration: 1000, iterations: Infinity },
    )
    return () => a.cancel()
  }, [on, reduced, tick])
  return (
    <styled.span
      ref={ref}
      display="inline-block"
      w="1px"
      h="16px"
      bg="text.bold"
      mx="1px"
      style={{ opacity: on ? 1 : 0 }}
    />
  )
}

function Slab(props: { h: number; reduced: boolean }) {
  const r = 8
  const t = props.reduced ? "none" : `transform ${duration.hop}ms ${ease.inOut}`
  const common = {
    position: "absolute",
    left: "0",
    right: "0",
    top: "0",
    bg: "bg.popover",
    borderColor: "border.bold",
    transformOrigin: "0 0",
  } as const
  return (
    <Box
      position="absolute"
      inset="0"
      style={{ filter: "drop-shadow(0 12px 20px rgb(0 0 0 / 0.18))" }}
    >
      <Box
        {...common}
        h="9px"
        borderTopWidth="1px"
        borderXWidth="1px"
        borderTopRadius="md"
      />
      <Box
        {...common}
        h="100px"
        borderXWidth="1px"
        style={{
          transform: `translateY(${r}px) scaleY(${(props.h - 2 * r) / 100})`,
          transition: t,
        }}
      />
      <Box
        {...common}
        h="9px"
        borderBottomWidth="1px"
        borderXWidth="1px"
        borderBottomRadius="md"
        style={{
          transform: `translateY(${props.h - r - 1}px)`,
          transition: t,
        }}
      />
    </Box>
  )
}

const comboRows = ["svelte", "solid"]

export function GhostCombobox(props: GhostProps) {
  const { beat, reduced } = props
  const typed = beat >= 6 ? "Svelte" : beat >= 3 ? "sv" : beat >= 2 ? "s" : ""
  const open = beat >= 2 && beat < 6
  const state =
    beat >= 6
      ? "focused"
      : beat >= 4
        ? "interacting"
        : beat >= 2
          ? "suggesting"
          : beat >= 1
            ? "focused"
            : "idle"
  const rowH = 32
  const pad = 4
  const filtered = beat >= 3
  return (
    <Pinned
      states={["idle", "focused", "suggesting", "interacting"]}
      active={state}
      rows={[
        ["state", state],
        ["inputValue", typed],
        ["value", beat >= 6 ? ["svelte"] : []],
      ]}
    >
      <Box w="240px">
        <styled.span
          display="block"
          mb="1.5"
          fontSize="13px"
          color="text.muted"
        >
          Framework
        </styled.span>
        <Box position="relative">
          <styled.div
            {...field}
            display="flex"
            alignItems="center"
            pe="8"
            w="full"
          >
            {typed ? (
              <>
                <span>{typed}</span>
                <Caret on={beat >= 1} reduced={reduced} tick={beat} />
              </>
            ) : (
              <>
                <Caret on={beat >= 1} reduced={reduced} tick={beat} />
                <styled.span color="text.muted">Search frameworks</styled.span>
              </>
            )}
            <styled.span
              position="absolute"
              insetEnd="3"
              color="text.muted"
              fontSize="11px"
            >
              ▾
            </styled.span>
          </styled.div>
          <Pop
            open={open}
            reduced={reduced}
            origin="top center"
            style={{ top: "calc(100% + 6px)", left: 0, right: 0 }}
          >
            <Box
              position="relative"
              fontSize="14px"
              style={{ height: pad * 2 + rowH * 2 }}
            >
              <Slab h={pad * 2 + rowH * (filtered ? 1 : 2)} reduced={reduced} />
              <Box position="relative" p="1">
                <HighlightRows
                  reduced={reduced}
                  hi={beat >= 4 ? 0 : -1}
                  pressed={beat === 5}
                  rowH={rowH}
                  hidden={filtered ? [1] : []}
                  rows={comboRows.map((v) => (
                    <styled.div key={v} {...optionRow}>
                      {frameworks.find((f) => f.value === v)?.label}
                    </styled.div>
                  ))}
                />
              </Box>
            </Box>
          </Pop>
        </Box>
      </Box>
    </Pinned>
  )
}

const cellW = 32
const cellH = 26
const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

export function GhostDatePicker(props: GhostProps) {
  const { beat, reduced } = props
  const grid = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const offset = new Date(y, m, 1).getDay()
    const days = new Date(y, m + 1, 0).getDate()
    const weeks = Math.ceil((offset + days) / 7)
    const cells = Array.from(
      { length: weeks * 7 },
      (_, i) => new Date(y, m, 1 - offset + i),
    )
    const today = offset + now.getDate() - 1
    const target = today % 7 <= 3 ? today + 3 : today - 3
    const title = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    return { cells, today, target, title, m }
  }, [])
  const at = beat >= 2 ? grid.target : grid.today
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  const state = beat >= 1 ? "focused" : "idle"
  return (
    <Pinned
      states={["idle", "focused", "open"]}
      active={state}
      rows={[
        ["state", state],
        ["value", beat >= 1 ? [iso(grid.cells[at])] : []],
      ]}
    >
      <Box fontSize="13px">
        <HStack justify="space-between" mb="2">
          <styled.span color="text.muted" px="2" h="7" lineHeight="28px">
            ‹
          </styled.span>
          <styled.span fontWeight="medium" color="text.bold">
            {grid.title}
          </styled.span>
          <styled.span color="text.muted" px="2" h="7" lineHeight="28px">
            ›
          </styled.span>
        </HStack>
        <Box display="grid" gridTemplateColumns="repeat(7, 32px)">
          {weekDays.map((d, i) => (
            <styled.span
              key={i}
              h="7"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="11px"
              fontFamily="mono"
              color="text.muted"
            >
              {d}
            </styled.span>
          ))}
        </Box>
        <Box
          position="relative"
          display="grid"
          gridTemplateColumns="repeat(7, 32px)"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            borderRadius="sm"
            bg={accent}
            style={{
              width: cellW,
              height: cellH,
              opacity: beat >= 1 ? 1 : 0,
              transform: `translate(${(at % 7) * cellW}px, ${Math.floor(at / 7) * cellH}px) scale(${beat >= 1 || reduced ? 1 : 0.96})`,
              transition: [
                reduced
                  ? "transform 0ms"
                  : `transform ${duration.swap}ms ${ease.inOut}`,
                `opacity ${duration.open}ms ${ease.out}`,
              ].join(", "),
            }}
          />
          {grid.cells.map((d, i) => {
            const sel = beat >= 1 && i === at
            const outside = d.getMonth() !== grid.m
            return (
              <styled.span
                key={i}
                position="relative"
                h="26px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={
                  sel
                    ? { base: "white", _dark: "gray.900" }
                    : outside
                      ? "text.muted"
                      : "text.bold"
                }
                opacity={outside && !sel ? 0.5 : 1}
                textDecoration={i === grid.today ? "underline" : "none"}
                textUnderlineOffset="3px"
                transition="color 160ms ease"
              >
                {d.getDate()}
              </styled.span>
            )
          })}
        </Box>
      </Box>
    </Pinned>
  )
}

export function GhostDialog(props: GhostProps) {
  const { beat, reduced } = props
  const open = beat === 2
  const ms = open ? 220 : 150
  const state = open ? "open" : "closed"
  return (
    <Pinned
      states={["closed", "open"]}
      active={state}
      rows={[
        ["state", state],
        ["open", open],
      ]}
    >
      <Box
        position="relative"
        w="300px"
        h="176px"
        borderWidth="1px"
        borderColor="border"
        borderRadius="md"
        bg="bg"
        overflow="hidden"
      >
        <Stack gap="3" p="4">
          <HStack justify="space-between">
            <styled.span fontSize="13px" fontWeight="medium" color="text.bold">
              acme-web
            </styled.span>
            <Box w="10" h="1.5" borderRadius="full" bg="border" />
          </HStack>
          <Box w="70%" h="1.5" borderRadius="full" bg="border" />
          <Box w="45%" h="1.5" borderRadius="full" bg="border" />
          <Box>
            <styled.div
              {...field}
              display="inline-flex"
              alignItems="center"
              h="8"
              fontSize="13px"
              style={{
                transform: beat === 1 && !reduced ? "scale(0.98)" : "none",
                transition: `transform ${duration.press}ms ${ease.out}`,
              }}
            >
              Delete project…
            </styled.div>
          </Box>
        </Stack>
        <Box
          position="absolute"
          inset="0"
          bg="rgb(0 0 0 / 0.35)"
          style={{
            opacity: open ? 1 : 0,
            transition: `opacity ${ms}ms ${ease.out}`,
          }}
        />
        <Box
          position="absolute"
          left="50%"
          top="50%"
          w="232px"
          bg="bg.popover"
          borderWidth="1px"
          borderColor="border.bold"
          borderRadius="lg"
          p="4"
          boxShadow="0 16px 40px -16px rgb(0 0 0 / 0.35)"
          style={{
            opacity: open ? 1 : 0,
            transform: `translate(-50%, -50%)${open || reduced ? "" : " translateY(8px) scale(0.96)"}`,
            transition: tr(["opacity", "transform"], ms, ease.out),
          }}
        >
          <styled.p fontSize="14px" fontWeight="semibold" color="text.bold">
            Delete project?
          </styled.p>
          <styled.p mt="1" fontSize="12px" lineHeight="1.5" color="text.muted">
            This removes acme-web and its deployments.
          </styled.p>
          <HStack mt="3" justify="flex-end" gap="2">
            <styled.span
              {...field}
              h="7"
              px="2.5"
              fontSize="12px"
              display="inline-flex"
              alignItems="center"
            >
              Cancel
            </styled.span>
            <styled.span
              {...field}
              h="7"
              px="2.5"
              fontSize="12px"
              display="inline-flex"
              alignItems="center"
              bg="text.bold"
              color="bg"
              borderColor="text.bold"
            >
              Delete
            </styled.span>
          </HStack>
        </Box>
      </Box>
    </Pinned>
  )
}
