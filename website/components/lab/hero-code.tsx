"use client"

import * as listbox from "@zag-js/listbox"
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as zagSwitch from "@zag-js/switch"
import * as tabs from "@zag-js/tabs"
import { adapters, type AdapterId } from "components/lab/d-adapters"
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react"
import { Box, HStack, styled } from "styled-system/jsx"

const accent = { base: "#2f855a", _dark: "#48bb78" }

type CompId = "number-input" | "switch" | "slider"

type Comp = {
  id: CompId
  ns: string
  fn: string
  label: string
  uncontrolled: string
  name: string
  setter: string
  init: string
  cb: string
  markup: string[]
}

const comps: Comp[] = [
  {
    id: "number-input",
    ns: "numberInput",
    fn: "NumberInput",
    label: "Number input",
    uncontrolled: 'defaultValue: "4",',
    name: "value",
    setter: "setValue",
    init: '"4"',
    cb: "onValueChange",
    markup: [
      "<div @root>",
      "  <button @decrementTrigger>-</button>",
      "  <input @input />",
      "  <button @incrementTrigger>+</button>",
      "</div>",
    ],
  },
  {
    id: "switch",
    ns: "zagSwitch",
    fn: "Switch",
    label: "Switch",
    uncontrolled: "defaultChecked: true,",
    name: "checked",
    setter: "setChecked",
    init: "true",
    cb: "onCheckedChange",
    markup: [
      "<label @root>",
      "  <input @hiddenInput />",
      "  <span @control>",
      "    <span @thumb />",
      "  </span>",
      "  <span @label>Wi-Fi</span>",
      "</label>",
    ],
  },
  {
    id: "slider",
    ns: "slider",
    fn: "Slider",
    label: "Slider",
    uncontrolled: "defaultValue: [40],",
    name: "value",
    setter: "setValue",
    init: "[40]",
    cb: "onValueChange",
    markup: [
      "<div @root>",
      "  <div @control>",
      "    <div @track>",
      "      <div @range />",
      "    </div>",
      "    <div @thumb({ index: 0 }) />",
      "  </div>",
      "</div>",
    ],
  },
]

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

function bind(fw: AdapterId, part: string, args: string) {
  const expr = `get${cap(part)}Props(${args})`
  if (fw === "vue") return `v-bind="api.${expr}"`
  if (fw === "solid") return `{...api().${expr}}`
  return `{...api.${expr}}`
}

function markup(fw: AdapterId, comp: Comp, indent: number) {
  const pad = " ".repeat(indent)
  return comp.markup.map(
    (line) =>
      pad +
      line.replace(/@(\w+)(?:\(([^)]*)\))?/g, (_, part, args) =>
        bind(fw, part, args ?? ""),
      ),
  )
}

