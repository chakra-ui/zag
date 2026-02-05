import { Footer } from "components/footer"
import { TopNavigation } from "components/top-navigation"
import { Section } from "components/ui/section"
import { showcaseItems, type ShowcaseItem } from "lib/showcase"
import type { Metadata } from "next"
import Image from "next/image"
import { css } from "styled-system/css"
import { Box, Grid, Stack, styled } from "styled-system/jsx"

export const metadata: Metadata = {
  title: "Showcase",
  description:
    "Discover projects and design systems built with Zag.js state machines",
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  return (
    <styled.a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      display="block"
      overflow="hidden"
      rounded="lg"
      borderWidth="1px"
      borderColor="border.subtle"
      bg="bg.subtle"
      transition="all 0.2s"
      _hover={{
        borderColor: "border.emphasized",
        shadow: "sm",
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "green.500",
        outlineOffset: "2px",
      }}
    >
      <Box position="relative" aspectRatio="16/9" overflow="hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover", objectPosition: "top center" }}
          className={css({
            transition: "transform 0.3s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          })}
        />
      </Box>
      <Stack gap="0.5" p="4">
        <styled.h3 fontWeight="semibold" fontSize="sm">
          {item.name}
        </styled.h3>
        <styled.p fontSize="sm" color="fg.muted">
          {item.description}
        </styled.p>
      </Stack>
    </styled.a>
  )
}

export default function ShowcasePage() {
  return (
    <Box>
      <TopNavigation />

      <Section pt={{ base: "12", md: "20" }} pb={{ base: "16", md: "24" }}>
        <Box maxW="3xl" mb={{ base: "10", md: "14" }}>
          <styled.h1 textStyle="display.xl" mb="4">
            Built with Zag
          </styled.h1>
          <styled.p textStyle="text.lg" color="fg.muted">
            From startups to enterprise teams — Zag.js works everywhere
          </styled.p>
        </Box>

        <Grid
          gap={{ base: "6", lg: "8" }}
          columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
        >
          {showcaseItems.map((item) => (
            <ShowcaseCard key={item.href} item={item} />
          ))}
        </Grid>
      </Section>

      <Footer />
    </Box>
  )
}
