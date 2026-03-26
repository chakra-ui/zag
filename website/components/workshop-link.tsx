import { FaChevronRight } from "react-icons/fa"
import { css } from "styled-system/css"
import { styled } from "styled-system/jsx"
import { Icon } from "components/ui/icon"

const StyledLink = styled("a", {
  base: {
    display: { base: "none", lg: "flex" },
    alignItems: "center",
    gap: "2",
    px: "3",
    py: "1",
    textStyle: "sm",
    color: "text",
    bg: "bg.subtle",
    textDecoration: "none",
    rounded: "sm",
    _hover: { bg: "bg.muted" },
  },
})

export function WorkshopLink() {
  return (
    <StyledLink href="/creator-workshop">
      <b>Creator's Workshop</b>
      <svg width="2" height="2" fill="currentColor" aria-hidden="true">
        <circle cx="1" cy="1" r="1" />
      </svg>
      <span className={css({ ml: "2" })}>
        Learn how to use Zag from its creator
      </span>
      <Icon as={FaChevronRight} w="auto" fontSize="10px" />
    </StyledLink>
  )
}
