import { Link } from "components/ui/link"
import { docHref, getActiveTab, isCurrentDoc } from "lib/pagination-utils"
import { type LinkProps } from "next/link"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef } from "react"
import { tabs } from "sidebar.config"
import { Stack, styled } from "styled-system/jsx"
import { useFramework } from "./framework"

interface DocLinkProps {
  href: LinkProps["href"]
  current: boolean
  scrollIntoView: boolean
  children: React.ReactNode
}

const StyledLink = styled(Link, {
  base: {
    display: "block",
    paddingY: "1",
    paddingStart: "4",
    marginStart: "-1px",
    borderStartWidth: "1px",
    borderStartColor: "transparent",
    textStyle: "sm",
    color: "text.muted",
    _hover: {
      color: "text",
      borderStartColor: "border.bold",
    },
    _currentPage: {
      color: "text.primary.bold",
      fontWeight: "semibold",
      borderStartColor: "green.500",
    },
  },
})

const DocLink = (props: DocLinkProps) => {
  const asPath = usePathname()
  const { href, current, scrollIntoView, children } = props
  const linkRef = useRef<HTMLAnchorElement>(null)

  useLayoutEffect(() => {
    const link = linkRef.current
    if (!scrollIntoView || !current || !link) return
    // scroll only the sidebar column; scrollIntoView would also move the page
    const container = link.closest<HTMLElement>("[data-sidebar-scroll]")
    if (!container) return
    const linkTop = link.getBoundingClientRect().top
    const containerTop = container.getBoundingClientRect().top
    container.scrollTop += linkTop - containerTop - container.clientHeight / 2
  }, [scrollIntoView, current, asPath])

  return (
    <li>
      <StyledLink
        ref={linkRef}
        href={href.toString()}
        aria-current={current ? "page" : undefined}
      >
        {children}
      </StyledLink>
    </li>
  )
}

/**
 * Only the active tab's groups. The mobile menu passes `tabId` to show another
 * tab, and keeps its own scroll so the tab switcher stays in view.
 */
export function Sidebar(props: { tabId?: string }) {
  const { framework } = useFramework()
  const pathname = usePathname()
  const tab =
    tabs.find((tab) => tab.id === props.tabId) ?? getActiveTab(pathname)

  return (
    <nav aria-label={`${tab.label} navigation`}>
      <Stack as="ul" listStyleType="none" direction="column" gap="8">
        {tab.groups.map((group) => (
          <li key={group.label}>
            <styled.h5
              mb="2"
              fontSize="xs"
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wide"
              color="text.subtle"
            >
              {group.label}
            </styled.h5>

            <Stack
              as="ul"
              listStyleType="none"
              gap="0"
              borderStartWidth="1px"
              borderStartColor="border.subtle"
            >
              {group.items.map((item) => (
                <DocLink
                  key={`${item.section}/${item.id}`}
                  href={docHref(item, framework)}
                  current={isCurrentDoc(item, pathname)}
                  scrollIntoView={!props.tabId}
                >
                  {item.label}
                  {item.new && (
                    <styled.span
                      ms="2"
                      px="1.5"
                      py="0.5"
                      rounded="xs"
                      borderWidth="1px"
                      borderColor="border.bold"
                      color="text.muted"
                      fontFamily="mono"
                      fontSize="10px"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                    >
                      New
                    </styled.span>
                  )}
                  {item.beta && (
                    <styled.span
                      ms="2"
                      px="1.5"
                      py="0.5"
                      rounded="xs"
                      borderWidth="1px"
                      borderColor="border.bold"
                      color="text.muted"
                      fontFamily="mono"
                      fontSize="10px"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                    >
                      Beta
                    </styled.span>
                  )}
                </DocLink>
              ))}
            </Stack>
          </li>
        ))}
      </Stack>
    </nav>
  )
}
