import { Portal } from "@zag-js/react"
import { Icon } from "components/ui/icon"
import { useSearch } from "lib/use-search"
import type { SearchMetaItem } from "lib/search-meta"
import Link from "next/link"
import { Fragment, useEffect, useState } from "react"
import { HiOutlineSearch } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, styled } from "styled-system/jsx"
import { SearchTrigger } from "./search-trigger"

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  guides: "Guides",
  components: "Components",
  utilities: "Utilities",
  blog: "Blog",
}

const EXIT_MS = 140

const getSection = (item: SearchMetaItem) => item.url.split("/")[1] ?? ""

function getTrail(item: SearchMetaItem) {
  if (item.type === "lvl1") return null
  const { lvl1, lvl2 } = item.hierarchy
  if (item.type === "lvl3" && lvl2) return `${lvl1} / ${lvl2}`
  return lvl1
}

function groupBySection(items: SearchMetaItem[]) {
  const groups: { key: string; section: string; items: SearchMetaItem[] }[] = []
  for (const item of items) {
    const section = getSection(item)
    const last = groups[groups.length - 1]
    if (last && last.section === section) last.items.push(item)
    else
      groups.push({
        key: `${section}-${groups.length}`,
        section,
        items: [item],
      })
  }
  return groups
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function Highlight(props: { text: string; query: string }) {
  const { text, query } = props
  if (query.length < 3) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"))
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className={markStyle}>
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  )
}

const markStyle = css({
  bg: "transparent",
  color: "text.bold",
  fontWeight: "semibold",
})

const keyChip = css({
  fontFamily: "mono",
  fontSize: "11px",
  h: "5",
  minW: "5",
  px: "1.5",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: "1",
  letterSpacing: "0.04em",
  rounded: "sm",
  borderWidth: "1px",
  borderColor: "border",
  borderBottomWidth: "2px",
  bg: "bg",
  color: "text.muted",
})

const motion = {
  transitionProperty: "opacity, transform",
  transitionDuration: `${EXIT_MS}ms`,
  transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
  _motionReduce: { transitionDuration: "0ms" },
}

const itemStyle = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "3",
  ps: "3.5",
  pe: "3",
  py: "2.5",
  rounded: "sm",
  textDecoration: "none",
  color: "text.muted",
  cursor: "pointer",
  scrollMarginBlock: "8",
  _before: {
    content: '""',
    position: "absolute",
    insetBlock: "2",
    insetInlineStart: "0",
    w: "2px",
    rounded: "full",
    bg: "bg.primary.subtle",
    opacity: "0",
  },
  _highlighted: {
    bg: { base: "bg.muted", _dark: "whiteAlpha.100" },
    _before: { opacity: "1" },
  },
})

