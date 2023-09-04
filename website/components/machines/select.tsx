import * as select from "@zag-js/select"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { chakra } from "@chakra-ui/system"
import { Button } from "components/button"
import { useId } from "react"
import { MdCheck } from "react-icons/md"

const data = [
  { label: "Nigeria", value: "NG" },
  { label: "Japan", value: "JP" },
  { label: "Korea", value: "KO" },
  { label: "Kenya", value: "KE" },
  { label: "United Kingdom", value: "UK" },
]

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)

type SelectProps = {
  controls: {}
}

export function Select(props: SelectProps) {
  const [state, send] = useMachine(
    select.machine({
      id: useId(),
      collection: select.collection({
        items: data,
      }),
    }),
    {
      context: props.controls,
    },
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <div>
      <chakra.div display="flex" flexDir="column" gap="1">
        <chakra.label
          fontSize="lg"
          _disabled={{
            opacity: 0.6,
          }}
          {...api.labelProps}
        >
          Label
        </chakra.label>
        <Button
          minW="200px"
          size="sm"
          className="focus-outline"
          bg="bg-subtle"
          _disabled={{
            opacity: 0.6,
          }}
          {...api.triggerProps}
        >
          <chakra.span p="1" flex="1">
            {api.valueAsString || "Select option"}
          </chakra.span>
          <CaretIcon />
        </Button>
      </chakra.div>
      <Portal>
        <div {...api.positionerProps}>
          <chakra.ul
            bg="bg-subtle"
            width="240px"
            maxHeight="min(var(--available-height), 400px)"
            padding="2"
            isolation="isolate"
            listStyleType="none"
            shadow="base"
            className="focus-outline"
            {...api.contentProps}
          >
            {data.map((item) => (
              <chakra.li
                px="2"
                py="1"
                display="flex"
                alignItems="center"
                cursor="pointer"
                _highlighted={{ bg: "bg-primary-subtle", color: "white" }}
                key={item.value}
                {...api.getItemProps({ item })}
              >
                <chakra.span flex={1}>{item.label}</chakra.span>
                <span {...api.getItemIndicatorProps({ item })}>
                  <MdCheck />
                </span>
              </chakra.li>
            ))}
          </chakra.ul>
        </div>
      </Portal>
    </div>
  )
}
