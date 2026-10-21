"use client"

import * as checkbox from "@zag-js/checkbox"
import * as datePicker from "@zag-js/date-picker"
import * as numberInput from "@zag-js/number-input"
import * as ratingGroup from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as zagSwitch from "@zag-js/switch"
import * as tabs from "@zag-js/tabs"
import { useId } from "react"
import { css } from "styled-system/css"
import { Box, HStack, styled } from "styled-system/jsx"
import { accent } from "./tokens"

const ring = {
  outline: "2px solid",
  outlineColor: accent,
  outlineOffset: "2px",
} as const

const label = css({ fontSize: "14px", color: "text.bold" })

export function MiniSwitch() {
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
        w="9"
        h="5"
        p="0.5"
        borderRadius="full"
        bg="border.bold"
        transition="background 150ms"
        _checked={{ bg: accent }}
        _focusVisible={ring}
      >
        <styled.span
          {...api.getThumbProps()}
          w="4"
          h="4"
          borderRadius="full"
          bg="white"
          transition="transform 150ms"
          _checked={{ transform: "translateX(16px)" }}
        />
      </styled.span>
      <span className={label} {...api.getLabelProps()}>
        Notifications
      </span>
    </styled.label>
  )
}

export function MiniCheckbox() {
  const service = useMachine(checkbox.machine, { id: useId() })
  const api = checkbox.connect(service, normalizeProps)
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
        justifyContent="center"
        w="4.5"
        h="4.5"
        borderWidth="1px"
        borderColor="border.bold"
        borderRadius="sm"
        color="white"
        transition="background 120ms"
        _checked={{ bg: accent, borderColor: accent }}
        _focusVisible={ring}
      >
        <styled.span {...api.getIndicatorProps()} display="inline-flex">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M2.5 6.5l2.5 2.5 4.5-5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </styled.span>
      </styled.span>
      <span className={label} {...api.getLabelProps()}>
        Accept terms
      </span>
    </styled.label>
  )
}

export function MiniSlider() {
  const service = useMachine(slider.machine, {
    id: useId(),
    defaultValue: [40],
  })
  const api = slider.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()} w="full" maxW="220px">
      <HStack justify="space-between" mb="3">
        <span className={label} {...api.getLabelProps()}>
          Volume
        </span>
        <styled.output
          {...api.getValueTextProps()}
          fontFamily="mono"
          fontSize="12px"
          color="text.muted"
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
          h="1"
          borderRadius="full"
          bg="border"
        >
          <Box
            {...api.getRangeProps()}
            h="full"
            borderRadius="full"
            bg={accent}
          />
        </Box>
        <Box
          {...api.getThumbProps({ index: 0 })}
          w="4"
          h="4"
          borderRadius="full"
          bg="bg"
          borderWidth="2px"
          borderColor="text.bold"
          cursor="grab"
          _focusVisible={ring}
        >
          <input {...api.getHiddenInputProps({ index: 0 })} />
        </Box>
      </Box>
    </Box>
  )
}

const tabItems = [
  { value: "account", label: "Account", body: "Name and email" },
  { value: "billing", label: "Billing", body: "Plan and invoices" },
  { value: "team", label: "Team", body: "Members and roles" },
]

export function MiniTabs() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "account",
  })
  const api = tabs.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()} w="full" maxW="240px">
      <HStack
        {...api.getListProps()}
        gap="4"
        boxShadow="inset 0 -1px 0 token(colors.border)"
      >
        {tabItems.map((t) => (
          <styled.button
            key={t.value}
            {...api.getTriggerProps({ value: t.value })}
            position="relative"
            py="2"
            fontSize="14px"
            color="text.muted"
            cursor="pointer"
            _hover={{ color: "text.bold" }}
            _selected={{
              color: "text.bold",
              _after: {
                content: '""',
                position: "absolute",
                insetX: "0",
                bottom: "0",
                h: "1px",
                bg: accent,
              },
            }}
            _focusVisible={ring}
          >
            {t.label}
          </styled.button>
        ))}
      </HStack>
      {tabItems.map((t) => (
        <styled.p
          key={t.value}
          {...api.getContentProps({ value: t.value })}
          pt="3"
          fontSize="13px"
          color="text.muted"
          _focusVisible={ring}
        >
          {t.body}
        </styled.p>
      ))}
    </Box>
  )
}

