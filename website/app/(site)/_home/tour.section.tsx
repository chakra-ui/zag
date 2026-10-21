"use client"

import { cells } from "components/ui/cells"
import { Eyebrow } from "components/ui/layout"
import { Box, Grid, HStack, styled } from "styled-system/jsx"
import { chapters, hCopy } from "./content"
import { HMini } from "components/illustrations/minis"
import { accent, gutter } from "./shared"

export function TourSection() {
  return (
    <Box>
      <HStack
        justify="space-between"
        gap="4"
        px={gutter}
        pb="5"
        flexWrap="wrap"
      >
        <Eyebrow>{hCopy.contents}</Eyebrow>
        <styled.p fontSize="14px" color="text.muted">
          {hCopy.hero.tour}
        </styled.p>
      </HStack>
      <Grid
        className={cells}
        gap="1px"
        gridTemplateColumns={{
          base: "repeat(2, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
          xl: "repeat(8, minmax(0, 1fr))",
        }}
      >
        {chapters.map((c) => (
          <styled.a
            key={c.slug}
            href={`#${c.slug}`}
            className="group"
            display="flex"
            flexDirection="column"
            gap="4"
            p="5"
            transition="background 160ms"
            _hover={{ bg: "bg.muted" }}
            focusVisibleRing="inside"
          >
            <Box
              w="full"
              maxW="148px"
              mx="auto"
              color="text.muted"
              transition="color 160ms"
              _groupHover={{ color: "text.bold" }}
            >
              <HMini kind={c.sections[0]?.diagram ?? "principles"} />
            </Box>
            <Box>
              <styled.p
                fontFamily="mono"
                fontSize="11px"
                color="text.muted"
                transition="color 160ms"
                _groupHover={{ color: accent }}
              >
                &quot;{c.state}&quot;
              </styled.p>
              <styled.p
                mt="1"
                fontSize="15px"
                fontWeight="medium"
                color="text.bold"
              >
                {c.label}
              </styled.p>
            </Box>
          </styled.a>
        ))}
        <styled.a
          href={hCopy.start.href}
          className="group"
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          gap="1"
          p="5"
          transition="background 160ms"
          _hover={{ bg: "bg.muted" }}
          focusVisibleRing="inside"
        >
          <styled.p fontFamily="mono" fontSize="11px" color={accent}>
            &quot;{hCopy.start.state}&quot;
          </styled.p>
          <styled.p fontSize="15px" fontWeight="medium" color="text.bold">
            {hCopy.start.label} →
          </styled.p>
          <styled.p fontSize="13px" color="text.muted">
            {hCopy.start.body}
          </styled.p>
        </styled.a>
      </Grid>
    </Box>
  )
}
