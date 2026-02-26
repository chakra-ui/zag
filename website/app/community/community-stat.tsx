import { formatNumber } from "@zag-js/i18n-utils"
import type { ReactNode } from "react"
import { HStack, styled } from "styled-system/jsx"

interface CommunityStatProps {
  href: string
  label: string
  value: number
  subLabel: string
  icon: ReactNode
}

const formatCompact = (value: number) =>
  formatNumber(value, "en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  })

export function CommunityStat(props: CommunityStatProps) {
  return (
    <styled.a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      textAlign={{ base: "left", md: "right" }}
      flex="1"
      _hover={{ color: "fg" }}
    >
      <HStack
        gap="1.5"
        justifyContent={{ base: "flex-start", md: "flex-end" }}
        fontSize="xs"
        color="fg.subtle"
        fontFamily="mono"
        textTransform="uppercase"
        letterSpacing="0.1em"
      >
        <styled.span _icon={{ color: "text.primary.bold" }}>
          {props.icon}
        </styled.span>
        <styled.span>{props.label}</styled.span>
      </HStack>
      <styled.p
        my="2"
        fontSize={{ base: "4xl", md: "5xl" }}
        lineHeight="1"
        fontWeight="semibold"
      >
        {formatCompact(props.value)}
      </styled.p>
      <styled.p fontSize="sm" color="fg.muted">
        {props.subLabel}
      </styled.p>
    </styled.a>
  )
}
