"use client"

import * as combobox from "@zag-js/combobox"
import * as datePicker from "@zag-js/date-picker"
import * as pinInput from "@zag-js/pin-input"
import * as rating from "@zag-js/rating-group"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as zagSwitch from "@zag-js/switch"
import * as tabs from "@zag-js/tabs"
import * as toast from "@zag-js/toast"
import * as tooltip from "@zag-js/tooltip"
import Link from "next/link"
import { useId, useMemo, useState, type ReactNode } from "react"
import { css } from "styled-system/css"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { Eyebrow } from "./kit"

const field = css({
  h: "9",
  px: "3",
  fontSize: "14px",
  color: "text.bold",
  bg: "bg",
  borderWidth: "1px",
  borderColor: "border.bold",
  borderRadius: "md",
  outline: "none",
  _focusVisible: { borderColor: "text.muted" },
  _placeholder: { color: "text.muted" },
})

const ghostBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  h: "9",
  px: "3.5",
  fontSize: "13px",
  fontWeight: "medium",
  color: "text.bold",
  borderWidth: "1px",
  borderColor: "border.bold",
  borderRadius: "md",
  bg: "bg",
  cursor: "pointer",
  _hover: { bg: "bg.muted" },
  focusVisibleRing: "outside",
})

const iconBtn = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "7",
  h: "7",
  borderRadius: "md",
  color: "text.muted",
  cursor: "pointer",
  _hover: { bg: "bg.muted", color: "text.bold" },
  focusVisibleRing: "outside",
})

const popover = css({
  "--zc-accent": "#2f855a",
  _dark: { "--zc-accent": "#48bb78" },
  bg: "bg.popover",
  borderWidth: "1px",
  borderColor: "border.bold",
  borderRadius: "md",
  boxShadow: "0 8px 24px -8px rgba(0,0,0,.35)",
  zIndex: "50",
})

function Chevron(props: { dir: "left" | "right" | "down" }) {
  const d = {
    left: "M10 4L6 8l4 4",
    right: "M6 4l4 4-4 4",
    down: "M4 6l4 4 4-4",
  }[props.dir]
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Calendar() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    locale: "en-US",
    inline: true,
    defaultValue: [datePicker.parse("2026-10-14")],
    defaultFocusedValue: datePicker.parse("2026-10-14"),
  })
  const api = datePicker.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()} w="252px">
      <Box {...api.getContentProps()} outline="none">
        <HStack
          {...api.getViewControlProps({ view: "day" })}
          justify="space-between"
          mb="3"
        >
          <button className={iconBtn} {...api.getPreviousTriggerProps()}>
            <Chevron dir="left" />
          </button>
          <styled.span fontSize="13px" fontWeight="medium" color="text.bold">
            {api.visibleRangeText.start}
          </styled.span>
          <button className={iconBtn} {...api.getNextTriggerProps()}>
            <Chevron dir="right" />
          </button>
        </HStack>
        <styled.table
          {...api.getTableProps({ view: "day" })}
          w="full"
          borderCollapse="collapse"
        >
          <thead {...api.getTableHeaderProps({ view: "day" })}>
            <tr {...api.getTableRowProps({ view: "day" })}>
              {api.weekDays.map((day, i) => (
                <styled.th
                  key={i}
                  scope="col"
                  aria-label={day.long}
                  fontFamily="mono"
                  fontSize="10px"
                  fontWeight="normal"
                  color="text.muted"
                  pb="2"
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
                  <styled.td
                    key={j}
                    {...api.getDayTableCellProps({ value })}
                    p="0.5px"
                  >
                    <styled.div
                      {...api.getDayTableCellTriggerProps({ value })}
                      h="8"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="md"
                      fontSize="13px"
                      fontVariantNumeric="tabular-nums"
                      color="text.subtle"
                      cursor="pointer"
                      outline="none"
                      _hover={{ bg: "bg.muted", color: "text.bold" }}
                      _focusVisible={{
                        boxShadow: "inset 0 0 0 1px currentColor",
                      }}
                      css={{
                        "&[data-outside-range]": {
                          color: "text.muted",
                          opacity: 0.4,
                        },
                        "&[data-today]": {
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        },
                        "&[data-selected]": {
                          bg: "var(--zc-accent)",
                          color: "text.inverse",
                          fontWeight: "semibold",
                        },
                        "&[data-disabled]": { opacity: 0.3, cursor: "default" },
                      }}
                    >
                      {value.day}
                    </styled.div>
                  </styled.td>
                ))}
              </tr>
            ))}
          </tbody>
        </styled.table>
      </Box>
    </Box>
  )
}

