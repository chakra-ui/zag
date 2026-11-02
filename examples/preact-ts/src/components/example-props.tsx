// Shows the machine props an example passes, so the demo explains itself
export function ExampleProps(props: { value: Record<string, unknown> }) {
  return (
    <dl className="example-props">
      {Object.entries(props.value).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{typeof value === "function" ? "ƒ" : JSON.stringify(value)}</dd>
        </div>
      ))}
    </dl>
  )
}
