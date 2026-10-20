"use client"

import * as checkbox from "@zag-js/checkbox"
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as zagSwitch from "@zag-js/switch"
import * as tabs from "@zag-js/tabs"
import * as toggleGroup from "@zag-js/toggle-group"
import { useId, type ReactNode } from "react"
import { Box, HStack, styled } from "styled-system/jsx"
import { Eyebrow } from "./kit"

function LiveCell(props: {
  label: string
  title: string
  body: string
  state: string
  children: ReactNode
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      p={{ base: "6", md: "8" }}
      gap="6"
    >
      <Box
        minH="180px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
        bg="bg.muted"
        px="6"
        position="relative"
      >
        {props.children}
        <styled.code
          position="absolute"
          left="3"
          bottom="2.5"
          right="3"
          fontFamily="mono"
          fontSize="11px"
          color="text.muted"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {props.state}
        </styled.code>
      </Box>
      <Box>
        <Eyebrow mb="2">{props.label}</Eyebrow>
        <styled.h3 fontSize="17px" fontWeight="semibold" color="text.bold">
          {props.title}
        </styled.h3>
        <styled.p mt="2" color="text.muted" fontSize="15px" lineHeight="1.6">
          {props.body}
        </styled.p>
      </Box>
    </Box>
  )
}

const ring = { focusVisibleRing: "outside" } as const

function SwitchCell() {
  const service = useMachine(zagSwitch.machine, {
    id: useId(),
    defaultChecked: true,
  })
  const api = zagSwitch.connect(service, normalizeProps)
  return (
    <LiveCell
      label="@zag-js/switch"
      title="Switch"
      body="A toggle with a hidden native input, so forms just work."
      state={`checked: ${api.checked}`}
    >
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
          w="10"
          h="6"
          p="0.5"
          borderRadius="full"
          bg="border.bold"
          transition="background 150ms"
          _checked={{ bg: "text.bold" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "text.bold",
            outlineOffset: "2px",
          }}
        >
          <styled.span
            {...api.getThumbProps()}
            w="5"
            h="5"
            borderRadius="full"
            bg="bg"
            transition="transform 150ms"
            _checked={{ transform: "translateX(16px)" }}
          />
        </styled.span>
        <styled.span {...api.getLabelProps()} fontSize="14px" color="text.bold">
          Sync settings
        </styled.span>
      </styled.label>
    </LiveCell>
  )
}

function SliderCell() {
  const service = useMachine(slider.machine, {
    id: useId(),
    defaultValue: [40],
    thumbAlignment: "center",
    thumbSize: { width: 18, height: 18 },
  })
  const api = slider.connect(service, normalizeProps)
  return (
    <LiveCell
      label="@zag-js/slider"
      title="Slider"
      body="Pointer, keyboard and RTL handled. Home, End and PageUp included."
      state={`value: [${api.value.join(", ")}]`}
    >
      <Box {...api.getRootProps()} w="full" maxW="56">
        <HStack justify="space-between" mb="2" fontSize="13px">
          <styled.label {...api.getLabelProps()} color="text.muted">
            Volume
          </styled.label>
          <styled.output
            {...api.getValueTextProps()}
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
          py="2"
        >
          <Box
            {...api.getTrackProps()}
            flex="1"
            h="1"
            borderRadius="full"
            bg="border.bold"
          >
            <Box
              {...api.getRangeProps()}
              h="full"
              borderRadius="inherit"
              bg="text.bold"
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
              _focusVisible={{
                outline: "2px solid",
                outlineColor: "text.bold",
                outlineOffset: "2px",
              }}
            >
              <input {...api.getHiddenInputProps({ index })} />
            </Box>
          ))}
        </Box>
      </Box>
    </LiveCell>
  )
}

const tabItems = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
]

function TabsCell() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "react",
  })
  const api = tabs.connect(service, normalizeProps)
  return (
    <LiveCell
      label="@zag-js/tabs"
      title="Tabs"
      body="Roving focus with arrow keys, automatic or manual activation."
      state={`value: "${api.value}"`}
    >
      <Box {...api.getRootProps()} w="full" maxW="60">
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
              fontSize="13px"
              color="text.muted"
              borderBottomWidth="1px"
              borderColor="transparent"
              _selected={{ color: "text.bold", borderColor: "text.bold" }}
              {...ring}
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
            fontFamily="mono"
            fontSize="12px"
            color="text.muted"
          >
            @zag-js/{t.value}
          </styled.p>
        ))}
      </Box>
    </LiveCell>
  )
}