function generate(fw: AdapterId, comp: Comp, controlled: boolean) {
  const { ns, id, fn, name, setter, init, cb } = comp
  const head = [
    `import * as ${ns} from "@zag-js/${id}"`,
    `import { useMachine, normalizeProps } from "@zag-js/${fw}"`,
  ]
  if (fw === "react" || fw === "preact") {
    const from = fw === "react" ? "react" : "preact/hooks"
    return [
      ...head,
      `import { useId${controlled ? ", useState" : ""} } from "${from}"`,
      "",
      `export function ${fn}() {`,
      ...(controlled
        ? [`  const [${name}, ${setter}] = useState(${init})`]
        : []),
      `  const service = useMachine(${ns}.machine, {`,
      "    id: useId(),",
      ...(controlled
        ? [`    ${name},`, `    ${cb}: (e) => ${setter}(e.${name}),`]
        : [`    ${comp.uncontrolled}`]),
      "  })",
      `  const api = ${ns}.connect(service, normalizeProps)`,
      "  return (",
      ...markup(fw, comp, 4),
      "  )",
      "}",
    ]
  }
  if (fw === "solid") {
    return [
      ...head,
      `import { createMemo, ${controlled ? "createSignal, " : ""}createUniqueId } from "solid-js"`,
      "",
      `export function ${fn}() {`,
      ...(controlled
        ? [`  const [${name}, ${setter}] = createSignal(${init})`]
        : []),
      controlled
        ? `  const service = useMachine(${ns}.machine, () => ({`
        : `  const service = useMachine(${ns}.machine, {`,
      "    id: createUniqueId(),",
      ...(controlled
        ? [`    ${name}: ${name}(),`, `    ${cb}: (e) => ${setter}(e.${name}),`]
        : [`    ${comp.uncontrolled}`]),
      controlled ? "  }))" : "  })",
      `  const api = createMemo(() => ${ns}.connect(service, normalizeProps))`,
      "  return (",
      ...markup(fw, comp, 4),
      "  )",
      "}",
    ]
  }
  if (fw === "vue") {
    return [
      "<script setup>",
      ...head,
      `import { computed, ${controlled ? "ref, " : ""}useId } from "vue"`,
      "",
      ...(controlled ? [`const ${name} = ref(${init})`] : []),
      controlled
        ? `const service = useMachine(${ns}.machine, computed(() => ({`
        : `const service = useMachine(${ns}.machine, {`,
      "  id: useId(),",
      ...(controlled
        ? [
            `  ${name}: ${name}.value,`,
            `  ${cb}: (e) => (${name}.value = e.${name}),`,
          ]
        : [`  ${comp.uncontrolled}`]),
      controlled ? "})))" : "})",
      `const api = computed(() => ${ns}.connect(service, normalizeProps))`,
      "</script>",
      "",
      "<template>",
      ...markup(fw, comp, 2),
      "</template>",
    ]
  }
  return [
    '<script lang="ts">',
    ...head.map((l) => "  " + l),
    "",
    ...(controlled ? [`  let ${name} = $state(${init})`] : []),
    "  const id = $props.id()",
    controlled
      ? `  const service = useMachine(${ns}.machine, () => ({`
      : `  const service = useMachine(${ns}.machine, {`,
    "    id,",
    ...(controlled
      ? [`    ${name},`, `    ${cb}: (e) => (${name} = e.${name}),`]
      : [`    ${comp.uncontrolled}`]),
    controlled ? "  }))" : "  })",
    `  const api = $derived(${ns}.connect(service, normalizeProps))`,
    "</script>",
    "",
    ...markup(fw, comp, 0),
  ]
}

function fileName(fw: AdapterId, comp: Comp) {
  if (fw === "vue") return `${comp.fn}.vue`
  if (fw === "svelte") return `${comp.fn}.svelte`
  return `${comp.id}.tsx`
}

const keywords = /^(import|from|export|function|const|let|return)$/
const pattern =
  /("[^"]*"|\b(?:import|from|export|function|const|let|return)\b|\b(?:numberInput|zagSwitch|slider)\.(?:machine|connect)\b|<\/?[a-zA-Z]+|\/?>)/g