const stepBtn = css({
  w: "9",
  h: "9",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  color: "text.bold",
  cursor: "pointer",
  _hover: { bg: "bg.muted" },
  _disabled: { opacity: 0.4, cursor: "not-allowed" },
  _focusVisible: { ...ring, outlineOffset: "-2px" },
})

export function MiniNumberInput() {
  const service = useMachine(numberInput.machine, {
    id: useId(),
    defaultValue: "4",
    min: 0,
    max: 10,
  })
  const api = numberInput.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()}>
      <styled.label
        {...api.getLabelProps()}
        className={label}
        display="block"
        mb="2"
      >
        Seats
      </styled.label>
      <HStack
        {...api.getControlProps()}
        gap="0"
        borderWidth="1px"
        borderColor="border.bold"
        borderRadius="md"
        overflow="hidden"
      >
        <button className={stepBtn} {...api.getDecrementTriggerProps()}>
          −
        </button>
        <styled.input
          {...api.getInputProps()}
          w="12"
          h="9"
          textAlign="center"
          fontFamily="mono"
          fontSize="14px"
          color="text.bold"
          bg="transparent"
          borderXWidth="1px"
          borderColor="border"
          outline="none"
          _focusVisible={{ bg: "bg.muted" }}
        />
        <button className={stepBtn} {...api.getIncrementTriggerProps()}>
          +
        </button>
      </HStack>
    </Box>
  )
}

const navBtn = css({
  w: "7",
  h: "7",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "sm",
  color: "text.muted",
  cursor: "pointer",
  _hover: { bg: "bg.muted", color: "text.bold" },
  _focusVisible: ring,
})

export function MiniDatePicker() {
  const service = useMachine(datePicker.machine, {
    id: useId(),
    inline: true,
    locale: "en-US",
  })
  const api = datePicker.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()}>
      <Box {...api.getContentProps()} outline="none">
        <HStack justify="space-between" mb="2">
          <button className={navBtn} {...api.getPreviousTriggerProps()}>
            ‹
          </button>
          <styled.span fontSize="13px" fontWeight="medium" color="text.bold">
            {api.visibleRangeText.start}
          </styled.span>
          <button className={navBtn} {...api.getNextTriggerProps()}>
            ›
          </button>
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
                  fontFamily="mono"
                  fontSize="11px"
                  fontWeight="normal"
                  color="text.muted"
                  pb="1"
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
                      h="7"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="12px"
                      fontVariantNumeric="tabular-nums"
                      color="text"
                      borderRadius="sm"
                      cursor="pointer"
                      css={{
                        "&[data-outside-range]": {
                          color: "text.muted",
                          opacity: 0.5,
                        },
                        "&:hover": { bg: "bg.muted" },
                        "&[data-selected]": { bg: accent, color: "white" },
                        "&:focus-visible": ring,
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
    </Box>
  )
}

export function MiniRating() {
  const service = useMachine(ratingGroup.machine, {
    id: useId(),
    count: 5,
    defaultValue: 3,
  })
  const api = ratingGroup.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()}>
      <styled.label
        {...api.getLabelProps()}
        className={label}
        display="block"
        mb="2"
      >
        Rating
      </styled.label>
      <HStack {...api.getControlProps()} gap="1">
        {api.items.map((index) => {
          const state = api.getItemState({ index })
          return (
            <styled.span
              key={index}
              {...api.getItemProps({ index })}
              display="inline-flex"
              color={state.highlighted ? accent : "border.bold"}
              cursor="pointer"
              borderRadius="sm"
              _focusVisible={ring}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"
                  fill="currentColor"
                />
              </svg>
            </styled.span>
          )
        })}
      </HStack>
      <input {...api.getHiddenInputProps()} />
    </Box>
  )
}
