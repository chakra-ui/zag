import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowRightIcon } from "components/icons"
import { Icon } from "components/ui/icon"
import { css } from "styled-system/css"

const bannerStyles = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2.5",
  paddingLeft: "1.5",
  paddingRight: "3.5",
  paddingY: "1.5",
  rounded: "full",
  borderWidth: "1px",
  borderColor: "border",
  bg: "bg.subtle",
  fontSize: "sm",
  cursor: "pointer",
  focusVisibleRing: "outside",
  focusRingColor: "blue.600",
  transition: "background 0.2s ease",
  _hover: {
    bg: "bg.bold",
  },
})

const badgeStyles = css({
  bg: "bg.primary.subtle",
  color: "white",
  rounded: "full",
  px: "2.5",
  py: "0.5",
  fontSize: "xs",
  fontWeight: "semibold",
})

const textStyles = css({
  fontWeight: "medium",
})

interface AnnouncementBannerProps {
  href: string
  badge?: string
  children: ReactNode
}

export function AnnouncementBanner(props: AnnouncementBannerProps) {
  const { href, badge = "New", children } = props
  return (
    <Link href={href} className={bannerStyles}>
      <span className={badgeStyles}>{badge}</span>
      <span className={textStyles}>{children}</span>
      <Icon as={ArrowRightIcon} />
    </Link>
  )
}
