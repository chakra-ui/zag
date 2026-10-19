import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { GithubIcon, HeartIcon } from "components/icons"
import { Icon } from "components/ui/icon"
import { getActiveTab } from "lib/pagination-utils"
import { useRouteChange } from "lib/use-route-change"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"
import { HiArrowRight, HiMenu, HiX } from "react-icons/hi"
import { tabs as docsTabs } from "sidebar.config"
import siteConfig from "site.config"
import { css, cx } from "styled-system/css"
import { Box, Flex, Grid, HStack, styled } from "styled-system/jsx"
import useMatchMedia from "use-match-media-hook"
import { FrameworkSelect } from "../framework-select"
import { LogoWithLink } from "../logo"
import { Sidebar } from "../sidebar"
import { focusRing, navCluster, navControl } from "./control"
import { navLinks } from "./nav-links"
import { VersionSelect } from "./version-select"

const eyebrow = css({
  fontFamily: "mono",
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "text.muted",
  mb: "3",
})

const row = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  h: "12",
  px: "4",
  bg: "bg",
  fontSize: "15px",
  color: "text.muted",
  transition: "color 120ms, background 120ms",
  _hover: { color: "text.bold", bg: "bg.muted" },
  _focusVisible: focusRing,
  _currentPage: { color: "text.bold" },
  "& svg": { boxSize: "4", flexShrink: "0" },
})

const list = css({
  display: "grid",
  gap: "1px",
  bg: "border",
  borderWidth: "1px",
  borderColor: "border",
  rounded: "md",
  overflow: "hidden",
})

function Section(props: { label: string; children: ReactNode }) {
  return (
    <Box as="section" aria-label={props.label}>
      <p className={eyebrow}>{props.label}</p>
      {props.children}
    </Box>
  )
}

export function MobileNav(props: { className?: string }) {
  const service = useMachine(dialog.machine, {
    id: "m1",
    "aria-label": "Site menu",
    initialFocusEl: () => initialRef.current,
  })

  const api = dialog.connect(service, normalizeProps)
  const initialRef = useRef<HTMLButtonElement | null>(null)
  const pathname = usePathname()

  const [desktop] = useMatchMedia([`(min-width: 1024px)`])

  useEffect(() => {
    if (desktop) api.setOpen(false)
  }, [desktop])

  useRouteChange(() => {
    api.setOpen(false)
  })

  return (
    <>
      <button
        type="button"
        className={cx(props.className, css({ hideFrom: "lg" }))}
        aria-label="Open menu"
        {...api.getTriggerProps()}
      >
        <HiMenu aria-hidden />
      </button>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <Box
              {...api.getContentProps()}
              position="fixed"
              inset="0"
              zIndex="100"
              overflowY="auto"
              overscrollBehavior="contain"
              bg="bg"
              outline="0"
            >
              <Box
                position="sticky"
                top="0"
                zIndex="1"
                bg="bg/80"
                backdropFilter="auto"
                backdropBlur="md"
                borderBottomWidth="1px"
                borderColor="border"
              >
                <Flex
                  h="14"
                  alignItems="center"
                  justifyContent="space-between"
                  px={{ base: "4", sm: "6", md: "8" }}
                >
                  <HStack gap="3">
                    <LogoWithLink />
                    <VersionSelect />
                  </HStack>
                  <div className={navCluster}>
                    <button
                      ref={initialRef}
                      type="button"
                      className={navControl}
                      {...api.getCloseTriggerProps()}
                      aria-label="Close menu"
                    >
                      <HiX aria-hidden />
                    </button>
                  </div>
                </Flex>
              </Box>

              <Grid
                gap="10"
                px={{ base: "4", sm: "6", md: "8" }}
                pt="8"
                pb="16"
              >
                <Section label="Navigate">
                  <nav aria-label="Main" className={list}>
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={row}
                        aria-current={
                          link.isActive(pathname) ? "page" : undefined
                        }
                      >
                        <HStack gap="3">
                          <styled.span
                            boxSize="1.5"
                            rounded="full"
                            bg={
                              link.isActive(pathname)
                                ? "border.primary.bold"
                                : "border.bold"
                            }
                            aria-hidden
                          />
                          {link.label}
                        </HStack>
                        <HiArrowRight aria-hidden />
                      </Link>
                    ))}
                  </nav>
                </Section>

                <Section label="Docs">
                  <Box mb="4">
                    <FrameworkSelect />
                  </Box>
                  <MobileDocsTabs />
                </Section>

                <Section label="Project">
                  <div className={list}>
                    <a
                      className={row}
                      href={siteConfig.repo.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <HStack gap="3">
                        <GithubIcon />
                        GitHub
                      </HStack>
                      <HiArrowRight aria-hidden />
                    </a>
                    <a
                      className={row}
                      href={siteConfig.openCollective.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <HStack gap="3">
                        <HeartIcon />
                        Sponsor
                      </HStack>
                      <HiArrowRight aria-hidden />
                    </a>
                  </div>
                </Section>
              </Grid>
            </Box>
          </div>
        </Portal>
      )}
    </>
  )
}

function MobileDocsTabs() {
  const pathname = usePathname()
  const service = useMachine(tabs.machine, {
    id: "mobile-docs-tabs",
    defaultValue: getActiveTab(pathname).id,
  })
  const api = tabs.connect(service, normalizeProps)

  return (
    <Box {...api.getRootProps()}>
      <Grid
        {...api.getListProps()}
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        gap="1px"
        mb="6"
        bg="border"
        borderWidth="1px"
        borderColor="border"
        rounded="md"
        overflow="hidden"
      >
        {docsTabs.map((tab) => (
          <styled.button
            key={tab.id}
            display="inline-flex"
            alignItems="center"
            gap="2"
            h="10"
            px="3"
            bg="bg"
            fontSize="sm"
            color="text.muted"
            cursor="pointer"
            transition="color 120ms, background 120ms"
            _hover={{ color: "text.bold" }}
            _selected={{ color: "text.bold", bg: "bg.muted" }}
            _focusVisible={focusRing}
            {...api.getTriggerProps({ value: tab.id })}
          >
            <Icon as={tab.icon} />
            {tab.label}
          </styled.button>
        ))}
      </Grid>
      {docsTabs.map((tab) => (
        <Box key={tab.id} {...api.getContentProps({ value: tab.id })}>
          <Sidebar tabId={tab.id} />
        </Box>
      ))}
    </Box>
  )
}
