import type { ReactNode } from "react"
import { cva } from "styled-system/css"
import { Stack, styled } from "styled-system/jsx"

export interface TwoToneHeadingProps {
  eyebrow?: string
  title: string
  accent: string
  lead?: ReactNode
  size: "hero" | "sectionFeatured" | "section" | "display"
  as?: "h1" | "h2"
}

const heading = cva({
  base: { color: "fg", textWrap: "balance" },
  variants: {
    size: {
      hero: { textStyle: "hero" },
      sectionFeatured: { textStyle: "sectionFeatured" },
      section: { textStyle: "section" },
      display: { textStyle: "display" },
    },
  },
})

export function TwoToneHeading(props: TwoToneHeadingProps) {
  const { eyebrow, title, accent, lead, size, as = "h2" } = props
  const Heading = as
  return (
    <Stack gap="0" minW="0">
      {eyebrow && (
        <styled.p
          textStyle="eyebrow"
          textTransform="none"
          letterSpacing="0"
          color="fg.subtle"
          mb="4"
        >
          {eyebrow}
        </styled.p>
      )}
      <Heading className={heading({ size })}>
        {title}
        <styled.span display="block" color="accent">
          {accent}
        </styled.span>
      </Heading>
      {lead && (
        <styled.p
          mt="5"
          fontSize={size === "display" ? "17px" : "16px"}
          lineHeight="1.75"
          color="fg.muted"
          textWrap="pretty"
        >
          {lead}
        </styled.p>
      )}
    </Stack>
  )
}
