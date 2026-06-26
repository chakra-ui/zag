export interface StateVisualizerProps {
  label: string
  modifier?: string
  omit?: string[]
  context?: string[]
}

export function StateVisualizer({ label, modifier = "", omit, context }: StateVisualizerProps) {
  return (
    <div class="viz">
      <pre dir="ltr">
        <details open>
          <summary>
            {label} {modifier} Visualizer
          </summary>
          <div x-html={`$highlightState(${JSON.stringify({ label, modifier, omit, context })})`} />
        </details>
      </pre>
    </div>
  )
}
