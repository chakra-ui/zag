export function Print(props: { title: string; value: any }) {
  const { value, title } = props
  return (
    <div className="output">
      <p>{title}</p>
      <pre data-testid="output">{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}
