import { CopyHex, CopySnippet } from "app/(site)/brand/_components/brand-copy"
import { cells } from "components/ui/cells"
import { Band, Eyebrow, Frame, Lead, Pad, Title } from "components/ui/layout"
import {
  colors,
  DARK,
  donts,
  dos,
  html,
  LIGHT,
  logos,
  markdown,
  type Asset,
} from "lib/brand"
import { createPageMetadata } from "lib/seo"
import type { ReactNode } from "react"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"

export const metadata = createPageMetadata({
  title: "Brand",
  description:
    "Zag.js logo files, colours, usage notes and a Built with Zag badge.",
  path: "/brand",
})

const px = { base: "4", sm: "6", md: "10" }

function SectionHead(props: {
  index: string
  title: string
  children: ReactNode
}) {
  return (
    <Box px={px} pt={{ base: "10", md: "12" }} pb={{ base: "6", md: "8" }}>
      <Eyebrow mb="3">{props.index}</Eyebrow>
      <styled.h2
        fontSize={{ base: "22px", md: "26px" }}
        lineHeight="1.2"
        letterSpacing="-0.02em"
        fontWeight="semibold"
        color="text.bold"
      >
        {props.title}
      </styled.h2>
      <styled.p mt="2" color="text.muted" fontSize="15px" maxW="60ch">
        {props.children}
      </styled.p>
    </Box>
  )
}

function Downloads(props: { items: Asset[] }) {
  return (
    <Stack gap="1.5">
      {props.items.map((item) => (
        <HStack key={item.file} gap="1" fontFamily="mono" fontSize="12px">
          {item.label && (
            <styled.span color="text.muted" minW="12">
              {item.label}
            </styled.span>
          )}
          {["svg", "png"].map((ext) => (
            <styled.a
              key={ext}
              href={`/brand/${item.file}.${ext}`}
              download
              aria-label={`Download ${item.file}.${ext}`}
              display="inline-flex"
              alignItems="center"
              h="7"
              px="2"
              borderWidth="1px"
              borderColor="border"
              borderRadius="sm"
              color="text.subtle"
              textTransform="uppercase"
              transition="color 150ms, border-color 150ms"
              _hover={{ color: "text.bold", borderColor: "border.bold" }}
              focusVisibleRing="outside"
            >
              {ext} ↓
            </styled.a>
          ))}
        </HStack>
      ))}
    </Stack>
  )
}