function Line(props: { text: string }) {
  const parts = props.text.split(pattern)
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null
        if (part.startsWith('"'))
          return (
            <styled.span key={i} color="text.bold">
              {part}
            </styled.span>
          )
        if (/\.(machine|connect)$/.test(part))
          return (
            <styled.span key={i} color={accent}>
              {part}
            </styled.span>
          )
        if (keywords.test(part))
          return (
            <styled.span key={i} color="text.subtle" fontWeight="medium">
              {part}
            </styled.span>
          )
        if (part.startsWith("<") || part.endsWith(">"))
          return (
            <styled.span key={i} color="text.subtle">
              {part}
            </styled.span>
          )
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

const motionCss = `
@keyframes zd-line { from { opacity: 0; transform: translateY(4px); filter: blur(2px) } to { opacity: 1; transform: none; filter: none } }
@keyframes zd-flash { 0% { opacity: 1 } 100% { opacity: .55 } }
@keyframes zd-pop { from { opacity: 0; transform: translateY(6px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes zd-pulse { 0%, 100% { opacity: 1 } 50% { opacity: .3 } }
.zd-line { animation: zd-line 420ms cubic-bezier(.2,.7,.2,1) both; animation-delay: calc(var(--i) * 14ms) }
.zd-mark { animation: zd-flash 1600ms ease-out both }
.zd-pop { animation: zd-pop 360ms cubic-bezier(.2,.7,.2,1) both }
.zd-pulse { animation: zd-pulse 1.6s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) { .zd-line, .zd-mark, .zd-pop, .zd-pulse { animation: none } }
`

function Code(props: { fw: AdapterId; comp: Comp; controlled: boolean }) {
  const { fw, comp, controlled } = props
  const lines = generate(fw, comp, controlled)
  const base = new Set(generate(fw, comp, false))
  const seen = new Map<string, number>()
  return (
    <styled.pre
      fontFamily="mono"
      fontSize={{ base: "11px", md: "12px" }}
      lineHeight="1.7"
      color="text.muted"
      overflowX="auto"
      px="0"
      pt="4"
      pb={{ base: "4", md: "24" }}
      minH={{ base: "auto", md: "520px" }}
    >
      {lines.map((line, i) => {
        const n = seen.get(line) ?? 0
        seen.set(line, n + 1)
        const changed = controlled && !base.has(line)
        return (
          <Box
            key={`${fw}:${comp.id}:${line}:${n}`}
            className="zd-line"
            style={{ "--i": Math.min(i, 24) } as CSSProperties}
            display="flex"
            position="relative"
            px="4"
          >
            {changed && (
              <Box
                className="zd-mark"
                position="absolute"
                inset="0"
                bg={{
                  base: "rgba(47,133,90,0.10)",
                  _dark: "rgba(72,187,120,0.10)",
                }}
                borderLeftWidth="2px"
                borderColor={accent}
                pointerEvents="none"
              />
            )}
            <styled.span
              w="6"
              flexShrink="0"
              color="text.muted"
              opacity="0.45"
              userSelect="none"
              textAlign="right"
              pr="4"
              boxSizing="content-box"
              position="relative"
            >
              {changed ? "+" : i + 1}
            </styled.span>
            <styled.span whiteSpace="pre" position="relative">
              <Line text={line} />
            </styled.span>
          </Box>
        )
      })}
    </styled.pre>
  )
}

function Readout(props: { label: string; value: string }) {
  return (
    <HStack
      mt="4"
      gap="2"
      fontFamily="mono"
      fontSize="11px"
      color="text.muted"
      whiteSpace="nowrap"
    >
      <styled.span>{props.label}</styled.span>
      <styled.span>→</styled.span>
      <styled.span key={props.value} className="zd-pop" color={accent}>
        {props.value}
      </styled.span>
    </HStack>
  )
}

function LiveNumberInput() {
  const [value, setValue] = useState("4")
  const service = useMachine(numberInput.machine, {
    id: useId(),
    defaultValue: "4",
    min: 0,
    max: 10,
    onValueChange: (e) => setValue(e.value),
  })
  const api = numberInput.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()}>
      <styled.label
        {...api.getLabelProps()}
        display="block"
        fontSize="12px"
        color="text.muted"
        mb="2"
      >
        Seats
      </styled.label>
      <HStack
        {...api.getControlProps()}
        gap="0"
        w="fit-content"
        borderWidth="1px"
        borderColor="border.bold"
        borderRadius="md"
        overflow="hidden"
        _focusWithin={{ borderColor: accent }}
      >
        <styled.button
          {...api.getDecrementTriggerProps()}
          w="9"
          h="9"
          display="grid"
          placeItems="center"
          color="text.muted"
          fontFamily="mono"
          fontSize="16px"
          _hover={{ color: "text.bold", bg: "bg.muted" }}
          _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
        >
          −
        </styled.button>
        <styled.input
          {...api.getInputProps()}
          w="14"
          h="9"
          textAlign="center"
          bg="transparent"
          color="text.bold"
          fontFamily="mono"
          fontSize="14px"
          fontVariantNumeric="tabular-nums"
          borderXWidth="1px"
          borderColor="border"
          outline="none"
        />
        <styled.button
          {...api.getIncrementTriggerProps()}
          w="9"
          h="9"
          display="grid"
          placeItems="center"
          color="text.muted"
          fontFamily="mono"
          fontSize="16px"
          _hover={{ color: "text.bold", bg: "bg.muted" }}
          _disabled={{ opacity: 0.35, cursor: "not-allowed" }}
        >
          +
        </styled.button>
      </HStack>
      <Readout label="onValueChange" value={`"${value}"`} />
    </Box>
  )
}

