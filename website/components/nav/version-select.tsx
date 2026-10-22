import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import packageJson from "@zag-js/react/package.json"
import Link from "next/link"
import { HiChevronDown } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, HStack, styled } from "styled-system/jsx"

const dot = css({
  boxSize: "1.5",
  rounded: "full",
  flexShrink: "0",
  bg: "border.primary.bold",
  boxShadow:
    "0 0 0 3px color-mix(in srgb, var(--colors-border-primary-bold) 22%, transparent)",
})

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
        gap="1.5"
        h="6"
        ps="2"
        pe="1.5"
        borderWidth="1px"
        borderColor="border"
        rounded="full"
        fontFamily="mono"
        fontSize="11px"
        lineHeight="1"
        cursor="pointer"
        bg="transparent"
        color="text.muted"
        transition="color 120ms, border-color 120ms"
        _hover={{ color: "text.bold", borderColor: "border.bold" }}
        _open={{ color: "text.bold", borderColor: "border.bold" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "border.primary.bold",
          outlineOffset: "2px",
        }}
        aria-label={`Zag.js version ${current.label}, switch version`}
        {...api.getTriggerProps()}
      >
        <span className={dot} aria-hidden />
        {current.label}
        <styled.span
          display="inline-flex"
          transition="transform 120ms"
          css={{ "[data-state=open] > &": { transform: "rotate(180deg)" } }}
          aria-hidden
        >
          <HiChevronDown size={12} />
        </styled.span>
      </styled.button>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <Box
              width="208px"
              zIndex="1000"
              fontFamily="mono"
              fontSize="12px"
              bg="bg.popover"
              isolation="isolate"
              borderWidth="1px"
              borderColor="border.bold"
              rounded="md"
              boxShadow="0 16px 40px -16px rgb(0 0 0 / 0.45)"
              overflow="hidden"
              outline="0"
              {...api.getContentProps()}
            >
              <styled.p
                px="3"
                py="2"
                fontSize="10px"
                letterSpacing="0.12em"
                textTransform="uppercase"
                color="text.muted"
                borderBottomWidth="1px"
                borderColor="border"
              >
                Versions
              </styled.p>
              <Box p="1">
                {items.map((item) => (
                  <Link
                    key={item.value}
                    href={item.value}
                    {...api.getItemProps({ value: item.value })}
                    className={css({
                      display: "block",
                      px: "2",
                      py: "1.5",
                      rounded: "sm",
                      cursor: "pointer",
                      color: "text.muted",
                      _highlighted: { bg: "bg.muted", color: "text.bold" },
                    })}
                  >
                    <HStack justify="space-between" gap="3">
                      <HStack gap="2">
                        <Box
                          boxSize="1.5"
                          rounded="full"
                          bg={
                            item === current
                              ? "border.primary.bold"
                              : "border.bold"
                          }
                          aria-hidden
                        />
                        <Box color={item === current ? "text.bold" : undefined}>
                          {item.tag}
                        </Box>
                      </HStack>
                      <Box opacity="0.7">{item.label}</Box>
                    </HStack>
                  </Link>
                ))}
              </Box>
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
