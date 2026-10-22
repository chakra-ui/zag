"use client"

import * as combobox from "@zag-js/combobox"
import * as datePicker from "@zag-js/date-picker"
import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as tabs from "@zag-js/tabs"
import {
  Fragment,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import { Box, HStack, Stack, styled } from "styled-system/jsx"
import { duration, ease } from "./motion"
import { accent } from "./shared"

function fmt(value: unknown) {
  return value === undefined ? "null" : JSON.stringify(value)
}

export function Readout(props: { rows: [string, unknown][] }) {
  return (
    <Stack
      gap="0.5"
      fontFamily="mono"
      fontSize="12px"
      lineHeight="1.5"
      color="text.muted"
      borderLeftWidth="1px"
      borderColor="border.bold"
      ps="3"
      aria-hidden="true"
      data-c2-readout=""
    >
      {props.rows.map(([key, value], i) => (
        <styled.p key={key} whiteSpace="nowrap">
          {key}:{" "}
          <styled.span color={i === 0 ? accent : "text.bold"}>
            {fmt(value)}
          </styled.span>
        </styled.p>
      ))}
    </Stack>
  )
}

export function Chart(props: { states: string[]; active: string }) {
  const leaf = props.active.split(".").pop()
  const rowRef = useRef<HTMLDivElement>(null)
  const capL = useRef<HTMLSpanElement>(null)
  const mid = useRef<HTMLSpanElement>(null)
  const capR = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)
  const leafRef = useRef(leaf)

  useLayoutEffect(() => {
    leafRef.current = leaf
    const place = (animate: boolean) => {
      const row = rowRef.current
      const parts = [capL.current, mid.current, capR.current]
      if (!row || parts.some((p) => !p)) return
      const [l, m, r] = parts as HTMLSpanElement[]
      const pill = row.querySelector<HTMLElement>(
        `[data-pill="${leafRef.current}"]`,
      )
      const still = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches
      const t = animate
        ? `${still ? "transform 0ms" : `transform ${duration.swap}ms ${ease.inOut}`}, opacity ${duration.hop}ms ${ease.out}`
        : "none"
      parts.forEach((p) => {
        p!.style.transition = t
        p!.style.opacity = pill ? "1" : "0"
      })
      if (!pill) return
      const x = pill.offsetLeft
      const y = pill.offsetTop
      const w = pill.offsetWidth
      const h = pill.offsetHeight
      const c = h / 2
      l.style.width = `${c}px`
      r.style.width = `${c}px`
      ;[l, m, r].forEach((p) => (p.style.height = `${h}px`))
      l.style.transform = `translate(${x}px, ${y}px)`
      m.style.transform = `translate(${x + c - 0.5}px, ${y}px) scaleX(${(w - 2 * c + 1) / 100})`
      r.style.transform = `translate(${x + w - c}px, ${y}px)`
    }
    place(placed.current)
    placed.current = true
    const row = rowRef.current
    if (!row) return
    let skip = true
    const ro = new ResizeObserver(() => {
      if (skip) {
        skip = false
        return
      }
      place(false)
    })
    ro.observe(row)
    return () => ro.disconnect()
  }, [leaf])

  const part = {
    position: "absolute",
    top: "0",
    left: "0",
    borderColor: accent,
    pointerEvents: "none",
    transformOrigin: "0 0",
    opacity: "0",
  } as const

  return (
    <HStack
      ref={rowRef}
      position="relative"
      gap="0"
      fontFamily="mono"
      fontSize="11px"
      aria-hidden="true"
      flexWrap="wrap"
      rowGap="2"
    >
      {props.states.map((s, i) => {
        const on = s === leaf
        return (
          <Fragment key={s}>
            {i > 0 && <Box w="4" h="1px" bg="border.bold" flexShrink="0" />}
            <styled.span
              px="2"
              py="0.5"
              borderWidth="1px"
              borderRadius="full"
              borderColor="border"
              color={on ? accent : "text.muted"}
              transition="color 200ms ease"
              data-pill={s}
              data-active={on ? "" : undefined}
            >
              {s}
            </styled.span>
          </Fragment>
        )
      })}
      <styled.span
        ref={capL}
        {...part}
        borderWidth="1px"
        borderRightWidth="0"
        borderLeftRadius="full"
      />
      <styled.span
        ref={mid}
        {...part}
        w="100px"
        borderTopWidth="1px"
        borderBottomWidth="1px"
      />
      <styled.span
        ref={capR}
        {...part}
        borderWidth="1px"
        borderLeftWidth="0"
        borderRightRadius="full"
      />
    </HStack>
  )
}

