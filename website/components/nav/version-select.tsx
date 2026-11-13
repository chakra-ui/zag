import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import packageJson from "@zag-js/react/package.json"
import Link from "next/link"
import { HiCheck, HiChevronDown } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, styled } from "styled-system/jsx"

export const VersionSelect = () => {
  const service = useMachine(menu.machine, {
    id: "version-selector",
    positioning: {
      strategy: "fixed",
      placement: "bottom-start",
      gutter: 6,
    },
  })

  const api = menu.connect(service, normalizeProps)
  const current = items[0]

  return (
    <>
      <styled.button
        display={{ base: "none", sm: "inline-flex" }}
        alignItems="center"
        gap="1"
        h="6"
        ps="2.5"
        pe="2"
        rounded="full"
        fontSize="13px"
        fontWeight="medium"
        lineHeight="1"
        cursor="pointer"
        bg="ink/6"
        color="ink"
        transition="background 120ms"
        _hover={{ bg: "ink/10" }}
        _open={{ bg: "ink/10" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "border.primary.bold",
          outlineOffset: "2px",
        }}
        aria-label={`Zag.js version ${current.label}, switch version`}
        {...api.getTriggerProps()}
      >
        {current.tag}
        <styled.span
          display="inline-flex"
          color="ink.muted"
          transition="transform 120ms"
          css={{ "[data-state=open] > &": { transform: "rotate(180deg)" } }}
          aria-hidden
        >
          <HiChevronDown size={12} />
        </styled.span>
      </styled.button>

      {api.open && (
        <Portal>
          <div
            className={css({ zIndex: "1000" })}
            {...api.getPositionerProps()}
          >
            <Box
              width="220px"
              fontSize="14px"
              bg="bg.popover"
              isolation="isolate"
              rounded="12px"
              p="1.5"
              boxShadow={{
                base: "0 0 0 1px rgb(0 0 0 / 0.08), 0 1px 1px rgb(0 0 0 / 0.02), 0 4px 8px -4px rgb(0 0 0 / 0.04), 0 16px 24px -8px rgb(0 0 0 / 0.06)",
                _dark:
                  "0 0 0 1px rgb(255 255 255 / 0.1), 0 16px 32px -8px rgb(0 0 0 / 0.6)",
              }}
              outline="0"
              {...api.getContentProps()}
            >
              {items.map((item) => (
                <Link
                  key={item.value}
                  href={item.value}
                  aria-current={item === current ? "true" : undefined}
                  {...api.getItemProps({ value: item.value })}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "2",
                    h: "9",
                    px: "2",
                    rounded: "6px",
                    cursor: "pointer",
                    color: "text",
                    _highlighted: { bg: "bg.muted", color: "text.bold" },
                  })}
                >
                  <Box fontWeight="medium" color="text.bold">
                    {item.tag}
                  </Box>
                  <Box fontFamily="mono" fontSize="12px" color="text.muted">
                    {item.label}
                  </Box>
                  {item === current && (
                    <Box
                      ms="auto"
                      display="inline-flex"
                      color="text.bold"
                      aria-hidden
                    >
                      <HiCheck size={15} />
                    </Box>
                  )}
                </Link>
              ))}
            </Box>
          </div>
        </Portal>
      )}
    </>
  )
}

const items = [
  {
    label: packageJson.version,
    value: "https://v2.zagjs.com",
    tag: "v2",
  },
  {
    label: "1.x",
    value: "https://zagjs.com",
    tag: "v1",
  },
  {
    label: "0.82.x",
    value: "https://v0.zagjs.com",
    tag: "v0",
  },
]