function LiveSwitch() {
  const [checked, setChecked] = useState(true)
  const service = useMachine(zagSwitch.machine, {
    id: useId(),
    defaultChecked: true,
    onCheckedChange: (e) => setChecked(e.checked),
  })
  const api = zagSwitch.connect(service, normalizeProps)
  return (
    <Box>
      <styled.label
        {...api.getRootProps()}
        display="inline-flex"
        alignItems="center"
        gap="3"
        cursor="pointer"
      >
        <input {...api.getHiddenInputProps()} />
        <styled.span
          {...api.getControlProps()}
          display="inline-flex"
          alignItems="center"
          w="10"
          h="6"
          p="0.5"
          borderRadius="full"
          bg="border.bold"
          transition="background 160ms"
          _checked={{ bg: accent }}
          _focusVisible={{
            outline: "2px solid",
            outlineColor: accent,
            outlineOffset: "2px",
          }}
        >
          <styled.span
            {...api.getThumbProps()}
            w="5"
            h="5"
            borderRadius="full"
            bg="white"
            boxShadow="0 1px 2px rgba(0,0,0,0.3)"
            transition="transform 180ms cubic-bezier(.2,.7,.2,1)"
            _checked={{ transform: "translateX(16px)" }}
          />
        </styled.span>
        <styled.span {...api.getLabelProps()} fontSize="14px" color="text.bold">
          Wi-Fi
        </styled.span>
      </styled.label>
      <Readout label="onCheckedChange" value={String(checked)} />
    </Box>
  )
}

function LiveSlider() {
  const [value, setValue] = useState([40])
  const service = useMachine(slider.machine, {
    id: useId(),
    defaultValue: [40],
    onValueChange: (e) => setValue(e.value),
  })
  const api = slider.connect(service, normalizeProps)
  return (
    <Box {...api.getRootProps()} w="200px">
      <HStack justify="space-between" mb="2">
        <styled.label
          {...api.getLabelProps()}
          fontSize="12px"
          color="text.muted"
        >
          Volume
        </styled.label>
        <styled.output
          {...api.getValueTextProps()}
          fontFamily="mono"
          fontSize="12px"
          color="text.bold"
          fontVariantNumeric="tabular-nums"
        >
          {api.value[0]}
        </styled.output>
      </HStack>
      <Box {...api.getControlProps()} display="flex" alignItems="center" h="5">
        <Box
          {...api.getTrackProps()}
          flex="1"
          h="1"
          borderRadius="full"
          bg="border.bold"
        >
          <Box
            {...api.getRangeProps()}
            h="full"
            borderRadius="full"
            bg={accent}
          />
        </Box>
        <Box
          {...api.getThumbProps({ index: 0 })}
          w="4"
          h="4"
          borderRadius="full"
          bg="bg"
          borderWidth="2px"
          borderColor={accent}
          outline="none"
          _focusVisible={{ boxShadow: "0 0 0 3px rgba(72,187,120,0.35)" }}
        >
          <input {...api.getHiddenInputProps({ index: 0 })} />
        </Box>
      </Box>
      <Readout label="onValueChange" value={`[${value[0]}]`} />
    </Box>
  )
}

function Live(props: { comp: CompId }) {
  if (props.comp === "switch") return <LiveSwitch />
  if (props.comp === "slider") return <LiveSlider />
  return <LiveNumberInput />
}