const frameworkItems = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
  { label: "Svelte", value: "svelte" },
  { label: "Preact", value: "preact" },
  { label: "Lit", value: "lit" },
  { label: "Vanilla JS", value: "vanilla" },
]

function Combo() {
  const [items, setItems] = useState(frameworkItems)
  const collection = useMemo(() => combobox.collection({ items }), [items])
  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    placeholder: "Search frameworks",
    openOnClick: true,
    onInputValueChange({ inputValue }) {
      const q = inputValue.toLowerCase()
      const next = frameworkItems.filter((i) =>
        i.label.toLowerCase().includes(q),
      )
      setItems(next.length ? next : frameworkItems)
    },
  })
  const api = combobox.connect(service, normalizeProps)
  return (
    <Stack {...api.getRootProps()} gap="2" w="full" maxW="280px">
      <styled.label {...api.getLabelProps()} fontSize="13px" color="text.muted">
        Framework
      </styled.label>
      <HStack {...api.getControlProps()} gap="0" position="relative">
        <input
          className={field}
          {...api.getInputProps()}
          style={{ width: "100%", paddingRight: 36 }}
        />
        <styled.button
          {...api.getTriggerProps()}
          position="absolute"
          right="1"
          className={iconBtn}
        >
          <Chevron dir="down" />
        </styled.button>
      </HStack>
      <Portal>
        <div {...api.getPositionerProps()}>
          <styled.ul
            {...api.getContentProps()}
            className={popover}
            p="1"
            outline="none"
            maxH="220px"
            overflow="auto"
          >
            {items.map((item) => (
              <styled.li
                key={item.value}
                {...api.getItemProps({ item })}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px="2.5"
                py="1.5"
                fontSize="14px"
                color="text.subtle"
                borderRadius="sm"
                cursor="pointer"
                _highlighted={{ bg: "bg.muted", color: "text.bold" }}
              >
                {item.label}
                {api.getItemState({ item }).selected && (
                  <styled.span color="var(--zc-accent)" fontSize="12px">
                    ✓
                  </styled.span>
                )}
              </styled.li>
            ))}
          </styled.ul>
        </div>
      </Portal>
    </Stack>
  )
}

function RangeSlider() {
  const service = useMachine(slider.machine, {
    id: useId(),
    defaultValue: [64],
    thumbAlignment: "center",
    thumbSize: { width: 18, height: 18 },
  })
  const api = slider.connect(service, normalizeProps)
  return (
    <Stack {...api.getRootProps()} gap="4" w="full" maxW="220px">
      <HStack justify="space-between">
        <styled.label
          {...api.getLabelProps()}
          fontSize="13px"
          color="text.muted"
        >
          Volume
        </styled.label>
        <styled.output
          {...api.getValueTextProps()}
          fontFamily="mono"
          fontSize="12px"
          color="text.bold"
          fontVariantNumeric="tabular-nums"
        >
          {api.value[0]}
        </styled.output>
      </HStack>
      <Box
        {...api.getControlProps()}
        position="relative"
        display="flex"
        alignItems="center"
        h="5"
      >
        <Box
          {...api.getTrackProps()}
          flex="1"
          h="4px"
          bg="bg.muted"
          borderRadius="full"
          borderWidth="0"
        >
          <Box
            {...api.getRangeProps()}
            h="full"
            bg="text.bold"
            borderRadius="full"
          />
        </Box>
        {api.value.map((_, index) => (
          <Box
            key={index}
            {...api.getThumbProps({ index })}
            w="18px"
            h="18px"
            bg="bg"
            borderWidth="1px"
            borderColor="text.bold"
            borderRadius="full"
            boxShadow="0 1px 3px rgba(0,0,0,.3)"
            outline="none"
            _focusVisible={{ boxShadow: "0 0 0 3px token(colors.border.bold)" }}
          >
            <input {...api.getHiddenInputProps({ index })} />
          </Box>
        ))}
      </Box>
    </Stack>
  )
}

function Toggle() {
  const service = useMachine(zagSwitch.machine, {
    id: useId(),
    defaultChecked: true,
  })
  const api = zagSwitch.connect(service, normalizeProps)
  return (
    <styled.label
      {...api.getRootProps()}
      display="inline-flex"
      alignItems="center"
      gap="3"
      cursor="pointer"
    >
      <input {...api.getHiddenInputProps()} />
      <styled.span
        {...api.getControlProps()}
        display="inline-flex"
        alignItems="center"
        w="40px"
        h="22px"
        p="2px"
        borderRadius="full"
        bg="border.bold"
        transition="background 150ms"
        _checked={{ bg: "var(--zc-accent)" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "text.muted",
          outlineOffset: "2px",
        }}
      >
        <styled.span
          {...api.getThumbProps()}
          w="18px"
          h="18px"
          bg="white"
          borderRadius="full"
          transition="transform 150ms"
          _checked={{ transform: "translateX(18px)" }}
        />
      </styled.span>
      <styled.span {...api.getLabelProps()} fontSize="14px" color="text.bold">
        Airplane mode
      </styled.span>
    </styled.label>
  )
}

