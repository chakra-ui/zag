<script lang="ts">
  interface Props {
    title: string
    value: any
  }

  const { title, value }: Props = $props()
</script>

<div class="output">
  <p>{title}</p>
  <pre data-testid="output">{JSON.stringify(value, null, 2)}</pre>
</div>