function Picker(props: { value: AdapterId; onChange: (v: AdapterId) => void }) {
  const [search, setSearch] = useState("")
  const collection = useMemo(
    () =>
      listbox.collection({
        items: adapters.filter((a) =>
          a.label.toLowerCase().includes(search.trim().toLowerCase()),
        ),
        itemToValue: (a) => a.id,
        itemToString: (a) => a.label,
      }),
    [search],
  )
  const service = useMachine(listbox.machine, {
    id: useId(),
    collection,
    value: [props.value],
    typeahead: false,
    scrollToIndexFn: () => {},
    onValueChange: (e) => {
      const next = e.value[0] as AdapterId | undefined
      if (next) props.onChange(next)
    },
  })
  const api = listbox.connect(service, normalizeProps)
  return (
    <Box
      {...api.getRootProps()}
      w={{ base: "full", md: "236px" }}
      bg="bg"
      borderWidth="1px"
      borderColor="border.bold"
      borderRadius="lg"
      boxShadow="0 24px 48px -20px rgba(0,0,0,0.45)"
      overflow="hidden"
    >
      <HStack
        gap="2"
        px="3"
        h="10"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <styled.svg
          viewBox="0 0 16 16"
          w="3.5"
          h="3.5"
          color="text.muted"
          flexShrink="0"
          aria-hidden
        >
          <circle
            cx="7"
            cy="7"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M10.5 10.5 L14 14"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </styled.svg>
        <styled.input
          {...api.getInputProps({ autoHighlight: true })}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search adapters…"
          aria-label="Search adapters"
          flex="1"
          minW="0"
          bg="transparent"
          outline="none"
          fontSize="13px"
          color="text.bold"
          _placeholder={{ color: "text.muted" }}
        />
      </HStack>
      <styled.ul
        {...api.getContentProps()}
        aria-label="Adapter"
        p="1"
        outline="none"
      >
        {collection.items.map((item) => (
          <styled.li
            key={item.id}
            {...api.getItemProps({ item })}
            display="flex"
            alignItems="center"
            gap="2.5"
            px="2.5"
            h="9"
            borderRadius="md"
            fontSize="13px"
            color="text.muted"
            cursor="pointer"
            transition="background 160ms, color 160ms"
            _highlighted={{ bg: "bg.muted", color: "text.bold" }}
            _selected={{ color: "text.bold" }}
          >
            <Box
              w="4"
              h="4"
              filter="grayscale(1)"
              css={{ "& svg": { w: "full", h: "full" } }}
            >
              <item.icon />
            </Box>
            <styled.span {...api.getItemTextProps({ item })} flex="1">
              {item.label}
            </styled.span>
            <styled.span
              fontFamily="mono"
              fontSize="10.5px"
              color="text.muted"
              opacity="0.7"
            >
              {item.flavor}
            </styled.span>
            <styled.span
              {...api.getItemIndicatorProps({ item })}
              color={accent}
              fontSize="12px"
              w="3"
            >
              ✓
            </styled.span>
          </styled.li>
        ))}
        {collection.items.length === 0 && (
          <styled.li
            px="2.5"
            py="3"
            fontSize="12px"
            color="text.muted"
            fontFamily="mono"
          >
            no adapter matches
          </styled.li>
        )}
      </styled.ul>
    </Box>
  )
}

function ModeSwitch(props: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  const service = useMachine(zagSwitch.machine, {
    id: useId(),
    checked: props.checked,
    onCheckedChange: (e) => props.onChange(e.checked),
  })
  const api = zagSwitch.connect(service, normalizeProps)
  return (
    <styled.label
      {...api.getRootProps()}
      display="inline-flex"
      alignItems="center"
      gap="2.5"
      cursor="pointer"
    >
      <input {...api.getHiddenInputProps()} />
      <styled.span
        {...api.getControlProps()}
        display="inline-flex"
        alignItems="center"
        w="7"
        h="4"
        p="0.5"
        borderRadius="full"
        bg="border.bold"
        transition="background 160ms"
        _checked={{ bg: accent }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: accent,
          outlineOffset: "2px",
        }}
      >
        <styled.span
          {...api.getThumbProps()}
          w="3"
          h="3"
          borderRadius="full"
          bg="white"
          transition="transform 180ms cubic-bezier(.2,.7,.2,1)"
          _checked={{ transform: "translateX(12px)" }}
        />
      </styled.span>
      <styled.span {...api.getLabelProps()} fontSize="12.5px" color="text.bold">
        Controlled
      </styled.span>
    </styled.label>
  )
}

const schedule = ["fw", "fw", "ctl", "fw", "ctl", "fw", "comp"] as const