function Preview(props: { bg: string; children: ReactNode }) {
  return (
    <Box
      flex="1"
      minH={{ base: "160px", md: "200px" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="8"
      style={{ background: props.bg }}
    >
      {props.children}
    </Box>
  )
}

export default function BrandPage() {
  return (
    <Box>
      <Frame>
        <Pad>
          <Eyebrow mb="3">Brand</Eyebrow>
          <Title as="h1">Zag brand assets</Title>
          <Lead mt="4">
            Logo files, colours and a badge for referring to Zag. Using them
            does not mean Zag endorses your project.
          </Lead>
        </Pad>

        <Band>
          <SectionHead index="01 · Logo" title="Logo">
            The wordmark with the green slash. SVG for the web, PNG at 4x for
            everything else.
          </SectionHead>
          <Grid className={cells} gap="1px" columns={{ base: 1, md: 2 }}>
            {logos.map((logo) => (
              <Box
                key={logo.name}
                display="flex"
                flexDirection="column"
                gap="5"
                p={{ base: "5", md: "8" }}
              >
                <Box
                  display="flex"
                  borderWidth="1px"
                  borderColor="border"
                  borderRadius="lg"
                  overflow="hidden"
                >
                  {logo.previews.map((p) => (
                    <Preview key={p.file} bg={p.bg}>
                      <styled.img
                        src={`/brand/${p.file}`}
                        alt={p.alt}
                        h={p.h}
                        w="auto"
                      />
                    </Preview>
                  ))}
                </Box>
                <HStack
                  justify="space-between"
                  alignItems="flex-start"
                  gap="4"
                  flexWrap="wrap"
                >
                  <Box>
                    <styled.h3
                      fontSize="16px"
                      fontWeight="semibold"
                      color="text.bold"
                    >
                      {logo.name}
                    </styled.h3>
                    <styled.p mt="1" color="text.muted" fontSize="14px">
                      {logo.note}
                    </styled.p>
                  </Box>
                  <Downloads items={logo.downloads} />
                </HStack>
              </Box>
            ))}
          </Grid>
        </Band>

        <Band>
          <SectionHead index="02 · Colour" title="Colour">
            One green for the mark. The site runs on neutral greys with a
            quieter green for accents.
          </SectionHead>
          <Grid className={cells} gap="1px" columns={{ base: 2, md: 4 }}>
            {colors.map((c) => (
              <Box key={c.hex} p={{ base: "4", md: "6" }}>
                <Box
                  h={{ base: "16", md: "20" }}
                  borderRadius="md"
                  boxShadow="inset 0 0 0 1px var(--colors-border)"
                  style={{ background: c.hex }}
                />
                <styled.h3
                  mt="4"
                  fontSize="14px"
                  fontWeight="semibold"
                  color="text.bold"
                >
                  {c.name}
                </styled.h3>
                <styled.p mt="0.5" mb="2" color="text.muted" fontSize="13px">
                  {c.use}
                </styled.p>
                <CopyHex value={c.hex} label={c.name} />
              </Box>
            ))}
          </Grid>
        </Band>

        <Band>
          <SectionHead index="03 · Usage" title="Usage">
            A few rules so the logo reads the same everywhere.
          </SectionHead>
          <Grid className={cells} gap="1px" columns={{ base: 1, md: 2 }}>
            {[
              { title: "Do", items: dos },
              { title: "Don't", items: donts },
            ].map((col) => (
              <Box key={col.title} p={{ base: "5", md: "8" }}>
                <Eyebrow mb="4">{col.title}</Eyebrow>
                <styled.ul display="flex" flexDirection="column" gap="3">
                  {col.items.map((item) => (
                    <styled.li
                      key={item}
                      display="flex"
                      gap="3"
                      color="text.subtle"
                      fontSize="15px"
                      lineHeight="1.55"
                    >
                      <styled.span
                        aria-hidden
                        fontFamily="mono"
                        color="text.muted"
                        flexShrink="0"
                      >
                        {col.title === "Do" ? "+" : "−"}
                      </styled.span>
                      {item}
                    </styled.li>
                  ))}
                </styled.ul>
              </Box>
            ))}
          </Grid>
        </Band>

        <Band>
          <SectionHead index="04 · Badge" title="Built with Zag">
            Add it to your README or site footer. It links back to zagjs.com.
          </SectionHead>
          <Grid className={cells} gap="1px" columns={{ base: 1, lg: 2 }}>
            <Box
              display="flex"
              flexDirection="column"
              gap="5"
              p={{ base: "5", md: "8" }}
            >
              <Box
                display="flex"
                borderWidth="1px"
                borderColor="border"
                borderRadius="lg"
                overflow="hidden"
              >
                <Preview bg={LIGHT}>
                  <styled.img
                    src="/brand/built-with-zag-light.svg"
                    alt="Built with Zag badge, light"
                    h="7"
                    w="auto"
                  />
                </Preview>
                <Preview bg={DARK}>
                  <styled.img
                    src="/brand/built-with-zag-dark.svg"
                    alt="Built with Zag badge, dark"
                    h="7"
                    w="auto"
                  />
                </Preview>
              </Box>
              <Downloads
                items={[
                  { label: "Light", file: "built-with-zag-light" },
                  { label: "Dark", file: "built-with-zag-dark" },
                ]}
              />
            </Box>
            <Stack gap="4" p={{ base: "5", md: "8" }} minW="0">
              <CopySnippet label="Markdown" value={markdown} />
              <CopySnippet label="HTML" value={html} />
            </Stack>
          </Grid>
        </Band>

        <Band />
      </Frame>
    </Box>
  )
}