function CheckboxCell() {
  const service = useMachine(checkbox.machine, {
    id: useId(),
    defaultChecked: "indeterminate",
  })
  const api = checkbox.connect(service, normalizeProps)
  return (
    <LiveCell
      label="@zag-js/checkbox"
      title="Checkbox"
      body="Checked, unchecked and indeterminate, with the right aria-checked."
      state={`checked: ${JSON.stringify(api.checkedState)}`}
    >
      <styled.label
        {...api.getRootProps()}
        display="inline-flex"
        alignItems="center"
        gap="3"
        cursor="pointer"
      >
        <styled.div
          {...api.getControlProps()}
          w="5"
          h="5"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="sm"
          borderWidth="1px"
          borderColor="border.bold"
          bg="bg"
          color="bg"
          _checked={{ bg: "text.bold", borderColor: "text.bold" }}
          _indeterminate={{ bg: "text.bold", borderColor: "text.bold" }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: "text.bold",
            outlineOffset: "2px",
          }}
        >
          {api.checkedState === true && (
            <svg
              viewBox="0 0 16 16"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 8.5l3 3 7-7" />
            </svg>
          )}
          {api.checkedState === "indeterminate" && (
            <svg
              viewBox="0 0 16 16"
              width="12"
              height="12"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3.5 8h9" />
            </svg>
          )}
        </styled.div>
        <styled.span {...api.getLabelProps()} fontSize="14px" color="text.bold">
          Select all rows
        </styled.span>
        <input {...api.getHiddenInputProps()} />
      </styled.label>
    </LiveCell>
  )
}

const stepper = {
  w: "8",
  h: "8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "text.muted",
  _hover: { color: "text.bold", bg: "bg.muted" },
  _disabled: { opacity: 0.4, cursor: "not-allowed" },
  focusVisibleRing: "inside",
} as const

function NumberInputCell() {
  const service = useMachine(numberInput.machine, {
    id: useId(),
    defaultValue: "4",
    min: 0,
    max: 10,
  })
  const api = numberInput.connect(service, normalizeProps)
  return (
    <LiveCell
      label="@zag-js/number-input"
      title="Number input"
      body="Clamping, stepping, locale formatting and scrub-to-change."
      state={`value: "${api.value}" · valueAsNumber: ${api.valueAsNumber}`}
    >
      <Box {...api.getRootProps()}>
        <styled.label
          {...api.getLabelProps()}
          display="block"
          mb="2"
          fontSize="13px"
          color="text.muted"
        >
          Seats
        </styled.label>
        <HStack
          {...api.getControlProps()}
          gap="0"
          borderWidth="1px"
          borderColor="border.bold"
          borderRadius="md"
          bg="bg"
          overflow="hidden"
        >
          <styled.button {...api.getDecrementTriggerProps()} {...stepper}>
            −
          </styled.button>
          <styled.input
            {...api.getInputProps()}
            w="12"
            h="8"
            textAlign="center"
            fontSize="14px"
            color="text.bold"
            bg="transparent"
            borderXWidth="1px"
            borderColor="border"
            fontVariantNumeric="tabular-nums"
            outline="none"
            _focusVisible={{ bg: "bg.muted" }}
          />
          <styled.button {...api.getIncrementTriggerProps()} {...stepper}>
            +
          </styled.button>
        </HStack>
      </Box>
    </LiveCell>
  )
}

const marks = [
  { value: "bold", label: "B", style: { fontWeight: "bold" } },
  { value: "italic", label: "I", style: { fontStyle: "italic" } },
  { value: "underline", label: "U", style: { textDecoration: "underline" } },
]

function ToggleGroupCell() {
  const service = useMachine(toggleGroup.machine, {
    id: useId(),
    multiple: true,
    defaultValue: ["bold"],
  })
  const api = toggleGroup.connect(service, normalizeProps)
  return (
    <LiveCell
      label="@zag-js/toggle-group"
      title="Toggle group"
      body="Single or multiple selection with roving tabindex."
      state={`value: ${JSON.stringify(api.value)}`}
    >
      <HStack
        {...api.getRootProps()}
        gap="0"
        borderWidth="1px"
        borderColor="border.bold"
        borderRadius="md"
        bg="bg"
        overflow="hidden"
      >
        {marks.map((m) => (
          <styled.button
            key={m.value}
            {...api.getItemProps({ value: m.value })}
            aria-label={m.value}
            w="10"
            h="9"
            fontSize="15px"
            color="text.muted"
            borderRightWidth="1px"
            borderColor="border"
            _last={{ borderRightWidth: "0" }}
            _hover={{ color: "text.bold" }}
            css={{ "&[data-state=on]": { bg: "text.bold", color: "bg" } }}
            focusVisibleRing="inside"
            style={m.style}
          >
            {m.label}
          </styled.button>
        ))}
      </HStack>
    </LiveCell>
  )
}

export function LiveCards() {
  return (
    <>
      <SwitchCell />
      <SliderCell />
      <TabsCell />
      <CheckboxCell />
      <NumberInputCell />
      <ToggleGroupCell />
    </>
  )
}
