"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { styled } from "styled-system/jsx"

const items = [
  { value: "edit", label: "Edit" },
  { value: "duplicate", label: "Duplicate" },
  { value: "archive", label: "Archive" },
]

const Outlined = styled("div", {
  base: {
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: "accent",
  },
})

export function PartsDemo() {
  const service = useMachine(menu.machine, {
    id: useId(),
    open: true,
    closeOnSelect: false,
    defaultHighlightedValue: "duplicate",
    positioning: {
      placement: "bottom-start",
      strategy: "absolute",
      flip: false,
    },
  })
  const api = menu.connect(service, normalizeProps)
  return (
    <styled.div
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      gap="2.5"
      minH="190px"
    >
      <styled.button
        {...api.getTriggerProps()}
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="accent"
        display="inline-flex"
        alignItems="center"
        gap="1.5"
        px="3.5"
        py="2"
        rounded="md"
        bg={{ base: "white", _dark: "bg.control" }}
        fontSize="14px"
        fontWeight="medium"
        color="fg"
      >
        Actions{" "}
        <styled.span color="fg.subtle" fontSize="11px">
          ▾
        </styled.span>
      </styled.button>
      <div {...api.getPositionerProps()}>
        <Outlined
          {...api.getContentProps()}
          display="flex"
          flexDirection="column"
          gap="0.5"
          w="180px"
          p="1.5"
          rounded="lg"
          bg={{ base: "white", _dark: "bg.control" }}
          outline="none"
          shadow={{
            base: "0 10px 24px -8px rgba(0,0,0,.12)",
            _dark: "0 12px 32px -12px rgba(0,0,0,.6)",
          }}
        >
          {items.map((item) => (
            <styled.div
              key={item.value}
              {...api.getItemProps({ value: item.value })}
              px="2.5"
              py="1.5"
              rounded="sm"
              fontSize="14px"
              color="fg"
              borderWidth="1px"
              borderStyle="dashed"
              borderColor="accent.line"
              cursor="default"
              transitionProperty="background, color"
              transitionDuration="fast"
              _highlighted={{ bg: "accent.solid", color: "accent.solidFg" }}
            >
              {item.label}
            </styled.div>
          ))}
        </Outlined>
      </div>
    </styled.div>
  )
}
