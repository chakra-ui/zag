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
    if (scrollIntoView && current && linkRef.current) {
      linkRef.current.scrollIntoView({ block: "center" })
    }
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
                      bg="purple.500"
                      color="white"
                      ms="2"
                      px="1"
                      py="0.5"
                      rounded="sm"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      New
                    </styled.span>
                  )}
                  {item.beta && (
                    <styled.span
                      bg="purple.50"
                      borderWidth="1px"
                      borderColor="purple.200"
                      color="purple.500"
                      ms="2"
                      px="1"
                      py="0.5"
                      rounded="xs"
                      fontSize="xs"
                      fontWeight="medium"
                      _dark={{
                        bg: "purple.900/50",
                        color: "purple.200",
                        borderColor: "purple.800",
                      }}
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
