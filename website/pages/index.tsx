import { Annoucement } from "components/annoucement"
import { CodeArea } from "components/code-area"
import { Footer } from "components/footer"
import {
  AccessibilityIcon,
  ArrowRightIcon,
  CheckIcon,
  FrameworkAgnosticIcon,
  PlayIcon,
  ReactIcon,
  SolidIcon,
  StatechartIcon,
  SvelteIcon,
  VueIcon,
} from "components/icons"
import { Illustration } from "components/illustration"
import { MultiframeworkTabs } from "components/multi-framework"
import { TopNavigation } from "components/top-navigation"
import { Blockquote } from "components/ui/blockquote"
import { Button, ButtonLink } from "components/ui/button"
import { Icon } from "components/ui/icon"
import { Section } from "components/ui/section"
import { generateNextSeo } from "next-seo/pages"
import Head from "next/head"
import Image from "next/image"
import { type ElementType } from "react"
import siteConfig from "site.config"
import {
  Box,
  Center,
  Circle,
  Flex,
  HStack,
  Stack,
  styled,
} from "styled-system/jsx"

type FeatureItemProps = {
  title: string
  icon: ElementType
  children: string
}

function FeatureItem(props: FeatureItemProps) {
  const { title, children, icon: IconComponent } = props
  return (
    <Box fontSize="lg">
      <Box fontSize="6xl">
        <IconComponent />
      </Box>
      <Box mt="4">
        <styled.p fontWeight="bold">{title}</styled.p>
        <styled.p mt={2}>{children}</styled.p>
      </Box>
    </Box>
  )
}

