interface StateVisualizerProps {
  label: string
  omit?: string[]
  context?: string[]
}

export function StateVisualizer({ label, omit, context }: StateVisualizerProps) {
  return (
    <div class="viz">
      <pre dir="ltr">
        <details open>
          <summary>{label} Visualizer</summary>
          <div x-html={`$highlightState(${JSON.stringify({ label, omit, context })})`} />
        </details>
      </pre>
    </div>
  )
}