function Stars() {
  const service = useMachine(rating.machine, {
    id: useId(),
    defaultValue: 4,
    allowHalf: false,
  })
  const api = rating.connect(service, normalizeProps)
  return (
    <Stack {...api.getRootProps()} gap="3" align="center">
      <styled.label {...api.getLabelProps()} fontSize="13px" color="text.muted">
        Rate this library
      </styled.label>
      <HStack {...api.getControlProps()} gap="1">
        {api.items.map((index) => {
          const state = api.getItemState({ index })
          return (
            <styled.span
              key={index}
              {...api.getItemProps({ index })}
              color={state.highlighted ? "var(--zc-accent)" : "border.bold"}
              cursor="pointer"
              borderRadius="sm"
              outline="none"
              _focusVisible={{
                boxShadow: "0 0 0 2px token(colors.text.muted)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 273 260" aria-hidden>
                <path
                  d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
                  fill="currentColor"
                />
              </svg>
            </styled.span>
          )
        })}
      </HStack>
      <input {...api.getHiddenInputProps()} />
    </Stack>
  )
}

function Pin() {
  const service = useMachine(pinInput.machine, {
    id: useId(),
    placeholder: "·",
    otp: true,
    type: "numeric",
    count: 4,
  })
  const api = pinInput.connect(service, normalizeProps)
  return (
    <Stack gap="3" align="center">
      <styled.label {...api.getLabelProps()} fontSize="13px" color="text.muted">
        Verification code
      </styled.label>
      <HStack {...api.getRootProps()} gap="2">
        {[0, 1, 2, 3].map((index) => (
          <styled.input
            key={index}
            {...api.getInputProps({ index })}
            className={field}
            w="10"
            h="11"
            px="0"
            textAlign="center"
            fontFamily="mono"
            fontSize="16px"
            css={{ "&[data-complete]": { borderColor: "var(--zc-accent)" } }}
          />
        ))}
      </HStack>
    </Stack>
  )
}

const tabItems = [
  {
    value: "machine",
    label: "machine.ts",
    code: "const service = useMachine(tabs.machine, { id })",
  },
  {
    value: "connect",
    label: "connect.ts",
    code: "const api = tabs.connect(service, normalizeProps)",
  },
  {
    value: "markup",
    label: "markup.tsx",
    code: "<button {...api.getTriggerProps({ value })} />",
  },
]

function CodeTabs() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "machine",
  })
  const api = tabs.connect(service, normalizeProps)
  return (
    <Box
      {...api.getRootProps()}
      w="full"
      maxW="440px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      bg="bg.muted"
    >
      <HStack
        {...api.getListProps()}
        gap="0"
        px="2"
        borderBottomWidth="1px"
        borderColor="border"
      >
        {tabItems.map((t) => (
          <styled.button
            key={t.value}
            {...api.getTriggerProps({ value: t.value })}
            px="3"
            py="2.5"
            mb="-1px"
            fontFamily="mono"
            fontSize="12px"
            color="text.muted"
            borderBottomWidth="1px"
            borderColor="transparent"
            cursor="pointer"
            _hover={{ color: "text.bold" }}
            _selected={{ color: "text.bold", borderColor: "var(--zc-accent)" }}
            focusVisibleRing="inside"
          >
            {t.label}
          </styled.button>
        ))}
      </HStack>
      {tabItems.map((t) => (
        <styled.div
          key={t.value}
          {...api.getContentProps({ value: t.value })}
          px="4"
          py="5"
          focusVisibleRing="inside"
        >
          <styled.code
            fontFamily="mono"
            fontSize="12px"
            color="text.subtle"
            whiteSpace="nowrap"
          >
            {t.code}
          </styled.code>
        </styled.div>
      ))}
    </Box>
  )
}

function Tip() {
  const service = useMachine(tooltip.machine, {
    id: useId(),
    openDelay: 150,
    closeDelay: 100,
  })
  const api = tooltip.connect(service, normalizeProps)
  return (
    <>
      <button className={ghostBtn} {...api.getTriggerProps()}>
        Hover or focus me
      </button>
      <Portal>
        {api.open && (
          <div {...api.getPositionerProps()}>
            <styled.div
              {...api.getContentProps()}
              className={popover}
              px="2.5"
              py="1.5"
              fontSize="12px"
              color="text.bold"
            >
              Positioned with floating-ui
            </styled.div>
          </div>
        )}
      </Portal>
    </>
  )
}