export function Search() {
  const { dialog_api, combobox_api, results } = useSearch()
  const open = dialog_api.open
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const timer = setTimeout(() => setMounted(false), EXIT_MS)
    return () => clearTimeout(timer)
  }, [open])

  const query = combobox_api.inputValue.trim()
  const groups = groupBySection(results)
  const noResults = query.length >= 3 && results.length === 0
  const listProps = combobox_api.getContentProps()

  return (
    <>
      <SearchTrigger {...dialog_api.getTriggerProps()} />
      {(open || mounted) && (
        <Portal>
          <styled.div
            position="fixed"
            inset="0"
            zIndex="1000"
            bg={{ base: "blackAlpha.300", _dark: "blackAlpha.600" }}
            backdropFilter="blur(3px)"
            css={motion}
            opacity="1"
            _closed={{ opacity: "0" }}
            {...dialog_api.getBackdropProps()}
            hidden={false}
            data-state={open ? "open" : "closed"}
          />
          <styled.div
            display="flex"
            flexDirection="column"
            alignItems="center"
            position="fixed"
            inset="0"
            zIndex="1000"
            px={{ base: "4", md: "6" }}
            pt={{ base: "4", md: "12vh" }}
            pb="4"
            {...dialog_api.getPositionerProps()}
          >
            <styled.div
              width="full"
              maxW="640px"
              maxH="full"
              display="flex"
              flexDirection="column"
              overflow="hidden"
              rounded="lg"
              bg="bg.popover"
              borderWidth="1px"
              borderColor="border.bold"
              boxShadow="0 24px 64px -24px rgb(0 0 0 / 0.45), 0 2px 6px -2px rgb(0 0 0 / 0.08)"
              position="relative"
              pointerEvents="auto"
              outline="0"
              css={{
                ...motion,
                "@starting-style": {
                  opacity: "0",
                  transform: "translateY(-6px) scale(0.99)",
                },
              }}
              _closed={{
                opacity: "0",
                transform: "translateY(-4px) scale(0.99)",
              }}
              {...dialog_api.getContentProps()}
              hidden={false}
              inert={!open || undefined}
              data-state={open ? "open" : "closed"}
            >
              <styled.h2 srOnly {...dialog_api.getTitleProps()}>
                Search the docs
              </styled.h2>

              <Box
                display="flex"
                flexDirection="column"
                minH="0"
                {...combobox_api.getRootProps()}
              >
                <styled.div
                  h="14"
                  flexShrink="0"
                  display="flex"
                  alignItems="center"
                  gap="3"
                  px="4"
                  borderBottomWidth="1px"
                  borderColor="border"
                >
                  <Icon
                    as={HiOutlineSearch}
                    fontSize="18px"
                    color="text.muted"
                    flexShrink="0"
                  />
                  <styled.input
                    flex="1"
                    minW="0"
                    h="full"
                    outline="0"
                    bg="transparent"
                    border="none"
                    fontSize={{ base: "16px", md: "17px" }}
                    color="text.bold"
                    _placeholder={{ color: "text.muted" }}
                    {...combobox_api.getInputProps()}
                    placeholder="Search docs"
                  />
                  <styled.button
                    type="button"
                    className={keyChip}
                    cursor="pointer"
                    transition="color 120ms, border-color 120ms"
                    _hover={{ color: "text.bold", borderColor: "border.bold" }}
                    _focusVisible={{
                      outline: "2px solid",
                      outlineColor: "border.primary.bold",
                      outlineOffset: "2px",
                    }}
                    {...dialog_api.getCloseTriggerProps()}
                    aria-label="Close search"
                  >
                    esc
                  </styled.button>
                </styled.div>

                <styled.div
                  minH="0"
                  maxH={{
                    base: "calc(100dvh - 160px)",
                    md: "min(440px, 60vh)",
                  }}
                  overflowY="auto"
                  overscrollBehavior="contain"
                  p="1.5"
                  outline="0"
                  {...listProps}
                  hidden={listProps.hidden || results.length === 0}
                >
                  {groups.map((group, index) => (
                    <styled.div
                      key={group.key}
                      mt={index > 0 ? "2" : undefined}
                      {...combobox_api.getItemGroupProps({ id: group.key })}
                    >
                      <styled.div
                        px="3.5"
                        pt="2"
                        pb="1.5"
                        fontFamily="mono"
                        fontSize="10px"
                        letterSpacing="0.12em"
                        textTransform="uppercase"
                        color="text.muted"
                        {...combobox_api.getItemGroupLabelProps({
                          htmlFor: group.key,
                        })}
                      >
                        {sectionLabels[group.section] ?? group.section}
                      </styled.div>
                      {group.items.map((item) => {
                        const trail = getTrail(item)
                        return (
                          <Link
                            key={item.url}
                            href={item.url}
                            className={itemStyle}
                            {...combobox_api.getItemProps({ item })}
                          >
                            <Box flex="1" minW="0">
                              {trail && (
                                <Box
                                  fontFamily="mono"
                                  fontSize="11px"
                                  lineHeight="1.4"
                                  truncate
                                >
                                  {trail}
                                </Box>
                              )}
                              <Box
                                fontSize="14px"
                                fontWeight="medium"
                                lineHeight="1.45"
                                color="text.bold"
                                truncate
                              >
                                <Highlight text={item.content} query={query} />
                              </Box>
                              {item.text && (
                                <Box fontSize="13px" lineHeight="1.45" truncate>
                                  <Highlight text={item.text} query={query} />
                                </Box>
                              )}
                            </Box>
                            <Box
                              flexShrink="0"
                              fontFamily="mono"
                              fontSize="10px"
                              letterSpacing="0.06em"
                              px="1.5"
                              h="5"
                              display="inline-flex"
                              alignItems="center"
                              rounded="sm"
                              borderWidth="1px"
                              borderColor="border"
                              aria-hidden
                            >
                              {item.type === "lvl1"
                                ? "page"
                                : item.type === "lvl2"
                                  ? "h2"
                                  : "h3"}
                            </Box>
                          </Link>
                        )
                      })}
                    </styled.div>
                  ))}
                </styled.div>

                {results.length === 0 && (
                  <styled.output
                    display="block"
                    px="5"
                    py="10"
                    textAlign="center"
                    fontFamily="mono"
                    fontSize="12px"
                    color="text.muted"
                  >
                    {noResults ? (
                      <>
                        <styled.p color="text.bold">
                          no results for &ldquo;{query}&rdquo;
                        </styled.p>
                        <styled.p mt="1.5">
                          try a component name, like menu or dialog
                        </styled.p>
                      </>
                    ) : (
                      <styled.p>loading index&hellip;</styled.p>
                    )}
                  </styled.output>
                )}
              </Box>

              <styled.div
                display={{ base: "none", sm: "flex" }}
                flexShrink="0"
                alignItems="center"
                gap="4"
                px="4"
                h="10"
                borderTopWidth="1px"
                borderColor="border"
                fontFamily="mono"
                fontSize="11px"
                color="text.muted"
                aria-hidden
              >
                <styled.span
                  display="inline-flex"
                  alignItems="center"
                  gap="1.5"
                >
                  <kbd className={keyChip}>↑</kbd>
                  <kbd className={keyChip}>↓</kbd>
                  navigate
                </styled.span>
                <styled.span
                  display="inline-flex"
                  alignItems="center"
                  gap="1.5"
                >
                  <kbd className={keyChip}>↵</kbd>
                  open
                </styled.span>
                <styled.span
                  display="inline-flex"
                  alignItems="center"
                  gap="1.5"
                >
                  <kbd className={keyChip}>esc</kbd>
                  close
                </styled.span>
              </styled.div>
            </styled.div>
          </styled.div>
        </Portal>
      )}
    </>
  )
}