export function Pinned(props: {
  children: ReactNode
  rows: [string, unknown][]
  states: string[]
  active: string
}) {
  return (
    <Stack gap="0" flex="1" minH="0">
      <Stack flex="1" justify="center" align="center" px="6" py="6">
        <Stack gap="4" align="flex-start">
          {props.children}
          <Readout rows={props.rows} />
        </Stack>
      </Stack>
      <Box borderTopWidth="1px" borderColor="border" px="5" py="3.5">
        <Chart states={props.states} active={props.active} />
      </Box>
    </Stack>
  )
}

export const field = {
  h: "9",
  px: "3",
  borderWidth: "1px",
  borderColor: "border.bold",
  borderRadius: "md",
  bg: "bg",
  color: "text.bold",
  fontSize: "14px",
  focusVisibleRing: "outside",
} as const

export const popover = {
  bg: "bg.popover",
  borderWidth: "1px",
  borderColor: "border.bold",
  borderRadius: "md",
  p: "1",
  boxShadow: "0 16px 40px -16px rgb(0 0 0 / 0.35)",
  outline: "0",
  fontSize: "14px",
  zIndex: "50",
} as const

export const option = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6",
  px: "2.5",
  py: "1.5",
  borderRadius: "sm",
  color: "text.muted",
  cursor: "default",
  _highlighted: { bg: "bg.muted", color: "text.bold" },
} as const

export const menuItems = [
  { value: "rename", label: "Rename", kbd: "R" },
  { value: "copy", label: "Copy", kbd: "C" },
  { value: "share", label: "Share", kbd: "S" },
  { value: "delete", label: "Delete", kbd: "⌫" },
]

export function LiveMenu() {
  const service = useMachine(menu.machine, {
    id: useId(),
    positioning: { placement: "bottom-start", gutter: 6 },
  })
  const api = menu.connect(service, normalizeProps)
  return (
    <Pinned
      states={["idle", "open", "closed"]}
      active={service.state.get()}
      rows={[
        ["state", service.state.get()],
        ["highlightedValue", api.highlightedValue ?? undefined],
      ]}
    >
      <styled.button
        {...api.getTriggerProps()}
        {...field}
        display="inline-flex"
        alignItems="center"
        gap="2"
      >
        Actions
        <styled.span
          {...api.getIndicatorProps()}
          color="text.muted"
          fontSize="11px"
        >
          ▾
        </styled.span>
      </styled.button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <styled.div {...api.getContentProps()} {...popover} minW="212px">
            <div {...api.getListProps()}>
              {menuItems.map((item) => (
                <styled.div
                  key={item.value}
                  {...api.getItemProps({ value: item.value })}
                  {...option}
                >
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
            </div>
          </styled.div>
        </div>
      </Portal>
    </Pinned>
  )
}

export function LiveDialog() {
  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)
  return (
    <Pinned
      states={["closed", "open"]}
      active={service.state.get()}
      rows={[
        ["state", service.state.get()],
        ["open", api.open],
      ]}
    >
      <styled.button {...api.getTriggerProps()} {...field}>
        Delete project…
      </styled.button>
      <Portal>
        {api.open && (
          <>
            <styled.div
              {...api.getBackdropProps()}
              position="fixed"
              inset="0"
              bg="rgb(0 0 0 / 0.35)"
              zIndex="60"
            />
            <styled.div
              {...api.getPositionerProps()}
              position="fixed"
              inset="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p="4"
              zIndex="61"
            >
              <styled.div
                {...api.getContentProps()}
                bg="bg.popover"
                borderWidth="1px"
                borderColor="border.bold"
                borderRadius="lg"
                p="6"
                w="full"
                maxW="380px"
                outline="0"
              >
                <styled.h2
                  {...api.getTitleProps()}
                  fontSize="17px"
                  fontWeight="semibold"
                  color="text.bold"
                >
                  Delete project?
                </styled.h2>
                <styled.p
                  {...api.getDescriptionProps()}
                  mt="2"
                  fontSize="14px"
                  lineHeight="1.55"
                  color="text.muted"
                >
                  This removes acme-web and its 12 deployments. Focus stays in
                  here until you choose.
                </styled.p>
                <HStack mt="6" justify="flex-end" gap="2">
                  <styled.button {...api.getCloseTriggerProps()} {...field}>
                    Cancel
                  </styled.button>
                  <styled.button
                    {...field}
                    bg="text.bold"
                    color="bg"
                    borderColor="text.bold"
                    onClick={() => api.setOpen(false)}
                  >
                    Delete
                  </styled.button>
                </HStack>
              </styled.div>
            </styled.div>
          </>
        )}
      </Portal>
    </Pinned>
  )
}

export const frameworks = [
  { value: "react", label: "React" },
  { value: "preact", label: "Preact" },
  { value: "solid", label: "Solid" },
  { value: "svelte", label: "Svelte" },
  { value: "vue", label: "Vue" },
  { value: "vanilla", label: "Vanilla" },
]

export function LiveCombobox() {
  const [items, setItems] = useState(frameworks)
  const collection = useMemo(() => combobox.collection({ items }), [items])
  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    placeholder: "Search frameworks",
    positioning: { placement: "bottom-start", gutter: 6, sameWidth: true },
    onInputValueChange({ inputValue }) {
      const q = inputValue.toLowerCase()
      const next = frameworks.filter((f) => f.label.toLowerCase().includes(q))
      setItems(next.length ? next : frameworks)
    },
  })
  const api = combobox.connect(service, normalizeProps)

  return (
    <Pinned
      states={["idle", "focused", "suggesting", "interacting"]}
      active={service.state.get()}
      rows={[
        ["state", service.state.get()],
        ["inputValue", api.inputValue],
        ["value", api.value],
      ]}
    >
      <Box {...api.getRootProps()} w="240px">
        <styled.label
          {...api.getLabelProps()}
          display="block"
          mb="1.5"
          fontSize="13px"
          color="text.muted"
        >
          Framework
        </styled.label>
        <HStack {...api.getControlProps()} gap="0" position="relative">
          <styled.input
            {...api.getInputProps()}
            {...field}
            w="full"
            pe="8"
            _placeholder={{ color: "text.muted" }}
          />
          <styled.button
            {...api.getTriggerProps()}
            position="absolute"
            insetEnd="2"
            color="text.muted"
            fontSize="11px"
            px="1"
            aria-label="Show frameworks"
          >
            ▾
          </styled.button>
        </HStack>
      </Box>
      <Portal>
        <div {...api.getPositionerProps()}>
          <styled.div {...api.getContentProps()} {...popover}>
            <styled.ul {...api.getListProps()}>
              {items.map((item) => (
                <styled.li
                  key={item.value}
                  {...api.getItemProps({ item })}
                  {...option}
                >
                  {item.label}
                  <styled.span
                    {...api.getItemIndicatorProps({ item })}
                    color={accent}
                    fontSize="12px"
                  >
                    ✓
                  </styled.span>
                </styled.li>
              ))}
            </styled.ul>
          </styled.div>
        </div>
      </Portal>
    </Pinned>
  )
}