export function HeroCode() {
  const [fw, setFw] = useState<AdapterId>("react")
  const [comp, setComp] = useState<CompId>("number-input")
  const [controlled, setControlled] = useState(false)
  const [paused, setPaused] = useState(false)
  const [touched, setTouched] = useState(false)
  const [visible, setVisible] = useState(true)
  const [reduced, setReduced] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const step = useRef(0)

  const service = useMachine(tabs.machine, {
    id: useId(),
    value: comp,
    onValueChange: (e) => setComp(e.value as CompId),
  })
  const api = tabs.connect(service, normalizeProps)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    const el = rootRef.current
    if (!el) return () => mq.removeEventListener("change", onChange)
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    )
    io.observe(el)
    return () => {
      mq.removeEventListener("change", onChange)
      io.disconnect()
    }
  }, [])

  const playing = !paused && !touched && visible && !reduced

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      if (document.hidden) return
      const action = schedule[step.current % schedule.length]
      step.current += 1
      if (action === "ctl") setControlled((c) => !c)
      if (action === "fw")
        setFw(
          (cur) =>
            adapters[
              (adapters.findIndex((a) => a.id === cur) + 1) % adapters.length
            ].id,
        )
      if (action === "comp")
        setComp(
          (cur) =>
            comps[(comps.findIndex((c) => c.id === cur) + 1) % comps.length].id,
        )
    }, 2400)
    return () => clearInterval(timer)
  }, [playing])

  const current = comps.find((c) => c.id === comp) ?? comps[0]
  const touch = () => setTouched(true)

  return (
    <Box
      ref={rootRef}
      position="relative"
      pb={{ base: "0", md: "16" }}
      pl={{ base: "0", md: "10" }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={touch}
      onKeyDown={touch}
    >
      <style>{motionCss}</style>
      <Box
        {...api.getRootProps()}
        borderWidth="1px"
        borderColor="border"
        borderRadius="xl"
        bg="bg.muted"
        overflow="hidden"
      >
        <HStack
          justify="space-between"
          borderBottomWidth="1px"
          borderColor="border"
          pr="4"
        >
          <HStack {...api.getListProps()} gap="0" px="2">
            {comps.map((c) => (
              <styled.button
                key={c.id}
                {...api.getTriggerProps({ value: c.id })}
                px="3"
                py="3"
                fontSize="13px"
                color="text.muted"
                borderBottomWidth="1px"
                borderColor="transparent"
                mb="-1px"
                transition="color 150ms, border-color 150ms"
                _hover={{ color: "text.bold" }}
                _selected={{ color: "text.bold", borderColor: "text.bold" }}
                focusVisibleRing="inside"
              >
                {c.label}
              </styled.button>
            ))}
          </HStack>
          <styled.span
            key={fileName(fw, current)}
            className="zd-pop"
            fontFamily="mono"
            fontSize="11px"
            color="text.muted"
            display={{ base: "none", sm: "inline" }}
          >
            {fileName(fw, current)}
          </styled.span>
        </HStack>
        <Box bg="bg">
          {comps.map((c) => (
            <Box
              key={c.id}
              {...api.getContentProps({ value: c.id })}
              outline="none"
            >
              {c.id === comp && (
                <Code fw={fw} comp={c} controlled={controlled} />
              )}
            </Box>
          ))}
        </Box>
        <HStack
          justify="space-between"
          gap="4"
          px="4"
          h="11"
          borderTopWidth="1px"
          borderColor="border"
          pl={{ base: "4", md: "64" }}
        >
          <ModeSwitch checked={controlled} onChange={setControlled} />
          <HStack
            gap="2"
            fontFamily="mono"
            fontSize="10.5px"
            letterSpacing="0.1em"
            textTransform="uppercase"
            color="text.muted"
          >
            <Box
              w="1.5"
              h="1.5"
              borderRadius="full"
              bg={playing ? accent : "border.bold"}
              className={playing ? "zd-pulse" : undefined}
            />
            {touched || reduced
              ? "yours to drive"
              : playing
                ? "autoplay"
                : "paused"}
          </HStack>
        </HStack>
      </Box>

      <Box
        position={{ base: "relative", md: "absolute" }}
        top={{ md: "80px" }}
        right={{ md: "-6" }}
        mt={{ base: "4", md: "0" }}
        zIndex="1"
      >
        <Picker value={fw} onChange={setFw} />
      </Box>

      <Box
        position={{ base: "relative", md: "absolute" }}
        left="0"
        bottom="0"
        mt={{ base: "4", md: "0" }}
        w={{ base: "full", md: "auto" }}
        minW={{ md: "232px" }}
        bg="bg"
        borderWidth="1px"
        borderColor="border.bold"
        borderRadius="lg"
        p="5"
        boxShadow="0 24px 48px -20px rgba(0,0,0,0.45)"
        zIndex="1"
      >
        <styled.p
          fontFamily="mono"
          fontSize="10.5px"
          letterSpacing="0.1em"
          textTransform="uppercase"
          color="text.muted"
          mb="4"
        >
          live · {current.label.toLowerCase()}
        </styled.p>
        <Box key={comp} className="zd-pop">
          <Live comp={comp} />
        </Box>
      </Box>
    </Box>
  )
}
