<script lang="ts">
  import { normalizeProps, useActor } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"

  interface Props {
    actor: toast.Service
  }

  const { actor }: Props = $props()

  const [snapshot, send] = useActor(actor)
  const api = $derived(toast.connect(snapshot, send, normalizeProps))

  const progressbarProps = $derived(
    normalizeProps.element({
      "data-scope": "toast",
      "data-part": "progressbar",
      "data-type": snapshot.context.type,
      style: {
        opacity: api.isVisible ? 1 : 0,
        transformOrigin: api.isRtl ? "right" : "left",
        animationName: api.type === "loading" ? "none" : undefined,
        animationPlayState: api.isPaused ? "paused" : "running",
        animationDuration: "var(--duration)",
      },
    }),
  )
</script>

<pre {...api.rootProps}>
    <div {...progressbarProps}></div>
    <p {...api.titleProps}>{api.title}</p>
    <p {...api.descriptionProps}>{api.description}</p>
    <button {...api.closeTriggerProps}>Close</button>
</pre>