export default function Home() {
  return (
    <Box>
      <Head>{generateNextSeo({ title: siteConfig.title })}</Head>

      <TopNavigation />

      <Box as="header" position="relative">
        <Section>
          <Box pos="relative" maxW="4xl" pt={{ base: "16", md: "24" }}>
            <Annoucement />
            <styled.h1 textStyle="display.2xl">
              UI components powered by Finite State Machines
            </styled.h1>
            <styled.p
              className="has-highlight"
              textStyle="text.xl"
              maxW="xl"
              mt="6"
            >
              A collection of framework-agnostic UI component patterns like{" "}
              <mark>accordion</mark>, <mark>menu</mark>, and <mark>dialog</mark>{" "}
              that can be used to build design systems for React, Vue, Solid.js
              and Svelte
            </styled.p>
          </Box>

          <Illustration />

          <Stack
            direction={{ base: "column", sm: "row" }}
            align={{ sm: "center" }}
            mt="8"
            mb="12"
            gap="5"
          >
            <ButtonLink href="/overview/introduction" variant="green">
              <HStack gap="6">
                <span>Get Started</span>
                <Icon as={ArrowRightIcon} />
              </HStack>
            </ButtonLink>
            <Image
              draggable={false}
              src="/oss-nominee.png"
              alt="GitNation React Nominee (2024)"
              width={200}
              height={64}
            />
          </Stack>

          <HStack gap="12">
            <ReactIcon />
            <VueIcon />
            <SolidIcon />
            <SvelteIcon />
          </HStack>
        </Section>
      </Box>

      <Section
        bg={{ base: "bg.tertiary.bold", md: "unset" }}
        my={{ base: "20", md: "32" }}
      >
        <Box
          bg="bg.tertiary.bold"
          px={{ md: "20" }}
          py={{ base: "10", md: "20" }}
        >
          <styled.h2 textStyle="display.xl" mb="8" maxW="24ch">
            Zag provides the component API for the Web
          </styled.h2>

          <ButtonLink
            href="/overview/introduction"
            variant="black"
            width={{ base: "full", md: "auto" }}
          >
            Get Started
          </ButtonLink>

          <Stack
            direction={{ base: "column", lg: "row" }}
            gap={{ base: "8", lg: "20" }}
            mt="12"
          >
            <FeatureItem icon={StatechartIcon} title="Powered by Statecharts">
              Simple, resilient component logic. Write component logic once and
              use anywhere.
            </FeatureItem>
            <FeatureItem icon={AccessibilityIcon} title="Accessible">
              Built-in adapters that connects machine output to DOM semantics in
              a WAI-ARIA compliant way.
            </FeatureItem>
            <FeatureItem
              icon={FrameworkAgnosticIcon}
              title="Framework agnostic"
            >
              Component logic is largely JavaScript code and can be consumed in
              any JS framework.
            </FeatureItem>
          </Stack>
        </Box>
      </Section>

      <Section my={{ base: "20", md: "32" }}>
        <Flex
          gap="64px"
          direction={{ base: "column", xl: "row" }}
          align={{ base: "flex-start", xl: "center" }}
        >
          <Box flex="1">
            <styled.h2 mb="8" maxW="24ch" textStyle="display.xl">
              Machines handle the logic. You handle the UI
            </styled.h2>
            <styled.p maxW="64ch" fontSize="lg">
              Zag machine APIs are completely headless and unstyled. Use your
              favorite styling solution and get it matching your design system.
            </styled.p>

            <Stack as="ul" gap="5" mt="8" fontSize="lg" listStyleType="none">
              {[
                "Install the machine you need",
                "Consume the machine",
                "Connect machine to your UI",
              ].map((item, index) => (
                <styled.li key={index} display="flex" alignItems="flex-start">
                  <Box fontSize="3xl" mr="2">
                    <CheckIcon />
                  </Box>
                  <span>{item}</span>
                </styled.li>
              ))}
            </Stack>
          </Box>

          <Center
            position="relative"
            width="full"
            maxW={{ xl: "800px" }}
            minHeight="500px"
          >
            <Box
              width="full"
              mx="auto"
              height="84%"
              position="absolute"
              bg="green.400"
              rounded="2xl"
            />
            <Box
              width={{ base: "full", xl: "max(640px,80%)" }}
              mx="auto"
              bg="bg.code.block"
              rounded="2xl"
              shadow="sm"
              height="full"
              position="relative"
            >
              <CodeArea slug="website/snippet" />
            </Box>
          </Center>
        </Flex>
      </Section>

      <Section my={{ base: "20", md: "32" }}>
        <Box mb="10">
          <styled.h2 maxW={{ md: "24ch" }} textStyle="display.xl">
            Work in your favorite JS framework
          </styled.h2>
          <styled.p textStyle="text.lg" maxW="560px" mt="6">
            Finite state machines for building accessible design systems and UI
            components. Works with React, Vue and Solid.
          </styled.p>
        </Box>

        <MultiframeworkTabs />
      </Section>

      <Section my="10">
        <Box maxW="72ch" mx="auto">
          <styled.h2 textStyle="display.xl" mb="10">
            The better way to model component logic
          </styled.h2>
          <styled.div fontSize="md" className="x">
            Today, design systems are becoming a very popular toolkit for
            companies to create a cohesive and accessible user experience for
            their customers.
            <br /> <br />
            With the rise of component-driven development, there's an endless
            re-implementation of common widgets (tabs, menu, etc.) in multiple
            frameworks. These implementations tend to grow in complexity over
            time and often become hard to understand, debug, improve, or test.
            <Blockquote>
              We need a better way to model component logic.
            </Blockquote>
            <styled.mark color="currentColor">
              Zag is a new approach
            </styled.mark>{" "}
            to the component design process, designed to help you avoid
            re-inventing the wheel and build better UI components regardless of
            framework. Heavily inspired by XState, but built to make it easier
            to maintain, test, and enhance.
            <br /> <br />
            With Zag, we're abstracting the complex logic for many components
            into a cohesive, framework-agnostic system — giving you complete
            control over styling and providing a thin adapter for your favorite
            framework.
            <br /> <br />
            <styled.mark color="currentColor">
              Welcome to the future of building interactive components!
            </styled.mark>
          </styled.div>

          <HStack mt="10" gap="4">
            <Circle overflow="hidden" bg="bg.bold">
              <Image
                src="/segun-adebayo-headshot.png"
                width="64"
                height="64"
                alt="Segun Adebayo"
              />
            </Circle>
            <Stack gap="1">
              <styled.h3 fontSize="lg" fontWeight="semibold">
                Segun Adebayo
              </styled.h3>
              <styled.p fontSize="md" textStyle="text.sm">
                Creator of Zag.js
              </styled.p>
            </Stack>
          </HStack>
        </Box>
      </Section>

      <Section
        bg={{ base: "bg.tertiary.bold", md: "unset" }}
        my={{ base: "20", md: "32" }}
      >
        <Box
          bg="bg.tertiary.bold"
          px={{ md: "20" }}
          py={{ base: "10", md: "20" }}
        >
          <styled.h2 textStyle="display.xl" mb="8" maxW="24ch">
            Build your design system with state machines today
          </styled.h2>

          <Stack direction={{ base: "column", sm: "row" }} gap="5">
            <ButtonLink
              href="/overview/introduction"
              variant="black"
              width={{ base: "full", md: "auto" }}
            >
              Get Started
            </ButtonLink>

            <Button hidden width={{ base: "full", md: "auto" }}>
              <HStack gap="2">
                <Icon as={PlayIcon} />
                <span>Watch Demo</span>
              </HStack>
            </Button>
          </Stack>
        </Box>
      </Section>

      <Footer />
    </Box>
  )
}
