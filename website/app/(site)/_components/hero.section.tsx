import { TwoToneHeading } from "components/ui/heading"
import { hCopy } from "lib/home"
import Link from "next/link"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { button, logoChip, pill } from "styled-system/recipes"
import { HeroDemo } from "./hero-demo"
import { gutter } from "./shared"

const frameworks = ["React", "Vue", "Solid", "Svelte", "Preact"]

function FrameworkLogo(props: { name: string }) {
  const slug = props.name.toLowerCase()
  if (slug !== "solid") return <img src={`/logos/${slug}.svg`} alt="" />
  return (
    <>
      <styled.img src="/logos/solid.svg" alt="" display={{ _dark: "none" }} />
      <styled.img
        src="/logos/solid-dark.svg"
        alt=""
        display={{ base: "none", _dark: "block" }}
      />
    </>
  )
}

export function HeroSection() {
  const { hero } = hCopy
  return (
    <Grid
      gridTemplateColumns={{ base: "1fr", xl: "480px minmax(0, 1fr)" }}
      gap={{ base: "12", xl: "16" }}
      alignItems="center"
      px={gutter}
      pt={{ base: "12", md: "24" }}
      pb={{ base: "12", md: "28" }}
    >
      <Stack gap="0" minW="0" alignItems="flex-start">
        <Link href="/blog/zag-v2" className={pill()}>
          <span data-part="tag">v2</span>
          {hero.badge}
        </Link>
        <Box mt="7">
          <TwoToneHeading
            as="h1"
            size="hero"
            title={hero.title}
            accent={hero.accent}
          />
        </Box>
        <styled.p
          mt="5"
          textStyle="body"
          fontSize="16px"
          lineHeight="1.75"
          color="fg.muted"
          maxW="52ch"
        >
          {hero.subtitle}
        </styled.p>
        <HStack mt="3.5" gap="1.5" flexWrap="wrap">
          <styled.span fontSize="15px" color="fg.muted" me="0.5">
            Same in
          </styled.span>
          {frameworks.map((name) => (
            <span key={name} className={logoChip()}>
              <FrameworkLogo name={name} />
              {name}
            </span>
          ))}
        </HStack>
        <HStack mt="9" gap="2.5">
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
      </Stack>
      <Box
        minW="0"
        borderWidth="1px"
        borderColor="border"
        rounded="xl"
        overflow="hidden"
      >
        <HeroDemo />
      </Box>
    </Grid>
  )
}