const toaster = toast.createStore({
  placement: "bottom-end",
  overlap: true,
  gap: 12,
  offsets: "24px",
})

function ToastItem(props: {
  actor: toast.Options<ReactNode>
  index: number
  parent: toast.GroupService
}) {
  const service = useMachine(toast.machine, {
    ...props.actor,
    index: props.index,
    parent: props.parent,
  })
  const api = toast.connect(service, normalizeProps)
  return (
    <styled.div
      {...api.getRootProps()}
      className={popover}
      w="320px"
      p="4"
      pr="10"
      css={{
        translate: "var(--x) var(--y)",
        scale: "var(--scale)",
        opacity: "var(--opacity)",
        zIndex: "var(--z-index)",
        height: "var(--height)",
        transition: "translate 300ms, scale 300ms, opacity 300ms, height 300ms",
        willChange: "translate, opacity, scale",
      }}
    >
      <span {...api.getGhostBeforeProps()} />
      <HStack gap="2">
        <Box
          w="6px"
          h="6px"
          borderRadius="full"
          bg="var(--zc-accent)"
          flexShrink="0"
        />
        <styled.p
          {...api.getTitleProps()}
          fontSize="14px"
          fontWeight="medium"
          color="text.bold"
        >
          {api.title}
        </styled.p>
      </HStack>
      <styled.p
        {...api.getDescriptionProps()}
        mt="1"
        fontSize="13px"
        color="text.muted"
      >
        {api.description}
      </styled.p>
      <styled.button
        {...api.getCloseTriggerProps()}
        className={iconBtn}
        position="absolute"
        top="2"
        right="2"
        aria-label="Dismiss"
      >
        ×
      </styled.button>
      <span {...api.getGhostAfterProps()} />
    </styled.div>
  )
}

function Toaster() {
  const service = useMachine(toast.group.machine, {
    id: useId(),
    store: toaster,
  })
  const api = toast.group.connect(service, normalizeProps)
  return (
    <>
      <button
        className={ghostBtn}
        onClick={() =>
          toaster.create({
            title: "Changes saved",
            description: "Stacked, swipeable, paused on hover.",
            type: "success",
          })
        }
      >
        Show toast
      </button>
      <Portal>
        <div {...api.getGroupProps()}>
          {api.getToasts().map((t, index) => (
            <ToastItem key={t.id} actor={t} index={index} parent={service} />
          ))}
        </div>
      </Portal>
    </>
  )
}

function Tile(props: {
  name: string
  slug: string
  children: ReactNode
  minH?: string
}) {
  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      h="full"
      minH={props.minH ?? "240px"}
      p="5"
    >
      <HStack justify="space-between">
        <Eyebrow>{props.name}</Eyebrow>
        <Link
          href={`/components/react/${props.slug}`}
          className={css({
            fontFamily: "mono",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.muted",
            _hover: { color: "text.bold" },
            focusVisibleRing: "outside",
          })}
          aria-label={`${props.name} docs`}
        >
          → docs
        </Link>
      </HStack>
      <Box
        flex="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        py="6"
      >
        {props.children}
      </Box>
    </Box>
  )
}

const cellsGrid = css({
  gap: "1px",
  bg: "border",
  borderTopWidth: "1px",
  borderColor: "border",
  gridAutoFlow: "dense",
  "--zc-accent": "#2f855a",
  _dark: { "--zc-accent": "#48bb78" },
  "& > *": { bg: "bg" },
})

export function HeroCatalog() {
  return (
    <Grid className={cellsGrid} gap="1px" columns={{ base: 1, md: 2, xl: 4 }}>
      <Box gridRow={{ base: "auto", md: "span 2" }}>
        <Tile name="Date Picker" slug="date-picker" minH="481px">
          <Calendar />
        </Tile>
      </Box>
      <Box gridColumn={{ base: "auto", md: "span 2" }}>
        <Tile name="Combobox" slug="combobox">
          <Combo />
        </Tile>
      </Box>
      <Tile name="Switch" slug="switch">
        <Toggle />
      </Tile>
      <Tile name="Slider" slug="slider">
        <RangeSlider />
      </Tile>
      <Tile name="Rating Group" slug="rating-group">
        <Stars />
      </Tile>
      <Tile name="Pin Input" slug="pin-input">
        <Pin />
      </Tile>
      <Box gridColumn={{ base: "auto", md: "span 2" }}>
        <Tile name="Tabs" slug="tabs">
          <CodeTabs />
        </Tile>
      </Box>
      <Tile name="Tooltip" slug="tooltip">
        <Tip />
      </Tile>
      <Tile name="Toast" slug="toast">
        <Toaster />
      </Tile>
    </Grid>
  )
}
