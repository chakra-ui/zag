import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { frameworks, type Framework } from "lib/framework-utils"
import { usePathname, useRouter } from "next/navigation"
import { HiChevronDown } from "react-icons/hi"
import { css } from "styled-system/css"
import { HStack, Stack, styled } from "styled-system/jsx"
import { useFramework } from "./framework"
import { Icon } from "./ui/icon"

// Same menu as the version switcher in the top nav
export function FrameworkSelect() {
  const { framework, setFramework } = useFramework()
  const router = useRouter()
  const asPath = usePathname()

  const service = useMachine(menu.machine, {
    id: "framework-select",
    positioning: { strategy: "fixed", placement: "bottom-end" },
    onSelect({ value }) {
      const newFramework = value as Framework
      setFramework?.(newFramework)
      if (asPath.includes(framework) && newFramework !== framework) {
        router.replace(asPath.replace(framework, newFramework))
      }
    },
  })

  const api = menu.connect(service, normalizeProps)
  const current = frameworks[framework]

  return (
    <HStack>
      <styled.span fontWeight="medium" fontSize="sm">
        Framework:
      </styled.span>
      <styled.button
        display="flex"
        alignItems="center"
        gap="1.5"
        borderWidth="1px"
        rounded="sm"
        fontSize="sm"
        px="2"
        py="1"
        fontWeight="semibold"
        cursor="pointer"
        bg="bg"
        color="text"
        {...api.getTriggerProps()}
      >
        <Icon as={current.icon} aria-hidden />
        {current.label}
        <Icon as={HiChevronDown} fontSize="md" />
      </styled.button>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <Stack
              width="180px"
              zIndex="1000"
              fontSize="sm"
              bg="bg"
              padding="2"
              gap="0"
              isolation="isolate"
              listStyleType="none"
              boxShadow="md"
              outline="0"
              {...api.getContentProps()}
            >
              {Object.entries(frameworks).map(([key, value]) => (
                <div
                  key={key}
                  {...api.getOptionItemProps({
                    type: "radio",
                    value: key,
                    checked: key === framework,
                  })}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "2",
                    px: "0.5rem",
                    py: "0.25rem",
                    cursor: "pointer",
                    _checked: { fontWeight: "semibold" },
                    _highlighted: {
                      bg: "bg.primary.bold",
                      color: "text.inverse",
                    },
                  })}
                >
                  <Icon as={value.icon} aria-hidden />
                  {value.label}
                </div>
              ))}
            </Stack>
          </div>
        </Portal>
      )}
    </HStack>
  )
}
