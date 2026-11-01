import { For } from "solid-js"

// Shows the machine props an example passes, so the demo explains itself
export function ExampleProps(props: { value: Record<string, unknown> }) {
  return (
    <dl class="example-props">
      <For each={Object.entries(props.value)}>
        {([key, value]) => (
          <div>
            <dt>{key}</dt>
            <dd>{typeof value === "function" ? "ƒ" : JSON.stringify(value)}</dd>
          </div>
        )}
      </For>
    </dl>
  )
}
