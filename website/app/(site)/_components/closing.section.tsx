import { TwoToneHeading } from "components/ui/heading"
import { hCopy } from "lib/home"
import Link from "next/link"
import { Flex, HStack, styled } from "styled-system/jsx"
import { button } from "styled-system/recipes"
import { gutter } from "./shared"

export function ClosingSection() {
  return (
    <styled.section
      bg="accent.tint"
      borderTopWidth="1px"
      borderColor="accent.line"
    >
      <Flex
        maxW="1440px"
        mx="auto"
        px={gutter}
        py={{ base: "16", md: "24" }}
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap="8"
      >
        <TwoToneHeading
          title={hCopy.closing.title}
          accent={hCopy.closing.accent}
          size="section"
        />
        <HStack gap="2.5" flexShrink="0">
          <Link
            href="/overview/introduction"
            className={button({ variant: "solid" })}
          >
            Get started →
          </Link>
          <Link href="/components/react/accordion" className={button()}>
            Browse components
          </Link>
        </HStack>
      </Flex>
    </styled.section>
  )
}