export function LiveDatePicker() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en-US",
    inline: true,
    selectionMode: "single",
  })
  const api = datePicker.connect(service, normalizeProps)

  return (
    <Pinned
      states={["idle", "focused", "open"]}
      active={service.state.get()}
      rows={[
        ["state", service.state.get()],
        ["value", api.value.map((v) => v.toString())],
      ]}
    >
      <Box {...api.getContentProps()} fontSize="13px">
        <HStack
          {...api.getViewControlProps({ view: "day" })}
          justify="space-between"
          mb="2"
        >
          <styled.button
            {...api.getPreviousTriggerProps()}
            color="text.muted"
            px="2"
            h="7"
            borderRadius="sm"
            _hover={{ bg: "bg.muted" }}
            focusVisibleRing="outside"
          >
            ‹
          </styled.button>
          <styled.span fontWeight="medium" color="text.bold">
            {api.visibleRangeText.start}
          </styled.span>
          <styled.button
            {...api.getNextTriggerProps()}
            color="text.muted"
            px="2"
            h="7"
            borderRadius="sm"
            _hover={{ bg: "bg.muted" }}
            focusVisibleRing="outside"
          >
            ›
          </styled.button>
        </HStack>
        <styled.table
          {...api.getTableProps({ view: "day" })}
          borderCollapse="collapse"
        >
          <thead {...api.getTableHeaderProps({ view: "day" })}>
            <tr {...api.getTableRowProps({ view: "day" })}>
              {api.weekDays.map((day, i) => (
                <styled.th
                  key={i}
                  scope="col"
                  aria-label={day.long}
                  fontWeight="normal"
                  fontSize="11px"
                  color="text.muted"
                  h="7"
                  fontFamily="mono"
                >
                  {day.narrow}
                </styled.th>
              ))}
            </tr>
          </thead>
          <tbody {...api.getTableBodyProps({ view: "day" })}>
            {api.weeks.map((week, i) => (
              <tr key={i} {...api.getTableRowProps({ view: "day" })}>
                {week.map((value, j) => (
                  <td key={j} {...api.getDayTableCellProps({ value })}>
                    <styled.div
                      {...api.getDayTableCellTriggerProps({ value })}
                      w="8"
                      h="26px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="sm"
                      color="text.bold"
                      cursor="default"
                      outline="0"
                      _hover={{ bg: "bg.muted" }}
                      _focusVisible={{
                        boxShadow: "inset 0 0 0 1px var(--colors-text-bold)",
                      }}
                      css={{
                        "&[data-outside-range]": {
                          color: "text.muted",
                          opacity: 0.5,
                        },
                        "&[data-today]": {
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        },
                        "&[data-selected]": {
                          bg: accent,
                          color: { base: "white", _dark: "gray.900" },
                        },
                      }}
                    >
                      {value.day}
                    </styled.div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </styled.table>
      </Box>
    </Pinned>
  )
}

export function LiveSlider() {
  const service = useMachine(slider.machine, {
    id: useId(),
    defaultValue: [42],
    thumbAlignment: "center",
    thumbSize: { width: 18, height: 18 },
  })
  const api = slider.connect(service, normalizeProps)

  return (
    <Pinned
      states={["idle", "focus", "dragging"]}
      active={service.state.get()}
      rows={[
        ["state", service.state.get()],
        ["value", api.value],
      ]}
    >
      <Box {...api.getRootProps()} w="260px">
        <HStack justify="space-between" mb="2" fontSize="13px">
          <styled.label {...api.getLabelProps()} color="text.muted">
            Volume
          </styled.label>
          <styled.output
            {...api.getValueTextProps()}
            fontFamily="mono"
            color="text.bold"
          >
            {api.value[0]}
          </styled.output>
        </HStack>
        <Box
          {...api.getControlProps()}
          display="flex"
          alignItems="center"
          py="2.5"
        >
          <Box
            {...api.getTrackProps()}
            flex="1"
            h="2px"
            bg="border.bold"
            borderRadius="full"
          >
            <Box
              {...api.getRangeProps()}
              h="full"
              bg="text.bold"
              borderRadius="full"
              transition="width 320ms ease"
            />
          </Box>
          {api.value.map((_, index) => (
            <Box
              key={index}
              {...api.getThumbProps({ index })}
              w="18px"
              h="18px"
              borderRadius="full"
              bg="bg"
              borderWidth="1px"
              borderColor="text.bold"
              outline="0"
              transition="inset-inline-start 320ms ease"
              _focusVisible={{
                boxShadow: "0 0 0 3px var(--colors-border-bold)",
              }}
              css={{ "&[data-dragging]": { transition: "none" } }}
            >
              <input {...api.getHiddenInputProps({ index })} />
            </Box>
          ))}
        </Box>
      </Box>
    </Pinned>
  )
}

export const tabItems = [
  { value: "account", label: "Account", body: "Name, avatar and email." },
  {
    value: "password",
    label: "Password",
    body: "Change it, or turn on passkeys.",
  },
  { value: "billing", label: "Billing", body: "Plan, invoices and seats." },
]

export function LiveTabs() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "account",
  })
  const api = tabs.connect(service, normalizeProps)

  return (
    <Pinned
      states={["idle", "focused"]}
      active={service.state.get()}
      rows={[
        ["state", service.state.get()],
        ["value", api.value],
      ]}
    >
      <Box {...api.getRootProps()} w="280px">
        <HStack
          {...api.getListProps()}
          gap="0"
          borderBottomWidth="1px"
          borderColor="border"
        >
          {tabItems.map((t) => (
            <styled.button
              key={t.value}
              {...api.getTriggerProps({ value: t.value })}
              px="3"
              py="2"
              mb="-1px"
              fontSize="14px"
              color="text.muted"
              borderBottomWidth="1px"
              borderColor="transparent"
              transition="color 160ms, border-color 160ms"
              focusVisibleRing="inside"
              _selected={{ color: "text.bold", borderColor: accent }}
            >
              {t.label}
            </styled.button>
          ))}
        </HStack>
        {tabItems.map((t) => (
          <styled.div
            key={t.value}
            {...api.getContentProps({ value: t.value })}
            pt="3"
            fontSize="14px"
            color="text.muted"
            minH="12"
          >
            {t.body}
          </styled.div>
        ))}
      </Box>
    </Pinned>
  )
}
